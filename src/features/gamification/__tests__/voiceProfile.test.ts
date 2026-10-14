import { pickVoice, toVoiceProfile, voicePitch, voiceRate } from "../voiceProfile";

const voices = [
  { name: "Microsoft Raul - Spanish (Mexico)", lang: "es-MX" },
  { name: "Microsoft Sabina - Spanish (Mexico)", lang: "es-MX" },
  { name: "Microsoft Dalia Online (Natural) - Spanish (Mexico)", lang: "es-MX" },
  { name: "Microsoft Jorge Online (Natural) - Spanish (Mexico)", lang: "es-MX" },
  { name: "Microsoft Zira - English (United States)", lang: "en-US" },
  { name: "Google español", lang: "es-ES" },
];

describe("pickVoice", () => {
  it("prefiere una voz natural del género elegido en el idioma activo", () => {
    expect(pickVoice(voices, "es", "female")?.name).toMatch(/Dalia Online/);
    expect(pickVoice(voices, "es", "male")?.name).toMatch(/Jorge Online/);
  });

  it("no usa voces de otro idioma", () => {
    expect(pickVoice(voices, "en", "male")?.lang).toBe("en-US");
    expect(pickVoice([{ name: "Microsoft Zira", lang: "en-US" }], "es", "female")).toBeNull();
  });

  it("si no hay voz del género pedido, usa la mejor disponible del idioma", () => {
    expect(pickVoice([{ name: "Microsoft Sabina", lang: "es-MX" }], "es", "male")?.name).toBe("Microsoft Sabina");
  });
});

describe("perfil de voz", () => {
  it("vuelve al perfil por defecto con valores desconocidos", () => {
    expect(toVoiceProfile("robot", 3)).toEqual({ gender: "female", speed: "normal" });
    expect(toVoiceProfile("male", "slow")).toEqual({ gender: "male", speed: "slow" });
  });

  it("la velocidad lenta es más pausada y la voz femenina más aguda", () => {
    expect(voiceRate("slow")).toBeLessThan(voiceRate("normal"));
    expect(voicePitch("female")).toBeGreaterThan(voicePitch("male"));
  });
});
