export function findDonateElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    dialog: byId('donate-sheet'),
    close: byId('donate-close'),
    confetti: byId('donate-confetti'),
    form: byId('donate-form'),
    amounts: byId('donate-amounts'),
    amount: byId('donate-amount'),
    tier: byId('donate-tier'),
    name: byId('donate-name'),
    message: byId('donate-message'),
    formError: byId('donate-form-error'),
    payTitle: byId('donate-pay-title'),
    payAmount: byId('donate-pay-amount'),
    sent: byId('donate-sent'),
    back: byId('donate-back'),
    payError: byId('donate-pay-error'),
    thanks: byId('donate-thanks'),
    thanksTitle: byId('donate-thanks-title'),
    thanksTier: byId('donate-thanks-tier'),
    done: byId('donate-done'),
  };
}

// Reading the width between removing and adding the class restarts the pop for each new tier.
function popGem(gem, tierId) {
  gem.dataset.tier = tierId;
  gem.classList.remove('is-popping');
  void gem.offsetWidth;
  gem.classList.add('is-popping');
}

// A tier line is a gem, its name and a nudge toward the next tier; tier.css colors the gem.
export function showTier(line, tier) {
  line.hidden = tier === null;
  if (tier === null) {
    return;
  }
  const gem = line.querySelector('.tier-gem');
  if (gem.dataset.tier !== tier.id) {
    popGem(gem, tier.id);
  }
  line.querySelector('.tier__label').textContent = tier.label;
  const nudge = line.querySelector('.tier__nudge');
  if (nudge) {
    nudge.textContent = tier.nudge;
  }
}
