import { useRef, useState } from 'react';
import { ArrowLeft, Plus, Smile } from '../../../shared/icons';
import {
  EmojiPickerPopover,
  type EmojiDefinition,
} from '@/modules/emoji';
import styles from './CommentComposer.module.css';

const PLACEHOLDER = 'הוסף תגובה';

interface CommentComposerProps {
  disabled?: boolean;
  onSend?: (body: string) => Promise<void>;
}

export default function CommentComposer({
  disabled = false,
  onSend,
}: CommentComposerProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const isTyping = value.length > 0;
  const isActive = isFocused || isTyping;
  const canSend = value.trim().length > 0 && !disabled;

  function focusInput() {
    if (disabled) {
      return;
    }

    inputRef.current?.focus();
  }

  async function handleSend() {
    if (!canSend) {
      return;
    }

    const body = value.trim();

    try {
      await onSend?.(body);
      setValue('');
      setIsFocused(false);
      inputRef.current?.blur();
    } catch {
    }
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
    inputRef.current?.focus();
  }

  function handleEmojiClick() {
    if (disabled) {
      return;
    }

    setPickerOpen((open) => !open);
  }

  const barClassName = [
    styles.inputBar,
    isActive ? styles.inputBarActive : '',
    isTyping ? styles.inputBarTyping : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div ref={anchorRef} className={barClassName}>
        {isTyping ? (
          <button
            type="button"
            className={styles.sendBtn}
            disabled={!canSend}
            onClick={handleSend}
          >
            <ArrowLeft size={15} strokeWidth={2.25} color="#8a95a8" />
          </button>
        ) : null}

        <button
          type="button"
          className={styles.emojiBtn}
          disabled={disabled}
          onClick={handleEmojiClick}
        >
          <Smile size={18} strokeWidth={1.25} color="#64748b" />
        </button>

        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          value={value}
          placeholder={PLACEHOLDER}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          onClick={focusInput}
        />

        {!isTyping ? (
          <button
            type="button"
            className={styles.activateBtn}
            disabled={disabled}
            onClick={focusInput}
            aria-label="הוסף תגובה"
          >
            <Plus size={15} strokeWidth={2.25} color="#8a95a8" />
          </button>
        ) : null}
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
