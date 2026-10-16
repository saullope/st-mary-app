import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { isSameOrigin } from "@/lib/http/isSameOrigin";
import { getMutedTypes } from "@/features/notifications/notifications.server";
import { NOTIFICATION_TYPES } from "@/features/notifications/notificationTypes";

// Aparte de /api/user/config: allí los campos omitidos vuelven a su valor por defecto.
const preferencesSchema = yup
  .object({
    muted: yup.array(yup.string().required().oneOf([...NOTIFICATION_TYPES])).max(NOTIFICATION_TYPES.length).required(),
  })
  .noUnknown()
  .strict();

export async function GET() {
  const t = await getTranslations("Errors");
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    return NextResponse.json({ muted: await getMutedTypes(user.id) });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json({ error: t("server") }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const t = await getTranslations("Errors");
  try {
    if (!isSameOrigin(request)) return NextResponse.json({ error: t("forbiddenOrigin") }, { status: 403 });
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: t("unauthorized") }, { status: 401 });

    let body: yup.InferType<typeof preferencesSchema>;
    try {
      body = await preferencesSchema.validate(await request.json(), { abortEarly: true });
    } catch {
      return NextResponse.json({ error: t("invalidData") }, { status: 400 });
    }

    const mutedNotifications = JSON.stringify([...new Set(body.muted)]);
    await prisma.ludiUserConfig.upsert({
      where: { userId: user.id },
      update: { mutedNotifications },
      create: { userId: user.id, mutedNotifications },
    });
    return NextResponse.json({ muted: await getMutedTypes(user.id) });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json({ error: t("server") }, { status: 500 });
  }
}
