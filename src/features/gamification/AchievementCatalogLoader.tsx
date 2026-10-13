import type { ReactNode } from "react";
import { getAchievementCatalog } from "./catalog.server";
import { AchievementCatalogProvider } from "./AchievementCatalogContext";

/** Lee el catálogo en el servidor y lo pone a disposición de los componentes cliente que contiene. */
export async function AchievementCatalogLoader({ children }: { children: ReactNode }) {
  const catalog = await getAchievementCatalog();
  return <AchievementCatalogProvider catalog={catalog}>{children}</AchievementCatalogProvider>;
}
