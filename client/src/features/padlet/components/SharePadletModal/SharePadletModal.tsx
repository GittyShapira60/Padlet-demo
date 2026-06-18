import Modal from '../../../../shared/components/Modal/Modal';
import CollaboratorsList from './CollaboratorsList/CollaboratorsList';
import CollaboratorUserPicker from './CollaboratorUserPicker/CollaboratorUserPicker';
import LinkPermissionRow from './LinkPermissionRow/LinkPermissionRow';
import ShareLinkField from './ShareLinkField/ShareLinkField';
import SharePadletModalHeader from './SharePadletModalHeader/SharePadletModalHeader';
import common from './shareModalCommon.module.css';
import styles from './SharePadletModal.module.css';
import { useSharePadletModal } from '../../hooks/useSharePadletModal';

interface SharePadletModalProps {
  padletId: string;
  onClose: () => void;
  currentUsername?: string;
}

const TITLE_ID = 'share-padlet-title';

export default function SharePadletModal({
  padletId,
  onClose,
  currentUsername,
}: SharePadletModalProps) {
  const {
    shareUrl,
    linkPermission,
    setLinkPermission,
    collaboratorMinimum,
    permissionHint,
    searchQuery,
    setSearchQuery,
    inviteError,
    usersLoading,
    usersError,
    participantsLoading,
    filteredUsers,
    invitingUserId,
    collaborators,
    getRowPermission,
    handleRowPermissionChange,
    handleInviteUser,
    handleCollaboratorPermissionChange,
    clearInviteError,
    reportCopyError,
    resetModalForm,
  } = useSharePadletModal({ padletId, currentUsername });

  function handleClose() {
    resetModalForm();
    onClose();
  }

  return (
    <Modal onClose={handleClose} ariaLabelledBy={TITLE_ID}>
      <div className={styles.panel}>
        <SharePadletModalHeader
          title="הרשאות"
          titleId={TITLE_ID}
          onClose={handleClose}
        />

        <ShareLinkField shareUrl={shareUrl} onCopyError={reportCopyError} />

        <LinkPermissionRow
          linkPermission={linkPermission}
          onChange={setLinkPermission}
        />

        <p className={common.hint}>{permissionHint}</p>

        <CollaboratorUserPicker
          searchQuery={searchQuery}
          usersLoading={usersLoading}
          usersError={usersError}
          filteredUsers={filteredUsers}
          collaboratorMinimum={collaboratorMinimum}
          invitingUserId={invitingUserId}
          getRowPermission={getRowPermission}
          onSearchChange={(value) => {
            setSearchQuery(value);
            clearInviteError();
          }}
          onPermissionChange={handleRowPermissionChange}
          onInviteUser={(user) => void handleInviteUser(user)}
        />

        {inviteError ? <p className={common.error}>{inviteError}</p> : null}

        {participantsLoading ? (
          <p className={common.hint}>טוען שותפים...</p>
        ) : (
          <CollaboratorsList
            collaborators={collaborators}
            collaboratorMinimum={collaboratorMinimum}
            onPermissionChange={(collaboratorId, permission) =>
              void handleCollaboratorPermissionChange(collaboratorId, permission)
            }
          />
        )}
      </div>
    </Modal>
  );
}
