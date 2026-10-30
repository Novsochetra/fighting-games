import './avatar.css';

interface AvatarProps {
  initials: string;
  // one of avatar.js's palettes, picked by the name
  palette: number;
  size?: 'large';
}

// A round monogram, for someone the arcade has no picture of
export function Avatar({ initials, palette, size }: AvatarProps) {
  return (
    <span
      className={size ? `avatar avatar--${size}` : 'avatar'}
      data-palette={palette}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
