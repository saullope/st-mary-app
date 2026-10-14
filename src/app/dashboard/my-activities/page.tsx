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
import designStyles from "@/styles/pages/LudiDesign.module.css";
import ActivityCard from "@/components/dashboard/ActivityCard";
import ActivityCollection from "@/components/dashboard/collection/ActivityCollection";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("myActivitiesContent");
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription") });
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
  const limit = resolvedSearchParams.limit ? parseInt(resolvedSearchParams.limit) : 10;
  
  const { activities, total } = await getUserActivities(user.id, selectedTypeId, searchQuery, page, limit);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
      <div className={styles.headerContainer} style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
        <div>
          <h1 className={designStyles.titleLudi} style={{ textAlign: 'left', marginBottom: '10px' }}>
            <span className={designStyles.star}>★</span> {t("titlePage")}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>{t("descPage")}</p>
        </div>
        <div className="d-flex gap-3">
          <ExportActivitiesButton activities={activities} />
          <NewActivityButton />
        </div>
      </div>

      <ActivityCollection
        storageKey="ludi.view.myActivities"
        filters={<ActivityFilter types={types} />}
        footer={<PaginationControls totalCount={total} currentPage={page} pageSize={limit} />}
        emptyState={
          <div className={styles.emptyStateCard}>
            <div className={styles.emptyStateIcon} aria-hidden="true">🚀</div>
            <h3><span className={designStyles.star} aria-hidden="true">★</span> {t("emptyTitle")}</h3>
            <p>{t("emptyBody")}</p>
          </div>
        }
      >
        {activities.map((act: any) => (
          <ActivityCard key={act.activityId} activity={act} />
        ))}
      </ActivityCollection>
    </div>
  );
}
