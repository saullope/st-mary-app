"use client";

import { useState } from "react";
import { FaEye, FaPenToSquare, FaShareNodes, FaRocket, FaTrash } from "react-icons/fa6";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import styles from "./collection/ActivityCollection.module.css";
import ActivityTypeIcon, { activityTypeClass } from "./collection/ActivityTypeIcon";
import { useDeleteActivity } from "@/app/dashboard/my-activities/useDeleteActivity";
import { createGameSession } from "@/app/dashboard/my-activities/sessionActions";
import { ActionMenu, notify, type ActionMenuItem } from "@/components/ui";
import { getEditorRoute } from "@/lib/editorTab";
import { sessionPhase } from "@/lib/play/sessionState";

interface ActivityCardProps {
  activity: {
    activityId: number;
    tipoActividadId: number;
    gradoId: number | null;
    activity: { activity_name: string; created_date: string | Date };
    LUDI_SESION?: Array<{ estado: string | null }>;
  };
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const router = useRouter();
  const t = useTranslations("activityCard");
  const tCommon = useTranslations("Common");
  const format = useFormatter();
  const [isLaunching, setIsLaunching] = useState(false);

  const name = activity.activity.activity_name;
  const { deleteActivity, isDeleting } = useDeleteActivity(activity.activityId, name);
  const isFinalized = activity.LUDI_SESION?.some((s) => sessionPhase(s.estado) === "finished") ?? false;
  const gradeLabel =
    activity.gradoId === 1 || activity.gradoId === 2 || activity.gradoId === 3
      ? tCommon(`grades.${activity.gradoId}`)
      : tCommon("noGrade");

  const handleLaunch = async () => {
    setIsLaunching(true);
    const result = await createGameSession(activity.activityId);
    if (result.success) {
      router.push(`/dashboard/live/${result.sessionId}`);
      return;
    }
    notify.error(t("launchFailed"), result.error || t("tryAgain"));
    setIsLaunching(false);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/views/activity/${activity.activityId}`);
      notify.success(t("linkCopied"));
    } catch {
      notify.error(t("copyFailed"));
    }
  };

  const menuItems: ActionMenuItem[] = [
    { key: "view", label: t("viewButton"), icon: <FaEye />, href: `/views/activity/${activity.activityId}`, external: true },
    { key: "edit", label: t("editButton"), icon: <FaPenToSquare />, href: getEditorRoute(activity.tipoActividadId, activity.activityId), external: true },
    { key: "share", label: t("shareButton"), icon: <FaShareNodes />, onSelect: handleShare },
    { key: "delete", label: t("deleteButton"), icon: <FaTrash />, onSelect: deleteActivity, danger: true, disabled: isDeleting },
  ];

  return (
    <article className={`${styles.item} ${activityTypeClass(activity.tipoActividadId)}`} aria-busy={isDeleting || undefined}>
      <ActivityTypeIcon typeId={activity.tipoActividadId} />
      <div className={styles.main}>
        <h3 className={styles.title} title={name}>{name}</h3>
        <p className={styles.meta}>
          {tCommon(`activityTypes.${activity.tipoActividadId as 1 | 2 | 3 | 4 | 5}`)} · {gradeLabel} ·{" "}
          {format.dateTime(new Date(activity.activity.created_date), { dateStyle: "medium" })}
        </p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={handleLaunch}
          disabled={isLaunching || isFinalized}
          aria-label={isFinalized ? t("finalized") : t("launch")}
          title={isFinalized ? t("finalized") : t("launch")}
        >
          {isLaunching ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <FaRocket aria-hidden="true" />}
          {isFinalized ? t("finalizedShort") : t("launchShort")}
        </button>
        <ActionMenu label={t("moreActions", { name })} items={menuItems} />
      </div>
    </article>
  );
}
