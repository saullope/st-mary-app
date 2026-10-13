-- Enlaza insignias y misiones con llaves foráneas reales.
--   * LUDI_LOGRO_PARTICIPANTE (codigo de texto) -> LUDI_PARTICIPANTE_INSIGNIA / LUDI_PARTICIPANTE_MISION
--   * ajustes_json.badges / .missions          -> LUDI_ACTIVIDAD_INSIGNIA / LUDI_ACTIVIDAD_MISION
-- Requiere el catálogo sembrado (prisma/seeds/runAchievementCatalog.ts).
-- Todo corre en una transacción: si algún código no existe en el catálogo, se
-- revierte sin cambiar nada y el error dice cuántos son.
--
-- npx prisma db execute --file prisma/sql/2026-10-12_achievement_links.sql --schema prisma/schema.prisma

SET XACT_ABORT ON;

BEGIN TRY
BEGIN TRAN;

IF OBJECT_ID('dbo.LUDI_PARTICIPANTE_INSIGNIA') IS NOT NULL
    THROW 50001, 'La migración ya se aplicó (LUDI_PARTICIPANTE_INSIGNIA existe).', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.LUDI_INSIGNIA) OR NOT EXISTS (SELECT 1 FROM dbo.LUDI_MISION)
    THROW 50002, 'El catálogo está vacío: corre primero prisma/seeds/runAchievementCatalog.ts.', 1;

-- Validación previa: ningún dato puede quedar sin su fila del catálogo.
DECLARE @orphans INT;

SELECT @orphans = COUNT(*)
FROM dbo.LUDI_LOGRO_PARTICIPANTE l
WHERE NOT (
    (l.tipo = 'INSIGNIA' AND EXISTS (SELECT 1 FROM dbo.LUDI_INSIGNIA i WHERE i.codigo = l.codigo))
    OR (l.tipo = 'MISION' AND EXISTS (SELECT 1 FROM dbo.LUDI_MISION m WHERE m.codigo = l.codigo))
);
IF @orphans > 0
BEGIN
    DECLARE @msgLogros NVARCHAR(200) = CONCAT(@orphans, ' logros otorgados tienen un código que no está en el catálogo.');
    THROW 50003, @msgLogros, 1;
END;

SELECT @orphans = COUNT(*)
FROM dbo.LUDI_ACTIVIDAD_CONFIG c
CROSS APPLY OPENJSON(c.ajustes_json, '$.badges') j
WHERE ISJSON(c.ajustes_json) = 1
  AND NOT EXISTS (SELECT 1 FROM dbo.LUDI_INSIGNIA i WHERE i.codigo = j.value);
IF @orphans > 0
BEGIN
    DECLARE @msgBadges NVARCHAR(200) = CONCAT(@orphans, ' insignias elegidas en actividades no están en el catálogo.');
    THROW 50004, @msgBadges, 1;
END;

SELECT @orphans = COUNT(*)
FROM dbo.LUDI_ACTIVIDAD_CONFIG c
CROSS APPLY OPENJSON(c.ajustes_json, '$.missions') j
WHERE ISJSON(c.ajustes_json) = 1
  AND NOT EXISTS (SELECT 1 FROM dbo.LUDI_MISION m WHERE m.codigo = j.value);
IF @orphans > 0
BEGIN
    DECLARE @msgMissions NVARCHAR(200) = CONCAT(@orphans, ' misiones elegidas en actividades no están en el catálogo.');
    THROW 50005, @msgMissions, 1;
END;

-- Tablas nuevas (mismos nombres de restricciones que genera Prisma).
CREATE TABLE [dbo].[LUDI_ACTIVIDAD_INSIGNIA] (
    [activity_id] INT NOT NULL,
    [insignia_id] INT NOT NULL,
    CONSTRAINT [LUDI_ACTIVIDAD_INSIGNIA_pkey] PRIMARY KEY CLUSTERED ([activity_id],[insignia_id])
);

CREATE TABLE [dbo].[LUDI_ACTIVIDAD_MISION] (
    [activity_id] INT NOT NULL,
    [mision_id] INT NOT NULL,
    CONSTRAINT [LUDI_ACTIVIDAD_MISION_pkey] PRIMARY KEY CLUSTERED ([activity_id],[mision_id])
);

CREATE TABLE [dbo].[LUDI_PARTICIPANTE_INSIGNIA] (
    [participante_id] BIGINT NOT NULL,
    [insignia_id] INT NOT NULL,
    [otorgado_en] DATETIME2 NOT NULL CONSTRAINT [LUDI_PARTICIPANTE_INSIGNIA_otorgado_en_df] DEFAULT sysdatetime(),
    CONSTRAINT [LUDI_PARTICIPANTE_INSIGNIA_pkey] PRIMARY KEY CLUSTERED ([participante_id],[insignia_id])
);

CREATE TABLE [dbo].[LUDI_PARTICIPANTE_MISION] (
    [participante_id] BIGINT NOT NULL,
    [mision_id] INT NOT NULL,
    [otorgado_en] DATETIME2 NOT NULL CONSTRAINT [LUDI_PARTICIPANTE_MISION_otorgado_en_df] DEFAULT sysdatetime(),
    CONSTRAINT [LUDI_PARTICIPANTE_MISION_pkey] PRIMARY KEY CLUSTERED ([participante_id],[mision_id])
);

ALTER TABLE [dbo].[LUDI_ACTIVIDAD_INSIGNIA] ADD CONSTRAINT [LUDI_ACTIVIDAD_INSIGNIA_activity_id_fkey] FOREIGN KEY ([activity_id]) REFERENCES [dbo].[LUDI_ACTIVIDAD]([activity_id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_ACTIVIDAD_INSIGNIA] ADD CONSTRAINT [LUDI_ACTIVIDAD_INSIGNIA_insignia_id_fkey] FOREIGN KEY ([insignia_id]) REFERENCES [dbo].[LUDI_INSIGNIA]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_ACTIVIDAD_MISION] ADD CONSTRAINT [LUDI_ACTIVIDAD_MISION_activity_id_fkey] FOREIGN KEY ([activity_id]) REFERENCES [dbo].[LUDI_ACTIVIDAD]([activity_id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_ACTIVIDAD_MISION] ADD CONSTRAINT [LUDI_ACTIVIDAD_MISION_mision_id_fkey] FOREIGN KEY ([mision_id]) REFERENCES [dbo].[LUDI_MISION]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_PARTICIPANTE_INSIGNIA] ADD CONSTRAINT [LUDI_PARTICIPANTE_INSIGNIA_participante_id_fkey] FOREIGN KEY ([participante_id]) REFERENCES [dbo].[LUDI_SESION_PARTICIPANTE]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_PARTICIPANTE_INSIGNIA] ADD CONSTRAINT [LUDI_PARTICIPANTE_INSIGNIA_insignia_id_fkey] FOREIGN KEY ([insignia_id]) REFERENCES [dbo].[LUDI_INSIGNIA]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_PARTICIPANTE_MISION] ADD CONSTRAINT [LUDI_PARTICIPANTE_MISION_participante_id_fkey] FOREIGN KEY ([participante_id]) REFERENCES [dbo].[LUDI_SESION_PARTICIPANTE]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_PARTICIPANTE_MISION] ADD CONSTRAINT [LUDI_PARTICIPANTE_MISION_mision_id_fkey] FOREIGN KEY ([mision_id]) REFERENCES [dbo].[LUDI_MISION]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Copia de los logros otorgados, conservando la fecha original.
INSERT INTO dbo.LUDI_PARTICIPANTE_INSIGNIA (participante_id, insignia_id, otorgado_en)
SELECT l.participante_id, i.id, MIN(l.otorgado_en)
FROM dbo.LUDI_LOGRO_PARTICIPANTE l
JOIN dbo.LUDI_INSIGNIA i ON i.codigo = l.codigo
WHERE l.tipo = 'INSIGNIA'
GROUP BY l.participante_id, i.id;

INSERT INTO dbo.LUDI_PARTICIPANTE_MISION (participante_id, mision_id, otorgado_en)
SELECT l.participante_id, m.id, MIN(l.otorgado_en)
FROM dbo.LUDI_LOGRO_PARTICIPANTE l
JOIN dbo.LUDI_MISION m ON m.codigo = l.codigo
WHERE l.tipo = 'MISION'
GROUP BY l.participante_id, m.id;

IF (SELECT COUNT(*) FROM dbo.LUDI_PARTICIPANTE_INSIGNIA) + (SELECT COUNT(*) FROM dbo.LUDI_PARTICIPANTE_MISION)
   <> (SELECT COUNT(*) FROM dbo.LUDI_LOGRO_PARTICIPANTE)
    THROW 50006, 'El número de logros copiados no coincide con el original.', 1;

-- Copia de lo elegido en cada actividad.
INSERT INTO dbo.LUDI_ACTIVIDAD_INSIGNIA (activity_id, insignia_id)
SELECT DISTINCT c.activity_id, i.id
FROM dbo.LUDI_ACTIVIDAD_CONFIG c
CROSS APPLY OPENJSON(c.ajustes_json, '$.badges') j
JOIN dbo.LUDI_INSIGNIA i ON i.codigo = j.value
WHERE ISJSON(c.ajustes_json) = 1;

INSERT INTO dbo.LUDI_ACTIVIDAD_MISION (activity_id, mision_id)
SELECT DISTINCT c.activity_id, m.id
FROM dbo.LUDI_ACTIVIDAD_CONFIG c
CROSS APPLY OPENJSON(c.ajustes_json, '$.missions') j
JOIN dbo.LUDI_MISION m ON m.codigo = j.value
WHERE ISJSON(c.ajustes_json) = 1;

-- El JSON deja de ser fuente de la selección (en modo lax, NULL borra la clave).
UPDATE dbo.LUDI_ACTIVIDAD_CONFIG
SET ajustes_json = JSON_MODIFY(JSON_MODIFY(ajustes_json, '$.badges', NULL), '$.missions', NULL)
WHERE ISJSON(ajustes_json) = 1;

DROP TABLE dbo.LUDI_LOGRO_PARTICIPANTE;

COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH
