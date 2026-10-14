"use client";

import { useState } from "react";
import { FaClone, FaEye, FaRocket } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import styles from "@/components/dashboard/collection/ActivityCollection.module.css";
import ActivityTypeIcon, { activityTypeClass } from "@/components/dashboard/collection/ActivityTypeIcon";
import { cloneTemplateActivity } from "./actions";
import { createGameSession } from "@/app/dashboard/my-activities/sessionActions";
import { ActionMenu, notify, type ActionMenuItem } from "@/components/ui";
import { getEditorRoute, openPendingEditorTab } from "@/lib/editorTab";

interface TemplateCardProps {
  template: {
    activityId: number;
    tipoActividadId: number;
    gradoId: number | null;
    activity: { activity_name: string };
    tema: { nombre: string } | null;
  };
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const t = useTranslations("Templates");
  const tCommon = useTranslations("Common");
  const tThemes = useTranslations("themeBackground");
  const [cloning, setCloning] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [sessionPin, setSessionPin] = useState<string | null>(null);

  const name = template.activity.activity_name;
  const themeName = template.tema?.nombre;
  const themeLabel = themeName && tThemes.has(themeName) ? tThemes(themeName) : t("general");
  const gradeLabel = template.gradoId ? tCommon(`grades.${template.gradoId as 1 | 2 | 3}`) : t("allGradesShort");

  const handleLaunch = async () => {
    if (isLaunching) return;
    setIsLaunching(true);
    const result = await createGameSession(template.activityId);
    if (result.success) {
      setSessionPin(result.pin || "");
    } else {
      notify.error(t("launchFailed"), result.error || t("tryAgain"));
    }
    setIsLaunching(false);
  };

  const handleClone = async () => {
    const editorTab = openPendingEditorTab();
    setCloning(true);
    try {
      const result = await cloneTemplateActivity(template.activityId);
      if (result.success && result.newActivityId) {
        editorTab.navigate(getEditorRoute(template.tipoActividadId, result.newActivityId));
      } else {
        editorTab.cancel();
        notify.error(t("cloneFailed"), result.error || t("cloneError"));
      }
    } catch (error) {
      console.error(error);
      editorTab.cancel();
      notify.error(t("unexpected"));
    }
    setCloning(false);
  };

  const menuItems: ActionMenuItem[] = [
    { key: "launch", label: t("launch"), icon: <FaRocket />, onSelect: handleLaunch, disabled: isLaunching },
    { key: "preview", label: t("preview"), icon: <FaEye />, href: `/views/activity/${template.activityId}`, external: true },
  ];

  return (
    <article className={`${styles.item} ${activityTypeClass(template.tipoActividadId)}`} aria-busy={isLaunching || undefined}>
      <ActivityTypeIcon typeId={template.tipoActividadId} />
      <div className={styles.main}>
        <h3 className={styles.title} title={name}>{name}</h3>
        <p className={styles.meta}>
          {tCommon(`activityTypes.${template.tipoActividadId as 1 | 2 | 3 | 4 | 5}`)} · {gradeLabel} · {themeLabel}
        </p>
        <div role="status">
          {sessionPin && (
            <p className={styles.notice}>
              {t.rich("studentPin", { pin: sessionPin, strong: (chunks) => <strong>{chunks}</strong> })}
            </p>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={handleClone} disabled={cloning}>
          {cloning ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <FaClone aria-hidden="true" />}
          {cloning ? t("preparing") : t("use")}
        </button>
        <ActionMenu label={t("moreActions", { name })} items={menuItems} />
      </div>
    </article>
  );
}
