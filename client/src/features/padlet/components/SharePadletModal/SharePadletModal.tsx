import Modal from '../../../../shared/components/Modal/Modal';
import CollaboratorsList from './CollaboratorsList/CollaboratorsList';
import CollaboratorUserPicker from './CollaboratorUserPicker/CollaboratorUserPicker';
import LinkPermissionRow from './LinkPermissionRow/LinkPermissionRow';
import ShareLinkField from './ShareLinkField/ShareLinkField';
import SharePadletModalHeader from './SharePadletModalHeader/SharePadletModalHeader';
import common from './shareModalCommon.module.css';
import styles from './SharePadletModal.module.css';
import type { PadletPermission } from '../../enums/padlet-permission';
import { useSharePadletModal } from '../../hooks/useSharePadletModal';

interface SharePadletModalProps {
  padletId: string;
  onClose: () => void;
  currentUsername?: string;
  initialDefaultPermission: PadletPermission;
  onDefaultPermissionChange?: (permission: PadletPermission) => void;
}

const TITLE = 'הרשאות';

export default function SharePadletModal({
  padletId,
  onClose,
  currentUsername,
  initialDefaultPermission,
  onDefaultPermissionChange,
}: SharePadletModalProps) {
  const {
    shareUrl,
    linkPermission,
    handleLinkPermissionChange,
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
  } = useSharePadletModal({
    padletId,
    currentUsername,
    initialDefaultPermission,
    onDefaultPermissionChange,
  });

  function handleClose() {
    resetModalForm();
    onClose();
  }

  return (
    <Modal onClose={handleClose}>
      <div className={styles.panel}>
        <SharePadletModalHeader
          title={TITLE}
          onClose={handleClose}
        />

        <ShareLinkField shareUrl={shareUrl} onCopyError={reportCopyError} />

        <LinkPermissionRow
          linkPermission={linkPermission}
          onChange={(permission) => void handleLinkPermissionChange(permission)}
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
