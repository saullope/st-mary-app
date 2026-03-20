const fs = require('fs');

const code = `import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const TEMPLATES_DATA = [
  // 1ST GRADE ----------------------------------------------------------------------------------
  {
    grade: 'firstGrade',
    theme: 'Matemáticas',
    activity_name: 'Sumas y Restas Divertidas',
    activity_desc: 'Aprende a sumar y restar con ejemplos de la vida diaria.',
    image_url: '/images/templates/math_add.png',
    tipoActividadId: 1,
    config: { tiempoPreguntaMs: 60000, puntajeBase: 100 },
    preguntas: [
      { enunciado: 'Si tienes 4 bananos y comes 1, ¿cuántos te quedan?', opciones: [{texto: '3 bananos', esCorrecta: true}, {texto: '5 bananos', esCorrecta: false}, {texto: '2 bananos', esCorrecta: false}] },
      { enunciado: 'Ludi encuentra 3 piedritas y luego 3 más. ¿Cuántas tiene ahora?', opciones: [{texto: '5', esCorrecta: false}, {texto: '6', esCorrecta: true}, {texto: '4', esCorrecta: false}] },
      { enunciado: 'En una rama hay 5 pajaritos y vuelan 2. ¿Cuántos pajaritos quedan?', opciones: [{texto: '2', esCorrecta: false}, {texto: '4', esCorrecta: false}, {texto: '3', esCorrecta: true}] },
      { enunciado: 'Si María tiene 2 muñecas y su mamá le regala 2 más, ¿cuántas muñecas tiene?', opciones: [{texto: '4', esCorrecta: true}, {texto: '3', esCorrecta: false}, {texto: '5', esCorrecta: false}] },
      { enunciado: 'Hay 6 lápices en la mesa y Ludi toma 1. ¿Cuántos lápices quedan?', opciones: [{texto: '4', esCorrecta: false}, {texto: '5', esCorrecta: true}, {texto: '7', esCorrecta: false}] }
    ]
  },
  {
    grade: 'firstGrade',
    theme: 'Matemáticas',
    activity_name: 'Formas y Colores',
    activity_desc: 'Descubre el mundo de la geometría reconociendo figuras básicas.',
    image_url: '/images/templates/shapes.png',
    tipoActividadId: 2,
    config: { tiempoPreguntaMs: 30000, puntajeBase: 50 },
    preguntas: [
      { enunciado: 'El sol tiene forma de círculo.', esCorrecta: true },
      { enunciado: 'Una puerta es redonda como una pelota.', esCorrecta: false },
      { enunciado: 'La bandera de Nicaragua tiene color azul y blanco.', esCorrecta: true },
      { enunciado: 'Un cuadrado tiene tres lados.', esCorrecta: false },
      { enunciado: 'Las hojas de los árboles normalmente son verdes.', esCorrecta: true }
    ]
  },
  {
    grade: 'firstGrade',
    theme: 'Lengua',
    activity_name: 'Las Vocales Exploradoras',
    activity_desc: 'Juega y aprende con las 5 vocales: A, E, I, O, U.',
    image_url: '/images/templates/vowels.png',
    tipoActividadId: 1,
    config: { tiempoPreguntaMs: 45000, puntajeBase: 100 },
    preguntas: [
      { enunciado: '¿Qué vocal falta en la palabra _so (para que diga oso)?', opciones: [{texto: 'a', esCorrecta: false}, {texto: 'o', esCorrecta: true}, {texto: 'e', esCorrecta: false}] },
      { enunciado: '¿Con qué vocal empieza la palabra Avión?', opciones: [{texto: 'E', esCorrecta: false}, {texto: 'I', esCorrecta: false}, {texto: 'A', esCorrecta: true}] },
      { enunciado: '¿Qué vocal lleva la palabra Luz?', opciones: [{texto: 'a', esCorrecta: false}, {texto: 'u', esCorrecta: true}, {texto: 'o', esCorrecta: false}] },
      { enunciado: '¿Con qué vocal empieza Elefante?', opciones: [{texto: 'E', esCorrecta: true}, {texto: 'A', esCorrecta: false}, {texto: 'U', esCorrecta: false}] },
      { enunciado: 'En la palabra Mamá, ¿cuál es la vocal que se repite?', opciones: [{texto: 'a', esCorrecta: true}, {texto: 'm', esCorrecta: false}, {texto: 'e', esCorrecta: false}] }
    ]
  },
  {
    grade: 'firstGrade',
    theme: 'Lengua',
    activity_name: 'El Abecedario Mágico',
    activity_desc: 'Aprende sobre las letras del abecedario de forma divertida.',
    image_url: '/images/templates/alphabet.png',
    tipoActividadId: 2,
    config: { tiempoPreguntaMs: 30000, puntajeBase: 50 },
    preguntas: [
      { enunciado: 'La primera letra del abecedario es la A.', esCorrecta: true },
      { enunciado: 'La letra Z está al principio del abecedario.', esCorrecta: false },
      { enunciado: 'La palabra Gato empieza con la letra G.', esCorrecta: true },
      { enunciado: 'Después de la letra A sigue la letra C.', esCorrecta: false },
      { enunciado: 'La letra M suena como al principio de Manzana.', esCorrecta: true }
    ]
  },
  {
    grade: 'firstGrade',
    theme: 'Tecnología',
    activity_name: 'Conociendo la Computadora',
    activity_desc: 'Aprende sobre las partes básicas de una computadora.',
    image_url: '/images/templates/computer_parts.png',
    tipoActividadId: 1,
    config: { tiempoPreguntaMs: 45000, puntajeBase: 100 },
    preguntas: [
      { enunciado: '¿Qué parte de la computadora usamos para escribir?', opciones: [{texto: 'El ratón', esCorrecta: false}, {texto: 'El monitor', esCorrecta: false}, {texto: 'El teclado', esCorrecta: true}] },
      { enunciado: '¿Cómo se llama la pantalla donde vemos los dibujos?', opciones: [{texto: 'Monitor', esCorrecta: true}, {texto: 'Teclado', esCorrecta: false}, {texto: 'Mouse', esCorrecta: false}] },
      { enunciado: 'El ratón o mouse de la computadora sirve para:', opciones: [{texto: 'Escribir letras', esCorrecta: false}, {texto: 'Mover la flechita', esCorrecta: true}, {texto: 'Escuchar música', esCorrecta: false}] },
      { enunciado: 'Para escuchar los sonidos de un juego usamos:', opciones: [{texto: 'Los parlantes o audífonos', esCorrecta: true}, {texto: 'El teclado', esCorrecta: false}, {texto: 'La pantalla', esCorrecta: false}] },
      { enunciado: '¿Qué debemos hacer cuando terminamos de usar la computadora?', opciones: [{texto: 'Dejarla encendida', esCorrecta: false}, {texto: 'Apagarla correctamente', esCorrecta: true}, {texto: 'Desconectarla de un tirón', esCorrecta: false}] }
    ]
  },
  {
    grade: 'firstGrade',
    theme: 'Tecnología',
    activity_name: 'Cuidados de la Tablet',
    activity_desc: 'Reglas básicas para cuidar nuestros dispositivos.',
    image_url: '/images/templates/tablet_care.png',
    tipoActividadId: 2,
    config: { tiempoPreguntaMs: 30000, puntajeBase: 50 },
    preguntas: [
      { enunciado: 'Es bueno comer encima de la tablet.', esCorrecta: false },
      { enunciado: 'Debemos usar la tablet con las manos limpias.', esCorrecta: true },
      { enunciado: 'Podemos tirar la tablet al piso sin que se rompa.', esCorrecta: false },
      { enunciado: 'Se debe pedir permiso a un adulto antes de descargar un juego.', esCorrecta: true },
      { enunciado: 'Para limpiar la pantalla puedo usar cualquier trapo sucio.', esCorrecta: false }
    ]
  },
  {
    grade: 'firstGrade',
    theme: 'Efemérides',
    activity_name: 'Mes de las Madres y los Niños',
    activity_desc: 'Celebra las fechas más bonitas dedicadas a la familia.',
    image_url: '/images/templates/mothers_day.png',
    tipoActividadId: 1,
    config: { tiempoPreguntaMs: 45000, puntajeBase: 100 },
    preguntas: [
      { enunciado: '¿En qué mes celebramos a las Madres en Nicaragua?', opciones: [{texto: 'Mayo', esCorrecta: true}, {texto: 'Enero', esCorrecta: false}, {texto: 'Diciembre', esCorrecta: false}] },
      { enunciado: '¿En qué mes se celebra el Día del Niño Nicaragüense?', opciones: [{texto: 'Enero', esCorrecta: false}, {texto: 'Junio', esCorrecta: true}, {texto: 'Noviembre', esCorrecta: false}] },
      { enunciado: 'En el Día de las Madres, le damos las gracias por:', opciones: [{texto: 'Su amor y cuidado', esCorrecta: true}, {texto: 'Hacer la tarea por nosotros', esCorrecta: false}, {texto: 'Comprarnos dulces', esCorrecta: false}] },
      { enunciado: '¿Qué le podemos regalar a mamá en su día?', opciones: [{texto: 'Un abrazo y un dibujo', esCorrecta: true}, {texto: 'Nada', esCorrecta: false}, {texto: 'Un juguete nuestro', esCorrecta: false}] },
      { enunciado: 'El Día del Niño se celebra para recordar que:', opciones: [{texto: 'Los niños deben trabajar', esCorrecta: false}, {texto: 'Los niños tienen derechos', esCorrecta: true}, {texto: 'Los niños no deben jugar', esCorrecta: false}] }
    ]
  },
  {
    grade: 'firstGrade',
    theme: 'Efemérides',
    activity_name: 'Fiestas y Tradiciones',
    activity_desc: 'Costumbres 
