"use client";

import { useState, useRef, useId, CSSProperties } from "react";
import {
  FaPlus,
  FaXmark,
  FaMusic,
  FaImages,
  FaYoutube,
  FaCloudArrowUp,
  FaArrowsRotate,
} from "react-icons/fa6";
import { SiPixabay } from "react-icons/si";
import { IconType } from "react-icons";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage";
import type { MediaType } from "@/lib/types";
import styles from "./LoadMultimediaFile.module.css";
import { useTranslations } from "next-intl";

interface LoadMultimediaProps {
  type: MediaType | null;
  url: string | null;
  onUpload: (type: string, url: string) => void;
  onUnsplash: () => void;
  onPixabay: () => void;
  onYoutube: () => void;
  onFreesound: () => void;
  onRemove: () => void;
}

interface MediaOption {
  key: string;
  title: string;
  icon: IconType;
  color: string;
  background: string;
  onSelect: () => void;
  disabled?: boolean;
}

export const LoadMultimediaFile = ({
  type,
  url,
  onUpload,
  onUnsplash,
  onPixabay,
  onYoutube,
  onFreesound,
  onRemove,
}: LoadMultimediaProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const [scale, setScale] = useState(100);
  const { uploadFile, uploading, error } = useFirebaseStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionsId = useId();
  const t = useTranslations("Editor.media");

  const toggleOptions = () => setShowOptions((open) => !open);

  // El menú se cierra al elegir para que el modal o el selector de archivos
  // quede como único foco de atención.
  const selectAndClose = (action: () => void) => () => {
    setShowOptions(false);
    action();
  };

  // Debe correr dentro del mismo evento de click para que el navegador lo
  // acepte como acción directa del usuario.
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const fileType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : null;
    if (!fileType) return;

    const downloadURL = await uploadFile(file, `uploads/${Date.now()}_${file.name}`);
    if (downloadURL) onUpload(fileType, downloadURL);
  };

  const options: MediaOption[] = [
    {
      key: "upload",
      title: t("upload"),
      icon: FaCloudArrowUp,
      color: "#6a4bff",
      background: "rgba(106, 75, 255, 0.12)",
      onSelect: selectAndClose(triggerFileSelect),
      disabled: uploading,
    },
    {
      key: "unsplash",
      title: "Unsplash",
      icon: FaImages,
      color: "#0096b4",
      background: "rgba(0, 184, 217, 0.14)",
      onSelect: selectAndClose(onUnsplash),
    },
    {
      key: "pixabay",
      title: "Pixabay",
      icon: SiPixabay,
      color: "#1f9b55",
      background: "rgba(43, 192, 107, 0.14)",
      onSelect: selectAndClose(onPixabay),
    },
    {
      key: "youtube",
      title: "YouTube",
      icon: FaYoutube,
      color: "#e5002b",
      background: "rgba(255, 0, 51, 0.1)",
      onSelect: selectAndClose(onYoutube),
    },
    {
      key: "freesound",
      title: "Freesound",
      icon: FaMusic,
      color: "#e8692f",
      background: "rgba(255, 138, 92, 0.16)",
      onSelect: selectAndClose(onFreesound),
    },
  ];

  const isImage =
    type === "image" ||
    (!!url &&
      (url.includes("firebasestorage") || url.includes("unsplash")) &&
      type !== "video" &&
      type !== "audio");

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*,audio/*"
        style={{ position: "absolute", top: 0, left: 0, opacity: 0, width: 0, height: 0 }}
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div
        className={`${styles.zone} ${showOptions ? styles.zoneOpen : ""} media-upload-zone`}
        data-tour="media-dropzone"
      >
        {uploading ? (
          <div className={styles.uploading} role="status">
            <div className="spinner-border" style={{ color: "#6a4bff" }} aria-hidden="true" />
            {t("uploading")}
          </div>
        ) : url ? (
          <>
            <div className={styles.preview}>
              <div className={styles.previewItem}>
                {isImage && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={url}
                    alt={t("selectedImage")}
                    className={styles.previewContent}
                    style={{ transform: `scale(${scale / 100})`, maxWidth: "400px" }}
                  />
                )}
                {type === "video" && (
                  <video
                    src={url}
                    controls
                    className={styles.previewContent}
                    style={{ transform: `scale(${scale / 100})` }}
                  />
                )}
                {type === "audio" && (
                  <audio src={url} controls style={{ transform: `scale(${scale / 100})` }} />
                )}
                {type === "youtube" && (
                  <iframe
                    src={url}
                    width="100%"
                    height="220"
                    title={t("selectedVideo")}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={styles.previewContent}
                    style={{ transform: `scale(${scale / 100})` }}
                  />
                )}
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={onRemove}
                  aria-label={t("remove")}
                  title={t("remove")}
                >
                  <FaXmark />
                </button>
              </div>
            </div>

            <label className={styles.sizeControl}>
              {t("adjustSize")}
              <input
                type="range"
                min="50"
                max="100"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
            </label>

            <div className={styles.toggleRow}>
              <button
                type="button"
                className={`${styles.toggle} ${styles.toggleWide} ${showOptions ? styles.toggleOpen : ""}`}
                onClick={toggleOptions}
                aria-expanded={showOptions}
                aria-controls={optionsId}
              >
                {showOptions ? <FaXmark /> : <FaArrowsRotate />}
                {showOptions ? t("closeOptions") : t("replace")}
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.empty}
              onClick={toggleOptions}
              aria-expanded={showOptions}
              aria-controls={optionsId}
            >
              <span className={styles.emptyTitle}>{t("emptyTitle")}</span>
              <span className={styles.emptyHint}>
                {showOptions ? t("chooseSource") : t("pressPlus")}
              </span>
            </button>

            <div className={styles.toggleRow}>
              <button
                type="button"
                className={`${styles.toggle} ${showOptions ? styles.toggleOpen : ""}`}
                onClick={toggleOptions}
                aria-expanded={showOptions}
                aria-controls={optionsId}
                aria-label={showOptions ? t("hideOptions") : t("showOptions")}
              >
                <span className={styles.toggleIcon}><FaPlus /></span>
              </button>
            </div>
          </>
        )}

        {/* El mensaje de Firebase es técnico y en inglés: se muestra uno propio. */}
        {error && <p className={styles.error} role="alert">{t("uploadFailed")}</p>}

        <div
          id={optionsId}
          className={`${styles.options} ${showOptions ? styles.optionsOpen : ""}`}
          aria-hidden={!showOptions}
        >
          {options.map(({ key, title, icon: Icon, color, background, onSelect, disabled }) => (
            <button
              key={key}
              type="button"
              className={styles.option}
              onClick={onSelect}
              disabled={disabled}
              tabIndex={showOptions ? 0 : -1}
              style={{ "--option-color": color, "--option-bg": background } as CSSProperties}
            >
              <span className={styles.optionIcon} aria-hidden="true"><Icon /></span>
              <span className={styles.optionTitle}>{title}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
