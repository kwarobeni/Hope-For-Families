import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  async function load() {
    setSubscribers(await apiClient.get<Subscriber[]>('/newsletter'));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Remove this subscriber?')) return;
    await apiClient.delete(`/newsletter/${id}`);
    load();
  }

  function exportCsv() {
    const header = 'Email,Subscribed At\n';
    const rows = subscribers.map((s) => `${s.email},${s.subscribed_at}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Newsletter Subscribers ({subscribers.length})</h1>
        <button onClick={exportCsv} className="text-sm font-medium text-orange-600">Export CSV</button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Subscribed</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{new Date(s.subscribed_at).toLocaleDateString('en-GB')}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(s.id)} className="text-red-600 font-medium">Remove</button></td>
              </tr>
            ))}
            {subscribers.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">No subscribers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
