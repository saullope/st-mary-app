"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { sortFollowUpRows, type FollowUpRow, type FollowUpSortKey } from "@/features/followUp/followUp";
import tableStyles from "@/components/ui/DataTable.module.css";

const COLUMNS: { key: FollowUpSortKey; label: string; numeric: boolean }[] = [
  { key: "activityName", label: "activity", numeric: false },
  { key: "gradeId", label: "grade", numeric: false },
  { key: "evaluatedSessions", label: "evaluatedSessions", numeric: true },
  { key: "avgEffectiveness", label: "effectiveness", numeric: true },
  { key: "objectiveMetPct", label: "objectiveMet", numeric: true },
  { key: "avgEnjoyment", label: "enjoyment", numeric: true },
  { key: "avgLearning", label: "learning", numeric: true },
  { key: "studentResponses", label: "studentResponses", numeric: true },
];

const score = (value: number | null) => (value === null ? "-" : value.toFixed(1));
const percent = (value: number | null) => (value === null ? "-" : `${Math.round(value)} %`);

/** Seguimiento consolidado para el administrador: qué actividades funcionan mejor en cada grado. */
export default function AdminFollowUpTable({ rows }: { rows: FollowUpRow[] }) {
  const t = useTranslations("FollowUp.admin");
  const [sortKey, setSortKey] = useState<FollowUpSortKey>("avgEffectiveness");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const sorted = useMemo(() => sortFollowUpRows(rows, sortKey, direction), [rows, sortKey, direction]);

  const sortBy = (key: FollowUpSortKey, numeric: boolean) => {
    if (key === sortKey) {
      setDirection(direction === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    // Lo más efectivo primero; los textos, de la A a la Z.
    setDirection(numeric ? "desc" : "asc");
  };

  return (
    <div className={tableStyles.container}>
      <table className={`table align-middle ${tableStyles.table}`}>
        <caption>{t("caption")}</caption>
        <thead>
          <tr>
            {COLUMNS.map(({ key, label, numeric }) => {
              const active = key === sortKey;
              const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;
              return (
                <th
                  key={key}
                  scope="col"
                  className={`text-uppercase ${numeric ? "text-center" : ""}`}
                  aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none fw-bold text-uppercase d-inline-flex align-items-center gap-1"
                    style={{ color: "inherit" }}
                    onClick={() => sortBy(key, numeric)}
                    aria-label={t("sortBy", { column: t(label) })}
                  >
                    {t(label)} <Icon size={14} aria-hidden />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="text-center">{t("empty")}</td>
            </tr>
          )}
          {sorted.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="fw-bold">
                {row.activityName}
                <div className="small fw-normal" style={{ color: "#4a4266" }}>
                  {row.activityType}
                  {row.fromTemplate && (
                    <span className="badge rounded-pill ms-2" style={{ background: "rgba(106, 75, 255, 0.12)", color: "#6a4bff" }}>{t("fromTemplate")}</span>
                  )}
                  <span className="ms-2">{t("teachers", { count: row.teachers })}</span>
                </div>
              </th>
              <td>{row.gradeName ?? t("noGrade")}</td>
              <td className="text-center">{t("sessionsOf", { evaluated: row.evaluatedSessions, total: row.sessions })}</td>
              <td className="text-center fw-bold">{score(row.avgEffectiveness)}</td>
              <td className="text-center">
                <span className="fw-bold">{percent(row.objectiveMetPct)}</span>
                {row.objectivePartialPct !== null && row.objectivePartialPct > 0 && (
                  <div className="small" style={{ color: "#4a4266" }}>{t("partial", { value: Math.round(row.objectivePartialPct) })}</div>
                )}
              </td>
              <td className="text-center">{score(row.avgEnjoyment)}</td>
              <td className="text-center">{score(row.avgLearning)}</td>
              <td className="text-center">{row.studentResponses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
