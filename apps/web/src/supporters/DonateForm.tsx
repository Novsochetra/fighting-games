import { useArcade } from '../arcade/arcade-context';
import { DONATION_LIMITS, QUICK_AMOUNTS, readAmount } from './donate-form.js';
import { presentTier, tierOf } from './tiers.js';
import { TierLine } from './TierLine';
import type { DonateFlow } from './use-donate-flow';

export const DONATE_CURRENCY = 'USD';

function QuickAmount({ flow, amount }: { flow: DonateFlow; amount: number }) {
  const { sound } = useArcade();
  const tier = tierOf(amount)!;

  return (
    <button
      className="donate__amount"
      type="button"
      data-amount={amount}
      aria-pressed={readAmount(flow.form.fields.amount) === amount}
      aria-label={`$${amount}, ${tier.name}`}
      onClick={() => {
        flow.form.setField('amount', String(amount));
        sound.play('switch');
      }}
    >
      <span className="tier-gem tier-gem--small" data-tier={tier.id} aria-hidden="true" />${amount}
    </button>
  );
}

// The quick amount that matches the field lights up, and the tier follows the amount as it is typed.
function QuickAmounts({ flow }: { flow: DonateFlow }) {
  return (
    <div className="donate__amounts" id="donate-amounts" role="group" aria-label="Quick amounts">
      {QUICK_AMOUNTS.map((amount) => (
        <QuickAmount key={amount} flow={flow} amount={amount} />
      ))}
    </div>
  );
}

function AmountField({ flow }: { flow: DonateFlow }) {
  const { locale } = useArcade();
  const amount = readAmount(flow.form.fields.amount);
  const tier = amount === null ? null : presentTier(amount, { currency: DONATE_CURRENCY, locale });

  return (
    <div className="donate__field">
      <label className="donate__label" htmlFor="donate-amount">
        Amount in US dollars
      </label>
      <QuickAmounts flow={flow} />
      <input
        className="donate__input"
        id="donate-amount"
        name="amount"
        inputMode="decimal"
        autoComplete="off"
        placeholder={`Other amount, from $${DONATION_LIMITS.minAmount}`}
        required
        value={flow.form.fields.amount}
        onChange={(event) => flow.form.setField('amount', event.target.value)}
      />
      <TierLine id="donate-tier" tier={tier} />
    </div>
  );
}

function TextFields({ flow }: { flow: DonateFlow }) {
  const { fields, setField } = flow.form;

  return (
    <>
      <div className="donate__field">
        <label className="donate__label" htmlFor="donate-name">
          Name on the list
        </label>
        <input
          className="donate__input"
          id="donate-name"
          name="name"
          maxLength={DONATION_LIMITS.nameLength}
          autoComplete="name"
          aria-describedby="donate-name-hint"
          value={fields.name}
          onChange={(event) => setField('name', event.target.value)}
        />
        <p className="donate__hint" id="donate-name-hint">
          Leave it empty to give anonymously.
        </p>
      </div>
      <div className="donate__field">
        <label className="donate__label" htmlFor="donate-message">
          Message (optional)
        </label>
        <input
          className="donate__input"
          id="donate-message"
          name="message"
          maxLength={DONATION_LIMITS.messageLength}
          value={fields.message}
          onChange={(event) => setField('message', event.target.value)}
        />
      </div>
    </>
  );
}

export function DonateForm({ flow }: { flow: DonateFlow }) {
  const error = flow.form.error?.error ?? '';

  return (
    <form
      className="sheet__body donate"
      id="donate-form"
      data-step-panel="form"
      noValidate
      hidden={flow.step !== 'form'}
      onSubmit={flow.toPay}
    >
      <h2 className="sheet__title" id="donate-title" tabIndex={-1}>
        Become a supporter
      </h2>
      <p className="sheet__description">
        Every game stays free. Pick an amount, then send it with any bank app that scans KHQR.
      </p>
      <AmountField flow={flow} />
      <TextFields flow={flow} />
      <p className="donate__error" id="donate-form-error" role="alert" hidden={error === ''}>
        {error}
      </p>
      <button className="pill-button pill-button--primary donate__next" type="submit">
        Continue
      </button>
    </form>
  );
}
