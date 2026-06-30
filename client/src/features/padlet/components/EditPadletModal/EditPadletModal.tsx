
import BackgroundPicker from '../../../../shared/components/BackgroundPicker/BackgroundPicker';
import Modal from '../../../../shared/components/Modal/Modal';
import BoardTypePicker from '../../../home/components/CreatePadletModal/BoardTypePicker/BoardTypePicker';
import CreatePadletModalHeader from '../../../home/components/CreatePadletModal/CreatePadletModalHeader/CreatePadletModalHeader';
import PadletNameInput from '../../../home/components/CreatePadletModal/PadletNameInput/PadletNameInput';
import styles from '../../../home/components/CreatePadletModal/CreatePadletModal.module.css';
import type { Padlet } from '../../interfaces/padlet';
import { useEditPadletModal } from './useEditPadletModal';

interface EditPadletModalProps {
  padlet: Padlet;
  onClose: () => void;
  onSubmit?: (padlet: Padlet) => void;
}

export default function EditPadletModal({
  padlet,
  onClose,
  onSubmit,
}: EditPadletModalProps) {
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
  } = useEditPadletModal({ padlet, onClose, onSubmit });

  return (
    <Modal onClose={onClose}>
      <CreatePadletModalHeader
        title={title}
        background={selectedColor}
        onClose={onClose}
      />

      <div className={styles.body}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="edit-padlet-title-input">
            שם הלוח <span className={styles.required}>*</span>
          </label>
          <PadletNameInput
            id="edit-padlet-title-input"
            value={title}
            onChange={setTitle}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="edit-padlet-description">
            תיאור
          </label>
          <textarea
            id="edit-padlet-description"
            className={styles.textarea}
            placeholder="תאר את מטרת הלוח..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
          />
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

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.createBtn}
            onClick={() => void handleSubmit()}
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? 'שומר שינויים...' : 'שמור שינויים'}
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
