// path: src/app/create/ludiquiz/page.tsx

"use client"

import { useState } from 'react';
import { TitleActivity, ModalMultimedia, ThemeButton, ThemeContainer, LoadMultimediaFile, AnswerContainer }
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
                    handleSelectMedia(fileType, fileURL); // Establece el tipo y la URL en el estado
                }
            }
        };
        input.click(); // Simula un clic para abrir el explorador de archivos
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
                            className="btn btn-primary" // Botón para alternar
                            onClick={toggleFullWidth}
                        >
                            {isFullWidth ? <TbArrowsMinimize /> : <FaExpand />}
                        </button>
                    </div>
                </div>
            </nav>
            <div className="row" style={{ height: "100vh" }}> {/* Hace que las columnas ocupen toda la altura de la pantalla */}
                {!isFullWidth && (
                    <div className='col-1 card shadow-sm rounded p-3 me-3'>
                        <p className="card-text placeholder-glow">
                            <span className="placeholder col-7"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-6"></span>
                            <span className="placeholder col-8"></span>
                        </p>
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
                    }}> {/* Clase d-flex para alinear horizontalmente */}
                    <div className='col d-flex justify-content-center align-items-center'>
                        {/** INICIO CONTENIDO DEL EDITOR */}
                        <div className={style2.container}>
                            <h1 className={style2.acth1}>LudiQuiz</h1>

                            {/* <!-- Tarjeta de Pregunta --> */}
                            <div className={style2.card}>
                                {/* <!-- Campo de Pregunta --> */}
                                <input type="text" className={style2['question-input']}
                                    placeholder="Escribe tu pregunta" aria-label="Pregunta" />

                                <LoadMultimediaFile
                                    type={mediaType}
                                    url={mediUrl}
                                    onRemove={handleRemoveMedia}
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
                                        answers={answer}
                                        onAddAnswer={addAnswer}
                                        onUpdateAnswerText={updateAnswerText}
                                        onToggleCorrectAnswer={toggleCorrectAnswer}
                                    />
                                </div>

                            </div>

                            {/* <!-- Template para elementos multimedia con botón de eliminar --> */}
                            {mediUrl && (
                                <template>
                                    <div className={style2['media-item']}>
                                        <button className={style2['remove-media-btn']}
                                        >×</button>
                                        <div className={style2['media-content']}></div>
                                    </div>
                                </template>
                            )}
                        </div>
                        {/** FIN CONTENIDO DEL EDITOR */}
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
                    onSelectMedia={handleSelectMedia}
                />
                <ModalMultimedia
                    show={showYoutube}
                    handleClose={handleShowYoutube}
                    origin="youtube"
                    onSelectMedia={handleSelectMedia}
                />
                <ModalMultimedia
                    show={showFreesound}
                    handleClose={handleShowFreesound}
                    origin="freesound"
                    onSelectMedia={handleSelectMedia}
                />
                {/** Area de modal */}
                {
                    !isFullWidth && (
                        <div className="col-3 card shadow-sm rounded p-3"> {/* Columna 2 ocupa un cuarto del tamaño total */}
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
                    )
                }
            </div>
        </>
    );

}