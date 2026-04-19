import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";

// Set a custom handler to handle BigInt serialization
function replacer(key: string, value: any) {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
}

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // Fetch User and all related data (activities, config, questions)
        const userData = await prisma.ludiUser.findUnique({
            where: { id: user.id },
            include: {
                config: true,
                actividades: {
                    include: {
                        activity: true,
                        config: true,
                        preguntas: {
                            include: {
                                opciones: true,
                            }
                        },
                        memoriaParejas: {
                            include: {
                                tarjetas: {
                                    include: {
                                        recurso: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!userData) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        // Return raw JSON representing the user's data
        // Convert BigInts safely by using our replacer
        const jsonString = JSON.stringify(userData, replacer, 2);

        return new NextResponse(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="user_data_${user.id}.json"`
            }
        });

    } catch (error) {
        console.error("Error exporting data:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
