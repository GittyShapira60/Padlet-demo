import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Padlet } from '../../../padlet/interfaces/padlet';
import type { CopyPadletOptions } from '../../../padlet/services/padlet-service';
import { Calendar, Copy, LayoutDashboard, Lock, LogOut, Trash2, Users } from '../../../../shared/icons';
import styles from './PadletCard.module.css';

interface PadletCardProps {
  padlet: Padlet;
  onDelete?: (padletId: string) => Promise<void>;
  onCopy?: (padletId: string, options: CopyPadletOptions) => Promise<void>;
  onLeave?: (padletId: string) => Promise<void>;
}

export default function PadletCard({ padlet, onDelete, onCopy, onLeave }: PadletCardProps) {
  const navigate = useNavigate();
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [includePosts, setIncludePosts] = useState(true);
  const [includeParticipants, setIncludeParticipants] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const postLabel = padlet.postCount === 1 ? 'פוסט' : 'פוסטים';
  const cardClassName = padlet.isShared ? `${styles.card} ${styles.shared}` : styles.card;

  function handleOpen() {
    navigate(`/padlets/${padlet.id}`);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    await onDelete?.(padlet.id);
  }

  async function handleLeave(e: React.MouseEvent) {
    e.stopPropagation();
    setIsLeaving(true);
    try {
      await onLeave?.(padlet.id);
    } finally {
      setIsLeaving(false);
    }
  }

  function handleCopyClick(e: React.MouseEvent) {
    e.stopPropagation();
    setShowCopyModal(true);
  }

  async function handleCopyConfirm(e: React.MouseEvent) {
    e.stopPropagation();
    setIsCopying(true);
    await onCopy?.(padlet.id, { includePosts, includeParticipants });
    setIsCopying(false);
    setShowCopyModal(false);
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
              {onLeave && (
                <button
                  type="button"
                  className={styles.leaveBtn}
                  onClick={handleLeave}
                  disabled={isLeaving}
                  aria-label={`עזיבת לוח ${padlet.title}`}
                  title="עזוב לוח"
                >
                  <LogOut size={12} strokeWidth={1.5} />
                </button>
              )}
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

        <div className={styles.actions}>
          {onDelete && (
            <button type="button" className={styles.deleteBtn} onClick={handleDelete}>
              <Trash2 size={12} />
              מחק
            </button>
          )}
          {onCopy && (
            <button type="button" className={styles.copyBtn} onClick={handleCopyClick}>
              <Copy size={12} />
              העתק
            </button>
          )}
        </div>

        {showCopyModal && (
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.modalTitle}>העתקת לוח</p>
            <label className={styles.modalOption}>
              <input
                type="checkbox"
                checked={includePosts}
                onChange={(e) => setIncludePosts(e.target.checked)}
              />
              כלול פוסטים שלי
            </label>
            <label className={styles.modalOption}>
              <input
                type="checkbox"
                checked={includeParticipants}
                onChange={(e) => setIncludeParticipants(e.target.checked)}
              />
              כלול משתתפים
            </label>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={handleCopyConfirm}
                disabled={isCopying}
              >
                {isCopying ? 'מעתיק...' : 'העתק'}
              </button>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={(e) => { e.stopPropagation(); setShowCopyModal(false); }}
              >
                ביטול
              </button>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}