
import { Metadata } from "next"
import { getTranslations } from "next-intl/server";
import { CardGameActivity } from "@/components/activity";
import prisma from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("createActivityDashboard");

    return {
        title: t('metaTitle'),
        description: t('metaDescription')
    };
}


export default async function CreateActivity() {

    const t = await getTranslations("createActivityDashboard");

    const games = await prisma.aCTIVITY.findMany();

    return (
        <>
            <div className="mb-5">
                <h1>{t('titlePage')}</h1>
            </div>

            <div className="container my-4">
            <div className="row g-4">
            { games && games.map((game) => (
                <CardGameActivity 
                    key={game.id}
                    imageAct={game.image_url || ""}
                    title={t(`${game.activity_name}Title`)}
                    page_to={game.activity_name}
                    subtitle={t(`${game.activity_name}SubTitle`)}
                    description={t(game.activity_desc)}
                    buttonText={t('createText')}
                />
            ))
            }
            </div>
        </div>
        </>
    )
}