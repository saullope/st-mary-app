import { act, fireEvent, screen } from "@testing-library/react";
import { renderWithAchievements as render } from "@/features/gamification/testing/renderWithAchievements";
import SumandoConFrutas from "../sumando-con-frutas/SumandoConFrutas";
import { QUESTIONS, finalStars, generateQuestions } from "../sumando-con-frutas/rules";

jest.mock("canvas-confetti", () => jest.fn());

describe("reglas de Sumando con frutas", () => {
  it("genera 5 sumas de grupos de 1 a 5 con total hasta 10 y 3 opciones distintas, una correcta", () => {
    for (let round = 0; round < 50; round++) {
      const questions = generateQuestions();
      expect(questions).toHaveLength(QUESTIONS);
      for (const q of questions) {
        expect(q.a).toBeGreaterThanOrEqual(1);
        expect(q.a).toBeLessThanOrEqual(5);
        expect(q.b).toBeGreaterThanOrEqual(1);
        expect(q.b).toBeLessThanOrEqual(5);
        expect(q.a + q.b).toBeLessThanOrEqual(10);
        expect(new Set(q.options).size).toBe(3);
        expect(q.options).toContain(q.a + q.b);
      }
    }
  });

  it("da estrellas finales en proporción a los puntos", () => {
    expect(finalStars(25)).toBe(5);
    expect(finalStars(10)).toBe(2);
    expect(finalStars(0)).toBe(0);
  });
});

describe("juego Sumando con frutas", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
    jest.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const startPlaying = () => {
    render(<SumandoConFrutas />);
    fireEvent.click(screen.getByRole("button", { name: /Sumando con frutas/ }));
    fireEvent.click(screen.getByRole("button", { name: "¡Jugar!" }));
    expect(screen.getByRole("status")).toHaveTextContent("3");
    // 3, 2, 1, ¡GO! y entra al juego.
    for (let i = 0; i < 5; i++) act(() => jest.advanceTimersByTime(1000));
  };

  const currentSum = () => {
    const label = screen.getByLabelText(/¿Cuánto es \d+ más \d+\?/).getAttribute("aria-label") ?? "";
    const [, a, b] = /(\d+) más (\d+)/.exec(label) ?? [];
    return Number(a) + Number(b);
  };

  it("un acierto suma puntos, gana una estrella y lo dice; pasa sola a la siguiente", () => {
    startPlaying();
    expect(screen.getByText("Pregunta 1 / 5")).toBeInTheDocument();
    const sum = currentSum();

    fireEvent.click(screen.getByRole("button", { name: String(sum) }));
    expect(screen.getByText("Puntos: 5")).toBeInTheDocument();
    expect(screen.getByText((text) => text.startsWith("¡Correcto!") && text.endsWith(`son ${sum}`))).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(1500));
    expect(screen.getByText("Pregunta 2 / 5")).toBeInTheDocument();
  });

  it("con dos errores dice la respuesta y sigue, sin sumar puntos", () => {
    startPlaying();
    const sum = currentSum();
    const wrong = screen.getAllByRole("button").filter((b) => /^\d+$/.test(b.textContent ?? "") && b.textContent !== String(sum));

    fireEvent.click(wrong[0]);
    expect(screen.getByText("Intenta otra vez")).toBeInTheDocument();
    fireEvent.click(wrong[1]);
    expect(screen.getByText(`Era ${sum}`)).toBeInTheDocument();
    expect(screen.getByText("Puntos: 0")).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(1500));
    expect(screen.getByText("Pregunta 2 / 5")).toBeInTheDocument();
  });

  it("al acabarse el tiempo muestra el resultado con las estrellas", () => {
    startPlaying();
    act(() => jest.advanceTimersByTime(181000));
    expect(screen.getByRole("heading", { name: "¡Juego terminado!" })).toBeInTheDocument();
    expect(screen.getByLabelText("0 de 5 estrellas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jugar de nuevo" })).toBeInTheDocument();
  });
});
