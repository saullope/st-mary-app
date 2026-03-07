"use client";

import Image from "next/image";

interface MultimediaDisplayProps {
  url: string;
  type: string; // 'IMAGEN', 'VIDEO', 'AUDIO', or specific IDs
  width?: number;
  height?: number;
}

export default function MultimediaDisplay({ url, type, width = 400, height = 300 }: MultimediaDisplayProps) {
  const isImage = type === 'IMAGEN' || type === 'image' || url.includes("images") || url.includes("unsplash") || url.includes("firebasestorage");
  const isVideo = type === 'VIDEO' || type === 'video' || type === 'YOUTUBE' || url.includes("youtube") || url.includes("youtu.be");
  const isAudio = type === 'AUDIO' || type === 'audio' || url.includes("freesound");

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

    if (!videoId) return <p className="text-muted">Video no disponible</p>;

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
