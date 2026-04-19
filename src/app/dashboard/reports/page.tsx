import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import "@/styles/pages/reports.css";
import styles from "@/styles/pages/my-activities.module.css";
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
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <div>
          <h1 className={styles.headerTitle}>Reportes y Análisis</h1>
          <p className="text-muted mb-0">Revisa el progreso, resultados y estadísticas detalladas de las sesiones de tus estudiantes.</p>
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
          let badgeClass = "bg-primary";
          if (["ESPERANDO", "LOBBY"].includes(statusLabel)) {
             statusLabel = "EN ESPERA";
             badgeClass = "bg-warning text-dark";
          } else if (["ACTIVA", "EN_CURSO"].includes(statusLabel)) {
             statusLabel = "EN CURSO";
             badgeClass = "bg-info text-dark";
          } else if (statusLabel === "FINALIZADA") {
             badgeClass = "bg-success";
          }

          return (
            <div key={session.id.toString()} className="col-12 col-md-6 col-lg-4">
              <Link href={`/dashboard/reports/${session.id}`} className="text-decoration-none">
                <div className={`card h-100 border-0 report-card border-act-${session.LUDI_ACTIVIDAD.tipoActividadId}`} style={{ borderRadius: '15px', cursor: 'pointer' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: '70%' }} title={session.LUDI_ACTIVIDAD.activity.activity_name}>
                        {session.LUDI_ACTIVIDAD.activity.activity_name}
                      </h5>
                      <span className={`badge ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                    
                    <p className="text-muted small mb-4">
                      <FaCalendarAlt className="me-2" />
                      {new Date(session.creada_en).toLocaleDateString()}
                    </p>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <p className="mb-0 text-muted small">Promedio de Clase</p>
                        <h4 className="fw-bold text-primary mb-0">{averageScore} pts</h4>
                      </div>
                      <div className="text-end">
                        <p className="mb-0 text-muted small">Participantes</p>
                        <h4 className="fw-bold text-dark mb-0">
                          <FaUsers className="me-2 text-secondary" size={16} />
                          {totalParticipants}
                        </h4>
                      </div>
                    </div>

                    <div className="pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted fw-bold">Índice de Efectividad</span>
                        <span className={`small fw-bold ${reliabilityScore >= 70 ? 'text-success' : reliabilityScore >= 50 ? 'text-warning' : 'text-danger'}`}>
                          {reliabilityScore}%
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${reliabilityScore >= 70 ? 'bg-success' : reliabilityScore >= 50 ? 'bg-warning' : 'bg-danger'}`} 
                          style={{ width: `${reliabilityScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="col-12 text-center py-5">
            <h3 className="text-muted">No se encontraron sesiones.</h3>
            <p>Intenta ajustar los filtros o juega actividades con tus estudiantes.</p>
          </div>
        )}
      </div>
    </div>
  );
}