"use client";

import { useState } from "react";
import { FaClone, FaTrash, FaUpload, FaImages } from "react-icons/fa6";
import { SiPixabay } from "react-icons/si";
import { notify } from "@/components/ui";
import { EditorCard, editorFieldStyles, ModalMultimedia } from "@/components/editor";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage";
import { MEMORY_FILE_PREFIX, uploadsPath } from "@/lib/mediaSources";
import { MEMORY_MAX_PAIRS, MEMORY_MIN_PAIRS } from "@/features/memory/memoryCards";
import styles from "./MemoryBoardEditor.module.css";
import { useTranslations } from "next-intl";

type SearchSource = "unsplash" | "pixabay";

interface MemoryBoardEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
}

/** Imágenes del tablero: cada una se convierte en una pareja de cartas al jugar. */
export const MemoryBoardEditor = ({ images, onChange }: MemoryBoardEditorProps) => {
  const t = useTranslations("Editor.memory");
  const { uploadFiles } = useFirebaseStorage();
  const [uploading, setUploading] = useState(false);
  const [searchSource, setSearchSource] = useState<SearchSource | null>(null);
  const remaining = MEMORY_MAX_PAIRS - images.length;
  const isFull = remaining <= 0;

  const addImages = (urls: string[]) => {
    const fresh = urls.filter((url) => !images.includes(url));
    if (fresh.length < urls.length) notify.warning(t("duplicate"), t("duplicateDescription"));
    onChange([...images, ...fresh].slice(0, MEMORY_MAX_PAIRS));
  };

  const uploadFromDevice = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      if (files.length === 0) return;
      if (files.length > remaining) {
        notify.warning(t("tooMany"), t("tooManyDescription", { remaining }));
      }
      setUploading(true);
      try {
        const urls = await uploadFiles(
          files.slice(0, remaining).map((file) => ({ file, path: uploadsPath(MEMORY_FILE_PREFIX, file.name) }))
        );
        addImages(urls.filter((url): url is string => Boolean(url)));
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const removeImage = (index: number) => onChange(images.filter((_, i) => i !== index));

  return (
    <EditorCard icon={FaClone} label={t("cardLabel")} color="#0096b4">
      <p className={editorFieldStyles.fieldHint}>
        {t("hint", { min: MEMORY_MIN_PAIRS, max: MEMORY_MAX_PAIRS })}
      </p>

      <div className={styles.actions} role="group" aria-label={t("addImages")}>
        <button type="button" className={editorFieldStyles.secondaryButton} onClick={uploadFromDevice} disabled={isFull || uploading}>
          <FaUpload aria-hidden="true" /> {uploading ? t("uploading") : t("uploadFromDevice")}
        </button>
        <button type="button" className={editorFieldStyles.secondaryButton} onClick={() => setSearchSource("unsplash")} disabled={isFull || uploading}>
          <FaImages aria-hidden="true" /> Unsplash
        </button>
        <button type="button" className={editorFieldStyles.secondaryButton} onClick={() => setSearchSource("pixabay")} disabled={isFull || uploading}>
          <SiPixabay aria-hidden="true" /> Pixabay
        </button>
      </div>

      {images.length === 0 ? (
        <p className={styles.empty}>{t("empty")}</p>
      ) : (
        <ul className={styles.grid} aria-label={t("gridLabel")}>
          {images.map((url, index) => (
            <li key={url} className={styles.tile}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={t("imageAlt", { number: index + 1 })} />
              <button
                type="button"
                className={styles.remove}
                onClick={() => removeImage(index)}
                aria-label={t("deleteImage", { number: index + 1 })}
                title={t("delete")}
              >
                <FaTrash aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className={styles.counter} aria-live="polite">
        {t("counter", { count: images.length, max: MEMORY_MAX_PAIRS })}
        {images.length < MEMORY_MIN_PAIRS && ` · ${t("missing", { count: MEMORY_MIN_PAIRS - images.length })}`}
      </p>

      <ModalMultimedia
        show={searchSource !== null}
        handleClose={() => setSearchSource(null)}
        origin={searchSource ?? "unsplash"}
        onSelectMedia={(_type, url) => {
          addImages([url]);
          setSearchSource(null);
        }}
      />
    </EditorCard>
  );
};
