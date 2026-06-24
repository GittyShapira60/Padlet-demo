export interface PostLayout {
  x: number;
  y: number;
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

export interface Post {
  id: string;
  padletId: string;
  authorUsername: string;
  title: string | null;
  subject: string | null;
  color: string | null;
  layout: PostLayout | null;
  createdAt: string;
  poll: Poll | null;
}