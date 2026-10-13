// path: /src/editor-components/ThemeButton.tsx

import style from '@/styles/pages/editor-activity.module.css';
import { IoIosColorPalette } from "react-icons/io";

interface ThemeButtonProps {
    onClick: () => void;
}

export const ThemeButton = ({onClick}: ThemeButtonProps) => {
    return (
        <button
            className="btn"
            onClick={onClick}
            style={{
                // Misma base neutra que el resto de chips del header: el
                // naranja (tarjeta "Verdadero o Falso" del dashboard) queda
                // solo en el ícono, como acento, no como fondo sólido.
                background: 'var(--white)',
                border: '1px solid var(--gray-200)',
                color: 'var(--gray-600)',
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
                e.currentTarget.style.borderColor = '#ffcba6';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--gray-200)';
            }}
        >
            <IoIosColorPalette style={{ fontSize: '1.2rem', color: '#ff8a5c' }} />
            Tema
        </button>
    )
}