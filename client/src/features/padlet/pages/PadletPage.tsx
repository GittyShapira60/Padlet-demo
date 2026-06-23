import { useEffect } from 'react';
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

import styles from './PadletPage.module.css';

import { usePadletPage } from './usePadletPage';



function PadletBoardBody({

  padletId,

  boardType,

  background,

  title,

  posts,

  isCreatePostOpen,

  isShareOpen,

  postToEdit,

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

  handleDeletePost,

  handleLayoutChange,

}: ReturnType<typeof usePadletPage> & { padletId: string; boardType: NonNullable<ReturnType<typeof usePadletPage>['padlet']>['boardType']; background: string | null; title: string }) {

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

        onBack={handleBack}

        onShareClick={handleOpenShare}

        showShare={capabilities.canShare}

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

          onDeletePost={(post) => void handleDeletePost(post)}

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

    return <p className={styles.status}>טוען לוח...</p>;

  }



  if (error || !padlet || !currentUserPermission) {

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

      />

    </PadletCapabilitiesProvider>

  );

}


