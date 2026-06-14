import { useEffect, useState, type KeyboardEvent } from 'react';
import Modal from '../../../../shared/components/Modal/Modal';
import {
  clampPermission,
  getPermissionsAtOrAbove,
  PADLET_PERMISSION_LABELS,
  PadletPermission,
  type PadletPermission as PadletPermissionType,
} from '../../enums/padlet-permission';
import styles from './SharePadletModal.module.css';

interface Collaborator {
  id: string;
  username: string;
  permission: PadletPermissionType;
}

interface SharePadletModalProps {
  onClose: () => void;
  currentUsername?: string;
}

function PermissionSelect({
  value,
  minimum,
  onChange,
  id,
}: {
  value: PadletPermissionType;
  minimum: PadletPermissionType;
  onChange: (permission: PadletPermissionType) => void;
  id?: string;
}) {
  const options = getPermissionsAtOrAbove(minimum);

  return (
    <select
      id={id}
      className={styles.select}
      value={value}
      onChange={(event) =>
        onChange(event.target.value as PadletPermissionType)
      }
    >
      {options.map((permission) => (
        <option key={permission} value={permission}>
          {PADLET_PERMISSION_LABELS[permission]}
        </option>
      ))}
    </select>
  );
}

export default function SharePadletModal({
  onClose,
  currentUsername,
}: SharePadletModalProps) {
  const [linkPermission, setLinkPermission] = useState<PadletPermissionType>(
    PadletPermission.Viewer,
  );
  const [usernameInput, setUsernameInput] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    setCollaborators((current) =>
      current.map((collaborator) => ({
        ...collaborator,
        permission: clampPermission(collaborator.permission, linkPermission),
      })),
    );
  }, [linkPermission]);

  function handleLinkPermissionChange(next: PadletPermissionType) {
    setLinkPermission(next);
  }

  function handleInvite() {
    const username = usernameInput.trim();
    setInviteError('');

    if (!username) {
      return;
    }

    if (username.toLowerCase() === currentUsername?.toLowerCase()) {
      setInviteError('אי אפשר להזמין את עצמך');
      return;
    }

    const exists = collaborators.some(
      (collaborator) =>
        collaborator.username.toLowerCase() === username.toLowerCase(),
    );

    if (exists) {
      setInviteError('משתמש זה כבר ברשימה');
      return;
    }

    setCollaborators((current) => [
      ...current,
      {
        id: username.toLowerCase(),
        username,
        permission: linkPermission,
      },
    ]);
    setUsernameInput('');
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleInvite();
    }
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
              permission: clampPermission(permission, linkPermission),
            }
          : collaborator,
      ),
    );
  }

  return (
    <Modal onClose={onClose} ariaLabelledBy="share-padlet-title">
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 id="share-padlet-title" className={styles.title}>
            הרשאות
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="סגור"
          >
            ×
          </button>
        </div>

        <div className={styles.row}>
          <span className={styles.rowLabel}>מבקרים עם קישור</span>
          <PermissionSelect
            id="link-permission"
            value={linkPermission}
            minimum={PadletPermission.Viewer}
            onChange={handleLinkPermissionChange}
          />
        </div>

        <p className={styles.hint}>
          רמת ההרשאה של משתף פעולה לא יכולה להיות נמוכה מרמת הקישור הכללי.
        </p>

        <div className={styles.inviteRow}>
          <input
            className={styles.input}
            type="text"
            value={usernameInput}
            placeholder="הוסף משתף פעולה"
            onChange={(event) => {
              setUsernameInput(event.target.value);
              setInviteError('');
            }}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
          />
          <button
            type="button"
            className={styles.inviteBtn}
            onClick={handleInvite}
            disabled={!usernameInput.trim()}
          >
            הזמן
          </button>
        </div>

        {inviteError ? <p className={styles.error}>{inviteError}</p> : null}

        <div className={styles.collaborators}>
          <p className={styles.sectionLabel}>משתפי פעולה</p>
          {collaborators.length === 0 ? (
            <p className={styles.empty}>עדיין לא הוזמנו משתפי פעולה</p>
          ) : (
            collaborators.map((collaborator) => (
              <div key={collaborator.id} className={styles.collaboratorRow}>
                <span className={styles.username}>{collaborator.username}</span>
                <PermissionSelect
                  value={collaborator.permission}
                  minimum={linkPermission}
                  onChange={(permission) =>
                    handleCollaboratorPermissionChange(
                      collaborator.id,
                      permission,
                    )
                  }
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
