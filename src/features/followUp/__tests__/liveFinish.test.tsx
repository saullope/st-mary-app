import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithAchievements as render } from "@/features/gamification/testing/renderWithAchievements";
import LiveDashboardClient from "@/app/dashboard/live/[id]/LiveDashboardClient";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

const activeSession = { id: "15", codigo: "ABC123", phase: "active", participantes: [] };

function mockApi() {
  global.fetch = jest.fn((url: string, init?: RequestInit) => {
    if (url === "/api/live/15" && !init?.method) return Promise.resolve({ ok: true, json: () => Promise.resolve(activeSession) });
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
  }) as jest.Mock;
}

const calls = (method: string, url: string) =>
  (global.fetch as jest.Mock).mock.calls.filter(([u, init]) => u === url && init?.method === method);

const renderPanel = (askEvaluation: boolean) =>
  render(<LiveDashboardClient sessionId="15" gradeId={1} fromTemplate={false} askEvaluation={askEvaluation} />);

beforeEach(mockApi);

describe("terminar la sesión en vivo", () => {
  it("pide la evaluación y la guarda antes de terminar", async () => {
    renderPanel(true);
    fireEvent.click(await screen.findByRole("button", { name: /Terminar actividad/ }));
    const dialog = screen.getByRole("dialog", { name: "Seguimiento de la actividad" });
    expect(dialog).toHaveTextContent("objetivo de tu clase de primer grado");

    fireEvent.click(screen.getByRole("radio", { name: "3 de 5: Útil" }));
    fireEvent.click(screen.getByRole("radio", { name: "No" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar y terminar" }));

    await waitFor(() => expect(calls("PATCH", "/api/live/15")).toHaveLength(1));
    expect(JSON.parse(calls("POST", "/api/live/teacher-feedback")[0][1].body)).toEqual({ sessionId: "15", teacherRating: 3, objectiveLevel: 0, templateDifficulty: null });
  });

  it("omitirla también termina, y cerrar el diálogo no termina", async () => {
    renderPanel(true);
    fireEvent.click(await screen.findByRole("button", { name: /Terminar actividad/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(calls("PATCH", "/api/live/15")).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: /Terminar actividad/ }));
    fireEvent.click(screen.getByRole("button", { name: "Terminar sin evaluar" }));
    await waitFor(() => expect(calls("PATCH", "/api/live/15")).toHaveLength(1));
    expect(calls("POST", "/api/live/teacher-feedback")).toHaveLength(0);
  });

  it("respeta la preferencia: sin evaluación, termina directamente", async () => {
    renderPanel(false);
    fireEvent.click(await screen.findByRole("button", { name: /Terminar actividad/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(calls("PATCH", "/api/live/15")).toHaveLength(1));
  });

  it("avisa antes de salir con la sesión abierta y solo sale si se confirma", async () => {
    mockPush.mockClear();
    renderPanel(true);
    const back = await screen.findByRole("link", { name: /Mis actividades/ });

    fireEvent.click(back);
    const dialog = screen.getByRole("dialog", { name: "¿Salir del panel en vivo?" });
    expect(dialog).toHaveTextContent("La sesión seguirá abierta");
    fireEvent.click(screen.getByRole("button", { name: "Quedarme" }));
    expect(mockPush).not.toHaveBeenCalled();

    fireEvent.click(back);
    fireEvent.click(screen.getByRole("button", { name: "Salir" }));
    expect(mockPush).toHaveBeenCalledWith("/dashboard/my-activities");
  });
});
