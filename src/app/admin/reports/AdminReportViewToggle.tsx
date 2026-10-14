"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import filterStyles from "@/components/dashboard/ActivityFilter.module.css";

export type AdminReportView = "activities" | "sessions";

/** Cambia entre la vista consolidada y la vista por sesión conservando los filtros. */
export default function AdminReportViewToggle({ current }: { current: AdminReportView }) {
  const t = useTranslations("FollowUp.admin");
  const searchParams = useSearchParams();

  const hrefFor = (view: AdminReportView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    params.delete("page");
    return `?${params.toString()}`;
  };

  return (
    <nav aria-label={t("viewLabel")} className="d-flex gap-2 mb-3">
      {(["sessions", "activities"] as const).map((view) => {
        const active = view === current;
        return (
          <Link
            key={view}
            href={hrefFor(view)}
            aria-current={active ? "page" : undefined}
            className={`${filterStyles.chip} ${active ? filterStyles.chipActive : ""}`}
          >
            {t(view === "activities" ? "viewActivities" : "viewSessions")}
          </Link>
        );
      })}
    </nav>
  );
}
