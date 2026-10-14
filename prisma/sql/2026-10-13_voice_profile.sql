-- Perfil de la voz que narra los logros al estudiante (Configuración > Preferencias).
-- Aditivo: dos columnas con valor por defecto; las filas existentes quedan con voz femenina y velocidad normal.
--
-- npx prisma db execute --file prisma/sql/2026-10-13_voice_profile.sql --schema prisma/schema.prisma

IF COL_LENGTH('dbo.LUDI_USER_CONFIG', 'voice_gender') IS NULL
    ALTER TABLE [dbo].[LUDI_USER_CONFIG] ADD [voice_gender] NVARCHAR(10) NOT NULL
        CONSTRAINT [LUDI_USER_CONFIG_voice_gender_df] DEFAULT 'female';

IF COL_LENGTH('dbo.LUDI_USER_CONFIG', 'voice_speed') IS NULL
    ALTER TABLE [dbo].[LUDI_USER_CONFIG] ADD [voice_speed] NVARCHAR(10) NOT NULL
        CONSTRAINT [LUDI_USER_CONFIG_voice_speed_df] DEFAULT 'normal';
