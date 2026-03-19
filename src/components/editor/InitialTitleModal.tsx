"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useActivityEditor } from "@/context/ActivityEditorContext";
import styles from './InitialTitleModal.module.css';
import { FaPenNib } from "react-icons/fa6";
import { useSearchParams } from 'next/navigation';

const InitialTitleModalContent = () => {
    const { state, setTitle } = useActivityEditor();
    const [isOpen, setIsOpen] = useState(false);
    const [localTitle, setLocalTitle] = useState("");
    const [hasChecked, setHasChecked] = useState(false);
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    useEffect(() => {
        // Only run once on mount
        if (!hasChecked) {
            // Do not open if we are in Edit Mode (i.e. URL has an id)
            if (!id && state.title === "Nueva Actividad") {
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
                        ¡Vamos a crear algo increíble!
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="activity-title" className={styles.label}>
                            ¿Cómo se llamará la actividad?
                        </label>
                        <input 
                            id="activity-title"
                            type="text" 
                            className={styles.input}
                            placeholder="Ej. Fracciones Divertidas..."
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
                            Omitir
                        </button>
                        <button 
                            type="submit" 
                            className={styles.startBtn}
                            disabled={!localTitle.trim()}
                        >
                            Comenzar
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
