'use client';

import { Modal } from "react-bootstrap";
import style from "../../../public/css/editor-activity.module.css";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface ModalProps {
  show: boolean;
  handleClose: () => void;
  origin: string; // Puede ser 'unsplash', 'youtube', o 'freesound'
  onSelectMedia: (type: string, url: string) => void; // Cambiado para manejar diferentes tipos de medios
}

const UNSPLASH_API_KEY = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY;
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const FREESOUND_API_KEY = process.env.NEXT_PUBLIC_FREESOUND_API_KEY;

export const ModalMultimedia = ({ show, handleClose, origin, onSelectMedia }: ModalProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null); // Para previsualizar videos

  const t = useTranslations("modalMultimedia");

  const translationKeys: Record<string, { title: string; placeholder: string }> = {
    unsplash: {
      title: "searchUnsplash",
      placeholder: "searchImage",
    },
    youtube: {
      title: "searchYoutube",
      placeholder: "searchVideo",
    },
    freesound: {
      title: "searchFreesound",
      placeholder: "searchAudio",
    },
  };

  const { title: titleKey, placeholder: placeholderKey } = translationKeys[origin] || {
    title: "search",
    placeholder: "search",
  };

  const searchtitle = t(titleKey);
  const searchplaceholder = t(placeholderKey);

  const handleSearch = async () => {
    setPreviewVideo(null);

    if (!searchQuery.trim()) return;

    setIsLoading(true);

    try {
      let url = "";

      if (origin === "unsplash") {
        url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          searchQuery
        )}&per_page=20&client_id=${UNSPLASH_API_KEY}`;
      } else if (origin === "youtube") {
        url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(
          searchQuery
        )}&key=${YOUTUBE_API_KEY}`;
      } else if (origin === "freesound") {
        url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(
          searchQuery
        )}&fields=id,name,previews&token=${FREESOUND_API_KEY}&page_size=12`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (origin === "unsplash") {
        setResults(data.results || []);
      } else if (origin === "youtube") {
        setResults(data.items || []);
      } else if (origin === "freesound") {
        setResults(data.results || []);
      }
    } catch (error) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      className=""
      show={show}
      size="lg"
      aria-labelledby="modal-title"
      animation={false}
      centered
    >
      <div className={style.modal}>
        <Modal.Body className={style["modal-content"]}>
          <div className={style["modal-left"]}>
            <h2 id="modal-title">{searchtitle}</h2>
            <input
              type="text"
              id="modal-search-input"
              placeholder={searchplaceholder}
              aria-label="Buscar contenido"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              id="modal-search-btn"
              type="button"
              onClick={handleSearch}
            >
              {t("search")}
            </button>
          </div>

          {/* Sección derecha (Resultados) */}
          <div className={`${style["modal-right"]} ${style["results-grid"]}`}>
            {isLoading ? (
              <p>{t("loading")}</p>
            ) : previewVideo ? (
              // Previsualización del video seleccionado
              <div className={style["video-preview"]}>
                <iframe
                  width="100%"
                  height="220"
                  src={previewVideo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <button
                  id="confirm-video-btn"
                  className={`${style['primary-btn']}`}
                  style={{ marginTop: "10px" }}
                  onClick={() => {
                    onSelectMedia("youtube", previewVideo); // Llama a onSelectMedia con el tipo y URL
                    setPreviewVideo(null);
                    handleClose();
                  }}
                >
                  {t("selectVideo")}
                </button>
              </div>
            ) : results.length > 0 ? (
              results.map((item) =>
                origin === "unsplash" ? (
                  <div
                    key={item.id}
                    className={style["result-item"]}
                    onClick={() => {
                      onSelectMedia("image", item.urls.regular); // Llama a onSelectMedia con el tipo y URL
                      handleClose();
                    }}
                  >
                    <Image 
                      src={item.urls.small}
                      alt={item.alt_description || "Imagen Unsplash"}
                      className={style["modal-image"]}
                      width={300}
                      height={200}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : origin === "freesound" ? (
                  <div
                    key={item.id}
                    className={`${style["result-item"]} ${style['result-audio']}`}
                    onClick={() => {
                      onSelectMedia("audio", item.previews["preview-lq-mp3"]); // Llama a onSelectMedia con el tipo y URL
                      handleClose();
                    }}
                  >
                    <audio
                      controls
                      src={item.previews["preview-lq-mp3"]}
                      className={style.actaudio}
                    ></audio>
                    <p className={style["audio-title"]}>{item.name}</p>
                  </div>
                ) : (
                  <div
                    key={item.id.videoId}
                    className={`${style["result-item"]}`}
                    onClick={() => setPreviewVideo(`https://www.youtube.com/embed/${item.id.videoId}`)} // Muestra la previsualización
                  >
                    <Image
                      src={item.snippet.thumbnails.medium.url}
                      alt={item.snippet.title}
                      className={style["modal-image"]}
                      width={320}
                      height={180}
                      style={{ objectFit: "cover" }}
                    />
                    <p className={style["video-title"]}>
                      {item.snippet.title.length > 50
                        ? item.snippet.title.substring(0, 50) + "..."
                        : item.snippet.title}
                    </p>
                  </div>
                )
              )
            ) : (
              <p>{t("notFound")}</p>
            )}
          </div>

          {/* Botón de cerrar */}
          <span
            className={style["close-btn"]}
            role="button"
            aria-label="Cerrar Modal"
            onClick={handleClose}
          >
            &times;
          </span>
        </Modal.Body>
      </div>
    </Modal>
  );
};