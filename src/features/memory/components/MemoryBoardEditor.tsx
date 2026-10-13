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

type SearchSource = "unsplash" | "pixabay";

interface MemoryBoardEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
}

/** Imágenes del tablero: cada una se convierte en una pareja de cartas al jugar. */
export const MemoryBoardEditor = ({ images, onChange }: MemoryBoardEditorProps) => {
  const { uploadFiles } = useFirebaseStorage();
  const [uploading, setUploading] = useState(false);
  const [searchSource, setSearchSource] = useState<SearchSource | null>(null);
  const remaining = MEMORY_MAX_PAIRS - images.length;
  const isFull = remaining <= 0;

  const addImages = (urls: string[]) => {
    const fresh = urls.filter((url) => !images.includes(url));
    if (fresh.length < urls.length) notify.warning("Imagen repetida", "Esa imagen ya está en el tablero.");
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
        notify.warning("Demasiadas imágenes", `Solo caben ${remaining} imágenes más en el tablero.`);
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
    <EditorCard icon={FaClone} label="Parejas del tablero" color="#0096b4">
      <p className={editorFieldStyles.fieldHint}>
        Cada imagen se convierte en una pareja de cartas. Agrega entre {MEMORY_MIN_PAIRS} y {MEMORY_MAX_PAIRS} imágenes;
        el tablero se mezcla cada vez que un estudiante juega.
      </p>

      <div className={styles.actions} role="group" aria-label="Agregar imágenes">
        <button type="button" className={editorFieldStyles.secondaryButton} onClick={uploadFromDevice} disabled={isFull || uploading}>
          <FaUpload aria-hidden="true" /> {uploading ? "Subiendo..." : "Subir desde tu equipo"}
        </button>
        <button type="button" className={editorFieldStyles.secondaryButton} onClick={() => setSearchSource("unsplash")} disabled={isFull || uploading}>
          <FaImages aria-hidden="true" /> Unsplash
        </button>
        <button type="button" className={editorFieldStyles.secondaryButton} onClick={() => setSearchSource("pixabay")} disabled={isFull || uploading}>
          <SiPixabay aria-hidden="true" /> Pixabay
        </button>
      </div>

      {images.length === 0 ? (
        <p className={styles.empty}>Todavía no hay imágenes. Usa los botones de arriba para agregar la primera.</p>
      ) : (
        <ul className={styles.grid} aria-label="Imágenes del tablero">
          {images.map((url, index) => (
            <li key={url} className={styles.tile}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Imagen ${index + 1} del tablero`} />
              <button
                type="button"
                className={styles.remove}
                onClick={() => removeImage(index)}
                aria-label={`Eliminar imagen ${index + 1}`}
                title="Eliminar"
              >
                <FaTrash aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className={styles.counter} aria-live="polite">
        {images.length} de {MEMORY_MAX_PAIRS} parejas
        {images.length < MEMORY_MIN_PAIRS && ` · faltan ${MEMORY_MIN_PAIRS - images.length} para poder jugar`}
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
