import ConfirmDialog from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import CreatePostFab from '../../post/components/CreatePostFab/CreatePostFab';
import CreatePostModal from '../../post/components/CreatePostModal/CreatePostModal';
import PadletPostsLayer from '../../post/components/PadletPostsLayer/PadletPostsLayer';
import PadletBoardHeader from '../components/PadletBoardHeader/PadletBoardHeader';
import SharePadletModal from '../components/SharePadletModal/SharePadletModal';
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
    return <p className={styles.status}>טוען לוח...</p>;
  }

  if (error || !padlet) {
    return (
      <div className={styles.error}>
        <p className={styles.errorText}>{error || 'לוח לא נמצא'}</p>
        <button type="button" className={styles.backOnly} onClick={handleBack}>
          חזרה לבית
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
          title="מחיקת פוסט"
          description="האם את/ה בטוח/ה שברצונך למחוק את הפוסט?"
          confirmLabel="מחק"
          pendingLabel="מוחק..."
          tone="danger"
          isPending={isDeletingPost}
          onConfirm={() => void handleConfirmDeletePost()}
          onCancel={handleCancelDeletePost}
        />
      ) : null}

      {isLeaveOpen ? (
        <ConfirmDialog
          title="עזיבת לוח"
          description={`האם את/ה בטוח/ה שברצונך לעזוב את הלוח "${padlet.title}"? לא תהיה לך יותר גישה אליו.`}
          confirmLabel="עזוב"
          pendingLabel="עוזב/ת..."
          tone="danger"
          isPending={isLeavingPadlet}
          onConfirm={() => void handleConfirmLeave()}
          onCancel={handleCancelLeave}
        />
      ) : null}
    </div>
  );
}
