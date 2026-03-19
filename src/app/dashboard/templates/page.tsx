import { Metadata } from "next";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import getSession from "@/lib/auth/getSession";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import TemplateCard from "./TemplateCard";
import styles from "@/styles/pages/my-activities.module.css";
import { FaShapes } from "react-icons/fa6";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plantillas | LudiGame",
  description: "Catálogo de plantillas de LudiGame",
};

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: { grade?: string; subject?: string };
}) {
  const user = await getCurrentUser();
  const session = await getSession();

  if (!user || !session) {
    redirect("/auth/login");
  }

  const cookieStore = cookies();
  const defaultGrade = cookieStore.get("selectedGrade")?.value || "1ro";

  const currentGradeFilter = searchParams.grade || defaultGrade;
  const currentSubjectFilter = searchParams.subject || "All";

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

  // Filtro de grado (Si no hay grado en la URL ni cookie, cargamos todo? Mejor filtrar por el grado si existe)
  if (gradoId) {
    whereClause.gradoId = gradoId;
  }

  // Filtro de materia
  if (currentSubjectFilter !== "All") {
    whereClause.tema = { nombre: { contains: currentSubjectFilter } };
  }

  // Traer las plantillas
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

  // Títulos para los grados
  const getGradeTitle = (gradeStr: string) => {
    if (gradeStr === "firstGrade" || gradeStr === "1ro") return "1º Grado";
    if (gradeStr === "secondGrade" || gradeStr === "2do") return "2º Grado";
    if (gradeStr === "thirdGrade" || gradeStr === "3ro") return "3º Grado";
    return gradeStr;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <div>
          <h1 className={styles.headerTitle}>
            <FaShapes className="me-3" color="#667eea" />
            Catálogo de Plantillas
          </h1>
          <p className="text-muted mb-0">Explora y clona actividades listas para usar en clase.</p>
        </div>
      </div>

      {/* Filtros super sencillos (SSR based via links/forms) */}
      <div className={`${styles.filterCard} mb-4 d-flex justify-content-between align-items-center`}>
        <div className="d-flex gap-3">
          <div className="dropdown">
            <button className="btn btn-light dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown">
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
            <button className="btn btn-light dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown">
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

      {/* Grid de Plantillas */}
      {templates.length > 0 ? (
        <div className={styles.activitiesGrid}>
          {templates.map((template: any) => (
            <TemplateCard key={template.activityId} template={template} userId={user.id} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyStateIcon}>📚</div>
          <h3>Aún no hay plantillas para este filtro</h3>
          <p>Intenta seleccionar otro grado u otra materia.</p>
        </div>
      )}
    </div>
  );
}
