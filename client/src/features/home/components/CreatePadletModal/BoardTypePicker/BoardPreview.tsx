import type { BoardPreviewType } from '../../../constants/padlet-board-options';

interface BoardPreviewProps {
  type: BoardPreviewType;
  active: boolean;
}

export default function BoardPreview({ type, active }: BoardPreviewProps) {
  const bg = active ? '#fff4ee' : '#fdf6ff';
  const pink = '#f472b6';
  const yellow = '#fbbf24';
  const green = '#34d399';
  const teal = '#38bdf8';
  const purple = '#a78bfa';

  if (type === 'freewall') {
    return (
      <svg className="board-preview" viewBox="0 0 72 50" xmlns="http://www.w3.org/2000/svg">
        <rect width="72" height="50" rx="6" fill={bg} />
        <rect x="6" y="8" width="22" height="14" rx="3" fill={pink} />
        <rect x="32" y="6" width="18" height="12" rx="3" fill={yellow} />
        <rect x="10" y="28" width="18" height="14" rx="3" fill={green} />
        <rect x="34" y="24" width="24" height="18" rx="3" fill={teal} />
      </svg>
    );
  }

  if (type === 'grid') {
    return (
      <svg className="board-preview" viewBox="0 0 72 50" xmlns="http://www.w3.org/2000/svg">
        <rect width="72" height="50" rx="6" fill={bg} />
        <rect x="6" y="8" width="18" height="14" rx="3" fill={pink} />
        <rect x="28" y="8" width="18" height="14" rx="3" fill={yellow} />
        <rect x="50" y="8" width="16" height="14" rx="3" fill={green} />
        <rect x="6" y="28" width="18" height="14" rx="3" fill={teal} />
        <rect x="28" y="28" width="18" height="14" rx="3" fill={purple} />
        <rect x="50" y="28" width="16" height="14" rx="3" fill={pink} />
      </svg>
    );
  }

  if (type === 'brainstorm') {
    return (
      <svg className="board-preview" viewBox="0 0 72 50" xmlns="http://www.w3.org/2000/svg">
        <rect width="72" height="50" rx="6" fill={bg} />
        <ellipse cx="36" cy="25" rx="10" ry="8" fill={pink} />
        <ellipse cx="14" cy="16" rx="7" ry="6" fill={yellow} />
        <ellipse cx="58" cy="18" rx="7" ry="6" fill={green} />
        <ellipse cx="16" cy="36" rx="6" ry="5" fill={teal} />
        <ellipse cx="56" cy="36" rx="6" ry="5" fill={purple} />
      </svg>
    );
  }

  return (
    <svg className="board-preview" viewBox="0 0 72 50" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="50" rx="6" fill={bg} />
      <line x1="6" y1="32" x2="66" y2="32" stroke="#e5e7eb" strokeWidth="2" />
      <circle cx="18" cy="32" r="3.5" fill={pink} />
      <circle cx="36" cy="32" r="3.5" fill={yellow} />
      <circle cx="54" cy="32" r="3.5" fill={green} />
      <rect x="8" y="14" width="18" height="13" rx="3" fill={pink} opacity="0.85" />
      <rect x="27" y="14" width="18" height="13" rx="3" fill={yellow} opacity="0.85" />
      <rect x="46" y="14" width="18" height="13" rx="3" fill={green} opacity="0.85" />
    </svg>
  );
}
