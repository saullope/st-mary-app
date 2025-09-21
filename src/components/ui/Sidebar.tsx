'use client'

import { useTranslations } from "next-intl";
import { LanguageSelector } from "./LanguageSelector";
import { BsGlobe } from 'react-icons/bs';
import Image from 'next/image';
import logo from '../../../public/images/Logo-LudiGame.png';
// import bannerStMary from '../../../public/images/BannerStmary.png';
import styles from './css/navbar.module.css';

export const Sidebar = () => {

  const t = useTranslations("HomePage");

  return (
    <>
      <nav className={`${styles.navludi}`}>
        <Image
          src={logo}
          alt="LudiGame logo"
          width={190.2}
          height={70}
          className={styles.imgludi}
        />
        <button
          onClick={() => window.open('https://stmary.edu.ni/', '_blank')}
          className={styles.institucion}
        >
          {t('institution')}
        </button>
        <button onClick={() => window.location.href = '/auth/login'} >{t('signIn')}</button>
        <button onClick={() => window.location.href = '/auth/signup'}>{t('signUp')}</button>
        <div className="d-grid gap-2 d-md-flex justify-content-center align-items-center">
          <BsGlobe />
          <LanguageSelector />
        </div>
      </nav>
    </>
  );
}
