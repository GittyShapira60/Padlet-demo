import { useEffect, useMemo, useState } from 'react';
import {
  clampPermission,
  getCollaboratorMinimum,
  getEffectiveInvitePermission,
  PadletPermission,
  type PadletPermission as PadletPermissionType,
} from '../enums/padlet-permission';
import type { Collaborator } from '../interfaces/share-padlet.types';
import {
  buildShareUrl,
  filterUsersForPicker,
  getInviteCandidates,
  getPermissionHint,
} from '../utils/share-padlet.utils';
import { useCollaboratorPicker } from './useCollaboratorPicker';
import { useUsers } from './useUsers';

interface UseSharePadletModalOptions {
  padletId: string;
  currentUsername?: string;
}

export function useSharePadletModal({
  padletId,
  currentUsername,
}: UseSharePadletModalOptions) {
  const [linkPermission, setLinkPermission] = useState<PadletPermissionType>(
    PadletPermission.Viewer,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const { allUsers, usersLoading, usersError } = useUsers();

  const shareUrl = useMemo(() => buildShareUrl(padletId), [padletId]);
  const collaboratorMinimum = getCollaboratorMinimum(linkPermission);
  const defaultInvitePermission = getEffectiveInvitePermission(linkPermission);
  const permissionHint = getPermissionHint(linkPermission);

  const filteredUsers = useMemo(
    () =>
      filterUsersForPicker(
        allUsers,
        searchQuery,
        currentUsername,
        collaborators,
      ),
    [allUsers, collaborators, currentUsername, searchQuery],
  );

  function clearInviteError() {
    setInviteError('');
  }

  const {
    pickerSelections,
    selectedCount,
    toggleUserSelection,
    handlePickerPermissionChange,
    setPickerSelections,
  } = useCollaboratorPicker({
    collaboratorMinimum,
    defaultInvitePermission,
    onSelectionChange: clearInviteError,
  });

  useEffect(() => {
    setCollaborators((current) =>
      current.map((collaborator) => ({
        ...collaborator,
        permission: clampPermission(
          collaborator.permission,
          collaboratorMinimum,
        ),
      })),
    );
  }, [collaboratorMinimum]);

  function handleInvite() {
    const selections = Object.values(pickerSelections);
    setInviteError('');

    if (selections.length === 0) {
      return;
    }

    const newCollaborators = getInviteCandidates(selections, collaborators);

    if (newCollaborators.length === 0) {
      setInviteError('כל המשתמשים שבחרת כבר ברשימה');
      return;
    }

    setCollaborators((current) => [...current, ...newCollaborators]);
    setPickerSelections({});
    setSearchQuery('');
  }

  function handleCollaboratorPermissionChange(
    collaboratorId: string,
    permission: PadletPermissionType,
  ) {
    setCollaborators((current) =>
      current.map((collaborator) =>
        collaborator.id === collaboratorId
          ? {
              ...collaborator,
              permission: clampPermission(permission, collaboratorMinimum),
            }
          : collaborator,
      ),
    );
  }

  function reportCopyError() {
    setInviteError('לא הצלחנו להעתיק את הקישור');
  }

  return {
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
  };
}
