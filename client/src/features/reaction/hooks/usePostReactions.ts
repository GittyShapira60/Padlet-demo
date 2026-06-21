import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  PadletReactionsStore,
  PostReactionsView,
} from '../types/post-reaction';
import { ensureEmojiCatalogReady, getEmojiByCode } from '../emoji/emoji-catalog';
import {
  enrichPostReactionsView,
  loadPadletReactionsFromApi,
  removePostReactionOnApi,
  setPostReactionOnApi,
} from '../api/post-reaction-api';

const EMPTY_VIEW = (postId: string): PostReactionsView => ({
  postId,
  summaries: [],
  currentUserReactionCode: null,
});

interface UsePostReactionsOptions {
  padletId: string;
  postIds: string[];
  emojiCatalogReady: boolean;
}

export function usePostReactions({
  padletId,
  postIds,
  emojiCatalogReady,
}: UsePostReactionsOptions) {
  const [store, setStore] = useState<PadletReactionsStore>({});
  const postIdsKey = postIds.join(',');

  useEffect(() => {
    let isMounted = true;

    async function loadReactions() {
      try {
        const nextStore = await loadPadletReactionsFromApi(padletId);
        if (isMounted) {
          setStore(nextStore);
        }
      } catch {
        if (isMounted) {
          setStore({});
        }
      }
    }

    void loadReactions();

    return () => {
      isMounted = false;
    };
  }, [padletId, postIdsKey]);

  useEffect(() => {
    if (!emojiCatalogReady) {
      return;
    }

    setStore((current) => {
      const entries = Object.entries(current);
      if (entries.length === 0) {
        return current;
      }

      return Object.fromEntries(
        entries.map(([postId, view]) => [
          postId,
          enrichPostReactionsView(view),
        ]),
      );
    });
  }, [emojiCatalogReady]);

  const getPostReactions = useCallback(
    (postId: string): PostReactionsView => store[postId] ?? EMPTY_VIEW(postId),
    [store],
  );

  const setReaction = useCallback(
    async (postId: string, reactionCode: string) => {
      await ensureEmojiCatalogReady();

      if (!getEmojiByCode(reactionCode)) {
        return;
      }

      try {
        const view = await setPostReactionOnApi(padletId, postId, reactionCode);
        setStore((current) => ({
          ...current,
          [postId]: view,
        }));
      } catch {
        // Keep current UI state on failure.
      }
    },
    [padletId],
  );

  const removeReaction = useCallback(
    async (postId: string) => {
      try {
        const view = await removePostReactionOnApi(padletId, postId);
        setStore((current) => ({
          ...current,
          [postId]: view,
        }));
      } catch {
        // Keep current UI state on failure.
      }
    },
    [padletId],
  );

  return useMemo(
    () => ({
      getPostReactions,
      setReaction,
      removeReaction,
    }),
    [getPostReactions, removeReaction, setReaction],
  );
}
