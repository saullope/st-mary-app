"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { canAccessActivity } from "@/lib/auth/guards";
import { getTranslations } from "next-intl/server";

export async function softDeleteActivity(activityId: number) {
  try {
    const t = await getTranslations("Errors");
    const user = await getCurrentUser();
    if (!user) return { success: false, error: t("unauthorized") };
    if (!(await canAccessActivity(user, activityId, "owner"))) {
      return { success: false, error: t("deleteForbidden") };
    }

    // Realizamos un update en vez de un delete físico
    await prisma.ludiActividad.update({
      where: { activityId },
      data: { estatus: false },
    });
    
    // Refrescar los datos de la página actual automáticamente
    revalidatePath("/dashboard/my-activities");
    
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar la actividad:", error);
    return { success: false, error: (await getTranslations("Errors"))("deleteFailed") };
  }
}
