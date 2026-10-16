import { NextResponse, type NextRequest } from "next/server";
import * as yup from "yup";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { isSameOrigin } from "@/lib/http/isSameOrigin";
import { ACTIVITY_TYPES, type ActivityData, type ActivityWriteResult, type ActivityWriter } from "@/services/activityWrite/types";
import { getTranslations } from "next-intl/server";

// Forma general del cuerpo. El contenido de cada tipo (preguntas, bloques,
// imágenes) lo valida el servicio, antes de abrir la transacción.
const activitySchema = yup.object({
  title: yup.string().required().matches(/\S/, "El título no puede estar vacío.").max(100),
  type: yup.string().oneOf(ACTIVITY_TYPES).required(),
  questions: yup.array().required(),
  config: yup.object({
    gradeId: yup.number().integer().required(),
    timeLimit: yup.number().required(),
    pointsPerCorrect: yup.number().required(),
    selectedBadges: yup.array(yup.string().required()).required(),
    selectedMissions: yup.array(yup.string().required()).required(),
    voiceEnabled: yup.boolean().required(),
    speedBonus: yup.boolean(),
  }).required(),
  backgroundImage: yup.string().nullable(),
  memoryImages: yup.array(yup.string().required()),
  lessonBlocks: yup.array(),
  formQuestions: yup.array(),
});

const errorResponse = (error: string, status: number) => NextResponse.json({ error }, { status });

type ActivityRequest =
  | { ok: true; user: ActivityWriter; data: ActivityData }
  | { ok: false; response: NextResponse };

/** Origen, sesión y cuerpo, en ese orden, antes de llegar al servicio. */
export async function readActivityRequest(req: NextRequest): Promise<ActivityRequest> {
  const t = await getTranslations("Errors");
  if (!isSameOrigin(req)) return { ok: false, response: errorResponse(t("forbiddenOrigin"), 403) };

  const user = await getCurrentUser();
  if (!user) return { ok: false, response: errorResponse(t("unauthorized"), 401) };

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { ok: false, response: errorResponse(t("invalidData"), 400) };
  }
  try {
    // strict: sin conversiones, porque al servicio llega el cuerpo original.
    await activitySchema.validate(body, { abortEarly: true, strict: true });
  } catch (error) {
    // El detalle de Yup sirve para depurar; al usuario se le muestra un mensaje traducido.
    console.warn("Invalid activity body:", error instanceof yup.ValidationError ? error.message : error);
    return { ok: false, response: errorResponse(t("invalidData"), 400) };
  }
  // Validado arriba en su forma general; se pasa tal cual al servicio.
  return { ok: true, user, data: body as ActivityData };
}

export function activityResponse(result: ActivityWriteResult, successStatus: number) {
  if ("error" in result) return errorResponse(result.error, result.status);
  return NextResponse.json(result, { status: successStatus });
}
