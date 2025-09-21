import { FaPencilAlt } from "react-icons/fa"; // Importa el ícono de lápiz
import  style  from "../../../public/css/editor.module.css";

interface TitleActivityProps {
    title: string;
    setTitle: (newTitle: string) => void;
}

export const TitleActivity = ({ title, setTitle }: TitleActivityProps) => {
    return (
        <div className={style['contenedor-titulo']}>
            <input
                type="text"
                className={`form-control ${style['titulo-actividad']}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={(e) => e.target.select()}
                title={title}
            />
            <FaPencilAlt className={style['icono-titulo']}/>
        </div>
    );
};
