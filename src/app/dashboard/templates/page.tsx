import { Metadata } from "next";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import getSession from "@/lib/auth/getSession";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import TemplateCard from "./TemplateCard";
import styles from "@/styles/pages/my-activities.module.css";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import { FaShapes } from "react-icons/fa6";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("templates.title"), description: t("templates.description") });
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; subject?: string }>;
}) {
  const user = await getCurrentUser();
  const session = await getSession();

  if (!user || !session) {
    redirect("/auth/login");
  }

  const resolvedSearchParams = await searchParams;
  const t = await getTranslations("Templates");

  const cookieStore = await cookies();
  const defaultGrade = cookieStore.get("selectedGrade")?.value || "1ro";

  const currentGradeFilter = resolvedSearchParams.grade || defaultGrade;
  const currentSubjectFilter = resolvedSearchParams.subject || "All";

  // Buscar el ID del grado basado en el string (ej. "1ro", "2do", "3ro")
  const gradoDb = await prisma.lUDI_COMMON_GRADE.findFirst({
    where: { key_string: currentGradeFilter },
  });

  const gradoId = gradoDb ? gradoDb.id : undefined;

  // Condiciones de búsqueda para plantillas
  const whereClause: any = {
    activity: { isTemplate: true } as any,
    estatus: true,
  };

  if (gradoId) {
    whereClause.gradoId = gradoId;
  }

  if (currentSubjectFilter !== "All") {
    whereClause.tema = { nombre: { contains: currentSubjectFilter } };
  }

  const templates = await prisma.ludiActividad.findMany({
    where: whereClause,
    include: {
      activity: true,
      tipoActividad: true,
      grado: true,
      tema: true,
    },
    orderBy: {
      activity: { activity_name: "asc" },
    },
  });

  const getGradeTitle = (gradeStr: string) => {
    if (gradeStr === "firstGrade" || gradeStr === "1ro") return t("grade1");
    if (gradeStr === "secondGrade" || gradeStr === "2do") return t("grade2");
    if (gradeStr === "thirdGrade" || gradeStr === "3ro") return t("grade3");
    if (gradeStr === "All") return t("allGrades");
    return gradeStr;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
      <div className={styles.headerContainer} style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
        <div>
          <h1 className={designStyles.titleLudi} style={{ textAlign: 'left', marginBottom: '10px' }}>
            <FaShapes className="me-3" aria-hidden="true" />
            {t("title")}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>{t("subtitle")}</p>
        </div>
      </div>

      <div className={`${styles.filterCard} mb-4 d-flex justify-content-between align-items-center`}>
        <div className="d-flex gap-3">
          <div className="dropdown">
            <button 
              className="btn dropdown-toggle fw-bold" 
              type="button" 
              data-bs-toggle="dropdown"
              style={{
                backgroundColor: 'white',
                color: '#1D153A',
                border: '1px solid rgba(29, 21, 58, 0.2)',
                borderRadius: '2rem',
                padding: '0.4rem 1rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              {t("gradeFilter", { grade: getGradeTitle(currentGradeFilter) })}
            </button>
            <ul className="dropdown-menu shadow-sm border-0">
              <li><Link className="dropdown-item" href={`?grade=firstGrade&subject=${currentSubjectFilter}`}>{t("grade1")}</Link></li>
              <li><Link className="dropdown-item" href={`?grade=secondGrade&subject=${currentSubjectFilter}`}>{t("grade2")}</Link></li>
              <li><Link className="dropdown-item" href={`?grade=thirdGrade&subject=${currentSubjectFilter}`}>{t("grade3")}</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item" href={`?grade=All&subject=${currentSubjectFilter}`}>{t("allGrades")}</Link></li>
            </ul>
          </div>
          
          <div className="dropdown">
            <button 
              className="btn dropdown-toggle fw-bold" 
              type="button" 
              data-bs-toggle="dropdown"
              style={{
                backgroundColor: 'white',
                color: '#1D153A',
                border: '1px solid rgba(29, 21, 58, 0.2)',
                borderRadius: '2rem',
                padding: '0.4rem 1rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              {t("subjectFilter", { subject: currentSubjectFilter === "All" ? t("allSubjectsShort") : currentSubjectFilter })}
            </button>
            <ul className="dropdown-menu shadow-sm border-0">
              <li><Link className="dropdown-item" href={`?grade=${currentGradeFilter}&subject=All`}>{t("allSubjects")}</Link></li>
              <li><Link className="dropdown-item" href={`?grade=${currentGradeFilter}&subject=Matemáticas`}>{t("subjects.math")}</Link></li>
              <li><Link className="dropdown-item" href={`?grade=${currentGradeFilter}&subject=Lengua`}>{t("subjects.language")}</Link></li>
              <li><Link className="dropdown-item" href={`?grade=${currentGradeFilter}&subject=Tecnología`}>{t("subjects.technology")}</Link></li>
              <li><Link className="dropdown-item" href={`?grade=${currentGradeFilter}&subject=Efemérides`}>{t("subjects.ephemerides")}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {templates.length > 0 ? (
        <div className={styles.activitiesGrid}>
          {templates.map((template: any) => (
            <TemplateCard key={template.activityId} template={template} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyStateIcon} aria-hidden="true">📚</div>
          <h3><span className={designStyles.star} aria-hidden="true">★</span> {t("emptyTitle")}</h3>
          <p>{t("emptyBody")}</p>
        </div>
      )}
    </div>
  );
}
