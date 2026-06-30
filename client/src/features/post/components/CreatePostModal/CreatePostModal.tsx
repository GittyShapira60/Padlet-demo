import { useEffect } from 'react';
import type { Post } from '../../interfaces/post';
import CreatePostContentArea from './CreatePostContentArea/CreatePostContentArea';
import CreatePostModalTabs from './CreatePostModalTabs/CreatePostModalTabs';
import styles from './CreatePostModal.module.css';
import PostColorPicker from './PostColorPicker/PostColorPicker';
import { useCreatePostModal, MAX_POLL_ANSWERS } from './useCreatePostModal';

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
    description,
    setDescription,
    selectedColor,
    setSelectedColor,
    pollAnswers,
    updatePollAnswer,
    addPollAnswer,
    removePollAnswer,
    isLoading,
    error,
    canSubmit,
    handleSubmit,
  } = useCreatePostModal({ padletId, postToEdit, onClose, onSubmit });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.container}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>
            {isEditMode ? 'עריכת פוסט' : 'פוסט חדש'}
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </header>

        <CreatePostModalTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <CreatePostContentArea
          activeTab={activeTab}
          textContent={textContent}
          description={description}
          selectedFile={selectedFile}
          selectedColor={selectedColor}
          existingImageUrl={postToEdit?.imageUrl ?? null}
          onTextChange={setTextContent}
          onDescriptionChange={setDescription}
          onFileChange={setSelectedFile}
          pollAnswers={pollAnswers}
          onPollQuestionChange={setTextContent}
          onPollAnswerChange={updatePollAnswer}
          onAddPollAnswer={addPollAnswer}
          onRemovePollAnswer={removePollAnswer}
          maxPollAnswers={MAX_POLL_ANSWERS}
        />

        <PostColorPicker selectedColor={selectedColor} onColorChange={setSelectedColor} />

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={() => void handleSubmit()}
            disabled={isLoading || !canSubmit}
          >
            {isLoading
              ? isEditMode ? 'שומרת...' : 'מוסיף...'
              : isEditMode ? 'שמירה' : 'הוסף פוסט'}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
