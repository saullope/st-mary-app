// path: src/app/create/ludimemory/page.tsx
"use client"

import { useState } from 'react';
import { TitleActivity, LoadImagesComponent, Imagepreview, ModalMultimedia, ThemeButton, ThemeContainer }
    from "@/components/editor";
import Image from 'next/image';
import styles from '@/styles/pages/editor.module.css';
import uploadImageStyle from '@/styles/pages/true-or-false.module.css';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from "../../../components/LanguageSelector";
import { BsGlobe } from 'react-icons/bs';
import { TbArrowsMinimize } from "react-icons/tb";
import { FaExpand } from "react-icons/fa6";
import GamificationPanel from "@/features/gamification/components/GamificationPanel/GamificationPanel";

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

    const handleSelectImageUnsplash = (type: string, url: string) => {
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
            <div className="row" style={{ height: "100vh" }}>
                <div className={`col card shadow-sm rounded p-3 h-100 me-3 d-flex justify-content-center align-items-center ${isFullWidth ? "col-12" : "col"}`}
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundAttachment: "fixed",
                        width: "100%",
                        height: "100vh",
                        transition: "background 0.3s ease-in-out",
                        position: "relative"
                    }}>
                    
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
                    
                    {/* Panel único integrado */}
                    <div className="card shadow-lg border-0 position-relative" style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '25px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        width: '90%',
                        maxWidth: '900px',
                        minHeight: '650px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        {/* Header del panel */}
                        <div className="card-header border-0 text-center py-3" style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                            borderRadius: '25px 25px 0 0',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <div className="d-flex align-items-center justify-content-center mb-2">
                                <div className="me-3" style={{ fontSize: '2.5rem' }}>🧠</div>
                                <div>
                                    <h1 className="text-white fw-bold mb-1" style={{ 
                                        fontSize: '2rem',
                                        fontFamily: 'Comic Sans MS, cursive',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                    }}>
                                        LudiMemory
                                    </h1>
                                </div>
                            </div>
                            
                            {/* Indicadores de progreso */}
                            
                        </div>

                        {/* Contenido principal del panel */}
                        <div className="card-body p-5">
                            <div className="row g-4">
                                {/* Sección izquierda - Carga de imágenes */}
                                <div className="col-md-5">
                                    <div className="h-100 d-flex flex-column">
                                        <div className="text-center mb-4">
                                            <div className="display-4 mb-3">📸</div>
                                            <h4 className="text-dark fw-bold mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                                                Agregar Imágenes
                                            </h4>
                                            <p className="text-muted small">
                                                Sube tus propias imágenes o busca en Unsplash
                                            </p>
                                        </div>
                                        
                                        <div className="d-grid gap-3 flex-grow-1">
                                            <button 
                                                className="btn btn-light btn-lg fw-bold shadow-sm"
                                                onClick={handleSelectImage}
                                                style={{ 
                                                    borderRadius: '15px',
                                                    fontFamily: 'Comic Sans MS, cursive',
                                                    transition: 'all 0.3s ease',
                                                    border: '2px solid rgba(0,0,0,0.1)'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.02)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                                }}
                                            >
                                                📁 Subir desde mi dispositivo
                                            </button>
                                            
                                            <button 
                                                className="btn btn-warning btn-lg fw-bold shadow-sm"
                                                onClick={handleShow}
                                                style={{ 
                                                    borderRadius: '15px',
                                                    fontFamily: 'Comic Sans MS, cursive',
                                                    transition: 'all 0.3s ease',
                                                    border: '2px solid rgba(0,0,0,0.1)'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.02)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                                }}
                                            >
                                                🌟 Buscar en Unsplash
                                            </button>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <div className="alert alert-info border-0" style={{ 
                                                borderRadius: '15px',
                                                background: 'rgba(13, 202, 240, 0.1)',
                                                border: '1px solid rgba(13, 202, 240, 0.3)',
                                                color: '#0dcaf0',
                                                fontSize: '0.9rem'
                                            }}>
                                                <small>
                                                    💡 <strong>Tip:</strong> Necesitas al menos 2 imágenes para crear el juego
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección derecha - Vista previa de imágenes */}
                                <div className="col-md-7">
                                    <div className="h-100">
                                        <div className="text-center mb-4">
                                            <div className="display-4 mb-3">🎯</div>
                                            <h4 className="text-dark fw-bold mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                                                Tus Imágenes
                                            </h4>
                                            <p className="text-muted">
                                                {selectedImages.length} imagen{selectedImages.length !== 1 ? 'es' : ''} seleccionada{selectedImages.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        
                                        {selectedImages.length === 0 ? (
                                            <div className="text-center text-muted py-4">
                                                <div className="display-1 mb-3">😴</div>
                                                <p className="mb-2">¡Aún no hay imágenes!</p>
                                                <p className="small">Agrega algunas desde el panel izquierdo</p>
                                            </div>
                                        ) : (
                                            <div className="row g-2">
                                                {selectedImages.map((image, index) => (
                                                    <div key={index} className="col-6 col-lg-4">
                                                        <div className="position-relative">
                                                            <img 
                                                                src={image} 
                                                                alt={`Imagen ${index + 1}`}
                                                                className="img-fluid rounded shadow-sm"
                                                                style={{ 
                                                                    width: '100%', 
                                                                    height: '100px', 
                                                                    objectFit: 'cover',
                                                                    border: '2px solid white',
                                                                    borderRadius: '12px'
                                                                }}
                                                            />
                                                            <button
                                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle"
                                                                style={{ width: '25px', height: '25px', padding: '0', fontSize: '12px' }}
                                                                onClick={() => handleDeleteImage(index)}
                                                            >
                                                                ×
                                                            </button>
                                                            <div className="position-absolute bottom-0 start-0 m-1">
                                                                <span className="badge bg-primary rounded-pill" style={{ fontSize: '10px' }}>
                                                                    {index + 1}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {selectedImages.length >= 2 && (
                                            <div className="text-center mt-4">
                                                <div className="alert alert-success border-0 shadow-sm" style={{ 
                                                    borderRadius: '15px',
                                                    background: 'rgba(40, 167, 69, 0.1)',
                                                    border: '1px solid rgba(40, 167, 69, 0.3)',
                                                    color: '#28a745'
                                                }}>
                                                    <div className="display-6 mb-2">🎉</div>
                                                    <strong>¡Perfecto!</strong> Ya tienes suficientes imágenes para crear el juego de memoria.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer del panel */}
                        <div className="card-footer border-0 text-center py-3" style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
                            borderRadius: '0 0 25px 25px',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <small className="text-white-75">
                                💡 Tip: El tema de fondo se aplicará automáticamente al juego de memoria
                            </small>
                        </div>
                    </div>

                        <ModalMultimedia
                            show={show}
                            handleClose={handleClose}
                            origin="unsplash"
                            onSelectMedia={handleSelectImageUnsplash}
                        />
                    <ThemeContainer
                        show={showTheme}
                        onClose={() => setShowTheme(false)}
                        onThemeChange={handleThemeChange}
                    />
                </div>
            </div>
            <GamificationPanel />
        </>
    );
}
