'use client'

import React from 'react';
import Image from "next/image";
import Link from "next/link";
import designStyles from '@/styles/pages/LudiDesign.module.css';
import { StaticImageData } from "next/image";

interface CardGameActivityProps {
    imageAct: string | StaticImageData;
    title: string;
    page_to: string;
    subtitle: string;
    description: string;
    buttonText: string;
    typeId?: string;
}

export const CardGameActivity = ({ imageAct, title, page_to, subtitle, description, buttonText, typeId }: CardGameActivityProps) => {
    
    let bgClass = designStyles.cardQuiz;
    if (typeId === 'ludimemory') bgClass = designStyles.cardMemory;
    if (typeId === 'trueorfalse') bgClass = designStyles.cardTrueFalse;

    return (
        <div className="col-12 col-md-6 col-lg-4 d-flex justify-content-center">
            <Link href={`/create/${page_to}`} className={`${designStyles.createCard} ${bgClass}`} style={{ textDecoration: 'none' }}>
                {typeof imageAct === 'string' ? (
                    <img src={imageAct} className={designStyles.createImg} alt={title} />
                ) : (
                    <Image src={imageAct} className={designStyles.createImg} alt={title} style={{ objectFit: 'contain' }} />
                )}
                
                <div className={designStyles.createBody}>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                        <span className={designStyles.btnCreate}>
                            {buttonText}
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}