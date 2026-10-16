-- Catálogo de plantillas: clase, colección y portada de cada plantilla (src/features/templates).
-- Aditivo: dos tablas nuevas; no cambia datos existentes. Después de aplicarla, un administrador
-- carga el contenido desde Configuración > Administración > Sincronizar plantillas.
--
-- npx prisma db execute --file prisma/sql/2026-10-15_template_catalog.sql --schema prisma/schema.prisma

SET XACT_ABORT ON;

BEGIN TRY
BEGIN TRAN;

IF OBJECT_ID('dbo.LUDI_PLANTILLA') IS NOT NULL
    THROW 50001, 'La migración ya se aplicó (LUDI_PLANTILLA existe).', 1;

-- Mismos nombres de restricciones que genera Prisma.
CREATE TABLE [dbo].[LUDI_PLANTILLA_COLECCION] (
    [id] INT NOT NULL IDENTITY(1,1),
    [codigo] NVARCHAR(80) NOT NULL,
    [grado_id] INT NOT NULL,
    [materia_id] INT NOT NULL,
    [nombre] NVARCHAR(120) NOT NULL,
    [descripcion] NVARCHAR(300) NULL,
    [portada_url] NVARCHAR(600) NULL,
    [portada_credito] NVARCHAR(200) NULL,
    [orden] INT NOT NULL CONSTRAINT [LUDI_PLANTILLA_COLECCION_orden_df] DEFAULT 0,
    [activo] BIT NOT NULL CONSTRAINT [LUDI_PLANTILLA_COLECCION_activo_df] DEFAULT 1,
    CONSTRAINT [LUDI_PLANTILLA_COLECCION_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ_LUDI_PLANTILLA_COLECCION_codigo] UNIQUE NONCLUSTERED ([codigo])
);

CREATE TABLE [dbo].[LUDI_PLANTILLA] (
    [activity_id] INT NOT NULL,
    [codigo] NVARCHAR(80) NOT NULL,
    [materia_id] INT NOT NULL,
    [coleccion_id] INT NULL,
    [orden] INT NOT NULL CONSTRAINT [LUDI_PLANTILLA_orden_df] DEFAULT 0,
    [portada_url] NVARCHAR(600) NULL,
    [portada_credito] NVARCHAR(200) NULL,
    [duracion_min] INT NOT NULL CONSTRAINT [LUDI_PLANTILLA_duracion_min_df] DEFAULT 5,
    [version] NVARCHAR(64) NOT NULL,
    CONSTRAINT [LUDI_PLANTILLA_pkey] PRIMARY KEY CLUSTERED ([activity_id]),
    CONSTRAINT [UQ_LUDI_PLANTILLA_codigo] UNIQUE NONCLUSTERED ([codigo])
);

CREATE NONCLUSTERED INDEX [IX_LUDI_PLANTILLA_materia] ON [dbo].[LUDI_PLANTILLA]([materia_id]);

ALTER TABLE [dbo].[LUDI_PLANTILLA_COLECCION] ADD CONSTRAINT [LUDI_PLANTILLA_COLECCION_grado_id_fkey]
    FOREIGN KEY ([grado_id]) REFERENCES [dbo].[LUDI_COMMON_GRADE]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_PLANTILLA_COLECCION] ADD CONSTRAINT [LUDI_PLANTILLA_COLECCION_materia_id_fkey]
    FOREIGN KEY ([materia_id]) REFERENCES [dbo].[LUDI_MATERIA]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE [dbo].[LUDI_PLANTILLA] ADD CONSTRAINT [LUDI_PLANTILLA_activity_id_fkey]
    FOREIGN KEY ([activity_id]) REFERENCES [dbo].[LUDI_ACTIVIDAD]([activity_id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_PLANTILLA] ADD CONSTRAINT [LUDI_PLANTILLA_materia_id_fkey]
    FOREIGN KEY ([materia_id]) REFERENCES [dbo].[LUDI_MATERIA]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LUDI_PLANTILLA] ADD CONSTRAINT [LUDI_PLANTILLA_coleccion_id_fkey]
    FOREIGN KEY ([coleccion_id]) REFERENCES [dbo].[LUDI_PLANTILLA_COLECCION]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;
