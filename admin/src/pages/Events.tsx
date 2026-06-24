import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface EventItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  start_at: string;
  end_at: string | null;
  location: string;
  capacity: number | null;
  registration_open: number;
}

interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<Partial<EventItem> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [viewingRegs, setViewingRegs] = useState<EventItem | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  async function load() {
    setEvents(await apiClient.get<EventItem[]>('/events'));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError('');
    try {
      if (editing.id) {
        await apiClient.put(`/events/${editing.id}`, editing);
      } else {
        await apiClient.post('/events', editing);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this event?')) return;
    await apiClient.delete(`/events/${id}`);
    load();
  }

  async function openRegistrations(event: EventItem) {
    setViewingRegs(event);
    setRegistrations(await apiClient.get<Registration[]>(`/events/${event.id}/registrations`));
  }

  function exportCsv() {
    const header = 'Name,Email,Phone,Registered At\n';
    const rows = registrations.map((r) => `${r.name},${r.email},${r.phone || ''},${r.created_at}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${viewingRegs?.slug || 'event'}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <button
          onClick={() => { setEditing({ registration_open: 1 }); setShowForm(true); }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
        >
          + Add New
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Start</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{event.title}</td>
                <td className="px-4 py-3">{new Date(event.start_at).toLocaleString('en-GB')}</td>
                <td className="px-4 py-3">{event.location}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                  <button onClick={() => openRegistrations(event)} className="text-slate-600 font-medium">Registrations</button>
                  <button onClick={() => { setEditing(event); setShowForm(true); }} className="text-orange-600 font-medium">Edit</button>
                  <button onClick={() => handleDelete(event.id)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No events yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">{editing.id ? 'Edit' : 'Add'} Event</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input required value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input required value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows={3} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Start (YYYY-MM-DD HH:MM)</label>
                <input required value={editing.start_at ?? ''} onChange={(e) => setEditing({ ...editing, start_at: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End (optional)</label>
                <input value={editing.end_at ?? ''} onChange={(e) => setEditing({ ...editing, end_at: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input value={editing.location ?? ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity (optional)</label>
              <input type="number" value={editing.capacity ?? ''} onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) || null })} className="w-full rounded-md border border-slate-300 px-3 py-2" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.registration_open} onChange={(e) => setEditing({ ...editing, registration_open: e.target.checked ? 1 : 0 })} />
              Registration open
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
              <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-md text-sm font-semibold">Save</button>
            </div>
          </form>
        </div>
      )}

      {viewingRegs && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Registrations: {viewingRegs.title}</h2>
              <div className="flex gap-3">
                <button onClick={exportCsv} className="text-sm font-medium text-orange-600">Export CSV</button>
                <button onClick={() => setViewingRegs(null)} className="text-sm font-medium text-slate-500">Close</button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left bg-slate-50">
                <tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">Registered</th></tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{r.email}</td>
                    <td className="px-3 py-2">{r.phone}</td>
                    <td className="px-3 py-2">{new Date(r.created_at).toLocaleString('en-GB')}</td>
                  </tr>
                ))}
                {registrations.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">No registrations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
