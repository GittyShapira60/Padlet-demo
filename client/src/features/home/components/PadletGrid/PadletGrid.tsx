import type { CopyPadletOptions } from '../../../padlet/services/padlet-service';
import type { Padlet } from '../../../padlet/interfaces/padlet';
import CreatePadletCard from '../CreatePadletCard/CreatePadletCard';
import PadletCard from '../PadletCard/PadletCard';
import styles from './PadletGrid.module.css';

interface PadletGridProps {
  padlets: Padlet[];
  showCreateCard?: boolean;
  onCreateClick?: () => void;
  onDelete?: (padletId: string) => Promise<void>;
  onCopy?: (padletId: string, options: CopyPadletOptions) => Promise<void>;
}

export default function PadletGrid({
  padlets,
  showCreateCard = false,
  onCreateClick,
  onDelete,
  onCopy,
}: PadletGridProps) {
  return (
    <div className={styles.grid}>
      {showCreateCard && onCreateClick ? (
        <CreatePadletCard onClick={onCreateClick} />
      ) : null}
      {padlets.map((padlet) => (
        <PadletCard key={padlet.id} padlet={padlet} onDelete={onDelete} onCopy={onCopy} />
      ))}
    </div>
  );
}