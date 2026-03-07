"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { TitleActivity, SaveActivityButton, ThemeButton, ThemeContainer } from "@/components/editor";
import { useActivityEditor } from "@/context/ActivityEditorContext";
import styles from './CreateNavbar.module.css';
import { FaExpand, FaCompress, FaStar, FaEye, FaGamepad } from "react-icons/fa6";
import GamificationPanel from "@/features/gamification/components/GamificationPanel/GamificationPanel";

export const CreateNavbar = () => {
    const { state, setTitle, setBackgroundImage, setThemeModalOpen, setFullScreen } = useActivityEditor();
    const { themeModalOpen, fullScreen } = state;
    
    // Local state for Gamification Panel visibility if we don't put it in global context
    const [gamificationOpen, setGamificationOpen] = useState(false);

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
                    <Image
                        src="/images/PartialLogo.png"
                        width={40}
                        height={40}
                        alt="LudiGame Logo"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    />
                    <div className={styles.titleContainer}>
                        <TitleActivity title={state.title} setTitle={setTitle} />
                    </div>
                </div>

                {/* Actions Section */}
                <div className={styles.actionsSection}>
                    {/* Gamification Panel Trigger */}
                    <button 
                        className={`${styles.navButton} ${styles.gamificationBtn}`}
                        onClick={() => setGamificationOpen(true)}
                        title="Panel Lúdico"
                    >
                        <FaGamepad className={styles.icon} />
                        <span className="d-none d-md-inline">Panel Lúdico</span>
                    </button>

                    {/* AI Assistant (UI Only) */}
                    <button className={`${styles.navButton} ${styles.aiBtn}`} title="Asistente IA">
                        <FaStar className={styles.icon} />
                    </button>

                    {/* Preview (UI Only) */}
                    <button className={`${styles.navButton} ${styles.previewBtn}`} title="Vista Previa">
                        <FaEye className={styles.icon} />
                    </button>

                    {/* Separator */}
                    <div style={{ width: 1, height: 24, background: '#e2e8f0' }}></div>

                    {/* Existing Controls */}
                    <div className={styles.themeBtnWrapper}>
                        <ThemeButton onClick={() => setThemeModalOpen(true)} />
                    </div>
                    
                    <button
                        className={`${styles.navButton} ${styles.fullscreenBtn}`}
                        onClick={toggleFullScreen}
                        title={fullScreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
                    >
                        {fullScreen ? <FaCompress className={styles.icon} /> : <FaExpand className={styles.icon} />}
                    </button>

                    <SaveActivityButton />
                </div>
            </nav>

            {/* Global Modals/Panels managed by Navbar */}
            <ThemeContainer
                show={themeModalOpen}
                onClose={() => setThemeModalOpen(false)}
                onThemeChange={handleThemeChange}
            />

            {/* Gamification Panel - Controlled Mode */}
            {/* Note: We need to modify GamificationPanel to accept these props */}
            <GamificationPanel 
                isOpen={gamificationOpen} 
                onToggle={() => setGamificationOpen(!gamificationOpen)}
                trigger={null} // We render the trigger in the Navbar manually
            />
        </>
    );
};
