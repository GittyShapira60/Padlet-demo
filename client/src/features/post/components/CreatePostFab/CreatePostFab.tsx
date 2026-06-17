import { Plus } from '../../../../shared/icons';
import styles from './CreatePostFab.module.css';

interface CreatePostFabProps {
  onClick: () => void;
}

export default function CreatePostFab({ onClick }: CreatePostFabProps) {
  return (
    <button type="button" className={styles.fab} onClick={onClick}>
      <Plus size={20} strokeWidth={2.25} aria-hidden="true" />
      פוסט חדש
    </button>
  );
}
