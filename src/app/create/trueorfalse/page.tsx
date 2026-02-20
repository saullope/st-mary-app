// path: src/app/create/trueorfalse/page.tsx

"use client"

import { useState } from 'react';
import { TitleActivity, ModalMultimedia, ThemeButton, ThemeContainer, LoadMultimediaFile, QuestionListItem }
    from "@/components/editor";
import Image from 'next/image';
import styles from '@/styles/pages/editor.module.css';
import style2 from '@/styles/pages/editor-activity.module.css';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from "../../../components/LanguageSelector";
import { BsGlobe } from 'react-icons/bs';
import { TbArrowsMinimize } from "react-icons/tb";
import { FaExpand } from "react-icons/fa6";
import { TrueOrFalseQuestion } from '@/lib/types/';
import GamificationPanel from "@/features/gamification/components/GamificationPanel/GamificationPanel";

export default function TrueOrFalse() {
    /** Traducciones */
    const t = useTranslations("createActivityDashboard");
    const t2 = useTranslations("ludiMemoryComponent");
    const t3 = useTranslations("configurations");

    const [title, setTitle] = useState(t3("titleActivity"));
    const [showYoutube, setShowYoutube] = useState(false);
    const [showUnsplash, setShowUnsplash] = useState(false);
    const [showFreesound, setShowFreesound] = useState(false);
    const [showTheme, setShowTheme] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState<string>("/images/theme/tema4.jpg");
    const [isFullWidth, setIsFullWidth] = useState(false);
    const [mediaType, setMediaType] = useState<"image" | "youtube" | "audio" | "video" | null>(null);
    const [mediUrl, setMediaUrl] = useState<string | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<"true" | "false" | null>(null);
    const [questionText, setQuestionText] = useState("");

    const [questions, setQuestions] = useState<TrueOrFalseQuestion[]>([]);
    const [questionId, setQuestionId] = useState(1);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [newQuestion, setNewQuestion] = useState<TrueOrFalseQuestion>({
        id: questionId,
        text: "",
        correctAnswer: null,
        mediaType: null,
        mediaUrl: null,
    });

    const handleAnswerSelection = (answer: "true" | "false") => {
        setSelectedAnswer(answer);
    };

    const handleInputQuestion = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionText(event.target.value);
    };

    const handleShowTheme = () => setShowTheme(!showTheme);
    const handleShowUnsplash = () => setShowUnsplash(!showUnsplash);
    const handleShowYoutube = () => setShowYoutube(!showYoutube);
    const handleShowFreesound = () => setShowFreesound(!showFreesound);

    const handleThemeChange = (imagePath: string) => {
        setBackgroundImage(imagePath);
        setShowTheme(false);
    };

    const handleRemoveMedia = () => {
        setMediaType(null);
        setMediaUrl(null);
    }

    const toggleFullWidth = () => setIsFullWidth(!isFullWidth);

    const handleSelectMedia = (type: string, url: string) => {
        setMediaType(type as "image" | "youtube" | "audio" | "video");
        setMediaUrl(url);
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

    const handleInputNewQuestion = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewQuestion({ ...newQuestion, text: event.target.value });
    };

    const handleAnswerSelectionNewQuestion = (answer: "true" | "false") => {
        setNewQuestion({ ...newQuestion, correctAnswer: answer });
    };

    const handleSelectMediaNewQuestion = (type: string, url: string) => {
        setNewQuestion({ ...newQuestion, mediaType: type as "image" | "youtube" | "audio" | "video", mediaUrl: url });
    };

    const handleAddQuestion = () => {
        if (!newQuestion.text.trim() || newQuestion.correctAnswer === null) {
            alert("Por favor completa la pregunta y selecciona una respuesta.");
            return;
        }

        if (editingId !== null) {
            setQuestions(prev =>
                prev.map(q =>
                    q.id === editingId
                        ? { ...q, ...newQuestion }
                        : q
                )
            );
            setEditingId(null);
        } else {
            setQuestions([...questions, { ...newQuestion, id: questionId }]);
            setQuestionId(prev => prev + 1);
        }

        setNewQuestion({
            id: questionId + 1,
            text: "",
            correctAnswer: null,
            mediaType: null,
            mediaUrl: null,
        });
    };

    const handleEditQuestion = (id: number) => {
        const q = questions.find(q => q.id === id);
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

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
                <div className="container-fluid d-flex align-items-center">
                    <div className={styles.logo}>
                        <Image
                            src="/images/PartialLogo.png"
                            width={45}
                            height={45}
                            alt="logo"
                        />
                    </div>
                    <div className="ms-5" style={{ width: '400px', maxWidth: '100%' }}>
                        <TitleActivity title={title} setTitle={setTitle} />
                    </div>
                    <div className="d-flex gap-2 ms-auto">
                        <div className="d-grid gap-2 d-md-flex justify-content-center justify-content-md-end align-items-center">
                            <BsGlobe />
                            <LanguageSelector />
                        </div>
                        <ThemeButton onClick={handleShowTheme} />
                        <button 
                            className="btn" 
                            onClick={toggleFullWidth}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                color: 'white',
                                fontWeight: 'bold',
                                borderRadius: '15px',
                                padding: '10px 20px',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                            }}
                        >
                            {isFullWidth ? <TbArrowsMinimize /> : <FaExpand />}
                        </button>
                    </div>
                </div>
            </nav>
            <div className="row" style={{ height: "100vh" }}>
                {!isFullWidth && (
                    <div className="col-2 card shadow-sm rounded p-3 me-3">
                        <ul className="mt-3 p-0">
                            {questions.map((q) => (
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
                                    text={newQuestion.text}
                                    mediaType={newQuestion.mediaType}
                                    mediaUrl={newQuestion.mediaUrl}
                                    correctAnswer={newQuestion.correctAnswer ?? "false"}
                                    isSelected={true}
                                    onClick={() => {}}
                                />
                            )}
                        </ul>

                        <div className="d-flex flex-column gap-2">
                            <button
                                className="btn btn-sm w-100"
                                onClick={handleAddQuestion}
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
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                                }}
                            >
                                {editingId !== null ? "💾 Guardar" : "➕ Agregar"}
                            </button>
                            {editingId && (
                                <button
                                    className="btn btn-sm w-100"
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
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
                                    }}
                                >
                                    ❌ Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                )}
                <div
                    className={`col card shadow-sm rounded p-3 me-3 d-flex ${isFullWidth ? "col-12" : "col"}`}
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundAttachment: "fixed",
                        width: "100%",
                        minHeight: "100vh",
                        transition: "background 0.3s ease-in-out",
                        position: "relative"
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
                        borderRadius: "10px"
                    }}></div>
                    
                    <div className="col d-flex justify-content-center align-items-center position-relative">
                        <div className={style2.container}>
                            <h1 className={style2.acth1} style={{ 
                                fontFamily: 'Comic Sans MS, cursive',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                color: '#2c3e50'
                            }}>Verdadero o Falso</h1>
                            <div className={style2.card}>
                                <input
                                    type="text"
                                    className={style2["question-input"]}
                                    placeholder="Escribe tu pregunta"
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
                                    styleComponent={"trueorfalse"}
                                />

                                <input
                                    type="file"
                                    id="file-input"
                                    accept="image/*,video/*,audio/*"
                                    hidden
                                />

                                <div className={style2["answer-options"]}>
                                    <button
                                        className={`${style2["answer-btn"]} ${style2["btn-verdadero"]} ${
                                            newQuestion.correctAnswer === "true" ? style2.selected : ""
                                        }`}
                                        onClick={() =>
                                            setNewQuestion({ ...newQuestion, correctAnswer: "true" })
                                        }
                                        style={{
                                            background: newQuestion.correctAnswer === "true" 
                                                ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                                : 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            borderRadius: '20px',
                                            padding: '15px 25px',
                                            boxShadow: newQuestion.correctAnswer === "true" 
                                                ? '0 6px 20px rgba(40, 167, 69, 0.4)'
                                                : '0 4px 15px rgba(23, 162, 184, 0.3)',
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'Comic Sans MS, cursive',
                                            fontSize: '1.1rem',
                                            transform: newQuestion.correctAnswer === "true" ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                        onMouseOver={(e) => {
                                            if (newQuestion.correctAnswer !== "true") {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(23, 162, 184, 0.4)';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (newQuestion.correctAnswer !== "true") {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(23, 162, 184, 0.3)';
                                            }
                                        }}
                                    >
                                        🔷 Verdadero
                                    </button>
                                    <button
                                        className={`${style2["answer-btn"]} ${style2["btn-falso"]} ${
                                            newQuestion.correctAnswer === "false" ? style2.selected : ""
                                        }`}
                                        onClick={() =>
                                            setNewQuestion({ ...newQuestion, correctAnswer: "false" })
                                        }
                                        style={{
                                            background: newQuestion.correctAnswer === "false" 
                                                ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                                                : 'linear-gradient(135deg, #fd7e14 0%, #e55a00 100%)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            borderRadius: '20px',
                                            padding: '15px 25px',
                                            boxShadow: newQuestion.correctAnswer === "false" 
                                                ? '0 6px 20px rgba(220, 53, 69, 0.4)'
                                                : '0 4px 15px rgba(253, 126, 20, 0.3)',
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'Comic Sans MS, cursive',
                                            fontSize: '1.1rem',
                                            transform: newQuestion.correctAnswer === "false" ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                        onMouseOver={(e) => {
                                            if (newQuestion.correctAnswer !== "false") {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(253, 126, 20, 0.4)';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (newQuestion.correctAnswer !== "false") {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(253, 126, 20, 0.3)';
                                            }
                                        }}
                                    >
                                        ⚠️ Falso
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tip del tema */}
                    <div className="text-center mt-4">
                        <div className="alert alert-info border-0 shadow-sm" style={{ 
                            borderRadius: '15px',
                            background: 'rgba(13, 202, 240, 0.1)',
                            border: '1px solid rgba(13, 202, 240, 0.3)',
                            color: '#0dcaf0',
                            fontSize: '0.9rem'
                        }}>
                            <small>
                                💡 <strong>Tip:</strong> El tema de fondo se aplicará automáticamente a la actividad
                            </small>
                        </div>
                    </div>
                    
                    <ThemeContainer
                        show={showTheme}
                        onClose={() => setShowTheme(false)}
                        onThemeChange={handleThemeChange}
                    />
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
                
                <GamificationPanel />
            </div>
        </>
    );
}
