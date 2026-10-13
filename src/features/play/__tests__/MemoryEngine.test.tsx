import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithAchievements as render } from "@/features/gamification/testing/renderWithAchievements";
import { ActivityPlayer } from "../ActivityPlayer";

const mockRouter = { push: jest.fn() };
jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));
jest.mock("canvas-confetti", () => jest.fn());
jest.mock("@/features/gamification/useGameVoice", () => ({ useGameVoice: () => ({ speak: jest.fn() }) }));
jest.mock("@/components/ui", () => ({ notify: { warning: jest.fn(), error: jest.fn(), success: jest.fn(), info: jest.fn() } }));

const pair = (id: string, url: string) => ({ id, tarjetas: [{ recurso: { url } }, { recurso: { url } }] });

const sesion = {
  id: "preview",
  user: { config: { enableStudentFeedback: false } },
  LUDI_ACTIVIDAD: {
    tipoActividadId: 3,
    gradoId: 1,
    insignias: ["coleccionista", "buena-memoria"].map((codigo) => ({ insignia: { codigo } })),
    misiones: ["M1-completo"].map((codigo) => ({ mision: { codigo } })),
    config: {
      puntajeBase: 5,
      ajustesJson: JSON.stringify({ voiceEnabled: false }),
    },
    preguntas: [],
    memoriaParejas: [pair("1", "/sol.png"), pair("2", "/luna.png")],
  },
};

/** Botones de las cartas que muestran la imagen dada. */
const cardsOf = (container: HTMLElement, src: string) =>
  Array.from(container.querySelectorAll(`img[src="${src}"]`)).map((img) => img.closest("button") as HTMLButtonElement);

describe("MemoryEngine (LudiMemory) en Vista Previa", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("voltea las cartas fallidas, cuenta intentos y termina con puntaje por pareja", async () => {
    const { container } = render(<ActivityPlayer sesion={sesion} previewMode previewName="Docente" />);
    fireEvent.click(screen.getByText("¡SÍ, VAMOS!"));

    expect(screen.getByText("0 / 2 parejas")).toBeInTheDocument();
    expect(screen.queryByText(/segundos/)).not.toBeInTheDocument();

    const [sol1, sol2] = cardsOf(container, "/sol.png");
    const [luna1, luna2] = cardsOf(container, "/luna.png");

    fireEvent.click(sol1);
    fireEvent.click(luna1);
    expect(sol1).toHaveAttribute("data-face-up", "true");
    act(() => { jest.advanceTimersByTime(1000); });
    expect(sol1).toHaveAttribute("data-face-up", "false");
    expect(screen.getByText("1 intento")).toBeInTheDocument();

    fireEvent.click(sol1);
    fireEvent.click(sol2);
    expect(screen.getByText("1 / 2 parejas")).toBeInTheDocument();
    expect(sol1).toBeDisabled();

    fireEvent.click(luna1);
    await act(async () => {
      fireEvent.click(luna2);
    });

    expect(screen.getByRole("heading", { name: "¡Tablero completo!" })).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Encontraste 2 parejas en 3 intentos.")).toBeInTheDocument();
    // Aparece en el aviso en vivo y en el resumen de misiones.
    expect(screen.getAllByText("Completa todo el tablero").length).toBeGreaterThan(0);
    expect(screen.getByText("Insignias ganadas (0/2)")).toBeInTheDocument();
  });
});
