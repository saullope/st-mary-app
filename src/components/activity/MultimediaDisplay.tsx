"use client";

import Image from "next/image";
import { isCanvaUrl } from "@/lib/canva";
import { officeViewerUrl } from "@/features/lesson/lessonBlocks";

const DOCUMENT_TITLES: Record<string, string> = {
  PDF: "Documento PDF",
  WORD: "Documento de Word",
  POWERPOINT: "Presentación de PowerPoint",
};

interface MultimediaDisplayProps {
  url: string;
  type: string; // 'IMAGEN', 'VIDEO', 'AUDIO', or specific IDs
  width?: number;
  height?: number;
}

export default function MultimediaDisplay({ url, type, width = 400, height = 300 }: MultimediaDisplayProps) {
  // Va primero: la URL de Canva no debe caer en las reglas por coincidencia de texto de abajo.
  if (type === 'PRESENTACION' || type === 'canva' || isCanvaUrl(url)) {
    return (
      <div className="rounded overflow-hidden shadow-sm" style={{ width: '100%', maxWidth: Math.max(width, 640), aspectRatio: '16 / 9' }}>
        <iframe
          src={url}
          title="Presentación de Canva"
          allow="fullscreen"
          allowFullScreen
          loading="lazy"
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      </div>
    );
  }

  const docType = type.toUpperCase();
  if (DOCUMENT_TITLES[docType]) {
    // Word y PowerPoint se muestran con el visor de Office; el PDF lo abre el navegador.
    const src = docType === 'PDF' ? url : officeViewerUrl(url);
    return (
      <div className="d-flex flex-column align-items-center gap-2" style={{ width: '100%', maxWidth: Math.max(width, 640) }}>
        <div className="rounded overflow-hidden shadow-sm bg-white" style={{ width: '100%', height: 'min(70vh, 720px)' }}>
          <iframe src={src} title={DOCUMENT_TITLES[docType]} style={{ width: '100%', height: '100%', border: 0 }} />
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="small fw-semibold" style={{ color: '#6a4bff' }}>
          Abrir en una pestaña nueva
        </a>
      </div>
    );
  }

  // El tipo declarado manda; las pistas de la URL solo aplican si no hay tipo conocido
  // (antes cualquier archivo de Firebase se mostraba como imagen, incluso un audio).
  const declaredImage = type === 'IMAGEN' || type === 'image';
  const declaredVideo = type === 'VIDEO' || type === 'video' || type === 'YOUTUBE' || type === 'youtube';
  const declaredAudio = type === 'AUDIO' || type === 'audio';
  const hasDeclaredType = declaredImage || declaredVideo || declaredAudio;

  const isImage = declaredImage || (!hasDeclaredType && (url.includes("images") || url.includes("unsplash") || url.includes("firebasestorage")));
  const isVideo = declaredVideo || (!hasDeclaredType && (url.includes("youtube") || url.includes("youtu.be")));
  const isAudio = declaredAudio || (!hasDeclaredType && url.includes("freesound"));

  if (isImage) {
    return (
      <div className="rounded overflow-hidden shadow-sm" style={{ position: 'relative', width: '100%', height: 'auto', maxWidth: width }}>
        <Image
          src={url}
          alt="Recurso multimedia"
          width={width}
          height={height}
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          unoptimized // To allow external providers
        />
      </div>
    );
  }

  if (isVideo) {
    // Extract Youtube ID logic
    let videoId = "";
    if (url.includes("v=")) videoId = url.split("v=")[1]?.split("&")[0];
    else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1];
    else if (url.includes("embed/")) videoId = url.split("embed/")[1];

    // Video subido a Storage (no YouTube): reproductor nativo.
    if (!videoId) {
      return (
        <div className="rounded overflow-hidden shadow-sm" style={{ width: '100%', maxWidth: width }}>
          <video src={url} controls style={{ width: '100%', display: 'block' }} />
        </div>
      );
    }

    return (
      <div className="rounded overflow-hidden shadow-sm ratio ratio-16x9" style={{ maxWidth: width }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allowFullScreen
          style={{ border: 0 }}
        />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="p-3 bg-light rounded border shadow-sm" style={{ width: '100%', maxWidth: width }}>
        <audio controls style={{ width: '100%' }}>
          <source src={url} />
          Tu navegador no soporta el elemento de audio.
        </audio>
      </div>
    );
  }

  return <p className="text-muted small">Tipo de archivo no soportado: {type}</p>;
}
