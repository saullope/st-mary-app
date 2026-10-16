"use client";

import SumandoConFrutas from "./sumando-con-frutas/SumandoConFrutas";

// Cada minijuego es su propio componente; el registro (minigames.ts) solo describe la tarjeta.
const GAMES: Record<string, () => React.ReactElement> = {
  "sumando-con-frutas": () => <SumandoConFrutas />,
};

export default function MinigamePlayer({ slug }: { slug: string }) {
  const Game = GAMES[slug];
  return Game ? <Game /> : null;
}
