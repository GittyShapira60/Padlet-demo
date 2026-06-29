import type { ComponentType } from 'react';
import { BarChart3, Image, Link, Type } from '@/shared/icons';
import {
  PostContentTab as PostContentTabValues,
  type PostContentTab,
} from '../../../enums/post-content-tab';
import styles from './CreatePostModalTabs.module.css';

type TabIcon = ComponentType<{ size?: number | string; className?: string }>;

const TABS: { id: PostContentTab; label: string; icon: TabIcon }[] = [
  { id: PostContentTabValues.Text, label: 'טקסט', icon: Type },
  { id: PostContentTabValues.Image, label: 'תמונה', icon: Image },
  { id: PostContentTabValues.Link, label: 'לינק', icon: Link },
  { id: PostContentTabValues.Poll, label: 'סקר', icon: BarChart3 },
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
    <div className={styles.tabs}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={18} className={styles.tabIcon} aria-hidden />
            <span>{tab.label}</span>
            {isActive ? <span className={styles.underline} /> : null}
          </button>
        );
      })}
    </div>
  );
}
