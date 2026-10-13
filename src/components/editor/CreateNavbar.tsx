"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { TitleActivity, SaveActivityButton, ThemeButton, ThemeContainer, InitialTitleModal, ActivityPreviewModal } from "@/components/editor";
import { useActivityEditor } from "@/context/ActivityEditorContext";
import styles from './CreateNavbar.module.css';
import { FaExpand, FaCompress, FaStar, FaEye } from "react-icons/fa6";
import { MEMORY_MIN_PAIRS } from "@/features/memory/memoryCards";

export const CreateNavbar = () => {
    const { state, setTitle, setBackgroundImage, setThemeModalOpen, setFullScreen } = useActivityEditor();
    const { themeModalOpen, fullScreen, activityType } = state;

    const [previewOpen, setPreviewOpen] = useState(false);

    // Sin contenido no hay nada que previsualizar.
    const canPreview = activityType === "ludileccion"
        ? state.lessonBlocks.length > 0
        : activityType === "ludiform"
            ? state.formQuestions.length > 0
            : activityType === "ludimemory"
                ? state.memoryImages.length >= MEMORY_MIN_PAIRS
                : state.questions.length > 0;
    const previewDisabledReason =
        activityType === "ludimemory"
            ? `Agrega al menos ${MEMORY_MIN_PAIRS} imágenes para previsualizar`
            : activityType === "ludileccion"
                ? "Agrega al menos un bloque para previsualizar"
                : "Agrega al menos una pregunta para previsualizar";

    const handleThemeChange = (imagePath: string) => {
        setBackgroundImage(imagePath);
        setThemeModalOpen(false);
    };

    const toggleFullScreen = () => {
        setFullScreen(!fullScreen);
    };

    return (
        <>
            <nav className={styles.navbar}>
                {/* Logo & Title Section */}
                <div className={styles.logoSection}>
                    <div className={styles.logoBadge}>
                        <Image
                            src="/images/PartialLogo.png"
                            width={28}
                            height={28}
                            alt="LudiGame"
                        />
                    </div>
                    <div className={styles.titleContainer}>
                        <TitleActivity title={state.title} setTitle={setTitle} />
                    </div>
                </div>

                {/* Actions Section */}
                <div className={styles.actionsSection}>

                    {/* AI Assistant (UI Only) */}
                    <button className={`${styles.navButton} ${styles.aiBtn}`} title="Asistente IA">
                        <FaStar className={styles.icon} />
                    </button>

                    {/* Vista Previa + Pantalla Completa: ambos son formas de "ver" el
                        editor, agrupados como un solo control */}
                    <div className={styles.viewGroup}>
                        <button
                            className={`${styles.navButton} ${styles.previewBtn}`}
                            onClick={() => setPreviewOpen(true)}
                            disabled={!canPreview}
                            title={canPreview ? "Vista Previa" : previewDisabledReason}
                        >
                            <FaEye className={styles.icon} />
                        </button>
                        <button
                            className={`${styles.navButton} ${styles.fullscreenBtn}`}
                            onClick={toggleFullScreen}
                            title={fullScreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
                        >
                            {fullScreen ? <FaCompress className={styles.icon} /> : <FaExpand className={styles.icon} />}
                        </button>
                    </div>

                    {/* Separator */}
                    <div style={{ width: 1, height: 24, background: '#e2e8f0' }}></div>

                    {/* Existing Controls */}
                    <div className={styles.themeBtnWrapper}>
                        <ThemeButton onClick={() => setThemeModalOpen(true)} />
                    </div>

                    <SaveActivityButton />
                </div>
            </nav>

            {/* Global Modals/Panels managed by Navbar */}
            <ThemeContainer
                show={themeModalOpen}
                onClose={() => setThemeModalOpen(false)}
                onThemeChange={handleThemeChange}
            />

            <InitialTitleModal />
            <ActivityPreviewModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
        </>
    );
};
