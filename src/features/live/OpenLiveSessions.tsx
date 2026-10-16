"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FaArrowRight, FaTowerBroadcast } from "react-icons/fa6";
import type { OpenLiveSession } from "./openSessions.server";
import styles from "./OpenLiveSessions.module.css";

const LIVE_PATH = "/dashboard/live/";

/**
 * Aviso del panel con las sesiones en vivo que el docente dejó abiertas: sus estudiantes
 * pueden seguir jugando, así que siempre hay un camino de vuelta al panel en vivo.
 */
export default function OpenLiveSessions() {
  const t = useTranslations("LiveReturn");
  const pathname = usePathname();
  const [sessions, setSessions] = useState<OpenLiveSession[]>([]);
  const onLivePanel = pathname.startsWith(LIVE_PATH);

  // Se consulta en cada cambio de pantalla: el layout no se vuelve a montar al navegar.
  useEffect(() => {
    if (onLivePanel) return;
    let cancelled = false;
    fetch("/api/live/open", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { sessions: [] }))
      .then((data: { sessions: OpenLiveSession[] }) => {
        if (!cancelled) setSessions(data.sessions ?? []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pathname, onLivePanel]);

  if (onLivePanel || sessions.length === 0) return null;

  return (
    <section className={styles.wrapper} aria-label={t("label")}>
      {sessions.map((session) => (
        <div key={session.id} className={styles.banner} role="status">
          <span className={styles.icon} aria-hidden="true">
            <FaTowerBroadcast />
          </span>
          <div className={styles.text}>
            <p className={styles.title}>{session.active ? t("titleActive") : t("titleWaiting")}</p>
            <p className={styles.meta}>
              {t("meta", { activity: session.activity, pin: session.pin, count: session.participants })}
            </p>
          </div>
          <Link href={`${LIVE_PATH}${session.id}`} className={styles.action}>
            {t("back")} <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      ))}
    </section>
  );
}
