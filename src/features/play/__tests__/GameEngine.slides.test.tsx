import { render, screen, act, fireEvent } from "@testing-library/react";
import { GameEngine } from "../GameEngine";

// Referencia estable, como el router real de Next: GameEngine lo usa como dependencia de un efecto.
const mockRouter = { push: jest.fn() };
jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));
jest.mock("canvas-confetti", () => jest.fn());
jest.mock("@/features/gamification/useGameVoice", () => ({ useGameVoice: () => ({ speak: jest.fn() }) }));

const slide = {
  id: "s1",
  numero: 1,
  enunciado: "Repasemos",
  esContenido: true,
  tiempoLimiteMs: null,
  puntaje: null,
  opciones: [],
  preguntaRecursos: [{ recurso: { url: "https://www.canva.com/design/ABC/xyz/view?embed", tipo: { nombre: "PRESENTACION" } } }],
};

const question = {
  id: "q1",
  numero: 2,
  enunciado: "¿2 + 2?",
  esContenido: false,
  tiempoLimiteMs: 10000,
  puntaje: 100,
  opciones: [
    { id: "o1", indice: 0, texto: "4", esCorrecta: true },
    { id: "o2", indice: 1, texto: "5", esCorrecta: false },
  ],
  preguntaRecursos: [],
};

const sesion = {
  id: "preview",
  user: { config: { enableStudentFeedback: false } },
  LUDI_ACTIVIDAD: {
    tipoActividadId: 1,
    gradoId: 1,
    config: { tiempoPreguntaMs: 10000, puntajeBase: 100, ajustesJson: "{}" },
    preguntas: [slide, question],
  },
};

// Cada segundo de la cuenta regresiva/temporizador agenda el siguiente tras re-renderizar.
const tick = (seconds: number) => {
  for (let i = 0; i < seconds; i++) act(() => { jest.advanceTimersByTime(1000); });
};

describe("GameEngine con diapositivas de contenido", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("muestra la diapositiva sin temporizador y avanza con Continuar", () => {
    render(<GameEngine sesion={sesion} previewMode previewName="Docente" />);

    fireEvent.click(screen.getByText("¡SÍ, VAMOS!"));
    tick(4);

    expect(screen.getByRole("heading", { name: "Repasemos" })).toBeInTheDocument();
    expect(screen.getByTitle("Presentación de Canva")).toBeInTheDocument();

    // El tiempo no la cierra sola.
    tick(60);
    expect(screen.getByRole("heading", { name: "Repasemos" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));

    expect(screen.getByText("¿2 + 2?")).toBeInTheDocument();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByText(/10s/)).toBeInTheDocument();
  });
});
