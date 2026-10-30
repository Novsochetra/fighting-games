import type { CSSProperties } from 'react';

// A supporter as the screen shows them (view-model.js).
export interface Supporter {
  name: string;
  amount: number;
  date: string;
  message: string;
  rank: number;
  amountLabel: string;
  dateLabel: string;
  initials: string;
  palette: number;
  medal: string;
  tier: string;
  tierName: string;
}

// The rows rise in one after another, but never wait longer than this many steps.
const MAX_STAGGER = 12;

export function Avatar({ supporter, size }: { supporter: Supporter; size?: 'large' }) {
  return (
    <span
      className={size ? `avatar avatar--${size}` : 'avatar'}
      data-palette={supporter.palette}
      aria-hidden="true"
    >
      {supporter.initials}
    </span>
  );
}

// The tier rides beside the name as a gem and a word, so it never reads as the place medal.
export function TierChip({ supporter }: { supporter: Supporter }) {
  return (
    <span className="tier-chip">
      <span className="tier-gem tier-gem--small" data-tier={supporter.tier} aria-hidden="true" />
      {supporter.tierName}
    </span>
  );
}

export function PodiumPlace({ supporter }: { supporter: Supporter }) {
  return (
    <li className="podium__place" data-medal={supporter.medal}>
      <span className="podium__portrait">
        <Avatar supporter={supporter} size="large" />
        <span className="podium__medal" aria-hidden="true">
          {supporter.rank}
        </span>
      </span>
      <span className="podium__name">{supporter.name}</span>
      <span className="podium__amount">{supporter.amountLabel}</span>
      <TierChip supporter={supporter} />
      {supporter.message ? <span className="podium__message">{supporter.message}</span> : null}
    </li>
  );
}

export function RollRow({ supporter, order }: { supporter: Supporter; order: number }) {
  const stagger = { '--order': Math.min(order, MAX_STAGGER) } as CSSProperties;

  return (
    <li className="roll__row" data-medal={supporter.medal} style={stagger}>
      <span className="roll__rank" aria-hidden="true">
        {supporter.rank}
      </span>
      <Avatar supporter={supporter} />
      <span className="roll__text">
        <span className="roll__title">
          <span className="roll__name">{supporter.name}</span>
          <TierChip supporter={supporter} />
        </span>
        {supporter.message ? <span className="roll__message">{supporter.message}</span> : null}
      </span>
      <span className="roll__end">
        <span className="roll__amount">{supporter.amountLabel}</span>
        {supporter.date ? (
          <time className="roll__date" dateTime={supporter.date}>
            {supporter.dateLabel}
          </time>
        ) : null}
      </span>
    </li>
  );
}
