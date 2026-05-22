import { Metadata } from "next";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { getActivityById } from "@/services/activityService";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaClock, FaStar, FaUser, FaCalendar, FaEdit } from "react-icons/fa";
import UseTemplateButton from "./UseTemplateButton";
import { ShareActivityButton } from "./ShareActivityButton";
import { DeleteActivityViewButton } from "./DeleteActivityViewButton";
import { LaunchSessionButton } from "./LaunchSessionButton";
import styles from "@/styles/pages/view-activity.module.css";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import ActivityContentViewer from "./ActivityContentViewer";

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
        <h1 style={{ color: 'white' }}>Acceso denegado</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>No tienes permiso para ver esta actividad privada.</p>
        <Link href="/dashboard/my-activities" className="btn btn-primary mt-3">Volver a mis actividades</Link>
      </div>
    );
  }

  const editRoute = activity.tipoActividadId === 1 
      ? `/create/ludiquiz?id=${activity.activityId}`
      : activity.tipoActividadId === 2 
          ? `/create/trueorfalse?id=${activity.activityId}`
          : `/create/ludimemory?id=${activity.activityId}`;

  return (
    <div className={styles.pageContainer} style={{ position: 'relative', overflowX: 'hidden' }}>
        {/* Animated Background from Main Layout */}
        <div className={designStyles.bgAnimation}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span 
              key={i} 
              className={designStyles.particle} 
              style={{ 
                left: `${Math.random() * 100}%`, 
                animationDuration: `${16 + Math.random() * 6}s`, 
                animationDelay: `${Math.random() * 5}s` 
              }} 
            />
          ))}
        </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="mb-4">
          <Link href={isTemplate ? "/dashboard/templates" : "/dashboard/my-activities"} className="badge d-inline-flex align-items-center shadow-sm" style={{ background: '#E8E5F7', color: '#1D153A', padding: '0.6rem 1.2rem', borderRadius: '2rem', fontSize: '0.9rem', textDecoration: 'none', border: '1px solid rgba(29, 21, 58, 0.1)', transition: 'all 0.2s ease' }}>
            <FaArrowLeft className="me-2" /> 
            {isTemplate ? "Plantillas" : "Mis Actividades"} <span className="mx-2" style={{ opacity: 0.5 }}>/</span> <span className="fw-bold">{activity.activity.activity_name}</span>
          </Link>
        </div>
        <div className="d-flex justify-content-end align-items-center mb-4">
          <div className="d-flex gap-2">
            {isOwner && !isTemplate && (
              <>
                <LaunchSessionButton activityId={activity.activityId} />
                <ShareActivityButton activityId={activity.activityId} />
                <Link 
                  href={editRoute} 
                  className="btn d-flex align-items-center gap-2 shadow-sm"
                  style={{ background: 'white', color: '#1D153A', borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold', border: '1px solid rgba(29, 21, 58, 0.1)' }}
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
                <span className="badge mb-2" style={{ background: 'rgba(106, 75, 255, 0.1)', color: '#6a4bff', border: '1px solid rgba(106, 75, 255, 0.2)', padding: '0.4rem 1rem', borderRadius: '20px' }}>
                    {activity.tipoActividad.nombre}
                </span>
                <h1 className={styles.title}>{activity.activity.activity_name}</h1>
                <p style={{ color: '#4a4266' }}>{activity.activity.activity_desc}</p>
              </div>
              <div className="text-end">
                <span className="badge" style={{ background: activity.publico ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)', color: activity.publico ? '#198754' : '#dc3545', border: `1px solid ${activity.publico ? 'rgba(25, 135, 84, 0.2)' : 'rgba(220, 53, 69, 0.2)'}`, padding: '0.4rem 1rem', borderRadius: '20px' }}>
                    {activity.publico ? "Público" : "Privado"}
                </span>
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
                <label><FaStar className="me-1" style={{ color: '#e5b869' }} /> Puntos</label>
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

        {/* Content Section via Client Component */}
        <ActivityContentViewer activity={activity} />
        
      </div>
    </div>
  );
}
