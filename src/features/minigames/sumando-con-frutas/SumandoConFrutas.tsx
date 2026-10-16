"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import confetti from "canvas-confetti";
import { FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";
import { pickVoice } from "@/features/gamification/voiceProfile";
import {
  GAME_SECONDS,
  MAX_ATTEMPTS,
  POINTS_PER,
  QUESTIONS,
  finalStars,
  formatTime,
  generateQuestions,
  type SumQuestion,
} from "./rules";
import styles from "./SumandoConFrutas.module.css";

type Phase = "intro" | "start" | "countdown" | "playing" | "results";

const ASSETS = "/minigames/sumando-con-frutas";
const COUNTDOWN_FROM = 3;
// Sin voz instalada se espera lo que tardaría en decirse, para que el niño alcance a leerlo.
const SILENT_SPEECH_MS = 1400;

/**
 * "Sumando con frutas": minijuego de 1.er grado con sus propios estilos, estrellas, música
 * y voz. Es una versión en React del juego original en HTML; no guarda resultados.
 */
export default function SumandoConFrutas() {
  const t = useTranslations("Minigames.sumandoConFrutas");
  const locale = useLocale();
  const [phase, setPhase] = useState<Phase>("intro");
  const [count, setCount] = useState(COUNTDOWN_FROM);
  const [questions, setQuestions] = useState<SumQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [remaining, setRemaining] = useState(GAME_SECONDS);
  const [attempts, setAttempts] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audio = useRef<Record<"music" | "countdown" | "correct" | "wrong", HTMLAudioElement> | null>(null);
  const timers = useRef<number[]>([]);
  const voice = useRef<SpeechSynthesisVoice | null>(null);

  // Audios y voz solo en el navegador; al salir del juego se detiene todo.
  useEffect(() => {
    const make = (file: string, vol: number) => {
      const element = new Audio(`${ASSETS}/sounds/${file}`);
      element.volume = vol;
      return element;
    };
    audio.current = {
      music: make("bg-music.mp3", 0.5),
      countdown: make("countdown.wav", 0.7),
      correct: make("correct.wav", 0.7),
      wrong: make("wrong.wav", 0.7),
    };
    audio.current.music.loop = true;

    const chooseVoice = () => {
      if (!("speechSynthesis" in window)) return;
      voice.current = pickVoice(window.speechSynthesis.getVoices(), locale, "female");
    };
    chooseVoice();
    if ("speechSynthesis" in window) window.speechSynthesis.addEventListener("voiceschanged", chooseVoice);

    const pending = timers.current;
    const sounds = audio.current;
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
      Object.values(sounds).forEach((element) => element.pause());
      if ("speechSynthesis" in window) {
        window.speechSynthesis.removeEventListener("voiceschanged", chooseVoice);
        window.speechSynthesis.cancel();
      }
    };
  }, [locale]);

  const play = useCallback((name: "countdown" | "correct" | "wrong") => {
    const element = audio.current?.[name];
    if (!element) return;
    element.currentTime = 0;
    element.play()?.catch(() => undefined);
  }, []);

  /** Dice el texto (y lo deja en pantalla para quien no puede oírlo); luego llama a `then`. */
  const speak = useCallback((text: string, then?: () => void) => {
    setMessage(text);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      then?.();
    };
    if (!("speechSynthesis" in window) || !voice.current) {
      if (then) timers.current.push(window.setTimeout(finish, SILENT_SPEECH_MS));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice.current;
    utterance.lang = voice.current.lang;
    utterance.pitch = 1.1;
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const endGame = useCallback(() => {
    audio.current?.music.pause();
    setPhase("results");
  }, []);

  // Cuenta regresiva 3, 2, 1, ¡GO!, con su sonido en cada número.
  useEffect(() => {
    if (phase !== "countdown") return;
    play("countdown");
    if (count < 0) {
      audio.current?.countdown.pause();
      const id = window.setTimeout(() => {
        audio.current?.music.play()?.catch(() => undefined);
        setPhase("playing");
      }, 700);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setCount((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, count, play]);

  // Tiempo del juego completo.
  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          endGame();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, endGame]);

  const startGame = () => {
    setQuestions(generateQuestions());
    setIndex(0);
    setScore(0);
    setStars(0);
    setRemaining(GAME_SECONDS);
    setAttempts(0);
    setWrong([]);
    setSolved(null);
    setMessage("");
    setCount(COUNTDOWN_FROM);
    setPhase("countdown");
  };

  const nextQuestion = (current: number) => {
    if (current + 1 >= QUESTIONS) return endGame();
    setAttempts(0);
    setWrong([]);
    setSolved(null);
    setMessage("");
    setIndex(current + 1);
  };

  const answer = (option: number) => {
    const question = questions[index];
    if (!question || solved !== null || wrong.includes(option)) return;
    const correct = question.a + question.b;
    if (option === correct) {
      setSolved(option);
      setScore((value) => value + POINTS_PER);
      setStars((value) => value + 1);
      play("correct");
      confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 }, disableForReducedMotion: true });
      speak(t("voice.correct", { a: question.a, b: question.b, sum: correct }), () => nextQuestion(index));
      return;
    }
    play("wrong");
    setWrong((list) => [...list, option]);
    const used = attempts + 1;
    setAttempts(used);
    if (used >= MAX_ATTEMPTS) {
      setSolved(-1);
      speak(t("voice.answerWas", { sum: correct }), () => nextQuestion(index));
    } else {
      speak(t("voice.tryAgain"));
    }
  };

  const toggleMute = () => {
    const music = audio.current?.music;
    if (!music) return;
    music.muted = !music.muted;
    setMuted(music.muted);
  };

  const changeVolume = (value: number) => {
    const music = audio.current?.music;
    setVolume(value);
    if (!music) return;
    music.volume = value;
    music.muted = value === 0;
    setMuted(value === 0);
  };

  const fruit = (name: string) => `${ASSETS}/img/${name}.png`;
  const starImage = (position: number) => `${ASSETS}/img/estrella${position % 2 === 0 ? 1 : 2}.png`;

  if (phase === "intro") {
    return (
      <div className={styles.root}>
        <button type="button" className={styles.introCard} onClick={() => setPhase("start")}>
          <span className={styles.introContent}>
            <span className={styles.introTitle}>{t("introTitle")}</span>
            <span className={styles.introHint}>{t("introHint")}</span>
          </span>
        </button>
      </div>
    );
  }

  if (phase === "start") {
    return (
      <div className={styles.startScreen}>
        <p className={styles.startPhrase}>{t("startPhrase")}</p>
        <button type="button" className={styles.startButton} onClick={startGame}>{t("play")}</button>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className={styles.countdown} role="status" aria-live="assertive">
        {count > 0 ? count : t("go")}
      </div>
    );
  }

  if (phase === "results") {
    const earned = finalStars(score);
    return (
      <div className={styles.resultsScreen}>
        <div className={styles.resultsCard}>
          <h1 className={styles.resultsTitle}>{t("finished")}</h1>
          <p className={styles.finalScore}>{t("points", { score })}</p>
          <p className={styles.finalStars} aria-label={t("starsLabel", { stars: earned, total: 5 })}>
            {Array.from({ length: 5 }, (_, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={starImage(i)} alt="" className={i < earned ? styles.starOn : styles.starOff} />
            ))}
          </p>
          <button type="button" className={styles.startButton} onClick={() => setPhase("start")}>{t("playAgain")}</button>
        </div>
      </div>
    );
  }

  const question = questions[index];
  if (!question) return null;

  return (
    <div className={styles.uiRoot}>
      <div className={styles.musicControl}>
        <button type="button" className={styles.muteButton} onClick={toggleMute} aria-label={muted ? t("unmute") : t("mute")} aria-pressed={muted}>
          {muted ? <FaVolumeXmark aria-hidden="true" /> : <FaVolumeHigh aria-hidden="true" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={volume}
          onChange={(event) => changeVolume(Number(event.target.value))}
          className={styles.volume}
          aria-label={t("volume")}
        />
      </div>

      <main className={styles.layout}>
        <aside className={styles.sidePanel} aria-labelledby="fruit-stars-title">
          <h2 id="fruit-stars-title" className={styles.sideTitle}>{t("badges")}</h2>
          <div className={styles.badgesBg}>
            <div className={styles.badgeArea}>
              {Array.from({ length: stars }, (_, i) => (
                <div key={i} className={styles.badgeItem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={starImage(i)} alt="" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className={styles.gameArea}>
          <div className={styles.topPanel}>
            <div className={styles.chip}>{t("points", { score })}</div>
            <div className={styles.chip}>{t("progress", { current: index + 1, total: QUESTIONS })}</div>
            <div className={`${styles.chip} ${styles.timer}`}>{t("time", { time: formatTime(remaining) })}</div>
          </div>

          <div className={styles.playCard}>
            <div className={styles.operation} aria-label={t("operationLabel", { a: question.a, b: question.b })}>
              {[{ amount: question.a, name: question.fruitA }, { amount: question.b, name: question.fruitB }].map((group, groupIndex) => (
                <div key={groupIndex} className={styles.operationPart}>
                  {groupIndex === 1 && <span className={styles.sign} aria-hidden="true">+</span>}
                  <div className={styles.fruitGroup} aria-hidden="true">
                    <div className={styles.fruits}>
                      {Array.from({ length: group.amount }, (_, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={fruit(group.name)} alt="" className={styles.fruit} />
                      ))}
                    </div>
                    <div className={styles.fruitNumber}>{group.amount}</div>
                  </div>
                </div>
              ))}
              <span className={styles.sign} aria-hidden="true">= ?</span>
            </div>

            <div className={styles.answers} role="group" aria-label={t("answersLabel")}>
              {question.options.map((option) => {
                const isCorrect = solved === option;
                const isWrong = wrong.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.answer} ${isCorrect ? styles.correct : ""} ${isWrong ? styles.incorrect : ""}`}
                    onClick={() => answer(option)}
                    disabled={solved !== null || isWrong}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <p className={styles.message} role="status" aria-live="polite">{message}</p>
          </div>
        </section>

        <aside className={`${styles.sidePanel} ${styles.rightPanel}`} aria-hidden="true" />
      </main>
    </div>
  );
}
