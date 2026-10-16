import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { isSameOrigin } from "@/lib/http/isSameOrigin";
import {
  DEFAULT_TOUR_PREFERENCES,
  FIRST_ACTIVITY_STATUSES,
  FIRST_ACTIVITY_STEPS,
  TOUR_MODES,
  isValidTourId,
  parseTourProgress,
  serializeTourProgress,
  type TourPreferences,
} from "@/lib/tours/tourProgress";

// Aparte de /api/user/config: allí los campos omitidos vuelven a su valor por
// defecto, y guardar el progreso de una visita no debe tocar las demás preferencias.
const tourIdList = yup.array(yup.string().required().test("tour-id", (id) => isValidTourId(id ?? ""))).max(50);

const toursSchema = yup
  .object({
    toursEnabled: yup.boolean(),
    tourMode: yup.string().oneOf([...TOUR_MODES]),
    completed: tourIdList,
    later: tourIdList,
    firstActivity: yup
      .object({
        status: yup.string().oneOf([...FIRST_ACTIVITY_STATUSES]).required(),
        step: yup.number().integer().min(1).max(FIRST_ACTIVITY_STEPS).required(),
      })
      .noUnknown()
      .default(undefined),
  })
  .noUnknown()
  .strict();

async function readPreferences(userId: string): Promise<TourPreferences> {
  const config = await prisma.ludiUserConfig.findUnique({
    where: { userId },
    select: { toursEnabled: true, tourMode: true, completedTours: true },
  });
  if (!config) return DEFAULT_TOUR_PREFERENCES;
  return {
    toursEnabled: config.toursEnabled,
    tourMode: config.tourMode === "hints" ? "hints" : "full",
    ...parseTourProgress(config.completedTours),
  };
}

export async function GET() {
  const t = await getTranslations("Errors");
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    return NextResponse.json(await readPreferences(user.id));
  } catch (error) {
    console.error("Error fetching tour preferences:", error);
    return NextResponse.json({ error: t("server") }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const t = await getTranslations("Errors");
  try {
    if (!isSameOrigin(request)) return NextResponse.json({ error: t("forbiddenOrigin") }, { status: 403 });
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: t("unauthorized") }, { status: 401 });

    let body: yup.InferType<typeof toursSchema>;
    try {
      body = await toursSchema.validate(await request.json(), { abortEarly: true });
    } catch {
      return NextResponse.json({ error: t("invalidData") }, { status: 400 });
    }

    const current = await readPreferences(user.id);
    const next: TourPreferences = {
      toursEnabled: body.toursEnabled ?? current.toursEnabled,
      tourMode: body.tourMode ?? current.tourMode,
      completed: (body.completed as string[] | undefined) ?? current.completed,
      later: (body.later as string[] | undefined) ?? current.later,
      firstActivity: (body.firstActivity as TourPreferences["firstActivity"] | undefined) ?? current.firstActivity,
    };
    const data = {
      toursEnabled: next.toursEnabled,
      tourMode: next.tourMode,
      completedTours: serializeTourProgress(next),
    };

    await prisma.ludiUserConfig.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });

    return NextResponse.json(next);
  } catch (error) {
    console.error("Error updating tour preferences:", error);
    return NextResponse.json({ error: t("server") }, { status: 500 });
  }
}
