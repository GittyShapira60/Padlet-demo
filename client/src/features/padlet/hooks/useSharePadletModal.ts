import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  clampPermission,
  getCollaboratorMinimum,
  getEffectiveInvitePermission,
  PadletPermission,
  type PadletPermission as PadletPermissionType,
} from '../enums/padlet-permission';
import type { Collaborator } from '../interfaces/share-padlet.types';
import {
  getParticipants,
  inviteParticipant,
  removeParticipant,
  updateParticipantPermission,
} from '../services/participant-service';
import { updatePadletDefaultPermission } from '../services/padlet-service';
import {
  buildShareUrl,
  filterUsersForPicker,
  getPermissionHint,
} from '../utils/share-padlet.utils';
import {
  mapApiPermission,
  mapLinkPermissionToApi,
} from '../utils/padlet-capabilities';
import { useUsers } from './useUsers';
import type { User } from '../../../shared/interfaces/user';

interface UseSharePadletModalOptions {
  padletId: string;
  currentUsername?: string;
  initialDefaultPermission: PadletPermissionType;
  onDefaultPermissionChange?: (permission: PadletPermissionType) => void;
}

export function useSharePadletModal({
  padletId,
  currentUsername,
  initialDefaultPermission,
  onDefaultPermissionChange,
}: UseSharePadletModalOptions) {
  const [linkPermission, setLinkPermission] = useState<PadletPermissionType>(
    initialDefaultPermission,
  );
  const linkPermissionRef = useRef(linkPermission);
  linkPermissionRef.current = linkPermission;
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [rowPermissions, setRowPermissions] = useState<
    Record<string, PadletPermissionType>
  >({});
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
  const [participantsLoading, setParticipantsLoading] = useState(true);
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

  useEffect(() => {
    setLinkPermission(initialDefaultPermission);
  }, [initialDefaultPermission]);

  useEffect(() => {
    let isMounted = true;

    async function loadParticipants() {
      setParticipantsLoading(true);

      try {
        const participants = await getParticipants(padletId);

        if (isMounted) {
          setCollaborators(participants);
        }
      } catch {
        if (isMounted) {
          setInviteError('לא הצלחנו לטעון את רשימת השותפים');
        }
      } finally {
        if (isMounted) {
          setParticipantsLoading(false);
        }
      }
    }

    void loadParticipants();

    return () => {
      isMounted = false;
    };
  }, [padletId]);

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

  function clearInviteError() {
    setInviteError('');
  }

  function getRowPermission(userId: string): PadletPermissionType {
    return rowPermissions[userId] ?? defaultInvitePermission;
  }

  function handleRowPermissionChange(
    userId: string,
    permission: PadletPermissionType,
  ) {
    setRowPermissions((current) => ({
      ...current,
      [userId]: clampPermission(permission, collaboratorMinimum),
    }));
    clearInviteError();
  }

  const handleInviteUser = useCallback(
    async (user: User) => {
      const permission = clampPermission(
        getRowPermission(user.id),
        collaboratorMinimum,
      );
      setInviteError('');
      setInvitingUserId(user.id);

      try {
        const participant = await inviteParticipant(
          padletId,
          user.id,
          permission,
        );

        setCollaborators((current) => [...current, participant]);
        setRowPermissions((current) => {
          const next = { ...current };
          delete next[user.id];
          return next;
        });
      } catch {
        setInviteError(`הזמנת ${user.username} נכשלה`);
      } finally {
        setInvitingUserId(null);
      }
    },
    [collaboratorMinimum, defaultInvitePermission, padletId, rowPermissions],
  );

  const handleRemoveCollaborator = useCallback(
    async (collaboratorId: string) => {
      setInviteError('');
      try {
        await removeParticipant(padletId, collaboratorId);
        setCollaborators((current) =>
          current.filter((c) => c.id !== collaboratorId),
        );
      } catch {
        setInviteError('הסרת משתף הפעולה נכשלה');
      }
    },
    [padletId],
  );

  const handleCollaboratorPermissionChange = useCallback(
    async (collaboratorId: string, permission: PadletPermissionType) => {
      const nextPermission = clampPermission(permission, collaboratorMinimum);
      setInviteError('');

      try {
        const updatedParticipant = await updateParticipantPermission(
          padletId,
          collaboratorId,
          nextPermission,
        );

        setCollaborators((current) =>
          current.map((collaborator) =>
            collaborator.id === collaboratorId
              ? updatedParticipant
              : collaborator,
          ),
        );
      } catch {
        setInviteError('עדכון ההרשאה נכשל');
      }
    },
    [collaboratorMinimum, padletId],
  );

  const handleLinkPermissionChange = useCallback(
    async (permission: PadletPermissionType) => {
      const previous = linkPermissionRef.current;
      setLinkPermission(permission);
      setInviteError('');

      try {
        const result = await updatePadletDefaultPermission(
          padletId,
          mapLinkPermissionToApi(permission),
        );
        const nextPermission =
          result.defaultPermission === null
            ? PadletPermission.None
            : mapApiPermission(result.defaultPermission);
        setLinkPermission(nextPermission);
        onDefaultPermissionChange?.(nextPermission);
      } catch {
        setLinkPermission(previous);
        setInviteError('עדכון הרשאת הקישור נכשל');
      }
    },
    [onDefaultPermissionChange, padletId],
  );

  function reportCopyError() {
    setInviteError('לא הצלחנו להעתיק את הקישור');
  }

  function resetModalForm() {
    setSearchQuery('');
    setRowPermissions({});
    setInviteError('');
  }

  return {
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
    handleRemoveCollaborator,
    clearInviteError,
    reportCopyError,
    resetModalForm,
  };
}
