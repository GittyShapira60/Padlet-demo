import type { ReactNode } from 'react';
import Modal from '../Modal/Modal';
import styles from './ConfirmDialog.module.css';

export type ConfirmDialogTone = 'danger' | 'neutral';

interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  pendingLabel?: string;
  isPending?: boolean;
  tone?: ConfirmDialogTone;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

const TITLE_ID = 'confirm-dialog-title';

export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = 'ביטול',
  pendingLabel,
  isPending = false,
  tone = 'neutral',
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const confirmClassName =
    tone === 'danger'
      ? `${styles.confirmBtn} ${styles.danger}`
      : styles.confirmBtn;

  return (
    <Modal onClose={onCancel}>
      <div className={styles.panel}>
        <h2 id={TITLE_ID} className={styles.title}>
          {title}
        </h2>

        {description ? <p className={styles.description}>{description}</p> : null}

        {children}

        <div className={styles.actions}>
          <button
            type="button"
            className={confirmClassName}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? pendingLabel ?? confirmLabel : confirmLabel}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
