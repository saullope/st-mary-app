import { Metadata } from "next";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import getSession from "@/lib/auth/getSession";
import { getActivityTypes, getUserActivities } from "@/services/activityService";
import ActivityFilter from "@/components/dashboard/ActivityFilter";
import CopyableCode from "@/components/dashboard/CopyableCode";
import CreatorCard from "@/components/dashboard/CreatorCard";
import ExportActivitiesButton from "@/components/dashboard/ExportActivitiesButton";
import NewActivityButton from "@/components/dashboard/NewActivityButton";
import PaginationControls from "@/components/dashboard/PaginationControls";
import { redirect } from "next/navigation";
import { FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import styles from "@/styles/pages/my-activities.module.css";

export const metadata: Metadata = {
  title: "Mis Actividades | LudiGame",
  description: "Gestión de actividades creadas por el docente",
};

interface PageProps {
  searchParams: {
    typeId?: string;
    search?: string;
    page?: string;
    limit?: string;
  };
}

export default async function MyActivities({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const session = await getSession();

  if (!user || !session) {
    redirect("/auth/login");
  }

  // Fetch Data
  const types = await getActivityTypes();
  const selectedTypeId = searchParams.typeId ? parseInt(searchParams.typeId) : undefined;
  const searchQuery = searchParams.search;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit) : 5;
  
  const { activities, total } = await getUserActivities(user.id, selectedTypeId, searchQuery, page, limit);

  const getGradeLabel = (gradeName?: string) => {

    if (!gradeName) return "N/A";
    const lower = gradeName.toLowerCase();
    // Mapa de traducción flexible
    if (lower.includes("first") || lower.includes("1")) return "Primero";
    if (lower.includes("second") || lower.includes("2")) return "Segundo";
    if (lower.includes("third") || lower.includes("3")) return "Tercero";
    return gradeName; // Fallback
  };

  const getTypeBadgeClass = (id: number) => {
    switch(id) {
      case 1: return styles.badgeQuiz;
      case 2: return styles.badgeTF;
      case 3: return styles.badgeMemory;
      default: return "bg-light text-dark";
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <div>
          <h1 className={styles.headerTitle}>Mis Actividades</h1>
          <p className="text-muted mb-0">Gestiona y organiza tus recursos educativos</p>
        </div>
        <div className="d-flex gap-3">
          <ExportActivitiesButton activities={activities} />
          <NewActivityButton />
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className={styles.filterCard}>
        <ActivityFilter types={types} />
      </div>

      {/* Tabla de Actividades */}
      <div className={styles.tableCard}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className={styles.tableHeader}>
              <tr>
                <th scope="col" className="ps-4">Código</th>
                <th scope="col">Nombre</th>
                <th scope="col">Tipo</th>
                <th scope="col">Grado</th>
                <th scope="col">Creador</th>
                <th scope="col" className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities.map((act: any) => (
                  <tr key={act.activityId} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ps-4`}>
                      <CopyableCode code={act.activityId} />
                    </td>
                    <td className={styles.tableCell}>
                      <Link href={`/views/activity/${act.activityId}`} className="text-decoration-none">
                        <span className={`fw-bold text-dark ${styles.activityLink}`}>
                          {act.activity.activity_name}
                        </span>
                      </Link>
                      <small className="text-muted">
                        Creado el {new Date(act.activity.created_date).toLocaleDateString()}
                      </small>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badgeType} ${getTypeBadgeClass(act.tipoActividadId)}`}>
                        {act.tipoActividad.nombre}
                      </span>
                    </td>
                    <td className={styles.tableCell}>{getGradeLabel(act.grado?.grade_type_name)}</td>
                    <td className={styles.tableCell}>
                      <CreatorCard 
                        name={act.user.nombre} 
                        email={act.user.email} 
                        pictureUrl={session.picture}
                        isAdmin={user.rol.nombre === 'ADMIN'}
                      />
                    </td>
                    <td className={`${styles.tableCell} text-end pe-4`}>
                      <button className={`${styles.actionButtonIcon} ${styles.editIcon}`} title="Editar">
                        <FaEdit size={18} />
                      </button>
                      <button className={`${styles.actionButtonIcon} ${styles.deleteIcon}`} title="Eliminar">
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>📂</div>
                    No se encontraron actividades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="border-top p-2 bg-light">
          <PaginationControls 
            totalCount={total} 
            currentPage={page} 
            pageSize={limit} 
          />
        </div>
      </div>
    </div>
  );
}
