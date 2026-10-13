import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { ActivityPlayer } from "@/features/play/ActivityPlayer";
import { WaitingRoom } from "@/features/play/WaitingRoom";
import { sessionPhase } from "@/lib/play/sessionState";

// La fase de la sesión cambia en vivo cuando el docente inicia o termina.
export const dynamic = "force-dynamic";

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
                    }
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

    return <ActivityPlayer sesion={serialized} />;
}
