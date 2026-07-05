import { PadletBoardType } from '../../../padlet/enums/padlet-board-type';
import { usePadletCapabilities } from '../../../padlet/context/PadletCapabilitiesContext';
import type { Post } from '../../interfaces/post';
import BrainstormingPostsLayout from '../board-layouts/brainstorming/BrainstormingPostsLayout';
import FreeWallPostsLayout from '../board-layouts/free_wall/FreeWallPostsLayout';
import GridPostsLayout from '../board-layouts/grid/GridPostsLayout';
import TimelinePostsLayout from '../board-layouts/timeline/TimelinePostsLayout';
import styles from './PadletPostsLayer.module.css';

interface PadletPostsLayerProps {
  padletId: string;
  boardType: PadletBoardType;
  posts: Post[];
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onPostSwap?: (sourcePostId: string, targetPostId: string) => void;
}

export default function PadletPostsLayer({
  padletId,
  boardType,
  posts,
  onEditPost,
  onDeletePost,
  onPostSwap,
}: PadletPostsLayerProps) {
  const { canEditPost, canDragPost, canComment } = usePadletCapabilities();

  if (posts.length === 0) {
    return (
      <div className={styles.layer}>
        <p className={styles.empty}>
          עדיין אין פוסטים בלוח. לחצי על &quot;פוסט חדש&quot; כדי להתחיל.
        </p>
      </div>
    );
  }

  const layoutProps = {
    padletId,
    posts,
    canComment,
    canEditPost,
    canDragPost,
    onEditPost,
    onDeletePost,
    onPostSwap,
  };
  let content;

  switch (boardType) {
    case PadletBoardType.FreeWall:
      content = <FreeWallPostsLayout {...layoutProps} />;
      break;
    case PadletBoardType.Brainstorming:
      content = <BrainstormingPostsLayout {...layoutProps} />;
      break;
    case PadletBoardType.Grid:
      content = <GridPostsLayout {...layoutProps} />;
      break;
    case PadletBoardType.Timeline:
      content = <TimelinePostsLayout {...layoutProps} />;
      break;
    default:
      content = <TimelinePostsLayout {...layoutProps} />;
      break;
  }

  const layerClassName =
    boardType === PadletBoardType.Timeline
      ? `${styles.layer} ${styles.layerTimeline}`
      : styles.layer;

  return <div className={layerClassName}>{content}</div>;
}
