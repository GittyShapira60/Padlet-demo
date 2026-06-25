import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthProvider';
import type { Post, PostLayout } from '../../post/interfaces/post';
import { deletePost, updatePostLayout } from '../../post/services/post-service';
import type { Padlet } from '../interfaces/padlet';
import { getPadletDetail, leavePadlet } from '../services/padlet-service';

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [postPendingDelete, setPostPendingDelete] = useState<Post | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isLeavingPadlet, setIsLeavingPadlet] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');

  const currentUsername = user?.username;

  const filteredPosts = useMemo(() => {
    const search = filterSearch.trim().toLowerCase();
    const author = filterAuthor.trim().toLowerCase();
    return posts.filter((post: Post) => {
      const matchesSearch =
        !search ||
        post.title?.toLowerCase().includes(search) ||
        post.subject?.toLowerCase().includes(search);
      const matchesAuthor =
        !author || post.authorUsername.toLowerCase().includes(author);
      return matchesSearch && matchesAuthor;
    });
  }, [posts, filterSearch, filterAuthor]);

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

  const handleOpenShare = useCallback(() => {
    setIsShareOpen(true);
  }, []);

  const handleCloseShare = useCallback(() => {
    setIsShareOpen(false);
  }, []);

  const handleOpenEdit = useCallback(() => {
    setIsEditOpen(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setIsEditOpen(false);
  }, []);

  const handlePadletUpdated = useCallback((updated: Padlet) => {
    setPadlet((current) => (current ? { ...current, ...updated } : updated));
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

  const handleRequestDeletePost = useCallback((post: Post) => {
    setPostPendingDelete(post);
  }, []);

  const handleCancelDeletePost = useCallback(() => {
    if (isDeletingPost) {
      return;
    }
    setPostPendingDelete(null);
  }, [isDeletingPost]);

  const handleConfirmDeletePost = useCallback(async () => {
    if (!padletId || !padlet || !postPendingDelete) {
      return;
    }

    setIsDeletingPost(true);

    try {
      const remainingPosts = await deletePost(padletId, postPendingDelete.id);
      setPosts(remainingPosts);
      setPadlet((current) =>
        current
          ? { ...current, postCount: remainingPosts.length }
          : current,
      );
      setPostPendingDelete(null);
    } catch {
      setError('מחיקת הפוסט נכשלה, נסי שוב');
    } finally {
      setIsDeletingPost(false);
    }
  }, [padlet, padletId, postPendingDelete]);

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

  const handleOpenLeave = useCallback(() => {
    setIsLeaveOpen(true);
  }, []);

  const handleCancelLeave = useCallback(() => {
    if (isLeavingPadlet) {
      return;
    }
    setIsLeaveOpen(false);
  }, [isLeavingPadlet]);

  const handleConfirmLeave = useCallback(async () => {
    if (!padletId) {
      return;
    }

    setIsLeavingPadlet(true);

    try {
      await leavePadlet(padletId);
      navigate('/');
    } catch {
      setError('לא הצלחנו לעזוב את הלוח, נסי שוב');
      setIsLeavingPadlet(false);
      setIsLeaveOpen(false);
    }
  }, [navigate, padletId]);

  return {
    padlet,
    posts,
    filteredPosts,
    filterSearch,
    setFilterSearch,
    filterAuthor,
    setFilterAuthor,
    isLoading,
    error,
    isCreatePostOpen,
    isShareOpen,
    isEditOpen,
    postToEdit,
    postPendingDelete,
    isDeletingPost,
    isLeaveOpen,
    isLeavingPadlet,
    currentUsername,
    handleBack,
    handleCreatePost,
    handleClosePostModal,
    handleOpenShare,
    handleCloseShare,
    handleOpenEdit,
    handleCloseEdit,
    handlePadletUpdated,
    handlePostSaved,
    handleEditPost,
    handleRequestDeletePost,
    handleCancelDeletePost,
    handleConfirmDeletePost,
    handleLayoutChange,
    handleOpenLeave,
    handleCancelLeave,
    handleConfirmLeave,
  };
}