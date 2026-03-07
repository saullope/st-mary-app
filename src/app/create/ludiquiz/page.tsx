"use client"

import { useState, useEffect } from 'react';
import { ModalMultimedia, LoadMultimediaFile, AnswerContainer, QuestionListItem } from "@/components/editor";
import style2 from '@/styles/pages/ludiquiz.module.css';
import { useTranslations } from 'next-intl';
import { LudiQuizQuestion } from '@/lib/types/';
import { useActivityEditor } from "@/context/ActivityEditorContext";

export default function LudiQuiz() {
    /** Traducciones */
    const t = useTranslations("createActivityDashboard");

    // Usar Contexto Global
    const { state, setActivityType, setQuestions } = useActivityEditor();
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
    }, [localQuestions, newQuestion, questionText, editingId, setQuestions]);
    
    // --- Fin sincronización ---

    const handleShowUnsplash = () => setShowUnsplash(!showUnsplash);
    const handleShowYoutube = () => setShowYoutube(!showYoutube);
    const handleShowFreesound = () => setShowFreesound(!showFreesound);

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

    // Funciones para manejar múltiples preguntas
    const handleInputNewQuestion = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionText(event.target.value);
    };

    const handleSelectMediaNewQuestion = (type: string, url: string) => {
        setNewQuestion({ ...newQuestion, mediaType: type as "image" | "youtube" | "audio" | "video", mediaUrl: url });
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

    const handleAddQuestion = () => {
        if (!questionText.trim() || !newQuestion.answers.some(a => a.isCorrect) || newQuestion.answers.some(a => !a.text.trim())) {
            alert("Por favor completa la pregunta, todas las respuestas y selecciona la respuesta correcta");
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
        if (!questionText.trim() || !newQuestion.answers.some(a => a.isCorrect) || newQuestion.answers.some(a => !a.text.trim())) {
            alert("Por favor completa la pregunta, todas las respuestas y selecciona la respuesta correcta");
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
                                    isSelected={editingId === q.id}
                                    onClick={() => handleEditQuestion(q.id)}
                                    // Add delete handler if QuestionListItem supports it, otherwise need to add button
                                />
                            ))}
                            {!editingId && (
                                <QuestionListItem
                                    id={newQuestion.id}
                                    text={newQuestion.text || "Nueva pregunta..."}
                                    mediaType={newQuestion.mediaType}
                                    mediaUrl={newQuestion.mediaUrl}
                                    correctAnswer={newQuestion.answers.find(a => a.isCorrect) ? "true" : "false"}
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
                            <h1 className={style2.acth1} style={{ 
                                fontFamily: 'Comic Sans MS, cursive',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                color: '#ffffff', // Cambiado a blanco para contraste con fondo oscuro
                                marginBottom: '2rem'
                            }}>LudiQuiz</h1>

                            {/* <!-- Tarjeta de Pregunta --> */}
                            <div className={style2.card}>
                                {/* <!-- Campo de Pregunta --> */}
                                <input 
                                    type="text" 
                                    className={style2['question-input']}
                                    placeholder="Escribe tu pregunta aquí..." 
                                    aria-label="Pregunta"
                                    value={questionText}
                                    onChange={handleInputNewQuestion}
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
                                    styleComponent={"ludiquiz"}
                                />

                                {/*<!-- Input oculto para subir archivos -->*/}
                                <input type="file" id="file-input"
                                    accept="image/*,video/*,audio/*" hidden />

                                <div className={style2['main-container']}>
                                    <AnswerContainer
                                        answers={newQuestion.answers}
                                        onAddAnswer={addAnswerToNewQuestion}
                                        onUpdateAnswerText={updateAnswerTextInNewQuestion}
                                        onToggleCorrectAnswer={toggleCorrectAnswerInNewQuestion}
                                        onUpdateAnswerImage={updateAnswerImageInNewQuestion}
                                        onDeleteAnswer={deleteAnswerFromNewQuestion}
                                    />
                                </div>

                            </div>
                        </div>
                        {/** FIN CONTENIDO DEL EDITOR */}
                        
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
