import PermissionSelect from '../../PermissionSelect/PermissionSelect';
import selectStyles from '../../PermissionSelect/PermissionSelect.module.css';
import type { User } from '../../../../../shared/interfaces/user';
import type { PadletPermission as PadletPermissionType } from '../../../enums/padlet-permission';
import common from '../shareModalCommon.module.css';
import styles from './CollaboratorUserPicker.module.css';

interface CollaboratorUserPickerProps {
  searchQuery: string;
  usersLoading: boolean;
  usersError: string;
  filteredUsers: User[];
  collaboratorMinimum: PadletPermissionType;
  invitingUserId: string | null;
  getRowPermission: (userId: string) => PadletPermissionType;
  onSearchChange: (value: string) => void;
  onPermissionChange: (userId: string, permission: PadletPermissionType) => void;
  onInviteUser: (user: User) => void;
}

export default function CollaboratorUserPicker({
  searchQuery,
  usersLoading,
  usersError,
  filteredUsers,
  collaboratorMinimum,
  invitingUserId,
  getRowPermission,
  onSearchChange,
  onPermissionChange,
  onInviteUser,
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
              const isInviting = invitingUserId === user.id;

              return (
                <li key={user.id} className={styles.option}>
                  <span className={styles.optionName}>{user.username}</span>
                  <div className={styles.rowActions}>
                    <PermissionSelect
                      value={getRowPermission(user.id)}
                      minimum={collaboratorMinimum}
                      onChange={(permission) =>
                        onPermissionChange(user.id, permission)
                      }
                      className={selectStyles.noShrink}
                    />
                    <button
                      type="button"
                      className={common.actionButton}
                      onClick={() => onInviteUser(user)}
                      disabled={isInviting}
                    >
                      {isInviting ? 'מזמין...' : 'הזמן'}
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
