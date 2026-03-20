import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const TEMPLATES_DATA = [
  {
    "grade": "firstGrade",
    "theme": "Matemáticas",
    "activity_name": "Sumas y Restas Divertidas",
    "activity_desc": "Aprende a sumar y restar con ejemplos de la vida diaria.",
    "image_url": "/images/templates/math1.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 60000,
      "puntajeBase": 100
    },
    "preguntas": [
      {
        "enunciado": "Si tienes 4 bananos y comes 1, ¿cuántos te quedan?",
        "opciones": [
          {
            "texto": "3 bananos",
            "esCorrecta": true
          },
          {
            "texto": "5 bananos",
            "esCorrecta": false
          },
          {
            "texto": "2 bananos",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Ludi encuentra 3 piedritas y luego 3 más. ¿Cuántas tiene ahora?",
        "opciones": [
          {
            "texto": "5",
            "esCorrecta": false
          },
          {
            "texto": "6",
            "esCorrecta": true
          },
          {
            "texto": "4",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "En una rama hay 5 pajaritos y vuelan 2. ¿Cuántos pajaritos quedan?",
        "opciones": [
          {
            "texto": "2",
            "esCorrecta": false
          },
          {
            "texto": "4",
            "esCorrecta": false
          },
          {
            "texto": "3",
            "esCorrecta": true
          }
        ]
      },
      {
        "enunciado": "Si María tiene 2 muñecas y su mamá le regala 2 más, ¿cuántas muñecas tiene?",
        "opciones": [
          {
            "texto": "4",
            "esCorrecta": true
          },
          {
            "texto": "3",
            "esCorrecta": false
          },
          {
            "texto": "5",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Hay 6 lápices en la mesa y Ludi toma 1. ¿Cuántos lápices quedan?",
        "opciones": [
          {
            "texto": "4",
            "esCorrecta": false
          },
          {
            "texto": "5",
            "esCorrecta": true
          },
          {
            "texto": "7",
            "esCorrecta": false
          }
        ]
      }
    ]
  },
  {
    "grade": "firstGrade",
    "theme": "Matemáticas",
    "activity_name": "Formas y Colores",
    "activity_desc": "Descubre el mundo de la geometría reconociendo figuras básicas.",
    "image_url": "/images/templates/math2.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 30000,
      "puntajeBase": 50
    },
    "preguntas": [
      {
        "enunciado": "El sol tiene forma de círculo.",
        "esCorrecta": true
      },
      {
        "enunciado": "Una puerta es redonda como una pelota.",
        "esCorrecta": false
      },
      {
        "enunciado": "La bandera de Nicaragua tiene color azul y blanco.",
        "esCorrecta": true
      },
      {
        "enunciado": "Un cuadrado tiene tres lados.",
        "esCorrecta": false
      },
      {
        "enunciado": "Las hojas de los árboles normalmente son verdes.",
        "esCorrecta": true
      }
    ]
  },
  {
    "grade": "firstGrade",
    "theme": "Lengua",
    "activity_name": "Las Vocales Exploradoras",
    "activity_desc": "Juega y aprende con las 5 vocales: A, E, I, O, U.",
    "image_url": "/images/templates/lengua1.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 45000,
      "puntajeBase": 100
    },
    "preguntas": [
      {
        "enunciado": "¿Qué vocal falta en la palabra _so (para que diga oso)?",
        "opciones": [
          {
            "texto": "a",
            "esCorrecta": false
          },
          {
            "texto": "o",
            "esCorrecta": true
          },
          {
            "texto": "e",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Con qué vocal empieza la palabra Avión?",
        "opciones": [
          {
            "texto": "E",
            "esCorrecta": false
          },
          {
            "texto": "I",
            "esCorrecta": false
          },
          {
            "texto": "A",
            "esCorrecta": true
          }
        ]
      },
      {
        "enunciado": "¿Qué vocal lleva la palabra Luz?",
        "opciones": [
          {
            "texto": "a",
            "esCorrecta": false
          },
          {
            "texto": "u",
            "esCorrecta": true
          },
          {
            "texto": "o",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Con qué vocal empieza Elefante?",
        "opciones": [
          {
            "texto": "E",
            "esCorrecta": true
          },
          {
            "texto": "A",
            "esCorrecta": false
          },
          {
            "texto": "U",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "En la palabra Mamá, ¿cuál es la vocal que se repite?",
        "opciones": [
          {
            "texto": "a",
            "esCorrecta": true
          },
          {
            "texto": "m",
            "esCorrecta": false
          },
          {
            "texto": "e",
            "esCorrecta": false
          }
        ]
      }
    ]
  },
  {
    "grade": "firstGrade",
    "theme": "Lengua",
    "activity_name": "El Abecedario Mágico",
    "activity_desc": "Aprende sobre las letras del abecedario de forma divertida.",
    "image_url": "/images/templates/lengua1.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 30000,
      "puntajeBase": 50
    },
    "preguntas": [
      {
        "enunciado": "La primera letra del abecedario es la A.",
        "esCorrecta": true
      },
      {
        "enunciado": "La letra Z está al principio del abecedario.",
        "esCorrecta": false
      },
      {
        "enunciado": "La palabra Gato empieza con la letra G.",
        "esCorrecta": true
      },
      {
        "enunciado": "Después de la letra A sigue la letra C.",
        "esCorrecta": false
      },
      {
        "enunciado": "La letra M suena como al principio de Manzana.",
        "esCorrecta": true
      }
    ]
  },
  {
    "grade": "firstGrade",
    "theme": "Tecnología",
    "activity_name": "Conociendo la Computadora",
    "activity_desc": "Aprende sobre las partes básicas de una computadora.",
    "image_url": "/images/templates/tech1.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 45000,
      "puntajeBase": 100
    },
    "preguntas": [
      {
        "enunciado": "¿Qué parte de la computadora usamos para escribir?",
        "opciones": [
          {
            "texto": "El ratón",
            "esCorrecta": false
          },
          {
            "texto": "El monitor",
            "esCorrecta": false
          },
          {
            "texto": "El teclado",
            "esCorrecta": true
          }
        ]
      },
      {
        "enunciado": "¿Cómo se llama la pantalla donde vemos los dibujos?",
        "opciones": [
          {
            "texto": "Monitor",
            "esCorrecta": true
          },
          {
            "texto": "Teclado",
            "esCorrecta": false
          },
          {
            "texto": "Mouse",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "El ratón o mouse de la computadora sirve para:",
        "opciones": [
          {
            "texto": "Escribir letras",
            "esCorrecta": false
          },
          {
            "texto": "Mover la flechita",
            "esCorrecta": true
          },
          {
            "texto": "Escuchar música",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Para escuchar los sonidos de un juego usamos:",
        "opciones": [
          {
            "texto": "Los parlantes o audífonos",
            "esCorrecta": true
          },
          {
            "texto": "El teclado",
            "esCorrecta": false
          },
          {
            "texto": "La pantalla",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Qué debemos hacer cuando terminamos de usar la computadora?",
        "opciones": [
          {
            "texto": "Dejarla encendida",
            "esCorrecta": false
          },
          {
            "texto": "Apagarla correctamente",
            "esCorrecta": true
          },
          {
            "texto": "Desconectarla de un tirón",
            "esCorrecta": false
          }
        ]
      }
    ]
  },
  {
    "grade": "firstGrade",
    "theme": "Tecnología",
    "activity_name": "Cuidados de la Tablet",
    "activity_desc": "Reglas básicas para cuidar nuestros dispositivos.",
    "image_url": "/images/templates/tech1.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 30000,
      "puntajeBase": 50
    },
    "preguntas": [
      {
        "enunciado": "Es bueno comer encima de la tablet.",
        "esCorrecta": false
      },
      {
        "enunciado": "Debemos usar la tablet con las manos limpias.",
        "esCorrecta": true
      },
      {
        "enunciado": "Podemos tirar la tablet al piso sin que se rompa.",
        "esCorrecta": false
      },
      {
        "enunciado": "Se debe pedir permiso a un adulto antes de descargar un juego.",
        "esCorrecta": true
      },
      {
        "enunciado": "Para limpiar la pantalla puedo usar cualquier trapo sucio.",
        "esCorrecta": false
      }
    ]
  },
  {
    "grade": "firstGrade",
    "theme": "Efemérides",
    "activity_name": "Mes de las Madres y los Niños",
    "activity_desc": "Celebra las fechas más bonitas dedicadas a la familia.",
    "image_url": "/images/templates/patrias.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 45000,
      "puntajeBase": 100
    },
    "preguntas": [
      {
        "enunciado": "¿En qué mes celebramos a las Madres en Nicaragua?",
        "opciones": [
          {
            "texto": "Mayo",
            "esCorrecta": true
          },
          {
            "texto": "Enero",
            "esCorrecta": false
          },
          {
            "texto": "Diciembre",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿En qué mes se celebra el Día del Niño Nicaragüense?",
        "opciones": [
          {
            "texto": "Enero",
            "esCorrecta": false
          },
          {
            "texto": "Junio",
            "esCorrecta": true
          },
          {
            "texto": "Noviembre",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "En el Día de las Madres, le damos las gracias por:",
        "opciones": [
          {
            "texto": "Su amor y cuidado",
            "esCorrecta": true
          },
          {
            "texto": "Hacer la tarea por nosotros",
            "esCorrecta": false
          },
          {
            "texto": "Comprarnos dulces",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Qué le podemos regalar a mamá en su día?",
        "opciones": [
          {
            "texto": "Un abrazo y un dibujo",
            "esCorrecta": true
          },
          {
            "texto": "Nada",
            "esCorrecta": false
          },
          {
            "texto": "Un juguete nuestro",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "El Día del Niño se celebra para recordar que:",
        "opciones": [
          {
            "texto": "Los niños deben trabajar",
            "esCorrecta": false
          },
          {
            "texto": "Los niños tienen derechos",
            "esCorrecta": true
          },
          {
            "texto": "Los niños no deben jugar",
            "esCorrecta": false
          }
        ]
      }
    ]
  },
  {
    "grade": "firstGrade",
    "theme": "Efemérides",
    "activity_name": "Fiestas y Tradiciones",
    "activity_desc": "Costumbres y fiestas populares de Nicaragua.",
    "image_url": "/images/templates/patrias.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 30000,
      "puntajeBase": 50
    },
    "preguntas": [
      {
        "enunciado": "El 14 y 15 de septiembre celebramos las Fiestas Patrias en Nicaragua.",
        "esCorrecta": true
      },
      {
        "enunciado": "En diciembre celebramos la Purísima.",
        "esCorrecta": true
      },
      {
        "enunciado": "En Semana Santa normalmente comemos almíbar y sopa de queso.",
        "esCorrecta": true
      },
      {
        "enunciado": "El güegüense es un baile tradicional de Japón.",
        "esCorrecta": false
      },
      {
        "enunciado": "El ave nacional de Nicaragua es el Guardabarranco.",
        "esCorrecta": true
      }
    ]
  },
  {
    "grade": "secondGrade",
    "theme": "Matemáticas",
    "activity_name": "La Multiplicación Inicial",
    "activity_desc": "Da tus primeros pasos en la multiplicación sumando grupos.",
    "image_url": "/images/templates/math3.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 60000,
      "puntajeBase": 150
    },
    "preguntas": [
      {
        "enunciado": "¿Cuánto es 2 veces 3?",
        "opciones": [
          {
            "texto": "5",
            "esCorrecta": false
          },
          {
            "texto": "6",
            "esCorrecta": true
          },
          {
            "texto": "4",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Si tengo 3 bolsas y en cada una hay 2 manzanas, ¿cuántas manzanas tengo en total?",
        "opciones": [
          {
            "texto": "6",
            "esCorrecta": true
          },
          {
            "texto": "5",
            "esCorrecta": false
          },
          {
            "texto": "7",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "La multiplicación 4 x 2 es igual a:",
        "opciones": [
          {
            "texto": "6",
            "esCorrecta": false
          },
          {
            "texto": "8",
            "esCorrecta": true
          },
          {
            "texto": "10",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Si un perro tiene 4 patas, ¿cuántas patas tienen 2 perros?",
        "opciones": [
          {
            "texto": "6",
            "esCorrecta": false
          },
          {
            "texto": "10",
            "esCorrecta": false
          },
          {
            "texto": "8",
            "esCorrecta": true
          }
        ]
      },
      {
        "enunciado": "¿Cuánto es 5 x 1?",
        "opciones": [
          {
            "texto": "5",
            "esCorrecta": true
          },
          {
            "texto": "6",
            "esCorrecta": false
          },
          {
            "texto": "1",
            "esCorrecta": false
          }
        ]
      }
    ]
  },
  {
    "grade": "secondGrade",
    "theme": "Matemáticas",
    "activity_name": "El Reloj y el Tiempo",
    "activity_desc": "Aprende a medir el tiempo y leer el reloj.",
    "image_url": "/images/templates/math1.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 40000,
      "puntajeBase": 100
    },
    "preguntas": [
      {
        "enunciado": "Un minuto tiene 60 segundos.",
        "esCorrecta": true
      },
      {
        "enunciado": "La aguja pequeña del reloj marca los minutos.",
        "esCorrecta": false
      },
      {
        "enunciado": "Una hora tiene 100 minutos.",
        "esCorrecta": false
      },
      {
        "enunciado": "Un día completo tiene 24 horas.",
        "esCorrecta": true
      },
      {
        "enunciado": "A las 12 del mediodía el sol está en lo más alto.",
        "esCorrecta": true
      }
    ]
  },
  {
    "grade": "secondGrade",
    "theme": "Lengua",
    "activity_name": "Sinónimos y Antónimos",
    "activity_desc": "Descubre palabras que significan lo mismo o lo contrario.",
    "image_url": "/images/templates/lengua2.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 45000,
      "puntajeBase": 120
    },
    "preguntas": [
      {
        "enunciado": "¿Cuál es un sinónimo (palabra parecida) de Feliz?",
        "opciones": [
          {
            "texto": "Triste",
            "esCorrecta": false
          },
          {
            "texto": "Contento",
            "esCorrecta": true
          },
          {
            "texto": "Enojado",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Cuál es el antónimo (lo contrario) de Día?",
        "opciones": [
          {
            "texto": "Sol",
            "esCorrecta": false
          },
          {
            "texto": "Tarde",
            "esCorrecta": false
          },
          {
            "texto": "Noche",
            "esCorrecta": true
          }
        ]
      },
      {
        "enunciado": "Un sinónimo de Lindo es:",
        "opciones": [
          {
            "texto": "Bonito",
            "esCorrecta": true
          },
          {
            "texto": "Feo",
            "esCorrecta": false
          },
          {
            "texto": "Malo",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Cuál es lo contrario de Grande?",
        "opciones": [
          {
            "texto": "Enorme",
            "esCorrecta": false
          },
          {
            "texto": "Pequeño",
            "esCorrecta": true
          },
          {
            "texto": "Alto",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Qué palabra significa lo mismo que Rápido?",
        "opciones": [
          {
            "texto": "Lento",
            "esCorrecta": false
          },
          {
            "texto": "Veloz",
            "esCorrecta": true
          },
          {
            "texto": "Pesado",
            "esCorrecta": false
          }
        ]
      }
    ]
  },
  {
    "grade": "secondGrade",
    "theme": "Lengua",
    "activity_name": "Los Signos de Puntuación",
    "activity_desc": "La importancia de los signos para entender lo que leemos.",
    "image_url": "/images/templates/lengua2.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 40000,
      "puntajeBase": 80
    },
    "preguntas": [
      {
        "enunciado": "El punto final se pone al inicio de la oración.",
        "esCorrecta": false
      },
      {
        "enunciado": "Las preguntas deben escribirse entre signos de interrogación (¿?).",
        "esCorrecta": true
      },
      {
        "enunciado": "La coma (,) sirve para hacer una pausa corta al leer.",
        "esCorrecta": true
      },
      {
        "enunciado": "Los signos de exclamación (¡!) se usan para hacer una pregunta.",
        "esCorrecta": false
      },
      {
        "enunciado": "Siempre empezamos a escribir una oración con letra mayúscula.",
        "esCorrecta": true
      }
    ]
  },
  {
    "grade": "secondGrade",
    "theme": "Tecnología",
    "activity_name": "Internet Seguro para Niños",
    "activity_desc": "Protege tu identidad y navega de forma segura.",
    "image_url": "/images/templates/tech2.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 45000,
      "puntajeBase": 150
    },
    "preguntas": [
      {
        "enunciado": "¿Qué debes hacer si alguien que no conoces te habla por internet?",
        "opciones": [
          {
            "texto": "Darle mi nombre",
            "esCorrecta": false
          },
          {
            "texto": "Avisar a mis padres",
            "esCorrecta": true
          },
          {
            "texto": "Hablar con él",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Una contraseña segura debe ser:",
        "opciones": [
          {
            "texto": "Secreta y difícil de adivinar",
            "esCorrecta": true
          },
          {
            "texto": "Mi nombre",
            "esCorrecta": false
          },
          {
            "texto": "12345",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Podemos poner nuestra dirección de casa en cualquier juego?",
        "opciones": [
          {
            "texto": "Sí, para hacer amigos",
            "esCorrecta": false
          },
          {
            "texto": "No, es peligroso",
            "esCorrecta": true
          },
          {
            "texto": "Solo si me la piden",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Qué hacemos antes de descargar un programa nuevo?",
        "opciones": [
          {
            "texto": "Preguntar a un adulto de confianza",
            "esCorrecta": true
          },
          {
            "texto": "Descargarlo rápido",
            "esCorrecta": false
          },
          {
            "texto": "Compartirlo con todos",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Si veo algo en internet que me asusta, debo:",
        "opciones": [
          {
            "texto": "Guardar el secreto",
            "esCorrecta": false
          },
          {
            "texto": "Cerrar la pantalla y avisar a un adulto",
            "esCorrecta": true
          },
          {
            "texto": "Seguir mirando",
            "esCorrecta": false
          }
        ]
      }
    ]
  },
  {
    "grade": "secondGrade",
    "theme": "Tecnología",
    "activity_name": "Partes del Teclado",
    "activity_desc": "Conoce para qué sirven las diferentes teclas.",
    "image_url": "/images/templates/tech2.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 35000,
      "puntajeBase": 90
    },
    "preguntas": [
      {
        "enunciado": "La barra espaciadora es la tecla más larga del teclado.",
        "esCorrecta": true
      },
      {
        "enunciado": "La tecla Enter o Intro sirve para borrar letras.",
        "esCorrecta": false
      },
      {
        "enunciado": "En el teclado encontramos todas las letras del abecedario.",
        "esCorrecta": true
      },
      {
        "enunciado": "No hay números en el teclado, solo letras.",
        "esCorrecta": false
      },
      {
        "enunciado": "La tecla Retroceso (Backspace) sirve para borrar lo que escribimos mal.",
        "esCorrecta": true
      }
    ]
  },
  {
    "grade": "secondGrade",
    "theme": "Efemérides",
    "activity_name": "Día de la Tierra y el Árbol",
    "activity_desc": "Aprende a proteger nuestro medio ambiente.",
    "image_url": "/images/templates/patrias.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 45000,
      "puntajeBase": 150
    },
    "preguntas": [
      {
        "enunciado": "¿En qué mes se celebra el Día Internacional de la Tierra?",
        "opciones": [
          {
            "texto": "Abril",
            "esCorrecta": true
          },
          {
            "texto": "Diciembre",
            "esCorrecta": false
          },
          {
            "texto": "Febrero",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Cómo podemos ayudar a cuidar nuestro planeta Tierra?",
        "opciones": [
          {
            "texto": "Tirando basura",
            "esCorrecta": false
          },
          {
            "texto": "Ahorrando agua y reciclando",
            "esCorrecta": true
          },
          {
            "texto": "Dejando las luces encendidas",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "En Nicaragua, ¿qué celebramos el último viernes de junio?",
        "opciones": [
          {
            "texto": "El Día del Árbol",
            "esCorrecta": true
          },
          {
            "texto": "El Día de la Madre",
            "esCorrecta": false
          },
          {
            "texto": "Navidad",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Los árboles son importantes porque:",
        "opciones": [
          {
            "texto": "Nos dan oxígeno y sombra",
            "esCorrecta": true
          },
          {
            "texto": "Hacen mucho ruido",
            "esCorrecta": false
          },
          {
            "texto": "No sirven para nada",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Para celebrar el Día del Árbol, una buena acción es:",
        "opciones": [
          {
            "texto": "Cortar las ramas",
            "esCorrecta": false
          },
          {
            "texto": "Sembrar una planta o un árbol",
            "esCorrecta": true
          },
          {
            "texto": "Pintar su tronco",
            "esCorrecta": false
          }
        ]
      }
    ]
  },
  {
    "grade": "secondGrade",
    "theme": "Efemérides",
    "activity_name": "Día del Niño Nicaragüense",
    "activity_desc": "Conoce más sobre los derechos de los niños en su día.",
    "image_url": "/images/templates/patrias.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 35000,
      "puntajeBase": 100
    },
    "preguntas": [
      {
        "enunciado": "En Nicaragua, el Día del Niño se celebra el 1 de junio.",
        "esCorrecta": true
      },
      {
        "enunciado": "Los niños tienen derecho a jugar, estudiar y estar sanos.",
        "esCorrecta": true
      },
      {
        "enunciado": "El Día del Niño es una fecha para recordar que los niños deben trabajar.",
        "esCorrecta": false
      },
      {
        "enunciado": "Todos los niños merecen respeto, amor y cuidado sin importar su origen.",
        "esCorrecta": true
      },
      {
        "enunciado": "El Día del Niño se celebra solo en la escuela, no en la familia.",
        "esCorrecta": false
      }
    ]
  },
  {
    "grade": "thirdGrade",
    "theme": "Matemáticas",
    "activity_name": "Fracciones Mágicas",
    "activity_desc": "Entiende cómo dividir un entero en partes iguales.",
    "image_url": "/images/templates/math2.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 60000,
      "puntajeBase": 200
    },
    "preguntas": [
      {
        "enunciado": "Si partes una pizza en 2 partes iguales, cada parte es:",
        "opciones": [
          {
            "texto": "Un cuarto",
            "esCorrecta": false
          },
          {
            "texto": "Un medio",
            "esCorrecta": true
          },
          {
            "texto": "Un tercio",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "¿Qué fracción representa la mitad de un pastel?",
        "opciones": [
          {
            "texto": "1/2",
            "esCorrecta": true
          },
          {
            "texto": "1/4",
            "esCorrecta": false
          },
          {
            "texto": "1/3",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Si tienes 4 manzanas y te comes 1, ¿qué fracción comiste?",
        "opciones": [
          {
            "texto": "1/4",
            "esCorrecta": true
          },
          {
            "texto": "1/2",
            "esCorrecta": false
          },
          {
            "texto": "4/1",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Un entero está formado por ¿cuántos tercios?",
        "opciones": [
          {
            "texto": "2",
            "esCorrecta": false
          },
          {
            "texto": "4",
            "esCorrecta": false
          },
          {
            "texto": "3",
            "esCorrecta": true
          }
        ]
      },
      {
        "enunciado": "¿Cuál es mayor, 1/2 (la mitad) o 1/4 (un cuarto)?",
        "opciones": [
          {
            "texto": "1/4 es mayor",
            "esCorrecta": false
          },
          {
            "texto": "Son iguales",
            "esCorrecta": false
          },
          {
            "texto": "1/2 es mayor",
            "esCorrecta": true
          }
        ]
      }
    ]
  },
  {
    "grade": "thirdGrade",
    "theme": "Matemáticas",
    "activity_name": "Geometría Espacial",
    "activity_desc": "Conoce las figuras en tres dimensiones.",
    "image_url": "/images/templates/math3.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 40000,
      "puntajeBase": 120
    },
    "preguntas": [
      {
        "enunciado": "Un cubo tiene 6 caras cuadradas iguales.",
        "esCorrecta": true
      },
      {
        "enunciado": "Una esfera tiene esquinas y puntas marcadas.",
        "esCorrecta": false
      },
      {
        "enunciado": "El cilindro tiene dos bases en forma de círculo.",
        "esCorrecta": true
      },
      {
        "enunciado": "Un cono de helado se parece a una pirámide cuadrada.",
        "esCorrecta": false
      },
      {
        "enunciado": "Un prisma rectangular tiene forma de caja de zapatos.",
        "esCorrecta": true
      }
    ]
  },
  {
    "grade": "thirdGrade",
    "theme": "Lengua",
    "activity_name": "Tiempos Verbales",
    "activity_desc": "Aprende a conjugar en pasado, presente y futuro.",
    "image_url": "/images/templates/lengua3.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 50000,
      "puntajeBase": 150
    },
    "preguntas": [
      {
        "enunciado": "¿En qué tiempo verbal está la oración: Ayer jugué fútbol?",
        "opciones": [
          {
            "texto": "Presente",
            "esCorrecta": false
          },
          {
            "texto": "Pasado",
            "esCorrecta": true
          },
          {
            "texto": "Futuro",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "La oración: Mañana visitaré a mi abuela, está en:",
        "opciones": [
          {
            "texto": "Pasado",
            "esCorrecta": false
          },
          {
            "texto": "Presente",
            "esCorrecta": false
          },
          {
            "texto": "Futuro",
            "esCorrecta": true
          }
        ]
      },
      {
        "enunciado": "¿Cuál de estos verbos está en presente?",
        "opciones": [
          {
            "texto": "Comí",
            "esCorrecta": false
          },
          {
            "texto": "Como",
            "esCorrecta": true
          },
          {
            "texto": "Comeré",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "El pasado del verbo Cantar en primera persona (yo) es:",
        "opciones": [
          {
            "texto": "Canto",
            "esCorrecta": false
          },
          {
            "texto": "Cantaré",
            "esCorrecta": false
          },
          {
            "texto": "Canté",
            "esCorrecta": true
          }
        ]
      },
      {
        "enunciado": "Ludi baila en la fiesta. El verbo de la oración está en:",
        "opciones": [
          {
            "texto": "Presente",
            "esCorrecta": true
          },
          {
            "texto": "Pasado",
            "esCorrecta": false
          },
          {
            "texto": "Futuro",
            "esCorrecta": false
          }
        ]
      }
    ]
  },
  {
    "grade": "thirdGrade",
    "theme": "Lengua",
    "activity_name": "Acentuación Correcta",
    "activity_desc": "Diferencia las palabras agudas, graves y esdrújulas.",
    "image_url": "/images/templates/lengua3.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 45000,
      "puntajeBase": 150
    },
    "preguntas": [
      {
        "enunciado": "Las palabras agudas llevan la mayor fuerza de voz en la última sílaba.",
        "esCorrecta": true
      },
      {
        "enunciado": "La palabra Corazón es una palabra grave.",
        "esCorrecta": false
      },
      {
        "enunciado": "Las palabras esdrújulas siempre llevan tilde (acento ortográfico).",
        "esCorrecta": true
      },
      {
        "enunciado": "Pájaro es una palabra aguda.",
        "esCorrecta": false
      },
      {
        "enunciado": "Las palabras graves llevan la fuerza de voz en la penúltima sílaba.",
        "esCorrecta": true
      }
    ]
  },
  {
    "grade": "thirdGrade",
    "theme": "Tecnología",
    "activity_name": "Lógica y Programación Básica",
    "activity_desc": "Entiende cómo piensan las computadoras.",
    "image_url": "/images/templates/tech3.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 60000,
      "puntajeBase": 200
    },
    "preguntas": [
      {
        "enunciado": "Un algoritmo es:",
        "opciones": [
          {
            "texto": "Un virus",
            "esCorrecta": false
          },
          {
            "texto": "Pasos ordenados para resolver un problema",
            "esCorrecta": true
          },
          {
            "texto": "Una parte del teclado",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Si queremos que un robot avance dos pasos, ¿qué instrucción le damos?",
        "opciones": [
          {
            "texto": "Retroceder 2",
            "esCorrecta": false
          },
          {
            "texto": "Girar a la derecha",
            "esCorrecta": false
          },
          {
            "texto": "Avanzar 2",
            "esCorrecta": true
          }
        ]
      },
      {
        "enunciado": "Un bucle o loop en programación sirve para:",
        "opciones": [
          {
            "texto": "Apagar la máquina",
            "esCorrecta": false
          },
          {
            "texto": "Repetir una acción varias veces",
            "esCorrecta": true
          },
          {
            "texto": "Borrar datos",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "En programación, un bug significa:",
        "opciones": [
          {
            "texto": "Un error en el código",
            "esCorrecta": true
          },
          {
            "texto": "Un insecto dentro de la computadora",
            "esCorrecta": false
          },
          {
            "texto": "Una memoria USB",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Para hacer un sándwich, el primer paso lógico es:",
        "opciones": [
          {
            "texto": "Comerlo",
            "esCorrecta": false
          },
          {
            "texto": "Conseguir los ingredientes",
            "esCorrecta": true
          },
          {
            "texto": "Guardarlo",
            "esCorrecta": false
          }
        ]
      }
    ]
  },
  {
    "grade": "thirdGrade",
    "theme": "Tecnología",
    "activity_name": "Búsquedas Inteligentes en Web",
    "activity_desc": "Aprende a buscar información confiable en Internet.",
    "image_url": "/images/templates/tech3.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 40000,
      "puntajeBase": 120
    },
    "preguntas": [
      {
        "enunciado": "Todo lo que leemos en Internet es siempre verdad.",
        "esCorrecta": false
      },
      {
        "enunciado": "Es bueno usar palabras clave precisas para encontrar información rápido.",
        "esCorrecta": true
      },
      {
        "enunciado": "Wikipedia es la única página donde podemos encontrar información.",
        "esCorrecta": false
      },
      {
        "enunciado": "Debemos comparar la información en varias páginas para estar seguros.",
        "esCorrecta": true
      },
      {
        "enunciado": "Las imágenes en Internet siempre se pueden usar sin dar crédito a sus autores.",
        "esCorrecta": false
      }
    ]
  },
  {
    "grade": "thirdGrade",
    "theme": "Efemérides",
    "activity_name": "Celebraciones del Medio Ambiente",
    "activity_desc": "El Día de la Tierra y el Día del Árbol.",
    "image_url": "/images/templates/patrias.png",
    "tipoActividadId": 1,
    "config": {
      "tiempoPreguntaMs": 50000,
      "puntajeBase": 180
    },
    "preguntas": [
      {
        "enunciado": "¿Por qué es importante el 22 de abril, Día de la Tierra?",
        "opciones": [
          {
            "texto": "Para talar árboles",
            "esCorrecta": false
          },
          {
            "texto": "Para recordar que debemos proteger el planeta",
            "esCorrecta": true
          },
          {
            "texto": "Para ensuciar los ríos",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "En el Día del Árbol, la principal actividad escolar es:",
        "opciones": [
          {
            "texto": "Reforestar y plantar arbolitos",
            "esCorrecta": true
          },
          {
            "texto": "Arrancar plantas",
            "esCorrecta": false
          },
          {
            "texto": "Tirar papeles al patio",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "El Madroño es:",
        "opciones": [
          {
            "texto": "El animal nacional",
            "esCorrecta": false
          },
          {
            "texto": "El Árbol Nacional de Nicaragua",
            "esCorrecta": true
          },
          {
            "texto": "Un río importante",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Al reciclar plástico y papel estamos:",
        "opciones": [
          {
            "texto": "Contaminando más",
            "esCorrecta": false
          },
          {
            "texto": "Ayudando a conservar la Tierra",
            "esCorrecta": true
          },
          {
            "texto": "Perdiendo el tiempo",
            "esCorrecta": false
          }
        ]
      },
      {
        "enunciado": "Cuidar el agua potable es una acción que protege:",
        "opciones": [
          {
            "texto": "El medio ambiente",
            "esCorrecta": false
          },
          {
            "texto": "La economía familiar",
            "esCorrecta": false
          },
          {
            "texto": "Ambas respuestas son correctas",
            "esCorrecta": true
          }
        ]
      }
    ]
  },
  {
    "grade": "thirdGrade",
    "theme": "Efemérides",
    "activity_name": "Independencia de Centroamérica",
    "activity_desc": "Nuestra historia en las Fiestas Patrias.",
    "image_url": "/images/templates/patrias.png",
    "tipoActividadId": 2,
    "config": {
      "tiempoPreguntaMs": 45000,
      "puntajeBase": 150
    },
    "preguntas": [
      {
        "enunciado": "La Independencia de Centroamérica se firmó el 15 de septiembre de 1821.",
        "esCorrecta": true
      },
      {
        "enunciado": "Miguel Larreynaga fue un prócer nicaragüense de la independencia.",
        "esCorrecta": true
      },
      {
        "enunciado": "El 14 de septiembre se celebra el acta de independencia.",
        "esCorrecta": false
      },
      {
        "enunciado": "La Antorcha de la Libertad recorre toda Centroamérica en septiembre.",
        "esCorrecta": true
      },
      {
        "enunciado": "Durante las Fiestas Patrias, los colegios marchan al ritmo de bandas musicales.",
        "esCorrecta": true
      }
    ]
  }
];

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
    const gradeMap = {
      firstGrade: grade1,
      secondGrade: grade2,
      thirdGrade: grade3
    };

    for (const tpl of TEMPLATES_DATA) {
      const grade = gradeMap[tpl.grade as keyof typeof gradeMap];
      if (!grade) continue;

      const act = await prisma.aCTIVITY.create({
        data: {
          activity_name: tpl.activity_name,
          activity_desc: tpl.activity_desc,
          image_url: tpl.image_url,
          isTemplate: true,
        }
      });

      const preguntasCreate = tpl.preguntas.map((p: any, pIndex: number) => {
        let opcionesCreate;
        if (tpl.tipoActividadId === 1) { // LudiQuiz
          opcionesCreate = p.opciones.map((opt: any, optIndex: number) => ({
            indice: optIndex,
            texto: opt.texto,
            esCorrecta: opt.esCorrecta
          }));
        } else { // TrueOrFalse
          opcionesCreate = [{
            indice: 0,
            esCorrecta: p.esCorrecta
          }];
        }

        return {
          numero: pIndex + 1,
          tipoActividadId: tpl.tipoActividadId,
          enunciado: p.enunciado,
          opciones: {
            create: opcionesCreate
          }
        };
      });

      await prisma.ludiActividad.create({
        data: {
          activityId: act.id,
          tipoActividadId: tpl.tipoActividadId,
          userId: userId,
          gradoId: grade.id,
          temaId: temaIds[tpl.theme],
          publico: true,
          estatus: true,
          config: { create: tpl.config },
          preguntas: {
            create: preguntasCreate
          }
        }
      });

      createdTemplates.push(`${tpl.grade} - ${tpl.theme} - ${tpl.activity_name}`);
    }

    const responsePayload = { 
        success: true, 
        message: 'Proceso de creación de plantillas completado.',
        details: {
            gradesFound: { grade1: !!grade1, grade2: !!grade2, grade3: !!grade3 },
            createdTemplates
        }
    };

    return new NextResponse(
      JSON.stringify(responsePayload, (key, value) => typeof value === 'bigint' ? value.toString() : value), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error seeding templates:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
