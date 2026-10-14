"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { badgesFor, catalogKeyForTipo, findMission, missionsFor, pickSelected } from "@/features/gamification/catalog";
import { useAchievementCatalog } from "@/features/gamification/AchievementCatalogContext";
import { useAchievementText } from "@/features/gamification/useAchievementText";
import { useGameVoice } from "@/features/gamification/useGameVoice";
import { selectedAchievementCodes } from "@/features/gamification/activityAchievements";
import type { AchievementItem } from "./AchievementToast";
import { postPlay, type PlayParticipant } from "./playApi";
import { toVoiceProfile } from "@/features/gamification/voiceProfile";

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
  const gradeId: number = sesion.LUDI_ACTIVIDAD.gradoId || 1;
  const voiceEnabled: boolean = settings.voiceEnabled ?? true;
  // Perfil de voz del docente que lanzó la sesión (Configuración > Preferencias).
  const voiceProfile = toVoiceProfile(sesion.user?.config?.voiceGender, sesion.user?.config?.voiceSpeed);
  const { speak } = useGameVoice(voiceEnabled, voiceProfile);
  const achievementText = useAchievementText();

  // Solo cuentan los logros del catálogo de esta actividad y de su grado.
  const catalog = useAchievementCatalog();
  const catalogKey = catalogKeyForTipo(sesion.LUDI_ACTIVIDAD.tipoActividadId);
  const { badges: badgeCodes, missions: missionCodes } = selectedAchievementCodes(sesion.LUDI_ACTIVIDAD);
  const badgeCodesKey = badgeCodes.join(",");
  const missionCodesKey = missionCodes.join(",");
  const selectedBadges = useMemo(
    () => pickSelected(badgesFor(catalog, catalogKey), badgeCodesKey.split(",")),
    [catalog, catalogKey, badgeCodesKey]
  );
  const selectedMissions = useMemo(
    () => pickSelected(missionsFor(catalog, catalogKey, gradeId), missionCodesKey.split(",")),
    [catalog, catalogKey, gradeId, missionCodesKey]
  );

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
      const mission = findMission(catalog, code);
      if (!mission) return;
      const { text, studentText } = achievementText.mission(mission);
      setAchievementQueue((q) => [
        ...q,
        { key: `mission-${code}-${Date.now()}`, kind: "mission", title: text, description: studentText },
      ]);
      speak(studentText);
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
