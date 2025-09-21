// path: /src/editor-components/ThemeButton.tsx

import style from "../../../public/css/editor-activity.module.css";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface ThemeContainerProps {
    show: boolean;
    onThemeChange: (themePath: string) => void;
}

const themes = [
    { id: 1, title: "tema1", image: "/images/theme/tema1.jpg" },
    { id: 2, title: "tema2", image: "/images/theme/tema2.jpg" },
    { id: 3, title: "tema3", image: "/images/theme/tema3.jpg" },
    { id: 4, title: "tema4", image: "/images/theme/tema4.jpg" },
    { id: 5, title: "tema5", image: "/images/theme/tema5.jpg" },
    { id: 6, title: "tema6", image: "/images/theme/tema6.jpg" },
    { id: 7, title: "tema7", image: "/images/theme/tema7.jpg" }
];

export const ThemeContainer = ({show, onThemeChange}: ThemeContainerProps) => {
 
 const t = useTranslations("themeBackground");

    return (
        <div 
        className={`${style['theme-container']} ${show ? style.open: ''}`} 
        id="themeContainer">
                <h1 className={style.acth1}>Selecciona un Tema</h1>
                <div className={style['theme-selector']} id="themeList">
                {themes.map((theme) => (
                    <div key={theme.id} className={style['theme-item']}>
                        <div className={style['theme-card']}
                        onClick={() => onThemeChange(theme.image)}>
                            <img className={style.actimg} src={theme.image} alt={theme.title} />
                        </div>
                        <div className={style['theme-title']}>{t(theme.title)}</div>
                    </div>
                ))}
                </div>
        </div>
    );
}