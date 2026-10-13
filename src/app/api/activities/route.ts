import type { NextRequest } from "next/server";
import { createActivityForUser } from "@/services/activityWrite/createActivity";
import { activityResponse, readActivityRequest } from "./activityRequest";

/** Crea una actividad del docente en sesión. */
export async function POST(req: NextRequest) {
  const request = await readActivityRequest(req);
  if (!request.ok) return request.response;

  return activityResponse(await createActivityForUser(request.user, request.data), 201);
}
