import type { RefObject } from 'react';
import type { Arcade } from '../arcade/arcade-context';
import { EVENTS, onOff } from './analytics-events.js';
import { nudgeFrame } from './carousel-motion.js';
import { isPlayable } from './coming-soon.js';
import type { FocusZone, GameCard, LaunchSource } from './game-card';
import { cardFrameOf } from './home-parts';
import { popHeart } from './spotlight-motion.js';
import type { Library } from './use-library';
import type { Launcher } from './use-launcher';
import type { useSelection } from './use-selection';

export interface HomeParts {
  arcade: Arcade;
  cards: GameCard[];
  choice: ReturnType<typeof useSelection>;
  library: Library;
  launcher: Launcher;
  homeRef: RefObject<HTMLElement | null>;
  favoritesChanged: () => void;
}

const STEPS: Record<string, number> = { left: -1, right: 1 };
const wrapIndex = (index: number, count: number) => ((index % count) + count) % count;

// The source (play_button, details, card, keyboard, gamepad) shows how players start a game.
function openerOf({ arcade, cards, choice, launcher, homeRef }: HomeParts) {
  const { preferences, sound, analytics } = arcade;

  return (index: number, source: LaunchSource) => {
    const card = cards[index];

    if (!card || launcher.isFlying()) {
      return false;
    }

    choice.select(index);

    if (!isPlayable(card)) {
      sound.play('locked');
      nudgeFrame(cardFrameOf(homeRef.current!, index));
      analytics.track(EVENTS.comingSoon, { card_id: card.id });

      return false;
    }

    preferences.recordPlay(card.id);
    sound.play('launch');
    launcher.launch({ index, card });
    analytics.track(EVENTS.play, { game_id: card.id, source });

    return true;
  };
}

function favoriteToggleOf(parts: HomeParts) {
  const { arcade, cards, choice, library, homeRef, favoritesChanged } = parts;
  const { preferences, sound, analytics } = arcade;

  return () => {
    const card = cards[choice.selected];

    if (!card || !isPlayable(card)) {
      return;
    }

    preferences.toggleFavorite(card.id);
    const isFavorite = preferences.isFavorite(card.id);

    favoritesChanged();

    if (isFavorite) {
      popHeart(homeRef.current!.querySelector('#favorite .favorite__heart'));
    }

    sound.play(isFavorite ? 'favoriteOn' : 'favoriteOff');
    library.refreshIf('favorites');
    analytics.track(EVENTS.favorite, { game_id: card.id, favorite: onOff(isFavorite) });
  };
}

export function homeActions(parts: HomeParts) {
  const { cards, choice, launcher, homeRef } = parts;
  const open = openerOf(parts);
  const step = (delta: number, options: { focus?: FocusZone } = {}) =>
    choice.selected >= 0 &&
    choice.select(wrapIndex(choice.selected + delta, cards.length), { cue: true, ...options });

  return {
    open,
    step,
    toggleFavorite: favoriteToggleOf(parts),
    pickTile(index: number) {
      if (choice.select(index, { cue: true })) {
        homeRef.current!.querySelector('#hero')?.scrollIntoView?.({ block: 'start' });
      }
    },

    handleAction(action: string, { focus = null, source = 'keyboard' }: ActionOptions = {}) {
      if (choice.selected < 0 || launcher.isFlying()) {
        return false;
      }

      if (action === 'start') {
        return open(choice.selected, source);
      }

      return action in STEPS ? step(STEPS[action]!, { focus }) : false;
    },
  };
}

interface ActionOptions {
  focus?: FocusZone;
  source?: LaunchSource;
}
