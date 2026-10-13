import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FaArrowLeft, FaGamepad, FaQuestion } from "react-icons/fa6";
import getSession from "@/lib/auth/getSession";
import styles from "./not-found.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound");
  return { title: `${t("metaTitle")} | LudiGame` };
}

/** 404 de toda la app: el docente vuelve a su panel; un visitante o estudiante, al inicio o a unirse con PIN. */
export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const session = await getSession();

  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      <Link href="/" className={styles.brand} aria-label="LudiGame">
        <Image src="/images/Logo-LudiGame.png" alt="LudiGame" width={150} height={55} priority />
      </Link>

      <section className={styles.content} aria-labelledby="not-found-title">
        <div className={styles.cards} role="img" aria-label={`404. ${t("hiddenCard")}`}>
          <span className={styles.card} aria-hidden="true">4</span>
          <span className={`${styles.card} ${styles.cardBack}`} aria-hidden="true">
            <FaQuestion />
          </span>
          <span className={styles.card} aria-hidden="true">4</span>
        </div>

        <p className={styles.code}>{t("code")}</p>
        <h1 id="not-found-title" className={styles.title}>{t("title")}</h1>
        <p className={styles.description}>{t("description")}</p>

        <div className={styles.actions}>
          {session ? (
            <Link href="/dashboard" className={styles.primary}>
              <FaArrowLeft aria-hidden="true" /> {t("goDashboard")}
            </Link>
          ) : (
            <>
              <Link href="/" className={styles.primary}>
                <FaArrowLeft aria-hidden="true" /> {t("goHome")}
              </Link>
              <Link href="/play" className={styles.secondary}>
                <FaGamepad aria-hidden="true" /> {t("joinWithPin")}
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
