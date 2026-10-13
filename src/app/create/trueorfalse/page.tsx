"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActivityForEdit } from '@/app/actions/getActivityForEdit';
import { ModalMultimedia, CanvaEmbedModal, LoadMultimediaFile, useContentSlides, EditorSidebar, EditorGamificationColumn, EditorAddButton, EditorFooterButton, QuestionList, moveItem, type EditorListTagTone } from "@/components/editor";
import { SiCanva } from "react-icons/si";
import { notify } from "@/components/ui";
import style2 from '@/styles/pages/ludiquiz.module.css'; // Using the same style as LudiQuiz for consistency
import { TrueOrFalseQuestion, MediaType, createContentSlide } from '@/lib/types/';
import { useActivityEditor } from "@/context/ActivityEditorContext";
import { useTranslations } from "next-intl";

// Distintivo de la respuesta correcta en la lista lateral.
const answerTag = (answer: TrueOrFalseQuestion["correctAnswer"], labels: { true: string; false: string }): { text: string; tone: EditorListTagTone } | undefined =>
    answer === "true" ? { text: labels.true, tone: "success" } : answer === "false" ? { text: labels.false, tone: "danger" } : undefined;

export default function TrueOrFalse() {
    // Contexto Global
    const { state, setActivityType, setQuestions, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();
    const searchParams = useSearchParams();
    const t = useTranslations("Editor.trueOrFalse");
    const tq = useTranslations("Editor.quiz");
    const answerLabels = { true: t("true"), false: t("false") };
    const [isLoading, setIsLoading] = useState(false);
    const { backgroundImage, fullScreen } = state;

    useEffect(() => {
        setActivityType("trueorfalse");
    }, [setActivityType]);

    // Estados locales UI
    const [showYoutube, setShowYoutube] = useState(false);
    const [showUnsplash, setShowUnsplash] = useState(false);
    const [showFreesound, setShowFreesound] = useState(false);
    const [showPixabay, setShowPixabay] = useState(false);
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

    const slides = useContentSlides<TrueOrFalseQuestion>({
        questions: localQuestions,
        setQuestions: setLocalQuestions,
        allocateId: () => {
            const id = questionId;
            setQuestionId(id + 1);
            // Mientras se edita otra pregunta, newQuestion es esa pregunta: no se le cambia el id.
            if (editingId === null) setNewQuestion(prev => ({ ...prev, id: id + 1 }));
            return id;
        },
        buildSlide: (id, title, url) => ({ ...createContentSlide(id, title, url), correctAnswer: null }),
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
    const handleShowPixabay = () => setShowPixabay(!showPixabay);

    // --- Validación Dinámica ---
    const isQuestionTextValid = newQuestion.text.trim().length > 0;

    const isAnswerSelected = newQuestion.correctAnswer !== null;
    const isFormValid = isQuestionTextValid && isAnswerSelected;

    const triggerValidation = () => {
        setShowErrors(true);
        setTimeout(() => setShowErrors(false), 3000);

        const reason = !isQuestionTextValid
            ? t("missingStatement")
            : t("markTrueOrFalse");
        notify.warning(tq("questionNotSaved"), reason);
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

    const handleMoveQuestion = (id: number, direction: -1 | 1) => {
        setLocalQuestions(prev => moveItem(prev, id, direction));
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
        setNewQuestion({ ...newQuestion, mediaType: type as MediaType, mediaUrl: url });
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
                    <EditorSidebar
                        title={tq("sidebarTitle")}
                        count={localQuestions.filter(q => !q.isSlide).length}
                        actions={
                            <EditorAddButton icon={<SiCanva />} onClick={slides.openNewSlide} title={tq("addSlideHint")}>
                                {tq("addSlide")}
                            </EditorAddButton>
                        }
                        footer={
                            <>
                                <EditorFooterButton variant="primary" onClick={editingId !== null ? handleUpdateQuestion : handleAddQuestion}>
                                    {editingId !== null ? tq("saveChanges") : t("addStatement")}
                                </EditorFooterButton>
                                {editingId !== null && (
                                    <EditorFooterButton variant="secondary" onClick={handleCancelEdit}>
                                        {tq("cancelEdit")}
                                    </EditorFooterButton>
                                )}
                            </>
                        }
                    >
                        <QuestionList
                            items={localQuestions.map(q => ({ ...q, tag: q.isSlide ? undefined : answerTag(q.correctAnswer, answerLabels) }))}
                            draft={editingId === null ? { ...newQuestion, text: newQuestion.text, tag: answerTag(newQuestion.correctAnswer, answerLabels) } : null}
                            selectedId={editingId}
                            onSelect={(q) => (q.isSlide ? slides.openEditSlide(q.id) : handleEditQuestion(q.id))}
                            onMove={handleMoveQuestion}
                            onDelete={handleDeleteQuestion}
                        />
                    </EditorSidebar>
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
                        borderRadius: 'var(--border-radius-2xl)',
                        boxShadow: 'var(--shadow-md)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Overlay semi-transparente para que la imagen no compita con la tarjeta */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(20, 10, 46, 0.42)",
                        zIndex: 1
                    }}></div>

                    <div className="col d-flex flex-column justify-content-center align-items-center position-relative" style={{ zIndex: 2, padding: '2rem' }}>
                        <div className={style2.container}>
                            <div className="d-flex flex-column align-items-center mb-4 position-relative w-100">
                                <h1 className={style2.acth1} style={{
                                    fontFamily: 'var(--font-family-primary)',
                                    fontSize: '2.5rem',
                                    fontWeight: 'var(--font-weight-bold)',
                                    textShadow: '0 1px 3px rgba(0,0,0,0.25)',
                                    color: '#ffffff',
                                    marginBottom: '0.5rem'
                                }}>{t("canvasTitle")}</h1>

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
                                                    {tq("savingDraft")}
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '2px' }}>
                                                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                                                    </svg>
                                                    {tq("draftSaved")}
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
                                            {t("missingStatement")}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        className={style2["question-input"]}
                                        placeholder={t("statementPlaceholder")}
                                        aria-label={t("statementLabel")}
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
                                    onPixabay={handleShowPixabay}
                                    onFreesound={handleShowFreesound}
                                />

                                <div className="d-flex justify-content-center gap-4 mt-4 w-100 flex-wrap" style={{ position: 'relative' }}>
                                    {showErrors && !isAnswerSelected && (
                                        <div style={{
                                            position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)',
                                            background: 'rgba(50, 50, 50, 0.95)', color: 'white', padding: '6px 12px',
                                            borderRadius: '6px', fontSize: '0.8rem', zIndex: 100, whiteSpace: 'nowrap',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                        }}>
                                            {t("markTrueOrFalse")}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        aria-pressed={newQuestion.correctAnswer === "true"}
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
                                            borderRadius: 'var(--border-radius-lg)',
                                            padding: '15px 40px',
                                            boxShadow: newQuestion.correctAnswer === "true"
                                                ? '0 6px 20px rgba(40, 167, 69, 0.4)'
                                                : '0 4px 10px rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'var(--font-family-primary)',
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
                                        {t("true")}
                                    </button>
                                    <button
                                        type="button"
                                        aria-pressed={newQuestion.correctAnswer === "false"}
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
                                            borderRadius: 'var(--border-radius-lg)',
                                            padding: '15px 40px',
                                            boxShadow: newQuestion.correctAnswer === "false"
                                                ? '0 6px 20px rgba(220, 53, 69, 0.4)'
                                                : '0 4px 10px rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'var(--font-family-primary)',
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
                                        {t("false")}
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
                                    {tq.rich("themeTip", { strong: (chunks) => <strong>{chunks}</strong> })}
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
                                    {t.rich("shortcut", { strong: (chunks) => <strong>{chunks}</strong>, kbd: (chunks) => <kbd>{chunks}</kbd> })}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <EditorGamificationColumn />

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
                <ModalMultimedia
                    show={showPixabay}
                    handleClose={handleShowPixabay}
                    origin="pixabay"
                    onSelectMedia={handleSelectMediaNewQuestion}
                />
                <CanvaEmbedModal key={slides.modalKey} {...slides.modalProps} />
            </div>
        </>
    );
}
