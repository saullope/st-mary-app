// path: src/app/create/trueorfalse/page.tsx

"use client"

import { useState } from 'react';
import { TitleActivity, ModalMultimedia, ThemeButton, ThemeContainer, LoadMultimediaFile, QuestionListItem }
    from "@/editor-components";
import Image from 'next/image';
import styles from '../../../../public/css/editor.module.css';
import style2 from '../../../../public/css/editor-activity.module.css';
import partialLogo from '../../../../public/images/PartialLogo.png';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from "../../../components/LanguageSelector";
import { BsGlobe } from 'react-icons/bs';
import { TbArrowsMinimize } from "react-icons/tb";
import { FaExpand } from "react-icons/fa6";
import { TrueOrFalseQuestion } from '@/lib/types/';

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
                    handleSelectMedia(fileType, fileURL);
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

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
                <div className="container-fluid d-flex align-items-center">
                    <div className={styles.logo}>
                        <Image
                            src={partialLogo}
                            width={45}
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
                        <button className="btn btn-primary" onClick={toggleFullWidth}>
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

                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleAddQuestion}
                        >
                            {editingId !== null ? "Guardar" : "Agregar"}
                        </button>
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
                    }}
                >
                    <div className="col d-flex justify-content-center align-items-center">
                        <div className={style2.container}>
                            <h1 className={style2.acth1}>Verdadero o Falso</h1>
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
                                    >
                                        ⚠️ Falso
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ThemeContainer
                        show={showTheme}
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
                {!isFullWidth && (
                    <div className="col-2 card shadow-sm rounded p-3">
                        <h5 className="card-title placeholder-glow">
                            <span className="placeholder col-6"></span>
                        </h5>
                        <p className="card-text placeholder-glow">
                            <span className="placeholder col-7"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-6"></span>
                            <span className="placeholder col-8"></span>
                        </p>
                        <p className="card-text placeholder-glow">
                            <span className="placeholder col-7"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-6"></span>
                            <span className="placeholder col-8"></span>
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
