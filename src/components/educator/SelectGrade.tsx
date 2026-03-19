'use client'

import React, { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/pages/bienvenida.module.css';
import { useTranslations } from "next-intl";

interface Grade {
    id: number;
    grade_type_name: string;
    grade_type_desc?: string | null; // Cambiado a string | null | undefined
    created_date: Date;
    modified_date: Date;
    image_url?: string | null; // Cambiado a string | null | undefined
    key_string?: string | null; // Cambiado a string | null | undefined
}

interface SelectGradeProps {
    grades: Grade[];
}

export const SelectGrade = ({ grades }: SelectGradeProps) => {

    const { setSelectedGrade } = useAuth();
    const [selectedGrade, setSelectedGradeState] = useState<string | null>(null);

    const t = useTranslations("WelcomeTeacherView");

    const localImages: { [key: string]: string } = {
        'Primero.png': '/images/bienvenida/Primero.png',
        'Segundo.png': '/images/bienvenida/Segundo.png',
        'Tercero.png': '/images/bienvenida/Tercero.png'
    };

    const gradeStyles: { [key: string]: string } = {
        'Primero.png': styles['img-primero'],
        'Segundo.png': styles['img-segundo'],
        'Tercero.png': styles['img-tercero']
    };

    const handleGradeSelected = (grade: string) => {
        setSelectedGrade(grade);
        setSelectedGradeState(grade); // Actualiza el estado para el useEffect
        // Guarda el grado seleccionado en una cookie para que el servidor (ej. Plantillas) pueda leerlo inmediatamente
        document.cookie = `selectedGrade=${grade}; path=/; max-age=31536000`;
    };

    // Guarda el grado en localStorage cuando cambia
    useEffect(() => {
        if (selectedGrade) {
            localStorage.setItem('grade', selectedGrade);
        }
    }, [selectedGrade]);

    return (
        <>
            {grades && grades.map((grade) => {

                const imageName = grade.image_url?.split('/').pop() || '';
                const imagePath = grade.image_url
                    ? localImages[grade.image_url.split('/').pop() || ''] || `/api/images/${grade.image_url}`
                    : '/images/bienvenida/Primero.png';  // Imagen por defecto

                    const imageStyle = gradeStyles[imageName] || styles['img-primero'];
                
                return (
                    <div key={grade.id} className="col-12 col-sm-4 text-center">
                        <Link href={`/dashboard`} onClick={() => handleGradeSelected(grade.key_string || '')}>
                            <Image
                                className={`${imageStyle} img-fluid`}
                                src={imagePath}
                                alt={grade.grade_type_name}
                                width={265}
                                height={265}
                                priority
                            />
                        </Link>
                    </div>
                );
            })}
        </>
    )
}
