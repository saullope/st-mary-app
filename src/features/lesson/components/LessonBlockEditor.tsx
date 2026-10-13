"use client";

import { useRef, useState } from "react";
import { FaCloudArrowUp, FaImages, FaYoutube, FaMusic, FaXmark } from "react-icons/fa6";
import { SiCanva, SiPixabay } from "react-icons/si";
import { CanvaEmbedModal, ModalMultimedia, EditorCard, EditorNotice, editorFieldStyles as fields } from "@/components/editor";
import MultimediaDisplay from "@/components/activity/MultimediaDisplay";
import { notify } from "@/components/ui";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage";
import { LESSON_FILE_PREFIX, uploadsPath } from "@/lib/mediaSources";
import {
  DOCUMENT_ACCEPT,
  LESSON_RESOURCE_TYPE,
  MAX_DOCUMENT_BYTES,
  isBlockAllowedForGrade,
  type LessonBlock,
} from "@/features/lesson/lessonBlocks";
import { BLOCK_ICONS, BLOCK_COLORS } from "./blockIcons";
import styles from "./LessonBlockEditor.module.css";
import { useTranslations } from "next-intl";

type ExternalSource = "unsplash" | "pixabay" | "youtube" | "freesound" | "canva";

const UPLOAD_ACCEPT: Partial<Record<LessonBlock["kind"], string>> = {
  image: "image/*",
  audio: "audio/*",
  ...DOCUMENT_ACCEPT,
};

const READING_MAX_CHARS = 6000;

interface LessonBlockEditorProps {
  block: LessonBlock;
  gradeId: number;
  onChange: (changes: Partial<LessonBlock>) => void;
}

export const LessonBlockEditor = ({ block, gradeId, onChange }: LessonBlockEditorProps) => {
  const [source, setSource] = useState<ExternalSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useFirebaseStorage();
  const t = useTranslations("Editor.lesson");
  const Icon = BLOCK_ICONS[block.kind];
  const isDocument = block.kind === "pdf" || block.kind === "word" || block.kind === "powerpoint";

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (isDocument && file.size > MAX_DOCUMENT_BYTES) {
      notify.warning(t("fileTooLarge"), t("fileTooLargeDescription"));
      return;
    }
    const url = await uploadFile(file, uploadsPath(LESSON_FILE_PREFIX, file.name));
    if (!url) {
      notify.error(t("uploadFailed"), t("checkConnection"));
      return;
    }
    onChange({ url });
  };

  const sourceButtons: { key: ExternalSource; label: string; icon: React.ReactNode }[] =
    block.kind === "image"
      ? [
          { key: "unsplash", label: "Unsplash", icon: <FaImages /> },
          { key: "pixabay", label: "Pixabay", icon: <SiPixabay /> },
        ]
      : block.kind === "audio"
        ? [{ key: "freesound", label: "Freesound", icon: <FaMusic /> }]
        : block.kind === "youtube"
          ? [{ key: "youtube", label: block.url ? t("changeVideo") : t("searchVideo"), icon: <FaYoutube /> }]
          : block.kind === "canva"
            ? [{ key: "canva", label: block.url ? t("changePresentation") : t("addPresentation"), icon: <SiCanva /> }]
            : [];

  const uploadAccept = UPLOAD_ACCEPT[block.kind];

  return (
    <EditorCard icon={Icon} label={t(`kinds.${block.kind}`)} color={BLOCK_COLORS[block.kind]}>
      {!isBlockAllowedForGrade(block.kind, gradeId) && (
        <EditorNotice>{t("notAllowedNotice")}</EditorNotice>
      )}

      <label htmlFor={`block-title-${block.id}`} className={fields.fieldLabel}>{t("blockTitle")}</label>
      <input
        id={`block-title-${block.id}`}
        type="text"
        className={fields.textInput}
        maxLength={200}
        placeholder={block.kind === "reading" ? t("readingTitlePlaceholder") : t("optional")}
        value={block.title}
        onChange={(e) => onChange({ title: e.target.value })}
      />

      {block.kind === "reading" ? (
        <>
          <label htmlFor={`block-body-${block.id}`} className={fields.fieldLabel}>{t("readingText")}</label>
          <textarea
            id={`block-body-${block.id}`}
            className={fields.textArea}
            rows={12}
            maxLength={READING_MAX_CHARS}
            placeholder={t("readingPlaceholder")}
            value={block.body ?? ""}
            onChange={(e) => onChange({ body: e.target.value })}
          />
          <span className={fields.charCount} aria-live="polite">
            {(block.body ?? "").length} / {READING_MAX_CHARS}
          </span>
        </>
      ) : (
        <>
          <div className={styles.sourceRow}>
            {uploadAccept && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={uploadAccept}
                  onChange={handleFile}
                  className="d-none"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className={fields.secondaryButton}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <FaCloudArrowUp aria-hidden="true" /> {uploading ? t("uploading") : t(`upload.${block.kind as "image" | "audio" | "pdf" | "word" | "powerpoint"}`)}
                </button>
              </>
            )}
            {sourceButtons.map((button) => (
              <button key={button.key} type="button" className={fields.secondaryButton} onClick={() => setSource(button.key)}>
                <span aria-hidden="true">{button.icon}</span> {button.label}
              </button>
            ))}
          </div>

          {isDocument && (
            <p className={fields.fieldHint}>
              {block.kind === "pdf"
                ? t("pdfHint")
                : t("officeHint")}
            </p>
          )}

          {block.url ? (
            <div className={styles.previewArea}>
              <MultimediaDisplay url={block.url} type={LESSON_RESOURCE_TYPE[block.kind]} width={720} />
              <button type="button" className={styles.removeContentBtn} onClick={() => onChange({ url: null })}>
                <FaXmark aria-hidden="true" /> {t("removeContent")}
              </button>
            </div>
          ) : (
            <div className={styles.emptyContent}>
              <Icon aria-hidden="true" />
              <span>{t("emptyContent")}</span>
            </div>
          )}
        </>
      )}

      {(source === "unsplash" || source === "pixabay" || source === "youtube" || source === "freesound") && (
        <ModalMultimedia
          show
          handleClose={() => setSource(null)}
          origin={source}
          onSelectMedia={(_type, url) => {
            onChange({ url });
            setSource(null);
          }}
        />
      )}
      <CanvaEmbedModal
        key={`canva-${block.id}-${block.url ?? ""}`}
        show={source === "canva"}
        handleClose={() => setSource(null)}
        initialUrl={block.url ?? ""}
        initialTitle={block.title}
        onSubmit={(url, title) => onChange(title ? { url, title } : { url })}
      />
    </EditorCard>
  );
};
