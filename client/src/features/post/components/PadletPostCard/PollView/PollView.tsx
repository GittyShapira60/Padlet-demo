import { useState, useCallback, type CSSProperties } from 'react';
import { usePoll } from '../../../context/PollContext';
import type { Poll, PollOption } from '../../../interfaces/post';
import styles from './PollView.module.css';

interface PollViewProps {
  postId: string;
  poll: Poll;
  accentColor: string;
}

export default function PollView({ postId, poll, accentColor }: PollViewProps) {
  const { onVoteSuccess, votePoll } = usePoll();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    poll.userVotedOptionId,
  );
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const hasVoted = poll.userVotedOptionId !== null;
  const rootStyle = { '--poll-accent': accentColor } as CSSProperties;

  const handleVote = useCallback(async () => {
    if (!selectedOptionId || isVoting) return;
    setIsVoting(true);
    setVoteError(null);
    try {
      const updated = await votePoll(postId, selectedOptionId);
      onVoteSuccess(updated);
    } catch {
      setVoteError('ההצבעה נכשלה, נסה שוב');
    } finally {
      setIsVoting(false);
    }
  }, [selectedOptionId, isVoting, postId, votePoll, onVoteSuccess]);

  if (hasVoted) {
    return (
      <div className={styles.root} style={rootStyle} data-no-drag>
        <h3 className={styles.question}>{poll.question}</h3>
        <ul className={styles.resultsList}>
          {poll.options.map((opt: PollOption) => {
            const pct =
              poll.totalVotes > 0
                ? Math.round((opt.voteCount / poll.totalVotes) * 100)
                : 0;
            const isChosen = opt.id === poll.userVotedOptionId;
            return (
              <li key={opt.id} className={styles.resultItem}>
                <div className={styles.resultLabelRow}>
                  <span className={isChosen ? styles.resultLabelChosen : styles.resultLabel}>
                    {isChosen ? '✓ ' : ''}{opt.label}
                  </span>
                  <span className={styles.resultPct}>{pct}%</span>
                </div>
                <div className={styles.resultBar}>
                  <div
                    className={isChosen ? styles.resultFillChosen : styles.resultFill}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <p className={styles.voteCount}>{poll.totalVotes} הצבעות</p>
      </div>
    );
  }

  return (
    <div className={styles.root} style={rootStyle} data-no-drag>
      <h3 className={styles.question}>{poll.question}</h3>
      <ul className={styles.optionsList}>
        {poll.options.map((opt: PollOption) => (
          <li
            key={opt.id}
            className={`${styles.optionItem} ${selectedOptionId === opt.id ? styles.optionSelected : ''}`}
            onClick={() => setSelectedOptionId(opt.id)}
          >
            <span
              className={`${styles.radio} ${selectedOptionId === opt.id ? styles.radioChecked : ''}`}
              aria-hidden="true"
            />
            <span className={styles.optionLabel}>{opt.label}</span>
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
      {voteError ? <p className={styles.voteError}>{voteError}</p> : null}
      <p className={styles.voteCount}>{poll.totalVotes} הצבעות</p>
    </div>
  );
}