import { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { FaMagnifyingGlass, FaShapes, FaStar } from "react-icons/fa6";
import { requireUser } from "@/lib/auth/guards";
import { GRADE_COOKIE_NAME, gradeIdFromKey } from "@/lib/grades";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSubjectsByGrade, getUserSubjectIdsByGrade } from "@/features/subjects/subjects.server";
import { BRAND_COLOR, NEUTRAL_COLOR, gradeColor, subjectColor } from "@/features/subjects/subjectColors";
import { TEMPLATE_TYPES, getTemplateCollections, getTemplates } from "@/features/templates/templates.server";
import ActivityCollection from "@/components/dashboard/collection/ActivityCollection";
import filterStyles from "@/components/dashboard/ActivityFilter.module.css";
import styles from "@/styles/pages/my-activities.module.css";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import TemplateCard from "./TemplateCard";
import templateStyles from "./templates.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("templates.title"), description: t("templates.description") });
}

type SearchParams = { grade?: string; subject?: string; collection?: string; type?: string; q?: string };

const GRADES = [1, 2, 3] as const;
const MINE = "mine";
const ALL = "all";

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireUser("/dashboard/templates");
  const params = await searchParams;
  const t = await getTranslations("Templates");
  const tCommon = await getTranslations("Common");
  const tSubjects = await getTranslations("Subjects");

  // El grado de la URL, si no el que eligió en la bienvenida.
  const cookieGrade = gradeIdFromKey((await cookies()).get(GRADE_COOKIE_NAME)?.value);
  const requestedGrade = Number(params.grade) || gradeIdFromKey(params.grade) || cookieGrade || 1;
  const gradeId = GRADES.includes(requestedGrade as 1 | 2 | 3) ? requestedGrade : 1;

  const [subjectsByGrade, mySubjectsByGrade] = await Promise.all([getSubjectsByGrade(), getUserSubjectIdsByGrade(user.id)]);
  const gradeSubjects = subjectsByGrade[gradeId] ?? [];
  const mySubjectIds = mySubjectsByGrade[gradeId] ?? [];

  // Por defecto se ven primero las clases que imparte; "Todas" quita el filtro.
  const subject = params.subject ?? (mySubjectIds.length > 0 ? MINE : ALL);
  const chosenSubject = gradeSubjects.find((s) => s.codigo === subject);
  const subjectIds = subject === MINE ? mySubjectIds : chosenSubject ? [chosenSubject.id] : [];
  const typeId = TEMPLATE_TYPES.includes(Number(params.type) as 1) ? Number(params.type) : null;
  const search = (params.q ?? "").trim().slice(0, 80);
  const collection = params.collection ?? null;

  const [collections, templates] = await Promise.all([
    getTemplateCollections(gradeId, subjectIds),
    getTemplates(user.id, { gradeId, subjectIds, collection, typeId, search }),
  ]);

  const href = (changes: Partial<Record<keyof SearchParams, string | null>>) => {
    const next = new URLSearchParams();
    const merged: Partial<Record<keyof SearchParams, string | null>> = { grade: String(gradeId), subject, collection, type: typeId ? String(typeId) : null, q: search || null, ...changes };
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, value);
    return `?${next.toString()}`;
  };
  const chip = (active: boolean) => `${filterStyles.chip} ${active ? filterStyles.chipActive : ""}`;
  // Chips de grado y clase: cada uno con su color (subjectColors.ts).
  const colorChip = (active: boolean) => `${filterStyles.chip} ${templateStyles.colorChip} ${active ? templateStyles.colorChipActive : ""}`;
  const tint = (color: string) => ({ "--chip": color }) as CSSProperties;
  const subjectName = (codigo: string) => (tSubjects.has(codigo) ? tSubjects(codigo) : codigo);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 0" }}>
      <div className={styles.headerContainer} style={{ borderBottomColor: "rgba(255,255,255,0.1)" }}>
        <div>
          <h1 className={designStyles.titleLudi} style={{ textAlign: "left", marginBottom: "10px" }}>
            <FaShapes className="me-3" aria-hidden="true" />
            {t("title")}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>{t("subtitle")}</p>
        </div>
      </div>

      <div className={templateStyles.toolbar}>
        <nav className={templateStyles.chipRow} aria-label={t("gradeLabel")}>
          <span className={templateStyles.chipRowLabel}>{t("gradeLabel")}</span>
          {GRADES.map((id) => (
            <Link key={id} href={href({ grade: String(id), subject: null, collection: null })} className={colorChip(id === gradeId)} style={tint(gradeColor(id))} aria-current={id === gradeId ? "page" : undefined}>
              {tCommon(`grades.${id}`)}
            </Link>
          ))}
        </nav>

        <nav className={templateStyles.chipRow} aria-label={t("subjectLabel")}>
          <span className={templateStyles.chipRowLabel}>{t("subjectLabel")}</span>
          {mySubjectIds.length > 0 && (
            <Link href={href({ subject: MINE, collection: null })} className={colorChip(subject === MINE)} style={tint(BRAND_COLOR)} aria-current={subject === MINE ? "page" : undefined}>
              <FaStar aria-hidden="true" /> {t("mySubjects")}
            </Link>
          )}
          <Link href={href({ subject: ALL, collection: null })} className={colorChip(subject === ALL)} style={tint(NEUTRAL_COLOR)} aria-current={subject === ALL ? "page" : undefined}>
            {t("allSubjects")}
          </Link>
          {gradeSubjects.map((s) => (
            <Link key={s.codigo} href={href({ subject: s.codigo, collection: null })} className={colorChip(subject === s.codigo)} style={tint(subjectColor(s.codigo))} aria-current={subject === s.codigo ? "page" : undefined}>
              <span className={templateStyles.chipDot} aria-hidden="true" /> {subjectName(s.codigo)}
            </Link>
          ))}
        </nav>

        {mySubjectIds.length === 0 && (
          <div className={templateStyles.hint}>
            <span>{t("chooseSubjectsHint", { grade: tCommon(`grades.${gradeId as 1 | 2 | 3}`) })}</span>
            <Link href="/settings/preferences" className={templateStyles.hintLink}>{t("chooseSubjects")}</Link>
          </div>
        )}
      </div>

      {collections.length > 0 && (
        <section aria-labelledby="template-collections-title">
          <h2 id="template-collections-title" className={templateStyles.sectionTitle}>{t("collectionsTitle")}</h2>
          <div className={templateStyles.collections}>
            {collections.map((item) => {
              const active = item.code === collection;
              return (
                <Link
                  key={item.code}
                  href={href({ collection: active ? null : item.code })}
                  className={`${templateStyles.collection} ${active ? templateStyles.collectionActive : ""}`}
                  aria-current={active ? "true" : undefined}
                  title={item.description ?? undefined}
                >
                  {item.coverUrl && <img src={item.coverUrl} alt="" loading="lazy" className={templateStyles.collectionImage} />}
                  <span className={templateStyles.collectionBody}>
                    <span className={templateStyles.subjectPill} style={tint(subjectColor(item.subjectCode))}>{subjectName(item.subjectCode)}</span>
                    <span className={`d-block ${templateStyles.collectionName}`}>{item.name}</span>
                    <span className={`d-block ${templateStyles.collectionMeta}`}>
                      {t("collectionCount", { count: item.templates })}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <ActivityCollection
        storageKey="ludi.view.templates"
        filters={
          <form className={filterStyles.filterWrapper} role="search" method="get">
            <input type="hidden" name="grade" value={gradeId} />
            <input type="hidden" name="subject" value={subject} />
            {collection && <input type="hidden" name="collection" value={collection} />}
            <div className={filterStyles.searchContainer}>
              <FaMagnifyingGlass className={filterStyles.searchIcon} aria-hidden="true" />
              <input type="text" name="q" defaultValue={search} placeholder={t("searchPlaceholder")} aria-label={t("searchPlaceholder")} className={filterStyles.searchInput} />
            </div>
            <div className={filterStyles.selectContainer}>
              <select name="type" defaultValue={typeId ?? ""} aria-label={t("typeLabel")} className={filterStyles.typeSelect}>
                <option value="">{t("allTypes")}</option>
                {TEMPLATE_TYPES.map((id) => (
                  <option key={id} value={id}>{tCommon(`activityTypes.${id}`)}</option>
                ))}
              </select>
            </div>
            <button type="submit" className={chip(true)}>{t("apply")}</button>
          </form>
        }
        emptyState={
          <div className={styles.emptyStateCard}>
            <h3>{t("emptyTitle")}</h3>
            <p>{t("emptyBody")}</p>
          </div>
        }
      >
        {templates.map((template) => (
          <TemplateCard key={template.activityId} template={template} />
        ))}
      </ActivityCollection>
    </div>
  );
}
