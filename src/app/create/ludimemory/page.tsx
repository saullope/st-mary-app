// path: src/app/create/ludimemory/page.tsx
"use client"

import { useState } from 'react';
import { TitleActivity, LoadImagesComponent, Imagepreview, ModalMultimedia, ThemeButton, ThemeContainer }
    from "@/editor-components";
import Image from 'next/image';
import styles from '../../../../public/css/editor.module.css';
import uploadImageStyle from '../../../../public/css/true-or-false.module.css';
import partialLogo from '../../../../public/images/PartialLogo.png';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from "../../../components/LanguageSelector";
import { BsGlobe } from 'react-icons/bs';
import { TbArrowsMinimize } from "react-icons/tb";
import { FaExpand } from "react-icons/fa6";

export default function LudiMemory() {

    /** Traducciones */
    const t = useTranslations("createActivityDashboard");
    const t2 = useTranslations("ludiMemoryComponent");
    const t3 = useTranslations("configurations");

    const [title, setTitle] = useState(t3("titleActivity"));
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [show, setShow] = useState(false);
    const [showTheme, setShowTheme] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState<string>("/images/theme/tema4.jpg");
    const [isFullWidth, setIsFullWidth] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleShowTheme = () => setShowTheme(!showTheme);

    const handleThemeChange = (imagePath: string) => {
        setBackgroundImage(imagePath);
        setShowTheme(false);
    };

    const toggleFullWidth = () => setIsFullWidth(!isFullWidth);

    const handleSelectImageUnsplash = (url: string) => {
        setSelectedImages((prevImages) => [...prevImages, url]); // Agrega la URL de la imagen al estado
    };

    const handleSelectImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'; // Acepta solo imágenes
        input.multiple = true; // Permite seleccionar múltiples imágenes
        input.onchange = (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files) {
                const fileURLs = Array.from(files).map((file) => URL.createObjectURL(file)); // Genera URLs temporales
                setSelectedImages((prevImages) => [...prevImages, ...fileURLs]); // Agrega las nuevas imágenes al estado
            }
        };
        input.click(); // Simula un clic para abrir el explorador de archivos
    };

    const handleDeleteImage = (index: number) => {
        setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
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
                <div className={`col card shadow-sm rounded p-3 h-100 me-3 d-flex ${isFullWidth ? "col-12" : "col"}`}
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundAttachment: "fixed",
                        width: "100%",
                        height: "100vh",
                        transition: "background 0.3s ease-in-out",
                    }}> {/* Clase d-flex para alinear horizontalmente */}
                    <div className='col'>
                        {/** 
                        <h5 className="card-title">LudiMemory</h5>
                        <p className="card-text">{t("ludimemorySubTitle")}</p>
                        */}
                        <br /><br />
                        {/** INICIO AREA DE CARGA DE IMAGEN */}
                        <div className={`${uploadImageStyle['card-inv']}`} data-index="0">
                            <LoadImagesComponent
                                space="memory"
                                handleOpenModal={handleShow}
                                handleSelectImage={handleSelectImage}
                                addFileTraslation={t2("uploadSpace")}
                                searchUnsplashTraslation={t2("searchUnsplash")}
                                searchYoutubeTraslation={t2("searchYoutube")}
                                uploadFileTranslation={t2("uploadFile")}
                            />
                            {/** INICIO AREA DE MOSTRAR IMAGENES SELECCIONADAS*/}
                            <div className={uploadImageStyle['media-selector-img-prev']}>
                                <h6>{t2("imageArea")}</h6>
                                <Imagepreview
                                    selectedImages={selectedImages}
                                    onDeleteImage={handleDeleteImage}
                                />
                            </div>
                            {/** FIN AREA DE MOSTRAR IMAGENES SELECCIONADAS*/}
                        </div>
                        <ModalMultimedia
                            show={show}
                            handleClose={handleClose}
                            origin="unsplash"
                            onSelectMedia={handleSelectImageUnsplash}
                        />
                        {/** FIN AREA DE CARGA DE IMAGEN */}
                    </div>
                    <ThemeContainer
                        show={showTheme}
                        onThemeChange={handleThemeChange}
                    />
                </div>
                {
                    !isFullWidth && (
                        <div className="col-3 card shadow-sm rounded p-3 h-100"> {/* Columna 2 ocupa un cuarto del tamaño total */}
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