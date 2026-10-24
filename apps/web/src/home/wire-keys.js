import { actionForKey, focusZone, handlesEnter, isTextField } from './input-actions.js';

export function wireKeys({ document, controller, isBlocked, signal }) {
  const onKeyDown = (event) => {
    const action = actionForKey(event);
    if (!action || isBlocked() || isTextField(event.target)) {
      return;
    }
    if (action === 'start' && handlesEnter(event.target)) {
      return;
    }
    if (controller.handleAction(action, { focus: focusZone(event.target) })) {
      event.preventDefault();
    }
  };
  document.addEventListener('keydown', onKeyDown, { signal });
}
