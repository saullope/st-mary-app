"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { findMission } from "@/features/gamification/achievementRules";
import { useGameVoice } from "@/features/gamification/useGameVoice";
import type { AchievementItem } from "./AchievementToast";
import { postPlay, type PlayParticipant } from "./playApi";

export type { PlayParticipant };

interface UsePlaySessionOptions {
  sesion: any;
  previewMode: boolean;
  previewName?: string;
}

/**
 * Estado común a los reproductores (GameEngine, FormEngine): ajustes de la
 * actividad, participante, voz y otorgamiento de insignias y misiones.
 */
export function usePlaySession({ sesion, previewMode, previewName }: UsePlaySessionOptions) {
  const router = useRouter();
  const [participant, setParticipant] = useState<PlayParticipant | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<AchievementItem[]>([]);
  // En refs: se evalúan dentro de timeouts y callbacks donde el estado de React puede estar desactualizado.
  const awardedBadgesRef = useRef<Set<string>>(new Set());
  const awardedMissionsRef = useRef<Set<string>>(new Set());

  const config = sesion.LUDI_ACTIVIDAD.config || {};
  let settings: Record<string, any> = {};
  try {
    settings = config.ajustesJson ? JSON.parse(config.ajustesJson) : {};
  } catch (e) {
    console.error("Error parsing ajustesJson", e);
  }

  const backgroundImage: string = settings.backgroundImage || "/images/theme/tema1.jpg";
  const selectedBadges: string[] = settings.badges || [];
  const selectedMissions: string[] = settings.missions || [];
  const gradeId: number = sesion.LUDI_ACTIVIDAD.gradoId || 1;
  const voiceEnabled: boolean = settings.voiceEnabled ?? true;
  const { speak } = useGameVoice(voiceEnabled);

  useEffect(() => {
    if (previewMode) {
      setParticipant({ id: "preview", name: previewName || "Docente" });
      return;
    }
    const localData = sessionStorage.getItem(`ludi_participant_${sesion.id}`);
    if (!localData) {
      router.push("/play");
      return;
    }
    setParticipant(JSON.parse(localData));
  }, [previewMode, previewName, router, sesion.id]);

  const persistAward = (tipo: "INSIGNIA" | "MISION", codigo: string) => {
    if (previewMode || !participant) return;
    postPlay("/api/play/award", participant, { tipo, codigo })
      .catch((err) => console.error("Failed to persist award:", err));
  };

  // Las insignias se guardan en silencio y se revelan al final en la caja sorpresa;
  // las misiones se anuncian en vivo.
  const recordBadges = (codes: string[]) => {
    codes.forEach((code) => {
      awardedBadgesRef.current.add(code);
      persistAward("INSIGNIA", code);
    });
  };

  const announceMissions = (codes: string[]) => {
    codes.forEach((code) => {
      awardedMissionsRef.current.add(code);
      const mission = findMission(code, gradeId);
      if (!mission) return;
      setAchievementQueue((q) => [
        ...q,
        { key: `mission-${code}-${Date.now()}`, kind: "mission", title: mission.text, description: mission.studentText },
      ]);
      speak(mission.studentText);
      persistAward("MISION", code);
    });
  };

  return {
    router,
    config,
    participant,
    backgroundImage,
    selectedBadges,
    selectedMissions,
    gradeId,
    speak,
    achievementQueue,
    awardedBadgesRef,
    awardedMissionsRef,
    recordBadges,
    announceMissions,
  };
}
