"use client";

import { useState } from "react";
import Link from "next/link";
import { FaCheck, FaClone, FaEye, FaPen, FaRocket } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import styles from "@/components/dashboard/collection/ActivityCollection.module.css";
import ActivityTypeIcon, { activityTypeClass } from "@/components/dashboard/collection/ActivityTypeIcon";
import { ActionMenu, notify, type ActionMenuItem } from "@/components/ui";
import { getEditorRoute } from "@/lib/editorTab";
import type { TemplateCardData } from "@/features/templates/templates.server";
import { launchTemplate, saveTemplateCopy } from "./actions";
import templateStyles from "./templates.module.css";

const MY_ACTIVITIES = "/dashboard/my-activities";

export default function TemplateCard({ template }: { template: TemplateCardData }) {
  const t = useTranslations("Templates");
  const tCommon = useTranslations("Common");
  const tSubjects = useTranslations("Subjects");
  const [copyId, setCopyId] = useState<number | null>(template.copyId);
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [sessionPin, setSessionPin] = useState<string | null>(null);

  const typeName = tCommon(`activityTypes.${template.typeId as 1 | 2 | 3 | 4 | 5}`);
  const subject = template.subjectCode && tSubjects.has(template.subjectCode) ? tSubjects(template.subjectCode) : null;
  const itemsKey = template.typeId === 3 ? "images" : template.typeId === 4 ? "blocks" : "questions";

  const save = async () => {
    setSaving(true);
    const result = await saveTemplateCopy(template.activityId);
    setSaving(false);
    if (!result.success) return notify.error(t("cloneFailed"), result.error);
    setCopyId(result.copyId);
    notify.withAction(t("saved", { name: template.title }), { label: t("goToMyActivities"), onClick: () => window.location.assign(MY_ACTIVITIES) }, 6000);
  };

  const launch = async () => {
    if (launching) return;
    setLaunching(true);
    const result = await launchTemplate(template.activityId);
    setLaunching(false);
    if (!result.success) return notify.error(t("launchFailed"), result.error || t("tryAgain"));
    if ("copyId" in result && result.copyId) setCopyId(result.copyId);
    setSessionPin("pin" in result ? (result.pin ?? "") : "");
  };

  const menuItems: ActionMenuItem[] = [
    { key: "launch", label: t("launch"), icon: <FaRocket />, onSelect: launch, disabled: launching },
    { key: "preview", label: t("preview"), icon: <FaEye />, href: `/views/activity/${template.activityId}`, external: true },
  ];

  return (
    <article className={`${styles.item} ${activityTypeClass(template.typeId)}`} aria-busy={launching || saving || undefined}>
      {template.coverUrl ? (
        <div className={`${styles.typeIcon} ${templateStyles.cover}`} title={template.coverCredit ?? undefined}>
          {/* Decorativa: el título de la tarjeta ya nombra la plantilla. */}
          <img src={template.coverUrl} alt="" loading="lazy" className={templateStyles.coverImage} />
          <span className={templateStyles.typeChip} aria-hidden="true">
            <ActivityTypeIcon typeId={template.typeId} bare />
          </span>
        </div>
      ) : (
        <ActivityTypeIcon typeId={template.typeId} />
      )}

      <div className={styles.main}>
        {copyId !== null && (
          <span className={templateStyles.savedTag}>
            <FaCheck aria-hidden="true" /> {t("inMyActivities")}
          </span>
        )}
        <h3 className={styles.title} title={template.title}>{template.title}</h3>
        <p className={styles.meta}>
          {[typeName, subject, template.collectionName].filter(Boolean).join(" · ")}
        </p>
        <p className={styles.meta}>
          {[
            t(`count.${itemsKey}`, { count: template.items }),
            template.durationMin ? t("duration", { minutes: template.durationMin }) : null,
            template.secondsPerQuestion ? t("perQuestion", { seconds: template.secondsPerQuestion }) : null,
            template.badges > 0 ? t("badges", { count: template.badges }) : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div role="status">
          {sessionPin !== null && (
            <p className={styles.notice}>
              {t.rich("studentPin", { pin: sessionPin, strong: (chunks) => <strong>{chunks}</strong> })}
            </p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {copyId === null ? (
          <button type="button" className={styles.primary} onClick={save} disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <FaClone aria-hidden="true" />}
            {saving ? t("preparing") : t("use")}
          </button>
        ) : (
          // Solo se edita la copia propia, nunca la plantilla.
          <Link
            href={getEditorRoute(template.typeId, copyId)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primary}
            aria-label={t("editCopyOf", { name: template.title })}
          >
            <FaPen aria-hidden="true" /> {t("editCopy")}
          </Link>
        )}
        <ActionMenu label={t("moreActions", { name: template.title })} items={menuItems} />
      </div>
    </article>
  );
}
