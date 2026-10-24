import { createSheet } from '../home/sheet.js';
import { playConfetti } from './confetti-view.js';
import { postDonation } from './donate-client.js';
import { findDonateElements, showTier } from './donate-elements.js';
import { readAmount, readDonationForm } from './donate-form.js';
import { formatMoney } from './format.js';
import { createPayWait } from './pay-wait.js';
import { presentTier } from './tiers.js';

export const DONATE_CURRENCY = 'USD';

function showStep(dialog, step) {
  dialog.dataset.step = step;
  for (const panel of dialog.querySelectorAll('[data-step-panel]')) {
    panel.hidden = panel.dataset.stepPanel !== step;
  }
  dialog.querySelector(`[data-step-panel="${step}"] h2`)?.focus({ preventScroll: true });
}

function showError(element, message) {
  element.textContent = message;
  element.hidden = message === '';
}

const tierFor = (amount, locale) => presentTier(amount, { currency: DONATE_CURRENCY, locale });

// The quick amount that matches the field lights up, and the tier follows the amount as it is typed.
function refreshAmount({ elements, locale }) {
  const amount = readAmount(elements.amount.value);
  for (const button of elements.amounts.querySelectorAll('[data-amount]')) {
    const isPicked = amount !== null && Number(button.dataset.amount) === amount;
    button.setAttribute('aria-pressed', String(isPicked));
  }
  showTier(elements.tier, amount === null ? null : tierFor(amount, locale));
}

function presentPay(elements, donation, locale) {
  const money = formatMoney(donation.amount, { currency: DONATE_CURRENCY, locale });
  elements.payTitle.textContent = `Send ${money}`;
  elements.payAmount.textContent = money;
  showError(elements.payError, '');
}

const thanksFor = (supporter) => (supporter.name ? `Thank you, ${supporter.name}!` : 'Thank you!');

function celebrate(steps, supporter) {
  const { elements, locale, sound, document } = steps;
  elements.thanksTitle.textContent = thanksFor(supporter);
  showTier(elements.thanksTier, tierFor(supporter.amount, locale));
  showStep(elements.dialog, 'thanks');
  sound.play('cheer');
  steps.stopConfetti();
  const heart = elements.thanks.querySelector('.heart-badge');
  steps.stopConfetti = playConfetti({ document, canvas: elements.confetti, from: heart });
}

function toPay(steps, event) {
  event.preventDefault();
  const { elements } = steps;
  const { donation, field, error } = readDonationForm({
    name: elements.name.value,
    amount: elements.amount.value,
    message: elements.message.value,
  });
  showError(elements.formError, error ?? '');
  if (error) {
    elements[field].focus();
    return;
  }
  steps.donation = donation;
  presentPay(elements, donation, steps.locale);
  showStep(elements.dialog, 'pay');
  steps.wait.start();
}

async function send(steps) {
  const { elements } = steps;
  if (steps.sending || steps.wait.isWaiting()) {
    return;
  }
  steps.sending = true;
  elements.sent.disabled = true;
  try {
    const supporter = await postDonation(steps.fetch, steps.donation);
    elements.form.reset();
    refreshAmount(steps);
    celebrate(steps, supporter);
    steps.onGiven(supporter);
  } catch (error) {
    showError(elements.payError, error.message);
  } finally {
    steps.sending = false;
    elements.sent.disabled = false;
  }
}

function backToForm(steps) {
  steps.wait.stop();
  steps.stopConfetti();
  showStep(steps.elements.dialog, 'form');
}

function wire(steps, { listen, sheet }) {
  const { elements, sound } = steps;
  listen(elements.amounts, 'click', (event) => {
    const button = event.target.closest('[data-amount]');
    if (button) {
      elements.amount.value = button.dataset.amount;
      refreshAmount(steps);
      sound.play('switch');
    }
  });
  listen(elements.amount, 'input', () => refreshAmount(steps));
  listen(elements.form, 'submit', (event) => toPay(steps, event));
  listen(elements.sent, 'click', () => send(steps));
  listen(elements.back, 'click', () => backToForm(steps));
  listen(elements.done, 'click', sheet.close);
}

export function createDonateSheet({ document, fetch, sound, signal, locale, onGiven }) {
  const elements = findDonateElements(document);
  const { dialog, close: closeButton } = elements;
  const sheet = createSheet({ dialog, closeButton, document, sound, signal });
  const wait = createPayWait({ button: elements.sent });
  const steps = { elements, document, fetch, sound, locale, onGiven, wait, stopConfetti: () => {} };
  const listen = (target, type, handler) => target.addEventListener(type, handler, { signal });
  signal.addEventListener('abort', () => backToForm(steps));
  wire(steps, { listen, sheet });

  function open() {
    showError(elements.formError, '');
    backToForm(steps);
    sheet.open();
  }

  return { ...sheet, open, elements };
}
