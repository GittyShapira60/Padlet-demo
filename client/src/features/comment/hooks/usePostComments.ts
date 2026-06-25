import { useCallback, useEffect, useState } from 'react';
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from '../services/comment-service';
import type { Comment } from '../types/comment';

export function usePostComments(
  padletId: string,
  postId: string,
  enabled = true,
) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!enabled) {
      setComments([]);
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        const data = await listComments(padletId, postId);
        if (isMounted) {
          setComments(data);
        }
      } catch {
        if (isMounted) {
          setComments([]);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [enabled, padletId, postId]);

  const sendComment = useCallback(
    async (body: string) => {
      const comment = await createComment(padletId, postId, body);
      setComments((current) => [...current, comment]);
    },
    [padletId, postId],
  );

  const removeComment = useCallback(
    async (commentId: string) => {
      await deleteComment(padletId, postId, commentId);
      setComments((current) =>
        current.filter((comment) => comment.id !== commentId),
      );
    },
    [padletId, postId],
  );

  const editComment = useCallback(
    async (commentId: string, body: string) => {
      const updated = await updateComment(padletId, postId, commentId, body);
      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId ? updated : comment,
        ),
      );
    },
    [padletId, postId],
  );

  return { comments, sendComment, removeComment, editComment };
}
