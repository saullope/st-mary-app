import prisma from "@/lib/db";
import type { Subject } from "./subjectSchemas";

/** Clases activas que se ofrecen en cada grado, en el orden del catálogo. */
export async function getSubjectsByGrade(): Promise<Record<number, Subject[]>> {
  const links = await prisma.ludiMateriaGrado.findMany({
    where: { materia: { activo: true } },
    select: { gradoId: true, materia: { select: { id: true, codigo: true, orden: true } } },
    orderBy: [{ gradoId: "asc" }, { materia: { orden: "asc" } }],
  });
  const byGrade: Record<number, Subject[]> = {};
  for (const { gradoId, materia } of links) {
    (byGrade[gradoId] ??= []).push({ id: materia.id, codigo: materia.codigo });
  }
  return byGrade;
}

/** Ids de las clases que el educador eligió, agrupados por grado. */
export async function getUserSubjectIdsByGrade(userId: string): Promise<Record<number, number[]>> {
  const rows = await prisma.ludiUsuarioMateria.findMany({
    where: { userId },
    select: { gradoId: true, materiaId: true },
  });
  const byGrade: Record<number, number[]> = {};
  for (const { gradoId, materiaId } of rows) (byGrade[gradoId] ??= []).push(materiaId);
  return byGrade;
}

/**
 * Reemplaza las clases del educador para un grado. Devuelve false si alguna no se
 * ofrece en ese grado (o está retirada) y no cambia nada.
 */
export async function saveUserSubjects(userId: string, gradoId: number, materiaIds: number[]): Promise<boolean> {
  const ids = [...new Set(materiaIds)];
  return prisma.$transaction(async (tx) => {
    const allowed = await tx.ludiMateriaGrado.count({
      where: { gradoId, materiaId: { in: ids }, materia: { activo: true } },
    });
    if (allowed !== ids.length) return false;
    await tx.ludiUsuarioMateria.deleteMany({ where: { userId, gradoId } });
    if (ids.length > 0) {
      await tx.ludiUsuarioMateria.createMany({ data: ids.map((materiaId) => ({ userId, gradoId, materiaId })) });
    }
    return true;
  });
}
