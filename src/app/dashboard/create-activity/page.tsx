import { Metadata } from "next"
import { getTranslations } from "next-intl/server";
import { CardGameActivity } from "@/components/activity";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import getSession from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import CreateActivityTour from "./CreateActivityTour";

// Import images from public/images via alias
import LudiquizImg from "@/images/ludiquiz.png";
import MemoryImg from "@/images/memory.png";
import TrueOrFalseImg from "@/images/verdadero-falso.png";
import LudiLeccionImg from "@/images/mejora-aprendizaje.png";
import LudiFormImg from "@/images/fomenta-interes.png";
import { cookies } from "next/headers";
import { GRADE_COOKIE_NAME, gradeIdFromKey } from "@/lib/grades";
import { isFormAvailableForGrade } from "@/features/form/formQuestions";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("createActivityDashboard");
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription") });
}

export default async function CreateActivity() {
    const user = await getCurrentUser();
    const session = await getSession();

    if (!user || !session) {
        redirect("/auth/login");
    }

    const t = await getTranslations("createActivityDashboard");
    const selectedGrade = gradeIdFromKey((await cookies()).get(GRADE_COOKIE_NAME)?.value);

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
        },
        {
            id: 'ludileccion',
            image: LudiLeccionImg,
            translationKey: 'ludileccion',
            route: 'ludileccion'
        },
        // LudiForm solo se ofrece cuando el grado elegido en Bienvenida es tercero.
        ...(isFormAvailableForGrade(selectedGrade) ? [{
            id: 'ludiform',
            image: LudiFormImg,
            translationKey: 'ludiform',
            route: 'ludiform'
        }] : [])
    ];

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 0' }}>
            {/** <CreateActivityTour /> */}
            <section>
                <h2 className={designStyles.titleLudi}>
                    <span className={designStyles.star}>★</span> {t('titlePage')}
                </h2>

                    <div className={designStyles.createCards}>
                        {gameTemplates.map((game) => (
                            <CardGameActivity 
                                key={game.id}
                                imageAct={game.image}
                                title={t(`${game.translationKey}Title`)}
                                page_to={game.route}
                                subtitle={t(`${game.translationKey}SubTitle`)}
                                description={t(`${game.translationKey}_desc`)}
                                buttonText={t('createText')}
                                typeId={game.id}
                            />
                        ))}
                    </div>

            </section>
        </div>
    )
}
