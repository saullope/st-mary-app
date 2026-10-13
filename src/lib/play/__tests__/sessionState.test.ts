import { sessionPhase } from "../sessionState";

describe("sessionPhase", () => {
  it("normaliza los valores nuevos y los heredados", () => {
    expect(sessionPhase("lobby")).toBe("waiting");
    expect(sessionPhase("ESPERANDO")).toBe("waiting");
    expect(sessionPhase("activa")).toBe("active");
    expect(sessionPhase("EN_CURSO")).toBe("active");
    expect(sessionPhase("finalizada")).toBe("finished");
    expect(sessionPhase("FINALIZADA")).toBe("finished");
  });

  it("trata un estado desconocido como sala de espera, nunca como en curso", () => {
    expect(sessionPhase(null)).toBe("waiting");
    expect(sessionPhase("cualquiera")).toBe("waiting");
  });
});
