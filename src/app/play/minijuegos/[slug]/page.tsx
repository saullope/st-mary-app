import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";
import { findMinigame } from "@/features/minigames/minigames";
import MinigamePlayer from "@/features/minigames/MinigamePlayer";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations("Minigames");
  if (!findMinigame(slug)) return pageMetadata({ title: t("metaTitle"), description: t("metaDescription") });
  return pageMetadata({ title: t(`games.${slug}.title`), description: t(`games.${slug}.description`) });
}

/** Página pública del minijuego: la abre el docente para proyectar o el estudiante con el enlace. */
export default async function MinigamePage({ params }: Props) {
  const { slug } = await params;
  if (!findMinigame(slug)) notFound();
  return <MinigamePlayer slug={slug} />;
}
