// I sent it waits this long after the code shows, so a supporter opens their bank app and pays
// before they can say they did, instead of tapping straight through.
export const PAY_WAIT_SECONDS = 10;

export const SENT_LABEL = 'I sent it';

export const sentLabel = (secondsLeft) =>
  secondsLeft > 0 ? `${SENT_LABEL} (${secondsLeft})` : SENT_LABEL;
