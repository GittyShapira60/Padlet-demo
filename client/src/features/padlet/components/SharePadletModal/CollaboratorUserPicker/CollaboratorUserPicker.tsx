import PermissionSelect from '../../PermissionSelect/PermissionSelect';
import selectStyles from '../../PermissionSelect/PermissionSelect.module.css';
import type { User } from '../../../../../shared/interfaces/user';
import type { PadletPermission as PadletPermissionType } from '../../../enums/padlet-permission';
import type { Collaborator } from '../../../interfaces/share-padlet.types';
import common from '../shareModalCommon.module.css';
import styles from './CollaboratorUserPicker.module.css';

interface CollaboratorUserPickerProps {
  searchQuery: string;
  usersLoading: boolean;
  usersError: string;
  filteredUsers: User[];
  pickerSelections: Record<string, Collaborator>;
  collaboratorMinimum: PadletPermissionType;
  selectedCount: number;
  onSearchChange: (value: string) => void;
  onToggleUser: (user: User) => void;
  onPermissionChange: (userId: string, permission: PadletPermissionType) => void;
  onInvite: () => void;
}

export default function CollaboratorUserPicker({
  searchQuery,
  usersLoading,
  usersError,
  filteredUsers,
  pickerSelections,
  collaboratorMinimum,
  selectedCount,
  onSearchChange,
  onToggleUser,
  onPermissionChange,
  onInvite,
}: CollaboratorUserPickerProps) {
  const showDropdown = searchQuery.trim().length > 0;

  return (
    <div className={styles.wrapper}>
      <div className={common.surface}>
        <input
          className={common.fieldInput}
          type="text"
          value={searchQuery}
          placeholder="חפש משתף פעולה"
          onChange={(event) => onSearchChange(event.target.value)}
          autoComplete="off"
        />
        <button
          type="button"
          className={common.actionButton}
          onClick={onInvite}
          disabled={selectedCount === 0}
        >
          הזמן
        </button>
      </div>

      {usersError ? <p className={common.error}>{usersError}</p> : null}

      {showDropdown ? (
        <ul className={styles.dropdown} role="listbox" aria-label="משתמשים">
          {usersLoading ? (
            <li className={styles.emptyOption}>טוען משתמשים...</li>
          ) : filteredUsers.length === 0 ? (
            <li className={styles.emptyOption}>לא נמצאו משתמשים</li>
          ) : (
            filteredUsers.map((user) => {
              const selection = pickerSelections[user.id];
              const isSelected = Boolean(selection);

              return (
                <li key={user.id} className={styles.option}>
                  <label className={styles.optionLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isSelected}
                      onChange={() => onToggleUser(user)}
                    />
                    <span className={styles.optionName}>{user.username}</span>
                  </label>
                  {isSelected ? (
                    <PermissionSelect
                      value={selection.permission}
                      minimum={collaboratorMinimum}
                      onChange={(permission) =>
                        onPermissionChange(user.id, permission)
                      }
                      className={selectStyles.noShrink}
                    />
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      ) : null}

      {selectedCount > 0 ? (
        <p className={styles.status}>נבחרו {selectedCount} משתמשים</p>
      ) : null}
    </div>
  );
}
