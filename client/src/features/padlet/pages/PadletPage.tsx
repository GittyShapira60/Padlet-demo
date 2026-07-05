import type { CSSProperties } from 'react';
import { useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppOutletContext } from '../../../App';
import { isLightBackground } from '../../../shared/constants/background-colors';
import { formatRelativeTime } from '../../../shared/utils/format-relative-time';
import CreatePostFab from '../../post/components/CreatePostFab/CreatePostFab';
import CreatePostModal from '../../post/components/CreatePostModal/CreatePostModal';
import { PostReactionsProvider } from '../../reaction';
import PadletPostsLayer from '../../post/components/PadletPostsLayer/PadletPostsLayer';
import ConfirmDialog from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import { PollProvider } from '../../post/context/PollContext';
import EditPadletModal from '../components/EditPadletModal/EditPadletModal';
import SharePadletModal from '../components/SharePadletModal/SharePadletModal';
import PadletHeaderActions from '../components/PadletHeaderActions/PadletHeaderActions';
import {
  PadletCapabilitiesProvider,
  usePadletCapabilities,
} from '../context/PadletCapabilitiesContext';
import { PadletPermission } from '../enums/padlet-permission';
import { PADLET_PAGE_TEXTS } from './PadletPage.consts';
import styles from './PadletPage.module.css';
import { usePadletPage } from './usePadletPage';

type PadletPageState = ReturnType<typeof usePadletPage>;

interface PadletBoardBodyProps extends PadletPageState {
  padletId: string;
  boardType: NonNullable<PadletPageState['padlet']>['boardType'];
  title: string;
  isShared: boolean;
}

function PadletBoardBody({
  padletId,
  boardType,
  title,
  isShared,
  padlet,
  filteredPosts,
  setFilterSearch,
  setFilterAuthor,
  isCreatePostOpen,
  isShareOpen,
  isEditOpen,
  postToEdit,
  visitId,
  postPendingDelete,
  isDeletingPost,
  isLeaveOpen,
  isLeavingPadlet,
  currentUsername,
  defaultPermission,
  setDefaultPermission,
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
}: PadletBoardBodyProps) {
  const capabilities = usePadletCapabilities();
  const { setHeaderBackground, setHeaderActionSlot } = useOutletContext<AppOutletContext>();

  useEffect(() => {
    if (padlet) {
      setHeaderBackground(padlet.background ?? null);
    }
    return () => {
      setHeaderBackground(null);
    };
  }, [padlet, setHeaderBackground]);

  useEffect(() => {
    if (!capabilities.canShare && isShareOpen) {
      handleCloseShare();
    }
  }, [capabilities.canShare, handleCloseShare, isShareOpen]);

  const showMenu =
    capabilities.canEditPadlet || capabilities.canShare || isShared;
  const hasPosts = (padlet?.postCount ?? 0) > 0;

  const pageVars = useMemo(
    () =>
      (isLightBackground(padlet?.background)
        ? { '--title-color': '#334155', '--header-icon-color': '#334155', '--header-btn-bg': 'rgba(255, 255, 255, 0.22)', '--header-btn-bg-hover': 'rgba(255, 255, 255, 0.35)', '--header-btn-border': 'rgba(255, 255, 255, 0.4)' }
        : { '--title-color': '#ffffff', '--header-icon-color': '#ffffff', '--header-btn-bg': 'rgba(0, 0, 0, 0.18)', '--header-btn-bg-hover': 'rgba(0, 0, 0, 0.3)', '--header-btn-border': 'rgba(255, 255, 255, 0.15)' }) as CSSProperties,
    [padlet?.background],
  );

  useEffect(() => {
    setHeaderActionSlot(
      <PadletHeaderActions
        showMenu={showMenu}
        canEditPadlet={capabilities.canEditPadlet}
        canShare={capabilities.canShare}
        isShared={isShared}
        onEdit={handleOpenEdit}
        onShare={handleOpenShare}
        onLeave={handleOpenLeave}
        hasPosts={hasPosts}
        onSearchChange={setFilterSearch}
        onAuthorChange={setFilterAuthor}
      />,
    );
    return () => setHeaderActionSlot(null);
  }, [
    setHeaderActionSlot,
    showMenu,
    capabilities.canEditPadlet,
    capabilities.canShare,
    isShared,
    handleOpenEdit,
    handleOpenShare,
    handleOpenLeave,
    hasPosts,
    setFilterSearch,
    setFilterAuthor,
  ]);

  return (
    <div className={styles.page} style={pageVars}>
      <div className={styles.titleRow}>
        {padlet ? (
          <p className={styles.boardMeta}>
            {padlet.ownerUsername} · {formatRelativeTime(padlet.createdAt)}
          </p>
        ) : null}
        <h1 className={styles.boardTitle}>{title}</h1>
      </div>

      <PollProvider padletId={padletId} onVoteSuccess={handlePostSaved}>
        <PostReactionsProvider
          padletId={padletId}
          postIds={filteredPosts.map((post) => post.id)}
          canReact={capabilities.canReact}
        >
          <PadletPostsLayer
            padletId={padletId}
            boardType={boardType}
            posts={filteredPosts}
            timelineScrollPostId={timelineScrollPostId}
            onTimelineScrollComplete={clearTimelineScrollPost}
            onEditPost={handleEditPost}
            onDeletePost={(post) => void handleRequestDeletePost(post)}
            onPostSwap={(sourcePostId, targetPostId) =>
              void handlePostSwap(sourcePostId, targetPostId)
            }
          />
        </PostReactionsProvider>
      </PollProvider>

      {capabilities.canCreatePost ? (
        <CreatePostFab onClick={handleCreatePost} />
      ) : null}

      {isShareOpen ? (
        <SharePadletModal
          padletId={padletId}
          currentUsername={currentUsername}
          initialDefaultPermission={defaultPermission ?? PadletPermission.Viewer}
          onDefaultPermissionChange={setDefaultPermission}
          onClose={handleCloseShare}
        />
      ) : null}

      {isEditOpen && padlet ? (
        <EditPadletModal
          padlet={padlet}
          onClose={handleCloseEdit}
          onSubmit={handlePadletUpdated}
        />
      ) : null}

      {isCreatePostOpen ? (
        <CreatePostModal
          padletId={padletId}
          postToEdit={postToEdit}
          visitId={visitId}
          onClose={handleClosePostModal}
          onSubmit={handlePostSaved}
        />
      ) : null}

      {postPendingDelete ? (
        <ConfirmDialog
          title={PADLET_PAGE_TEXTS.deletePost.title}
          description={PADLET_PAGE_TEXTS.deletePost.description}
          confirmLabel={PADLET_PAGE_TEXTS.deletePost.confirmLabel}
          pendingLabel={PADLET_PAGE_TEXTS.deletePost.pendingLabel}
          isPending={isDeletingPost}
          tone="danger"
          onConfirm={() => void handleConfirmDeletePost()}
          onCancel={handleCancelDeletePost}
        />
      ) : null}

      {isLeaveOpen ? (
        <ConfirmDialog
          title={PADLET_PAGE_TEXTS.leaveBoard.title}
          description={PADLET_PAGE_TEXTS.leaveBoard.description(title)}
          confirmLabel={PADLET_PAGE_TEXTS.leaveBoard.confirmLabel}
          pendingLabel={PADLET_PAGE_TEXTS.leaveBoard.pendingLabel}
          tone="danger"
          isPending={isLeavingPadlet}
          onConfirm={() => void handleConfirmLeave()}
          onCancel={handleCancelLeave}
        />
      ) : null}
    </div>
  );
}

export default function PadletPage() {
  const page = usePadletPage();
  const {
    padlet,
    isLoading,
    error,
    currentUsername,
    currentUserPermission,
    handleBack,
  } = page;

  if (isLoading) {
    return <p className={styles.status}>{PADLET_PAGE_TEXTS.loading}</p>;
  }

  if (error || !padlet || !currentUserPermission) {
    return (
      <div className={styles.error}>
        <p className={styles.errorText}>
          {error || PADLET_PAGE_TEXTS.boardNotFound}
        </p>
        <button type="button" className={styles.backOnly} onClick={handleBack}>
          {PADLET_PAGE_TEXTS.backToHome}
        </button>
      </div>
    );
  }

  return (
    <PadletCapabilitiesProvider
      permission={currentUserPermission}
      currentUsername={currentUsername}
    >
      <PadletBoardBody
        {...page}
        padletId={padlet.id}
        boardType={padlet.boardType}
        title={padlet.title}
        isShared={padlet.isShared}
      />
    </PadletCapabilitiesProvider>
  );
}
