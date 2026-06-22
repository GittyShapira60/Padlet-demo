import { useRef, type ChangeEvent } from 'react';
import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../../../enums/post-content-tab';
import PollFormSection from '../PollFormSection/PollFormSection';
import styles from './CreatePostContentArea.module.css';

interface CreatePostContentAreaProps {
  activeTab: PostContentTab;
  textContent: string;
  selectedFile: File | null;
  selectedColor: string;
  existingImageName?: string | null;
  onTextChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  // poll
  pollAnswers: string[];
  onPollQuestionChange: (value: string) => void;
  onPollAnswerChange: (index: number, value: string) => void;
  onAddPollAnswer: () => void;
  onRemovePollAnswer: (index: number) => void;
  maxPollAnswers: number;
}

export default function CreatePostContentArea({
  activeTab,
  textContent,
  selectedFile,
  selectedColor,
  existingImageName,
  onTextChange,
  onFileChange,
  pollAnswers,
  onPollQuestionChange,
  onPollAnswerChange,
  onAddPollAnswer,
  onRemovePollAnswer,
  maxPollAnswers,
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
              <span className={styles.fileIcon} aria-hidden="true">📄</span>
              <p className={styles.fileName}>{selectedFile?.name ?? existingImageName}</p>
              <span className={styles.fileReplace}>לחץ להחלפת קובץ</span>
            </div>
          ) : (
            <>
              <span className={styles.fileIcon} aria-hidden="true">🖼️</span>
              <span className={styles.fileLabel}>לחץ כאן לבחירת תמונה מהמחשב</span>
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

  // Poll
  return (
    <div className={styles.area}>
      <PollFormSection
        question={textContent}
        answers={pollAnswers}
        onQuestionChange={onPollQuestionChange}
        onAnswerChange={onPollAnswerChange}
        onAddAnswer={onAddPollAnswer}
        onRemoveAnswer={onRemovePollAnswer}
        maxAnswers={maxPollAnswers}
      />
    </div>
  );
}