import { useMemo, useState } from 'react';
import { useArcade } from '@/services/arcade-context';
import type { FocusZone, GameCard } from '@/api/catalog/game-card';

// Each choice counts, so the carousel and the spotlight move on it even to the same card.
export interface Selection {
  index: number;
  focus: FocusZone;
  animate: boolean;
  count: number;
}

export interface SelectOptions {
  cue?: boolean;
  focus?: FocusZone;
}

// The arcade opens on the game played last, like a console's home screen.
function startOf(cards: GameCard[], recent: string[]): Selection {
  const lastPlayed = cards.findIndex((card) => card.id === recent[0]);

  return { index: Math.max(0, lastPlayed), focus: null, animate: false, count: 0 };
}

export function useSelection(cards: GameCard[]) {
  const { preferences, sound } = useArcade();
  const [chosen, setChosen] = useState<{ cards: GameCard[]; selection: Selection } | null>(null);
  const start = useMemo(() => startOf(cards, preferences.recent()), [cards, preferences]);
  const picked = chosen?.cards === cards ? chosen.selection : null;
  const selection = cards.length === 0 ? null : (picked ?? start);
  const isInRange = (index: number) =>
    Number.isInteger(index) && index >= 0 && index < cards.length;

  return {
    selection,
    selected: selection?.index ?? -1,
    select(index: number, { cue = false, focus = null }: SelectOptions = {}) {
      if (!selection || !isInRange(index)) {
        return false;
      }

      const animate = index !== selection.index;

      setChosen({ cards, selection: { index, focus, animate, count: selection.count + 1 } });

      if (animate && cue) {
        sound.play('switch');
      }

      return true;
    },
  };
}
