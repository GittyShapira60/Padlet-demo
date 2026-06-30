import { useCallback, useEffect, useState } from 'react';
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from '../services/comment-service';
import type { Comment } from '../types/comment';
import { connectSocket } from '../../../shared/services/socket.service';

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

  useEffect(() => {
    const socket = connectSocket();
    if (!enabled) return;

    const handleCreated = (data: { postId: string; comment: Comment }) => {
      if (data.postId !== postId) return;
      setComments((current) => {
        if (current.some((c) => c.id === data.comment.id)) return current;
        return [...current, data.comment];
      });
    };

    const handleUpdated = (data: { postId: string; comment: Comment }) => {
      if (data.postId !== postId) return;
      setComments((current) =>
        current.map((c) => (c.id === data.comment.id ? data.comment : c)),
      );
    };

    const handleDeleted = (data: { postId: string; commentId: string }) => {
      if (data.postId !== postId) return;
      setComments((current) => current.filter((c) => c.id !== data.commentId));
    };

    socket.on('comment:created', handleCreated);
    socket.on('comment:updated', handleUpdated);
    socket.on('comment:deleted', handleDeleted);

    return () => {
      socket.off('comment:created', handleCreated);
      socket.off('comment:updated', handleUpdated);
      socket.off('comment:deleted', handleDeleted);
    };
  }, [enabled, postId]);

  const sendComment = useCallback(
    async (body: string) => {
      try {
        await createComment(padletId, postId, body);
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
        await updateComment(padletId, postId, commentId, body);
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
