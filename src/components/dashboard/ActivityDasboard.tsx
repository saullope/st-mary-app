'use client';

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CardGrade, CardActivity } from "@/components/educator";
import styles from '@/styles/pages/create-activity.module.css';

// Static image URLs
const IMAGES = {
  // Primer Grado
  primerGrado: '/images/primer-grado/PrimerGrado.png',
  misActividades: '/images/primer-grado/Mis-actividades.png',
  crearActividades: '/images/primer-grado/Crear-actividades.png',
  matFirst: '/images/primer-grado/BannerMat.png',
  lenguaLitFirst: '/images/primer-grado/BannerLyL.png',
  tecnoFirst: '/images/primer-grado/BannerTecno.png',
  // Segundo Grado
  segundoGrado: '/images/segundo-grado/SegundoGrado.png',
  matSecond: '/images/segundo-grado/BannerMat-Segundo.png',
  lenguaLitSecond: '/images/segundo-grado/BannerLyL-Segundo.png',
  tecnoSecond: '/images/segundo-grado/BannerTecno-Segundo.png',
  // Tercer Grado
  tercerGrado: '/images/tercer-grado/TercerGrado.png',
  matThird: '/images/tercer-grado/BannerMat-Tercero.png',
  lenguaLitThird: '/images/tercer-grado/BannerLyL-Tercero.png',
  tecnoThird: '/images/tercer-grado/BannerTecno-Tercero.png',
} as const;
import { useTranslations } from "next-intl";

type GradeKey = 'firstGrade' | 'secondGrade' | 'thirdGrade';

const renderGradeContent = (grade: GradeKey, t: any, t2: any, images: any, onCardClick: (grade: string) => void, onGoToTemplates: (grade: string) => void) => (
  <>
    <div className={styles['container-card-activity']}>
      <CardGrade cardTitle={t('gradeName')} cardAlt={`Crear Actividades ${grade}`} srcImageGrade={images.gradeImage} />
      <CardActivity cardTitle={t('createActivity')} cardAlt="Crear Actividades" srcImageGrade={IMAGES.crearActividades} typeButton="primary" onClick={onCardClick} />
      <CardActivity cardTitle={t('myActivities')} cardAlt="Crear Actividades" srcImageGrade={IMAGES.misActividades} typeButton="primary" onClick={onCardClick} />
    </div>
    <div className={`${styles['text-plantillas-activity']} pt-2 pb-2`}>
      <h2 className={`${styles.h2} text-center`}>{t2('ludiTemplates')}</h2>
      <h4 className={`${styles.h4} text-center`}>{`"${t2('ludiTemplatesText')}"`}</h4>
      <br />
    </div>
    <div className={styles['container-card-activity']}>
      <CardActivity cardTitle="Matemáticas" cardAlt="Matemáticas" srcImageGrade={images.matImage} typeButton="success" onClick={onGoToTemplates} />
      <CardActivity cardTitle="Lengua y Literatura" cardAlt="Lengua y Literatura" srcImageGrade={images.lenguaLitImage} typeButton="success" onClick={onGoToTemplates} />
      <CardActivity cardTitle="Tecnología" cardAlt="Tecnología" srcImageGrade={images.tecnoImage} typeButton="success" onClick={onGoToTemplates} />
    </div>
  </>
);

export const ActivityDasboard = () => {
  const { setSelectedGrade } = useAuth();
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
      gradeImage: IMAGES.primerGrado,
      matImage: IMAGES.matFirst,
      lenguaLitImage: IMAGES.lenguaLitFirst,
      tecnoImage: IMAGES.tecnoFirst,
    },
    secondGrade: {
      gradeImage: IMAGES.segundoGrado,
      matImage: IMAGES.matSecond,
      lenguaLitImage: IMAGES.lenguaLitSecond,
      tecnoImage: IMAGES.tecnoSecond,
    },
    thirdGrade: {
      gradeImage: IMAGES.tercerGrado,
      matImage: IMAGES.matThird,
      lenguaLitImage: IMAGES.lenguaLitThird,
      tecnoImage: IMAGES.tecnoThird,
    },
  };

  const handleCardClick = (grade: string) => {
    // Define the link based on the card title
    const link = `/dashboard/create-activity`;
    window.location.href = link;
  };

  const handleGoToTemplates = (grade: string) => {
    const link = `/dashboard/templates`;
    window.location.href = link;
  }

  return renderGradeContent(grade, t, t2, gradeImages[grade], handleCardClick, handleGoToTemplates);
};