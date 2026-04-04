import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import getSession from "@/lib/auth/getSession";
import prisma from "@/lib/db";
import ProfileClient from "./ProfileClient";
import { getActivityTypes } from "@/services/activityService";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    typeId?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const targetUserId = resolvedParams.id;
  
  const targetUser = await prisma.ludiUser.findFirst({
    where: {
      OR: [
        { firebaseUid: targetUserId },
        { id: targetUserId }
      ]
    },
    select: { nombre: true }
  });

  return {
    title: targetUser ? `Perfil de ${targetUser.nombre} | LudiGame` : 'Perfil no encontrado | LudiGame',
  };
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const currentUser = await getCurrentUser();
  const session = await getSession();

  if (!currentUser || !session) {
    redirect("/auth/login");
  }

  const resolvedParams = await params;
  const targetUserId = resolvedParams.id;

  const targetUser = await prisma.ludiUser.findFirst({
    where: {
      OR: [
        { firebaseUid: targetUserId },
        { id: targetUserId }
      ]
    },
    include: {
      rol: { select: { nombre: true } }
    }
  });

  if (!targetUser) {
    return notFound();
  }

  const isOwnProfile = currentUser.id === targetUser.id || currentUser.firebaseUid === targetUser.firebaseUid;

  const resolvedSearchParams = await searchParams;
  const types = await getActivityTypes();
  const selectedTypeId = resolvedSearchParams.typeId ? parseInt(resolvedSearchParams.typeId) : undefined;
  const searchQuery = resolvedSearchParams.search;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const limit = resolvedSearchParams.limit ? parseInt(resolvedSearchParams.limit) : 6;

  const skip = (page - 1) * limit;

  const whereClause: any = {
    userId: targetUser.id,
    estatus: true,
    activity: {
      isTemplate: false
    }
  };

  if (!isOwnProfile) {
    whereClause.publico = true;
  }

  if (selectedTypeId) {
    whereClause.tipoActividadId = selectedTypeId;
  }

  if (searchQuery) {
    whereClause.activity = {
      ...whereClause.activity,
      activity_name: { contains: searchQuery }
    };
  }

  const [activities, total] = await prisma.$transaction([
    prisma.ludiActividad.findMany({
      where: whereClause,
      include: {
        tipoActividad: true,
        grado: true,
        activity: true,
        user: { select: { nombre: true, email: true } },
      },
      orderBy: { activityId: 'desc' },
      skip,
      take: limit,
    }),
    prisma.ludiActividad.count({ where: whereClause })
  ]);

  const serializedActivities = activities.map(act => ({
    ...act,
    temaId: act.temaId?.toString() || null,
  }));

  let profilePicture = '/images/profile.png';
  if (isOwnProfile && session.picture) {
    profilePicture = session.picture;
  }

  return (
    <ProfileClient 
      targetUser={{
        id: targetUser.id,
        nombre: targetUser.nombre,
        email: targetUser.email || '',
        rol: targetUser.rol.nombre,
        createdAt: targetUser.createdAt.toISOString()
      }}
      profilePicture={profilePicture}
      isOwnProfile={isOwnProfile}
      activities={serializedActivities}
      totalActivities={total}
      types={types}
      searchParams={{
        typeId: selectedTypeId,
        searchQuery,
        page,
        limit
      }}
      isAdmin={currentUser.rol.nombre === 'ADMIN'}
    />
  );
}