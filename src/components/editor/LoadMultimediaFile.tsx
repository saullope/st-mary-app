"use client";

import { useState } from "react";
import style2 from "../../../public/css/editor-activity.module.css";
import style3 from "../../../public/css/ludiquiz.module.css";
import Image from "next/image";

interface LoadMultimediaProps {
  type: "image" | "youtube" | "audio" | "video" | null; // Tipo de medio
  url: string | null; // URL del medio
  onUpload: () => void; // Función para manejar la carga de archivos (controlada por el padre)
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

  const handleShowButtons = () => setShowButtons(!showButtons);

  return (
    <>
      {/* Selector de Medios */}
      <div className={styleComponent == "trueorfalse" ? style2["media-selector"] : style3["media-selector"]}>
        {/* Área de placeholder para mostrar o añadir medios */}
        <div
          className={styleComponent == "trueorfalse" ? style2["media-placeholder"] : style3["media-placeholder"]}
          onClick={handleShowButtons}
        >
          <span>+</span>
          <p id="media-text">
            {url ? "Archivo cargado:" : "Clic para cargar o buscar archivos multimedia"}
          </p>
          {/* Aquí se mostrarán los medios agregados */}
          {url && (
            <div id="media-preview" className={styleComponent == "trueorfalse" ? style2["media-preview"] : style3["media-preview"]}>
              <div className={styleComponent == "trueorfalse" ? style2["media-item"] : style3["media-item"]}>
                {type === "image" && url && (
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
            onClick={onUpload} // Llama a la función del padre para abrir el explorador de archivos
            type="button"
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