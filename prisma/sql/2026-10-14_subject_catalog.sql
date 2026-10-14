-- Clases (asignaturas) por grado y las que elige cada educador (selector tras elegir grado
-- y Configuración > Preferencias). Aditivo: tres tablas nuevas, no cambia datos existentes.
-- Después de aplicarla, sembrar el catálogo:
--   npx ts-node --compiler-options {"module":"CommonJS"} prisma/seeds/runSubjectCatalog.ts
--
-- npx prisma db execute --file prisma/sql/2026-10-14_subject_catalog.sql --schema prisma/schema.prisma

SET XACT_ABORT ON;

BEGIN TRY
BEGIN TRAN;

IF OBJECT_ID('dbo.LUDI_MATERIA') IS NOT NULL
    THROW 50001, 'La migración ya se aplicó (LUDI_MATERIA existe).', 1;

-- Mismos nombres de restricciones que genera Prisma.
CREATE TABLE [dbo].[LUDI_MATERIA] (
    [id] INT NOT NULL IDENTITY(1,1),
    [codigo] NVARCHAR(40) NOT NULL,
    [orden] INT NOT NULL CONSTRAINT [LUDI_MATERIA_orden_df] DEFAULT 0,
    [activo] BIT NOT NULL CONSTRAINT [LUDI_MATERIA_activo_df] DEFAULT 1,
    CONSTRAINT [LUDI_MATERIA_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ_LUDI_MATERIA_codigo] UNIQUE NONCLUSTERED ([codigo])
);

CREATE TABLE [dbo].[LUDI_MATERIA_GRADO] (
    [materia_id] INT NOT NULL,
    [grado_id] INT NOT NULL,
    CONSTRAINT [LUDI_MATERIA_GRADO_pkey] PRIMARY KEY CLUSTERED ([materia_id],[grado_id])
);

CREATE TABLE [dbo].[LUDI_USUARIO_MATERIA] (
    [user_id] NVARCHAR(1000) NOT NULL,
    [grado_id] INT NOT NULL,
    [materia_id] INT NOT NULL,
    [creado_en] DATETIME2 NOT NULL CONSTRAINT [LUDI_USUARIO_MATERIA_creado_en_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [LUDI_USUARIO_MATERIA_pkey] PRIMARY KEY CLUSTERED ([user_id],[grado_id],[materia_id])
);

ALTER TABLE [dbo].[LUDI_MATERIA_GRADO] ADD CONSTRAINT [LUDI_MATERIA_GRADO_materia_id_fkey]
    FOREIGN KEY ([materia_id]) REFERENCES [dbo].[LUDI_MATERIA]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_MATERIA_GRADO] ADD CONSTRAINT [LUDI_MATERIA_GRADO_grado_id_fkey]
    FOREIGN KEY ([grado_id]) REFERENCES [dbo].[LUDI_COMMON_GRADE]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [dbo].[LUDI_USUARIO_MATERIA] ADD CONSTRAINT [LUDI_USUARIO_MATERIA_user_id_fkey]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[LUDI_USERS]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_USUARIO_MATERIA] ADD CONSTRAINT [LUDI_USUARIO_MATERIA_grado_id_fkey]
    FOREIGN KEY ([grado_id]) REFERENCES [dbo].[LUDI_COMMON_GRADE]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_USUARIO_MATERIA] ADD CONSTRAINT [LUDI_USUARIO_MATERIA_materia_id_fkey]
    FOREIGN KEY ([materia_id]) REFERENCES [dbo].[LUDI_MATERIA]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;
