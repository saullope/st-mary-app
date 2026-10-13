import { FaPencilAlt } from "react-icons/fa"; // Importa el ícono de lápiz
import style from '@/styles/pages/editor.module.css';
import { useTranslations } from "next-intl";

interface TitleActivityProps {
    title: string;
    setTitle: (newTitle: string) => void;
}

export const TitleActivity = ({ title, setTitle }: TitleActivityProps) => {
    const t = useTranslations("Editor.titleModal");
    return (
        <div className={style['contenedor-titulo']}>
            <input
                type="text"
                className={`form-control ${style['titulo-actividad']}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={(e) => e.target.select()}
                title={title}
                placeholder={t("defaultTitle")}
                aria-label={t("label")}
            />
            <FaPencilAlt className={style['icono-titulo']} aria-hidden="true"/>
        </div>
    );
};
