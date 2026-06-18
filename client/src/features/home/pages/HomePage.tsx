import CreatePadletModal from '../components/CreatePadletModal/CreatePadletModal';
import HomeEmptyState from '../components/HomeEmptyState/HomeEmptyState';
import HomeHero from '../components/HomeHero/HomeHero';
import PadletGrid from '../components/PadletGrid/PadletGrid';
import PadletSection from '../components/PadletSection/PadletSection';
import styles from './HomePage.module.css';
import { useHomePage } from './useHomePage';

export default function HomePage() {
  const {
    username,
    boards,
    error,
    hasSharedBoards,
    showLoading,
    showError,
    showEmpty,
    showBoards,
    isCreateModalOpen,
    handleCreatePadlet,
    handleCloseCreateModal,
    handlePadletCreated,
    handleDeletePadlet,
    handleCopyPadlet,
  } = useHomePage();

  return (
    <div className={styles.page}>
      <HomeHero username={username} />

      <div className={styles.content}>
        {showLoading ? <p className={styles.status}>טוען לוחות...</p> : null}
        {showError ? <p className={styles.error}>{error}</p> : null}

        {showEmpty ? (
          <HomeEmptyState onCreateClick={handleCreatePadlet} />
        ) : null}

        {showBoards ? (
          <div className={styles.body}>
            <div className={styles.sections}>
              <PadletSection title="הלוחות שלי" count={boards.mine.length}>
                <PadletGrid
                  padlets={boards.mine}
                  showCreateCard
                  onCreateClick={handleCreatePadlet}
                  onDelete={handleDeletePadlet}
                  onCopy={handleCopyPadlet}
                />
              </PadletSection>

              {hasSharedBoards ? (
                <PadletSection
                  title="משותף איתי"
                  count={boards.shared.length}
                  badgeColor="blue"
                >
                  <PadletGrid padlets={boards.shared} />
                </PadletSection>
              ) : null}
            </div>

            <aside className={styles.sidebar}>
              <button
                type="button"
                className={styles.createBtn}
                onClick={handleCreatePadlet}
              >
                + לוח חדש
              </button>
            </aside>
          </div>
        ) : null}
      </div>

      {isCreateModalOpen ? (
        <CreatePadletModal
          onClose={handleCloseCreateModal}
          onSubmit={handlePadletCreated}
        />
      ) : null}
    </div>
  );
}