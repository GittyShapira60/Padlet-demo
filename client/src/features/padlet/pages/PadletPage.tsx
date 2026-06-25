import { resolveBackgroundStyle } from '../../../shared/constants/background-colors';
import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppOutletContext } from '../../../App';
import { LogOut, MoreVertical, Pencil, Share2 } from '../../../shared/icons';
import CreatePostFab from '../../post/components/CreatePostFab/CreatePostFab';
import CreatePostModal from '../../post/components/CreatePostModal/CreatePostModal';
import PostFilterBar from '../../post/components/PostFilterBar/PostFilterBar';
import { PostReactionsProvider } from '../../reaction';
import PadletPostsLayer from '../../post/components/PadletPostsLayer/PadletPostsLayer';
import ConfirmDialog from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import { PollProvider } from '../../post/context/PollContext';
import EditPadletModal from '../components/EditPadletModal/EditPadletModal';
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
  filterSearch,
  setFilterSearch,
  filterAuthor,
  setFilterAuthor,
  isCreatePostOpen,
  isShareOpen,
  isEditOpen,
  postToEdit,
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
  handleRequestDeletePost,
  handleCancelDeletePost,
  handleConfirmDeletePost,
  handleLayoutChange,
  handleOpenLeave,
  handleCancelLeave,
  handleConfirmLeave,
}: PadletBoardBodyProps) {
  const capabilities = usePadletCapabilities();
  const { setHeaderBackground } = useOutletContext<AppOutletContext>();
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

  useEffect(() => {
    if (!capabilities.canShare && isShareOpen) {
      handleCloseShare();
    }
  }, [capabilities.canShare, handleCloseShare, isShareOpen]);

  const showMenu =
    capabilities.canEditPadlet || capabilities.canShare || isShared;

  return (
    <div
      className={styles.page}
      style={{ ...resolveBackgroundStyle(padlet?.background ?? null), backgroundAttachment: 'fixed' }}
    >
      <div className={styles.titleRow}>
        <h1 className={styles.boardTitle}>{title}</h1>
        <PostFilterBar
          search={filterSearch}
          author={filterAuthor}
          onSearchChange={setFilterSearch}
          onAuthorChange={setFilterAuthor}
        />
        {showMenu ? (
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
                {capabilities.canEditPadlet ? (
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleOpenEdit();
                    }}
                  >
                    <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                    עריכה
                  </button>
                ) : null}
                {capabilities.canShare ? (
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleOpenShare();
                    }}
                  >
                    <Share2 size={15} strokeWidth={2} aria-hidden="true" />
                    שיתוף
                  </button>
                ) : null}
                {isShared ? (
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleOpenLeave();
                    }}
                  >
                    <LogOut size={15} strokeWidth={2} aria-hidden="true" />
                    עזוב לוח
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <PollProvider padletId={padletId} onVoteSuccess={handlePostSaved}>
        <PostReactionsProvider
          padletId={padletId}
          postIds={filteredPosts.map((post) => post.id)}
          canReact={capabilities.canReact}
        >
          <PadletPostsLayer
            boardType={boardType}
            posts={filteredPosts}
            onEditPost={handleEditPost}
            onDeletePost={(post) => void handleRequestDeletePost(post)}
            onLayoutChange={(postId, layout) =>
              void handleLayoutChange(postId, layout)
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
