import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import ReportDetailClient from "./ReportDetailClient";
import "@/styles/pages/reports.css";

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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
          }
        },
        orderBy: { puntaje_total: 'desc' }
      }
    }
  });

  if (!session) notFound();

  const participantes = session.LUDI_SESION_PARTICIPANTE;

  // 1. Insights Calculations
  let totalTime = 0;
  let totalResponses = 0;
  const questionStats: Record<string, { failed: number; total: number; text: string }> = {};

  participantes.forEach(p => {
    p.respuestas.forEach(r => {
      totalTime += r.tiempoRespuestaMs || 0;
      totalResponses++;

      const qId = r.preguntaId.toString();
      if (!questionStats[qId]) {
        questionStats[qId] = { failed: 0, total: 0, text: r.pregunta?.enunciado || "Pregunta" };
      }
      questionStats[qId].total++;
      if (!r.esCorrecta) {
        questionStats[qId].failed++;
      }
    });
  });

  const avgTimeSeconds = totalResponses > 0 ? Math.round((totalTime / totalResponses) / 1000) : 0;

  // Find Hardest Question (highest failure rate)
  const questionStatsArray = Object.values(questionStats).filter(s => s.total > 0);
  const hardestQuestionData = questionStatsArray.length > 0 
    ? questionStatsArray.reduce((prev, current) => 
        (current.failed / current.total) > (prev.failed / prev.total) ? current : prev
      )
    : null;
  
  const hardestRate = hardestQuestionData ? Math.round((hardestQuestionData.failed / hardestQuestionData.total) * 100) : 0;
  const hardestQuestion = hardestQuestionData ? { text: hardestQuestionData.text, rate: hardestRate } : null;

  // Average class score to determine Trends
  const avgClassScore = participantes.length > 0 
    ? participantes.reduce((acc, p) => acc + p.puntaje_total, 0) / participantes.length 
    : 0;

  const avgClassTotalTimeMs = participantes.length > 0 ? totalTime / participantes.length : 0;

  return (
    <ReportDetailClient 
      session={session}
      participantes={participantes}
      avgTimeSeconds={avgTimeSeconds}
      hardestQuestion={hardestQuestion}
      hardestRate={hardestRate}
      avgClassScore={avgClassScore}
      avgClassTotalTimeMs={avgClassTotalTimeMs}
    />
  );
}