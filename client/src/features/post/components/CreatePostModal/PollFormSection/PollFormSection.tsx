import styles from './PollFormSection.module.css';

interface PollFormSectionProps {
  question: string;
  answers: { id: number; value: string }[];
  onQuestionChange: (value: string) => void;
  onAnswerChange: (id: number, value: string) => void;
  onAddAnswer: () => void;
  onRemoveAnswer: (id: number) => void;
  maxAnswers: number;
}

export default function PollFormSection({
  question,
  answers,
  onQuestionChange,
  onAnswerChange,
  onAddAnswer,
  onRemoveAnswer,
  maxAnswers,
}: PollFormSectionProps) {
  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <label className={styles.label}>שאלה</label>
        <input
          className={styles.input}
          type="text"
          placeholder="מה השאלה שלך?"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          תשובות ({answers.length}/{maxAnswers})
        </label>
        <div className={styles.answersList}>
          {answers.map((answer, index) => (
            <div key={answer.id} className={styles.answerRow}>
              <span className={styles.answerIndex}>{index + 1}</span>
              <input
                className={styles.input}
                type="text"
                placeholder={`תשובה ${index + 1}...`}
                value={answer.value}
                onChange={(e) => onAnswerChange(answer.id, e.target.value)}
              />
              {answers.length > 2 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => onRemoveAnswer(answer.id)}
                  aria-label="הסר תשובה"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {answers.length < maxAnswers && (
          <button
            type="button"
            className={styles.addBtn}
            onClick={onAddAnswer}
          >
            + הוסף תשובה
          </button>
        )}
      </div>
    </div>
  );
}