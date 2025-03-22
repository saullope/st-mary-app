'use client';

import { Modal } from "react-bootstrap";
import style from "../../public/css/true-or-false.module.css";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface ModalProps {
  show: boolean;
  handleClose: () => void;
  origin: string; // Puede ser 'unsplash' o 'youtube'
  onSelectImage: (url: string) => void;
}


const UNSPLASH_API_KEY = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY;
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export const ModalMultimedia = ({ show, handleClose, origin, onSelectImage }: ModalProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  
  // Obtén las traducciones dinámicamente según el valor de `origin`
  const { title: titleKey, placeholder: placeholderKey } = translationKeys[origin] || {
    title: "search",
    placeholder: "search",
  };
  
  const searchtitle = t(titleKey);
  const searchplaceholder = t(placeholderKey);


  const handleSearch = async () => {
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
      }

      const response = await fetch(url);
      const data = await response.json();

      if (origin === "unsplash") {
        setResults(data.results || []);
      } else if (origin === "youtube") {
        setResults(data.items || []);
      }
    } catch (error) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
              ) : results.length > 0 ? (
                results.map((item) =>
                  origin === "unsplash" ? (
                    <div
                      key={item.id}
                      className={style["result-item"]}
                      onClick={() => {
                        onSelectImage(item.urls.regular);
                        handleClose();
                      }}
                    >
                      <img
                        src={item.urls.small}
                        alt={item.alt_description || "Imagen Unsplash"}
                        className={style["modal-image"]}
                      />
                    </div>
                  ) : (
                    <div
                      key={item.id.videoId}
                      className={style["result-item"]}
                      onClick={() => {
                        onSelectImage(
                          `https://www.youtube.com/embed/${item.id.videoId}`
                        );
                        handleClose();
                      }}
                    >
                      <img
                        src={item.snippet.thumbnails.medium.url}
                        alt={item.snippet.title}
                        className={style["modal-image"]}
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
    </>
  );
};