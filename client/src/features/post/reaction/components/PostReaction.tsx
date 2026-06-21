import { useRef } from 'react';
import { SmilePlus } from '../../../../shared/icons';
import EmojiPickerPopover from './EmojiPickerPopover';
import ReactionPill from './ReactionPill';
import { usePostReactionsContext } from '../context/post-reactions-context';
import { usePostReactionPicker } from '../hooks/usePostReactionPicker';
import styles from './PostReaction.module.css';

interface PostReactionProps {
  postId: string;
}

export default function PostReaction({ postId }: PostReactionProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const { canReact, getPostReactions, setReaction, removeReaction } =
    usePostReactionsContext();
  const reactions = getPostReactions(postId);
  const picker = usePostReactionPicker();

  function handleSelect(reactionCode: string) {
    if (reactions.currentUserReactionCode === reactionCode) {
      void removeReaction(postId);
    } else {
      void setReaction(postId, reactionCode);
    }
    picker.refreshRecents();
    picker.closePicker();
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

    picker.openPicker();
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
          aria-label={
            reactions.currentUserReactionCode
              ? 'החלפת תגובת אימוג׳י'
              : 'הוספת תגובת אימוג׳י'
          }
          onClick={handleOpenPicker}
        >
          <SmilePlus size={19} strokeWidth={1.5} />
        </button>
      ) : null}

      <EmojiPickerPopover
        isOpen={picker.isOpen}
        isLoading={picker.isLoading}
        anchorRef={anchorRef}
        activeCategory={picker.activeCategory}
        searchQuery={picker.searchQuery}
        visibleEmojis={picker.visibleEmojis}
        activeCategoryLabel={picker.activeCategoryLabel}
        selectedReactionCode={reactions.currentUserReactionCode}
        onSearchChange={picker.setSearchQuery}
        onCategoryChange={picker.setActiveCategory}
        onSelect={handleSelect}
        onClose={picker.closePicker}
      />
    </div>
  );
}
