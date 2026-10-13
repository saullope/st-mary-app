"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export type AdminReportView = "activities" | "sessions";

/** Cambia entre la vista consolidada y la vista por sesión conservando los filtros. */
export default function AdminReportViewToggle({ current }: { current: AdminReportView }) {
  const t = useTranslations("FollowUp.admin");
  const searchParams = useSearchParams();

  const hrefFor = (view: AdminReportView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    return `?${params.toString()}`;
  };

  return (
    <nav aria-label={t("viewLabel")} className="d-flex gap-2 mb-3">
      {(["activities", "sessions"] as const).map((view) => {
        const active = view === current;
        return (
          <Link
            key={view}
            href={hrefFor(view)}
            aria-current={active ? "page" : undefined}
            className="btn rounded-pill px-4 fw-bold"
            style={active ? { background: "#6a4bff", color: "#fff" } : { background: "#E8E5F7", color: "#1D153A" }}
          >
            {t(view === "activities" ? "viewActivities" : "viewSessions")}
          </Link>
        );
      })}
    </nav>
  );
}
