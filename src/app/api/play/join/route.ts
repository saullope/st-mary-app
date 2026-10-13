import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { issueParticipantToken } from "@/lib/play/participantToken";
import { SESSION_STATE } from "@/lib/play/sessionState";
import { getTranslations } from "next-intl/server";

export async function POST(req: NextRequest) {
    const t = await getTranslations("Errors");
    try {
        const { pin, nombre, avatarId } = await req.json();

        if (!pin || !nombre || !avatarId) {
            return NextResponse.json({ success: false, error: t("missingData") }, { status: 400 });
        }

        const nombreTrimmed = String(nombre).trim();
        if (!/^\d{6}$/.test(String(pin)) || nombreTrimmed.length === 0 || nombreTrimmed.length > 20) {
            return NextResponse.json({ success: false, error: t("invalidJoin") }, { status: 400 });
        }

        // 1. Buscar la sesión por el PIN
        const sesion = await prisma.lUDI_SESION.findFirst({
            where: {
                codigo: pin,
                estado: { in: [SESSION_STATE.waiting, SESSION_STATE.active] }
            },
            include: {
                LUDI_ACTIVIDAD: {
                    include: {
                        activity: true
                    }
                }
            }
        });

        if (!sesion) {
            return NextResponse.json({ success: false, error: t("invalidPin") }, { status: 404 });
        }

        // Validar que no sea una plantilla
        if (sesion.LUDI_ACTIVIDAD.activity.isTemplate) {
            return NextResponse.json({ success: false, error: t("templateNotPlayable") }, { status: 400 });
        }

        // 2. Registrar al participante. Volver a unirse con el mismo nombre genera un
        // código nuevo, así la pestaña anterior deja de poder jugar por él.
        const { token, hash } = issueParticipantToken();
        const participante = await prisma.lUDI_SESION_PARTICIPANTE.upsert({
            where: {
                sesion_id_nombre: {
                    sesion_id: sesion.id,
                    nombre: nombreTrimmed
                }
            },
            update: {
                avatar: {
                    connect: { id: Number(avatarId) }
                },
                puntaje_total: 0,
                completado: false,
                token_hash: hash
            },
            create: {
                LUDI_SESION: {
                    connect: { id: sesion.id }
                },
                nombre: nombreTrimmed,
                avatar: {
                    connect: { id: Number(avatarId) }
                },
                puntaje_total: 0,
                completado: false,
                token_hash: hash
            }
        });

        return NextResponse.json({
            success: true,
            sesionId: sesion.id.toString(),
            participanteId: participante.id.toString(),
            token
        });

    } catch (error: any) {
        console.error("Error join API:", error);
        return NextResponse.json({ success: false, error: t("server") }, { status: 500 });
    }
}
