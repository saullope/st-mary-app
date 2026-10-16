// Reglas de "Sumando con frutas" (1.er grado), iguales al juego original: 5 sumas de dos
// grupos de 1 a 5 frutas con total hasta 10, 3 opciones, 2 intentos y 3 minutos.

export const FRUITS = ["manzana", "banana", "naranja", "uva", "fresa", "sandia"] as const;
export type Fruit = (typeof FRUITS)[number];

export const QUESTIONS = 5;
export const POINTS_PER = 5;
export const GAME_SECONDS = 180;
export const MAX_ATTEMPTS = 2;
export const OPTIONS = 3;

export interface SumQuestion {
  a: number;
  b: number;
  fruitA: Fruit;
  fruitB: Fruit;
  /** Opciones en el orden en que se muestran; una es a + b. */
  options: number[];
}

type Random = () => number;

const pick = <T,>(items: readonly T[], random: Random) => items[Math.floor(random() * items.length)];

function shuffle<T>(items: T[], random: Random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateQuestions(random: Random = Math.random): SumQuestion[] {
  const questions: SumQuestion[] = [];
  while (questions.length < QUESTIONS) {
    const a = Math.floor(random() * 5) + 1;
    const b = Math.floor(random() * 5) + 1;
    if (a + b > 10) continue;
    const correct = a + b;
    const options = [correct];
    while (options.length < OPTIONS) {
      const candidate = Math.floor(random() * 10) + 1;
      if (!options.includes(candidate)) options.push(candidate);
    }
    questions.push({ a, b, fruitA: pick(FRUITS, random), fruitB: pick(FRUITS, random), options: shuffle(options, random) });
  }
  return questions;
}

/** Estrellas del resultado final (de 0 a 5), en proporción a los puntos. */
export const finalStars = (score: number) => Math.round((score / (QUESTIONS * POINTS_PER)) * 5);

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest < 10 ? `0${rest}` : rest}`;
}
