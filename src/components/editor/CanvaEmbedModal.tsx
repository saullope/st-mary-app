"use client";

import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslations } from "next-intl";
import { SiCanva } from "react-icons/si";
import { FaXmark } from "react-icons/fa6";
import { parseCanvaLink } from "@/lib/canva";
import styles from "./CanvaEmbedModal.module.css";

interface CanvaEmbedModalProps {
  show: boolean;
  handleClose: () => void;
  onSubmit: (embedUrl: string, title: string) => void;
  /** Valores de una diapositiva existente; el padre debe cambiar `key` para reiniciar el formulario. */
  initialUrl?: string;
  initialTitle?: string;
}

export const CanvaEmbedModal = ({ show, handleClose, onSubmit, initialUrl = "", initialTitle = "" }: CanvaEmbedModalProps) => {
  const t = useTranslations("modalMultimedia");
  const [input, setInput] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const isEditing = Boolean(initialUrl);

  const parsed = parseCanvaLink(input);
  const errorMessage =
    !parsed.ok && parsed.reason === "edit-link"
      ? t("canvaEditLink")
      : !parsed.ok && parsed.reason === "invalid"
        ? t("canvaInvalid")
        : null;

  const close = () => {
    setInput(initialUrl);
    setTitle(initialTitle);
    handleClose();
  };

  const submit = () => {
    if (!parsed.ok) return;
    onSubmit(parsed.embedUrl, title.trim());
    setInput("");
    setTitle("");
    handleClose();
  };

  return (
    // animation={false}: la transición Fade de react-bootstrap lee element.ref, que React 19 eliminó.
    <Modal show={show} onHide={close} size="lg" centered animation={false} aria-labelledby="canva-modal-title">
      <Modal.Body className={styles.body}>
        <button type="button" className={styles.closeBtn} onClick={close} aria-label={t("close")}>
          <FaXmark />
        </button>

        <div className={styles.header}>
          <span className={styles.logo} aria-hidden="true"><SiCanva /></span>
          <h2 id="canva-modal-title" className={styles.title}>
            {isEditing ? t("canvaEditSlide") : t("canvaTitle")}
          </h2>
        </div>
        <p className={styles.intro}>{t("canvaIntro")}</p>

        <ol className={styles.steps}>
          <li>{t("canvaStep1")}</li>
          <li>{t("canvaStep2")}</li>
          <li>{t("canvaStep3")}</li>
        </ol>

        <label htmlFor="canva-slide-title" className={styles.label}>{t("canvaSlideTitleLabel")}</label>
        <input
          id="canva-slide-title"
          type="text"
          className={`${styles.input} mb-3`}
          maxLength={200}
          placeholder={t("canvaSlideTitlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="canva-link-input" className={styles.label}>{t("canvaLabel")}</label>
        <textarea
          id="canva-link-input"
          className={styles.input}
          rows={2}
          placeholder="https://www.canva.com/design/.../view"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? "canva-link-error" : undefined}
        />
        {errorMessage && (
          <p id="canva-link-error" className={styles.error} role="alert">{errorMessage}</p>
        )}

        {parsed.ok && (
          <div className={styles.preview}>
            <iframe
              src={parsed.embedUrl}
              title={t("canvaPreview")}
              allow="fullscreen"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryBtn} onClick={close}>{t("cancel")}</button>
          <button type="button" className={styles.primaryBtn} onClick={submit} disabled={!parsed.ok}>
            {isEditing ? t("canvaSaveSlide") : t("canvaInsert")}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
