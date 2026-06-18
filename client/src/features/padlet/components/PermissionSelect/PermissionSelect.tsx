import {
  getPermissionsAtOrAbove,
  PADLET_PERMISSION_LABELS,
  type PadletPermission,
} from '../../enums/padlet-permission';
import styles from './PermissionSelect.module.css';

interface PermissionSelectProps {
  value: PadletPermission;
  minimum: PadletPermission;
  onChange: (permission: PadletPermission) => void;
  id?: string;
  options?: PadletPermission[];
  className?: string;
}

export default function PermissionSelect({
  value,
  minimum,
  onChange,
  id,
  options,
  className,
}: PermissionSelectProps) {
  const permissionOptions = options ?? getPermissionsAtOrAbove(minimum);
  const selectClassName = [styles.select, className].filter(Boolean).join(' ');

  return (
    <select
      id={id}
      className={selectClassName}
      value={value}
      onChange={(event) =>
        onChange(event.target.value as PadletPermission)
      }
    >
      {permissionOptions.map((permission) => (
        <option key={permission} value={permission}>
          {PADLET_PERMISSION_LABELS[permission]}
        </option>
      ))}
    </select>
  );
}
