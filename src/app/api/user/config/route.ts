import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";

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
        defaultIsPublic: false
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

    const body = await request.json();
    const { defaultTimeLimitMs, defaultPoints, defaultVoiceEnabled, defaultIsPublic } = body;

    const config = await prisma.ludiUserConfig.upsert({
      where: { userId: user.id },
      update: {
        defaultTimeLimitMs: Number(defaultTimeLimitMs) || 30000,
        defaultPoints: Number(defaultPoints) || 10,
        defaultVoiceEnabled: Boolean(defaultVoiceEnabled),
        defaultIsPublic: Boolean(defaultIsPublic)
      },
      create: {
        userId: user.id,
        defaultTimeLimitMs: Number(defaultTimeLimitMs) || 30000,
        defaultPoints: Number(defaultPoints) || 10,
        defaultVoiceEnabled: Boolean(defaultVoiceEnabled),
        defaultIsPublic: Boolean(defaultIsPublic)
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating user config:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
