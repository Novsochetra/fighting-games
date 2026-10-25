// Opened from the arcade, Back goes back in history instead of to the arcade's address: the browser
// then brings the arcade back as it was left (its back/forward cache), at the same place and with
// nothing loading or rising in again, where following the link would load it fresh at the top.
export function cameFrom(target, { referrer, historyLength }) {
  if (!referrer || historyLength < 2) {
    return false;
  }
  const from = new URL(referrer);
  return from.origin === target.origin && from.pathname === target.pathname;
}

// A click with a modifier key or another button opens a tab or a window, which the link does itself.
const isPlainClick = (event) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export function wireBackLink({ link, history, referrer, signal }) {
  const target = new URL(link.getAttribute('href'), link.ownerDocument.baseURI);
  const onClick = (event) => {
    if (isPlainClick(event) && cameFrom(target, { referrer, historyLength: history.length })) {
      event.preventDefault();
      history.back();
    }
  };
  link.addEventListener('click', onClick, { signal });
}
