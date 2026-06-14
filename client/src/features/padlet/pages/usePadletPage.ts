import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthProvider';
import type { Post } from '../../post/interfaces/post';
import { deletePost } from '../../post/services/post-service';
import type { Padlet } from '../interfaces/padlet';
import { getPadletDetail } from '../services/padlet-service';

export function usePadletPage() {
  const { padletId } = useParams<{ padletId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [padlet, setPadlet] = useState<Padlet | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  const currentUsername = user?.username;

  useEffect(() => {
    if (!padletId) {
      setError('לוח לא נמצא');
      setIsLoading(false);
      return;
    }

    const currentPadletId = padletId;
    let isMounted = true;

    async function loadPadlet() {
      setIsLoading(true);
      setError('');

      try {
        const detail = await getPadletDetail(currentPadletId);

        if (!isMounted) {
          return;
        }

        if (!detail) {
          setError('לוח לא נמצא');
          setPadlet(null);
          setPosts([]);
          return;
        }

        setPadlet(detail.padlet);
        setPosts(detail.posts);
      } catch {
        if (isMounted) {
          setError('לא הצלחנו לטעון את הלוח');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPadlet();

    return () => {
      isMounted = false;
    };
  }, [padletId]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleCreatePost = useCallback(() => {
    setPostToEdit(null);
    setIsCreatePostOpen(true);
  }, []);

  const handleClosePostModal = useCallback(() => {
    setIsCreatePostOpen(false);
    setPostToEdit(null);
  }, []);

  const handlePostSaved = useCallback((post: Post) => {
    setPosts((current) => {
      const existingIndex = current.findIndex((item) => item.id === post.id);

      if (existingIndex === -1) {
        setPadlet((padletCurrent) =>
          padletCurrent
            ? { ...padletCurrent, postCount: padletCurrent.postCount + 1 }
            : padletCurrent,
        );
        return [...current, post];
      }

      return current.map((item) => (item.id === post.id ? post : item));
    });
  }, []);

  const handleEditPost = useCallback((post: Post) => {
    setPostToEdit(post);
    setIsCreatePostOpen(true);
  }, []);

  const handleDeletePost = useCallback(
    async (post: Post) => {
      if (!padletId) {
        return;
      }

      const confirmed = window.confirm('למחוק את הפוסט?');

      if (!confirmed) {
        return;
      }

      try {
        await deletePost(padletId, post.id);
        setPosts((current) => current.filter((item) => item.id !== post.id));
        setPadlet((current) =>
          current
            ? { ...current, postCount: Math.max(0, current.postCount - 1) }
            : current,
        );
      } catch {
        setError('מחיקת הפוסט נכשלה, נסי שוב');
      }
    },
    [padletId],
  );

  return {
    padlet,
    posts,
    isLoading,
    error,
    isCreatePostOpen,
    postToEdit,
    currentUsername,
    handleBack,
    handleCreatePost,
    handleClosePostModal,
    handlePostSaved,
    handleEditPost,
    handleDeletePost,
  };
}
