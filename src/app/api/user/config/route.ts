import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import * as yup from "yup";
import { DEFAULT_VOICE_PROFILE, VOICE_GENDERS, VOICE_SPEEDS } from "@/features/gamification/voiceProfile";

// Campos omitidos conservan su valor por defecto, como hacía la versión sin validar.
const configSchema = yup.object({
  defaultTimeLimitMs: yup.number().integer().min(1000).max(600000).default(30000),
  defaultPoints: yup.number().integer().min(1).max(10000).default(10),
  defaultVoiceEnabled: yup.boolean().default(true),
  defaultIsPublic: yup.boolean().default(false),
  enableStudentFeedback: yup.boolean().default(true),
  enableTeacherEvaluation: yup.boolean().default(true),
  voiceGender: yup.string().oneOf([...VOICE_GENDERS]).default(DEFAULT_VOICE_PROFILE.gender),
  voiceSpeed: yup.string().oneOf([...VOICE_SPEEDS]).default(DEFAULT_VOICE_PROFILE.speed),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const config = await prisma.ludiUserConfig.findUnique({
      where: { userId: user.id },
    });

    if (!config) {
      return NextResponse.json({
        defaultTimeLimitMs: 30000,
        defaultPoints: 10,
        defaultVoiceEnabled: true,
        defaultIsPublic: false,
        enableStudentFeedback: true,
        enableTeacherEvaluation: true,
        voiceGender: DEFAULT_VOICE_PROFILE.gender,
        voiceSpeed: DEFAULT_VOICE_PROFILE.speed,
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching user config:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    let updateData: yup.InferType<typeof configSchema>;
    try {
      updateData = await configSchema.validate(await request.json(), { abortEarly: true, stripUnknown: true });
    } catch {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const config = await prisma.ludiUserConfig.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating user config:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
