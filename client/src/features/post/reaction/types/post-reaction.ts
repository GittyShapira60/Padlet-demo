export interface ReactionReactor {
  userId: string;
  username: string;
}

export interface ReactionSummary {
  reactionCode: string;
  glyph: string;
  count: number;
  reactors: ReactionReactor[];
}

export interface PostReactionsView {
  postId: string;
  summaries: ReactionSummary[];
  currentUserReactionCode: string | null;
}

export interface PadletReactionsResponse {
  reactions: PostReactionsView[];
}

export type PadletReactionsStore = Record<string, PostReactionsView>;
