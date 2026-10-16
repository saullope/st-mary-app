import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaPuzzlePiece } from "react-icons/fa6";
import { requireUser } from "@/lib/auth/guards";
import { pageMetadata } from "@/lib/seo/metadata";
import { MINIGAMES } from "@/features/minigames/minigames";
import MinigameCard from "@/features/minigames/MinigameCard";
import myActivitiesStyles from "@/styles/pages/my-activities.module.css";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import styles from "@/features/minigames/MinigameCard.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("minigames.title"), description: t("minigames.description") });
}

export default async function MinigamesPage() {
  await requireUser("/dashboard/minijuegos");
  const t = await getTranslations("Minigames");

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 0" }}>
      <div className={myActivitiesStyles.headerContainer} style={{ borderBottomColor: "rgba(255,255,255,0.1)" }}>
        <div>
          <h1 className={designStyles.titleLudi} style={{ textAlign: "left", marginBottom: "10px" }}>
            <FaPuzzlePiece className="me-3" aria-hidden="true" />
            {t("title")}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>{t("subtitle")}</p>
        </div>
      </div>

      <ul className={styles.grid}>
        {MINIGAMES.map((game) => (
          <li key={game.slug}>
            <MinigameCard game={game} />
          </li>
        ))}
      </ul>
    </div>
  );
}
