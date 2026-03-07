import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Roles
  const roles = [
    { nombre: 'ADMIN', descripcion: 'Administrador del sistema' },
    { nombre: 'EDUCADOR', descripcion: 'Profesor o guía' },
    { nombre: 'ESTUDIANTE', descripcion: 'Estudiante o alumno' },
  ]

  for (const role of roles) {
    await prisma.ludiRol.upsert({
      where: { nombre: role.nombre },
      update: {},
      create: { nombre: role.nombre, descripcion: role.descripcion },
    })
  }

  // Tipos de Actividad
  const tiposActividad = [
    { id: 1, nombre: 'LUDIQUIZ' },
    { id: 2, nombre: 'TRUEORFALSE' },
    { id: 3, nombre: 'LUDYMEMORY' }
  ];

  for (const tipo of tiposActividad) {
    await prisma.ludiTipoActividad.upsert({
      where: { id: tipo.id },
      update: { nombre: tipo.nombre },
      create: { id: tipo.id, nombre: tipo.nombre }
    });
  }

  // Origen de Recursos
  const origenes = [
    { id: 1, nombre: 'LOCAL_STORAGE' },
    { id: 2, nombre: 'UNSPLASH' },
    { id: 3, nombre: 'YOUTUBE' },
    { id: 4, nombre: 'FREESOUND' }
  ];

  for (const origen of origenes) {
    await prisma.ludiOrigenRecurso.upsert({
      where: { id: origen.id },
      update: { nombre: origen.nombre },
      create: { id: origen.id, nombre: origen.nombre }
    });
  }

  // Tipos de Recurso
  const tiposRecurso = [
    { id: 1, nombre: 'IMAGEN' },
    { id: 2, nombre: 'VIDEO' },
    { id: 3, nombre: 'AUDIO' },
    { id: 4, nombre: 'PRESENTACION' }
  ];

  for (const tipo of tiposRecurso) {
    await prisma.ludiTipoRecurso.upsert({
      where: { id: tipo.id },
      update: { nombre: tipo.nombre },
      create: { id: tipo.id, nombre: tipo.nombre }
    });
  }

  // Temas
  const temas = [
    { id: 1, nombre: 'tema1', imageUrl: '/images/theme/tema1.jpg', descripcion: 'tema1_desc' },
    { id: 2, nombre: 'tema2', imageUrl: '/images/theme/tema2.jpg', descripcion: 'tema2_desc' },
    { id: 3, nombre: 'tema3', imageUrl: '/images/theme/tema3.jpg', descripcion: 'tema3_desc' },
    { id: 4, nombre: 'tema4', imageUrl: '/images/theme/tema4.jpg', descripcion: 'tema4_desc' },
    { id: 5, nombre: 'tema5', imageUrl: '/images/theme/tema5.jpg', descripcion: 'tema5_desc' },
    { id: 6, nombre: 'tema6', imageUrl: '/images/theme/tema6.jpg', descripcion: 'tema6_desc' },
    { id: 7, nombre: 'tema7', imageUrl: '/images/theme/tema7.jpg', descripcion: 'tema7_desc' },
  ];

  for (const tema of temas) {
    // Check if exists by ID first to avoid unique constraint issues if names change
    const existing = await prisma.ludiTema.findFirst({ where: { id: BigInt(tema.id) } });
    if (!existing) {
        await prisma.ludiTema.create({
            data: {
                // id: is autoincrement, but we can force it if needed?
                // Prisma doesn't easily support force ID on autoincrement in create unless allowed by DB.
                // SQL Server IDENTITY_INSERT needs to be ON.
                // Safer to just create without ID and rely on natural order or update by name?
                // But data.sql used explicit IDs.
                // Let's try to find by name.
                nombre: tema.nombre,
                imageUrl: tema.imageUrl,
                descripcion: tema.descripcion,
                activo: true
            }
        });
    }
  }

  // Tipos de Feedback
  const tiposFeedback = [
    { id: 1, nombre: 'MEDALLA' },
    { id: 2, nombre: 'ANIMACION' },
    { id: 3, nombre: 'CONFETI' }
  ];

  for (const tipo of tiposFeedback) {
    await prisma.ludiTipoFeedback.upsert({
      where: { id: tipo.id },
      update: { nombre: tipo.nombre },
      create: { id: tipo.id, nombre: tipo.nombre }
    });
  }

  // Tipos de Puntuación
  const tiposPuntuacion = [
    { id: 1, nombre: 'PUNTOS' },
    { id: 2, nombre: 'ESTRELLAS' },
    { id: 3, nombre: 'COINS' }
  ];

  for (const tipo of tiposPuntuacion) {
    await prisma.ludiTipoPuntuacion.upsert({
      where: { id: tipo.id },
      update: { nombre: tipo.nombre },
      create: { id: tipo.id, nombre: tipo.nombre }
    });
  }

  console.log('Database seeded successfully (Roles, Types, Origins, Resources, Themes, Feedback, Scoring).')
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
