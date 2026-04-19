# Plan de Implementación de Persistencia (Base de Datos)

Este documento detalla la estrategia para persistir las actividades lúdicas respetando el modelo relacional y las tablas paramétricas existentes (`LUDI_TIPO_ACTIVIDAD`, `LUDI_TEMA`, `LUDI_RECURSO`, etc.).

## 1. Análisis de Tablas Paramétricas

Antes de guardar una actividad, debemos resolver las referencias a estas tablas estáticas.

### 1.1 Tipos de Actividad (`LUDI_TIPO_ACTIVIDAD`)
Mapeo entre el frontend y la base de datos:
| Frontend Key | DB ID | Nombre DB |
|--------------|-------|-----------|
| `ludiquiz` | 1 | LUDIQUIZ |
| `trueorfalse`| 2 | TRUEORFALSE|
| `ludimemory` | 3 | LUDYMEMORY |

### 1.2 Origen de Recursos (`LUDI_ORIGEN_RECURSO`)
Determinaremos el ID basándonos en el dominio de la URL del recurso:
| Dominio URL | DB ID | Nombre DB |
|-------------|-------|-----------|
| `firebasestorage` | 1 | LOCAL_STORAGE |
| `unsplash.com` | 2 | UNSPLASH |
| `youtube.com` | 3 | YOUTUBE |
| `freesound.org` | 4 | FREESOUND |

### 1.3 Tipos de Recurso (`LUDI_TIPO_RECURSO`)
| Tipo MIME / Contexto | DB ID | Nombre DB |
|----------------------|-------|-----------|
| Imagen | 1 | IMAGEN |
| Video | 2 | VIDEO |
| Audio | 3 | AUDIO |

### 1.4 Temas (`LUDI_TEMA`)
El frontend usa rutas de imagen (ej. `/images/theme/tema4.jpg`). Debemos buscar en la tabla `LUDI_TEMA` el registro que coincida con esa URL para obtener su `id`.

---

## 2. Flujo de Guardado (Server Action: `saveActivity`)

El proceso de guardado se ejecutará dentro de una **transacción de Prisma** (`prisma.$transaction`) para garantizar la integridad de los datos.

### Paso 1: Resolución de IDs
*   Obtener `educadorId` desde la sesión actual (`LudiUser.id`).
*   Obtener `tipoActividadId` según el string del frontend.
*   Buscar el `temaId` usando la URL del fondo de pantalla seleccionado.

### Paso 2: Gestión de Recursos (Media)
Recorrer todas las preguntas y respuestas para identificar URLs de multimedia.
*   Para cada URL única:
    *   Verificar si ya existe en `LUDI_RECURSO`.
    *   Si no existe, crear un nuevo registro infiriendo `tipoId` y `origenId`.
    *   Guardar el `recursoId` retornado para usarlo en las relaciones.

### Paso 3: Inserción de la Actividad
*   Crear registro en `LUDI_ACTIVIDAD`.
*   Crear registro en `LUDI_ACTIVIDAD_CONFIG` con el JSON del Panel Lúdico.

### Paso 4: Inserción de Contenido (Preguntas/Tarjetas)
*   **Si es Quiz/TrueFalse:**
    *   Crear `LUDI_PREGUNTA`.
    *   Crear `LUDI_OPCION` para cada respuesta.
    *   Crear relaciones `LUDI_PREGUNTA_RECURSO` si la pregunta tiene media.
*   **Si es Memory:**
    *   Crear `LUDI_MEMORIA_PAREJA` (pares).
    *   Crear `LUDI_MEMORIA_TARJETA` (lados A y B) vinculando los recursos.

---

## 3. Plan de Acción Técnico

1.  **Seed Data:** Verificar/Ejecutar script para poblar las tablas paramétricas si están vacías.
2.  **Helpers:** Crear funciones de utilidad en `src/lib/activity-helpers.ts` para resolver IDs (Tipos, Orígenes, Temas).
3.  **Refactorizar `saveActivity.ts`:**
    *   Implementar la lógica transaccional completa.
    *   Reemplazar el "Modo Simulación" con la escritura real.

## 4. Consideraciones Futuras
*   **Edición:** Este plan cubre la *creación*. Para la edición, necesitaremos lógica para detectar cambios (update) vs nuevos elementos.
*   **Misiones:** Actualmente se guardan como JSON. A futuro, si se requiere analítica por misión, deberían migrarse a una tabla relacional `LUDI_MISION`.
