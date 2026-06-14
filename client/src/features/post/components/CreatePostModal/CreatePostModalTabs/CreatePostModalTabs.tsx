import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../../../enums/post-content-tab';
import styles from './CreatePostModalTabs.module.css';

const TABS: { id: PostContentTab; label: string; icon: string }[] = [
  { id: PostContentTabValues.Text, label: 'טקסט', icon: 'T' },
  { id: PostContentTabValues.Image, label: 'תמונה', icon: '🖼️' },
  { id: PostContentTabValues.Link, label: 'לינק', icon: '🔗' },
  { id: PostContentTabValues.Poll, label: 'סקר', icon: '📊' },
];

interface CreatePostModalTabsProps {
  activeTab: PostContentTab;
  onTabChange: (tab: PostContentTab) => void;
}

export default function CreatePostModalTabs({
  activeTab,
  onTabChange,
}: CreatePostModalTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="סוג פוסט">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.id === PostContentTabValues.Text ? (
              <span
                className={`${styles.tabIconText} ${isActive ? styles.tabIconTextActive : ''}`}
                aria-hidden="true"
              >
                {tab.icon}
              </span>
            ) : (
              <span className={styles.tabEmoji} aria-hidden="true">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {isActive ? <span className={styles.underline} aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}
