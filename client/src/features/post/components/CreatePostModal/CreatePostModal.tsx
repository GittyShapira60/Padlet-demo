import { useEffect } from 'react';
import type { Post } from '../../interfaces/post';
import CreatePostContentArea from './CreatePostContentArea/CreatePostContentArea';
import CreatePostModalTabs from './CreatePostModalTabs/CreatePostModalTabs';
import styles from './CreatePostModal.module.css';
import PostColorPicker from './PostColorPicker/PostColorPicker';
import { useCreatePostModal } from './useCreatePostModal';

interface CreatePostModalProps {
  padletId: string;
  postToEdit?: Post | null;
  onClose: () => void;
  onSubmit?: (post: Post) => void;
}

export default function CreatePostModal({
  padletId,
  postToEdit,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const {
    isEditMode,
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
    postToEdit,
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

  const titleId = isEditMode ? 'edit-post-title' : 'create-post-title';

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
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {isEditMode ? 'עריכת פוסט' : 'פוסט חדש'}
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
          existingImageName={postToEdit?.subject ?? null}
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
            {isLoading
              ? isEditMode
                ? 'שומרת...'
                : 'מוסיף...'
              : isEditMode
                ? 'שמירה'
                : 'הוסף פוסט'}
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
