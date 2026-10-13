import es from "../../../../messages/es.json";
import en from "../../../../messages/en.json";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? { ...acc, [path]: value } : { ...acc, ...flatten(value, path) };
  }, {});
}

/**
 * Nombres de los parámetros de un mensaje ICU, incluidos los de plural/select y las etiquetas
 * rich text. Los parámetros empiezan en minúscula; así no se confunden con el texto de cada
 * opción de un select ({Imagen} / {Image}), que sí cambia entre idiomas.
 */
function params(message: string): string[] {
  const names = new Set<string>();
  for (const match of message.matchAll(/\{\s*([a-z][A-Za-z0-9_]*)\s*(?:,|\})/g)) names.add(match[1]);
  for (const match of message.matchAll(/<([A-Za-z0-9_]+)>/g)) names.add(`<${match[1]}>`);
  return [...names].sort();
}

const esMessages = flatten(es as Tree);
const enMessages = flatten(en as Tree);

describe("messages/es.json y messages/en.json", () => {
  it("tienen exactamente las mismas claves", () => {
    expect(Object.keys(enMessages).sort()).toEqual(Object.keys(esMessages).sort());
  });

  it("usan los mismos parámetros en cada mensaje", () => {
    const mismatches = Object.keys(esMessages)
      .filter((key) => key in enMessages)
      .filter((key) => params(esMessages[key]).join() !== params(enMessages[key]).join());
    expect(mismatches).toEqual([]);
  });

  it("no dejan mensajes vacíos salvo los que lo son a propósito", () => {
    // Las lecciones no dan puntos: su texto de puntos está vacío en ambos idiomas.
    const allowedEmpty = new Set(["GamificationPanel.copy.ludileccion.points"]);
    const empty = Object.entries(esMessages)
      .filter(([key, value]) => !value.trim() && !allowedEmpty.has(key))
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });
});
