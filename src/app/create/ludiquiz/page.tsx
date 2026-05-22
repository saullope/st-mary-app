"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActivityForEdit } from '@/app/actions/getActivityForEdit';
import { ModalMultimedia, LoadMultimediaFile, AnswerContainer, QuestionListItem } from "@/components/editor";
import style2 from '@/styles/pages/ludiquiz.module.css';
import { useTranslations } from 'next-intl';
import { LudiQuizQuestion } from '@/lib/types/';
import { useActivityEditor } from "@/context/ActivityEditorContext";
import LudiQuizTour from "./LudiQuizTour";

export default function LudiQuiz() {
    /** Traducciones */
    const t = useTranslations("createActivityDashboard");

    // Usar Contexto Global
    const { state, setActivityType, setQuestions, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    
    const { backgroundImage, fullScreen } = state; // Usar valores del contexto
    
    // Inicializar el tipo de actividad al montar
    useEffect(() => {
        setActivityType("ludiquiz");
    }, [setActivityType]);

    // Estado local para UI (modales)
    const [showYoutube, setShowYoutube] = useState(false);
    const [showUnsplash, setShowUnsplash] = useState(false);
    const [showFreesound, setShowFreesound] = useState(false);
    
    // Estado local para la "Pregunta en Edición" (Staging area)
    const [questionId, setQuestionId] = useState(1);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [questionText, setQuestionText] = useState("");
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    
    const [newQuestion, setNewQuestion] = useState<LudiQuizQuestion>({
        id: questionId,
        text: "",
        answers: [
            { id: 0, text: '', isCorrect: false },
            { id: 1, text: '', isCorrect: false },
        ],
        mediaType: null,
        mediaUrl: null,
    });

    // Lista de preguntas confirmadas localmente
    const [localQuestions, setLocalQuestions] = useState<LudiQuizQuestion[]>([]);

    

    
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
                        const questions = result.data.questions as LudiQuizQuestion[];
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

    // --- Sincronizar preguntas locales con el contexto global ---
    useEffect(() => {
        // Crear una lista combinada para el contexto
        let questionsToSave: LudiQuizQuestion[] = [...localQuestions];
        
        const currentDraft = {
            ...newQuestion,
            text: questionText,
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
        // El usuario pidió: "Al hacer clic en Guardar, el arreglo debe incluir la pregunta actual"
        // Esto lo logramos enviando el borrador actual al contexto.
        else {
            // Validamos mínimamente para no llenar de basura
            // Solo sincronizamos si hay ALGO de texto en la pregunta o en alguna respuesta
            if (questionText.trim() || newQuestion.answers.some(a => a.text.trim())) {
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

    }, [localQuestions, newQuestion, questionText, editingId, setQuestions]);
    
    // --- Fin sincronización ---

    const handleShowUnsplash = () => setShowUnsplash(!showUnsplash);
    const handleShowYoutube = () => setShowYoutube(!showYoutube);
    const handleShowFreesound = () => setShowFreesound(!showFreesound);

    const handleSelectMediaNewQuestion = (type: string, url: string) => {
        setNewQuestion({ ...newQuestion, mediaType: type as "image" | "youtube" | "audio" | "video", mediaUrl: url });
    };

    // Funciones para manejar múltiples preguntas
    const handleInputNewQuestion = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionText(event.target.value);
    };

    const handleQuestionKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const firstAnswerInput = document.querySelector('.answer-input-field') as HTMLInputElement | null;
            if (firstAnswerInput) firstAnswerInput.focus();
        } else if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            if (isFormValid) {
                if (editingId !== null) handleUpdateQuestion();
                else handleAddQuestion();
            }
        }
    };

    const handleAnswerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            // Marcar como correcta y, si el formulario es válido, guardar
            toggleCorrectAnswerInNewQuestion(newQuestion.answers[index].id);
            
            // Check validity after toggling (using the updated state indirectly or waiting)
            // It's safer to just toggle for now to avoid state staleness issues, 
            // but we can encourage them to hit Ctrl+Shift+Enter or just let them press Enter on the button.
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            const inputs = document.querySelectorAll('.answer-input-field') as NodeListOf<HTMLInputElement>;
            
            if (index < inputs.length - 1) {
                // Hay otra respuesta abajo, le pasamos el foco
                inputs[index + 1].focus();
            } else {
                // Es la última respuesta, agregamos una nueva y la enfocamos
                addAnswerToNewQuestion();
                setTimeout(() => {
                    const newInputs = document.querySelectorAll('.answer-input-field') as NodeListOf<HTMLInputElement>;
                    if (newInputs.length > 0) {
                        newInputs[newInputs.length - 1].focus();
                    }
                }, 50); // Pequeño retraso para permitir el renderizado
            }
        }
    };

    const addAnswerToNewQuestion = () => {
        setNewQuestion(prev => ({
            ...prev,
            answers: [
                ...prev.answers,
                { id: prev.answers.length, text: '', isCorrect: false }
            ]
        }));
    };

    const updateAnswerTextInNewQuestion = (id: number, text: string) => {
        setNewQuestion(prev => ({
            ...prev,
            answers: prev.answers.map(answer => 
                answer.id === id ? { ...answer, text } : answer
            )
        }));
    };

    const toggleCorrectAnswerInNewQuestion = (id: number) => {
        setNewQuestion(prev => ({
            ...prev,
            answers: prev.answers.map(answer =>
                answer.id === id
                    ? { ...answer, isCorrect: !answer.isCorrect }
                    : { ...answer, isCorrect: false }
            )
        }));
    };

    const updateAnswerImageInNewQuestion = (id: number, imageUrl: string | null) => {
        setNewQuestion(prev => ({
            ...prev,
            answers: prev.answers.map(answer =>
                answer.id === id ? { ...answer, imageUrl } : answer
            )
        }));
    };

    const deleteAnswerFromNewQuestion = (id: number) => {
        setNewQuestion(prev => ({
            ...prev,
            answers: prev.answers.filter(answer => answer.id !== id)
        }));
    };

    const [showErrors, setShowErrors] = useState(false);

    // --- Validación Dinámica ---
    const isQuestionTextValid = questionText.trim().length > 0;
    const isCorrectAnswerSelected = newQuestion.answers.some(a => a.isCorrect);
    const areAllAnswersFilled = newQuestion.answers.every(a => a.text.trim().length > 0);
    const hasEnoughAnswers = newQuestion.answers.length >= 2;
    const isFormValid = isQuestionTextValid && isCorrectAnswerSelected && areAllAnswersFilled && hasEnoughAnswers;

    const triggerValidation = () => {
        setShowErrors(true);
        setTimeout(() => setShowErrors(false), 3000); // Ocultar después de 3 segundos
    };

    const handleAddQuestion = () => {
        if (!isFormValid) {
            triggerValidation();
            return;
        }

        const questionToAdd = {
            ...newQuestion,
            text: questionText,
            id: questionId
        };

        setLocalQuestions(prev => [...prev, questionToAdd]); 
        setQuestionId(prev => prev + 1);
        setQuestionText("");
        setNewQuestion({
            id: questionId + 1,
            text: "",
            answers: [
                { id: 0, text: '', isCorrect: false },
                { id: 1, text: '', isCorrect: false },
            ],
            mediaType: null,
            mediaUrl: null,
        });
    };

    const handleEditQuestion = (id: number) => {
        const question = localQuestions.find(q => q.id === id); 
        if (question) {
            setEditingId(id);
            setQuestionText(question.text);
            setNewQuestion(question);
        }
    };

    const handleUpdateQuestion = () => {
        if (!isFormValid) {
            triggerValidation();
            return;
        }

        setLocalQuestions(prev => prev.map(q => 
            q.id === editingId 
                ? { ...newQuestion, text: questionText }
                : q
        )); 
        setEditingId(null);
        setQuestionText("");
        // Reset to new question state for adding next one
        setNewQuestion({
            id: questionId,
            text: "",
            answers: [
                { id: 0, text: '', isCorrect: false },
                { id: 1, text: '', isCorrect: false },
            ],
            mediaType: null,
            mediaUrl: null,
        });
    };

    const handleDeleteQuestion = (id: number) => {
        setLocalQuestions(prev => prev.filter(q => q.id !== id)); 
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setQuestionText("");
        setNewQuestion({
            id: questionId,
            text: "",
            answers: [
                { id: 0, text: '', isCorrect: false },
                { id: 1, text: '', isCorrect: false },
            ],
            mediaType: null,
            mediaUrl: null,
        });
    };

    return (
        <>
            <LudiQuizTour />
            {/* El Navbar ahora está en layout.tsx */}
            
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
                                    correctAnswer={q.answers.find(a => a.isCorrect) ? "true" : "false"}
                                    activityType="ludiquiz"
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
                                    correctAnswer={newQuestion.answers.find(a => a.isCorrect) ? "true" : "false"}
                                    activityType="ludiquiz"
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
                        minHeight: "calc(100vh - 120px)", // Ajustado para el nuevo layout
                        transition: "all 0.3s ease-in-out",
                        position: "relative",
                        border: 'none',
                        overflow: 'hidden'
                    }}>
                    
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
                    
                    <div className='col d-flex flex-column justify-content-center align-items-center position-relative' style={{ zIndex: 2, padding: '2rem' }}>
                        {/** INICIO CONTENIDO DEL EDITOR */}
                        <div className={style2.container}>
                            <div className="d-flex flex-column align-items-center mb-4 position-relative w-100">
                                <h1 className={style2.acth1} style={{ 
                                    fontFamily: 'Comic Sans MS, cursive',
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                    color: '#ffffff', // Cambiado a blanco para contraste con fondo oscuro
                                    marginBottom: '0.5rem'
                                }}>LudiQuiz</h1>
                                
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

                            {/* <!-- Tarjeta de Pregunta --> */}
                            <div className={style2.card}>
                                {/* <!-- Campo de Pregunta --> */}
                                <div style={{ position: 'relative', width: '100%' }}>
                                    {showErrors && !isQuestionTextValid && (
                                        <div style={{
                                            position: 'absolute', bottom: 'calc(100% + 5px)', left: '50%', transform: 'translateX(-50%)',
                                            background: 'rgba(50, 50, 50, 0.95)', color: 'white', padding: '6px 12px',
                                            borderRadius: '6px', fontSize: '0.8rem', zIndex: 100, whiteSpace: 'nowrap',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                        }}>
                                            Falta escribir la pregunta
                                        </div>
                                    )}
                                    <input 
                                        type="text" 
                                        className={`${style2['question-input']} textarea-question-input`}
                                        data-tour="question-input"
                                        placeholder="Escribe tu pregunta aquí... (Presiona Enter para ir a las respuestas)" 
                                        aria-label="Pregunta"
                                        value={questionText}
                                        onChange={handleInputNewQuestion}
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
                                    styleComponent={"ludiquiz"}
                                />

                                <div className={style2['main-container']} style={{ position: 'relative' }}>
                                    {showErrors && (!areAllAnswersFilled || !isCorrectAnswerSelected || !hasEnoughAnswers) && (
                                        <div style={{
                                            position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)',
                                            background: 'rgba(50, 50, 50, 0.95)', color: 'white', padding: '6px 12px',
                                            borderRadius: '6px', fontSize: '0.8rem', zIndex: 100, whiteSpace: 'nowrap',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                        }}>
                                            {!hasEnoughAnswers ? "Agrega al menos 2 respuestas" :
                                             !areAllAnswersFilled ? "Completa el texto en todas las respuestas" :
                                             "Marca la respuesta correcta"}
                                        </div>
                                    )}
                                    <AnswerContainer
                                        answers={newQuestion.answers}
                                        onAddAnswer={addAnswerToNewQuestion}
                                        onUpdateAnswerText={updateAnswerTextInNewQuestion}
                                        onToggleCorrectAnswer={toggleCorrectAnswerInNewQuestion}
                                        onUpdateAnswerImage={updateAnswerImageInNewQuestion}
                                        onDeleteAnswer={deleteAnswerFromNewQuestion}
                                        onAnswerKeyDown={handleAnswerKeyDown}
                                    />
                                </div>

                            </div>
                        </div>
                        {/** FIN CONTENIDO DEL EDITOR */}
                        
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
                                    <strong>Atajos de teclado:</strong> <kbd>Enter</kbd> para avanzar | <kbd>Ctrl</kbd> + <kbd>Enter</kbd> para marcar correcta
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/** Area de modal */}
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
