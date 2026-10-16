import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { getOpenLiveSessions } from "@/features/live/openSessions.server";

/** Sesiones en vivo abiertas del docente, para ofrecerle volver al panel en vivo. */
export async function GET() {
  const t = await getTranslations("Errors");
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    return NextResponse.json({ sessions: await getOpenLiveSessions(user.id) });
  } catch (error) {
    console.error("Error fetching open live sessions:", error);
    return NextResponse.json({ error: t("server") }, { status: 500 });
  }
}
