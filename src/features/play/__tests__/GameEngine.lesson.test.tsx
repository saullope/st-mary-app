import { render, screen, act, fireEvent } from "@testing-library/react";
import { GameEngine } from "../GameEngine";

// Referencia estable, como el router real de Next: GameEngine lo usa como dependencia de un efecto.
const mockRouter = { push: jest.fn() };
jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));
jest.mock("canvas-confetti", () => jest.fn());
jest.mock("@/features/gamification/useGameVoice", () => ({ useGameVoice: () => ({ speak: jest.fn() }) }));

const tick = (seconds: number) => {
  for (let i = 0; i < seconds; i++) act(() => { jest.advanceTimersByTime(1000); });
};

const block = (id: string, numero: number, extra: object) => ({
  id,
  numero,
  esContenido: true,
  tiempoLimiteMs: null,
  puntaje: null,
  opciones: [],
  preguntaRecursos: [],
  contenidoTexto: null,
  ...extra,
});

const sesion = {
  id: "preview",
  user: { config: { enableStudentFeedback: false } },
  LUDI_ACTIVIDAD: {
    tipoActividadId: 4,
    gradoId: 3,
    config: {
      ajustesJson: JSON.stringify({ badges: ["explorador", "atento"], missions: ["L3-mitad", "L3-completa"], voiceEnabled: false }),
    },
    preguntas: [
      block("b1", 1, {
        enunciado: "Mira el video",
        preguntaRecursos: [{ recurso: { url: "https://www.youtube.com/embed/abcdefghijk", tipo: { nombre: "VIDEO" } } }],
      }),
      block("b2", 2, { enunciado: "El ciclo del agua", contenidoTexto: "Primer párrafo.\n\nSegundo párrafo." }),
    ],
  },
};

describe("GameEngine en modo LudiLección", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("recorre los bloques sin puntaje y entrega los logros al terminar", () => {
    render(<GameEngine sesion={sesion} previewMode previewName="Docente" />);
    fireEvent.click(screen.getByText("¡SÍ, VAMOS!"));
    tick(4);

    expect(screen.getByText(/Bloque 1 \/ 2/)).toBeInTheDocument();
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument();
    expect(screen.getByTitle("YouTube video")).toBeInTheDocument();

    tick(12);
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));

    expect(screen.getByText(/Bloque 2 \/ 2/)).toBeInTheDocument();
    expect(screen.getByText("Segundo párrafo.")).toBeInTheDocument();
    // La mitad de la lección se anuncia en vivo.
    expect(screen.getByText("Llega a la mitad de la lección")).toBeInTheDocument();

    tick(12);
    fireEvent.click(screen.getByRole("button", { name: /Terminar lección/ }));

    expect(screen.getByRole("heading", { name: "¡Lección completada!" })).toBeInTheDocument();
    expect(screen.queryByText(/Puntaje Final/)).not.toBeInTheDocument();
    // Aparece en el aviso en vivo y en el resumen de misiones cumplidas.
    expect(screen.getAllByText("Termina toda la lección")).toHaveLength(2);
    expect(screen.getByText("Misiones cumplidas")).toBeInTheDocument();
    expect(screen.getByText("Insignias ganadas (0/2)")).toBeInTheDocument();
  });
});
