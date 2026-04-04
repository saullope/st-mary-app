import { Metadata } from "next";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import getSession from "@/lib/auth/getSession";
import { getActivityTypes, getUserActivities } from "@/services/activityService";
import ActivityFilter from "@/components/dashboard/ActivityFilter";
import ExportActivitiesButton from "@/components/dashboard/ExportActivitiesButton";
import NewActivityButton from "@/components/dashboard/NewActivityButton";
import PaginationControls from "@/components/dashboard/PaginationControls";
import { redirect } from "next/navigation";
import styles from "@/styles/pages/my-activities.module.css";
import ActivityCard from "@/components/dashboard/ActivityCard";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("myActivitiesContent");

    return {
        title: t('metaTitle'),
        description: t('metaDescription')
    };
}

interface PageProps {
  searchParams: Promise<{
    typeId?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function MyActivities({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const session = await getSession();

  if (!user || !session) {
    redirect("/auth/login");
  }

  // use Translations hook must be called inside the component, not before any async operations

  const t = await getTranslations ("myActivitiesContent");


  const resolvedSearchParams = await searchParams;

  // Fetch Data
  const types = await getActivityTypes();
  const selectedTypeId = resolvedSearchParams.typeId ? parseInt(resolvedSearchParams.typeId) : undefined;
  const searchQuery = resolvedSearchParams.search;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  const limit = resolvedSearchParams.limit ? parseInt(resolvedSearchParams.limit) : 6; // Changed to 6 for a nicer grid
  
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
          <h1 className={styles.headerTitle}>{t("titlePage")}</h1>
          <p className="text-muted mb-0">{t("descPage")}</p>
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

      {/* Grid de Actividades */}
      {activities.length > 0 ? (
        <div className={styles.activitiesGrid}>
          {activities.map((act: any) => (
            <ActivityCard 
              key={act.activityId}
              activity={act}
              gradeLabel={getGradeLabel(act.grado?.grade_type_name)}
              typeBadgeClass={getTypeBadgeClass(act.tipoActividadId)}
              sessionPicture={session.picture}
              isAdmin={user.rol.nombre === 'ADMIN'}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyStateIcon}>🚀</div>
          <h3>¡Tu aventura está a punto de comenzar!</h3>
          <p>Aún no has creado ninguna actividad. Crea tu primer desafío y sorprende a tus estudiantes con una experiencia de aprendizaje inolvidable.</p>
        </div>
      )}
      
      {/* Paginación */}
      {activities.length > 0 && (
        <div className={styles.paginationCard}>
          <PaginationControls 
            totalCount={total} 
            currentPage={page} 
            pageSize={limit} 
          />
        </div>
      )}
    </div>
  );
}
