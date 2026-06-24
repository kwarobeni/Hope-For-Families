import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface Application {
  id: number;
  name: string;
  email: string;
  phone: string;
  area_of_interest: string;
  message: string;
  status: 'new' | 'contacted' | 'onboarded' | 'declined';
  created_at: string;
}

const STATUSES: Application['status'][] = ['new', 'contacted', 'onboarded', 'declined'];

export default function Volunteers() {
  const [apps, setApps] = useState<Application[]>([]);

  async function load() {
    setApps(await apiClient.get<Application[]>('/volunteers'));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: number, status: Application['status']) {
    await apiClient.put(`/volunteers/${id}`, { status });
    load();
  }

  function exportCsv() {
    const header = 'Name,Email,Phone,Area of Interest,Status,Applied At\n';
    const rows = apps.map((a) => `${a.name},${a.email},${a.phone || ''},${a.area_of_interest || ''},${a.status},${a.created_at}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volunteer-applications.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Volunteer Applications</h1>
        <button onClick={exportCsv} className="text-sm font-medium text-orange-600">Export CSV</button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Interest</th>
              <th className="px-4 py-3 font-semibold">Message</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{app.name}</td>
                <td className="px-4 py-3">{app.email}<br /><span className="text-slate-400">{app.phone}</span></td>
                <td className="px-4 py-3">{app.area_of_interest}</td>
                <td className="px-4 py-3 max-w-xs truncate">{app.message}</td>
                <td className="px-4 py-3">
                  <select value={app.status} onChange={(e) => updateStatus(app.id, e.target.value as Application['status'])} className="rounded-md border border-slate-300 px-2 py-1 text-sm">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {apps.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No applications yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
