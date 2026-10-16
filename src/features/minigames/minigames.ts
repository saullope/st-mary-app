// Minijuegos: juegos ya hechos, con sus propios estilos, estrellas y retroalimentación.
// No son actividades (no se editan ni se lanzan con PIN): el docente los abre a pantalla
// completa o comparte su enlace. Textos: messages Minigames.games.<slug>.

export interface Minigame {
  slug: string;
  grade: 1 | 2 | 3;
  /** Código de LUDI_MATERIA, para mostrarlo con su nombre y color. */
  subject: string;
  /** Carpeta de recursos en public/. */
  assets: string;
  cover: string;
}

export const MINIGAMES: readonly Minigame[] = [
  {
    slug: "sumando-con-frutas",
    grade: 1,
    subject: "matematica",
    assets: "/minigames/sumando-con-frutas",
    cover: "/minigames/sumando-con-frutas/img/card-fondo.jpg",
  },
];

export const findMinigame = (slug: string) => MINIGAMES.find((game) => game.slug === slug);

export const minigamePath = (slug: string) => `/play/minijuegos/${slug}`;
