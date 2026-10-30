import { Avatar } from '@/components/avatar/Avatar';
import type { BoardRow } from './BoardParts';

// The run's hero, cut out of its poster, or the player's initials for a run posted without one; a
// medal on its edge for the top three.
export function RunAvatar({ row, medal = false }: { row: BoardRow; medal?: boolean }) {
  return (
    <span className="run-avatar" data-medal={medal ? row.medal : undefined}>
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
      {medal ? (
        <span className="run-avatar__medal" aria-hidden="true">
          {row.place}
        </span>
      ) : null}
    </span>
  );
}
