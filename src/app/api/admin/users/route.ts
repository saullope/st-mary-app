import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { adminAuth } from "@/firebase/firebase-admin";

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.rolId !== 1) { // 1 = Admin
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        // Fetch all educators (rolId = 2) or any user except admins
        const users = await prisma.ludiUser.findMany({
            where: {
                rolId: { not: 1 } // Traemos a todos los que NO son administradores (ej. educadores)
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                firebaseUid: true,
                createdAt: true,
                rol: {
                    select: { nombre: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.rolId !== 1) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const url = new URL(request.url);
        const userId = url.searchParams.get("id");

        if (!userId) {
            return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
        }

        const targetUser = await prisma.ludiUser.findUnique({
            where: { id: userId }
        });

        if (!targetUser) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        // Prevent admin from deleting themselves or other admins
        if (targetUser.rolId === 1) {
            return NextResponse.json({ error: "No se puede eliminar a otro administrador" }, { status: 403 });
        }

        // 1. Delete from Prisma (Cascade will handle activities and sessions)
        await prisma.ludiUser.delete({
            where: { id: userId }
        });

        // 2. Delete from Firebase if a firebaseUid exists
        if (targetUser.firebaseUid) {
            try {
                await adminAuth.deleteUser(targetUser.firebaseUid);
            } catch (firebaseError: any) {
                console.error("Error deleting from Firebase (might already be deleted):", firebaseError);
                // Proceed since DB record is deleted
            }
        }

        return NextResponse.json({ success: true, message: "Usuario eliminado exitosamente" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}