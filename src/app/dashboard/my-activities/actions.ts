"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function softDeleteActivity(activityId: number) {
  try {
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
    return { success: false, error: "No se pudo eliminar la actividad" };
  }
}
