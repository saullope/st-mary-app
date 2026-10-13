import type { PrismaClient } from '@prisma/client'

// Catálogo inicial de insignias y misiones. Los códigos son los que ya guardan
// los logros otorgados (LUDI_LOGRO_PARTICIPANTE), así que no deben cambiar.
// Los textos viven en messages/{es,en}.json; la regla y su umbral, aquí.

type BadgeSeed = { codigo: string; catalogo: string; regla: string; umbral?: number; imagen: string; color: string }
type MissionSeed = { codigo: string; catalogo: string; gradoId: number; regla: string; umbral?: number }

const img = (codigo: string, ext: 'png' | 'svg') => `/images/panelludico/${codigo}.${ext}`

export const BADGES: BadgeSeed[] = [
  { codigo: 'sabio', catalogo: 'quiz', regla: 'primera_correcta', imagen: img('sabio', 'png'), color: '#5FC4D0' },
  { codigo: 'veloz', catalogo: 'quiz', regla: 'respuesta_rapida', umbral: 40, imagen: img('veloz', 'png'), color: '#9B51E0' },
  { codigo: 'valiente', catalogo: 'quiz', regla: 'persistente', imagen: img('valiente', 'png'), color: '#FFDA5F' },
  { codigo: 'mente-creativa', catalogo: 'quiz', regla: 'manual', imagen: img('mente-creativa', 'png'), color: '#FF7F7F' },
  { codigo: 'agil', catalogo: 'quiz', regla: 'precision_y_ritmo', umbral: 80, imagen: img('agil', 'png'), color: '#6FCF97' },
  { codigo: 'detective', catalogo: 'quiz', regla: 'correcta_multimedia', imagen: img('detective', 'png'), color: '#A567B6' },

  { codigo: 'explorador', catalogo: 'lesson', regla: 'leccion_completa', imagen: img('explorador', 'svg'), color: '#0096b4' },
  { codigo: 'atento', catalogo: 'lesson', regla: 'tiempo_por_bloque', umbral: 10, imagen: img('atento', 'svg'), color: '#6a4bff' },
  { codigo: 'lector', catalogo: 'lesson', regla: 'tiempo_de_lectura', umbral: 30, imagen: img('lector', 'svg'), color: '#e8692f' },

  { codigo: 'dedicado', catalogo: 'form', regla: 'formulario_entregado', imagen: img('dedicado', 'svg'), color: '#198754' },
  { codigo: 'certero', catalogo: 'form', regla: 'cerradas_perfectas', imagen: img('certero', 'svg'), color: '#0096b4' },
  { codigo: 'pensador', catalogo: 'form', regla: 'respuestas_desarrolladas', umbral: 20, imagen: img('pensador', 'svg'), color: '#e8692f' },

  { codigo: 'coleccionista', catalogo: 'memory', regla: 'tablero_completo', imagen: img('coleccionista', 'svg'), color: '#0096b4' },
  { codigo: 'buena-memoria', catalogo: 'memory', regla: 'pocos_fallos', umbral: 50, imagen: img('buena-memoria', 'svg'), color: '#6a4bff' },
  { codigo: 'imparable', catalogo: 'memory', regla: 'racha_de_parejas', umbral: 3, imagen: img('imparable', 'svg'), color: '#e8692f' },
]

export const MISSIONS: MissionSeed[] = [
  { codigo: '1-3-en-raya', catalogo: 'quiz', gradoId: 1, regla: 'racha', umbral: 3 },
  { codigo: '1-rapidez-15s', catalogo: 'quiz', gradoId: 1, regla: 'rapidez', umbral: 15 },
  { codigo: '1-20-puntos', catalogo: 'quiz', gradoId: 1, regla: 'puntos', umbral: 20 },
  { codigo: '2-4-en-raya', catalogo: 'quiz', gradoId: 2, regla: 'racha', umbral: 4 },
  { codigo: '2-rapidez-12s', catalogo: 'quiz', gradoId: 2, regla: 'rapidez', umbral: 12 },
  // Código histórico: la misión siempre se anunció como 30 puntos.
  { codigo: '2-35-puntos', catalogo: 'quiz', gradoId: 2, regla: 'puntos', umbral: 30 },
  { codigo: '3-5-en-raya', catalogo: 'quiz', gradoId: 3, regla: 'racha', umbral: 5 },
  { codigo: '3-rapidez-10s', catalogo: 'quiz', gradoId: 3, regla: 'rapidez', umbral: 10 },
  // Código histórico: la misión siempre se anunció como 40 puntos.
  { codigo: '3-45-puntos', catalogo: 'quiz', gradoId: 3, regla: 'puntos', umbral: 40 },

  { codigo: 'L1-2-bloques', catalogo: 'lesson', gradoId: 1, regla: 'bloques', umbral: 2 },
  { codigo: 'L1-mitad', catalogo: 'lesson', gradoId: 1, regla: 'mitad' },
  { codigo: 'L1-completa', catalogo: 'lesson', gradoId: 1, regla: 'completa' },
  { codigo: 'L2-3-bloques', catalogo: 'lesson', gradoId: 2, regla: 'bloques', umbral: 3 },
  { codigo: 'L2-mitad', catalogo: 'lesson', gradoId: 2, regla: 'mitad' },
  { codigo: 'L2-completa', catalogo: 'lesson', gradoId: 2, regla: 'completa' },
  { codigo: 'L3-4-bloques', catalogo: 'lesson', gradoId: 3, regla: 'bloques', umbral: 4 },
  { codigo: 'L3-mitad', catalogo: 'lesson', gradoId: 3, regla: 'mitad' },
  { codigo: 'L3-completa', catalogo: 'lesson', gradoId: 3, regla: 'completa' },

  { codigo: 'F3-3-respuestas', catalogo: 'form', gradoId: 3, regla: 'respuestas', umbral: 3 },
  { codigo: 'F3-escritor', catalogo: 'form', gradoId: 3, regla: 'escritor', umbral: 20 },
  { codigo: 'F3-entrega', catalogo: 'form', gradoId: 3, regla: 'entrega' },

  { codigo: 'M1-2-parejas', catalogo: 'memory', gradoId: 1, regla: 'parejas', umbral: 2 },
  { codigo: 'M1-2-seguidas', catalogo: 'memory', gradoId: 1, regla: 'seguidas', umbral: 2 },
  { codigo: 'M1-completo', catalogo: 'memory', gradoId: 1, regla: 'completo' },
  { codigo: 'M2-3-parejas', catalogo: 'memory', gradoId: 2, regla: 'parejas', umbral: 3 },
  { codigo: 'M2-2-seguidas', catalogo: 'memory', gradoId: 2, regla: 'seguidas', umbral: 2 },
  { codigo: 'M2-completo', catalogo: 'memory', gradoId: 2, regla: 'completo' },
  { codigo: 'M3-4-parejas', catalogo: 'memory', gradoId: 3, regla: 'parejas', umbral: 4 },
  { codigo: 'M3-3-seguidas', catalogo: 'memory', gradoId: 3, regla: 'seguidas', umbral: 3 },
  { codigo: 'M3-completo', catalogo: 'memory', gradoId: 3, regla: 'completo' },
]

/** Idempotente: deja el catálogo igual a esta lista sin borrar lo que el docente ya ganó. */
export async function seedAchievementCatalog(prisma: PrismaClient) {
  for (const [orden, badge] of BADGES.entries()) {
    const data = { ...badge, umbral: badge.umbral ?? null, orden, activo: true }
    await prisma.ludiInsignia.upsert({ where: { codigo: badge.codigo }, update: data, create: data })
  }
  for (const [orden, mission] of MISSIONS.entries()) {
    const data = { ...mission, umbral: mission.umbral ?? null, orden, activo: true }
    await prisma.ludiMision.upsert({ where: { codigo: mission.codigo }, update: data, create: data })
  }
}
