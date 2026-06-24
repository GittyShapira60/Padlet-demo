import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { Post } from '../interfaces/post';
import { votePoll as votePollService } from '../services/poll-service';

interface PollContextValue {
  padletId: string;
  onVoteSuccess: (updatedPost: Post) => void;
  votePoll: (postId: string, optionId: string) => Promise<Post>;
}

const PollContext = createContext<PollContextValue | null>(null);

export function PollProvider({
  padletId,
  onVoteSuccess,
  children,
}: {
  padletId: string;
  onVoteSuccess: (updatedPost: Post) => void;
  children: ReactNode;
}) {
  const votePoll = useCallback(
    (postId: string, optionId: string) =>
      votePollService(padletId, postId, optionId),
    [padletId],
  );

  const value = useMemo(
    () => ({ padletId, onVoteSuccess, votePoll }),
    [padletId, onVoteSuccess, votePoll],
  );

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
}

export function usePoll(): PollContextValue {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within PollProvider');
  }
  return context;
}