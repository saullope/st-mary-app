'use client'

import React, { useContext } from 'react';
import { SessionContext } from "@/contexts/SessionContext";
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../public/css/bienvenida.module.css';
import imgPrimero from '../../public/images/bienvenida/Primero.png';
import imgSegundo from '../../public/images/bienvenida/Segundo.png';
import imgTercero from '../../public/images/bienvenida/Tercero.png';
import { useTranslations } from "next-intl";


export const SelectGrade = () => {

    const { setSelectedGrade } = useContext(SessionContext);

    const t = useTranslations("WelcomeTeacherView");

    const handleGradeSelected = (grade: string) => {
        setSelectedGrade(grade);
    }

    return (
        <>
            <div className="col-12 col-sm-4 text-center">
                <Link href={'/dashboard?grade=firstGrade'} onClick={() => handleGradeSelected("firstGrade")}>
                    <Image className={`${styles['img-primero']} img-fluid`}
                        src={imgPrimero}
                        alt={t('grade1')} />
                </Link>
            </div>
            <div className="col-12 col-sm-4 text-center">
                <Link href={'/dashboard?grade=secondGrade'} onClick={() => handleGradeSelected("secondGrade")}>
                    <Image className={`${styles['img-segundo']} img-fluid`}
                        src={imgSegundo}
                        alt={t('grade2')} />
                </Link>
            </div>
            <div className="col-12 col-sm-4 text-center">
                <Link href={'/dashboard?grade=thirdGrade'} onClick={() => handleGradeSelected("thirdGrade")}>
                    <Image className={`${styles['img-tercero']} img-fluid`}
                        src={imgTercero}
                        alt={t('grade3')} />
                </Link>
            </div>
        </>
    )
}
