import type { Post } from '../../../interfaces/post';

/** Sorts free-wall posts by stored order, falling back to creation time. */
export function sortFreeWallPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const orderA = a.layout?.order;
    const orderB = b.layout?.order;

    if (orderA != null && orderB != null) {
      return orderA - orderB;
    }

    if (orderA != null) {
      return -1;
    }

    if (orderB != null) {
      return 1;
    }

    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function swapPostLayouts(posts: Post[], sourceId: string, targetId: string): Post[] {
  const ordered = sortFreeWallPosts(posts);
  const sourceIndex = ordered.findIndex((post) => post.id === sourceId);
  const targetIndex = ordered.findIndex((post) => post.id === targetId);

  if (sourceIndex < 0 || targetIndex < 0) {
    return posts;
  }

  const withOrders = ordered.map((post, index) => ({
    ...post,
    layout: post.layout ?? { order: index },
  }));

  const sourceOrder = withOrders[sourceIndex].layout!.order;
  const targetOrder = withOrders[targetIndex].layout!.order;

  return posts.map((post) => {
    if (post.id === sourceId) {
      return { ...post, layout: { order: targetOrder } };
    }

    if (post.id === targetId) {
      return { ...post, layout: { order: sourceOrder } };
    }

    return post;
  });
}
