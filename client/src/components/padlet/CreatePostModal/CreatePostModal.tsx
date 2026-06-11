import { useEffect } from 'react';
import type { Post } from '../../../interfaces/post';
import CreatePostContentArea from './CreatePostContentArea/CreatePostContentArea';
import CreatePostModalTabs from './CreatePostModalTabs/CreatePostModalTabs';
import styles from './CreatePostModal.module.css';
import PostColorPicker from './PostColorPicker/PostColorPicker';
import { useCreatePostModal } from './useCreatePostModal';

interface CreatePostModalProps {
  padletId: string;
  authorUsername: string;
  onClose: () => void;
  onSubmit?: (post: Post) => void;
}

export default function CreatePostModal({
  padletId,
  authorUsername,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const {
    activeTab,
    handleTabChange,
    textContent,
    setTextContent,
    selectedFile,
    setSelectedFile,
    selectedColor,
    setSelectedColor,
    isLoading,
    error,
    canSubmit,
    handleSubmit,
  } = useCreatePostModal({
    padletId,
    authorUsername,
    onClose,
    onSubmit,
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.container}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="create-post-title" className={styles.title}>
            פוסט חדש
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="סגור"
          >
            &times;
          </button>
        </header>

        <CreatePostModalTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <CreatePostContentArea
          activeTab={activeTab}
          textContent={textContent}
          selectedFile={selectedFile}
          selectedColor={selectedColor}
          onTextChange={setTextContent}
          onFileChange={setSelectedFile}
        />

        <PostColorPicker
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={() => void handleSubmit()}
            disabled={isLoading || !canSubmit}
          >
            {isLoading ? 'מוסיף...' : 'הוסף פוסט'}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isLoading}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
