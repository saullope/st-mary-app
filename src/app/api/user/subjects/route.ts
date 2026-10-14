import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { getTranslations } from "next-intl/server";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { isSameOrigin } from "@/lib/http/isSameOrigin";
import { userSubjectsSchema } from "@/features/subjects/subjectSchemas";
import { getSubjectsByGrade, getUserSubjectIdsByGrade, saveUserSubjects } from "@/features/subjects/subjects.server";

/** Catálogo de clases por grado y las que eligió el educador de la sesión. */
export async function GET() {
  const t = await getTranslations("Errors");
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    const [catalog, selected] = await Promise.all([getSubjectsByGrade(), getUserSubjectIdsByGrade(user.id)]);
    return NextResponse.json({ catalog, selected });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: t("server") }, { status: 500 });
  }
}

/** Reemplaza las clases del educador para un grado. */
export async function PUT(request: NextRequest) {
  const t = await getTranslations("Errors");
  try {
    if (!isSameOrigin(request)) return NextResponse.json({ error: t("forbiddenOrigin") }, { status: 403 });
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: t("unauthorized") }, { status: 401 });

    let body: yup.InferType<typeof userSubjectsSchema>;
    try {
      body = await userSubjectsSchema.validate(await request.json(), { abortEarly: true });
    } catch {
      return NextResponse.json({ error: t("invalidData") }, { status: 400 });
    }

    const saved = await saveUserSubjects(user.id, body.gradeId, body.materiaIds);
    if (!saved) return NextResponse.json({ error: t("invalidData") }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving subjects:", error);
    return NextResponse.json({ error: t("server") }, { status: 500 });
  }
}
