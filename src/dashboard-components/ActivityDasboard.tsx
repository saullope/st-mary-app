// src/dashboar-components/ActivityDashboard

'use client';

import React, { useContext, useEffect } from "react";
import { SessionContext } from "@/contexts/SessionContext";
import { CardGrade, CardActivity } from "@/educator-components";
import PrimerGrado from '../../public/images/primer-grado/PrimerGrado.png';
import MisActividades from '../../public/images/primer-grado/Mis-actividades.png';
import CrearActividades from '../../public/images/primer-grado/Crear-actividades.png'
import MatImage from '../../public/images/primer-grado/BannerMat.png';
import LenguaLit from '../../public/images/primer-grado/BannerLyL.png';
import Tecno from '../../public/images/primer-grado/BannerTecno.png';
import styles from '../../public/css/create-activity.module.css';
import { useTranslations } from "next-intl";

export const ActivityDasboard = ({grade}: {grade: string}) => {

    const { setSelectedGrade } = useContext(SessionContext);
    const t = useTranslations(`${grade}ItemDashboard`);
    const t2 = useTranslations('textDashboard'); 
    
    useEffect(() => {
        if (grade) {
          setSelectedGrade(grade);
        }
      }, [grade, setSelectedGrade]);


    return (
        <>
        <div className={styles['container-card-activity']}>
            <CardGrade cardTitle={t('gradeName')} cardAlt="Crear Actividades Primer Grado" srcImageGrade={PrimerGrado} />
            <CardActivity cardTitle={t('createActivity')} cardAlt="Crear Actividades" srcImageGrade={CrearActividades} typeButton="primary"/>
            <CardActivity cardTitle={t('myActivities')} cardAlt="Crear Actividades" srcImageGrade={MisActividades} typeButton="primary"/>
        </div>
        <div className={`${styles['text-plantillas-activity']} pt-2 pb-2`}>
                <h2 className={`${styles.h2} text-center`}>{t2('ludiTemplates')}</h2>
                <h4 className={`${styles.h4} text-center`}>{`"${t2('ludiTemplatesText')}"`}</h4>
                <br />
            </div>
        <div className={styles['container-card-activity']}>
        <CardActivity cardTitle="Matemáticas" cardAlt="Matemáticas" srcImageGrade={MatImage} typeButton="success"/>
        <CardActivity cardTitle="Lengua y Literatura" cardAlt="Lengua y Literatura" srcImageGrade={LenguaLit} typeButton="success"/>
        <CardActivity cardTitle="Tecnología" cardAlt="Tecnología" srcImageGrade={Tecno} typeButton="success"/>
        </div>
        </>
    )
}