import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { getTranslations } from "next-intl/server";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { isSameOrigin } from "@/lib/http/isSameOrigin";
import { listNotifications, markNotificationsRead } from "@/features/notifications/notifications.server";

const markSchema = yup
  .object({
    ids: yup.array(yup.string().required().matches(/^\d{1,19}$/)).max(50),
    all: yup.boolean(),
  })
  .noUnknown()
  .strict()
  .test("ids-or-all", (value) => value.all === true || (value.ids?.length ?? 0) > 0);

export async function GET() {
  const t = await getTranslations("Errors");
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    return NextResponse.json(await listNotifications(user.id));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: t("server") }, { status: 500 });
  }
}

/** Marca como leídas las notificaciones indicadas (`ids`) o todas (`all: true`). */
export async function PATCH(request: NextRequest) {
  const t = await getTranslations("Errors");
  try {
    if (!isSameOrigin(request)) return NextResponse.json({ error: t("forbiddenOrigin") }, { status: 403 });
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: t("unauthorized") }, { status: 401 });

    let body: yup.InferType<typeof markSchema>;
    try {
      body = await markSchema.validate(await request.json(), { abortEarly: true });
    } catch {
      return NextResponse.json({ error: t("invalidData") }, { status: 400 });
    }

    await markNotificationsRead(user.id, body.all ? "all" : (body.ids as string[]));
    return NextResponse.json(await listNotifications(user.id));
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: t("server") }, { status: 500 });
  }
}
