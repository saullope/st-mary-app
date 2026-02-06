import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET: Fetch all active themes
export async function GET() {
    try {
        const themes = await prisma.ludiTema.findMany({
            where: {
                activo: true,
            },
            orderBy: {
                id: 'asc',
            },
            select: {
                id: true,
                nombre: true,
                imageUrl: true,
                descripcion: true,
            },
        });

        // Convert BigInt to Number for JSON serialization
        const serializedThemes = themes.map((theme) => ({
            id: Number(theme.id),
            nombre: theme.nombre,
            imageUrl: theme.imageUrl,
            descripcion: theme.descripcion,
        }));

        return NextResponse.json(serializedThemes, { status: 200 });
    } catch (error) {
        console.error('Error fetching themes:', error);
        return NextResponse.json(
            { error: 'Error fetching themes' },
            { status: 500 }
        );
    }
}

