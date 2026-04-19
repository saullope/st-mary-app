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
    const existing = await prisma.ludiTema.findFirst({ where: { nombre: tema.nombre } });
    if (!existing) {
        await prisma.ludiTema.create({
            data: {
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

  // Grados Escolares (LUDI_COMMON_GRADE)
  const grados = [
    { id: 1, name: 'Primer Grado', desc: 'Actividades para 1er Grado', key: 'firstGrade' },
    { id: 2, name: 'Segundo Grado', desc: 'Actividades para 2do Grado', key: 'secondGrade' },
    { id: 3, name: 'Tercer Grado', desc: 'Actividades para 3er Grado', key: 'thirdGrade' },
  ];

  for (const grado of grados) {
    const existing = await prisma.lUDI_COMMON_GRADE.findFirst({ where: { key_string: grado.key } });
    if (!existing) {
        await prisma.lUDI_COMMON_GRADE.create({
            data: {
                grade_type_name: grado.name,
                grade_type_desc: grado.desc,
                key_string: grado.key
            }
        });
    }
  }

  // Avatares de Estudiantes (LudiAvatar)
  const avatares = [
    { nombre: 'Monstruo 1', url: '/images/avatars/avatar1.png' },
    { nombre: 'Monstruo 2', url: '/images/avatars/avatar2.png' },
    { nombre: 'Monstruo 3', url: '/images/avatars/avatar3.png' },
    { nombre: 'Monstruo 4', url: '/images/avatars/avatar4.png' },
    { nombre: 'Monstruo 5', url: '/images/avatars/avatar5.png' },
    { nombre: 'Monstruo 6', url: '/images/avatars/avatar6.png' },
  ];

  for (const avatar of avatares) {
    const existing = await prisma.ludiAvatar.findFirst({ where: { urlImagen: avatar.url } });
    if (!existing) {
        await prisma.ludiAvatar.create({
            data: {
                nombre: avatar.nombre,
                urlImagen: avatar.url,
                activo: true
            }
        });
    }
  }

  console.log('Database seeded successfully: Roles, Types, Origins, Resources, Themes, Feedback, Scoring, Grades, and Avatars.')
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
