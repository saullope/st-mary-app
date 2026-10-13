import type { Prisma } from "@prisma/client";
import { replaceActivityAchievements, selectedAchievementCodes } from "../activityAchievements";

const CATALOG_IDS: Record<string, number> = { sabio: 1, veloz: 2, "1-3-en-raya": 10 };

function fakeTx() {
  const lookup = ({ where }: { where: { codigo: { in: string[] } } }) =>
    Promise.resolve(where.codigo.in.filter((c) => c in CATALOG_IDS).map((c) => ({ id: CATALOG_IDS[c] })));
  const table = () => ({ deleteMany: jest.fn().mockResolvedValue({}), createMany: jest.fn().mockResolvedValue({}) });
  const tx = {
    ludiInsignia: { findMany: jest.fn(lookup) },
    ludiMision: { findMany: jest.fn(lookup) },
    ludiActividadInsignia: table(),
    ludiActividadMision: table(),
  };
  return tx;
}

describe("replaceActivityAchievements", () => {
  it("guarda la selección como filas del catálogo, sin repetir", async () => {
    const tx = fakeTx();
    await replaceActivityAchievements(tx as unknown as Prisma.TransactionClient, 7, ["sabio", "veloz", "sabio"], ["1-3-en-raya"]);
    expect(tx.ludiActividadInsignia.deleteMany).toHaveBeenCalledWith({ where: { activityId: 7 } });
    expect(tx.ludiActividadInsignia.createMany).toHaveBeenCalledWith({
      data: [{ activityId: 7, insigniaId: 1 }, { activityId: 7, insigniaId: 2 }],
    });
    expect(tx.ludiActividadMision.createMany).toHaveBeenCalledWith({ data: [{ activityId: 7, misionId: 10 }] });
  });

  it("rechaza un código que no está en el catálogo sin tocar la selección guardada", async () => {
    const tx = fakeTx();
    await expect(
      replaceActivityAchievements(tx as unknown as Prisma.TransactionClient, 7, ["sabio", "inventada"], [])
    ).rejects.toThrow("no están en el catálogo");
    expect(tx.ludiActividadInsignia.deleteMany).not.toHaveBeenCalled();
  });

  it("una selección vacía solo limpia lo anterior", async () => {
    const tx = fakeTx();
    await replaceActivityAchievements(tx as unknown as Prisma.TransactionClient, 7, [], []);
    expect(tx.ludiActividadMision.deleteMany).toHaveBeenCalled();
    expect(tx.ludiActividadInsignia.createMany).not.toHaveBeenCalled();
  });
});

describe("selectedAchievementCodes", () => {
  it("lee los códigos de las filas incluidas, o nada si no vienen", () => {
    expect(selectedAchievementCodes({ insignias: [{ insignia: { codigo: "sabio" } }], misiones: [] })).toEqual({ badges: ["sabio"], missions: [] });
    expect(selectedAchievementCodes({})).toEqual({ badges: [], missions: [] });
  });
});
