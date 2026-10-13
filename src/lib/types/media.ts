// Tipos de multimedia que una pregunta puede llevar. "canva" se persiste
// como LudiTipoRecurso PRESENTACION (ver src/lib/activity-helpers.ts).
export type MediaType = "image" | "video" | "audio" | "youtube" | "canva";

/** Crea una diapositiva de contenido con la forma común a LudiQuiz y Verdadero/Falso. */
export function createContentSlide(id: number, title: string, canvaUrl: string) {
    return {
        id,
        text: title,
        mediaType: "canva" as MediaType,
        mediaUrl: canvaUrl,
        isSlide: true as const,
    };
}
