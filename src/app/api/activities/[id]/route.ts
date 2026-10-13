import { NextResponse, type NextRequest } from "next/server";
import { updateActivityForUser } from "@/services/activityWrite/updateActivity";
import { activityResponse, readActivityRequest } from "../activityRequest";
import { getTranslations } from "next-intl/server";

/** Reemplaza una actividad del docente en sesión. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: (await getTranslations("Errors"))("activityNotFound") }, { status: 404 });

  const request = await readActivityRequest(req);
  if (!request.ok) return request.response;

  // El id de la URL manda sobre cualquier activityId del cuerpo.
  const data = { ...request.data, activityId: Number(id) };
  return activityResponse(await updateActivityForUser(request.user, data), 200);
}
