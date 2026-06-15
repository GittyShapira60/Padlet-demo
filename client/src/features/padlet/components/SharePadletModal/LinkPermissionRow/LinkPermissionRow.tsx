import PermissionSelect from '../../PermissionSelect/PermissionSelect';
import {
  LINK_PADLET_PERMISSIONS,
  PadletPermission,
  type PadletPermission as PadletPermissionType,
} from '../../../enums/padlet-permission';
import common from '../shareModalCommon.module.css';

interface LinkPermissionRowProps {
  linkPermission: PadletPermissionType;
  onChange: (permission: PadletPermissionType) => void;
}

export default function LinkPermissionRow({
  linkPermission,
  onChange,
}: LinkPermissionRowProps) {
  return (
    <div className={`${common.surface} ${common.surfaceBetween}`}>
      <span className={common.rowLabel}>מבקרים עם קישור</span>
      <PermissionSelect
        value={linkPermission}
        minimum={PadletPermission.Viewer}
        options={LINK_PADLET_PERMISSIONS}
        onChange={onChange}
      />
    </div>
  );
}
