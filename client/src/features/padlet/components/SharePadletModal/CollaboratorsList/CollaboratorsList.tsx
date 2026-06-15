import PermissionSelect from '../../PermissionSelect/PermissionSelect';
import type { Collaborator } from '../../../interfaces/share-padlet.types';
import type { PadletPermission as PadletPermissionType } from '../../../enums/padlet-permission';
import common from '../shareModalCommon.module.css';

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  collaboratorMinimum: PadletPermissionType;
  onPermissionChange: (
    collaboratorId: string,
    permission: PadletPermissionType,
  ) => void;
}

export default function CollaboratorsList({
  collaborators,
  collaboratorMinimum,
  onPermissionChange,
}: CollaboratorsListProps) {
  return (
    <div className={common.list}>
      <p className={common.sectionLabel}>משתפי פעולה</p>
      {collaborators.length === 0 ? (
        <p className={common.empty}>עדיין לא הוזמנו משתפי פעולה</p>
      ) : (
        collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className={`${common.surface} ${common.surfaceWhite}`}
          >
            <span className={common.username}>{collaborator.username}</span>
            <PermissionSelect
              value={collaborator.permission}
              minimum={collaboratorMinimum}
              onChange={(permission) =>
                onPermissionChange(collaborator.id, permission)
              }
            />
          </div>
        ))
      )}
    </div>
  );
}
