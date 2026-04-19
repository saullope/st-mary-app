import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { GameEngine } from "./GameEngine";

export default async function StudentGamePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const sesionId = BigInt(resolvedParams.id);

    const sesion = await (prisma as any).lUDI_SESION.findUnique({
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
                            opciones: { orderBy: { indice: 'asc' } },
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

    // Pass data to Client Component
    return <GameEngine sesion={JSON.parse(JSON.stringify(sesion, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
    ))} />;
}
