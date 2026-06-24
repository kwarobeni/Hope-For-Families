import { useEffect, useRef, useState } from 'react';
import { API_URL } from '../lib/api';

declare global {
  interface Window {
    paypal?: any;
  }
}

const PAYPAL_CLIENT_ID = import.meta.env.PUBLIC_PAYPAL_CLIENT_ID;
const PRESET_AMOUNTS = [10, 25, 50, 100];
const IMPACT_TEXT: Record<number, string> = {
  10: '£10 provides a week of warm meals at the Food Bank Café.',
  25: '£25 funds a term of Little Stars STEM club for one child.',
  50: '£50 gives a family a month of food parcels.',
  100: '£100 keeps the Café running for a whole afternoon.',
};

export default function DonateButton() {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [giftAid, setGiftAid] = useState(true);
  const [giftAidAddress, setGiftAidAddress] = useState('');
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkReady = useRef(false);

  const isCustom = customAmount !== '';
  const effectiveAmount = isCustom ? Number(customAmount) : amount;

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) return;
    if (sdkReady.current) return;
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=GBP`;
    script.onload = () => {
      sdkReady.current = true;
      renderButtons();
    };
    document.body.appendChild(script);
  }, []);

  function renderButtons() {
    if (!window.paypal || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    window.paypal
      .Buttons({
        createOrder: async () => {
          const res = await fetch(`${API_URL}/donations/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: effectiveAmount, currency: 'GBP' }),
          });
          const data = await res.json();
          return data.id;
        },
        onApprove: async (data: { orderID: string }) => {
          const res = await fetch(`${API_URL}/donations/capture-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderID,
              donor_name: donorName,
              donor_email: donorEmail,
              gift_aid: giftAid,
              gift_aid_address: giftAid ? giftAidAddress : undefined,
            }),
          });
          setStatus(res.ok ? 'done' : 'error');
        },
        onError: () => setStatus('error'),
      })
      .render(containerRef.current);
  }

  useEffect(() => {
    if (sdkReady.current) renderButtons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAmount, donorName, donorEmail, giftAid, giftAidAddress]);

  if (status === 'done') {
    return (
      <div className="rounded-2xl border border-mint-tint bg-mint-tint p-8 text-center text-emerald-deep">
        <h3 className="mb-2 font-display text-xl font-bold text-forest-900">Thank you for your donation!</h3>
        <p>Your support helps us continue delivering life-changing programs.</p>
      </div>
    );
  }

  const amountBtn = (active: boolean) =>
    `rounded-xl border-[1.5px] py-3.5 text-center font-display text-base font-bold transition-all ${
      active ? 'border-emerald-deep bg-emerald-deep text-white' : 'border-border-warm bg-white text-forest-900'
    }`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 font-display text-xl font-bold text-forest-900">Choose your gift</h2>
        <p className="mb-5 text-[13px] text-muted">Pick an amount and see the difference it makes.</p>

        <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setAmount(amt);
                setCustomAmount('');
              }}
              className={amountBtn(!isCustom && amount === amt)}
            >
              £{amt}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          placeholder="Or enter a custom amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className={`field-input w-full rounded-xl border-[1.5px] px-4 py-3 text-base ${
            isCustom ? 'border-hope-blue' : 'border-border-warm'
          }`}
        />
      </div>

      <div className="flex items-center gap-2.5 rounded-xl bg-mint-tint px-4 py-3.5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E8B57" strokeWidth="2" className="shrink-0">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
        </svg>
        <span className="text-sm font-medium text-emerald-deep">
          {isCustom ? 'Every pound goes straight to a family.' : IMPACT_TEXT[amount]}
        </span>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-forest-900">Your Name</label>
        <input value={donorName} onChange={(e) => setDonorName(e.target.value)} className="field-input w-full rounded-xl border-[1.5px] border-border-warm px-4 py-2.5" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-forest-900">Your Email</label>
        <input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} className="field-input w-full rounded-xl border-[1.5px] border-border-warm px-4 py-2.5" />
      </div>

      <label className="flex items-start gap-2.5 rounded-xl border-[1.5px] border-border-warm p-4 cursor-pointer">
        <span
          onClick={(e) => {
            e.preventDefault();
            setGiftAid((g) => !g);
          }}
          className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-[1.5px] ${
            giftAid ? 'border-emerald-deep bg-emerald-deep' : 'border-border-warm bg-white'
          }`}
        >
          {giftAid && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
          )}
        </span>
        <span className="text-[13px] leading-relaxed text-body">
          <strong className="text-forest-900">Add Gift Aid</strong> — boost your donation by 25% at no extra cost if
          you're a UK taxpayer.
        </span>
      </label>
      {giftAid && (
        <textarea
          placeholder="Your UK home address (required for Gift Aid)"
          value={giftAidAddress}
          onChange={(e) => setGiftAidAddress(e.target.value)}
          rows={3}
          className="field-input w-full rounded-xl border-[1.5px] border-border-warm px-4 py-2.5 text-sm"
        />
      )}

      {PAYPAL_CLIENT_ID ? (
        <div ref={containerRef} />
      ) : (
        <p className="text-sm text-red-600">PayPal is not configured yet. Set PUBLIC_PAYPAL_CLIENT_ID.</p>
      )}

      {status === 'error' && <p className="text-sm text-red-600">Something went wrong with your donation. Please try again.</p>}
      <p className="text-center text-xs text-muted">Secure payment via PayPal &middot; we never share your details</p>
    </div>
  );
}
