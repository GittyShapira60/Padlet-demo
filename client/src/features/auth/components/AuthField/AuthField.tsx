import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          id={id}
          className={styles.input}
          style={isPassword ? { paddingLeft: '2.5rem' } : undefined}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        {isPassword ? (
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
          >
            {showPassword
              ? <EyeOff size={18} strokeWidth={1.75} />
              : <Eye size={18} strokeWidth={1.75} />}
          </button>
        ) : null}
      </div>
    </div>
  );
}
