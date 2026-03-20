"use client";

import { useState, useRef } from "react";
import style2 from '@/styles/pages/editor-activity.module.css';
import style3 from '@/styles/pages/ludiquiz.module.css';
import Image from "next/image";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage"; // Importar el hook

interface LoadMultimediaProps {
  type: "image" | "youtube" | "audio" | "video" | null; // Tipo de medio
  url: string | null; // URL del medio
  onUpload: (type: string, url: string) => void; // MODIFICADO: Recibe tipo y URL final
  onUnsplash: () => void; // Función para abrir el modal de Unsplash
  onYoutube: () => void; // Función para abrir el modal de YouTube
  onFreesound: () => void; // Función para abrir el modal de Freesound
  onRemove: () => void; // Función para eliminar el medio seleccionado
  styleComponent: string; // Estilos del componente
}

export const LoadMultimediaFile = ({
  type,
  url,
  onUpload,
  onUnsplash,
  onYoutube,
  onFreesound,
  onRemove,
  styleComponent
}: LoadMultimediaProps) => {
  const [showButtons, setShowButtons] = useState(false);
  const [scale, setScale] = useState(100); // Para ajustar el tamaño del medio
  
  // Usar el hook de Firebase
  const { uploadFile, uploading, error } = useFirebaseStorage();
  
  // Referencia al input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShowButtons = () => setShowButtons(!showButtons);

  // Función para disparar el click del input
  const triggerFileSelect = () => {
    // Es crítico usar un timeout o asegurarse que esto corre en el stack del evento
    // para que algunos navegadores lo detecten como acción de usuario directa
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  // Manejar el cambio del input (selección de archivo)
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Determinar tipo
      const fileType = file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
              ? 'video'
              : file.type.startsWith('audio/')
                  ? 'audio'
                  : null;

      if (fileType) {
          // Subir a Firebase Storage
          const path = `uploads/${Date.now()}_${file.name}`;
          const downloadURL = await uploadFile(file, path);

          if (downloadURL) {
              // Pasar la URL permanente al padre
              onUpload(fileType, downloadURL);
          }
      }
    }
    // Limpiar el valor para permitir seleccionar el mismo archivo de nuevo si es necesario
    event.target.value = "";
  };

  return (
    <>
      {/* Input oculto para carga de archivos - Usamos visibilidad oculta en vez de display none para compatibilidad */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*,video/*,audio/*"
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: 0, height: 0 }}
        onChange={handleFileChange}
      />

      {/* Selector de Medios */}
      <div className={styleComponent == "trueorfalse" ? style2["media-selector"] : style3["media-selector"]}>
        {/* Área de placeholder para mostrar o añadir medios */}
        <div
          className={styleComponent == "trueorfalse" ? style2["media-placeholder"] : style3["media-placeholder"]}
          onClick={handleShowButtons}
        >
          {uploading ? (
             <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Subiendo archivo...</p>
             </div>
          ) : (
            <>
              <span>+</span>
              <p id="media-text">
                {url ? "Archivo cargado:" : "Clic para cargar o buscar archivos multimedia"}
              </p>
            </>
          )}
          
          {error && <p className="text-danger text-center small">{error}</p>}

          {/* Aquí se mostrarán los medios agregados */}
          {url && !uploading && (

            <div id="media-preview" className={styleComponent == "trueorfalse" ? style2["media-preview"] : style3["media-preview"]}>
              <div className={styleComponent == "trueorfalse" ? style2["media-item"] : style3["media-item"]}>
                {(type === "image" || (url && (url.includes("firebasestorage") || url.includes("unsplash")) && type !== "video" && type !== "audio")) && url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={url}
                    alt="Imagen seleccionada"
                    className={styleComponent == "trueorfalse" ? style2["media-preview-content"] : style3["media-preview-content"]}
                    style={{ transform: `scale(${scale / 100})`, maxWidth: '400px', maxHeight: '300px' }}
                  />
                )}
                {type === "video" && (
                  <video
                    src={url}
                    controls
                    className={styleComponent == "trueorfalse" ? style2["media-preview-content"]: style3["media-preview-content"]}
                    style={{ transform: `scale(${scale / 100})` }}
                  />
                )}
                {type === "audio" && (
                  <audio
                    src={url}
                    controls
                    style={{ transform: `scale(${scale / 100})` }}
                  />
                )}
                {type === "youtube" && (
                  <iframe
                    src={url}
                    width="100%"
                    height="220"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ transform: `scale(${scale / 100})` }}
                    className={styleComponent == "trueorfalse" ? style2["media-preview-content"] : style3["media-preview-content"]}
                  ></iframe>
                )}
                <button
                  className={styleComponent == "trueorfalse" ? style2["remove-media-btn"] : style3["remove-media-btn"]}
                  onClick={onRemove}
                >
                  ×
                </button>
              </div>
            </div>
          )}
          {/* Controles para ajustar el tamaño del medio */}
          {url && (
            <div className={styleComponent == "trueorfalse" ? style2["media-controls"] : style3["media-controls"]}>
              <label className={styleComponent == "trueorfalse" ? style2.actlabel : style3.actlabel}>Ajustar tamaño:</label>
              <input
                type="range"
                id="media-size-range"
                min="50"
                max="100"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* Menú flotante (barra lateral emergente) */}
        <div
          className={`${styleComponent == "trueorfalse" ? style2["media-float"]: style3["media-float"]} ${showButtons ? style2.show : style2.hidden} `}
        >
          <button
            className={`${style2.actbutton} ${styleComponent == "trueorfalse" ? style2["small-btn"] : style3["small-btn"] } m-1`}
            onClick={triggerFileSelect} // Usamos nuestra nueva función interna con ref
            type="button"
            disabled={uploading}
          >
            Subir Archivo
          </button>
          <button

            className={`${style2.actbutton} ${styleComponent == "trueorfalse" ? style2["small-btn"] : style3["small-btn"]} m-1`}
            onClick={onUnsplash}
            type="button"
          >
            Buscar en Unsplash
          </button>
          <button
            className={`${style2.actbutton} ${styleComponent == "trueorfalse" ? style2["small-btn"] : style3["small-btn"]} m-1`}
            onClick={onYoutube}
            type="button"
          >
            Buscar en YouTube
          </button>
          <button
            className={`${style2.actbutton} ${styleComponent == "trueorfalse" ? style2["small-btn"] : style3["small-btn"]} m-1`}
            onClick={onFreesound}
            type="button"
          >
            Buscar en Freesound
          </button>
        </div>
      </div>
    </>
  );
};