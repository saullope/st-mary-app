import Link from "next/link";
import { FaArrowRight, FaCalendarDays, FaStar, FaUsers } from "react-icons/fa6";
import { useFormatter, useTranslations } from "next-intl";
import collection from "@/components/dashboard/collection/ActivityCollection.module.css";
import ActivityTypeIcon, { activityTypeClass } from "@/components/dashboard/collection/ActivityTypeIcon";
import { sessionPhase } from "@/lib/play/sessionState";
import styles from "./SessionReportCard.module.css";

interface SessionParticipant {
  puntaje_total: number;
  respuestas: Array<{ esCorrecta: boolean | null }>;
}

interface SessionReportCardProps {
  sessionId: string;
  activityName: string;
  typeId: number;
  estado: string | null;
  createdAt: Date;
  participants: SessionParticipant[];
}

/** Class average and share of correct answers (the "effectiveness index"). */
export function summarizeSession(participants: SessionParticipant[]) {
  const answers = participants.flatMap((p) => p.respuestas);
  const totalScore = participants.reduce((sum, p) => sum + p.puntaje_total, 0);
  const correct = answers.filter((r) => r.esCorrecta).length;
  return {
    averageScore: participants.length > 0 ? Math.round(totalScore / participants.length) : 0,
    effectiveness: answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0,
  };
}

function effectivenessLevel(value: number) {
  if (value >= 70) return styles.levelHigh;
  if (value >= 50) return styles.levelMid;
  return styles.levelLow;
}

const PHASE_CLASS = {
  waiting: styles.statusWaiting,
  active: styles.statusActive,
  finished: styles.statusFinished,
} as const;

export default function SessionReportCard({ sessionId, activityName, typeId, estado, createdAt, participants }: SessionReportCardProps) {
  const t = useTranslations("reports");
  const tCommon = useTranslations("Common");
  const format = useFormatter();
  const phase = sessionPhase(estado);
  const { averageScore, effectiveness } = summarizeSession(participants);

  return (
    <article className={`${collection.item} ${activityTypeClass(typeId)} ${styles.card}`}>
      <ActivityTypeIcon typeId={typeId} />

      <div className={collection.main}>
        <h3 className={collection.title} title={activityName}>{activityName}</h3>
        <p className={`${collection.meta} ${styles.metaRow}`}>
          <span className={`${styles.status} ${PHASE_CLASS[phase]}`}>{t(`status.${phase}`)}</span>
          <span>{tCommon(`activityTypes.${typeId as 1 | 2 | 3 | 4 | 5}`)}</span>
          <span aria-hidden="true">·</span>
          <span className={styles.date}>
            <FaCalendarDays aria-hidden="true" />
            {format.dateTime(createdAt, { dateStyle: "medium" })}
          </span>
        </p>
      </div>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>{t("avegrageScore")}</dt>
          <dd>
            <FaStar aria-hidden="true" className={styles.starIcon} />
            {t("points", { value: averageScore })}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt>{t("totalStudents")}</dt>
          <dd>
            <FaUsers aria-hidden="true" className={styles.usersIcon} />
            {participants.length}
          </dd>
        </div>
        <div className={`${styles.stat} ${styles.effectiveness} ${effectivenessLevel(effectiveness)}`}>
          <dt>{t("efectIndex")}</dt>
          <dd>
            {effectiveness}%
            <span className={styles.meter} aria-hidden="true">
              <span style={{ width: `${effectiveness}%` }} />
            </span>
          </dd>
        </div>
      </dl>

      <div className={collection.actions}>
        {/* The link's ::after covers the whole card so any click opens the report. */}
        <Link
          href={`/dashboard/reports/${sessionId}`}
          className={`${collection.primary} ${styles.stretchedLink}`}
          aria-label={t("viewReportOf", { name: activityName })}
        >
          {t("viewReport")}
          <FaArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
