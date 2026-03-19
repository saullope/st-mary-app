"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActivityForEdit } from '@/app/actions/getActivityForEdit';
import { ModalMultimedia } from "@/components/editor";
import { useTranslations } from 'next-intl';
import { useActivityEditor } from "@/context/ActivityEditorContext";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage";
import { FaTrash, FaPlus, FaUpload, FaImage } from 'react-icons/fa6';

export default function LudiMemory() {

    /** Traducciones */
    const t = useTranslations("createActivityDashboard");

    // Contexto Global
    const { state, setActivityType, setMemoryImages, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const { backgroundImage, fullScreen } = state;
    const { uploadFiles, uploading } = useFirebaseStorage();

    useEffect(() => {
        setActivityType("ludimemory");
    }, [setActivityType]);

    // Estados locales
    const [showUnsplash, setShowUnsplash] = useState(false);

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
                    
                    if (result.data.memoryImages && result.data.memoryImages.length > 0) {
                        setMemoryImages(result.data.memoryImages);
                    }
                }
                setIsLoading(false);
            }
        };
        loadActivity();
    }, [searchParams, setActivityId, setTitle, updateConfig, setBackgroundImage, setMemoryImages]);


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
                                {/* Sección principal - Grid de carga e imágenes */}
                                <div className="col-12">
                                    <div style={{ 
                                        maxHeight: '500px', 
                                        overflowY: 'auto', 
                                        padding: '10px',
                                        background: 'transparent',
                                    }} className="custom-scrollbar">
                                        <div className="row g-3">
                                            {/* Tarjeta de Carga */}
                                            <div className="col-6 col-sm-4 col-md-3 col-lg-2">
                                                <div 
                                                    className="position-relative shadow-sm d-flex flex-column justify-content-center align-items-center" 
                                                    style={{ 
                                                        borderRadius: '15px',
                                                        aspectRatio: '1/1',
                                                        background: 'rgba(255, 255, 255, 0.8)',
                                                        border: '2px dashed #cbd5e1',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        padding: '10px'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.borderColor = '#94a3b8';
                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                                                    }}
                                                >
                                                    {uploading ? (
                                                        <div className="spinner-border text-primary" role="status">
                                                            <span className="visually-hidden">Cargando...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '8px' }}>
                                                                <FaPlus />
                                                            </div>
                                                            <div className="d-flex w-100 justify-content-around mt-2">
                                                                <button 
                                                                    className="btn btn-sm btn-light rounded-circle shadow-sm"
                                                                    onClick={handleSelectImage}
                                                                    title="Subir desde PC"
                                                                    style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                >
                                                                    <FaUpload color="#64748b" />
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-light rounded-circle shadow-sm"
                                                                    onClick={() => setShowUnsplash(true)}
                                                                    title="Buscar en Unsplash"
                                                                    style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                >
                                                                    <FaImage color="#64748b" />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tarjetas de Imágenes */}
                                            {state.memoryImages.map((image, index) => (
                                                <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                                    <div className="position-relative shadow-sm" style={{ 
                                                        borderRadius: '15px',
                                                        overflow: 'hidden',
                                                        aspectRatio: '1/1',
                                                        transition: 'transform 0.2s',
                                                        border: '2px solid white'
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
                                                            className="btn btn-danger position-absolute top-0 end-0 m-2 d-flex justify-content-center align-items-center"
                                                            style={{ 
                                                                width: '28px', 
                                                                height: '28px', 
                                                                padding: 0, 
                                                                borderRadius: '50%',
                                                                fontSize: '12px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                                background: 'rgba(220, 53, 69, 0.9)',
                                                                border: 'none'
                                                            }}
                                                            onClick={() => handleDeleteImage(index)}
                                                            title="Eliminar imagen"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mt-4 px-3">
                                        <div className="alert alert-info border-0 shadow-sm m-0" style={{ 
                                            borderRadius: '20px',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            color: '#0dcaf0',
                                            fontSize: '0.9rem',
                                            padding: '0.5rem 1.5rem'
                                        }}>
                                            <small>
                                                <strong>Tip:</strong> Sube al menos 2 imágenes. El juego generará los pares automáticamente.
                                            </small>
                                        </div>
                                        
                                        <div style={{ color: '#475569', fontWeight: '500' }}>
                                            Total: {state.memoryImages.length} imágenes
                                        </div>
                                    </div>
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
