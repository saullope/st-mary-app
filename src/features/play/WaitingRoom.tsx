"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlaySession } from "./usePlaySession";
import { PlayScreen } from "./PlayScreens";
import type { SessionPhase } from "@/lib/play/sessionState";
import styles from "./waiting.module.css";
import { useTranslations } from "next-intl";

const POLL_MS = 2500;

interface WaitingRoomProps {
  sesion: any;
  phase: Exclude<SessionPhase, "active">;
}

/**
 * Pantalla del estudiante mientras el docente no inicia la actividad. Consulta la fase
 * de la sesión y, al cambiar, recarga la página para entrar al juego.
 */
export const WaitingRoom = ({ sesion, phase }: WaitingRoomProps) => {
  const router = useRouter();
  const { participant, backgroundImage } = usePlaySession({ sesion, previewMode: false });
  const t = useTranslations("Play.waiting");

  useEffect(() => {
    if (phase === "finished") return;
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/play/status/${sesion.id}`, { cache: "no-store" });
        const data = await response.json();
        if (data.phase && data.phase !== "waiting") router.refresh();
      } catch {
        // Un fallo de red puntual no debe sacar al estudiante de la sala.
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [phase, router, sesion.id]);

  const activityName: string | undefined = sesion.LUDI_ACTIVIDAD?.activity?.activity_name;

  return (
    <PlayScreen backgroundImage={backgroundImage}>
      <section className={styles.card} aria-live="polite">
        {phase === "finished" ? (
          <>
            <h1 className={styles.title}>{t("finishedTitle")}</h1>
            <p className={styles.text}>{t("finishedBody")}</p>
            <button type="button" className={styles.button} onClick={() => router.push("/play")}>
              {t("backHome")}
            </button>
          </>
        ) : (
          <>
            {activityName && <span className={styles.eyebrow}>{activityName}</span>}
            <h1 className={styles.title}>{participant ? t("helloName", { name: participant.name }) : t("hello")}</h1>
            <p className={styles.text}>{t("waitingBody")}</p>
            <span className={styles.status}>
              <span className={styles.pulse} aria-hidden="true" />
              {t("waitingTeacher")}
            </span>
          </>
        )}
      </section>
    </PlayScreen>
  );
};
