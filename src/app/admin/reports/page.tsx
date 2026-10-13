import { Metadata } from "next";
import getCurrentUser from '@/lib/auth/getCurrentUser';
import { redirect } from 'next/navigation';
import prisma from "@/lib/db";
import { FaChartLine, FaShieldAlt } from "react-icons/fa";
import AdminReportsTable from "./AdminReportsTable";
import AdminReportFilter from "./AdminReportFilter";
import AdminInfoModal from "./AdminInfoModal";
import AdminFollowUpTable from "./AdminFollowUpTable";
import AdminReportViewToggle, { type AdminReportView } from "./AdminReportViewToggle";
import { aggregateFollowUp, type FollowUpSession } from "@/features/followUp/followUp";
import styles from "@/styles/pages/my-activities.module.css";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("adminReports.title"), description: t("adminReports.description") });
}

interface PageProps {
  searchParams: Promise<{
    search?: string;
    grade?: string;
    dateRange?: string;
    view?: string;
  }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  
  if (!user || user.rol.nombre !== 'ADMIN') {
    return redirect('/dashboard');
  }

  const resolvedSearchParams = await searchParams;
  const t = await getTranslations("AdminSessions");
  const searchFilter = resolvedSearchParams.search?.toLowerCase();
  const gradeFilter = resolvedSearchParams.grade;
  const dateFilter = resolvedSearchParams.dateRange;
  const view: AdminReportView = resolvedSearchParams.view === "sessions" ? "sessions" : "activities";

  // Solo sesiones que empezaron: en la BD conviven "lobby" y el heredado "ESPERANDO" (ver sessionState.ts).
  const whereCondition: any = {
    NOT: { estado: { in: ["lobby", "ESPERANDO"] } }
  };

  if (searchFilter) {
    whereCondition.OR = [
      {
        LUDI_ACTIVIDAD: {
          activity: {
            activity_name: { contains: searchFilter }
          }
        }
      },
      {
        user: {
          nombre: { contains: searchFilter }
        }
      }
    ];
  }

  if (gradeFilter) {
    // Assuming grade is the ID or we map it
    whereCondition.LUDI_ACTIVIDAD = {
      ...whereCondition.LUDI_ACTIVIDAD,
      gradoId: parseInt(gradeFilter)
    };
  }

  if (dateFilter) {
    const days = parseInt(dateFilter);
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    whereCondition.creada_en = { gte: dateLimit };
  }

  // Fetch: Join LudiUser, Activity, Session and Submission
  const sessionsRaw = await prisma.lUDI_SESION.findMany({
    where: whereCondition,
    orderBy: { finalizada_en: 'desc' },
    include: {
      user: true,
      LUDI_ACTIVIDAD: {
        include: {
            grado: true,
            activity: true,
            tipoActividad: true,
            plantillaOrigen: { include: { activity: true } }
        }
      },
      LUDI_SESION_PARTICIPANTE: {
        include: {
            avatar: true,
            respuestas: {
                include: { pregunta: true }
            }
        }
      }
    }
  });

  // Process data for the expandable rows
  const processedSessions = sessionsRaw.map((session: any) => {
    let sumFun = 0;
    let funCount = 0;
    const questionMap: Record<string, { texto: string, correct: number, total: number }> = {};

    session.LUDI_SESION_PARTICIPANTE.forEach((p: any) => {
        if (p.studentEnjoyment) {
            sumFun += p.studentEnjoyment;
            funCount++;
        }
        
        p.respuestas.forEach((r: any) => {
            const qId = r.preguntaId.toString();
            if (!questionMap[qId]) {
                questionMap[qId] = { texto: r.pregunta?.enunciado || t("question"), correct: 0, total: 0 };
            }
            questionMap[qId].total++;
            if (r.esCorrecta) questionMap[qId].correct++;
        });
    });

    const questionStats = Object.values(questionMap).map(q => {
        const acierto = q.total > 0 ? Math.round((q.correct / q.total) * 100) : 0;
        const error = 100 - acierto;
        return { texto: q.texto, acierto, error };
    });

    // Find hardest question
    let hardestQuestion = null;
    if (questionStats.length > 0) {
      hardestQuestion = questionStats.reduce((prev, current) => 
        (current.error > prev.error) ? current : prev
      );
    }

    return {
        ...session,
        avgStudentFun: funCount > 0 ? (sumFun / funCount) : null,
        hardestQuestion: hardestQuestion && hardestQuestion.error > 0 ? hardestQuestion : null,
        questionStats
    };
  });

  // Las copias de una plantilla cuentan como la misma actividad, aunque sean de docentes distintos.
  const followUpSessions: FollowUpSession[] = sessionsRaw.map((session) => {
    const actividad = session.LUDI_ACTIVIDAD;
    const origen = actividad.plantillaOrigen;
    return {
      groupActivityId: origen?.activityId ?? actividad.activityId,
      groupActivityName: origen?.activity.activity_name ?? actividad.activity.activity_name,
      fromTemplate: origen !== null,
      activityType: actividad.tipoActividad.nombre,
      gradeId: actividad.gradoId,
      gradeName: actividad.grado?.grade_type_name ?? null,
      teacherId: session.userId,
      teacherRating: session.teacherRating,
      objectiveLevel: session.objectiveLevel,
      templateDifficulty: session.templateDifficulty,
      participants: session.LUDI_SESION_PARTICIPANTE.map((p) => ({ studentEnjoyment: p.studentEnjoyment, studentLearning: p.studentLearning })),
    };
  });
  const followUpRows = aggregateFollowUp(followUpSessions);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
      <div className={styles.headerContainer} style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
        <div>
          <h1 className={designStyles.titleLudi} style={{ textAlign: 'left', marginBottom: '10px' }}>
            <FaChartLine className="me-3" aria-hidden="true" /> {t("pageTitle")}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>{t("pageSubtitle")}</p>
        </div>
        <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
          <AdminInfoModal />
        </div>
      </div>

      <div className={styles.filterCard}>
        <AdminReportFilter />
      </div>

      <AdminReportViewToggle current={view} />

      <div className="row">
        <div className="col-12">
            {view === "activities"
              ? <AdminFollowUpTable rows={followUpRows} />
              : <AdminReportsTable sessions={processedSessions} />}
        </div>
      </div>
    </div>
  );
}