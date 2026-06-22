import ConfirmDialog from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import CreatePostFab from '../../post/components/CreatePostFab/CreatePostFab';
import CreatePostModal from '../../post/components/CreatePostModal/CreatePostModal';
import PadletPostsLayer from '../../post/components/PadletPostsLayer/PadletPostsLayer';
import PadletBoardHeader from '../components/PadletBoardHeader/PadletBoardHeader';
import SharePadletModal from '../components/SharePadletModal/SharePadletModal';
import { PADLET_PAGE_TEXTS } from './PadletPage.consts';
import styles from './PadletPage.module.css';
import { usePadletPage } from './usePadletPage';

export default function PadletPage() {
  const {
    padlet,
    posts,
    isLoading,
    error,
    isCreatePostOpen,
    isShareOpen,
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
    handlePostSaved,
    handleEditPost,
    handleRequestDeletePost,
    handleCancelDeletePost,
    handleConfirmDeletePost,
    handleLayoutChange,
    handleOpenLeave,
    handleCancelLeave,
    handleConfirmLeave,
  } = usePadletPage();

  if (isLoading) {
    return <p className={styles.status}>{PADLET_PAGE_TEXTS.loading}</p>;
  }

  if (error || !padlet) {
    return (
      <div className={styles.error}>
        <p className={styles.errorText}>{error || PADLET_PAGE_TEXTS.boardNotFound}</p>
        <button type="button" className={styles.backOnly} onClick={handleBack}>
          {PADLET_PAGE_TEXTS.backToHome}
        </button>
      </div>
    );
  }

  return (
    <div
      className={styles.page}
      style={{ background: padlet.background ?? '#f3f4f6' }}
    >
      <PadletBoardHeader
        title={padlet.title}
        isShared={padlet.isShared}
        onBack={handleBack}
        onShareClick={handleOpenShare}
        onLeaveClick={handleOpenLeave}
      />
      <PadletPostsLayer
        boardType={padlet.boardType}
        posts={posts}
        currentUsername={currentUsername}
        onEditPost={handleEditPost}
        onDeletePost={(post) => handleRequestDeletePost(post)}
        onLayoutChange={(postId, layout) =>
          void handleLayoutChange(postId, layout)
        }
      />
      <CreatePostFab onClick={handleCreatePost} />

      {isShareOpen ? (
        <SharePadletModal
          padletId={padlet.id}
          currentUsername={currentUsername}
          onClose={handleCloseShare}
        />
      ) : null}

      {isCreatePostOpen ? (
        <CreatePostModal
          padletId={padlet.id}
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
          description={PADLET_PAGE_TEXTS.leaveBoard.description(padlet.title)}
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
