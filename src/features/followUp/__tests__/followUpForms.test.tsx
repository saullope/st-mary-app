import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithAchievements as render } from "@/features/gamification/testing/renderWithAchievements";
import { SummaryActions } from "@/features/play/PlayScreens";
import { TeacherEvaluationForm } from "../components/TeacherEvaluationForm";

const mockRouter = { push: jest.fn() };
jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));

const participant = { id: "7", name: "Ana", token: "secreto" };
const sesion = (enableStudentFeedback: boolean) => ({ id: "1", user: { config: { enableStudentFeedback } } });

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn().mockResolvedValue({ ok: true });
});

describe("valoración del estudiante (SummaryActions)", () => {
  it("una pregunta a la vez: la segunda carita envía sola, sin botón de enviar", async () => {
    render(<SummaryActions sesion={sesion(true)} participant={participant} previewMode={false} />);

    const gusto = screen.getByRole("group", { name: "¿Te gustó la actividad?" });
    expect(gusto.querySelectorAll("button")).toHaveLength(5);
    expect(screen.queryByRole("button", { name: "Enviar" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "5 de 5: ¡Me encantó!" }));

    const aprendizaje = screen.getByRole("group", { name: "¿Sientes que aprendiste con ella?" });
    expect(aprendizaje.querySelectorAll("button")).toHaveLength(5);
    expect(global.fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "3 de 5: Algo" }));

    expect(await screen.findByText("¡Gracias por contarnos!")).toBeInTheDocument();
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/play/feedback");
    expect(JSON.parse(init.body)).toEqual({ enjoyment: 5, learning: 3, participanteId: "7" });
  });

  it("se puede cerrar sin responder y no envía nada", () => {
    render(<SummaryActions sesion={sesion(true)} participant={participant} previewMode={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar la encuesta" }));
    expect(screen.queryByRole("group", { name: "¿Te gustó la actividad?" })).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("no se pide en la vista previa del docente", () => {
    render(<SummaryActions sesion={sesion(true)} participant={{ id: "preview", name: "Docente" }} previewMode />);
    expect(screen.queryByRole("group", { name: "¿Te gustó la actividad?" })).not.toBeInTheDocument();
  });

  it("no se pide si el docente la desactivó en sus preferencias", () => {
    render(<SummaryActions sesion={sesion(false)} participant={participant} previewMode={false} />);
    expect(screen.queryByRole("group", { name: "¿Te gustó la actividad?" })).not.toBeInTheDocument();
  });

  it("si no se pudo guardar avisa y deja seguir", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    render(<SummaryActions sesion={sesion(true)} participant={participant} previewMode={false} />);
    fireEvent.click(screen.getByRole("button", { name: "4 de 5: Me gustó" }));
    fireEvent.click(screen.getByRole("button", { name: "4 de 5: Bastante" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver al inicio" })).toBeInTheDocument();
  });

});

describe("evaluación del docente (TeacherEvaluationForm)", () => {
  it("nombra el grado de la actividad y pide efectividad y objetivo", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<TeacherEvaluationForm gradeId={2} fromTemplate={false} onSubmit={onSubmit} onSkip={jest.fn()} />);

    expect(screen.getByRole("group", { name: /objetivo de tu clase de segundo grado/ })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /dificultad/ })).not.toBeInTheDocument();

    const guardar = screen.getByRole("button", { name: "Guardar evaluación" });
    fireEvent.click(screen.getByRole("radio", { name: "4 de 5: Muy útil" }));
    expect(guardar).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: "Parcialmente" }));
    fireEvent.click(guardar);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ teacherRating: 4, objectiveLevel: 1, templateDifficulty: null }));
  });

  it("en una copia de plantilla pide además la dificultad", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(<TeacherEvaluationForm gradeId={1} fromTemplate onSubmit={onSubmit} onSkip={jest.fn()} />);
    fireEvent.click(screen.getByRole("radio", { name: "5 de 5: Totalmente útil" }));
    fireEvent.click(screen.getByRole("radio", { name: "Sí" }));
    expect(screen.getByRole("button", { name: "Guardar evaluación" })).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: "Adecuada" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar evaluación" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ teacherRating: 5, objectiveLevel: 2, templateDifficulty: "ADECUADA" }));
  });
});
