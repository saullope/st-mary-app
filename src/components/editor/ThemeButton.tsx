// path: /src/editor-components/ThemeButton.tsx

import style from '@/styles/pages/editor-activity.module.css';
import { IoIosColorPalette } from "react-icons/io";
import { useTranslations } from "next-intl";

interface ThemeButtonProps {
    onClick: () => void;
}

export const ThemeButton = ({onClick}: ThemeButtonProps) => {
    const t = useTranslations('themeBackground');
    return (
        <button
            className="btn"
            onClick={onClick}
            style={{
                // Mismo color que los demás botones de la barra oscura; el naranja
                // queda solo en el ícono de paleta, como acento.
                background: 'var(--c-shell-control)',
                border: '1px solid var(--c-shell-border)',
                color: 'var(--c-shell-text)',
                fontWeight: 'var(--font-weight-semibold)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '10px 20px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-family-primary)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--c-shell-muted)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--c-shell-border)';
            }}
        >
            <IoIosColorPalette style={{ fontSize: '1.2rem', color: '#ff8a5c' }} />
            {t('button')}
        </button>
    )
}