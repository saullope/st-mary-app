import type { PrismaClient } from '@prisma/client'

// Clases de primaria (1.º a 3.º) basadas en el currículo del MINED. El texto vive en
// messages/{es,en}.json (Subjects.<codigo>), así que codigo no debe cambiar; para
// retirar una clase se pone activo = false.

type SubjectSeed = { codigo: string; grados: number[] }

export const SUBJECTS: SubjectSeed[] = [
  { codigo: 'lengua-literatura', grados: [1, 2, 3] },
  { codigo: 'matematica', grados: [1, 2, 3] },
  { codigo: 'conociendo-mi-mundo', grados: [1, 2, 3] },
  { codigo: 'creciendo-en-valores', grados: [1, 2, 3] },
  { codigo: 'educacion-fisica', grados: [1, 2, 3] },
  { codigo: 'expresion-cultural-artistica', grados: [1, 2, 3] },
  { codigo: 'taller-arte-cultura', grados: [1, 2, 3] },
  { codigo: 'efemerides', grados: [1, 2, 3] },
]

export async function seedSubjectCatalog(prisma: PrismaClient) {
  for (const [orden, subject] of SUBJECTS.entries()) {
    const materia = await prisma.ludiMateria.upsert({
      where: { codigo: subject.codigo },
      update: { orden },
      create: { codigo: subject.codigo, orden },
    })
    // Los grados de la semilla mandan: se agregan los nuevos y se quitan los que ya no están.
    await prisma.ludiMateriaGrado.deleteMany({ where: { materiaId: materia.id, gradoId: { notIn: subject.grados } } })
    for (const gradoId of subject.grados) {
      await prisma.ludiMateriaGrado.upsert({
        where: { materiaId_gradoId: { materiaId: materia.id, gradoId } },
        update: {},
        create: { materiaId: materia.id, gradoId },
      })
    }
  }
}
