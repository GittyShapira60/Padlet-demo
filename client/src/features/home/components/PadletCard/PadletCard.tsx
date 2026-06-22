import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Padlet } from '../../../padlet/interfaces/padlet';
import type { CopyPadletOptions } from '../../../padlet/services/padlet-service';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { Calendar, Copy, LayoutDashboard, Lock, LogOut, Trash2, Users } from '../../../../shared/icons';
import styles from './PadletCard.module.css';

type ActiveDialog = 'delete' | 'copy' | 'leave' | null;

interface PadletCardProps {
  padlet: Padlet;
  onDelete?: (padletId: string) => Promise<void>;
  onCopy?: (padletId: string, options: CopyPadletOptions) => Promise<void>;
  onLeave?: (padletId: string) => Promise<void>;
}

export default function PadletCard({ padlet, onDelete, onCopy, onLeave }: PadletCardProps) {
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [includePosts, setIncludePosts] = useState(true);
  const [includeParticipants, setIncludeParticipants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postLabel = padlet.postCount === 1 ? 'פוסט' : 'פוסטים';
  const cardClassName = padlet.isShared ? `${styles.card} ${styles.shared}` : styles.card;

  function handleOpen() {
    navigate(`/padlets/${padlet.id}`);
  }

  function openDialog(dialog: ActiveDialog, e: React.MouseEvent) {
    e.stopPropagation();
    setActiveDialog(dialog);
  }

  function closeDialog() {
    if (isSubmitting) {
      return;
    }
    setActiveDialog(null);
    setIncludePosts(true);
    setIncludeParticipants(false);
  }

  async function handleConfirmDelete() {
    setIsSubmitting(true);
    await onDelete?.(padlet.id);
    setIsSubmitting(false);
    setActiveDialog(null);
  }

  async function handleConfirmCopy() {
    setIsSubmitting(true);
    await onCopy?.(padlet.id, { includePosts, includeParticipants });
    setIsSubmitting(false);
    setActiveDialog(null);
  }

  async function handleConfirmLeave() {
    setIsSubmitting(true);
    await onLeave?.(padlet.id);
    setIsSubmitting(false);
    setActiveDialog(null);
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={cardClassName}
        style={{ background: padlet.background ?? undefined }}
        onClick={handleOpen}
        aria-label={`פתיחת לוח ${padlet.title}`}
      >
        <div className={styles.top}>
          {padlet.isShared ? (
            <div className={styles.meta}>
              <span className={styles.sharedBadge}>
                <Users size={11} strokeWidth={1.5} aria-hidden="true" />
                משותף איתי
              </span>
              <span className={styles.utilityIcon} aria-hidden="true">
                <Lock size={12} strokeWidth={1.5} />
              </span>
              <span className={styles.utilityIcon} aria-hidden="true">
                <Calendar size={12} strokeWidth={1.5} />
              </span>
            </div>
          ) : (
            <span className={styles.cardIcon} aria-hidden="true">
              <LayoutDashboard size={14} strokeWidth={1.5} />
            </span>
          )}
        </div>

        <div className={styles.footer}>
          <h4 className={styles.title}>{padlet.title}</h4>
          {padlet.description ? (
            <p className={styles.description}>{padlet.description}</p>
          ) : null}
          <p className={styles.posts}>
            {padlet.postCount} {postLabel}
          </p>
        </div>
      </button>

      <div className={styles.actions}>
        {onDelete && (
          <button type="button" className={styles.actionBtn} onClick={(e) => openDialog('delete', e)}>
            <Trash2 size={12} />
            
          </button>
        )}
        {onCopy && (
          <button type="button" className={styles.actionBtn} onClick={(e) => openDialog('copy', e)}>
            <Copy size={12} />
            
          </button>
        )}
        {onLeave && (
          <button type="button" className={styles.actionBtn} onClick={(e) => openDialog('leave', e)}>
            <LogOut size={12} />
            
          </button>
        )}
      </div>

      {activeDialog === 'delete' && (
        <ConfirmDialog
          title="מחיקת לוח"
          description={`האם את/ה בטוח/ה שברצונך למחוק את הלוח "${padlet.title}"?`}
          confirmLabel="מחק"
          pendingLabel="מוחק..."
          tone="danger"
          isPending={isSubmitting}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={closeDialog}
        />
      )}

      {activeDialog === 'copy' && (
        <ConfirmDialog
          title="העתקת לוח"
          description={`האם ברצונך להעתיק את הלוח "${padlet.title}"?`}
          confirmLabel="העתק"
          pendingLabel="מעתיק..."
          isPending={isSubmitting}
          onConfirm={() => void handleConfirmCopy()}
          onCancel={closeDialog}
        >
          <div className={styles.dialogOptions}>
            <label className={styles.dialogOption}>
              <input
                type="checkbox"
                checked={includePosts}
                onChange={(e) => setIncludePosts(e.target.checked)}
              />
              כלול פוסטים שלי
            </label>
            <label className={styles.dialogOption}>
              <input
                type="checkbox"
                checked={includeParticipants}
                onChange={(e) => setIncludeParticipants(e.target.checked)}
              />
              כלול משתתפים
            </label>
          </div>
        </ConfirmDialog>
      )}

      {activeDialog === 'leave' && (
        <ConfirmDialog
          title="עזיבת לוח"
          description={`האם את/ה בטוח/ה שברצונך לעזוב את הלוח "${padlet.title}"?`}
          confirmLabel="עזוב"
          pendingLabel="עוזב/ת..."
          tone="danger"
          isPending={isSubmitting}
          onConfirm={() => void handleConfirmLeave()}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
