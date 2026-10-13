"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { BadgeDef, MissionDef } from "./catalog";

export interface BadgeText {
  name: string;
  phrase: string;
  description: string;
}

export interface MissionText {
  /** Lo que ve el docente al configurar y en reportes. */
  text: string;
  /** Lo que se le dice al estudiante al cumplirla. */
  studentText: string;
}

/**
 * Textos traducidos de insignias y misiones (messages: Achievements). Las insignias se
 * traducen por código; las misiones por regla, con el umbral de la BD como {value}, así
 * una misión nueva con una regla existente no necesita textos nuevos.
 */
export function useAchievementText() {
  const t = useTranslations("Achievements");
  return useMemo(() => {
    const badge = (def: Pick<BadgeDef, "code" | "threshold">): BadgeText => {
      const values = { value: def.threshold ?? 0 };
      return {
        name: t(`badges.${def.code}.name`),
        phrase: t(`badges.${def.code}.phrase`, values),
        description: t(`badges.${def.code}.description`, values),
      };
    };
    const mission = (def: Pick<MissionDef, "catalog" | "rule" | "threshold">): MissionText => {
      const values = { value: def.threshold ?? 0 };
      return {
        text: t(`missions.${def.catalog}.${def.rule}.text`, values),
        studentText: t(`missions.${def.catalog}.${def.rule}.studentText`, values),
      };
    };
    return {
      badge,
      mission,
      badgeUnlocked: (def: BadgeDef) => t("voice.badgeUnlocked", { name: badge(def).name, phrase: badge(def).phrase }),
      badgeSelected: (def: BadgeDef) => t("voice.badgeSelected", { name: badge(def).name, phrase: badge(def).phrase }),
      missionSelected: (def: MissionDef) => t("voice.missionSelected", { text: mission(def).studentText }),
    };
  }, [t]);
}
