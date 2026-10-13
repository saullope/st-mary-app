import { safeRedirectPath } from "../redirect";

describe("safeRedirectPath", () => {
  it("acepta rutas internas", () => {
    expect(safeRedirectPath("/create/ludiquiz?id=4")).toBe("/create/ludiquiz?id=4");
  });

  it("rechaza destinos externos y vacíos", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/welcome-educator");
    expect(safeRedirectPath("//evil.example")).toBe("/welcome-educator");
    expect(safeRedirectPath("/\\evil.example")).toBe("/welcome-educator");
    expect(safeRedirectPath(null)).toBe("/welcome-educator");
  });
});
