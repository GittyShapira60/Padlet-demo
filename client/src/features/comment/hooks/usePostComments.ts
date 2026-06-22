import { useCallback, useEffect, useState } from 'react';
import {
  createComment,
  listComments,
} from '../services/comment-service';
import type { Comment } from '../types/comment';

export function usePostComments(padletId: string, postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
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
  }, [padletId, postId]);

  const sendComment = useCallback(
    async (body: string) => {
      const comment = await createComment(padletId, postId, body);
      setComments((current) => [...current, comment]);
    },
    [padletId, postId],
  );

  return { comments, sendComment };
}
