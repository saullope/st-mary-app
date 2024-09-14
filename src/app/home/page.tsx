import { Metadata } from "next";
import { useTranslations } from "next-intl";
import Image from "next/image";
import landing from '../../../public/images/FondoLandingpage.png';
import banner from '../../../public/images/Banner1.png';
import styles from '../../../public/css/landing.module.css';

export const metadata: Metadata = {
  title: "LudiGame",
  description: "",
};

export default function HomePage() {

  const t = useTranslations("HomePage");

  return (
    <>

<div>
      <div className={styles.fondo1}>
        <div className={styles['fondo1-texto']}>
          <h1>{t("landingTextLevel1")}</h1>
          <h2>{t("landingTextLevel2")}</h2>
        </div>
      </div>


      <div className={styles.fondo2}>
        <div className={styles['fondo2-texto']}>
          <h1>{t("landingTextLevel3")}</h1>
          <h2>{t("landingTextLevel4")}</h2>
        </div>
      </div>
      </div>


    <div className={styles['pie-pagina']}>
      <div className={styles.derechos}>
        <p className={styles['text-derechos']}>LudiGame &copy; {t("rigths")}</p>
      </div>
    </div>
    </>
  )
}