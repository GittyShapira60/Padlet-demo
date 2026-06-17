import { useRef, type ChangeEvent } from 'react';
import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../../../enums/post-content-tab';
import { MAX_POLL_ANSWERS, MIN_POLL_ANSWERS } from '../useCreatePostModal';
import styles from './CreatePostContentArea.module.css';

interface CreatePostContentAreaProps {
  activeTab: PostContentTab;
  textContent: string;
  selectedFile: File | null;
  selectedColor: string;
  existingImageName?: string | null;
  pollAnswers: string[];
  onTextChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onPollAnswerChange: (index: number, value: string) => void;
  onAddPollAnswer: () => void;
  onRemovePollAnswer: (index: number) => void;
}

export default function CreatePostContentArea({
  activeTab,
  textContent,
  selectedFile,
  selectedColor,
  existingImageName,
  pollAnswers,
  onTextChange,
  onFileChange,
  onPollAnswerChange,
  onAddPollAnswer,
  onRemovePollAnswer,
}: CreatePostContentAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    onFileChange(file);
  }

  if (activeTab === PostContentTabValues.Text) {
    return (
      <div className={styles.area}>
        <button
          type="button"
          className={styles.emojiBtn}
          aria-label="הוסף אמוג׳י"
          onClick={() => undefined}
        >
          😊
        </button>
        <textarea
          className={styles.textarea}
          placeholder="מה אתה חושב/ת?"
          value={textContent}
          onChange={(event) => onTextChange(event.target.value)}
          style={{ backgroundColor: selectedColor }}
        />
      </div>
    );
  }

  if (activeTab === PostContentTabValues.Image) {
    return (
      <div className={styles.area}>
        <button
          type="button"
          className={styles.fileDrop}
          style={{ backgroundColor: selectedColor }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleFileInputChange}
          />
          {selectedFile || existingImageName ? (
            <div className={styles.fileSelected}>
              <span className={styles.fileIcon} aria-hidden="true">
                📄
              </span>
              <p className={styles.fileName}>
                {selectedFile?.name ?? existingImageName}
              </p>
              <span className={styles.fileReplace}>לחץ להחלפת קובץ</span>
            </div>
          ) : (
            <>
              <span className={styles.fileIcon} aria-hidden="true">
                🖼️
              </span>
              <span className={styles.fileLabel}>
                לחץ כאן לבחירת תמונה מהמחשב
              </span>
            </>
          )}
        </button>
      </div>
    );
  }

  if (activeTab === PostContentTabValues.Link) {
    return (
      <div className={styles.area}>
        <input
          className={styles.input}
          type="url"
          placeholder="הדבק או הקלד קישור כאן... 🔗"
          value={textContent}
          onChange={(event) => onTextChange(event.target.value)}
          style={{ backgroundColor: selectedColor }}
        />
      </div>
    );
  }

  const canAddAnswer = pollAnswers.length < MAX_POLL_ANSWERS;
  const canRemoveAnswer = pollAnswers.length > MIN_POLL_ANSWERS;

  return (
    <div className={styles.area}>
      <div className={styles.pollField}>
        <label className={styles.pollLabel} htmlFor="poll-question">
          שאלה
        </label>
        <input
          id="poll-question"
          className={styles.input}
          type="text"
          placeholder="מה השאלה שלך?"
          value={textContent}
          onChange={(event) => onTextChange(event.target.value)}
          style={{ backgroundColor: selectedColor }}
        />
      </div>

      <div className={styles.pollField}>
        <span className={styles.pollLabel}>
          תשובות ({pollAnswers.length}/{MAX_POLL_ANSWERS})
        </span>

        {pollAnswers.map((answer, index) => (
          <div className={styles.pollAnswerRow} key={index}>
            <input
              className={styles.pollAnswerInput}
              type="text"
              placeholder={`תשובה ${index + 1}...`}
              value={answer}
              onChange={(event) =>
                onPollAnswerChange(index, event.target.value)
              }
              style={{ backgroundColor: selectedColor }}
            />
            {canRemoveAnswer ? (
              <button
                type="button"
                className={styles.pollAnswerBadge}
                onClick={() => onRemovePollAnswer(index)}
                aria-label={`הסר תשובה ${index + 1}`}
              >
                {index + 1}
              </button>
            ) : (
              <span className={styles.pollAnswerBadge} aria-hidden="true">
                {index + 1}
              </span>
            )}
          </div>
        ))}

        {canAddAnswer ? (
          <button
            type="button"
            className={styles.addAnswerBtn}
            onClick={onAddPollAnswer}
          >
            + הוסף תשובה
          </button>
        ) : null}
      </div>
    </div>
  );
}
