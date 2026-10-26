import { useArcade, useArcadeUrl } from '../arcade/arcade-context';
import { HeartIcon } from '../arcade/icons';
import { DONATE_CURRENCY } from './DonateForm';
import { formatMoney } from './format.js';
import { sentLabel } from './pay-wait.js';
import { presentTier } from './tiers.js';
import { TierLine } from './TierLine';
import type { DonateFlow } from './use-donate-flow';

function PayActions({ flow }: { flow: DonateFlow }) {
  const waiting = flow.wait.left > 0;

  return (
    <div className="donate__actions">
      <button
        className={`pill-button pill-button--primary donate__sent${waiting ? ' is-waiting' : ''}`}
        id="donate-sent"
        type="button"
        disabled={waiting || flow.sender.sending}
        onClick={flow.send}
      >
        {sentLabel(flow.wait.left)}
      </button>
      <button
        className="pill-button pill-button--surface"
        id="donate-back"
        type="button"
        onClick={flow.backToForm}
      >
        Back
      </button>
    </div>
  );
}

function KhqrCode() {
  const url = useArcadeUrl();
  const code = url('assets/donate/khqr.jpg');

  return (
    <>
      <img
        className="donate__qr"
        src={code}
        width="1012"
        height="1416"
        alt="KHQR code to pay NOV SOCHETRA at Wing Bank"
        loading="lazy"
      />
      <a className="donate__save" href={code} download="retro-arcade-khqr.jpg">
        Save the code
      </a>
    </>
  );
}

export function DonatePay({ flow }: { flow: DonateFlow }) {
  const { locale } = useArcade();
  const amount = flow.donation?.amount ?? 0;
  const money = formatMoney(amount, { currency: DONATE_CURRENCY, locale });
  const error = flow.sender.error;

  return (
    <section
      className="sheet__body donate"
      data-step-panel="pay"
      aria-labelledby="donate-pay-title"
      hidden={flow.step !== 'pay'}
    >
      <h2 className="sheet__title" id="donate-pay-title" tabIndex={-1}>
        Send {money}
      </h2>
      <p className="sheet__description">
        Scan the code with your bank app and send <strong id="donate-pay-amount">{money}</strong>.
        Then tap I sent it to put your name on the list.
      </p>
      <KhqrCode />
      <p className="donate__hint">
        On a phone, save the code, then open it from your bank app&apos;s scan screen.
      </p>
      <p className="donate__error" id="donate-pay-error" role="alert" hidden={error === ''}>
        {error}
      </p>
      <PayActions flow={flow} />
    </section>
  );
}

export function DonateThanks({ flow, onDone }: { flow: DonateFlow; onDone: () => void }) {
  const { locale } = useArcade();
  const { supporter } = flow;
  const tier = supporter && presentTier(supporter.amount, { currency: DONATE_CURRENCY, locale });

  return (
    <section
      className="sheet__body donate donate--thanks"
      id="donate-thanks"
      data-step-panel="thanks"
      aria-labelledby="donate-thanks-title"
      hidden={flow.step !== 'thanks'}
    >
      <span className="heart-badge" aria-hidden="true">
        <HeartIcon />
      </span>
      <h2 className="sheet__title" id="donate-thanks-title" tabIndex={-1}>
        {supporter?.name ? `Thank you, ${supporter.name}!` : 'Thank you!'}
      </h2>
      <TierLine id="donate-thanks-tier" tier={tier} large />
      <p className="sheet__description">Your name is on the list. You help keep every game free.</p>
      <button
        className="pill-button pill-button--primary"
        id="donate-done"
        type="button"
        onClick={onDone}
      >
        Done
      </button>
    </section>
  );
}
