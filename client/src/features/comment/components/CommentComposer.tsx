import { useRef, useState } from 'react';
import { ArrowLeft, Plus, Smile } from '../../../shared/icons';
import {
  EmojiPickerPopover,
  type EmojiDefinition,
} from '@/modules/emoji';
import styles from './CommentComposer.module.css';

const PLACEHOLDER = 'זה המקום להודעות';

interface CommentComposerProps {
  disabled?: boolean;
  onSend?: (body: string) => void;
  onAttachClick?: () => void;
}

export default function CommentComposer({
  disabled = false,
  onSend,
  onAttachClick,
}: CommentComposerProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [value, setValue] = useState('');
  const canSend = value.trim().length > 0 && !disabled;

  function handleSend() {
    if (!canSend) {
      return;
    }

    onSend?.(value.trim());
    setValue('');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleEmojiSelect(emoji: EmojiDefinition) {
    setValue((current) => current + emoji.glyph);
    setPickerOpen(false);
  }

  function handleEmojiClick() {
    if (disabled) {
      return;
    }

    setPickerOpen((open) => !open);
  }

  return (
    <>
      <div ref={anchorRef} className={styles.inputBar}>
        <button type="button" className={styles.sendBtn} onClick={handleSend}>
          <ArrowLeft size={17} strokeWidth={2.75} color="#ffffff" />
        </button>

        <button
          type="button"
          className={styles.emojiBtn}
          disabled={disabled}
          onClick={handleEmojiClick}
        >
          <Smile size={20} strokeWidth={1.25} color="#adb5c2" />
        </button>

        <input
          className={styles.input}
          type="text"
          value={value}
          placeholder={PLACEHOLDER}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          className={styles.attachBtn}
          disabled={disabled}
          onClick={onAttachClick}
        >
          <Plus size={16} strokeWidth={2.25} color="#8a95a8" />
        </button>
      </div>

      <EmojiPickerPopover
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        anchorRef={anchorRef}
        catalogMode="all"
        onSelect={handleEmojiSelect}
      />
    </>
  );
}
