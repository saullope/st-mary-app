'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from 'react-bootstrap';
import Image from 'next/image';
import { IoClose } from 'react-icons/io5';
import style from '@/styles/pages/editor-activity.module.css';

interface Theme {
    id: number;
    nombre: string;
    imageUrl: string;
    descripcion: string | null;
}

interface ThemeContainerProps {
    show: boolean;
    onClose: () => void;
    onThemeChange: (themePath: string) => void;
}

export const ThemeContainer = ({ show, onClose, onThemeChange }: ThemeContainerProps) => {
    const t = useTranslations('themeBackground');
    const [themes, setThemes] = useState<Theme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ESC key handler
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && show) {
            onClose();
        }
    }, [show, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        const fetchThemes = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/common/themes');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch themes');
                }
                
                const data = await response.json();
                setThemes(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching themes:', err);
                setError('Error loading themes');
            } finally {
                setIsLoading(false);
            }
        };

        fetchThemes();
    }, []);

    return (
        <>
            {/* Overlay backdrop */}
            <div
                className={`${style['theme-overlay']} ${show ? style['theme-overlay-visible'] : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Theme panel */} 
            <div
                className={`${style['theme-container']} ${show ? style.open : ''}`}
                id="themeContainer"
                role="dialog"
                aria-modal="true"
                aria-label="Theme selector"
            >
                {/* Close button */}
                <button
                    className={style['theme-close-btn']}
                    onClick={onClose}
                    aria-label="Close theme panel"
                    type="button"
                >
                    <IoClose />
                </button>

                <h1 className={style.acth1}>Selecciona un Tema</h1>
                <div className={style['theme-selector']} id="themeList">
                    {isLoading && (
                        <div className="d-flex justify-content-center align-items-center w-100 py-4">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger text-center w-100">
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && themes.map((theme) => (
                        <div key={theme.id} className={style['theme-item']}>
                            <div
                                className={style['theme-card']}
                                onClick={() => onThemeChange(theme.imageUrl)}
                            >
                                <Image
                                    className={style.actimg}
                                    src={theme.imageUrl}
                                    alt={t(theme.nombre)}
                                    width={120}
                                    height={80}
                                    style={{ objectFit: 'cover' }}
                                    unoptimized
                                />
                            </div>
                            <div className={style['theme-title']}>
                                {t(theme.nombre)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
