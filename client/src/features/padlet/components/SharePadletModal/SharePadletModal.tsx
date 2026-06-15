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
    filteredUsers,
    pickerSelections,
    selectedCount,
    collaborators,
    toggleUserSelection,
    handlePickerPermissionChange,
    handleInvite,
    handleCollaboratorPermissionChange,
    clearInviteError,
    reportCopyError,
  } = useSharePadletModal({ padletId, currentUsername });

  return (
    <Modal onClose={onClose} ariaLabelledBy={TITLE_ID}>
      <div className={styles.panel}>
        <SharePadletModalHeader
          title="הרשאות"
          titleId={TITLE_ID}
          onClose={onClose}
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
          pickerSelections={pickerSelections}
          collaboratorMinimum={collaboratorMinimum}
          selectedCount={selectedCount}
          onSearchChange={(value) => {
            setSearchQuery(value);
            clearInviteError();
          }}
          onToggleUser={toggleUserSelection}
          onPermissionChange={handlePickerPermissionChange}
          onInvite={handleInvite}
        />

        {inviteError ? <p className={common.error}>{inviteError}</p> : null}

        <CollaboratorsList
          collaborators={collaborators}
          collaboratorMinimum={collaboratorMinimum}
          onPermissionChange={handleCollaboratorPermissionChange}
        />
      </div>
    </Modal>
  );
}
