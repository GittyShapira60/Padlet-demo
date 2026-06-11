import styles from './PadletNameInput.module.css';

interface PadletNameInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export default function PadletNameInput({
  value,
  onChange,
  placeholder = 'לוח הרעיונות שלי...',
  id = 'padlet-title',
}: PadletNameInputProps) {
  return (
    <input
      id={id}
      className={styles.input}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      autoComplete="off"
    />
  );
}
