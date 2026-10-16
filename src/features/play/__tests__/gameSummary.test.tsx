import { act, screen } from "@testing-library/react";
import { renderWithAchievements as render } from "@/features/gamification/testing/renderWithAchievements";
import { GameSummary } from "../PlayScreens";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("canvas-confetti", () => jest.fn());

const props = {
  missionCodes: [],
  onReveal: jest.fn(),
  sesion: { user: { config: { enableStudentFeedback: false } } },
  participant: null,
  previewMode: true,
};

describe("final del juego (GameSummary)", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("las insignias salen solas de la caja y luego se ven todas juntas, sin tocar nada", () => {
    render(
      <GameSummary {...props} badgeCodes={["coleccionista", "buena-memoria"]}>
        <h1>¡Tablero completo!</h1>
      </GameSummary>,
    );

    expect(screen.getByRole("heading", { name: "¡Ganaste 2 insignias!" })).toBeInTheDocument();
    expect(screen.getByText("Insignia 1 de 2")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "¡Tablero completo!" })).not.toBeInTheDocument();

    // Cada caja se sacude, se abre y deja ver la insignia; después pasa a la siguiente.
    for (let i = 0; i < 4; i++) act(() => jest.advanceTimersByTime(2500));

    expect(screen.getByRole("heading", { name: "¡Tablero completo!" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tus insignias" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(props.onReveal).toHaveBeenCalledTimes(2);
  });

  it("sin insignias va directo al resumen", () => {
    render(
      <GameSummary {...props} badgeCodes={[]}>
        <h1>¡Buen trabajo!</h1>
      </GameSummary>,
    );
    expect(screen.getByRole("heading", { name: "¡Buen trabajo!" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tus insignias" })).not.toBeInTheDocument();
  });
});
