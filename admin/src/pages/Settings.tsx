import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

const FIELDS: { key: string; label: string }[] = [
  { key: 'charity_name', label: 'Charity Name' },
  { key: 'charity_number', label: 'Charity Number' },
  { key: 'tagline', label: 'Homepage Tagline' },
  { key: 'subheading', label: 'Homepage Subheading' },
  { key: 'instagram_url', label: 'Instagram URL' },
  { key: 'facebook_url', label: 'Facebook URL' },
  { key: 'tiktok_url', label: 'TikTok URL' },
];

export default function Settings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient.get<Record<string, string>>('/settings').then(setValues);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await apiClient.put('/settings', values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-forest-900">Site Settings</h1>
      <form onSubmit={handleSave} className="max-w-2xl space-y-4 rounded-2xl border border-border-soft bg-white p-7 shadow-[0_14px_34px_-28px_rgba(20,84,58,0.4)]">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest-900">{field.label}</label>
            <input
              value={values[field.key] ?? ''}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
              className="field-input w-full rounded-xl border-[1.5px] border-border-warm px-4 py-2.5"
            />
          </div>
        ))}
        <button type="submit" className="rounded-full bg-emerald-deep px-6 py-2.5 font-display text-sm font-bold text-white">
          Save Settings
        </button>
        {saved && <p className="text-sm font-semibold text-emerald-deep">Saved!</p>}
      </form>
    </div>
  );
}
