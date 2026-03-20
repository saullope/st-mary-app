import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { GameEngine } from "./GameEngine";

export default async function StudentGamePage({ params }: { params: { id: string } }) {
    const sesionId = BigInt(params.id);

    const sesion = await (prisma as any).lUDI_SESION.findUnique({
        where: { id: sesionId },
        include: {
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
