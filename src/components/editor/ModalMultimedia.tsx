'use client';

import { Modal } from "react-bootstrap";
import style from '@/styles/pages/editor-activity.module.css';
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage";
import { PIXABAY_FILE_PREFIX, uploadsPath } from "@/lib/mediaSources";
import { notify } from "@/components/ui";

interface ModalProps {
  show: boolean;
  handleClose: () => void;
  origin: string; // 'unsplash' | 'pixabay' | 'youtube' | 'freesound'
  onSelectMedia: (type: string, url: string) => void; // Cambiado para manejar diferentes tipos de medios
}

type PixabayImageType = "illustration" | "vector" | "photo";

interface PixabayHit {
  id: number;
  tags: string;
  webformatURL: string;
  largeImageURL: string;
}

const UNSPLASH_API_KEY = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY;
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const FREESOUND_API_KEY = process.env.NEXT_PUBLIC_FREESOUND_API_KEY;
const PIXABAY_API_KEY = process.env.NEXT_PUBLIC_PIXABY_API_KEY;

export const ModalMultimedia = ({ show, handleClose, origin, onSelectMedia }: ModalProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null); // Para previsualizar videos
  // Ilustraciones por defecto: para 1.° a 3.° grado funcionan mejor que la fotografía.
  const [pixabayType, setPixabayType] = useState<PixabayImageType>("illustration");
  const { uploadFile, uploading: savingPixabay } = useFirebaseStorage();

  const t = useTranslations("modalMultimedia");
  const locale = useLocale();

  // Las URLs de Pixabay caducan y sus términos prohíben enlazarlas de forma
  // permanente, así que la imagen elegida se copia a Firebase Storage.
  const selectPixabayImage = async (hit: PixabayHit) => {
    if (savingPixabay) return;
    try {
      const response = await fetch(hit.largeImageURL || hit.webformatURL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const extension = blob.type.split("/")[1] || "jpg";
      const file = new File([blob], `pixabay_${hit.id}.${extension}`, { type: blob.type });
      const storedUrl = await uploadFile(file, uploadsPath(PIXABAY_FILE_PREFIX, `${hit.id}.${extension}`));
      if (!storedUrl) throw new Error("upload failed");
      onSelectMedia("image", storedUrl);
      handleClose();
    } catch (error) {
      console.error("Error saving Pixabay image:", error);
      notify.error(t("pixabaySaveError"));
    }
  };

  const translationKeys: Record<string, { title: string; placeholder: string }> = {
    unsplash: {
      title: "searchUnsplash",
      placeholder: "searchImage",
    },
    pixabay: {
      title: "searchPixabay",
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
      } else if (origin === "pixabay") {
        url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
          searchQuery
        )}&image_type=${pixabayType}&safesearch=true&lang=${locale === "en" ? "en" : "es"}&per_page=24`;
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
      } else if (origin === "pixabay") {
        setResults(data.hits || []);
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
              aria-label={t("searchContent")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            />
            {origin === "pixabay" && (
              <select
                aria-label={t("pixabayTypeLabel")}
                value={pixabayType}
                onChange={(e) => setPixabayType(e.target.value as PixabayImageType)}
                style={{ padding: "10px", borderRadius: "8px", border: "2px solid #ddd" }}
              >
                <option value="illustration">{t("pixabayIllustrations")}</option>
                <option value="vector">{t("pixabayVectors")}</option>
                <option value="photo">{t("pixabayPhotos")}</option>
              </select>
            )}
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
            ) : savingPixabay ? (
              <p role="status">{t("pixabaySaving")}</p>
            ) : origin === "pixabay" && results.length > 0 ? (
              <>
                {(results as PixabayHit[]).map((hit) => (
                  <button
                    key={hit.id}
                    type="button"
                    className={style["result-item"]}
                    onClick={() => selectPixabayImage(hit)}
                    style={{ border: "none" }}
                  >
                    <Image
                      src={hit.webformatURL}
                      alt={hit.tags}
                      className={style["modal-image"]}
                      width={300}
                      height={200}
                      style={{ objectFit: "contain", background: "#fff" }}
                      unoptimized
                    />
                  </button>
                ))}
                {/* Pixabay exige mostrar la fuente junto a los resultados de búsqueda */}
                <p style={{ gridColumn: "1 / -1", fontSize: "0.8rem", color: "#666", margin: 0 }}>
                  {t("pixabayAttribution")}{" "}
                  <a href="https://pixabay.com/" target="_blank" rel="noopener noreferrer">Pixabay</a>
                </p>
              </>
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
                      alt={item.alt_description || t("unsplashImage")}
                      className={style["modal-image"]}
                      width={300}
                      height={200}
                      style={{ objectFit: "cover" }}
                      unoptimized // Fix 500 fetch error by bypassing server optimization
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
                      unoptimized // Fix 500 fetch error by bypassing server optimization
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
            aria-label={t("closeModal")}
            onClick={handleClose}
          >
            &times;
          </span>
        </Modal.Body>
      </div>
    </Modal>
  );
};