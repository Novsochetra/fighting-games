import { createSheet } from '../home/sheet.js';
import { postDonation } from './donate-client.js';
import { readDonationForm } from './donate-form.js';
import { formatMoney } from './format.js';

export const DONATE_CURRENCY = 'USD';

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    dialog: byId('donate-sheet'),
    close: byId('donate-close'),
    form: byId('donate-form'),
    amounts: byId('donate-amounts'),
    amount: byId('donate-amount'),
    name: byId('donate-name'),
    message: byId('donate-message'),
    formError: byId('donate-form-error'),
    payTitle: byId('donate-pay-title'),
    payAmount: byId('donate-pay-amount'),
    sent: byId('donate-sent'),
    back: byId('donate-back'),
    payError: byId('donate-pay-error'),
    thanksTitle: byId('donate-thanks-title'),
    done: byId('donate-done'),
  };
}

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

function markQuickAmount({ amounts, amount }) {
  for (const button of amounts.querySelectorAll('[data-amount]')) {
    const isPicked = amount.value !== '' && Number(button.dataset.amount) === Number(amount.value);
    button.setAttribute('aria-pressed', String(isPicked));
  }
}

function presentPay(elements, donation, locale) {
  const money = formatMoney(donation.amount, { currency: DONATE_CURRENCY, locale });
  elements.payTitle.textContent = `Send ${money}`;
  elements.payAmount.textContent = money;
  showError(elements.payError, '');
}

const thanksFor = (supporter) => (supporter.name ? `Thank you, ${supporter.name}!` : 'Thank you!');

function wireAmounts({ elements, sound, listen }) {
  listen(elements.amounts, 'click', (event) => {
    const button = event.target.closest('[data-amount]');
    if (button) {
      elements.amount.value = button.dataset.amount;
      markQuickAmount(elements);
      sound.play('switch');
    }
  });
  listen(elements.amount, 'input', () => markQuickAmount(elements));
}

function createSteps({ elements, fetch, locale, onGiven }) {
  const state = { donation: null, sending: false };

  function toPay(event) {
    event.preventDefault();
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
    state.donation = donation;
    presentPay(elements, donation, locale);
    showStep(elements.dialog, 'pay');
  }

  async function send() {
    if (state.sending) {
      return;
    }
    state.sending = true;
    elements.sent.disabled = true;
    try {
      const supporter = await postDonation(fetch, state.donation);
      elements.thanksTitle.textContent = thanksFor(supporter);
      elements.form.reset();
      markQuickAmount(elements);
      showStep(elements.dialog, 'thanks');
      onGiven(supporter);
    } catch (error) {
      showError(elements.payError, error.message);
    } finally {
      state.sending = false;
      elements.sent.disabled = false;
    }
  }

  return { toPay, send };
}

export function createDonateSheet({ document, fetch, sound, signal, locale, onGiven }) {
  const elements = findElements(document);
  const sheet = createSheet({
    dialog: elements.dialog,
    closeButton: elements.close,
    document,
    sound,
    signal,
  });
  const listen = (target, type, handler) => target.addEventListener(type, handler, { signal });
  const steps = createSteps({ elements, fetch, locale, onGiven });

  function open() {
    showError(elements.formError, '');
    showStep(elements.dialog, 'form');
    sheet.open();
  }

  wireAmounts({ elements, sound, listen });
  listen(elements.form, 'submit', steps.toPay);
  listen(elements.sent, 'click', steps.send);
  listen(elements.back, 'click', () => showStep(elements.dialog, 'form'));
  listen(elements.done, 'click', sheet.close);
  return { ...sheet, open, elements };
}
