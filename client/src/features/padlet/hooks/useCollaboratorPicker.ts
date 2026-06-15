import { useEffect, useState } from 'react';
import type { User } from '../../../shared/interfaces/user';
import {
  clampPermission,
  type PadletPermission as PadletPermissionType,
} from '../enums/padlet-permission';
import type { Collaborator } from '../interfaces/share-padlet.types';

interface UseCollaboratorPickerOptions {
  collaboratorMinimum: PadletPermissionType;
  defaultInvitePermission: PadletPermissionType;
  onSelectionChange?: () => void;
}

export function useCollaboratorPicker({
  collaboratorMinimum,
  defaultInvitePermission,
  onSelectionChange,
}: UseCollaboratorPickerOptions) {
  const [pickerSelections, setPickerSelections] = useState<
    Record<string, Collaborator>
  >({});

  const selectedCount = Object.keys(pickerSelections).length;

  useEffect(() => {
    setPickerSelections((current) => {
      let changed = false;
      const next: Record<string, Collaborator> = {};

      for (const [userId, selection] of Object.entries(current)) {
        const permission = clampPermission(
          selection.permission,
          collaboratorMinimum,
        );

        if (permission !== selection.permission) {
          changed = true;
        }

        next[userId] = {
          ...selection,
          permission,
        };
      }

      return changed ? next : current;
    });
  }, [collaboratorMinimum]);

  function toggleUserSelection(user: User) {
    setPickerSelections((current) => {
      if (current[user.id]) {
        const next = { ...current };
        delete next[user.id];
        return next;
      }

      return {
        ...current,
        [user.id]: {
          id: user.id,
          username: user.username,
          permission: defaultInvitePermission,
        },
      };
    });
    onSelectionChange?.();
  }

  function handlePickerPermissionChange(
    userId: string,
    permission: PadletPermissionType,
  ) {
    setPickerSelections((current) => {
      const selection = current[userId];

      if (!selection) {
        return current;
      }

      return {
        ...current,
        [userId]: {
          ...selection,
          permission: clampPermission(permission, collaboratorMinimum),
        },
      };
    });
  }

  return {
    pickerSelections,
    selectedCount,
    toggleUserSelection,
    handlePickerPermissionChange,
    setPickerSelections,
  };
}
