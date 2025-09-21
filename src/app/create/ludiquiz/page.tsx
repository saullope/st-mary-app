// path: src/app/create/ludiquiz/page.tsx

"use client"

import { useState } from 'react';
import { TitleActivity, ModalMultimedia, ThemeButton, ThemeContainer, LoadMultimediaFile, AnswerContainer, QuestionListItem }
    from "@/editor-components";
import Image from 'next/image';
import styles from '../../../../public/css/editor.module.css';
import style2 from '../../../../public/css/ludiquiz.module.css';
import partialLogo from '../../../../public/images/PartialLogo.png';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from "../../../components/LanguageSelector";
import { BsGlobe } from 'react-icons/bs';
import { TbArrowsMinimize } from "react-icons/tb";
import { FaExpand } from "react-icons/fa6";
import { LudiQuizQuestion, LudiQuizAnswer } from '@/lib/types/';

interface Answer {
    id: number;
    text: string;
    isCorrect: boolean;
}

export default function LudiQuiz() {
    /** Traducciones */
    const t = useTranslations("createActivityDashboard");
    const t2 = useTranslations("ludiMemoryComponent");
    const t3 = useTranslations("configurations");

    const [title, setTitle] = useState(t3("titleActivity"));
    const [selectMedia, setSelectMedia] = useState("");
    const [showYoutube, setShowYoutube] = useState(false);
    const [showUnsplash, setShowUnsplash] = useState(false);
    const [showFreesound, setShowFreesound] = useState(false);
    const [showTheme, setShowTheme] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState<string>("/images/theme/tema4.jpg");
    const [isFullWidth, setIsFullWidth] = useState(false);
    const [mediaType, setMediaType] = useState<"image" | "youtube" | "audio" | "video" | null>(null);
    const [mediUrl, setMediaUrl] = useState<string | null>(null);

    const [answer, setAnswer] = useState<Answer[]>([
        { id: 0, text: '', isCorrect: false },
        { id: 1, text: '', isCorrect: false },
    ]);

    // Estado para múltiples preguntas
    const [questions, setQuestions] = useState<LudiQuizQuestion[]>([]);
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

    const addAnswer = () => {
        setAnswer((prev) => [
            ...prev,
            { id: prev.length, text: '', isCorrect: false },
        ]);
    }

    const updateAnswerText = (id: number, text: string) => {
        setAnswer((prev) =>
            prev.map((answer) => (answer.id === id ? { ...answer, text } : answer))
        )
    }

    const toggleCorrectAnswer = (id: number) => {
        setAnswer((prev) =>
            prev.map((answer) =>
                answer.id === id
                    ? { ...answer, isCorrect: !answer.isCorrect }
                    : { ...answer, isCorrect: false })
        )
    }

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
        input.accept = 'image/*,video/*,audio/*'; // Acepta imágenes, videos y audios
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
                    const fileURL = URL.createObjectURL(file); // Genera una URL temporal
                    handleSelectMediaNewQuestion(fileType, fileURL); // Establece el tipo y la URL en el estado
                }
            }
        };
        input.click(); // Simula un clic para abrir el explorador de archivos
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

        setQuestions(prev => [...prev, questionToAdd]);
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
        const question = questions.find(q => q.id === id);
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

        setQuestions(prev => prev.map(q => 
            q.id === editingId 
                ? { ...newQuestion, text: questionText }
                : q
        ));
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

    const handleDeleteQuestion = (id: number) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
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
                        <ThemeButton
                            onClick={handleShowTheme}
                        />
                        <button
                            className="btn" // Botón para alternar
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
            <div className="row" style={{ height: "100vh" }}> {/* Hace que las columnas ocupen toda la altura de la pantalla */}
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
                                    correctAnswer={q.answers.find(a => a.isCorrect) ? "true" : "false"}
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
                                    correctAnswer={newQuestion.answers.find(a => a.isCorrect) ? "true" : "false"}
                                    isSelected={true}
                                    onClick={() => {}}
                                />
                            )}
                        </ul>

                        <div className="d-flex flex-column gap-2">
                            <button
                                className="btn btn-sm w-100"
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
                <div className={`col card shadow-sm rounded p-3 me-3 d-flex ${isFullWidth ? "col-12" : "col"}`}
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
                    }}> {/* Clase d-flex para alinear horizontalmente */}
                    
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
                    
                    <div className='col d-flex justify-content-center align-items-center position-relative'>
                        {/** INICIO CONTENIDO DEL EDITOR */}
                        <div className={style2.container}>
                            <h1 className={style2.acth1} style={{ 
                                fontFamily: 'Comic Sans MS, cursive',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                color: '#2c3e50'
                            }}>LudiQuiz</h1>

                            {/* <!-- Tarjeta de Pregunta --> */}
                            <div className={style2.card}>
                                {/* <!-- Campo de Pregunta --> */}
                                <input 
                                    type="text" 
                                    className={style2['question-input']}
                                    placeholder="Escribe tu pregunta" 
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
                                    />
                                </div>

                            </div>
                        </div>
                        {/** FIN CONTENIDO DEL EDITOR */}
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
                        onThemeChange={handleThemeChange}
                    />
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
                {/** Area de modal */}
               
            </div>
        </>
    );

}