export interface PostLayout {
  order: number;
}

export interface PollOption {
  id: string;
  label: string;
  sortOrder: number;
  voteCount: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId: string | null;
}

export type PostType = 'text' | 'image' | 'link' | 'poll';

export interface Post {
  id: string;
  padletId: string;
  authorUsername: string;
  postType: PostType;
  title: string | null;
  subject: string | null;
  description: string | null;
  color: string | null;
  layout: PostLayout | null;
  createdAt: string;
  poll: Poll | null;
  imageUrl: string | null;
}
