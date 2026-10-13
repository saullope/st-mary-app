import { screen, act, fireEvent } from "@testing-library/react";
import { renderWithAchievements as render } from "@/features/gamification/testing/renderWithAchievements";
import { ActivityPlayer } from "../ActivityPlayer";
import { buildPreviewSession } from "../buildPreviewSession";
import type { ActivityEditorState } from "@/context/ActivityEditorContext";

// Referencia estable, como el router real de Next: se usa como dependencia de un efecto.
const mockRouter = { push: jest.fn() };
jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));
jest.mock("canvas-confetti", () => jest.fn());
jest.mock("@/features/gamification/useGameVoice", () => ({ useGameVoice: () => ({ speak: jest.fn() }) }));
// El barril de UI arrastra next-intl (ESM), que Jest no transforma.
jest.mock("@/components/ui", () => ({ notify: { warning: jest.fn(), error: jest.fn(), success: jest.fn(), info: jest.fn() } }));

const IMAGE = "https://firebasestorage.googleapis.com/v0/b/demo/o/uploads%2Fanswer_1_gato.png?alt=media";

const editorState = {
  activityId: null,
  title: "Animales",
  activityType: "ludiquiz",
  backgroundImage: "/images/theme/tema4.jpg",
  themeModalOpen: false,
  fullScreen: false,
  memoryImages: [],
  lessonBlocks: [],
  formQuestions: [],
  config: { gradeId: 1, timeLimit: 20, pointsPerCorrect: 10, selectedBadges: [], selectedMissions: [], voiceEnabled: false },
  questions: [
    {
      id: 1,
      text: "¿Cuál es el gato?",
      mediaType: null,
      mediaUrl: null,
      answers: [
        { id: 0, text: "Gato", isCorrect: true, imageUrl: IMAGE },
        { id: 1, text: "Perro", isCorrect: false, imageUrl: null },
      ],
    },
  ],
} as ActivityEditorState;

describe("imágenes en las respuestas de LudiQuiz", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("la Vista Previa lleva la imagen de cada opción", () => {
    const sesion = buildPreviewSession(editorState);
    const [gato, perro] = sesion.LUDI_ACTIVIDAD.preguntas[0].opciones as any[];
    expect(gato.opcionRecursos).toEqual([{ recurso: { url: IMAGE } }]);
    expect(perro.opcionRecursos).toEqual([]);
  });

  it("el juego muestra la imagen dentro de la opción", () => {
    const { container } = render(<ActivityPlayer sesion={buildPreviewSession(editorState)} previewMode previewName="Docente" />);
    fireEvent.click(screen.getByText("¡SÍ, VAMOS!"));
    for (let i = 0; i < 4; i++) act(() => { jest.advanceTimersByTime(1000); });

    const gatoButton = screen.getByRole("button", { name: /Gato/ });
    expect(gatoButton.querySelector("img")?.getAttribute("src")).toBe(IMAGE);
    expect(screen.getByRole("button", { name: /Perro/ }).querySelector("img")).toBeNull();
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });
});
