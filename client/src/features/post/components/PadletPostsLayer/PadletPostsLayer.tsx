import { PadletBoardType } from '../../../padlet/enums/padlet-board-type';
import { usePadletCapabilities } from '../../../padlet/context/PadletCapabilitiesContext';
import type { Post, PostLayout } from '../../interfaces/post';
import BrainstormingPostsLayout from '../board-layouts/brainstorming/BrainstormingPostsLayout';
import FreeWallPostsLayout from '../board-layouts/free_wall/FreeWallPostsLayout';
import GridPostsLayout from '../board-layouts/grid/GridPostsLayout';
import TimelinePostsLayout from '../board-layouts/timeline/TimelinePostsLayout';
import styles from './PadletPostsLayer.module.css';

interface PadletPostsLayerProps {
  boardType: PadletBoardType;
  posts: Post[];
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onLayoutChange?: (postId: string, layout: PostLayout) => void;
}

export default function PadletPostsLayer({
  boardType,
  posts,
  onEditPost,
  onDeletePost,
  onLayoutChange,
}: PadletPostsLayerProps) {
  const { canEditPost, canDragPost } = usePadletCapabilities();

  if (posts.length === 0) {    return (
      <div className={styles.layer}>
        <p className={styles.empty}>
          עדיין אין פוסטים בלוח. לחצי על &quot;פוסט חדש&quot; כדי להתחיל.
        </p>
      </div>
    );
  }

  const layoutProps = {
    posts,
    canEditPost,
    canDragPost,
    onEditPost,
    onDeletePost,
    onLayoutChange,
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

  return <div className={styles.layer}>{content}</div>;
}
