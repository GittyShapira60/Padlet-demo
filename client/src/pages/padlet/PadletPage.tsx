import CreatePostFab from '../../components/padlet/CreatePostFab/CreatePostFab';
import CreatePostModal from '../../components/padlet/CreatePostModal/CreatePostModal';
import PadletBoardHeader from '../../components/padlet/PadletBoardHeader/PadletBoardHeader';
import PadletPostsLayer from '../../components/padlet/PadletPostsLayer/PadletPostsLayer';
import styles from './PadletPage.module.css';
import { usePadletPage } from './usePadletPage';

export default function PadletPage() {
  const {
    padlet,
    posts,
    isLoading,
    error,
    isCreatePostOpen,
    authorUsername,
    handleBack,
    handleCreatePost,
    handleCloseCreatePost,
    handlePostCreated,
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
      <PadletBoardHeader title={padlet.title} onBack={handleBack} />
      <PadletPostsLayer boardType={padlet.boardType} posts={posts} />
      <CreatePostFab onClick={handleCreatePost} />

      {isCreatePostOpen ? (
        <CreatePostModal
          padletId={padlet.id}
          authorUsername={authorUsername}
          onClose={handleCloseCreatePost}
          onSubmit={handlePostCreated}
        />
      ) : null}
    </div>
  );
}
