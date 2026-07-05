import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthProvider';
import type { Post } from '../../post/interfaces/post';
import { deletePost, swapPosts } from '../../post/services/post-service';
import { swapPostLayouts } from '../../post/components/board-layouts/free_wall/free-wall-order';
import type { Padlet } from '../interfaces/padlet';
import { connectSocket } from '../../../shared/services/socket.service';
import {
  PadletPermission,
  type PadletPermission as PadletPermissionType,
} from '../enums/padlet-permission';
import { getPadletDetail, leavePadlet } from '../services/padlet-service';
import { mapApiPermission } from '../utils/padlet-capabilities';
import { recordVisit, updateVisitDuration } from '../../stats/services/stats-service';
import { PadletBoardType } from '../enums/padlet-board-type';

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
  const [currentUserPermission, setCurrentUserPermission] =
    useState<PadletPermissionType | null>(null);
  const [defaultPermission, setDefaultPermission] =
    useState<PadletPermissionType | null>(null);
  const [postPendingDelete, setPostPendingDelete] = useState<Post | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isLeavingPadlet, setIsLeavingPadlet] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [visitId, setVisitId] = useState<string | null>(null);
  const [timelineScrollPostId, setTimelineScrollPostId] = useState<string | null>(null);

  const visitIdRef = useRef<string | null>(null);
  const visitStartRef = useRef<number | null>(null);

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
    setTimelineScrollPostId(null);
  }, [padletId]);

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

        const visitResult = await recordVisit(currentPadletId).catch(() => null);
        if (visitResult && isMounted) {
          visitIdRef.current = visitResult.visitId;
          visitStartRef.current = Date.now();
          setVisitId(visitResult.visitId);
        }
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
      if (visitIdRef.current && visitStartRef.current) {
        const elapsed = Math.round((Date.now() - visitStartRef.current) / 1000);
        void updateVisitDuration(visitIdRef.current, elapsed).catch(() => {});
        visitIdRef.current = null;
        visitStartRef.current = null;
        setVisitId(null);
      }
    };
  }, [padletId]);

  useEffect(() => {
    if (!padletId) return;

    const socket = connectSocket();

    const joinPadlet = () => socket.emit('padlet:join', padletId);
    if (socket.connected) {
      joinPadlet();
    } else {
      socket.once('connect', joinPadlet);
    }

    const handlePostCreated = (post: Post) => {
      setPosts((prev: Post[]) => {
        if (prev.some((p: Post) => p.id === post.id)) return prev;
        setPadlet((curr: Padlet | null) => curr ? { ...curr, postCount: curr.postCount + 1 } : curr);
        return [...prev, post];
      });
    };

    const handlePostUpdated = (post: Post) => {
      setPosts((prev: Post[]) => prev.map((p: Post) => (p.id === post.id ? post : p)));
    };

    const handlePostDeleted = ({ postId }: { postId: string }) => {
      setPosts((prev: Post[]) => prev.filter((p: Post) => p.id !== postId));
      setPadlet((curr: Padlet | null) => curr ? { ...curr, postCount: Math.max(0, curr.postCount - 1) } : curr);
    };

    const handlePadletUpdated = (data: Padlet) => {
      setPadlet((curr: Padlet | null) => curr ? { ...curr, ...data } : curr);
    };

    const handlePadletDeleted = () => {
      navigate('/');
    };

    const handlePermissionChanged = ({ padletId: eventPadletId, permission }: { padletId: string; permission: string }) => {
      if (eventPadletId !== padletId) return;
      setCurrentUserPermission(mapApiPermission(permission));
    };

    const handleDefaultPermissionChanged = ({ defaultPermission }: { defaultPermission: string | null }) => {
      setDefaultPermission(defaultPermission ? mapApiPermission(defaultPermission) : PadletPermission.None);
    };

    socket.on('post:created', handlePostCreated);
    socket.on('post:updated', handlePostUpdated);
    socket.on('post:deleted', handlePostDeleted);
    socket.on('padlet:updated', handlePadletUpdated);
    socket.on('padlet:deleted', handlePadletDeleted);
    socket.on('permission:changed', handlePermissionChanged);
    socket.on('padlet:permission-changed', handleDefaultPermissionChanged);

    return () => {
      socket.off('connect', joinPadlet);
      socket.emit('padlet:leave', padletId);
      socket.off('post:created', handlePostCreated);
      socket.off('post:updated', handlePostUpdated);
      socket.off('post:deleted', handlePostDeleted);
      socket.off('padlet:updated', handlePadletUpdated);
      socket.off('padlet:deleted', handlePadletDeleted);
      socket.off('permission:changed', handlePermissionChanged);
      socket.off('padlet:permission-changed', handleDefaultPermissionChanged);
    };
  }, [padletId, navigate]);

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
    const isNewPost = !posts.some((item) => item.id === post.id);
    const shouldScrollTimeline = isNewPost && padlet?.boardType === PadletBoardType.Timeline;

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

    if (shouldScrollTimeline) {
      setTimelineScrollPostId(post.id);
    }
  }, [padlet?.boardType, posts]);

  const clearTimelineScrollPost = useCallback(() => {
    setTimelineScrollPostId(null);
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
    if (!padletId || !postPendingDelete) {
      return;
    }

    setIsDeletingPost(true);

    try {
      await deletePost(padletId, postPendingDelete.id);
      setPostPendingDelete(null);
    } catch {
      setError('מחיקת הפוסט נכשלה, נסי שוב');
    } finally {
      setIsDeletingPost(false);
    }
  }, [padletId, postPendingDelete]);

  const handlePostSwap = useCallback(
    async (sourcePostId: string, targetPostId: string) => {
      if (!padletId) {
        return;
      }

      let previousPosts: Post[] = [];

      setPosts((current: Post[]) => {
        previousPosts = current;
        return swapPostLayouts(current, sourcePostId, targetPostId);
      });

      try {
        const { source, target } = await swapPosts(padletId, sourcePostId, targetPostId);
        setPosts((current) =>
          current.map((item) => {
            if (item.id === source.id) return source;
            if (item.id === target.id) return target;
            return item;
          }),
        );
      } catch {
        setPosts(previousPosts);
        setError('החלפת מיקום הפוסטים נכשלה');
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
    visitId,
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
    currentUserPermission,
    defaultPermission,
    setDefaultPermission,
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
    timelineScrollPostId,
    clearTimelineScrollPost,
    handleRequestDeletePost,
    handleCancelDeletePost,
    handleConfirmDeletePost,
    handlePostSwap,
    handleOpenLeave,
    handleCancelLeave,
    handleConfirmLeave,
  };
}
