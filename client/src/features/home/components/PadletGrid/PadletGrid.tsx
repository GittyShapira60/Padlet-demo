import type { Padlet } from '../../../padlet/interfaces/padlet';
import CreatePadletCard from '../CreatePadletCard/CreatePadletCard';
import PadletCard from '../PadletCard/PadletCard';
import styles from './PadletGrid.module.css';

interface PadletGridProps {
  padlets: Padlet[];
  showCreateCard?: boolean;
  onCreateClick?: () => void;
}

export default function PadletGrid({
  padlets,
  showCreateCard = false,
  onCreateClick,
}: PadletGridProps) {
  return (
    <div className={styles.grid}>
      {showCreateCard && onCreateClick ? (
        <CreatePadletCard onClick={onCreateClick} />
      ) : null}
      {padlets.map((padlet) => (
        <PadletCard key={padlet.id} padlet={padlet} />
      ))}
    </div>
  );
}
