import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { AchievementCatalogProvider } from "../AchievementCatalogContext";
import { testCatalog } from "./catalogFixture";
import messages from "../../../../messages/es.json";

/** Render con los textos en español y el catálogo de logros, como en la app real. */
export const renderWithAchievements = (ui: ReactElement) =>
  render(
    <NextIntlClientProvider locale="es" messages={messages}>
      <AchievementCatalogProvider catalog={testCatalog}>{ui}</AchievementCatalogProvider>
    </NextIntlClientProvider>
  );
