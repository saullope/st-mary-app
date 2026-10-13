"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { useActivityEditor } from "@/context/ActivityEditorContext";
import { useAuth } from "@/hooks/useAuth";
import { ActivityPlayer } from "@/features/play/ActivityPlayer";
import { buildPreviewSession } from "@/features/play/buildPreviewSession";
import { useTranslations } from "next-intl";

interface ActivityPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Deja que el docente juegue la actividad que está editando, como invitado,
 * sin PIN de sesión ni nombre: arma un "sesion" en memoria a partir del
 * estado actual del editor y reutiliza el mismo GameEngine que juegan los
 * estudiantes de verdad (en modo previewMode, sin tocar la base de datos).
 */
export const ActivityPreviewModal = ({ isOpen, onClose }: ActivityPreviewModalProps) => {
    const { state } = useActivityEditor();
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const t = useTranslations("Editor.preview");

    useEffect(() => {
        setMounted(true);
    }, []);

    const tList = useTranslations("Editor.list");
    const untitled = tList("untitledQuestion");
    const sesion = useMemo(() => buildPreviewSession(state, untitled), [state, untitled]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 2000 }}>
            <button
                onClick={onClose}
                title={t("close")}
                style={{
                    position: "fixed",
                    top: 16,
                    right: 16,
                    zIndex: 2001,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderRadius: "var(--border-radius-lg)",
                    border: "none",
                    background: "rgba(15, 10, 30, 0.75)",
                    color: "#fff",
                    fontWeight: 600,
                    fontFamily: "var(--font-family-primary)",
                    backdropFilter: "blur(6px)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                    cursor: "pointer",
                }}
            >
                <IoClose size={20} aria-hidden="true" />
                {t("close")}
            </button>
            <ActivityPlayer sesion={sesion} previewMode onExit={onClose} previewName={user?.displayName || undefined} />
        </div>,
        document.body
    );
};
