# Pendientes

Estado al 2026-10-13, rama `slopez-dev`.

## 1. Configuraciones (commit `953c971`)

Hechos, verificados (`tsc` limpio, Jest 125/125, ESLint sin errores; queda un aviso previo en `AdminUsers.tsx`) y con commit:

- **Perfil de voz**
  - Columnas `LUDI_USER_CONFIG.voice_gender` (female/male) y `voice_speed` (slow/normal/fast).
  - Migración `prisma/sql/2026-10-13_voice_profile.sql`, aplicada solo en la BD local.
  - `src/features/gamification/voiceProfile.ts` (`pickVoice`, `toVoiceProfile`, `voiceRate`, `voicePitch`) con sus pruebas.
  - `useGameVoice(enabled, profile)`.
  - Selects de voz y velocidad en Preferencias, con botón "Probar voz".
  - `/api/user/config` validado con Yup.
  - El Panel Lúdico ya no habla.
- **Configuración sobria:** `Settings.module.css`, `SidebarSettings.module.css` y `settings/layout.tsx`.
- **Gestión de datos eliminada:**
  - `src/app/settings/data`, `DataSettings.tsx` y `/api/user/export-data`;
  - sus mensajes en es/en.
- **Perfil con el fondo del panel:** `src/app/view/profile/layout.tsx`, `ProfileClient.tsx` y el mensaje `Profile.activityCount`.

Antes de probar: reiniciar el servidor de desarrollo y correr `npx prisma generate`. La última vez dio EPERM porque el servidor tenía tomada la DLL del motor.

Antes de desplegar: aplicar `prisma/sql/2026-10-13_voice_profile.sql` en cada entorno.

## 2. Avance del rediseño

- Bloqueo de caveman resuelto: `mcp__caveman__caveman_retrieve` está permitido en `.claude/settings.json`.
- Hecho (sin commit):
  - menú de acciones compartido `ActionMenu` (`src/components/ui`);
  - `ActivityCollection` + `ActivityTypeIcon` (`src/components/dashboard/collection`);
  - `ActivityCard` y `TemplateCard` rediseñadas;
  - `DeleteActivityButton` pasó a ser el hook `useDeleteActivity`;
  - se eliminó `CreatorCard`.
- Falta: la tabla de datos compartida y el paso 3 (tablas). Falta también revisar visualmente las tarjetas en el navegador.

## 3. Rediseño acordado (pendiente de implementar)

### Tablas: "Tabla de datos sobria"

- Superficie blanca, encabezado fijo gris y filas alternas.
- Números alineados a la derecha y estados como píldoras pequeñas.
- Menú ⋯ por fila.
- Paginación.
- El detalle se abre en un panel lateral, no expandido dentro de la tabla.

### Actividades y plantillas: "Lista compacta + cuadrícula"

- Interruptor Lista/Cuadrícula, con la preferencia guardada en `localStorage` (envuelto en try/catch).
- Una fila por actividad, con un cuadro del color del tipo y "tipo · grado · fecha" en una sola línea.
- Una acción principal (Lanzar o Usar plantilla); ver, editar, compartir y eliminar van en un menú ⋯ accesible.

### Pasos

1. **Componentes compartidos:** tabla de datos y menú de acciones, con navegación por teclado y ARIA (`aria-haspopup`, `aria-expanded`, `role="menu"`, Escape y flechas).
2. **Tarjetas:**
   - `src/components/dashboard/ActivityCard.tsx`
     - Se usa en `src/app/dashboard/my-activities/page.tsx` y en `src/app/view/profile/[id]/ProfileClient.tsx`.
     - Usa `createGameSession` (`src/app/dashboard/my-activities/sessionActions.ts`), `DeleteActivityButton`, `CreatorCard`, `getEditorRoute`, `sessionPhase` y el enlace de compartir.
     - Sus textos están en el namespace `activityCard`.
   - `src/app/dashboard/templates/TemplateCard.tsx`
     - Se usa en `templates/page.tsx`.
     - Usa `cloneTemplateActivity`, `openPendingEditorTab`, `createGameSession` y `/views/activity/[id]`.
     - Sus textos están en el namespace `Templates`.
   - Estilos actuales: `src/styles/pages/my-activities.module.css` (`.activitiesGrid`, `.activityCard`, `.cardHeader`, `.cardFooter`, `.badgeQuiz`/`.badgeTF`/`.badgeMemory`/`.badgeLesson`/`.badgeForm`).
3. **Tablas:**
   - `src/app/dashboard/reports/[id]/ReportDetailClient.tsx` (tabla de ranking).
   - `src/app/admin/reports/AdminReportsTable.tsx`: pasar las filas expandibles a un panel lateral.
   - `src/app/admin/reports/AdminFollowUpTable.tsx`.
   - `src/components/settings/AdminUsers.tsx` (usa la `Table` de react-bootstrap).

### Referencias

- Etiquetas por id: tipo con `Common.activityTypes.<id>`, grado con `Common.grades.<id>`.
- Paleta del panel: `#6a4bff`, `#140a2e`, cian `#00d4ff` y lavanda `#E8E5F7`.
- Textos nuevos: agregarlos en `messages/es.json` y `messages/en.json` con las mismas claves (lo verifica `src/lib/i18n/__tests__/messages.test.ts`). Ningún texto visible puede quedar fijo en el código.

### Al terminar

`npx tsc --noEmit`, `npm run test`, `npm run lint` y `graphify update .`.

## 4. Otros pendientes

- Decidir si `.agents/skills/frontend-design/` y `skills-lock.json` se borran o se mueven a `.claude/skills`.
- Configurar `NEXT_PUBLIC_SITE_URL` en cada entorno (URLs canónicas y Open Graph).
