import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const grade1 = await prisma.lUDI_COMMON_GRADE.findFirst({ where: { key_string: 'firstGrade' } });
    const grade2 = await prisma.lUDI_COMMON_GRADE.findFirst({ where: { key_string: 'secondGrade' } });
    const grade3 = await prisma.lUDI_COMMON_GRADE.findFirst({ where: { key_string: 'thirdGrade' } });

    let systemUser = await prisma.ludiUser.findFirst({ where: { email: 'admin@ludigame.com' } });
    if (!systemUser) {
        systemUser = await prisma.ludiUser.findFirst(); 
    }
    
    if (!systemUser) return NextResponse.json({ error: 'No user found' }, { status: 500 });

    const userId = systemUser.id;
    const temas = ['Matemáticas', 'Lengua', 'Tecnología', 'Efemérides'];
    const temaIds: Record<string, bigint> = {};
    for (const nombre of temas) {
        let tema = await prisma.ludiTema.findFirst({ where: { nombre: { contains: nombre } } });
        if (!tema) {
            tema = await prisma.ludiTema.create({
                data: { nombre, imageUrl: '/images/themes/' + nombre.toLowerCase() + '.png', descripcion: 'Tema de ' + nombre }
            });
        }
        temaIds[nombre] = tema.id;
    }

    const createdTemplates = [];

    if (grade1) {
        const act1 = await prisma.aCTIVITY.create({
            data: {
                activity_name: 'La Tiendita de Ludi (Sumas Básicas)',
                activity_desc: 'Aprende a sumar contando frutas y juguetes.',
                image_url: '/images/templates/math1.png',
                isTemplate: true,
            }
        });

        await prisma.ludiActividad.create({
            data: {
                activityId: act1.id,
                tipoActividadId: 1, 
                userId: userId,
                gradoId: grade1.id,
                temaId: temaIds['Matemáticas'],
                publico: true,
                estatus: true,
                config: { create: { tiempoPreguntaMs: 60000, puntajeBase: 100 } },
                preguntas: {
                    create: [
                        { numero: 1, tipoActividadId: 1, enunciado: 'Si tienes 2 manzanas y compras 3 más, ¿cuántas manzanas tienes en total?', opciones: { create: [{ indice: 0, texto: '4 manzanas', esCorrecta: false }, { indice: 1, texto: '5 manzanas', esCorrecta: true }, { indice: 2, texto: '6 manzanas', esCorrecta: false }] } },
                        { numero: 2, tipoActividadId: 1, enunciado: 'Ludi tiene 5 carritos y le regala 2 a su amigo. ¿Cuántos le quedan?', opciones: { create: [{ indice: 0, texto: '3 carritos', esCorrecta: true }, { indice: 1, texto: '7 carritos', esCorrecta: false }] } }
                    ]
                }
            }
        });
        createdTemplates.push('Matemáticas 1º Grado');
    }

    if (grade2) {
        const act2 = await prisma.aCTIVITY.create({
            data: {
                activity_name: 'El Detective de los Cuentos',
                activity_desc: 'Lee y descubre si las afirmaciones sobre los animales son reales.',
                image_url: '/images/templates/lengua2.png',
                isTemplate: true,
            }
        });

        await prisma.ludiActividad.create({
            data: {
                activityId: act2.id,
                tipoActividadId: 2, 
                userId: userId,
                gradoId: grade2.id,
                temaId: temaIds['Lengua'],
                publico: true,
                estatus: true,
                config: { create: { tiempoPreguntaMs: 30000, puntajeBase: 50 } },
                preguntas: {
                    create: [
                        { numero: 1, tipoActividadId: 2, enunciado: 'La palabra Murciélago es una palabra grave.', opciones: { create: [{ indice: 0, esCorrecta: false }] } },
                        { numero: 2, tipoActividadId: 2, enunciado: 'Los sustantivos propios (como los nombres de personas) siempre se escriben con mayúscula.', opciones: { create: [{ indice: 0, esCorrecta: true }] } }
                    ]
                }
            }
        });
        createdTemplates.push('Lengua 2º Grado');
    }

    if (grade3) {
        const act3 = await prisma.aCTIVITY.create({
            data: {
                activity_name: 'Héroes de la Batalla de San Jacinto',
                activity_desc: 'Aprende sobre las fiestas patrias de Nicaragua de forma divertida.',
                image_url: '/images/templates/patrias.png',
                isTemplate: true,
            }
        });

        await prisma.ludiActividad.create({
            data: {
                activityId: act3.id,
                tipoActividadId: 1, 
                userId: userId,
                gradoId: grade3.id,
                temaId: temaIds['Efemérides'],
                publico: true,
                estatus: true,
                config: { create: { tiempoPreguntaMs: 45000, puntajeBase: 200 } },
                preguntas: {
                    create: [
                        { numero: 1, tipoActividadId: 1, enunciado: '¿En qué fecha se celebra la Batalla de San Jacinto en Nicaragua?', opciones: { create: [{ indice: 0, texto: '14 de Septiembre', esCorrecta: true }, { indice: 1, texto: '15 de Septiembre', esCorrecta: false }, { indice: 2, texto: '19 de Julio', esCorrecta: false }] } },
                        { numero: 2, tipoActividadId: 1, enunciado: '¿Quién es recordado por lanzar una piedra a los filibusteros durante la batalla?', opciones: { create: [{ indice: 0, texto: 'Rubén Darío', esCorrecta: false }, { indice: 1, texto: 'Andrés Castro', esCorrecta: true }, { indice: 2, texto: 'José Dolores Estrada', esCorrecta: false }] } }
                    ]
                }
            }
        });
        createdTemplates.push('Efemérides 3º Grado');
    }

    const responsePayload = { 
        success: true, 
        message: 'Proceso completado.',
        details: {
            gradesFound: { grade1: !!grade1, grade2: !!grade2, grade3: !!grade3 },
            createdTemplates
        }
    };

    return new NextResponse(JSON.stringify(responsePayload, (key, value) => typeof value === 'bigint' ? value.toString() : value), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Error seeding templates:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
