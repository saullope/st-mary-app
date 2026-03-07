"use client"

import { useState, useEffect } from 'react';
import { ModalMultimedia, LoadMultimediaFile, QuestionListItem } from "@/components/editor";
import style2 from '@/styles/pages/ludiquiz.module.css'; // Using the same style as LudiQuiz for consistency
import { TrueOrFalseQuestion } from '@/lib/types/';
import { useActivityEditor } from "@/context/ActivityEditorContext";

export default function TrueOrFalse() {
    // Contexto Global
    const { state, setActivityType, setQuestions } = useActivityEditor();
    const { backgroundImage, fullScreen } = state;

    useEffect(() => {
        setActivityType("trueorfalse");
    }, [setActivityType]);

    // Estados locales UI
    const [showYoutube, setShowYoutube] = useState(false);
    const [showUnsplash, setShowUnsplash] = useState(false);
    const [showFreesound, setShowFreesound] = useState(false);
    
    // Estado de la pregunta en edición
    const [questionId, setQuestionId] = useState(1);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    // Estado local sincronizado
    const [localQuestions, setLocalQuestions] = useState<TrueOrFalseQuestion[]>([]);

    const [newQuestion, setNewQuestion] = useState<TrueOrFalseQuestion>({
        id: questionId,
        text: "",
        correctAnswer: null,
        mediaType: null,
        mediaUrl: null,
    });

    // --- Sincronización en tiempo real con el contexto ---
    useEffect(() => {
        // Crear una lista combinada para el contexto (persistiendo el borrador actual)
        let questionsToSave: TrueOrFalseQuestion[] = [...localQuestions];
        
        const currentDraft = {
            ...newQuestion,
            id: editingId !== null ? editingId : newQuestion.id
        };

        // Si estamos editando, reemplazamos en la lista temporal
        if (editingId !== null) {
             const index = questionsToSave.findIndex(q => q.id === editingId);
             if (index !== -1) {
                 questionsToSave[index] = currentDraft;
             }
        } 
        // Si estamos agregando (y hay contenido), agregamos al final
        else {
            // Validamos mínimamente
            if (newQuestion.text.trim() || newQuestion.correctAnswer !== null) {
                 questionsToSave.push(currentDraft);
            }
        }

        setQuestions(questionsToSave);
    }, [localQuestions, newQuestion, editingId, setQuestions]);
    // --- Fin sincronización ---

    const handleShowUnsplash = () => setShowUnsplash(!showUnsplash);
    const handleShowYoutube = () => setShowYoutube(!showYoutube);
    const handleShowFreesound = () => setShowFreesound(!showFreesound);

    const handleSelectMediaNewQuestion = (type: string, url: string) => {
        setNewQuestion({ ...newQuestion, mediaType: type as "image" | "youtube" | "audio" | "video", mediaUrl: url });
    };

    const handleAddQuestion = () => {
        if (!newQuestion.text.trim() || newQuestion.correctAnswer === null) {
            alert("Por favor completa la pregunta y selecciona una respuesta.");
            return;
        }

        const questionToAdd = {
            ...newQuestion,
            id: questionId
        };

        setLocalQuestions(prev => [...prev, questionToAdd]);
        setQuestionId(prev => prev + 1);
        
        // Reset
        setNewQuestion({
            id: questionId + 1,
            text: "",
            correctAnswer: null,
            mediaType: null,
            mediaUrl: null,
        });
    };

    const handleUpdateQuestion = () => {
         if (!newQuestion.text.trim() || newQuestion.correctAnswer === null) {
            alert("Por favor completa la pregunta y selecciona una respuesta.");
            return;
        }

        setLocalQuestions(prev => prev.map(q => 
            q.id === editingId 
                ? { ...newQuestion }
                : q
        ));
        
        setEditingId(null);
        // Reset to new question state
        setNewQuestion({
            id: questionId,
            text: "",
            correctAnswer: null,
            mediaType: null,
            mediaUrl: null,
        });
    }

    const handleEditQuestion = (id: number) => {
        const q = localQuestions.find(q => q.id === id);
        if (!q) return;

        setEditingId(q.id);
        setNewQuestion({
            id: q.id,
            text: q.text,
            correctAnswer: q.correctAnswer,
            mediaType: q.mediaType,
            mediaUrl: q.mediaUrl,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewQuestion({
            id: questionId,
            text: "",
            correctAnswer: null,
            mediaType: null,
            mediaUrl: null,
        });
    };

    const handleSelectFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*,audio/*'; 
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const fileType = file.type.startsWith('image/')
                    ? 'image'
                    : file.type.startsWith('video/')
                        ? 'video'
                        : file.type.startsWith('audio/')
                            ? 'audio'
                            : null;

                if (fileType) {
                    const fileURL = URL.createObjectURL(file); 
                    handleSelectMediaNewQuestion(fileType, fileURL); 
                }
            }
        };
        input.click(); 
    };

    return (
        <>
             <div className="row" style={{ minHeight: "calc(100vh - 80px)" }}>
                {!fullScreen && (
                    <div className="col-2 card shadow-sm rounded p-3 me-3" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                         <h5 className="mb-3 text-muted">Preguntas ({localQuestions.length})</h5>
                        <ul className="list-group list-group-flush p-0 mb-3">
                            {localQuestions.map((q) => (
                                <QuestionListItem
                                    key={q.id}
                                    id={q.id}
                                    text={q.text}
                                    mediaType={q.mediaType}
                                    mediaUrl={q.mediaUrl}
                                    correctAnswer={q.correctAnswer}
                                    isSelected={editingId === q.id}
                                    onClick={() => handleEditQuestion(q.id)}
                                />
                            ))}
                            {!editingId && (
                                <QuestionListItem
                                    id={newQuestion.id}
                                    text={newQuestion.text || "Nueva pregunta..."}
                                    mediaType={newQuestion.mediaType}
                                    mediaUrl={newQuestion.mediaUrl}
                                    correctAnswer={newQuestion.correctAnswer ?? "false"}
                                    isSelected={true}
                                    onClick={() => {}}
                                />
                            )}
                        </ul>

                        <div className="d-flex flex-column gap-2 mt-auto">
                            <button
                                className="btn w-100"
                                onClick={editingId ? handleUpdateQuestion : handleAddQuestion}
                                style={{
                                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderRadius: '15px',
                                    padding: '12px',
                                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                                    transition: 'all 0.3s ease',
                                    fontFamily: 'Comic Sans MS, cursive'
                                }}
                            >
                                {editingId !== null ? "Guardar Cambios" : "Agregar Pregunta"}
                            </button>
                            {editingId && (
                                <button
                                    className="btn w-100"
                                    onClick={handleCancelEdit}
                                    style={{
                                        background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                                        border: 'none',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: '15px',
                                        padding: '12px',
                                        boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)',
                                        transition: 'all 0.3s ease',
                                        fontFamily: 'Comic Sans MS, cursive'
                                    }}
                                >
                                    ❌ Cancelar Edición
                                </button>
                            )}
                        </div>
                    </div>
                )}
                
                <div className={`col card shadow-sm rounded p-0 d-flex ${fullScreen ? "col-12" : "col"}`}
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundAttachment: "fixed",
                        width: "100%",
                        minHeight: "calc(100vh - 120px)",
                        transition: "all 0.3s ease-in-out",
                        position: "relative",
                        border: 'none',
                        overflow: 'hidden'
                    }}
                >
                    {/* Overlay semi-transparente para mejorar legibilidad */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.3)",
                        zIndex: 1
                    }}></div>
                    
                    <div className="col d-flex flex-column justify-content-center align-items-center position-relative" style={{ zIndex: 2, padding: '2rem' }}>
                        <div className={style2.container}>
                            <h1 className={style2.acth1} style={{ 
                                fontFamily: 'Comic Sans MS, cursive',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                color: '#ffffff',
                                marginBottom: '2rem'
                            }}>Verdadero o Falso</h1>
                            
                            <div className={style2.card}>
                                <input
                                    type="text"
                                    className={style2["question-input"]}
                                    placeholder="Escribe tu pregunta aquí..."
                                    value={newQuestion.text}
                                    onChange={(e) =>
                                        setNewQuestion({ ...newQuestion, text: e.target.value })
                                    }
                                />

                                <LoadMultimediaFile
                                    type={newQuestion.mediaType}
                                    url={newQuestion.mediaUrl}
                                    onRemove={() =>
                                        setNewQuestion({ ...newQuestion, mediaType: null, mediaUrl: null })
                                    }
                                    onUpload={handleSelectFile}
                                    onUnsplash={handleShowUnsplash}
                                    onYoutube={handleShowYoutube}
                                    onFreesound={handleShowFreesound}
                                    styleComponent={"trueorfalse"} // Note: passing 'trueorfalse' although we use style2 from ludiquiz might need checking, but style2 seems generic enough here or we reuse it. Reusing ludiquiz styles for consistency.
                                />

                                {/* Input oculto para subir archivos */}
                                <input type="file" id="file-input"
                                    accept="image/*,video/*,audio/*" hidden />

                                <div className="d-flex justify-content-center gap-4 mt-4 w-100 flex-wrap">
                                    <button
                                        onClick={() =>
                                            setNewQuestion({ ...newQuestion, correctAnswer: "true" })
                                        }
                                        style={{
                                            background: newQuestion.correctAnswer === "true" 
                                                ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                                : 'rgba(255, 255, 255, 0.9)',
                                            border: newQuestion.correctAnswer === "true" ? 'none' : '2px solid #28a745',
                                            color: newQuestion.correctAnswer === "true" ? 'white' : '#28a745',
                                            fontWeight: 'bold',
                                            borderRadius: '20px',
                                            padding: '15px 40px',
                                            boxShadow: newQuestion.correctAnswer === "true" 
                                                ? '0 6px 20px rgba(40, 167, 69, 0.4)'
                                                : '0 4px 10px rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'Comic Sans MS, cursive',
                                            fontSize: '1.2rem',
                                            transform: newQuestion.correctAnswer === "true" ? 'scale(1.05)' : 'scale(1)',
                                            cursor: 'pointer',
                                            minWidth: '200px'
                                        }}
                                        onMouseOver={(e) => {
                                            if (newQuestion.correctAnswer !== "true") {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (newQuestion.correctAnswer !== "true") {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        🔷 Verdadero
                                    </button>
                                    <button
                                        onClick={() =>
                                            setNewQuestion({ ...newQuestion, correctAnswer: "false" })
                                        }
                                        style={{
                                            background: newQuestion.correctAnswer === "false" 
                                                ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                                                : 'rgba(255, 255, 255, 0.9)',
                                            border: newQuestion.correctAnswer === "false" ? 'none' : '2px solid #dc3545',
                                            color: newQuestion.correctAnswer === "false" ? 'white' : '#dc3545',
                                            fontWeight: 'bold',
                                            borderRadius: '20px',
                                            padding: '15px 40px',
                                            boxShadow: newQuestion.correctAnswer === "false" 
                                                ? '0 6px 20px rgba(220, 53, 69, 0.4)'
                                                : '0 4px 10px rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'Comic Sans MS, cursive',
                                            fontSize: '1.2rem',
                                            transform: newQuestion.correctAnswer === "false" ? 'scale(1.05)' : 'scale(1)',
                                            cursor: 'pointer',
                                            minWidth: '200px'
                                        }}
                                        onMouseOver={(e) => {
                                            if (newQuestion.correctAnswer !== "false") {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (newQuestion.correctAnswer !== "false") {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        ⚠️ Falso
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tip del tema */}
                        <div className="mt-4">
                             <div className="alert alert-info border-0 shadow-sm d-inline-block" style={{ 
                                borderRadius: '20px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                color: '#0dcaf0',
                                fontSize: '0.9rem',
                                padding: '0.5rem 1.5rem'
                            }}>
                                <small>
                                    💡 <strong>Tip:</strong> El tema de fondo se aplicará automáticamente a la actividad
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <ModalMultimedia
                    show={showUnsplash}
                    handleClose={handleShowUnsplash}
                    origin="unsplash"
                    onSelectMedia={handleSelectMediaNewQuestion}
                />
                <ModalMultimedia
                    show={showYoutube}
                    handleClose={handleShowYoutube}
                    origin="youtube"
                    onSelectMedia={handleSelectMediaNewQuestion}
                />
                <ModalMultimedia
                    show={showFreesound}
                    handleClose={handleShowFreesound}
                    origin="freesound"
                    onSelectMedia={handleSelectMediaNewQuestion}
                />
            </div>
        </>
    );
}
