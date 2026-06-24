import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface Initiative {
  id: number;
  title: string;
}

interface Program {
  id: number;
  initiative_id: number;
  title: string;
  slug: string;
  description: string;
  sort_order: number;
}

export default function Programs() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editing, setEditing] = useState<Partial<Program> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [i, p] = await Promise.all([
      apiClient.get<Initiative[]>('/initiatives'),
      apiClient.get<Program[]>('/programs'),
    ]);
    setInitiatives(i);
    setPrograms(p);
  }

  useEffect(() => {
    load();
  }, []);

  function initiativeTitle(id: number) {
    return initiatives.find((i) => i.id === id)?.title || '—';
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError('');
    try {
      if (editing.id) {
        await apiClient.put(`/programs/${editing.id}`, editing);
      } else {
        await apiClient.post('/programs', editing);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this program?')) return;
    await apiClient.delete(`/programs/${id}`);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Programs</h1>
        <button
          onClick={() => { setEditing({ initiative_id: initiatives[0]?.id }); setShowForm(true); }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
        >
          + Add New
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Initiative</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{initiativeTitle(p.initiative_id)}</td>
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3">{p.slug}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-orange-600 font-medium mr-3">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No programs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold">{editing.id ? 'Edit' : 'Add'} Program</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Initiative</label>
              <select
                value={editing.initiative_id ?? ''}
                onChange={(e) => setEditing({ ...editing, initiative_id: Number(e.target.value) })}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              >
                {initiatives.map((i) => (
                  <option key={i.id} value={i.id}>{i.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                required
                value={editing.title ?? ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                required
                value={editing.slug ?? ''}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={4}
                value={editing.description ?? ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-slate-600">
                Cancel
              </button>
              <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-md text-sm font-semibold">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
