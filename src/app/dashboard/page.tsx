import { DraftActivityResult } from "@/types/descriptionActivity";
import { Metadata } from "next";
import { redirect } from 'next/navigation';
import DashboardHub from "@/components/dashboard/DashboardHub";
import getCurrentUser from '@/lib/auth/getCurrentUser';
import getSession from '@/lib/auth/getSession'; 
import prisma from "@/lib/db";


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Dashboard | LudiGame`,
    description: 'Centro de creación educativa'
  };
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

const rawDrafts = await prisma.ludiActividad.findMany({
  where: { userId: user.id },
  orderBy: { activityId: 'desc' },
  take: 1,
  select: {
    activityId: true,
    userId: true,
    gradoId: true,
    temaId: true,
    publico: true,
    estatus: true,
    tipoActividad: { // <-- Nombre exacto del campo de relación
      select: {
        nombre: true,
      },
    },
  },
});

const drafts: DraftActivityResult[] = rawDrafts.map((draft) => ({
  activity_id: Number(draft.activityId),
  tipo_activity_id: draft.tipoActividad?.nombre?.toLowerCase() ?? null,
  user_id: draft.userId,
  grado_id: draft.gradoId !== null ? Number(draft.gradoId) : null,
  tema_id: draft.temaId !== null ? Number(draft.temaId) : null,
  publico: Boolean(draft.publico),
  estatus: String(draft.estatus),
}));

  return (
    <DashboardHub userName={user.nombre} drafts={drafts} />
  );
}