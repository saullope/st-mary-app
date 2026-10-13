import type { MediaType } from "./media";

export type LudiQuizActivity = {
    activityName: string; // Nombre de la actividad
    activityType: string | null; // Tipo de actividad
    activityCode: string; // Código de la actividad
    createdBy: string; // ID del usuario que creó la actividad
    creationDate: Date; // Fecha de creación de la actividad
    lastModifiedDate: Date; // Fecha de la última modificación
    completionDate: Date; // Fecha de finalización de la actividad
    status: string; // Estado de la actividad ACTIVE | INACTIVE | DELETED | PENDING
    backgroundTheme: string; // Tema de fondo de la actividad
    ludiQuizQuestions: LudiQuizQuestion[]; 
}

export type LudiQuizQuestion = {
    id: number; // Identificador único de la pregunta
    text: string; // Texto de la pregunta
    answers: LudiQuizAnswer[]; // Array de respuestas posibles
    mediaType: MediaType | null;
    mediaUrl: string | null; // URL del archivo multimedia
    isSlide?: boolean; // Diapositiva de contenido: solo text + mediaUrl, sin respuestas ni tiempo
};

export type LudiQuizAnswer = {
    id: number; // Identificador unico de la respuesta
    text: string; // Texto de la respuesta
    isCorrect: boolean; // Si es la respuesta correcta
    imageUrl?: string | null; // URL de imagen opcional para la respuesta
};
