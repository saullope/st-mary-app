import { redirect } from "next/navigation";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import prisma from "@/lib/db";
import LiveDashboardClient from "./LiveDashboardClient";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("live.title"), description: t("live.description") });
}

export default async function LiveDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const sessionId = BigInt(resolvedParams.id);
  const session = await prisma.lUDI_SESION.findUnique({
    where: { id: sessionId },
    select: {
      userId: true,
      LUDI_ACTIVIDAD: { select: { gradoId: true, plantillaOrigenId: true } },
      user: { select: { config: { select: { enableTeacherEvaluation: true } } } },
    },
  });

  if (!session) {
    redirect("/dashboard/my-activities");
  }

  // Verify that the current user is the teacher who created this session
  if (session.userId !== user.id) {
    redirect("/dashboard/my-activities");
  }

  return (
    <LiveDashboardClient
      sessionId={resolvedParams.id}
      gradeId={session.LUDI_ACTIVIDAD.gradoId}
      fromTemplate={session.LUDI_ACTIVIDAD.plantillaOrigenId !== null}
      askEvaluation={session.user.config?.enableTeacherEvaluation !== false}
    />
  );
}
