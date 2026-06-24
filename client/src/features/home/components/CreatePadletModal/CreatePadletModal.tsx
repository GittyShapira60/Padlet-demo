import BackgroundPicker from '../../../../shared/components/BackgroundPicker/BackgroundPicker';
import Modal from '../../../../shared/components/Modal/Modal';
import BoardTypePicker from './BoardTypePicker/BoardTypePicker';
import CreatePadletModalHeader from './CreatePadletModalHeader/CreatePadletModalHeader';
import styles from './CreatePadletModal.module.css';
import PadletNameInput from './PadletNameInput/PadletNameInput';
import { useCreatePadletModal } from './useCreatePadletModal';
import type { Padlet } from '../../../padlet/interfaces/padlet';

interface CreatePadletModalProps {
  onClose: () => void;
  onSubmit?: (padlet: Padlet) => void;
}

export default function CreatePadletModal({
  onClose,
  onSubmit,
}: CreatePadletModalProps) {
  const {
    title,
    setTitle,
    description,
    setDescription,
    bgTab,
    setBgTab,
    selectedColor,
    setSelectedColor,
    boardType,
    setBoardType,
    isLoading,
    error,
    handleSubmit,
  } = useCreatePadletModal({ onClose, onSubmit });

  return (
    <Modal onClose={onClose}>
      <CreatePadletModalHeader
        title={title}
        background={selectedColor}
        onClose={onClose}
      />

      <div className={styles.body}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="padlet-title">
            שם הלוח <span className={styles.required}>*</span>
          </label>
          <PadletNameInput value={title} onChange={setTitle} />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>רקע</span>
          <BackgroundPicker
            activeTab={bgTab}
            selectedColor={selectedColor}
            onTabChange={setBgTab}
            onColorChange={setSelectedColor}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>סוג לוח</span>
          <BoardTypePicker value={boardType} onChange={setBoardType} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="padlet-description">
            תיאור
          </label>
          <textarea
            id="padlet-description"
            className={styles.textarea}
            placeholder="תאר את מטרת הלוח..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
          />
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.createBtn}
            onClick={() => void handleSubmit()}
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? 'יוצר לוח...' : 'צור לוח'}
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
    </Modal>
  );
}
