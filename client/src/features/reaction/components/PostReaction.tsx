import { useRef, useState } from 'react';
import { SmilePlus } from '../../../shared/icons';
import {
  EmojiPickerPopover,
  type EmojiDefinition,
} from '@/modules/emoji';
import ReactionPill from './ReactionPill';
import { usePostReactionsContext } from '../context/post-reactions-context';
import styles from './PostReaction.module.css';

interface PostReactionProps {
  postId: string;
}

export default function PostReaction({ postId }: PostReactionProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { canReact, getPostReactions, setReaction, removeReaction } =
    usePostReactionsContext();
  const reactions = getPostReactions(postId);

  function handleSelect(emoji: EmojiDefinition) {
    if (reactions.currentUserReactionCode === emoji.code) {
      void removeReaction(postId);
    } else {
      void setReaction(postId, emoji.code);
    }
    setPickerOpen(false);
  }

  function handleRemoveOwnReaction() {
    if (!canReact || !reactions.currentUserReactionCode) {
      return;
    }

    void removeReaction(postId);
  }

  function handleOpenPicker() {
    if (!canReact) {
      return;
    }

    setPickerOpen(true);
  }

  const visibleSummaries = (reactions.summaries ?? []).filter(
    (summary) => summary.count > 0,
  );

  return (
    <div ref={anchorRef} className={styles.bar}>
      {visibleSummaries.map((summary) => (
        <ReactionPill
          key={summary.reactionCode}
          summary={summary}
          isOwnReaction={
            canReact &&
            reactions.currentUserReactionCode === summary.reactionCode
          }
          onRemove={handleRemoveOwnReaction}
        />
      ))}

      {canReact ? (
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleOpenPicker}
        >
          <SmilePlus size={19} strokeWidth={1.5} />
        </button>
      ) : null}

      <EmojiPickerPopover
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        anchorRef={anchorRef}
        catalogMode="reaction"
        selectedCode={reactions.currentUserReactionCode}
        onSelect={handleSelect}
      />
    </div>
  );
}
