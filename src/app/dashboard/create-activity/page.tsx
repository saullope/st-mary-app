import { Metadata } from "next"
import { getTranslations } from "next-intl/server";
import { CardGameActivity } from "@/components/activity";
import styles from "@/styles/pages/create-activity.module.css";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import getSession from "@/lib/auth/getSession";
import { redirect } from "next/navigation";

// Import images from public/images via alias
import LudiquizImg from "@/images/ludiquiz.png";
import MemoryImg from "@/images/memory.png";
import TrueOrFalseImg from "@/images/verdadero-falso.png";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("createActivityDashboard");

    return {
        title: t('metaTitle'),
        description: t('metaDescription')
    };
}

export default async function CreateActivity() {
    const user = await getCurrentUser();
    const session = await getSession();

    if (!user || !session) {
        redirect("/auth/login");
    }

    const t = await getTranslations("createActivityDashboard");

    // Static definition of supported game templates
    const gameTemplates = [
        {
            id: 'ludiquiz',
            image: LudiquizImg,
            translationKey: 'ludiquiz',
            route: 'ludiquiz'
        },
        {
            id: 'ludimemory',
            image: MemoryImg,
            translationKey: 'ludimemory',
            route: 'ludimemory'
        },
        {
            id: 'trueorfalse',
            image: TrueOrFalseImg,
            translationKey: 'trueorfalse',
            route: 'trueorfalse'
        }
    ];

    return (
        <div className={styles.pageContainer}>
            <div className="mb-5">
                <h1 className={styles.headerTitle}>{t('titlePage')}</h1>
            </div>

            <div className="container my-4">
                <div className="row g-4">
                    {gameTemplates.map((game) => (
                        <CardGameActivity 
                            key={game.id}
                            imageAct={game.image}
                            title={t(`${game.translationKey}Title`)}
                            page_to={game.route}
                            subtitle={t(`${game.translationKey}SubTitle`)}
                            description={t(`${game.translationKey}_desc`)}
                            buttonText={t('createText')}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
