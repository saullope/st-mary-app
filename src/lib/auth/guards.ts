import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import getCurrentUser from "./getCurrentUser";

// Debe coincidir con LUDI_ROL (prisma/seed.ts).
export const ADMIN_ROLE_ID = 1;

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export const isAdmin = (user: Pick<AuthUser, "rolId">) => user.rolId === ADMIN_ROLE_ID;

/** Páginas y layouts: usuario verificado o redirección al login. */
export async function requireUser(redirectTo?: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : "/auth/login");
  }
  return user;
}

/** Páginas de administración: exige rol administrador. */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (!isAdmin(user)) redirect("/dashboard");
  return user;
}

type ActivityAccess = "owner" | "play";

/**
 * Comprueba si el usuario puede usar una actividad. "owner": editarla o borrarla
 * (dueño o administrador). "play": lanzarla, que además permite plantillas y
 * actividades públicas.
 */
export async function canAccessActivity(user: AuthUser, activityId: number, access: ActivityAccess): Promise<boolean> {
  const actividad = await prisma.ludiActividad.findUnique({
    where: { activityId },
    select: { userId: true, publico: true, estatus: true, activity: { select: { isTemplate: true } } },
  });
  if (!actividad || !actividad.estatus) return false;
  if (actividad.userId === user.id || isAdmin(user)) return true;
  return access === "play" && (actividad.publico || Boolean(actividad.activity?.isTemplate));
}
