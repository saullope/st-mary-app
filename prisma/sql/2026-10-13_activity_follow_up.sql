-- Seguimiento de actividades (evaluación del docente y origen de las copias de plantilla).
-- Solo agrega columnas; no borra ni cambia datos existentes salvo el relleno de
-- plantilla_origen_id en copias ya hechas.
--   * LUDI_SESION.objective_level: 0 = No, 1 = Parcialmente, 2 = Sí. Reemplaza a objective_met.
--   * LUDI_ACTIVIDAD.plantilla_origen_id: plantilla de la que se copió la actividad.
--
-- npx prisma db execute --file prisma/sql/2026-10-13_activity_follow_up.sql --schema prisma/schema.prisma

SET XACT_ABORT ON;

BEGIN TRY
BEGIN TRAN;

IF COL_LENGTH('dbo.LUDI_SESION', 'objective_level') IS NOT NULL
    THROW 50101, 'La migración ya se aplicó (LUDI_SESION.objective_level existe).', 1;

ALTER TABLE [dbo].[LUDI_ACTIVIDAD] ADD [plantilla_origen_id] INT;
ALTER TABLE [dbo].[LUDI_SESION] ADD [objective_level] TINYINT;

-- Las columnas recién creadas solo se pueden usar desde SQL dinámico dentro del mismo lote.
EXEC sp_executesql N'
ALTER TABLE [dbo].[LUDI_ACTIVIDAD] ADD CONSTRAINT [LUDI_ACTIVIDAD_plantilla_origen_id_fkey]
    FOREIGN KEY ([plantilla_origen_id]) REFERENCES [dbo].[LUDI_ACTIVIDAD]([activity_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_SESION] ADD CONSTRAINT [CK_LUDI_SESION_objective_level]
    CHECK ([objective_level] IS NULL OR [objective_level] BETWEEN 0 AND 2);';

-- Copias ya hechas: se reconocen por la descripción y el título que pone la clonación
-- ("<plantilla> (Mi Copia)"). Solo se enlazan si hay exactamente una plantilla del
-- mismo tipo con ese título; las ambiguas quedan sin origen.
EXEC sp_executesql N'
UPDATE copia
SET plantilla_origen_id = origen.activity_id
FROM dbo.LUDI_ACTIVIDAD copia
JOIN dbo.ACTIVITY copiaAct ON copiaAct.id = copia.activity_id
CROSS APPLY (
    SELECT p.activity_id
    FROM dbo.LUDI_ACTIVIDAD p
    JOIN dbo.ACTIVITY pAct ON pAct.id = p.activity_id
    WHERE pAct.isTemplate = 1
      AND p.tipo_actividad_id = copia.tipo_actividad_id
      AND pAct.activity_name + N'' (Mi Copia)'' = copiaAct.activity_name
) origen
WHERE copiaAct.activity_desc = N''Clonado desde plantilla''
  AND copia.plantilla_origen_id IS NULL
  AND (
    SELECT COUNT(*)
    FROM dbo.LUDI_ACTIVIDAD p2
    JOIN dbo.ACTIVITY p2Act ON p2Act.id = p2.activity_id
    WHERE p2Act.isTemplate = 1
      AND p2.tipo_actividad_id = copia.tipo_actividad_id
      AND p2Act.activity_name + N'' (Mi Copia)'' = copiaAct.activity_name
  ) = 1;';

COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH
