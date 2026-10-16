import type { ResumeActivity } from "@/types/descriptionActivity";
import { Metadata } from "next";
import { redirect } from 'next/navigation';
import DashboardHub from "@/components/dashboard/DashboardHub";
import getCurrentUser from '@/lib/auth/getCurrentUser';
import getSession from '@/lib/auth/getSession'; 
import prisma from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";


export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("dashboard.title"), description: t("dashboard.description") });
}

export default async function Dashboard() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  // La última actividad que editó (no la última creada), con el mismo filtro que Mis actividades.
  const latest = await prisma.ludiActividad.findFirst({
    where: { userId: user.id, estatus: true, activity: { isTemplate: false } },
    orderBy: { activity: { modified_date: "desc" } },
    select: {
      activityId: true,
      tipoActividadId: true,
      gradoId: true,
      activity: { select: { activity_name: true, modified_date: true } },
      _count: { select: { preguntas: { where: { activo: true } }, memoriaParejas: true } },
    },
  });

  const lastActivity: ResumeActivity | null = latest
    ? {
        activityId: latest.activityId,
        typeId: latest.tipoActividadId,
        gradeId: latest.gradoId,
        title: latest.activity.activity_name,
        modifiedAt: latest.activity.modified_date.toISOString(),
        // LudiMemory guarda imágenes (parejas); los demás tipos, preguntas o bloques.
        items: latest.tipoActividadId === 3 ? latest._count.memoriaParejas : latest._count.preguntas,
      }
    : null;

  return (
    <DashboardHub userName={user.nombre} lastActivity={lastActivity} />
  );
}