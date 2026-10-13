# Guardado de actividades

El editor guarda una actividad con una petición a la API REST. Toda la lógica de guardado vive en `src/services/activityWrite`, y la API es su único punto de entrada.

## Flujo

```
SaveActivityButton (cliente)
  └─ fetch POST /api/activities  o  PUT /api/activities/{id}
       └─ activityRequest.ts: origen → sesión → validación Yup
            └─ createActivityForUser / updateActivityForUser (transacción Prisma)
                 ├─ ACTIVITY + LUDI_ACTIVIDAD + LUDI_ACTIVIDAD_CONFIG
                 ├─ LUDI_ACTIVIDAD_INSIGNIA / LUDI_ACTIVIDAD_MISION
                 └─ contenido: preguntas, bloques de lección o parejas de memoria
```

La transacción es todo o nada. Si algo falla, incluido un código de insignia que no existe, no queda guardado nada a medias.

| Archivo | Responsabilidad |
|---|---|
| `src/components/editor/SaveActivityButton.tsx` | Valida en el cliente y envía la petición |
| `src/app/api/activities/route.ts` | `POST`: crear |
| `src/app/api/activities/[id]/route.ts` | `PUT`: reemplazar |
| `src/app/api/activities/activityRequest.ts` | Origen, sesión y validación del cuerpo |
| `src/services/activityWrite/createActivity.ts` | Transacción de creación |
| `src/services/activityWrite/updateActivity.ts` | Transacción de edición (verifica que el docente sea el dueño) |
| `src/features/gamification/activityAchievements.ts` | Convierte códigos de insignias y misiones en filas del catálogo |

## Endpoints

| Método | Ruta | Uso | Respuesta exitosa |
|---|---|---|---|
| `POST` | `/api/activities` | Crear una actividad | `201` |
| `PUT` | `/api/activities/{id}` | Reemplazar una actividad existente | `200` |

Ambos requieren la sesión del docente, que viaja en la cookie `session`. El dueño de la actividad siempre es el usuario de la sesión, nunca un id enviado en el cuerpo. En `PUT`, el id que vale es el de la URL.

## Cuerpo de la petición

```json
{
  "title": "Animales de la granja",
  "type": "ludimemory",
  "questions": [],
  "memoryImages": [
    "https://cdn.pixabay.com/photo/vaca.jpg",
    "https://cdn.pixabay.com/photo/gallina.jpg"
  ],
  "backgroundImage": "/images/theme/tema1.jpg",
  "config": {
    "gradeId": 1,
    "timeLimit": 0,
    "pointsPerCorrect": 10,
    "selectedBadges": ["coleccionista", "buena-memoria"],
    "selectedMissions": ["M1-completo"],
    "voiceEnabled": true
  }
}
```

| Campo | Descripción |
|---|---|
| `title` | Obligatorio. Máximo 100 caracteres. |
| `type` | `ludiquiz`, `trueorfalse`, `ludimemory`, `ludileccion` o `ludiform`. |
| `questions` | Preguntas de LudiQuiz o Verdadero/Falso. Arreglo vacío en los demás tipos. |
| `memoryImages` | LudiMemory: entre 2 y 12 URLs de imagen, sin repetir. |
| `lessonBlocks` | LudiLección: bloques de contenido. Los permitidos dependen del grado. |
| `formQuestions` | LudiForm: solo para 3.er grado. |
| `config.selectedBadges` / `config.selectedMissions` | Códigos del catálogo (`LUDI_INSIGNIA.codigo`, `LUDI_MISION.codigo`), no ids. |
| `config.timeLimit` | Segundos por pregunta. Solo lo usan LudiQuiz y Verdadero/Falso. |

La validación es estricta: los tipos deben coincidir exactamente. Por ejemplo, `"gradeId": "1"` se rechaza.

## Respuestas

```json
// 201 / 200
{ "success": true, "message": "Actividad guardada exitosamente", "activityId": 42 }

// Error
{ "error": "Agrega al menos 2 imágenes." }
```

| Código | Cuándo |
|---|---|
| `400` | Cuerpo inválido o contenido que no pasa la validación del tipo de actividad |
| `401` | Sin sesión o sesión vencida |
| `403` | Petición desde otro sitio, o actividad de otro docente |
| `404` | La actividad no existe |
| `500` | Error de base de datos |

## Ejemplo desde el editor

`src/components/editor/SaveActivityButton.tsx`:

```tsx
const response = await fetch(state.activityId ? `/api/activities/${state.activityId}` : "/api/activities", {
  method: state.activityId ? "PUT" : "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(activityData),
});
const result = await response.json();

if (result.error) {
  notify.error("Error al guardar", result.error);
  return;
}
```

Para probarla desde Postman o curl, envía la cookie `session` de un docente con sesión iniciada.

## Seguridad

- **Origen:** se rechaza una petición cuyo encabezado `Origin` no sea el del propio sitio (`src/lib/http/isSameOrigin.ts`).
- **Validación en dos capas:** la API valida con Yup la estructura del cuerpo. El servicio valida el contenido según el tipo de actividad.
- **Lógica de guardado protegida:** las funciones del servicio reciben el usuario de la sesión. Nunca deben exportarse desde un archivo `"use server"`, porque cada export de esos archivos es invocable desde el navegador.
