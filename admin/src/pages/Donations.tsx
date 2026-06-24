import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface Donation {
  id: number;
  paypal_order_id: string;
  donor_name: string;
  donor_email: string;
  amount: string;
  currency: string;
  gift_aid: number;
  status: string;
  created_at: string;
}

export default function Donations() {
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    apiClient.get<Donation[]>('/donations').then(setDonations);
  }, []);

  const totalCompleted = donations.filter((d) => d.status === 'completed').reduce((sum, d) => sum + Number(d.amount), 0);

  async function exportGiftAid() {
    const data = await apiClient.get<any[]>('/donations/gift-aid-export');
    const header = 'Donor Name,Donor Email,Address,Amount,Currency,Date\n';
    const rows = data.map((d) => `${d.donor_name},${d.donor_email},${d.gift_aid_address},${d.amount},${d.currency},${d.created_at}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gift-aid-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-900">Donations</h1>
          <p className="mt-1 text-sm text-muted">Total completed: &pound;{totalCompleted.toFixed(2)}</p>
        </div>
        <button onClick={exportGiftAid} className="rounded-full border-[1.5px] border-border-warm px-4 py-2 font-display text-sm font-bold text-emerald-deep">
          Export Gift Aid (HMRC)
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-soft bg-white shadow-[0_14px_34px_-28px_rgba(20,84,58,0.4)]">
        <table className="w-full text-sm">
          <thead className="bg-mint text-left">
            <tr>
              <th className="px-4 py-3 font-display font-semibold text-forest-900">Donor</th>
              <th className="px-4 py-3 font-display font-semibold text-forest-900">Amount</th>
              <th className="px-4 py-3 font-display font-semibold text-forest-900">Gift Aid</th>
              <th className="px-4 py-3 font-display font-semibold text-forest-900">Status</th>
              <th className="px-4 py-3 font-display font-semibold text-forest-900">Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id} className="border-t border-border-soft">
                <td className="px-4 py-3 text-body">{d.donor_name || 'Anonymous'}<br /><span className="text-muted">{d.donor_email}</span></td>
                <td className="px-4 py-3 font-semibold text-forest-900">{d.currency} {d.amount}</td>
                <td className="px-4 py-3 text-body">{d.gift_aid ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 capitalize text-body">{d.status}</td>
                <td className="px-4 py-3 text-body">{new Date(d.created_at).toLocaleDateString('en-GB')}</td>
              </tr>
            ))}
            {donations.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No donations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
