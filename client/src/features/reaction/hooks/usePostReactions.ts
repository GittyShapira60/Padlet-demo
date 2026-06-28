import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  PadletReactionsStore,
  PostReactionsView,
  ReactionSummary,
} from '../types/post-reaction';
import {
  ensureEmojiCatalogReady,
  resolveEmojiByCode,
} from '@/modules/emoji';
import {
  enrichPostReactionsView,
  loadPadletReactionsFromApi,
  removePostReactionOnApi,
  setPostReactionOnApi,
} from '../api/post-reaction-api';
import { getSocket } from '../../../shared/services/socket.service';

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
    const socket = getSocket();
    if (!socket) return;

    const handleReactionUpdated = (data: { postId: string; summaries: Omit<ReactionSummary, 'glyph'>[] }) => {
      setStore((current: PadletReactionsStore) => {
        const existing = current[data.postId];
        const updated: PostReactionsView = {
          postId: data.postId,
          summaries: data.summaries.map((s) => ({ ...s, glyph: '' })),
          currentUserReactionCode: existing?.currentUserReactionCode ?? null,
        };
        return { ...current, [data.postId]: enrichPostReactionsView(updated) };
      });
    };

    const reregister = () => {
      socket.off('reaction:updated', handleReactionUpdated);
      socket.on('reaction:updated', handleReactionUpdated);
    };

    socket.on('reaction:updated', handleReactionUpdated);
    socket.on('connect', reregister);
    return () => {
      socket.off('connect', reregister);
      socket.off('reaction:updated', handleReactionUpdated);
    };
  }, []);

  useEffect(() => {
    if (!emojiCatalogReady) {
      return;
    }

    setStore((current: PadletReactionsStore) => {
      const entries = Object.entries(current);
      if (entries.length === 0) {
        return current;
      }

      return Object.fromEntries(
        entries.map(([postId, view]) => [
          postId,
          enrichPostReactionsView(view as PostReactionsView),
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

      if (!resolveEmojiByCode(reactionCode)) {
        return;
      }

      try {
        const view = await setPostReactionOnApi(padletId, postId, reactionCode);
        setStore((current: PadletReactionsStore) => ({
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
        setStore((current: PadletReactionsStore) => ({
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
