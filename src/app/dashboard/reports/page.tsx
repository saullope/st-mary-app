import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaCalendarAlt, FaUsers, FaChartBar } from "react-icons/fa";
import "@/styles/pages/reports.css";
import styles from "@/styles/pages/my-activities.module.css";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import ReportFilter from "@/components/dashboard/ReportFilter";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export default async function ReportsHubPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

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
            <FaChartBar className="me-3" /> Reportes y Análisis
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Revisa el progreso, resultados y estadísticas detalladas de las sesiones de tus estudiantes.</p>
        </div>
      </div>

      <div className={styles.filterCard}>
        <ReportFilter />
      </div>

      <div className="row g-4 mt-2">
        {sessions.map((session: any) => {
          const totalParticipants = session.LUDI_SESION_PARTICIPANTE.length;
          
          // Calculate Reliability Score (Average Score)
          let totalScore = 0;
          let correctAnswers = 0;
          let totalAnswers = 0;

          session.LUDI_SESION_PARTICIPANTE.forEach((p: any) => {
            totalScore += p.puntaje_total;
            p.respuestas.forEach((r: any) => {
              totalAnswers++;
              if (r.esCorrecta) correctAnswers++;
            });
          });

          const averageScore = totalParticipants > 0 ? Math.round(totalScore / totalParticipants) : 0;
          const reliabilityScore = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

          // Normalize badge logic
          let statusLabel = session.estado.toUpperCase();
          let badgeColor = "#4a4266";
          let badgeBg = "rgba(29, 21, 58, 0.08)";
          if (["ESPERANDO", "LOBBY"].includes(statusLabel)) {
             statusLabel = "EN ESPERA";
             badgeColor = "#e5b869"; // Gold
             badgeBg = "rgba(220, 165, 80, 0.2)";
          } else if (["ACTIVA", "EN_CURSO"].includes(statusLabel)) {
             statusLabel = "EN CURSO";
             badgeColor = "#1D153A"; 
             badgeBg = "rgba(29, 21, 58, 0.1)";
          } else if (statusLabel === "FINALIZADA") {
             badgeColor = "#198754"; // Success
             badgeBg = "rgba(25, 135, 84, 0.15)";
          }

          return (
            <div key={session.id.toString()} className="col-12 col-md-6 col-lg-4">
              <Link href={`/dashboard/reports/${session.id}`} className="text-decoration-none h-100 d-block">
                <div className={styles.activityCard}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '70%', color: '#1D153A' }} title={session.LUDI_ACTIVIDAD.activity.activity_name}>
                      {session.LUDI_ACTIVIDAD.activity.activity_name}
                    </h5>
                    <span style={{ 
                        background: badgeBg, 
                        color: badgeColor, 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        border: `1px solid ${badgeColor}` 
                    }}>
                      {statusLabel}
                    </span>
                  </div>
                  
                  <p className="small mb-4" style={{ color: '#4a4266' }}>
                    <FaCalendarAlt className="me-2" />
                    {new Date(session.creada_en).toLocaleDateString()}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <p className="mb-0 small" style={{ color: '#4a4266' }}>Promedio de Clase</p>
                      <h4 className="fw-bold mb-0" style={{ color: '#1D153A' }}>{averageScore} pts</h4>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 small" style={{ color: '#4a4266' }}>Participantes</p>
                      <h4 className="fw-bold mb-0" style={{ color: '#1D153A' }}>
                        <FaUsers className="me-2" size={16} style={{ color: 'rgba(29, 21, 58, 0.5)' }} />
                        {totalParticipants}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-3" style={{ borderTop: '1px dashed rgba(29, 21, 58, 0.1)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-bold" style={{ color: '#4a4266' }}>Índice de Efectividad</span>
                      <span className="small fw-bold" style={{ color: reliabilityScore >= 70 ? '#198754' : reliabilityScore >= 50 ? '#e5b869' : '#dc3545' }}>
                        {reliabilityScore}%
                      </span>
                    </div>
                    <div className="progress shadow-sm" style={{ height: '8px', backgroundColor: 'rgba(29, 21, 58, 0.1)' }}>
                      <div 
                        className="progress-bar" 
                        style={{ 
                            width: `${reliabilityScore}%`, 
                            backgroundColor: reliabilityScore >= 70 ? '#198754' : reliabilityScore >= 50 ? '#e5b869' : '#dc3545' 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className={styles.emptyStateCard}>
            <div className={styles.emptyStateIcon}>📊</div>
            <h3><span className={designStyles.star}>★</span> No se encontraron sesiones</h3>
            <p>Intenta ajustar los filtros o juega actividades con tus estudiantes para generar reportes.</p>
          </div>
        )}
      </div>
    </div>
  );
}