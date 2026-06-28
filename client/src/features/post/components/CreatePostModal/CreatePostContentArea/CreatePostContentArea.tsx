import { useEffect,useRef, useState, type ChangeEvent } from 'react';
import {
  EmojiPickerPopover,
  type EmojiDefinition,
} from '@/modules/emoji';
import { Smile } from '@/shared/icons';
import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../../../enums/post-content-tab';
import { BACKGROUND_COLOR_LIGHT } from '../../../../../shared/constants/background-colors';
import PollFormSection from '../PollFormSection/PollFormSection';
import styles from './CreatePostContentArea.module.css';

interface CreatePostContentAreaProps {
  activeTab: PostContentTab;
  textContent: string;
  description: string;
  selectedFile: File | null;
  selectedColor: string;
  existingImageUrl?: string | null;
  onTextChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  // poll
  pollAnswers: { id: number; value: string }[];
  onPollQuestionChange: (value: string) => void;
  onPollAnswerChange: (id: number, value: string) => void;
  onAddPollAnswer: () => void;
  onRemovePollAnswer: (id: number) => void;
  maxPollAnswers: number;
}

export default function CreatePostContentArea({
  activeTab,
  textContent,
  description,
  selectedFile,
  selectedColor,
  existingImageUrl,
  onTextChange,
  onDescriptionChange,
  onFileChange,
  pollAnswers,
  onPollQuestionChange,
  onPollAnswerChange,
  onAddPollAnswer,
  onRemovePollAnswer,
  maxPollAnswers,
}: CreatePostContentAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleEmojiSelect(emoji: EmojiDefinition) {
    onTextChange(textContent + emoji.glyph);
    setPickerOpen(false);
    textareaRef.current?.focus();
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    onFileChange(file);
  }

  if (activeTab === PostContentTabValues.Text) {
    return (
      <>
        <div
          className={styles.textBox}
          style={{ backgroundColor: selectedColor }}
        >
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="מה אתה חושב/ת?"
            value={textContent}
            onChange={(event) => onTextChange(event.target.value)}
          />
          <button
            ref={emojiBtnRef}
            type="button"
            className={styles.emojiBtn}
            onClick={() => setPickerOpen((open) => !open)}
          >
            <Smile size={20} strokeWidth={1.25} color="#64748b" />
          </button>
        </div>

        <EmojiPickerPopover
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          anchorRef={emojiBtnRef}
          catalogMode="all"
          placement="above"
          align="anchor-start"
          onSelect={handleEmojiSelect}
        />
      </>
    );
  }

  if (activeTab === PostContentTabValues.Image) {
    const displayUrl = previewUrl ?? existingImageUrl ?? null;

    return (
      <div className={styles.area}>
        <button
          type="button"
          className={styles.fileDrop}
          style={{ backgroundColor: displayUrl ? 'transparent' : BACKGROUND_COLOR_LIGHT[selectedColor] ?? selectedColor }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleFileInputChange}
          />
          {displayUrl ? (
            <div className={styles.imagePreview}>
              <img src={displayUrl} alt="תצוגה מקדימה" className={styles.previewImg} />
              <span className={styles.fileReplace}>לחץ להחלפת תמונה</span>
            </div>
          ) : (
            <>
              <span className={styles.fileIcon}>🖼️</span>
              <span className={styles.fileLabel}>לחץ כאן לבחירת תמונה מהמחשב</span>
            </>
          )}
        </button>
        <input
          className={styles.descriptionInput}
          type="text"
          placeholder="תיאור (אופציונלי)"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
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
          style={{ backgroundColor: BACKGROUND_COLOR_LIGHT[selectedColor] ?? selectedColor }}
        />
        <input
          className={styles.descriptionInput}
          type="text"
          placeholder="תיאור (אופציונלי)"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
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
