import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const roles = [
    { nombre: 'ADMIN', descripcion: 'Administrador del sistema' },
    { nombre: 'EDUCADOR', descripcion: 'Profesor o guía' },
    { nombre: 'ESTUDIANTE', descripcion: 'Estudiante o alumno' },
  ]

  for (const role of roles) {
    await prisma.ludiRol.upsert({
      where: { nombre: role.nombre },
      update: {},
      create: {
        nombre: role.nombre,
        descripcion: role.descripcion,
      },
    })
  }

  console.log('Roles seeded successfully.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
