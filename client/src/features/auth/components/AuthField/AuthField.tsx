import styles from './AuthField.module.css';

interface AuthFieldProps {
  id: string;
  label: string;
  type: 'text' | 'password';
  placeholder: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
}

export default function AuthField({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  value,
  onChange,
}: AuthFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </div>
  );
}
