import { Avatar } from '@/components/avatar/Avatar';
import type { BoardRow } from './BoardParts';

// The run's hero, cut out of its poster, or the player's initials for a run posted without one, its
// place on its edge.
export function RunAvatar({ row }: { row: BoardRow }) {
  return (
    <span className="run-avatar" data-medal={row.medal || undefined}>
      {row.avatarSrc ? (
        <img
          className="run-avatar__image"
          src={row.avatarSrc}
          alt=""
          width="192"
          height="192"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <Avatar initials={row.initials} palette={row.palette} />
      )}
      <span className="run-avatar__place" aria-hidden="true">
        {row.place}
      </span>
    </span>
  );
}
