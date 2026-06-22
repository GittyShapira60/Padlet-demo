import {
  getPadletReactions,
  removePostReaction,
  setPostReaction,
} from '../services/reaction-service';
import { resolveEmojiByCode, saveRecentEmojiCode } from '@/modules/emoji';
import type {
  PadletReactionsStore,
  PostReactionsView,
} from '../types/post-reaction';

export function enrichPostReactionsView(
  view: PostReactionsView,
): PostReactionsView {
  return {
    ...view,
    summaries: view.summaries.map((summary) => ({
      ...summary,
      reactors: summary.reactors ?? [],
      glyph: resolveEmojiByCode(summary.reactionCode)?.glyph ?? '❓',
    })),
  };
}

export function reactionsToStore(
  reactions: PostReactionsView[],
): PadletReactionsStore {
  return Object.fromEntries(
    reactions.map((reaction) => [
      reaction.postId,
      enrichPostReactionsView(reaction),
    ]),
  );
}

export async function loadPadletReactionsFromApi(
  padletId: string,
): Promise<PadletReactionsStore> {
  const response = await getPadletReactions(padletId);
  return reactionsToStore(response.reactions);
}

export async function setPostReactionOnApi(
  padletId: string,
  postId: string,
  reactionCode: string,
): Promise<PostReactionsView> {
  const view = await setPostReaction(padletId, postId, reactionCode);
  saveRecentEmojiCode(reactionCode);
  return enrichPostReactionsView(view);
}

export async function removePostReactionOnApi(
  padletId: string,
  postId: string,
): Promise<PostReactionsView> {
  const view = await removePostReaction(padletId, postId);
  return enrichPostReactionsView(view);
}
