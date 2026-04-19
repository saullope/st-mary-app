import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const avatars = [
      { nombre: "Astro-Panda", urlImagen: "/images/avatars/avatar1.png" },
      { nombre: "Ciber-Gato", urlImagen: "/images/avatars/avatar2.png" },
      { nombre: "Robot-Z", urlImagen: "/images/avatars/avatar3.png" },
      { nombre: "Zorro-Flash", urlImagen: "/images/avatars/avatar4.png" },
      { nombre: "Búho-Sabio", urlImagen: "/images/avatars/avatar5.png" },
      { nombre: "Súper-Conejo", urlImagen: "/images/avatars/avatar6.png" },
    ];

    for (const avatarData of avatars) {
        // Buscamos si ya existe por nombre para evitar duplicados
        const existing = await (prisma as any).ludiAvatar.findFirst({
            where: { nombre: avatarData.nombre }
        });

        if (existing) {
            // Si existe, lo actualizamos (sin tocar el ID)
            await (prisma as any).ludiAvatar.update({
                where: { id: existing.id },
                data: {
                    urlImagen: avatarData.urlImagen,
                },
            });
        } else {
            // Si no existe, lo creamos y dejamos que SQL Server asigne el ID automáticamente
            await (prisma as any).ludiAvatar.create({
                data: {
                    nombre: avatarData.nombre,
                    urlImagen: avatarData.urlImagen,
                },
            });
        }
    }

    return NextResponse.json({ success: true, message: "Avatares procesados exitosamente." });
  } catch (error: any) {
    console.error("Error seeding avatars:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
