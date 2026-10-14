import styles from '@/styles/pages/bienvenida.module.css';
import { Metadata } from "next";
import getSession from '@/lib/auth/getSession'; 
import { redirect } from 'next/navigation';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getTranslations } from "next-intl/server";
import WelcomeFlow from "./WelcomeFlow";
import prisma from "@/lib/db";
import { pageMetadata } from "@/lib/seo/metadata";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { getSubjectsByGrade, getUserSubjectIdsByGrade } from "@/features/subjects/subjects.server";
import { parseTourProgress, subjectPromptId } from "@/lib/tours/tourProgress";


export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("WelcomeTeacherView");
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription") });
}

export default async function BienvenidaEducador() {

    const token: DecodedIdToken | null = await getSession();
    if (!token) {
        redirect('/auth/login');
      }
    
    const grades = await prisma.lUDI_COMMON_GRADE.findMany();

    // Grados para los que aún no se ofreció elegir clases: sin clases guardadas y sin haberlo omitido.
    const user = await getCurrentUser();
    const [subjectsByGrade, userSubjects, config] = user
        ? await Promise.all([
            getSubjectsByGrade(),
            getUserSubjectIdsByGrade(user.id),
            prisma.ludiUserConfig.findUnique({ where: { userId: user.id }, select: { completedTours: true } }),
        ])
        : [{} as Record<number, never[]>, {} as Record<number, number[]>, null];
    const progress = parseTourProgress(config?.completedTours);
    const pendingSubjectGrades = user
        ? grades
            .map((grade) => grade.id)
            .filter((gradeId) => !userSubjects[gradeId]?.length)
            .filter((gradeId) => ![...progress.completed, ...progress.later].includes(subjectPromptId(gradeId)))
        : [];

    return (
        <div className={styles[`body-vistaeducador`]}>
            <main className="w-100">
                <WelcomeFlow grades={grades} subjectsByGrade={subjectsByGrade} pendingSubjectGrades={pendingSubjectGrades} />
            </main>
        </div>
    )
}
