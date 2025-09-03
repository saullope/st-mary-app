// path: /src/editor-components/ThemeButton.tsx

import style from "../../public/css/editor-activity.module.css";
import { IoIosColorPalette } from "react-icons/io";

interface ThemeButtonProps {
    onClick: () => void;
}

export const ThemeButton = ({onClick}: ThemeButtonProps) => {
    return (
        <button 
            className={style['theme-button']}
            onClick={onClick}
            >
            <IoIosColorPalette />
             Tema
        </button>
    )
}