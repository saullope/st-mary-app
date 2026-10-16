import "@/styles/pages/reports.css";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db";
import ReportDetailClient from "./ReportDetailClient";
import { isPendingReview } from "@/features/form/formQuestions";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { isAdmin } from "@/lib/auth/guards";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const notFoundMeta = () => pageMetadata({ title: t("reportNotFound.title"), description: t("reportNotFound.description") });
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !/^\d+$/.test(id)) return notFoundMeta();
  const session = await prisma.lUDI_SESION.findUnique({
    where: { id: BigInt(id) },
    select: { userId: true, LUDI_ACTIVIDAD: { select: { activity: { select: { activity_name: true } } } } },
  });
  // El nombre de la actividad solo se muestra a quien puede ver el reporte.
  if (!session || (session.userId !== user.id && !isAdmin(user))) return notFoundMeta();
  const activity = session.LUDI_ACTIVIDAD.activity.activity_name;
  return pageMetadata({ title: t("reportDetail.title", { activity }), description: t("reportDetail.description", { activity }) });
}

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?redirect=${encodeURIComponent(`/dashboard/reports/${resolvedParams.id}`)}`);
  if (!/^\d+$/.test(resolvedParams.id)) notFound();
  const sesionId = BigInt(resolvedParams.id);

  const session = await prisma.lUDI_SESION.findUnique({
    where: { id: sesionId },
    include: {
      LUDI_ACTIVIDAD: {
        include: {
          activity: true,
          preguntas: true
        }
      },
      LUDI_SESION_PARTICIPANTE: {
        include: {
          avatar: true,
          respuestas: {
            include: {
              pregunta: {
                include: { opciones: true }
              },
              opcion: true
            },
            orderBy: { id: 'asc' }
          },
          // Con su fila del catálogo: una insignia retirada después sigue apareciendo a quien la ganó.
          insignias: { include: { insignia: true }, orderBy: { otorgadoEn: 'asc' } },
          misiones: { include: { mision: true }, orderBy: { otorgadoEn: 'asc' } }
        },
        orderBy: { puntaje_total: 'desc' }
      },
      user: {
        include: { config: true }
      }
    }
  });

  // Solo el docente de la sesión (o un administrador) ve sus resultados.
  if (!session || (session.userId !== user.id && !isAdmin(user))) notFound();

  const participantes = session.LUDI_SESION_PARTICIPANTE;
  const t = await getTranslations("reportsDetails");

  // 1. Insights Calculations
  let totalTime = 0;
  let totalResponses = 0;
  const questionStats: Record<string, { failed: number; total: number; text: string }> = {};

  participantes.forEach(p => {
    p.respuestas.forEach(r => {
      totalTime += r.tiempoRespuestaMs || 0;
      totalResponses++;
      // Sin revisar todavía no es acierto ni fallo.
      if (isPendingReview(r)) return;

      const qId = r.preguntaId.toString();
      if (!questionStats[qId]) {
        questionStats[qId] = { failed: 0, total: 0, text: r.pregunta?.enunciado || t("question") };
      }
      questionStats[qId].total++;
      if (!r.esCorrecta) {
        questionStats[qId].failed++;
      }
    });
  });

  const avgTimeSeconds = totalResponses > 0 ? Math.round((totalTime / totalResponses) / 1000) : 0;

  // Pregunta mas dificil
  const questionStatsArray = Object.values(questionStats).filter(s => s.total > 0);
  const hardestQuestionData = questionStatsArray.length > 0 
    ? questionStatsArray.reduce((prev, current) => 
        (current.failed / current.total) > (prev.failed / prev.total) ? current : prev
      )
    : null;
  
  const hardestRate = hardestQuestionData ? Math.round((hardestQuestionData.failed / hardestQuestionData.total) * 100) : 0;
  const hardestQuestion = hardestQuestionData ? { text: hardestQuestionData.text, rate: hardestRate } : null;

  // Promedio de puntaje de la clase y tiempo total promedio
  const avgClassScore = participantes.length > 0 
    ? participantes.reduce((acc, p) => acc + p.puntaje_total, 0) / participantes.length 
    : 0;

  const avgClassTotalTimeMs = participantes.length > 0 ? totalTime / participantes.length : 0;
  const enableTeacherEvaluation = session.user?.config?.enableTeacherEvaluation !== false;

  return (
    <ReportDetailClient
      session={session}
      participantes={participantes}
      avgTimeSeconds={avgTimeSeconds}
      hardestQuestion={hardestQuestion}
      hardestRate={hardestRate}
      avgClassScore={avgClassScore}
      avgClassTotalTimeMs={avgClassTotalTimeMs}
      enableTeacherEvaluation={enableTeacherEvaluation}
    />
  );
}