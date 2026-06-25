import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from '../../../shared/icons';
import { formatRelativeTime } from '../../../shared/utils/format-relative-time';
import type { Comment } from '../types/comment';
import styles from './PostComments.module.css';

interface CommentItemProps {
  comment: Comment;
  isOwner?: boolean;
  onDelete?: (comment: Comment) => void;
  onEdit?: (comment: Comment, body: string) => void | Promise<void>;
}

export default function CommentItem({
  comment,
  isOwner = false,
  onDelete,
  onEdit,
}: CommentItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const initial = comment.authorUsername.charAt(0).toUpperCase();

  useEffect(() => {
    setDraft(comment.body);
  }, [comment.body]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  function handleDelete() {
    setIsMenuOpen(false);
    onDelete?.(comment);
  }

  function handleStartEdit() {
    setIsMenuOpen(false);
    setDraft(comment.body);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setDraft(comment.body);
    setIsEditing(false);
  }

  async function handleSaveEdit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === comment.body) {
      handleCancelEdit();
      return;
    }

    await onEdit?.(comment, trimmed);
    setIsEditing(false);
  }

  function handleEditKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleSaveEdit();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      handleCancelEdit();
    }
  }

  return (
    <article className={styles.item}>
      <div className={styles.metaRow}>
        <span className={styles.avatar}>{initial}</span>

        <div className={styles.meta}>
          <p className={styles.commentAuthor}>{comment.authorUsername}</p>
          <p className={styles.time}>{formatRelativeTime(comment.createdAt)}</p>
          {isEditing ? (
            <input
              ref={editInputRef}
              className={styles.editInput}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={() => void handleSaveEdit()}
            />
          ) : (
            <p className={styles.body}>{comment.body}</p>
          )}
        </div>

        {isOwner ? (
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              type="button"
              className={styles.menuBtn}
              aria-label="אפשרויות תגובה"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <MoreVertical
                size={16}
                strokeWidth={2}
                color="#475569"
                aria-hidden="true"
              />
            </button>

            {isMenuOpen ? (
              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={handleStartEdit}
                >
                  <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                  עריכה
                </button>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${styles.deleteItem}`}
                  onClick={handleDelete}
                >
                  <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                  מחק
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
