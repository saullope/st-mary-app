-- Notificaciones del panel docente (campana) y los tipos que cada docente apaga.
-- Aditivo: una tabla nueva y una columna con valor por defecto; no cambia datos existentes.
--
-- npx prisma db execute --file prisma/sql/2026-10-15_notifications.sql --schema prisma/schema.prisma

SET XACT_ABORT ON;

BEGIN TRY
BEGIN TRAN;

IF OBJECT_ID('dbo.LUDI_NOTIFICACION') IS NOT NULL
    THROW 50001, 'La migración ya se aplicó (LUDI_NOTIFICACION existe).', 1;

-- Mismos nombres de restricciones que genera Prisma.
CREATE TABLE [dbo].[LUDI_NOTIFICACION] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [user_id] NVARCHAR(1000) NOT NULL,
    [tipo] NVARCHAR(40) NOT NULL,
    [clave] NVARCHAR(120) NOT NULL,
    [datos] NVARCHAR(MAX) NOT NULL CONSTRAINT [LUDI_NOTIFICACION_datos_df] DEFAULT '{}',
    [enlace] NVARCHAR(300) NULL,
    [leida] BIT NOT NULL CONSTRAINT [LUDI_NOTIFICACION_leida_df] DEFAULT 0,
    [creada_en] DATETIME2 NOT NULL CONSTRAINT [LUDI_NOTIFICACION_creada_en_df] DEFAULT CURRENT_TIMESTAMP,
    [actualizada_en] DATETIME2 NOT NULL CONSTRAINT [LUDI_NOTIFICACION_actualizada_en_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [LUDI_NOTIFICACION_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ_LUDI_NOTIFICACION_user_clave] UNIQUE NONCLUSTERED ([user_id], [clave])
);

CREATE NONCLUSTERED INDEX [IX_LUDI_NOTIFICACION_user_fecha] ON [dbo].[LUDI_NOTIFICACION]([user_id], [actualizada_en]);

ALTER TABLE [dbo].[LUDI_NOTIFICACION] ADD CONSTRAINT [LUDI_NOTIFICACION_user_id_fkey]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[LUDI_USERS]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE [dbo].[LUDI_USER_CONFIG] ADD [muted_notifications] NVARCHAR(400) NOT NULL
    CONSTRAINT [LUDI_USER_CONFIG_muted_notifications_df] DEFAULT '[]';

COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;
