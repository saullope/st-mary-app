"use client";

import { useState } from "react";
import { softDeleteActivity } from "./actions";
import { notify } from "@/components/ui";
import { useTranslations } from "next-intl";

export function useDeleteActivity(activityId: number, activityName: string) {
  const t = useTranslations("MyActivities");
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteActivity = async () => {
    if (!window.confirm(t("confirmDelete", { name: activityName }))) return;
    setIsDeleting(true);
    const result = await softDeleteActivity(activityId);
    // On success the page revalidates and the activity disappears.
    if (!result.success) {
      notify.error(t("deleteFailed"), result.error || t("tryAgain"));
      setIsDeleting(false);
    }
  };

  return { deleteActivity, isDeleting };
}
