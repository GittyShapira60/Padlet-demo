import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Padlet } from '../../interfaces/padlet';
import type { Post } from '../../interfaces/post';
import { useAuth } from '../../providers/AuthProvider';
import { getPadletDetail } from '../../services/padlet-service';

export function usePadletPage() {
  const { padletId } = useParams<{ padletId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [padlet, setPadlet] = useState<Padlet | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const authorUsername = user?.username ?? 'משתמש';

  useEffect(() => {
    if (!padletId) {
      setError('לוח לא נמצא');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadPadlet() {
      setIsLoading(true);
      setError('');

      try {
        const detail = await getPadletDetail(padletId);

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
    setIsCreatePostOpen(true);
  }, []);

  const handleCloseCreatePost = useCallback(() => {
    setIsCreatePostOpen(false);
  }, []);

  const handlePostCreated = useCallback((post: Post) => {
    setPosts((current) => [...current, post]);
    setPadlet((current) =>
      current
        ? { ...current, postCount: current.postCount + 1 }
        : current,
    );
  }, []);

  return {
    padlet,
    posts,
    isLoading,
    error,
    isCreatePostOpen,
    authorUsername,
    handleBack,
    handleCreatePost,
    handleCloseCreatePost,
    handlePostCreated,
  };
}
