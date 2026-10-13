import { StudentLobby } from "./StudentLobby";
import prisma from "@/lib/db";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return pageMetadata({ title: t("play.title"), description: t("play.description"), path: "/play", index: true });
}

export default async function PlayLobbyPage() {
    // Fetch avatars from DB
    let avatars: { id: number; nombre: string; urlImagen: string; activo: boolean }[] = [];
    try {
        avatars = await prisma.ludiAvatar.findMany({
            where: { activo: true }
        });
    } catch (e) {
        console.error("Error fetching avatars, using fallbacks", e);
    }

    // Fallback if no avatars found (for first run or DB error)
    if (avatars.length === 0) {
        avatars = [
            { id: 1, nombre: "Avatar 1", urlImagen: "/images/avatars/avatar1.png", activo: true },
            { id: 2, nombre: "Avatar 2", urlImagen: "/images/avatars/avatar2.png", activo: true },
            { id: 3, nombre: "Avatar 3", urlImagen: "/images/avatars/avatar3.png", activo: true },
            { id: 4, nombre: "Avatar 4", urlImagen: "/images/avatars/avatar4.png", activo: true },
            { id: 5, nombre: "Avatar 5", urlImagen: "/images/avatars/avatar5.png", activo: true },
            { id: 6, nombre: "Avatar 6", urlImagen: "/images/avatars/avatar6.png", activo: true },
        ];
    }

    return <StudentLobby avatars={avatars} />;
}
