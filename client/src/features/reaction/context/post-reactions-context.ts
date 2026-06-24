import { createContext, useContext } from 'react';
import type { PostReactionsView } from '../types/post-reaction';

export interface PostReactionsContextValue {
  canReact: boolean;
  emojiCatalogReady: boolean;
  getPostReactions: (postId: string) => PostReactionsView;
  setReaction: (postId: string, reactionCode: string) => void | Promise<void>;
  removeReaction: (postId: string) => void | Promise<void>;
}

export const PostReactionsContext =
  createContext<PostReactionsContextValue | null>(null);

export function usePostReactionsContext(): PostReactionsContextValue {
  const context = useContext(PostReactionsContext);
  if (!context) {
    throw new Error(
      'usePostReactionsContext must be used within PostReactionsProvider',
    );
  }

  return context;
}
