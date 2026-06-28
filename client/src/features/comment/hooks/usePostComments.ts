import { useCallback, useEffect, useState } from 'react';
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from '../services/comment-service';
import type { Comment } from '../types/comment';

const ERROR_MESSAGES = {
  load: 'טעינת התגובות נכשלה',
  send: 'שליחת התגובה נכשלה, נסי שוב',
  edit: 'עדכון התגובה נכשל, נסי שוב',
  delete: 'מחיקת התגובה נכשלה, נסי שוב',
} as const;

export function usePostComments(
  padletId: string,
  postId: string,
  enabled = true,
) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) {
      setComments([]);
      setError('');
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        const data = await listComments(padletId, postId);
        if (isMounted) {
          setComments(data);
          setError('');
        }
      } catch {
        if (isMounted) {
          setComments([]);
          setError(ERROR_MESSAGES.load);
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
      try {
        const comment = await createComment(padletId, postId, body);
        setComments((current) => [...current, comment]);
        setError('');
      } catch {
        setError(ERROR_MESSAGES.send);
        throw new Error(ERROR_MESSAGES.send);
      }
    },
    [padletId, postId],
  );

  const removeComment = useCallback(
    async (commentId: string) => {
      try {
        await deleteComment(padletId, postId, commentId);
        setComments((current) =>
          current.filter((comment) => comment.id !== commentId),
        );
        setError('');
      } catch {
        setError(ERROR_MESSAGES.delete);
        throw new Error(ERROR_MESSAGES.delete);
      }
    },
    [padletId, postId],
  );

  const editComment = useCallback(
    async (commentId: string, body: string) => {
      try {
        const updated = await updateComment(padletId, postId, commentId, body);
        setComments((current) =>
          current.map((comment) =>
            comment.id === commentId ? updated : comment,
          ),
        );
        setError('');
      } catch {
        setError(ERROR_MESSAGES.edit);
        throw new Error(ERROR_MESSAGES.edit);
      }
    },
    [padletId, postId],
  );

  return { comments, error, sendComment, removeComment, editComment };
}
