import { useState, useCallback } from 'react';
import { Pencil, Trash2 } from '../../../../shared/icons';
import type { Post, PollOption } from '../../interfaces/post';
import { votePoll } from '../../services/post-service';
import styles from './PadletPostCard.module.css';

interface PadletPostCardProps {
  post: Post;
  padletId: string;
  canManage?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onPollVote?: (updatedPost: Post) => void;
}

function PollView({
  post,
  padletId,
  onPollVote,
}: {
  post: Post;
  padletId: string;
  onPollVote?: (updatedPost: Post) => void;
}) {
  const poll = post.poll!;
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    poll.userVotedOptionId,
  );
  const [isVoting, setIsVoting] = useState(false);
  const hasVoted = poll.userVotedOptionId !== null;

  const handleVote = useCallback(async () => {
    if (!selectedOptionId || isVoting) return;
    setIsVoting(true);
    try {
      const updated = await votePoll(padletId, post.id, selectedOptionId);
      onPollVote?.(updated);
    } catch {
      // silent
    } finally {
      setIsVoting(false);
    }
  }, [selectedOptionId, isVoting, padletId, post.id, onPollVote]);

  if (hasVoted) {
    // Show results
    return (
      <>
        <h3 className={styles.pollQuestion}>{poll.question}</h3>
        <ul className={styles.pollResultsList}>
          {poll.options.map((opt: PollOption) => {
            const pct =
              poll.totalVotes > 0
                ? Math.round((opt.voteCount / poll.totalVotes) * 100)
                : 0;
            const isChosen = opt.id === poll.userVotedOptionId;
            return (
              <li key={opt.id} className={styles.pollResultItem}>
                <div className={styles.pollResultLabelRow}>
                  <span className={isChosen ? styles.pollResultLabelChosen : styles.pollResultLabel}>
                    {isChosen ? '✓ ' : ''}{opt.label}
                  </span>
                  <span className={styles.pollResultPct}>{pct}%</span>
                </div>
                <div className={styles.pollResultBar}>
                  <div
                    className={isChosen ? styles.pollResultFillChosen : styles.pollResultFill}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <p className={styles.pollVoteCount}>{poll.totalVotes} הצבעות</p>
      </>
    );
  }

  // Show voting UI
  return (
    <>
      <h3 className={styles.pollQuestion}>{poll.question}</h3>
      <ul className={styles.pollOptionsList}>
        {poll.options.map((opt: PollOption) => (
          <li
            key={opt.id}
            className={`${styles.pollOptionItem} ${selectedOptionId === opt.id ? styles.pollOptionSelected : ''}`}
            onClick={() => setSelectedOptionId(opt.id)}
          >
            <span
              className={`${styles.pollRadio} ${selectedOptionId === opt.id ? styles.pollRadioChecked : ''}`}
              aria-hidden="true"
            />
            <span className={styles.pollOptionLabel}>{opt.label}</span>
          </li>
        ))}
      </ul>
      {selectedOptionId && (
        <button
          type="button"
          className={styles.voteBtn}
          onClick={handleVote}
          disabled={isVoting}
        >
          {isVoting ? '...' : 'הצבע'}
        </button>
      )}
      <p className={styles.pollVoteCount}>{poll.totalVotes} הצבעות</p>
    </>
  );
}

export default function PadletPostCard({
  post,
  padletId,
  canManage = false,
  onEdit,
  onDelete,
  onPollVote,
}: PadletPostCardProps) {
  return (
    <article
      className={styles.card}
      style={{ background: post.color ?? '#ffffff' }}
    >
      {canManage ? (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            aria-label="עריכת פוסט"
            onClick={() => onEdit?.(post)}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            aria-label="מחיקת פוסט"
            onClick={() => onDelete?.(post)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : null}

      {post.poll ? (
        <PollView post={post} padletId={padletId} onPollVote={onPollVote} />
      ) : (
        <>
          {post.title ? <h3 className={styles.title}>{post.title}</h3> : null}
          {post.subject ? (
            <p className={styles.subject}>{post.subject}</p>
          ) : null}
        </>
      )}
      <p className={styles.author}>{post.authorUsername}</p>
    </article>
  );
}
