import { Metadata } from "next"
import { useTranslations } from "next-intl"
import styles from '@/styles/pages/new-home.module.css'
import Image from "next/image"
import fomentaInt from "@/images/fomenta-interes.png"
import mejoraAprendizaje from "@/images/mejora-aprendizaje.png"
import facilitaParticipacion from "@/images/participación.png"
import Ludiquiz from "@/images/ludiquiz.png"
import Memory from "@/images/memory.png"
import TrueOrFalse from "@/images/verdadero-falso.png"
import Reading from "@/lotties/reading.json"
import Rocket from "@/lotties/rocket.json"
import { LottieCharge } from '@/components/LottieComponents/LottieCharge'
import Link from "next/link"


export const metadata: Metadata = {
  title: "LudiGame",
  description: "",
};

export default function HomePage() {

  const t = useTranslations("HomePage");

  return (
    <>
      <div className={styles.headerludi}>
        {/* <!-- Animaciones decorativas de fondo --> */}
        <div id="lottie-star" className={styles['bg-icon']}></div>
        <div id="lottie-trophy" className={styles['bg-icon']}></div>
        <div id="lottie-rocket" className={styles['bg-icon']}></div>

        <h1 className={styles.h1ludi}>{t("landingTextLevel1")}</h1>
        <p className={styles.pludi}>{t("landingTextLevel2")}</p>

        {/* <!-- Botones de acción en la sección principal --> */}
        <div className={styles['hero-buttons']}>
          <Link href="/dashboard/create-activity" className={styles.buttonludi} style={{ backgroundColor: "#ffcd00" }}>{t("startCreate")}</Link>
          <Link href="/play" target="_blank" className={styles.buttonludi} style={{ backgroundColor: "white", color: "#333" }}>{t("startPlay")}</Link>
        </div>
      </div>

      <section className={styles['ludi-section']}>
        <div className={styles['ludi-contenido']}>
          <LottieCharge
            animationData={Reading}/>
          <h2 className={`${styles['ludi-experiencias-title']} ${styles.h2ludi}`}>
            {}{t("kidsExperience")}
          </h2>
        </div>
      </section>

      {/* <!-- Sección: Importancia de la ludificación --> */}
      <section className={styles['ludi-importance-section']}>
        <h2 className={`${styles['ludi-importance-title']} ${styles.h2ludi}`}>{t("textWhy")}</h2>
        <div className={styles['ludi-importance-grid']}>
          {/* <!-- Card 1 --> */}
          <div className={styles['ludi-importance-card']}>
            <div className={styles['ludi-importance-icon']}>
              <Image className={styles.imgludi} src={fomentaInt} alt="Fomenta el interés" width={100} height={100} />
            </div>
            <h3>{t("card1Title")}</h3>
            <p>{t("card1Desc")}</p>
          </div>
          {/* <!-- Card 2 --> */}
          <div className={styles['ludi-importance-card']}>
            <div className={styles['ludi-importance-icon']}>
              <Image src={mejoraAprendizaje} alt="Mejora el aprendizaje" width={100} height={100} />
            </div>
            <h3>{t("card2Title")}</h3>
            <p>{t("card2Desc")}</p>
          </div>

          {/* <!-- Card 3 --> */}
          <div className={styles['ludi-importance-card']}>
            <div className={styles['ludi-importance-icon']}>
              <Image src={facilitaParticipacion} alt="Facilita la participación" width={100} height={100} />
            </div>
            <h3>{t("card3Title")}</h3>
            <p>{t("card3Desc")}</p>
          </div>
        </div>
      </section>

      <section className={styles['rocket-section']}>
        {/*<!-- Fondo de estrellas --> */}
        <div className={styles['stars-background-rocket']}></div>
        <div className={styles['rocket-content']}>
          <h2 className={styles['rocket-text']}>
            {t("text1Educator")}
            <span className={styles.highlight}>{t("educator:")}</span>!
          </h2>

          {/* <!-- Animación decorativa de cohete --> */}
          <LottieCharge
            animationData={Rocket}/>
        </div>
      </section>

      {/* <!-- Sección de tipos de juegos --> */}
      <section className={styles.section}>
        <h2 className={styles.h2ludi}>{t("ideasText")}</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <Image className={styles.imgcard} src={Ludiquiz}
            alt="LudiQuiz" width={100} height={100} /><p>LudiQuiz</p></div>
          <div className={styles.card}>
            <Image className={styles.imgcard} src={Memory}
            alt="LudiMemory" width={100} height={100} /><p>LudiMemory</p></div>
          <div className={styles.card}>
            <Image className={styles.imgcard} src={TrueOrFalse}
            alt="True or False" width={100} height={100} /><p>True or False</p></div>
        </div>
      </section>

      {/* <!-- Pie de página --> */}
      <footer className={styles.footer}>
        <p>{`© 2025 LudiGame. ${t("rigths")}.`}</p>
      </footer>
    </>
  )
}