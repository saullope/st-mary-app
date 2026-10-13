import { render, screen, fireEvent, act } from "@testing-library/react";
import { ActivityPlayer } from "../ActivityPlayer";

// Referencia estable, como el router real de Next: se usa como dependencia de un efecto.
const mockRouter = { push: jest.fn() };
jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));
jest.mock("canvas-confetti", () => jest.fn());
jest.mock("@/features/gamification/useGameVoice", () => ({ useGameVoice: () => ({ speak: jest.fn() }) }));
jest.mock("@/components/ui", () => ({ notify: { warning: jest.fn(), error: jest.fn(), success: jest.fn(), info: jest.fn() } }));

const sesion = {
  id: "preview",
  user: { config: { enableStudentFeedback: false } },
  LUDI_ACTIVIDAD: {
    tipoActividadId: 5,
    gradoId: 3,
    config: {
      puntajeBase: 10,
      ajustesJson: JSON.stringify({ badges: ["dedicado", "certero"], missions: ["F3-entrega"], voiceEnabled: false }),
    },
    preguntas: [
      {
        id: "q1", tipoPregunta: "single", enunciado: "¿2 + 2?", puntaje: 10,
        opciones: [{ id: "a", texto: "4", esCorrecta: true }, { id: "b", texto: "5", esCorrecta: false }],
      },
      {
        id: "q2", tipoPregunta: "multiple", enunciado: "Números pares", puntaje: 10,
        opciones: [{ id: "c", texto: "2", esCorrecta: true }, { id: "d", texto: "3", esCorrecta: false }, { id: "e", texto: "4", esCorrecta: true }],
      },
      { id: "q3", tipoPregunta: "long", enunciado: "Explica qué es sumar", puntaje: 10, opciones: [] },
    ],
  },
};

describe("FormEngine (LudiForm) en Vista Previa", () => {
  it("se responde sin tiempo y entrega con puntaje y respuesta pendiente", async () => {
    render(<ActivityPlayer sesion={sesion} previewMode previewName="Docente" />);
    fireEvent.click(screen.getByText("¡SÍ, VAMOS!"));

    expect(screen.getByText("0 / 3 respondidas")).toBeInTheDocument();
    expect(screen.getByText("Sin límite de tiempo")).toBeInTheDocument();
    expect(screen.getByText("Faltan 3 preguntas")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("4", { selector: "input[type=radio]" }));
    fireEvent.click(screen.getByLabelText("2", { selector: "input[type=checkbox]" }));
    fireEvent.click(screen.getAllByLabelText("4").find((el) => (el as HTMLInputElement).type === "checkbox")!);
    fireEvent.change(screen.getByLabelText("Respuesta a la pregunta 3"), { target: { value: "Juntar cantidades" } });

    expect(screen.getByText("3 / 3 respondidas")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Entregar formulario/ }));
    });

    expect(screen.getByRole("heading", { name: "¡Formulario entregado!" })).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("Acertaste 2 de 2 preguntas de opción.")).toBeInTheDocument();
    expect(screen.getByText("Tu respuesta escrita espera la revisión de tu docente.")).toBeInTheDocument();
    expect(screen.getByText("Insignias ganadas (0/2)")).toBeInTheDocument();
  });
});
