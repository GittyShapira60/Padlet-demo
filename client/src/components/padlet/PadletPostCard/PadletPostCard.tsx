import type { Post } from '../../../interfaces/post';
import styles from './PadletPostCard.module.css';

interface PadletPostCardProps {
  post: Post;
}

export default function PadletPostCard({ post }: PadletPostCardProps) {
  return (
    <article
      className={styles.card}
      style={{ background: post.color ?? '#ffffff' }}
    >
      {post.title ? <h3 className={styles.title}>{post.title}</h3> : null}
      {post.subject ? <p className={styles.subject}>{post.subject}</p> : null}
      <p className={styles.author}>{post.authorUsername}</p>
    </article>
  );
}
