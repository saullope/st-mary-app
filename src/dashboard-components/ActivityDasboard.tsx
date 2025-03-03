'use client';

import React, { useContext, useEffect, useState } from "react";
import { SessionContext } from "@/contexts/SessionContext";
import { CardGrade, CardActivity } from "@/educator-components";
import PrimerGrado from '../../public/images/primer-grado/PrimerGrado.png';
import MisActividades from '../../public/images/primer-grado/Mis-actividades.png';
import CrearActividades from '../../public/images/primer-grado/Crear-actividades.png'
import MatImage from '../../public/images/primer-grado/BannerMat.png';
import LenguaLit from '../../public/images/primer-grado/BannerLyL.png';
import Tecno from '../../public/images/primer-grado/BannerTecno.png';

import SegundoGrado from '../../public/images/segundo-grado/SegundoGrado.png';
import MatImageSecond from '../../public/images/segundo-grado/BannerMat-Segundo.png';
import LenguaLitSecond from '../../public/images/segundo-grado/BannerLyL-Segundo.png';
import TecnoSecond from '../../public/images/segundo-grado/BannerTecno-Segundo.png';

import TercerGrado from '../../public/images/tercer-grado/TercerGrado.png';
import MatImageThird from '../../public/images/tercer-grado/BannerMat-Tercero.png';
import LenguaLitThird from '../../public/images/tercer-grado/BannerLyL-Tercero.png';
import TecnoThird from '../../public/images/tercer-grado/BannerTecno-Tercero.png';

import styles from '../../public/css/create-activity.module.css';
import { useTranslations } from "next-intl";

type GradeKey = 'firstGrade' | 'secondGrade' | 'thirdGrade';

const renderGradeContent = (grade: GradeKey, t: any, t2: any, images: any, onCardClick: (grade: string) => void) => (
  <>
    <div className={styles['container-card-activity']}>
      <CardGrade cardTitle={t('gradeName')} cardAlt={`Crear Actividades ${grade}`} srcImageGrade={images.gradeImage} />
      <CardActivity cardTitle={t('createActivity')} cardAlt="Crear Actividades" srcImageGrade={CrearActividades} typeButton="primary" onClick={onCardClick} />
      <CardActivity cardTitle={t('myActivities')} cardAlt="Crear Actividades" srcImageGrade={MisActividades} typeButton="primary" onClick={onCardClick} />
    </div>
    <div className={`${styles['text-plantillas-activity']} pt-2 pb-2`}>
      <h2 className={`${styles.h2} text-center`}>{t2('ludiTemplates')}</h2>
      <h4 className={`${styles.h4} text-center`}>{`"${t2('ludiTemplatesText')}"`}</h4>
      <br />
    </div>
    <div className={styles['container-card-activity']}>
      <CardActivity cardTitle="Matemáticas" cardAlt="Matemáticas" srcImageGrade={images.matImage} typeButton="success" onClick={onCardClick} />
      <CardActivity cardTitle="Lengua y Literatura" cardAlt="Lengua y Literatura" srcImageGrade={images.lenguaLitImage} typeButton="success" onClick={onCardClick} />
      <CardActivity cardTitle="Tecnología" cardAlt="Tecnología" srcImageGrade={images.tecnoImage} typeButton="success" onClick={onCardClick} />
    </div>
  </>
);

export const ActivityDasboard = () => {


  const { setSelectedGrade } = useContext(SessionContext);
  const [grade, setGrade] = useState<GradeKey>('firstGrade');

  const t = useTranslations(`${grade}ItemDashboard`);
  const t2 = useTranslations('textDashboard');

  useEffect(() => {
    const storedGrade = localStorage.getItem('grade') as GradeKey;
    if (storedGrade) {
      setGrade(storedGrade);
      setSelectedGrade(storedGrade);
    }
  }, [setSelectedGrade]);

  useEffect(() => {
    if (grade) {
      setSelectedGrade(grade);
    }
  }, [grade, setSelectedGrade]);

  const gradeImages: Record<GradeKey, any> = {
    firstGrade: {
      gradeImage: PrimerGrado,
      matImage: MatImage,
      lenguaLitImage: LenguaLit,
      tecnoImage: Tecno,
    },
    secondGrade: {
      gradeImage: SegundoGrado,
      matImage: MatImageSecond,
      lenguaLitImage: LenguaLitSecond,
      tecnoImage: TecnoSecond,
    },
    thirdGrade: {
      gradeImage: TercerGrado,
      matImage: MatImageThird,
      lenguaLitImage: LenguaLitThird,
      tecnoImage: TecnoThird,
    },
  };

  const handleCardClick = (grade: string) => {
    // Define the link based on the card title
    const link = `/dashboard/create-activity`;
    window.location.href = link;
  };

  return renderGradeContent(grade, t, t2, gradeImages[grade], handleCardClick);
};