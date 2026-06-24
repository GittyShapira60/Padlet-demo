import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppOutletContext } from '../../../App';
import { MoreVertical, Pencil, Share2 } from '../../../shared/icons';
import CreatePostFab from '../../post/components/CreatePostFab/CreatePostFab';
import CreatePostModal from '../../post/components/CreatePostModal/CreatePostModal';
import { PostReactionsProvider } from '../../reaction';
import PadletPostsLayer from '../../post/components/PadletPostsLayer/PadletPostsLayer';
import EditPadletModal from '../components/EditPadletModal/EditPadletModal';
import SharePadletModal from '../components/SharePadletModal/SharePadletModal';
import { PADLET_PAGE_TEXTS } from './PadletPage.consts';
import styles from './PadletPage.module.css';
import { usePadletPage } from './usePadletPage';

export default function PadletPage() {
  const { setHeaderBackground } = useOutletContext<AppOutletContext>();
  const {
    padlet,
    posts,
    isLoading,
    error,
    isCreatePostOpen,
    isShareOpen,
    isEditOpen,
    postToEdit,
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
    handleLayoutChange,
  } = usePadletPage();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (padlet) {
      setHeaderBackground(padlet.background ?? null);
    }
    return () => {
      setHeaderBackground(null);
    };
  }, [padlet, setHeaderBackground]);

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
      <div className={styles.titleRow}>
        <h1 className={styles.boardTitle}>{padlet.title}</h1>
        <div className={styles.menuWrapper} ref={menuRef}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label="אפשרויות"
            onClick={() => setIsMenuOpen((prev: boolean) => !prev)}
          >
            <MoreVertical size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          {isMenuOpen ? (
            <div className={styles.dropdown}>
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => { setIsMenuOpen(false); handleOpenEdit(); }}
              >
                <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                עריכה
              </button>
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => { setIsMenuOpen(false); handleOpenShare(); }}
              >
                <Share2 size={15} strokeWidth={2} aria-hidden="true" />
                שיתוף
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <PadletPostsLayer
        boardType={padlet.boardType}
        posts={posts}
        currentUsername={currentUsername}
        onEditPost={handleEditPost}
        onDeletePost={(post) => void handleRequestDeletePost(post)}
        onLayoutChange={(postId, layout) =>
          void handleLayoutChange(postId, layout)
        }
      />
      <PadletBoardHeader
        title={padlet.title}
        isShared={padlet.isShared}
        onBack={handleBack}
        onShareClick={handleOpenShare}
        onLeaveClick={handleOpenLeave}
      />
      <PostReactionsProvider
        padletId={padlet.id}
        postIds={posts.map((post) => post.id)}
        canReact={Boolean(currentUsername)}
      >
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
      </PostReactionsProvider>
      <CreatePostFab onClick={handleCreatePost} />

      {isShareOpen ? (
        <SharePadletModal
          padletId={padlet.id}
          currentUsername={currentUsername}
          onClose={handleCloseShare}
        />
      ) : null}

      {isEditOpen ? (
        <EditPadletModal
          padlet={padlet}
          onClose={handleCloseEdit}
          onSubmit={handlePadletUpdated}
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