// path: src/app/create/trueorfalse/page.tsx

"use client"

import { useState } from 'react';
import { TitleActivity, ModalMultimedia, ThemeButton, ThemeContainer, LoadMultimediaFile }
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
                        {questionText}
                        <button className='btn btn-primary btn-sm'>
                            Nueva
                        </button>
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
                            <h1 className={style2.acth1}>Verdadero o Falso</h1>

                            {/* <!-- Tarjeta de Pregunta --> */}
                            <div className={style2.card}>
                                {/* <!-- Campo de Pregunta --> */}
                                <input type="text" className={style2['question-input']}
                                    placeholder="Escribe tu pregunta" 
                                    onChange={handleInputQuestion}/>

                                <LoadMultimediaFile
                                    type={mediaType}
                                    url={mediUrl}
                                    onRemove={handleRemoveMedia}
                                    onUpload={handleSelectFile}
                                    onUnsplash={handleShowUnsplash}
                                    onYoutube={handleShowYoutube}
                                    onFreesound={handleShowFreesound}
                                    styleComponent={"trueorfalse"}
                                />

                                {/*<!-- Input oculto para subir archivos -->*/}
                                <input type="file" id="file-input"
                                    accept="image/*,video/*,audio/*" hidden />

                                {/*<!-- Botones de respuesta Verdadero o Falso -->*/}
                                <div className={style2['answer-options']}>
                                    <button 
                                    className={`${style2['answer-btn']} ${style2['btn-verdadero']} ${selectedAnswer === 'true' ? style2.selected : ''}`}
                                    onClick={() => handleAnswerSelection("true")}
                                    >🔷
                                        Verdadero</button>
                                    <button 
                                    className={`${style2['answer-btn']} ${style2['btn-falso']} ${selectedAnswer === 'false' ? style2.selected : ''}`}
                                    onClick={() => handleAnswerSelection("false")}
                                    >⚠️ Falso</button>
                                </div>
                            </div>

                            {/* <!-- Template para elementos multimedia con botón de eliminar --> */}
                            { mediUrl && (
                                <template id="media-item-template">
                                <div className={style2['media-item']}>
                                    <button className={style2['remove-media-btn']}
                                    >×</button>
                                    <div className={style2['media-content']}></div>
                                </div>
                            </template>
                            ) }
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