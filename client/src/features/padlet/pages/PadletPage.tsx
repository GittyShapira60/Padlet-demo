import { BACKGROUND_COLOR_GRADIENTS } from '../../../shared/constants/background-colors';
import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppOutletContext } from '../../../App';
import { Settings, Pencil, Share2 } from '../../../shared/icons';

function PadletMenuButton({ onEdit, onShare }: { onEdit: () => void; onShare: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div ref={ref} className={styles.menuWrapper}>
      <button type="button" className={styles.menuBtn} aria-label="אפשרויות" onClick={() => setIsOpen((prev: boolean) => !prev)}>
        <Settings size={17} strokeWidth={1.5} />
      </button>
      {isOpen ? (
        <div className={styles.dropdown}>
          <button type="button" className={styles.dropdownItem} onClick={() => { setIsOpen(false); onEdit(); }}>
            <Pencil size={15} strokeWidth={2} aria-hidden="true" /> עריכה
          </button>
          <button type="button" className={styles.dropdownItem} onClick={() => { setIsOpen(false); onShare(); }}>
            <Share2 size={15} strokeWidth={2} aria-hidden="true" /> שיתוף
          </button>
        </div>
      ) : null}
    </div>
  );
}
import CreatePostFab from '../../post/components/CreatePostFab/CreatePostFab';
import CreatePostModal from '../../post/components/CreatePostModal/CreatePostModal';
import PostFilterBar from '../../post/components/PostFilterBar/PostFilterBar';
import { PostReactionsProvider } from '../../reaction';
import PadletPostsLayer from '../../post/components/PadletPostsLayer/PadletPostsLayer';
import ConfirmDialog from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import { PollProvider } from '../../post/context/PollContext';
import EditPadletModal from '../components/EditPadletModal/EditPadletModal';
import SharePadletModal from '../components/SharePadletModal/SharePadletModal';
import { PADLET_PAGE_TEXTS } from './PadletPage.consts';
import styles from './PadletPage.module.css';
import { usePadletPage } from './usePadletPage';

export default function PadletPage() {
  const { setHeaderBackground, setHeaderActionSlot } = useOutletContext<AppOutletContext>();
  const {
    padlet,
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
    postPendingDelete,
    isDeletingPost,
    handleLayoutChange,
  } = usePadletPage();

  useEffect(() => {
    if (padlet) {
      setHeaderActionSlot(
        <PadletMenuButton onEdit={handleOpenEdit} onShare={handleOpenShare} />
      );
    }
    return () => setHeaderActionSlot(null);
  }, [padlet, handleOpenEdit, handleOpenShare, setHeaderActionSlot]);

  useEffect(() => {
    if (padlet) {
      setHeaderBackground(BACKGROUND_COLOR_GRADIENTS[padlet.background ?? ''] ?? padlet.background ?? null);
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
      style={{ background: BACKGROUND_COLOR_GRADIENTS[padlet.background ?? ''] ?? padlet.background ?? '#f3f4f6', backgroundAttachment: 'fixed' }}
    >
      <div className={styles.titleRow}>
        <h1 className={styles.boardTitle}>{padlet.title}</h1>
        <div className={styles.filterCenter}>
          <PostFilterBar
            search={filterSearch}
            author={filterAuthor}
            onSearchChange={setFilterSearch}
            onAuthorChange={setFilterAuthor}
          />
        </div>
      </div>

      <PollProvider padletId={padlet.id} onVoteSuccess={handlePostSaved}>
        <PostReactionsProvider
          padletId={padlet.id}
          postIds={filteredPosts.map((post: { id: string }) => post.id)}
          canReact={Boolean(currentUsername)}
        >
          <PadletPostsLayer
            boardType={padlet.boardType}
            posts={filteredPosts}
            currentUsername={currentUsername}
            onEditPost={handleEditPost}
            onDeletePost={(post) => void handleRequestDeletePost(post)}
            onLayoutChange={(postId, layout) =>
              void handleLayoutChange(postId, layout)
            }
          />
        </PostReactionsProvider>
      </PollProvider>

      <CreatePostFab onClick={handleCreatePost} />

      {isShareOpen ? (
        <SharePadletModal padletId={padlet.id} currentUsername={currentUsername} onClose={handleCloseShare} />
      ) : null}

      {isEditOpen ? (
        <EditPadletModal
          padlet={padlet}
          onClose={handleCloseEdit}
          onSubmit={handlePadletUpdated}
        />
      ) : null}

      {isCreatePostOpen ? (
        <CreatePostModal padletId={padlet.id} postToEdit={postToEdit} onClose={handleClosePostModal} onSubmit={handlePostSaved} />
      ) : null}

      {postPendingDelete ? (
        <ConfirmDialog
          title="מחיקת פוסט"
          description="האם את בטוחה שברצונך למחוק את הפוסט?"
          confirmLabel="מחק"
          pendingLabel="מוחק..."
          isPending={isDeletingPost}
          tone="danger"
          onConfirm={() => void handleConfirmDeletePost()}
          onCancel={handleCancelDeletePost}
        />
      ) : null}
    </div>
  );
}
