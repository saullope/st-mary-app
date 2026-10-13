"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

interface SlideLike {
    id: number;
    text: string;
    mediaUrl: string | null;
    isSlide?: boolean;
}

interface UseContentSlidesOptions<T extends SlideLike> {
    questions: T[];
    setQuestions: Dispatch<SetStateAction<T[]>>;
    /** Reserva el siguiente id libre del editor (el mismo contador que usan las preguntas). */
    allocateId: () => number;
    buildSlide: (id: number, title: string, url: string) => T;
}

/**
 * Estado compartido de las diapositivas de contenido en los editores LudiQuiz
 * y Verdadero/Falso: abrir el modal para crear o editar y aplicar el resultado
 * sobre la lista local de preguntas.
 */
export function useContentSlides<T extends SlideLike>({ questions, setQuestions, allocateId, buildSlide }: UseContentSlidesOptions<T>) {
    const [show, setShow] = useState(false);
    const [editingSlideId, setEditingSlideId] = useState<number | null>(null);

    const editingSlide = editingSlideId !== null ? questions.find((q) => q.id === editingSlideId) : undefined;

    const openNewSlide = () => {
        setEditingSlideId(null);
        setShow(true);
    };

    const openEditSlide = (id: number) => {
        setEditingSlideId(id);
        setShow(true);
    };

    const close = () => {
        setShow(false);
        setEditingSlideId(null);
    };

    const submit = (url: string, title: string) => {
        if (editingSlideId !== null) {
            setQuestions((prev) => prev.map((q) => (q.id === editingSlideId ? { ...q, text: title, mediaUrl: url } : q)));
            return;
        }
        const slide = buildSlide(allocateId(), title, url);
        // Las diapositivas van al inicio, a continuación de las que ya encabezan la lista,
        // para que el estudiante las vea antes de la primera pregunta y en el orden creado.
        setQuestions((prev) => {
            const firstQuestionIndex = prev.findIndex((q) => !q.isSlide);
            const insertAt = firstQuestionIndex === -1 ? prev.length : firstQuestionIndex;
            return [...prev.slice(0, insertAt), slide, ...prev.slice(insertAt)];
        });
    };

    return {
        openNewSlide,
        openEditSlide,
        // key distinto por diapositiva para que el formulario del modal se reinicie con sus valores.
        modalKey: editingSlideId !== null ? `slide-${editingSlideId}` : "slide-new",
        modalProps: {
            show,
            handleClose: close,
            onSubmit: submit,
            initialUrl: editingSlide?.mediaUrl ?? "",
            initialTitle: editingSlide?.text ?? "",
        },
    };
}
