"use client"

import { useState, useEffect } from 'react';
import { ModalMultimedia } from "@/components/editor";
import { useTranslations } from 'next-intl';
import { useActivityEditor } from "@/context/ActivityEditorContext";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage";
import { FaTrash } from 'react-icons/fa6';

export default function LudiMemory() {

    /** Traducciones */
    const t = useTranslations("createActivityDashboard");

    // Contexto Global
    const { state, setActivityType, setMemoryImages } = useActivityEditor();
    const { backgroundImage, fullScreen } = state;
    const { uploadFiles, uploading } = useFirebaseStorage();

    useEffect(() => {
        setActivityType("ludimemory");
    }, [setActivityType]);

    // Estados locales
    const [showUnsplash, setShowUnsplash] = useState(false);

    const handleSelectImageUnsplash = (type: string, url: string) => {
        setMemoryImages([...state.memoryImages, url]); 
        setShowUnsplash(false);
    };

    const handleSelectImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'; 
        input.multiple = true; 
        input.onchange = async (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                // Preparar archivos para subida
                const filesToUpload = Array.from(files).map(file => ({
                    file,
                    path: `uploads/${Date.now()}_${file.name}`
                }));

                // Subir a Firebase
                const urls = await uploadFiles(filesToUpload);
                
                // Filtrar nulos y actualizar estado global
                const validUrls = urls.filter((url): url is string => url !== null);
                if (validUrls.length > 0) {
                    setMemoryImages([...state.memoryImages, ...validUrls]);
                }
            }
        };
        input.click(); 
    };

    const handleDeleteImage = (index: number) => {
        const newImages = state.memoryImages.filter((_, i) => i !== index);
        setMemoryImages(newImages);
    };

    return (
        <>
             <div className="row" style={{ minHeight: "calc(100vh - 80px)" }}>
                <div className={`col card shadow-sm rounded p-3 h-100 me-3 d-flex justify-content-center align-items-center ${fullScreen ? "col-12" : "col"}`}
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundAttachment: "fixed",
                        width: "100%",
                        minHeight: "calc(100vh - 80px)",
                        transition: "background 0.3s ease-in-out",
                        position: "relative",
                        border: 'none'
                    }}>
                    
                    {/* Overlay semi-transparente */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.3)",
                        zIndex: 1
                    }}></div>
                    
                    {/* Panel único integrado */}
                    <div className="card shadow-lg border-0 position-relative" style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '25px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        width: '90%',
                        maxWidth: '1000px',
                        zIndex: 2,
                        marginTop: '20px',
                        marginBottom: '20px'
                    }}>
                        {/* Header del panel */}
                        <div className="card-header border-0 text-center py-4" style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                            borderRadius: '25px 25px 0 0',
                            backdropFilter: 'blur(5px)',
                            color: 'white'
                        }}>
                            <div className="d-flex align-items-center justify-content-center">
                                <span style={{ fontSize: '2.5rem', marginRight: '15px' }}>🧠</span>
                                <h1 className="fw-bold mb-0" style={{ 
                                    fontSize: '2.2rem',
                                    fontFamily: 'Comic Sans MS, cursive',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    LudiMemory
                                </h1>
                            </div>
                        </div>

                        {/* Contenido principal del panel */}
                        <div className="card-body p-5">
                            <div className="row g-5">
                                {/* Sección izquierda - Carga de imágenes */}
                                <div className="col-md-5 d-flex flex-column">
                                    <div className="text-center mb-4">
                                        <div className="display-4 mb-3">📸</div>
                                        <h4 className="fw-bold mb-2" style={{ fontFamily: 'Comic Sans MS, cursive', color: '#2c3e50' }}>
                                            Agregar Imágenes
                                        </h4>
                                        <p className="text-muted small">
                                            Sube tus propias imágenes o busca en Unsplash para crear las parejas.
                                        </p>
                                    </div>
                                    
                                    <div className="d-grid gap-3 mb-4">
                                        <button 
                                            className="btn btn-light btn-lg fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                            onClick={handleSelectImage}
                                            disabled={uploading}
                                            style={{ 
                                                borderRadius: '15px',
                                                fontFamily: 'Comic Sans MS, cursive',
                                                transition: 'all 0.3s ease',
                                                border: '2px solid #e9ecef',
                                                padding: '15px'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {uploading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Subiendo...
                                                </>
                                            ) : (
                                                <>📁 Subir desde PC</>
                                            )}
                                        </button>
                                        
                                        <button 
                                            className="btn btn-warning btn-lg fw-bold shadow-sm text-white"
                                            onClick={() => setShowUnsplash(true)}
                                            style={{ 
                                                borderRadius: '15px',
                                                fontFamily: 'Comic Sans MS, cursive',
                                                transition: 'all 0.3s ease',
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                                padding: '15px'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 165, 0, 0.4)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            🌟 Buscar en Unsplash
                                        </button>
                                    </div>
                                    
                                    <div className="mt-auto">
                                        <div className="alert border-0 shadow-sm" style={{ 
                                            borderRadius: '15px',
                                            background: 'rgba(13, 202, 240, 0.1)',
                                            color: '#0aa2c0',
                                            fontSize: '0.9rem'
                                        }}>
                                            <small>
                                                💡 <strong>Tip:</strong> Necesitas pares de imágenes. Sube al menos 2 imágenes diferentes.
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección derecha - Grid de imágenes */}
                                <div className="col-md-7 border-start border-light ps-md-5">
                                    <div className="text-center mb-4">
                                        <h5 className="fw-bold mb-3" style={{ fontFamily: 'Comic Sans MS, cursive', color: '#4a5568' }}>
                                            Galería ({state.memoryImages.length})
                                        </h5>
                                    </div>
                                    
                                    <div style={{ 
                                        maxHeight: '400px', 
                                        overflowY: 'auto', 
                                        padding: '10px',
                                        background: '#f8f9fa',
                                        borderRadius: '15px',
                                        minHeight: '300px'
                                    }} className="custom-scrollbar">
                                        {state.memoryImages.length === 0 ? (
                                            <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted">
                                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🖼️</div>
                                                <p>La galería está vacía</p>
                                            </div>
                                        ) : (
                                            <div className="row g-3">
                                                {state.memoryImages.map((image, index) => (
                                                    <div key={index} className="col-4 col-sm-3 col-lg-3">
                                                        <div className="position-relative shadow-sm" style={{ 
                                                            borderRadius: '12px',
                                                            overflow: 'hidden',
                                                            aspectRatio: '1/1',
                                                            transition: 'transform 0.2s'
                                                        }}>
                                                            <img 
                                                                src={image} 
                                                                alt={`Memory card ${index + 1}`}
                                                                style={{ 
                                                                    width: '100%', 
                                                                    height: '100%', 
                                                                    objectFit: 'cover' 
                                                                }}
                                                            />
                                                            <button
                                                                className="btn btn-danger position-absolute top-0 end-0 m-1 d-flex justify-content-center align-items-center"
                                                                style={{ 
                                                                    width: '24px', 
                                                                    height: '24px', 
                                                                    padding: 0, 
                                                                    borderRadius: '50%',
                                                                    fontSize: '10px',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                                }}
                                                                onClick={() => handleDeleteImage(index)}
                                                                title="Eliminar imagen"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                            <div className="position-absolute bottom-0 start-0 m-1">
                                                                <span className="badge bg-white text-dark shadow-sm rounded-pill" style={{ fontSize: '10px', opacity: 0.9 }}>
                                                                    #{index + 1}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {state.memoryImages.length >= 2 && (
                                        <div className="mt-3 text-center">
                                            <span className="badge bg-success rounded-pill px-3 py-2 shadow-sm">
                                                ✅ Listo para jugar
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer del panel */}
                        <div className="card-footer border-0 text-center py-3" style={{
                            background: '#f8f9fa',
                            borderRadius: '0 0 25px 25px',
                            borderTop: '1px solid rgba(0,0,0,0.05)'
                        }}>
                             <small className="text-muted">
                                El juego generará automáticamente los pares con las imágenes seleccionadas.
                            </small>
                        </div>
                    </div>
                </div>

                <ModalMultimedia
                    show={showUnsplash}
                    handleClose={() => setShowUnsplash(false)}
                    origin="unsplash"
                    onSelectMedia={handleSelectImageUnsplash}
                />
            </div>
        </>
    );
}
