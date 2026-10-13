"use client";

import type { BadgeDef } from "@/features/gamification/catalog";

interface BadgeArtProps {
  badge: Pick<BadgeDef, "img">;
  size: number;
  className?: string;
  radius?: number | string;
}

/** Ilustración de la insignia; todas comparten el estilo plano de public/images/panelludico. */
export const BadgeArt = ({ badge, size, className, radius = 12 }: BadgeArtProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={badge.img} alt="" className={className} style={{ width: size, height: size, objectFit: "contain", borderRadius: radius }} />
);
