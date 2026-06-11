import type { Post } from '../interfaces/post';
import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../enums/post-content-tab';
import { httpClient } from './http-client';

export interface CreatePostInput {
  color: string;
  contentTab: PostContentTab;
  content?: string;
  imageFileName?: string;
}

const createdPosts = new Map<string, Post[]>();

function getPadletPostsStore(padletId: string): Post[] {
  if (!createdPosts.has(padletId)) {
    createdPosts.set(padletId, []);
  }

  return createdPosts.get(padletId)!;
}

function buildMockPost(
  padletId: string,
  input: CreatePostInput,
  authorUsername: string,
): Post {
  const existingCount = getPadletPostsStore(padletId).length;

  let title: string | null = null;
  let subject: string | null = null;

  switch (input.contentTab) {
    case PostContentTabValues.Text:
      subject = input.content ?? null;
      break;
    case PostContentTabValues.Image:
      title = 'תמונה';
      subject = input.imageFileName ?? null;
      break;
    case PostContentTabValues.Link:
      title = 'קישור';
      subject = input.content ?? null;
      break;
    case PostContentTabValues.Poll:
      title = input.content ?? null;
      subject = 'סקר';
      break;
  }

  return {
    id: `post-${Date.now()}`,
    padletId,
    authorUsername,
    title,
    subject,
    color: input.color,
    layout: {
      x: 8 + (existingCount % 3) * 26,
      y: 12 + Math.floor(existingCount / 3) * 20,
    },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Creates a post on a padlet board.
 * Falls back to local mock until POST /padlets/:id/posts exists on the server.
 */
export async function createPost(
  padletId: string,
  input: CreatePostInput,
  authorUsername: string,
): Promise<Post> {
  try {
    return await httpClient<Post>(`padlets/${padletId}/posts`, {
      method: 'POST',
      body: {
        color: input.color,
        content_kind: input.contentTab,
        content: input.content,
        image_file_name: input.imageFileName,
      },
    });
  } catch {
    const post = buildMockPost(padletId, input, authorUsername);
    getPadletPostsStore(padletId).push(post);
    return post;
  }
}

export function getStoredPostsForPadlet(padletId: string): Post[] {
  return [...getPadletPostsStore(padletId)];
}

export function seedPostsForPadlet(padletId: string, posts: Post[]): void {
  const store = getPadletPostsStore(padletId);
  const existingIds = new Set(store.map((post) => post.id));

  for (const post of posts) {
    if (!existingIds.has(post.id)) {
      store.push(post);
    }
  }
}
