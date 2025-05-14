import "bootstrap/dist/css/bootstrap.min.css";
import styles from '../../../public/css/bienvenida.module.css';
import { Metadata } from "next";
import getSession from '@/lib/auth/getSession'; 
import { redirect } from 'next/navigation';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getTranslations } from "next-intl/server";
import { SelectGrade } from "@/educator-components";
import prisma from "@/lib/db";


interface Grade {
  id: number;
  grade_type_name: string;
  grade_type_desc?: string | null; // Cambiado a string | null | undefined
  created_date: Date;
  modified_date: Date;
  image_url?: string | null; // Cambiado a string | null | undefined
  key_string?: string | null; // Cambiado a string | null | undefined
}

interface GradesPageProps {
    grades: Grade[];
  }
  

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("WelcomeTeacherView");

    return {
        title: t('metaTitle'),
        description: t('metaDescription')
    };
}

export default async function BienvenidaEducador() {

    const token: DecodedIdToken | null = await getSession();
    const t = await getTranslations("WelcomeTeacherView");

    const grades = await prisma.lUDI_COMMON_GRADE.findMany();

    // Si no hay un usuario autenticado, redirigir a la página de login
    if (!token) {
      redirect('/auth/login');
    }

    return (
        <body className={styles[`body-vistaeducador`]}>
            <main>
                <div className={styles[`texto-bienvenida`]}>
                    <br />
                    <br />
                    <br />
                    <h1>{t('welcomeText')}</h1>
                </div>
                <div className="container">
                    <div className="row">
                      <SelectGrade grades={grades} />
                        <div className={styles[`texto-grados`]}>
                            <h1>{t('text1')}</h1>
                            <h1>{t('text2')}</h1>
                        </div>
                    </div>
                </div>
            </main>
        </body>
    )
}