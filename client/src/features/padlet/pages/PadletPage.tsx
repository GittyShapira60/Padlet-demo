import { useEffect } from 'react';
import ConfirmDialog from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import CreatePostFab from '../../post/components/CreatePostFab/CreatePostFab';
import CreatePostModal from '../../post/components/CreatePostModal/CreatePostModal';
import { PostReactionsProvider } from '../../reaction';
import PadletPostsLayer from '../../post/components/PadletPostsLayer/PadletPostsLayer';
import PadletBoardHeader from '../components/PadletBoardHeader/PadletBoardHeader';
import SharePadletModal from '../components/SharePadletModal/SharePadletModal';
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
  background: string | null;
  title: string;
  isShared: boolean;
}

function PadletBoardBody({
  padletId,
  boardType,
  background,
  title,
  isShared,
  posts,
  isCreatePostOpen,
  isShareOpen,
  postToEdit,
  postPendingDelete,
  isDeletingPost,
  isLeaveOpen,
  isLeavingPadlet,
  currentUsername,
  defaultPermission,
  setDefaultPermission,
  handleBack,
  handleCreatePost,
  handleClosePostModal,
  handleOpenShare,
  handleCloseShare,
  handlePostSaved,
  handleEditPost,
  handleRequestDeletePost,
  handleCancelDeletePost,
  handleConfirmDeletePost,
  handleLayoutChange,
  handleOpenLeave,
  handleCancelLeave,
  handleConfirmLeave,
}: PadletBoardBodyProps) {
  const capabilities = usePadletCapabilities();

  useEffect(() => {
    if (!capabilities.canShare && isShareOpen) {
      handleCloseShare();
    }
  }, [capabilities.canShare, handleCloseShare, isShareOpen]);

  return (
    <div
      className={styles.page}
      style={{ background: background ?? '#f3f4f6' }}
    >
      <PadletBoardHeader
        title={title}
        isShared={isShared}
        onBack={handleBack}
        onShareClick={handleOpenShare}
        showShare={capabilities.canShare}
        onLeaveClick={handleOpenLeave}
      />

      <PostReactionsProvider
        padletId={padletId}
        postIds={posts.map((post) => post.id)}
        canReact={capabilities.canReact}
      >
        <PadletPostsLayer
          boardType={boardType}
          posts={posts}
          onEditPost={handleEditPost}
          onDeletePost={handleRequestDeletePost}
          onLayoutChange={(postId, layout) =>
            void handleLayoutChange(postId, layout)
          }
        />
      </PostReactionsProvider>

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

      {isCreatePostOpen ? (
        <CreatePostModal
          padletId={padletId}
          postToEdit={postToEdit}
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
          tone="danger"
          isPending={isDeletingPost}
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
        background={padlet.background}
        title={padlet.title}
        isShared={padlet.isShared}
      />
    </PadletCapabilitiesProvider>
  );
}
