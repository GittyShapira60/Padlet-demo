import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ensureEmojiCatalogReady, isEmojiCatalogReady } from '../emoji/emoji-catalog';
import { PostReactionsContext } from '../context/post-reactions-context';
import { usePostReactions } from '../hooks/usePostReactions';

interface PostReactionsProviderProps {
  padletId: string;
  postIds: string[];
  canReact: boolean;
  children: ReactNode;
}

export function PostReactionsProvider({
  padletId,
  postIds,
  canReact,
  children,
}: PostReactionsProviderProps) {
  const [emojiCatalogReady, setEmojiCatalogReady] = useState(() =>
    isEmojiCatalogReady(),
  );
  const { getPostReactions, setReaction, removeReaction } = usePostReactions({
    padletId,
    postIds,
    emojiCatalogReady,
  });

  useEffect(() => {
    if (emojiCatalogReady) {
      return;
    }

    void ensureEmojiCatalogReady().then(() => {
      setEmojiCatalogReady(true);
    });
  }, [emojiCatalogReady]);

  const value = useMemo(
    () => ({
      canReact,
      emojiCatalogReady,
      getPostReactions,
      setReaction,
      removeReaction,
    }),
    [
      canReact,
      emojiCatalogReady,
      getPostReactions,
      removeReaction,
      setReaction,
    ],
  );

  return (
    <PostReactionsContext.Provider value={value}>
      {children}
    </PostReactionsContext.Provider>
  );
}
