import prisma from "@/lib/db";

export async function getActivityTypes() {
  try {
    return await prisma.ludiTipoActividad.findMany({
      orderBy: { nombre: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching activity types:", error);
    return [];
  }
}

export async function getUserActivities(userId: string, typeId?: number, searchQuery?: string, page: number = 1, limit: number = 5) {
  try {
    const whereClause: any = {
      userId: userId,
      estatus: true, // Filtrar solo actividades activas
      activity: {
        isTemplate: false // Excluir plantillas del dashboard
      }
    };

    if (typeId) {
      whereClause.tipoActividadId = typeId;
    }

    if (searchQuery) {
      whereClause.activity = {
        ...whereClause.activity,
        activity_name: {
          contains: searchQuery
        }
      };
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await prisma.$transaction([
      prisma.ludiActividad.findMany({
        where: whereClause,
        include: {
          tipoActividad: true,
          grado: true,
          user: {
            select: {
              nombre: true,
              email: true
            }
          },
          activity: true
        },
        orderBy: {
          activity: {
            created_date: 'desc'
          }
        },
        skip,
        take: limit
      }),
      prisma.ludiActividad.count({ where: whereClause })
    ]);

    return { activities, total };
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return { activities: [], total: 0 };
  }
}

export async function getActivityById(activityId: number) {
  try {
    const activity = await prisma.ludiActividad.findFirst({
      where: { 
        activityId: activityId,
        estatus: true // Asegurar que no se obtengan actividades borradas lógicamente
      },
      include: {
        tipoActividad: true,
        grado: true,
        tema: true,
        user: {
          select: { nombre: true, email: true }
        },
        activity: true,
        config: {
          include: {
            tipoPuntuacion: true
          }
        },
        preguntas: {
          include: {
            opciones: true,
            preguntaRecursos: {
              include: {
                recurso: {
                  include: {
                    tipo: true,
                    origen: true
                  }
                }
              }
            }
          },
          orderBy: { numero: 'asc' }
        },
        memoriaParejas: {
          include: {
            tarjetas: {
              include: {
                recurso: true
              }
            }
          }
        }
      }
    });
    return activity;
  } catch (error) {
    console.error("Error fetching activity details:", error);
    return null;
  }
}
