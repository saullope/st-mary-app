import { Metadata } from "next";
import getSession from '@/lib/auth/getSession'; 
import getCurrentUser from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';
import DashboardHub from "@/components/dashboard/DashboardHub";
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

  // Fetch a recent activity to act as "Draft" or recent work
  const drafts = await prisma.ludiActividad.findMany({
    where: { userId: user.id },
    orderBy: { activityId: 'desc' },
    take: 1,
    include: {
      activity: true,
      tipoActividad: true
    }
  });

  return (
    <DashboardHub userName={user.nombre} drafts={drafts} />
  );
}