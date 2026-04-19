import { Metadata } from "next";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { getActivityById } from "@/services/activityService";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaClock, FaStar, FaUser, FaCalendar, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import UseTemplateButton from "./UseTemplateButton";
import { ShareActivityButton } from "./ShareActivityButton";
import { DeleteActivityViewButton } from "./DeleteActivityViewButton";
import { LaunchSessionButton } from "./LaunchSessionButton";
import styles from "@/styles/pages/view-activity.module.css";
import MultimediaDisplay from "@/components/activity/MultimediaDisplay";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const activityId = parseInt(resolvedParams.id);
  
  if (isNaN(activityId)) {
    return { title: "Actividad no encontrada | LudiGame" };
  }

  const activity = await getActivityById(activityId);

  if (!activity) {
    return { title: "Actividad no encontrada | LudiGame" };
  }

  return {
    title: `${activity.activity.activity_name} | LudiGame`,
  };
}

export default async function ActivityDetailView({ params }: PageProps) {
  const resolvedParams = await params;
  const user = await getCurrentUser();
  

  const activityId = parseInt(resolvedParams.id);
  if (isNaN(activityId)) return <div>ID inválido</div>;

  const activity = await getActivityById(activityId);

  if (!activity) {
    return (
      <div className="container p-5 text-center">
        <h1>Actividad no encontrada</h1>
        <Link href="/dashboard/my-activities" className="btn btn-primary mt-3">Volver</Link>
      </div>
    );
  }

  const isTemplate = activity?.activity?.isTemplate;
  const isPublic = activity?.publico;
  const isOwner = user && activity?.userId === user.id;

  // Require login ONLY if it is a private non-template activity and the user is not the owner
  if (!isTemplate && !isPublic && !isOwner) {
    if (!user) redirect("/auth/login");
    return (
      <div className="container p-5 text-center">
        <h1>Acceso denegado</h1>
        <p>No tienes permiso para ver esta actividad privada.</p>
        <Link href="/dashboard/my-activities" className="btn btn-primary mt-3">Volver a mis actividades</Link>
      </div>
    );
  }

  const isMemory = activity.tipoActividadId === 3;

  const editRoute = activity.tipoActividadId === 1 
      ? `/create/ludiquiz?id=${activity.activityId}`
      : activity.tipoActividadId === 2 
          ? `/create/trueorfalse?id=${activity.activityId}`
          : `/create/ludimemory?id=${activity.activityId}`;

  return (
    <div className={styles.pageContainer}>
      <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
          <Link href={isTemplate ? "/dashboard/templates" : "/dashboard/my-activities"} className={`${styles.backButton} mb-0`}>
            <FaArrowLeft /> {isTemplate ? "Volver a plantillas" : "Volver a mis actividades"}
          </Link>
          <div className="d-flex gap-2">
            {isOwner && !isTemplate && (
              <>
                <LaunchSessionButton activityId={activity.activityId} />
                <ShareActivityButton activityId={activity.activityId} />
                <Link 
                  href={editRoute} 
                  className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm"
                  style={{ borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold' }}
                  title="Editar actividad"
                >
                  <FaEdit />
                </Link>
                <DeleteActivityViewButton 
                  activityId={activity.activityId} 
                  activityName={activity.activity.activity_name} 
                />
              </>
            )}
            {isTemplate && user && (
              <>
                <LaunchSessionButton activityId={activity.activityId} />
                <UseTemplateButton 
                    templateActivityId={activity.activityId} 
                    tipoActividadId={activity.tipoActividadId} 
                    userId={user.id} 
                />
              </>
            )}
          </div>
        </div>

        {/* Header Card */}
        <div className={styles.headerCard}>
          <div className={styles.headerBanner}></div>
          <div className={styles.headerContent}>
            <div className="d-flex justify-content-between align-items-start flex-wrap">
              <div>
                <span className="badge bg-primary mb-2">{activity.tipoActividad.nombre}</span>
                <h1 className={styles.title}>{activity.activity.activity_name}</h1>
                <p className="text-muted">{activity.activity.activity_desc}</p>
              </div>
              <div className="text-end">
                <span className="badge bg-secondary">{activity.publico ? "Público" : "Privado"}</span>
              </div>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <label><FaUser className="me-1" /> Creado por</label>
                <span>{activity.user.nombre}</span>
              </div>
              <div className={styles.metaItem}>
                <label><FaClock className="me-1" /> Tiempo</label>
                <span>{activity.config?.tiempoPreguntaMs ? activity.config.tiempoPreguntaMs / 1000 + " seg" : "N/A"}</span>
              </div>
              <div className={styles.metaItem}>
                <label><FaStar className="me-1" /> Puntos</label>
                <span>{activity.config?.puntajeBase || 0}</span>
              </div>
              <div className={styles.metaItem}>
                <label>Grado</label>
                <span>{activity.grado?.grade_type_name || "N/A"}</span>
              </div>
              <div className={styles.metaItem}>
                <label><FaCalendar className="me-1" /> Fecha</label>
                <span>{new Date(activity.activity.created_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div>
          <h2 className={styles.sectionTitle}>Contenido de la Actividad</h2>

          {isMemory ? (
            <div className={styles.memoryGrid}>
              {activity.memoriaParejas.map((pareja, idx) => (
                <div key={Number(pareja.id)} className={styles.memoryPair}>
                  <h5 className="mb-3 text-muted">Pareja #{idx + 1}</h5>
                  {pareja.tarjetas[0]?.recurso && (
                    <MultimediaDisplay 
                      url={pareja.tarjetas[0].recurso.url} 
                      type="IMAGEN"
                      width={150}
                      height={150}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              {activity.preguntas.map((pregunta, idx) => (
                <div key={Number(pregunta.id)} className={styles.questionCard}>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNumber}>Pregunta {idx + 1}</span>
                    <span className="badge bg-light text-dark">
                      {pregunta.puntaje || activity.config?.puntajeBase} pts
                    </span>
                  </div>
                  <div className={styles.questionBody}>
                    <h3 className={styles.questionText}>{pregunta.enunciado}</h3>
                    
                    {/* Media de la pregunta */}
                    {pregunta.preguntaRecursos.length > 0 && (
                      <div className="mb-4">
                        <MultimediaDisplay 
                          url={pregunta.preguntaRecursos[0].recurso.url}
                          type={pregunta.preguntaRecursos[0].recurso.tipo?.nombre || "IMAGEN"}
                        />
                      </div>
                    )}

                    {/* Opciones */}
                    <div className={styles.optionsGrid}>
                      {pregunta.opciones.map((opcion) => {
                        const isTrueFalse = activity.tipoActividadId === 2;
                        const displayContent = isTrueFalse
                          ? (opcion.indice === 1 ? "Verdadero" : "Falso")
                          : (opcion.texto || (opcion.indice === 1 ? "Verdadero" : "Falso"));

                        return (
                          <div 
                            key={Number(opcion.id)} 
                            className={`${styles.optionCard} ${(opcion.esCorrecta || (opcion as any).es_correcta) ? styles.optionCorrect : styles.optionIncorrect}`}
                          >
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              {((opcion.esCorrecta || (opcion as any).es_correcta)) ? <FaCheck className="text-success" /> : <FaTimes className="text-danger" />}
                              <span style={{ fontWeight: '500' }}>{displayContent}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
