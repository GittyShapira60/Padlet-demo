import { PadletBoardType } from '../../../enums/padlet-board-type';
import type { Post } from '../../../interfaces/post';
import PadletPostCard from '../PadletPostCard/PadletPostCard';
import styles from './PadletPostsLayer.module.css';

interface PadletPostsLayerProps {
  boardType: PadletBoardType;
  posts: Post[];
}

function getDefaultLayout(index: number): { x: number; y: number } {
  const column = index % 3;
  const row = Math.floor(index / 3);

  return {
    x: 6 + column * 28,
    y: 8 + row * 22,
  };
}

export default function PadletPostsLayer({
  boardType,
  posts,
}: PadletPostsLayerProps) {
  if (posts.length === 0) {
    return (
      <div className={styles.layer}>
        <p className={styles.empty}>
          עדיין אין פוסטים בלוח. לחצי על &quot;פוסט חדש&quot; כדי להתחיל.
        </p>
      </div>
    );
  }

  const isFreeLayout =
    boardType === PadletBoardType.FreeWall ||
    boardType === PadletBoardType.Brainstorming;

  if (isFreeLayout) {
    return (
      <div className={styles.layer}>
        <div className={styles.freeWall}>
          {posts.map((post, index) => {
            const layout = post.layout ?? getDefaultLayout(index);

            return (
              <div
                key={post.id}
                className={styles.freeWallPost}
                style={{
                  top: `${layout.y}%`,
                  right: `${layout.x}%`,
                }}
              >
                <PadletPostCard post={post} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (boardType === PadletBoardType.Grid) {
    return (
      <div className={styles.layer}>
        <div className={styles.grid}>
          {posts.map((post) => (
            <PadletPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layer}>
      <div className={styles.timeline}>
        {posts.map((post) => (
          <PadletPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
