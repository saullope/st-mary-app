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
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '15px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                transition: 'all 0.3s ease',
                fontFamily: 'Comic Sans MS, cursive',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
            }}
        >
            <IoIosColorPalette style={{ fontSize: '1.2rem' }} />
            Tema
        </button>
    )
}