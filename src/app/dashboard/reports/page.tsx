import "@/styles/pages/reports.css";
import { FaChartBar } from "react-icons/fa";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import Link from "next/link";
import prisma from "@/lib/db";
import ReportFilter from "@/components/dashboard/ReportFilter";
import ActivityCollection from "@/components/dashboard/collection/ActivityCollection";
import SessionReportCard from "@/components/dashboard/reports/SessionReportCard";
import styles from "@/styles/pages/my-activities.module.css";
import { pageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reports");
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ReportsHubPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const tReports = await getTranslations("reports");

  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams.status;
  const searchFilter = resolvedSearchParams.search?.toLowerCase();

  // Determine Prisma where conditions
  const whereCondition: any = { userId: user.id };

  if (statusFilter) {
    if (statusFilter === "ESPERANDO") {
      whereCondition.estado = { in: ["ESPERANDO", "lobby"] };
    } else if (statusFilter === "ACTIVA") {
      whereCondition.estado = { in: ["activa", "ACTIVA", "EN_CURSO"] };
    } else if (statusFilter === "FINALIZADA") {
      whereCondition.estado = "FINALIZADA";
    }
  }

  if (searchFilter) {
    whereCondition.LUDI_ACTIVIDAD = {
      activity: {
        activity_name: {
          contains: searchFilter
        }
      }
    };
  }

  // Fetch recent sessions for this user's activities
  const sessions = await prisma.lUDI_SESION.findMany({
    where: whereCondition,
    orderBy: { creada_en: 'desc' },
    include: {
      LUDI_ACTIVIDAD: {
        include: { activity: true, tipoActividad: true }
      },
      LUDI_SESION_PARTICIPANTE: {
        include: {
          respuestas: true
        }
      }
    }
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
      <div className={styles.headerContainer} style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
        <div>
          <h1 className={designStyles.titleLudi} style={{ textAlign: 'left', marginBottom: '10px' }}>
            <FaChartBar className="me-3" /> {tReports('metaTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>{tReports('metaDescription')}</p>
        </div>
      </div>

      <div className={styles.filterCard}>
        <ReportFilter />
      </div>

      {sessions.length > 0 ? (
        <ActivityCollection storageKey="ludi.view.reports">
          {sessions.map((session) => (
            <SessionReportCard
              key={session.id.toString()}
              sessionId={session.id.toString()}
              activityName={session.LUDI_ACTIVIDAD.activity.activity_name}
              typeId={session.LUDI_ACTIVIDAD.tipoActividadId}
              estado={session.estado}
              createdAt={session.creada_en}
              participants={session.LUDI_SESION_PARTICIPANTE}
            />
          ))}
        </ActivityCollection>
      ) : (
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyStateIcon} aria-hidden="true">📊</div>
          <h3><span className={designStyles.star} aria-hidden="true">★</span> {tReports('noSession')}</h3>
          <p>{tReports('noSessionDesc')}</p>
        </div>
      )}
    </div>
  );
}