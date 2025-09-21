import { Metadata } from "next"
import { useTranslations } from "next-intl"
import styles from '@/css/new-home.module.css'
import Image from "next/image"
import fomentaInt from "@/images/fomenta-interes.png"
import mejoraAprendizaje from "@/images/mejora-aprendizaje.png"
import facilitaParticipacion from "@/images/participación.png"
import Ludiquiz from "@/images/ludiquiz.png"
import Memory from "@/images/memory.png"
import TrueOrFalse from "@/images/verdadero-falso.png"
import Reading from "@/lotties/reading.json"
import { LottieCharge } from '@/components/LottieComponents/LottieCharge'


export const metadata: Metadata = {
  title: "LudiGame",
  description: "",
};

export default function HomePage() {

  const t = useTranslations("HomePage");

  return (
    <>
      <div className={styles.headerludi}>
        {/* <!-- Animaciones decorativas de fondo --> */}
        <div id="lottie-star" className={styles['bg-icon']}></div>
        <div id="lottie-trophy" className={styles['bg-icon']}></div>
        <div id="lottie-rocket" className={styles['bg-icon']}></div>

        <h1 className={styles.h1ludi}>Crea actividades educativas</h1>
        <p className={styles.pludi}>¡Incorpora la ludificación y transforma tu manera de enseñar!</p>

        {/* <!-- Botones de acción en la sección principal --> */}
        <div className={styles['hero-buttons']}>
          <button className={styles.buttonludi} style={{ backgroundColor: "#ffcd00" }}>Empieza a crear</button>
          <button className={styles.buttonludi} style={{ backgroundColor: "white", color: "#333" }}>Ingresa el código
            para jugar</button>
        </div>
      </div>

      <section className={styles['ludi-section']}>
        <div className={styles['ludi-contenido']}>
          <LottieCharge
            animationData={Reading}/>
          <h2 className={`${styles['ludi-experiencias-title']} ${styles.h2ludi}`}>
            Experiencias educativas enfocadas en 1º, 2º y 3º grado
          </h2>
        </div>
      </section>

      {/* <!-- Sección: Importancia de la ludificación --> */}
      <section className={styles['ludi-importance-section']}>
        <h2 className={`${styles['ludi-importance-title']} ${styles.h2ludi}`}>¿Por qué usar ludificación en el
          aula?</h2>
        <div className={styles['ludi-importance-grid']}>
          {/* <!-- Card 1 --> */}
          <div className={styles['ludi-importance-card']}>
            <div className={styles['ludi-importance-icon']}>
              <Image className={styles.imgludi} src={fomentaInt} alt="Fomenta el interés" width={100} height={100} />
            </div>
            <h3>Fomenta el interés</h3>
            <p>Transforma tareas en retos que despiertan curiosidad y
              entusiasmo.</p>
          </div>
          {/* <!-- Card 2 --> */}
          <div className={styles['ludi-importance-card']}>
            <div className={styles['ludi-importance-icon']}>
              <Image src={mejoraAprendizaje} alt="Mejora el aprendizaje" width={100} height={100} />
            </div>
            <h3>Mejora el aprendizaje</h3>
            <p>Favorece la memoria, la atención y la comprensión a través del
              juego.</p>
          </div>

          {/* <!-- Card 3 --> */}
          <div className={styles['ludi-importance-card']}>
            <div className={styles['ludi-importance-icon']}>
              <Image src={facilitaParticipacion} alt="Facilita la participación" width={100} height={100} />
            </div>
            <h3>Facilita la participación</h3>
            <p>Involucra activamente a todo el grupo en dinámicas educativas
              divertidas.</p>
          </div>
        </div>
      </section>

      <section className={styles['rocket-section']}>
        {/*<!-- Fondo de estrellas --> */}
        <div className={styles['stars-background-rocket']}></div>
        <div className={styles['rocket-content']}>
          <h2 className={styles['rocket-text']}>
            ¡LudiGame potencia la creatividad de los
            <span className={styles.highlight}>Educadores</span>!
          </h2>

          {/* <!-- Animación decorativa de cohete --> */}
          <LottieCharge
            animationData={Reading}/>
        </div>
      </section>

      {/* <!-- Sección de tipos de juegos --> */}
      <section className={styles.section}>
        <h2 className={styles.h2ludi}>Convierte ideas en juegos interactivos</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <Image className={styles.imgcard} src={Ludiquiz}
            alt="LudiQuiz" width={100} height={100} /><p>LudiQuiz</p></div>
          <div className={styles.card}>
            <Image className={styles.imgcard} src={Memory}
            alt="LudiMemory" width={100} height={100} /><p>LudiMemory</p></div>
          <div className={styles.card}>
            <Image className={styles.imgcard} src={TrueOrFalse}
            alt="True or False" width={100} height={100} /><p>True or False</p></div>
        </div>
      </section>

      {/* <!-- Pie de página --> */}
      <footer className={styles.footer}>
        <p>© 2025 LudiGame. Todos los derechos reservados.</p>
      </footer>
    </>
  )
}