import { useState } from 'react';
import type { presentTier } from '@/screens/supporters/tiers.js';

export type ShownTier = ReturnType<typeof presentTier>;

// The gem pops each time the tier changes: a new tier mounts a new gem, which plays the pop
// (tier.css), while the same tier shown again keeps its gem still.
function useGemTier(tier: ShownTier | null) {
  const [gemTier, setGemTier] = useState(tier?.id);

  if (tier && tier.id !== gemTier) {
    setGemTier(tier.id);
  }

  return gemTier;
}

interface TierLineProps {
  id: string;
  tier: ShownTier | null;
  // the thanks step shows the tier won large, without a nudge toward the next
  large?: boolean;
}

// A tier line is a gem, its name and a nudge toward the next tier; tier.css colors the gem.
export function TierLine({ id, tier, large = false }: TierLineProps) {
  const gemTier = useGemTier(tier);
  const gemClass = `tier-gem${large ? ' tier-gem--large' : ''}${gemTier ? ' is-popping' : ''}`;

  return (
    <p
      className={large ? 'tier tier--large' : 'tier'}
      id={id}
      aria-live={large ? undefined : 'polite'}
      hidden={tier === null}
    >
      <span className={gemClass} key={gemTier} data-tier={gemTier} aria-hidden="true" />
      <span className="tier__label">{tier?.label}</span>
      {large ? null : <span className="tier__nudge">{tier?.nudge}</span>}
    </p>
  );
}
