import { pickLaunchSource } from './launch/launch-source.js';

// The pictures of a game on the arcade: its card in the carousel and its tile in the library.
export const cardFrameOf = (home: HTMLElement, index: number) =>
  home.querySelector<HTMLElement>(`#carousel-track .card[data-game-index="${index}"] .card__frame`);

export const tileFrameOf = (home: HTMLElement, index: number) =>
  home.querySelector<HTMLElement>(`#library-grid .tile[data-game-index="${index}"] .tile__frame`);

export const findLaunchSource = (home: HTMLElement, index: number) =>
  pickLaunchSource(
    [cardFrameOf(home, index), tileFrameOf(home, index)],
    home.ownerDocument.defaultView!.innerHeight,
  );
