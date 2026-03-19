"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActivityForEdit } from '@/app/actions/getActivityForEdit';
import { ModalMultimedia, LoadMultimediaFile, QuestionListItem } from "@/components/editor";
import style2 from '@/styles/pages/ludiquiz.module.css'; // Using the same style as LudiQuiz for consistency
import { TrueOrFalseQuestion } from '@/lib/types/';
import { useActivityEditor } from "@/context/ActivityEditorContext";

export default function TrueOrFalse() {
    // Contexto Global
    const { state, setActivityType, setQuestions, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const { backgroundImage, fullScreen } = state;

    useEffect(() => {
        setActivityType("trueorfalse");
    }, [setActivityType]);

    // Estados locales UI
    const [showYoutube, setShowYoutube] = useState(false);
    const [showUnsplash, setShowUnsplash] = useState(false);
    const [showFreesound, setShowFreesound] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    
    // Estado de la pregunta en edición
    const [questionId, setQuestionId] = useState(1);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    
    // Estado local sincronizado
    const [localQuestions, setLocalQuestions] = useState<TrueOrFalseQuestion[]>([]);

    const [newQuestion, setNewQuestion] = useState<TrueOrFalseQuestion>({
        id: questionId,
        text: "",
        correctAnswer: null,
        mediaType: null,
        mediaUrl: null,
    });

    
    useEffect(() => {
        const loadActivity = async () => {
            const idParam = searchParams.get("id");
            if (idParam) {
                setIsLoading(true);
                const result = await getActivityForEdit(parseInt(idParam));
                if (result.success && result.data) {
                    setActivityId(result.data.activityId);
                    setTitle(result.data.title);
                    updateConfig(result.data.config);
                    setBackgroundImage(result.data.backgroundImage);
                    
                    if (result.data.questions && result.data.questions.length > 0) {
                        const questions = result.data.questions as TrueOrFalseQuestion[];
                        setLocalQuestions(questions);
                        const maxId = Math.max(...questions.map(q => q.id));
                        setQuestionId(maxId + 1);
                        setNewQuestion(prev => ({ ...prev, id: maxId + 1 }));
                    }
                }
                setIsLoading(false);
            }
        };
        loadActivity();
    }, [searchParams, setActivityId, setTitle, updateConfig, setBackgroundImage]);

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

        // --- Actualizar estado visual de guardado ---
        if (questionsToSave.length === 0) {
            setSaveStatus('idle');
            return;
        }

        setSaveStatus('saving');
        const timeoutId = setTimeout(() => {
            setSaveStatus('saved');
        }, 800);
        return () => clearTimeout(timeoutId);

    }, [localQuestions, newQuestion, editingId, setQuestions]);
    // --- Fin sincronización ---

    const handleShowUnsplash = () => setShowUnsplash(!showUnsplash);
    const handleShowYoutube = () => setShowYoutube(!showYoutube);
    const handleShowFreesound = () => setShowFreesound(!showFreesound);

    // --- Validación Dinámica ---
    const isQuestionTextValid = newQuestion.text.trim().length > 0;

    const isAnswerSelected = newQuestion.correctAnswer !== null;
    const isFormValid = isQuestionTextValid && isAnswerSelected;

    const triggerValidation = () => {
        setShowErrors(true);
        setTimeout(() => setShowErrors(false), 3000);
    };

    const handleQuestionKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            if (isFormValid) {
                if (editingId !== null) handleUpdateQuestion();
                else handleAddQuestion();
            } else {
                triggerValidation();
            }
        }
    };

    const handleAddQuestion = () => {
        if (!isFormValid) {
            triggerValidation();
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
         if (!isFormValid) {
            triggerValidation();
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

    const handleDeleteQuestion = (id: number) => {
        setLocalQuestions(prev => prev.filter(q => q.id !== id));
        if (editingId === id) {
            handleCancelEdit();
        }
    };

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

    const handleSelectMediaNewQuestion = (type: string, url: string) => {
        setNewQuestion({ ...newQuestion, mediaType: type as "image" | "youtube" | "audio" | "video", mediaUrl: url });
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
                                    activityType="trueorfalse"
                                    isSelected={editingId === q.id}
                                    onClick={() => handleEditQuestion(q.id)}
                                    onDelete={() => handleDeleteQuestion(q.id)}
                                />
                            ))}
                            {!editingId && (
                                <QuestionListItem
                                    id={newQuestion.id}
                                    text={newQuestion.text || "Nueva pregunta..."}
                                    mediaType={newQuestion.mediaType}
                                    mediaUrl={newQuestion.mediaUrl}
                                    correctAnswer={newQuestion.correctAnswer ?? "false"}
                                    activityType="trueorfalse"
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
                                    Cancelar Edición
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
                            <div className="d-flex flex-column align-items-center mb-4 position-relative w-100">
                                <h1 className={style2.acth1} style={{ 
                                    fontFamily: 'Comic Sans MS, cursive',
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                    color: '#ffffff',
                                    marginBottom: '0.5rem'
                                }}>Verdadero o Falso</h1>
                                
                                {/* Indicador de autoguardado */}
                                <div style={{
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: saveStatus === 'idle' ? 0 : 1,
                                    transition: 'opacity 0.3s ease',
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    color: '#e2e8f0',
                                    fontSize: '0.8rem',
                                    backdropFilter: 'blur(2px)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                            {saveStatus === 'saving' ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '12px', height: '12px', borderWidth: '0.15em', marginRight: '4px' }}></span>
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '2px' }}>
                                                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                                                    </svg>
                                                    Borrador guardado
                                                </>
                                            )}
                                </div>
                            </div>
                            
                            <div className={style2.card}>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    {showErrors && !isQuestionTextValid && (
                                        <div style={{
                                            position: 'absolute', bottom: 'calc(100% + 5px)', left: '50%', transform: 'translateX(-50%)',
                                            background: 'rgba(50, 50, 50, 0.95)', color: 'white', padding: '6px 12px',
                                            borderRadius: '6px', fontSize: '0.8rem', zIndex: 100, whiteSpace: 'nowrap',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                        }}>
                                            Falta escribir la afirmación
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        className={style2["question-input"]}
                                        placeholder="Escribe tu afirmación aquí..."
                                        value={newQuestion.text}
                                        onChange={(e) =>
                                            setNewQuestion({ ...newQuestion, text: e.target.value })
                                        }
                                        onKeyDown={handleQuestionKeyDown}
                                    />
                                </div>

                                <LoadMultimediaFile
                                    type={newQuestion.mediaType}
                                    url={newQuestion.mediaUrl}
                                    onRemove={() =>
                                        setNewQuestion({ ...newQuestion, mediaType: null, mediaUrl: null })
                                    }
                                    onUpload={handleSelectMediaNewQuestion}
                                    onUnsplash={handleShowUnsplash}
                                    onYoutube={handleShowYoutube}
                                    onFreesound={handleShowFreesound}
                                    styleComponent={"trueorfalse"} // Note: passing 'trueorfalse' although we use style2 from ludiquiz might need checking, but style2 seems generic enough here or we reuse it. Reusing ludiquiz styles for consistency.
                                />

                                <div className="d-flex justify-content-center gap-4 mt-4 w-100 flex-wrap" style={{ position: 'relative' }}>
                                    {showErrors && !isAnswerSelected && (
                                        <div style={{
                                            position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)',
                                            background: 'rgba(50, 50, 50, 0.95)', color: 'white', padding: '6px 12px',
                                            borderRadius: '6px', fontSize: '0.8rem', zIndex: 100, whiteSpace: 'nowrap',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                        }}>
                                            Marca si es Verdadero o Falso
                                        </div>
                                    )}
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
                                        Verdadero
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
                                        Falso
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tip del tema y atajos */}
                        <div className="mt-4 d-flex flex-column gap-2 align-items-center">
                             <div className="alert alert-info border-0 shadow-sm d-inline-block m-0" style={{ 
                                borderRadius: '20px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                color: '#0dcaf0',
                                fontSize: '0.9rem',
                                padding: '0.5rem 1.5rem'
                            }}>
                                <small>
                                    <strong>Tip:</strong> El tema de fondo se aplicará automáticamente a la actividad
                                </small>
                            </div>
                            <div className="alert alert-secondary border-0 shadow-sm d-inline-block m-0" style={{ 
                                borderRadius: '20px',
                                background: 'rgba(0, 0, 0, 0.6)',
                                color: '#e2e8f0',
                                fontSize: '0.85rem',
                                padding: '0.4rem 1.2rem'
                            }}>
                                <small>
                                    <strong>Atajo de teclado:</strong> <kbd>Ctrl</kbd> + <kbd>Enter</kbd> para Guardar Cambios
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
