import { actionButton, setSlot } from '../dom.js';

function markAsk(button, asks) {
  if (asks) {
    button.dataset.ask = 'askNewStory';
    button.dataset.yes = 'yesNewStory';
  } else {
    delete button.dataset.ask;
    delete button.dataset.yes;
  }
}

// data: { hasSave, chapter: its number, level }; New story asks first when it would overwrite a
// save, and Back has nowhere to go from the main menu
export const MENU_SCREEN = {
  render(section, { data, view }) {
    const saved = Boolean(data.hasSave);
    const note = saved && data.chapter ? { chapter: data.chapter, level: data.level ?? 1 } : null;

    actionButton(section, 'continue').hidden = !saved;
    setSlot(section, 'continue-note', note ? view.sayWith('continueNote', note) : '');
    markAsk(actionButton(section, 'new-story'), saved);
  },
  back: () => true,
};
