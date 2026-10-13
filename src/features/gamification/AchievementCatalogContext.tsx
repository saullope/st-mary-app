"use client";

import { createContext, useContext, type ReactNode } from "react";
import { EMPTY_CATALOG, type AchievementCatalog } from "./catalog";

const AchievementCatalogContext = createContext<AchievementCatalog>(EMPTY_CATALOG);

/** Lo monta AchievementCatalogLoader con el catálogo leído en el servidor. */
export const AchievementCatalogProvider = ({ catalog, children }: { catalog: AchievementCatalog; children: ReactNode }) => (
  <AchievementCatalogContext.Provider value={catalog}>{children}</AchievementCatalogContext.Provider>
);

export const useAchievementCatalog = () => useContext(AchievementCatalogContext);
