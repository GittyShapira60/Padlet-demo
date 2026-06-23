import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthProvider';
import type { Post, PostLayout } from '../../post/interfaces/post';
import {
  deletePost,
  updatePostLayout,
} from '../../post/services/post-service';
import type { Padlet } from '../interfaces/padlet';
import {
  PadletPermission,
  type PadletPermission as PadletPermissionType,
} from '../enums/padlet-permission';
import { getPadletDetail } from '../services/padlet-service';
import { mapApiPermission } from '../utils/padlet-capabilities';

export function usePadletPage() {
  const { padletId } = useParams<{ padletId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [padlet, setPadlet] = useState<Padlet | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [currentUserPermission, setCurrentUserPermission] =
    useState<PadletPermissionType | null>(null);
  const [defaultPermission, setDefaultPermission] =
    useState<PadletPermissionType | null>(null);

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
        setCurrentUserPermission(mapApiPermission(detail.currentUserPermission));
        setDefaultPermission(
          detail.defaultPermission
            ? mapApiPermission(detail.defaultPermission)
            : PadletPermission.None,
        );
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
  }, [padletId, user?.id]);

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

  const handleOpenShare = useCallback(() => {
    setIsShareOpen(true);
  }, []);

  const handleCloseShare = useCallback(() => {
    setIsShareOpen(false);
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
      if (!padletId || !padlet) {
        return;
      }

      const confirmed = window.confirm('למחוק את הפוסט?');

      if (!confirmed) {
        return;
      }

      try {
        const remainingPosts = await deletePost(padletId, post.id);
        setPosts(remainingPosts);
        setPadlet((current) =>
          current
            ? { ...current, postCount: remainingPosts.length }
            : current,
        );
      } catch {
        setError('מחיקת הפוסט נכשלה, נסי שוב');
      }
    },
    [padlet, padletId],
  );

  const handleLayoutChange = useCallback(
    async (postId: string, layout: PostLayout) => {
      if (!padletId) {
        return;
      }

      try {
        const updatedPost = await updatePostLayout(padletId, postId, layout);
        setPosts((current) =>
          current.map((item) => (item.id === postId ? updatedPost : item)),
        );
      } catch {
        setError('עדכון מיקום הפוסט נכשל');
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
    isShareOpen,
    postToEdit,
    currentUsername,
    currentUserPermission,
    defaultPermission,
    setDefaultPermission,
    handleBack,
    handleCreatePost,
    handleClosePostModal,
    handleOpenShare,
    handleCloseShare,
    handlePostSaved,
    handleEditPost,
    handleDeletePost,
    handleLayoutChange,
  };
}
