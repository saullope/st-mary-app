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

export const metadata: Metadata = {
  title: "Plantillas | LudiGame",
  description: "Catálogo de plantillas de LudiGame",
};

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
    if (gradeStr === "firstGrade" || gradeStr === "1ro") return "1º Grado";
    if (gradeStr === "secondGrade" || gradeStr === "2do") return "2º Grado";
    if (gradeStr === "thirdGrade" || gradeStr === "3ro") return "3º Grado";
    return gradeStr;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
      <div className={styles.headerContainer} style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
        <div>
          <h1 className={designStyles.titleLudi} style={{ textAlign: 'left', marginBottom: '10px' }}>
            <FaShapes className="me-3" />
            Catálogo de Plantillas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Explora y clona actividades listas para usar en clase.</p>
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
              Grado: {getGradeTitle(currentGradeFilter)}
            </button>
            <ul className="dropdown-menu shadow-sm border-0">
              <li><Link className="dropdown-item" href={`?grade=firstGrade&subject=${currentSubjectFilter}`}>1º Grado</Link></li>
              <li><Link className="dropdown-item" href={`?grade=secondGrade&subject=${currentSubjectFilter}`}>2º Grado</Link></li>
              <li><Link className="dropdown-item" href={`?grade=thirdGrade&subject=${currentSubjectFilter}`}>3º Grado</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item" href={`?grade=All&subject=${currentSubjectFilter}`}>Todos los grados</Link></li>
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
              Materia: {currentSubjectFilter === "All" ? "Todas" : currentSubjectFilter}
            </button>
            <ul className="dropdown-menu shadow-sm border-0">
              <li><Link className="dropdown-item" href={`?grade=${currentGradeFilter}&subject=All`}>Todas las materias</Link></li>
              <li><Link className="dropdown-item" href={`?grade=${currentGradeFilter}&subject=Matemáticas`}>Matemáticas</Link></li>
              <li><Link className="dropdown-item" href={`?grade=${currentGradeFilter}&subject=Lengua`}>Lengua y Literatura</Link></li>
              <li><Link className="dropdown-item" href={`?grade=${currentGradeFilter}&subject=Tecnología`}>Tecnología</Link></li>
              <li><Link className="dropdown-item" href={`?grade=${currentGradeFilter}&subject=Efemérides`}>Efemérides de Nicaragua</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {templates.length > 0 ? (
        <div className={styles.activitiesGrid}>
          {templates.map((template: any) => (
            <TemplateCard key={template.activityId} template={template} userId={user.id} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyStateIcon}>📚</div>
          <h3><span className={designStyles.star}>★</span> Aún no hay plantillas para este filtro</h3>
          <p>Intenta seleccionar otro grado u otra materia.</p>
        </div>
      )}
    </div>
  );
}
