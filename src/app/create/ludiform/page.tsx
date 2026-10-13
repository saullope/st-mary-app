"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getActivityForEdit } from "@/app/actions/getActivityForEdit";
import { useActivityEditor } from "@/context/ActivityEditorContext";
import { useSelectedGrade } from "@/hooks/useSelectedGrade";
import { EditorSidebar, EditorCanvas, EditorPlaceholder, EditorGamificationColumn, moveItem } from "@/components/editor";
import { FormQuestionList, FormQuestionPicker } from "@/features/form/components/FormQuestionList";
import { FormQuestionEditor } from "@/features/form/components/FormQuestionEditor";
import { createFormQuestion, isFormAvailableForGrade, type FormQuestion, type FormQuestionType } from "@/features/form/formQuestions";

export default function LudiForm() {
    const { state, setActivityType, setFormQuestions, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();
    const { formQuestions: questions, fullScreen } = state;
    const searchParams = useSearchParams();
    const selectedGrade = useSelectedGrade();
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        setActivityType("ludiform");
    }, [setActivityType]);

    useEffect(() => {
        const idParam = searchParams.get("id");
        if (!idParam) return;
        const load = async () => {
            const result = await getActivityForEdit(parseInt(idParam));
            if (!result.success || !result.data) return;
            setActivityId(result.data.activityId);
            setTitle(result.data.title);
            updateConfig(result.data.config);
            setBackgroundImage(result.data.backgroundImage);
            setFormQuestions(result.data.formQuestions);
            setSelectedId(result.data.formQuestions[0]?.id ?? null);
        };
        load();
    }, [searchParams, setActivityId, setTitle, updateConfig, setBackgroundImage, setFormQuestions]);

    const addQuestion = (type: FormQuestionType) => {
        const id = questions.reduce((max, q) => Math.max(max, q.id), 0) + 1;
        setFormQuestions((prev) => [...prev, createFormQuestion(id, type)]);
        setSelectedId(id);
    };

    const updateQuestion = (id: number, changes: Partial<FormQuestion>) => {
        setFormQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...changes } : q)));
    };

    const moveQuestion = (id: number, direction: -1 | 1) => {
        setFormQuestions((prev) => moveItem(prev, id, direction));
    };

    const deleteQuestion = (id: number) => {
        const remaining = questions.filter((q) => q.id !== id);
        setFormQuestions(remaining);
        if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
    };

    // Mientras no se conoce el grado no se bloquea; el guardado lo vuelve a validar.
    const blockedByGrade = selectedGrade !== null && !isFormAvailableForGrade(selectedGrade);
    const selectedQuestion = questions.find((q) => q.id === selectedId) ?? null;

    if (blockedByGrade) {
        return (
            <div className="row" style={{ minHeight: "calc(100vh - 80px)" }}>
                <EditorCanvas title="LudiForm">
                    <EditorPlaceholder title="Disponible para tercer grado">
                        LudiForm está pensado para estudiantes de tercer grado. Cambia el grado en la pantalla de
                        Bienvenida para crear un formulario.
                    </EditorPlaceholder>
                </EditorCanvas>
            </div>
        );
    }

    return (
        <div className="row" style={{ minHeight: "calc(100vh - 80px)" }}>
            {!fullScreen && (
                <EditorSidebar
                    title="Preguntas"
                    count={questions.length}
                    actions={<FormQuestionPicker onAdd={addQuestion} />}
                >
                    <FormQuestionList
                        questions={questions}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onMove={moveQuestion}
                        onDelete={deleteQuestion}
                    />
                </EditorSidebar>
            )}

            <EditorCanvas title="LudiForm">
                {selectedQuestion ? (
                    <FormQuestionEditor
                        key={selectedQuestion.id}
                        question={selectedQuestion}
                        onChange={(changes) => updateQuestion(selectedQuestion.id, changes)}
                    />
                ) : (
                    <EditorPlaceholder title="Arma tu formulario">
                        Agrega preguntas de opción única, de selección múltiple o de respuesta larga. Tus estudiantes
                        responderán sin límite de tiempo y tú revisarás las respuestas escritas en Reportes.
                    </EditorPlaceholder>
                )}
            </EditorCanvas>

            <EditorGamificationColumn />
        </div>
    );
}
