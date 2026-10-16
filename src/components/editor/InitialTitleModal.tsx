"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useActivityEditor } from "@/context/ActivityEditorContext";
import styles from './InitialTitleModal.module.css';
import { FaPenNib } from "react-icons/fa6";
import { useSearchParams } from 'next/navigation';
import { useTranslations } from "next-intl";

const InitialTitleModalContent = () => {
    const { state, setTitle } = useActivityEditor();
    const [isOpen, setIsOpen] = useState(false);
    const [localTitle, setLocalTitle] = useState("");
    const [hasChecked, setHasChecked] = useState(false);
    const searchParams = useSearchParams();
    const t = useTranslations("Editor.titleModal");
    const id = searchParams.get("id");

    useEffect(() => {
        // Only run once on mount
        if (!hasChecked) {
            // Do not open if we are in Edit Mode (i.e. URL has an id)
            if (!id && !state.title) {
                setIsOpen(true);
            }
            setHasChecked(true);
        }
    }, [hasChecked, state.title, id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalTitle = localTitle.trim();
        if (finalTitle) {
            setTitle(finalTitle);
        }
        setIsOpen(false);
    };

    const handleSkip = () => {
        setTitle(t("defaultTitle"));
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div className={styles.header}>
                    <div className={styles.iconContainer}>
                        <FaPenNib className={styles.icon} />
                    </div>
                    <h2 id="modal-title" className={styles.title}>
                        {t("heading")}
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="input-activity-name" className={styles.label}>
                            {t("label")}
                        </label>
                        <input 
                            id="input-activity-name"
                            type="text" 
                            className={styles.input}
                            placeholder={t("placeholder")}
                            value={localTitle}
                            onChange={(e) => setLocalTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    <div className={styles.actions}>
                        <button 
                            type="button" 
                            className={styles.skipBtn} 
                            onClick={handleSkip}
                        >
                            {t("skip")}
                        </button>
                        <button 
                            id="btn-accept-name"
                            type="submit" 
                            className={styles.startBtn}
                            disabled={!localTitle.trim()}
                        >
                            {t("start")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const InitialTitleModal = () => {
    return (
        <Suspense fallback={null}>
            <InitialTitleModalContent />
        </Suspense>
    );
};
