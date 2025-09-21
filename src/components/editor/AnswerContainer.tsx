import styles from "../../../public/css/ludiquiz.module.css";

interface Answer {
    id: number;
    text: string;
    isCorrect: boolean;
}

interface AnswersContainerProps {
    answers: Answer[];
    onAddAnswer: () => void;
    onUpdateAnswerText: (id: number, text: string) => void;
    onToggleCorrectAnswer: (id: number) => void;
  }
  
  const symbols = ['🔺', '🔷', '🟢', '🟪'];
  const colors = ['#D1B7C6', '#9CB3DF', '#9ACED1', '#9ECE9C'];
  
export const AnswerContainer: React.FC<AnswersContainerProps> = ({
    answers,
    onAddAnswer,
    onUpdateAnswerText,
    onToggleCorrectAnswer,
  }) => {
    return (
      <div className={styles['quiz-container']}>
        <div className={styles['answers-container']}>
          {answers.map((answer, index) => (
            <div
              key={answer.id}
              className={`${styles.answer} ${
                answer.isCorrect ? styles.correct : ''
              }`}
              style={{ background: colors[index % colors.length] }}
            >
              <span>{symbols[index % symbols.length]}</span>
              <input
                type="text"
                placeholder={`Añadir respuesta ${index + 1}`}
                value={answer.text}
                onChange={(e) => onUpdateAnswerText(answer.id, e.target.value)}
                className={styles.actinput}
                style={{color: 'black'}}
              />
              <span
                className={styles.check}
                onClick={() => onToggleCorrectAnswer(answer.id)}
              >
                ✔
              </span>
            </div>
          ))}
        </div>
        <button
          className={styles['add-answer']}
          onClick={onAddAnswer}
        >
          ✚ Añadir más respuestas
        </button>
      </div>
    );
  };