import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { ActivityPlayer } from "@/features/play/ActivityPlayer";
import { WaitingRoom } from "@/features/play/WaitingRoom";
import { AchievementCatalogLoader } from "@/features/gamification/AchievementCatalogLoader";
import { sessionPhase } from "@/lib/play/sessionState";
import { ACTIVITY_ACHIEVEMENTS_INCLUDE } from "@/features/gamification/activityAchievements";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

// La fase de la sesión cambia en vivo cuando el docente inicia o termina.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const t = await getTranslations("Metadata.studentPlay");
  const { id } = await params;
  const sesion = /^\d+$/.test(id)
    ? await prisma.lUDI_SESION.findUnique({ where: { id: BigInt(id) }, select: { LUDI_ACTIVIDAD: { select: { activity: { select: { activity_name: true } } } } } })
    : null;
  const activity = sesion?.LUDI_ACTIVIDAD.activity.activity_name;
  return pageMetadata({ title: activity ? t("title", { activity }) : t("fallbackTitle"), description: t("description") });
}

export default async function StudentGamePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    if (!/^\d+$/.test(resolvedParams.id)) notFound();
    const sesionId = BigInt(resolvedParams.id);

    const sesion = await prisma.lUDI_SESION.findUnique({
        where: { id: sesionId },
        include: {
            user: { include: { config: true } },
            LUDI_ACTIVIDAD: {
                include: {
                    activity: true,
                    tipoActividad: true,
                    config: true,
                    preguntas: {
                        where: { activo: true },
                        orderBy: { numero: 'asc' },
                        include: {
                            opciones: { orderBy: { indice: 'asc' }, include: { opcionRecursos: { include: { recurso: true } } } },
                            preguntaRecursos: {
                                include: {
                                    recurso: {
                                        include: { tipo: true }
                                    }
                                }
                            }
                        }
                    },
                    memoriaParejas: {
                        include: {
                            tarjetas: { include: { recurso: true } }
                        }
                    },
                    ...ACTIVITY_ACHIEVEMENTS_INCLUDE
                }
            }
        }
    });

    if (!sesion) {
        notFound();
    }

    const serialized = JSON.parse(JSON.stringify(sesion, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));

    // Solo se juega cuando el docente inició la actividad desde el panel en vivo.
    const phase = sessionPhase(sesion.estado);
    if (phase !== "active") {
        return <WaitingRoom sesion={serialized} phase={phase} />;
    }

    return (
        <AchievementCatalogLoader>
            <ActivityPlayer sesion={serialized} />
        </AchievementCatalogLoader>
    );
}
