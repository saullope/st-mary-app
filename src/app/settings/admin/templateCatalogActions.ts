"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { isAdmin } from "@/lib/auth/guards";
import { syncTemplateCatalog, type CatalogSyncReport } from "@/features/templates/templateCatalog.server";

/** Carga el catálogo de plantillas del repositorio en la base (solo administradores). */
export async function syncTemplatesAction(): Promise<{ report: CatalogSyncReport } | { error: string }> {
  const t = await getTranslations("Errors");
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return { error: t("unauthorized") };
  try {
    const report = await syncTemplateCatalog(user.id);
    revalidatePath("/dashboard/templates");
    return { report };
  } catch (error) {
    console.error("Error syncing template catalog:", error);
    return { error: t("server") };
  }
}
