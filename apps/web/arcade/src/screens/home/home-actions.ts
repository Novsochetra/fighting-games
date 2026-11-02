import type { RefObject } from 'react';
import type { Arcade } from '@/services/arcade-context';
import { EVENTS, onOff } from '@/services/analytics/analytics-events.js';
import { nudgeFrame } from './carousel/carousel-motion.js';
import { isPlayable } from '@/api/catalog/coming-soon.js';
import type { FocusZone, GameCard, LaunchSource } from '@/api/catalog/game-card';
import { cardFrameOf } from './home-parts';
import { popHeart } from './spotlight/spotlight-motion.js';
import type { Details } from './details/use-details';
import type { Library } from './library/use-library';
import type { Launcher } from './launch/use-launcher';
import type { useSelection } from './use-selection';

export interface HomeParts {
  arcade: Arcade;
  cards: GameCard[];
  choice: ReturnType<typeof useSelection>;
  library: Library;
  launcher: Launcher;
  details: Details;
  homeRef: RefObject<HTMLElement | null>;
  favoritesChanged: () => void;
}

const STEPS: Record<string, number> = { left: -1, right: 1 };
const wrapIndex = (index: number, count: number) => ((index % count) + count) % count;

function knockOf({ arcade, homeRef }: HomeParts) {
  const { sound, analytics } = arcade;

  return (index: number, card: GameCard) => {
    sound.play('locked');
    nudgeFrame(cardFrameOf(homeRef.current!, index));
    analytics.track(EVENTS.comingSoon, { card_id: card.id });
  };
}

// The source (play_button, details, keyboard, gamepad) shows how players start a game.
function openerOf(parts: HomeParts) {
  const { arcade, cards, choice, launcher } = parts;
  const { preferences, sound, analytics } = arcade;
  const knock = knockOf(parts);

  return (index: number, source: LaunchSource) => {
    const card = cards[index];

    if (!card || launcher.isFlying()) {
      return false;
    }

    choice.select(index);

    if (!isPlayable(card)) {
      knock(index, card);

      return false;
    }

    preferences.recordPlay(card.id);
    sound.play('launch');
    launcher.launch({ index, card });
    analytics.track(EVENTS.play, { game_id: card.id, source });

    return true;
  };
}

// A tap on a card shows its game before it starts; only Play, Enter or the pad start it at once.
function detailsOpenerOf(parts: HomeParts) {
  const { cards, launcher, details } = parts;
  const knock = knockOf(parts);

  return (index: number) => {
    const card = cards[index];

    if (!card || launcher.isFlying()) {
      return;
    }

    if (isPlayable(card)) {
      details.open(card);
    } else {
      knock(index, card);
    }
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
    showDetails: detailsOpenerOf(parts),
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
