import { useRef, type ChangeEvent } from 'react';
import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../../../enums/post-content-tab';
import styles from './CreatePostContentArea.module.css';

interface CreatePostContentAreaProps {
  activeTab: PostContentTab;
  textContent: string;
  selectedFile: File | null;
  selectedColor: string;
  existingImageName?: string | null;
  onTextChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
}

export default function CreatePostContentArea({
  activeTab,
  textContent,
  selectedFile,
  selectedColor,
  existingImageName,
  onTextChange,
  onFileChange,
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
              <span className={styles.fileIcon}>
                📄
              </span>
              <p className={styles.fileName}>
                {selectedFile?.name ?? existingImageName}
              </p>
              <span className={styles.fileReplace}>לחץ להחלפת קובץ</span>
            </div>
          ) : (
            <>
              <span className={styles.fileIcon}>
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

  return (
    <div className={styles.area}>
      <input
        className={styles.input}
        type="text"
        placeholder="מה שאלת הסקר שלך? 📊"
        value={textContent}
        onChange={(event) => onTextChange(event.target.value)}
        style={{ backgroundColor: selectedColor }}
      />
    </div>
  );
}
