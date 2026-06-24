import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

export interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'image' | 'file';
  options?: string[];
  required?: boolean;
}

interface Props {
  title: string;
  endpoint: string;
  listEndpoint?: string;
  fields: FieldConfig[];
  columns?: string[];
  defaultValues?: Record<string, unknown>;
}

type Row = Record<string, any>;

const fieldClass = 'field-input w-full rounded-xl border-[1.5px] border-border-warm px-3.5 py-2.5 text-sm text-forest-900';

export default function ResourceCrud({ title, endpoint, listEndpoint, fields, columns, defaultValues = {} }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const displayColumns = columns || fields.slice(0, 3).map((f) => f.name);

  async function load() {
    setLoading(true);
    try {
      const data = await apiClient.get<Row[]>(listEndpoint || endpoint);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  function openCreate() {
    setEditing({ ...defaultValues });
    setShowForm(true);
  }

  function openEdit(row: Row) {
    setEditing({ ...row });
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this item?')) return;
    await apiClient.delete(`${endpoint}/${id}`);
    load();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError('');
    try {
      if (editing.id) {
        await apiClient.put(`${endpoint}/${editing.id}`, editing);
      } else {
        await apiClient.post(endpoint, editing);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  async function handleImageUpload(field: string, file: File) {
    const { url } = await apiClient.upload<{ url: string }>('/uploads', file);
    setEditing((prev) => (prev ? { ...prev, [field]: url } : prev));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-forest-900">{title}</h1>
        <button onClick={openCreate} className="rounded-full bg-emerald-deep px-5 py-2.5 font-display text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(46,139,87,0.6)] transition-transform hover:-translate-y-0.5">
          + Add New
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-soft bg-white shadow-[0_14px_34px_-28px_rgba(20,84,58,0.4)]">
          <table className="w-full text-sm">
            <thead className="bg-mint text-left">
              <tr>
                {displayColumns.map((col) => (
                  <th key={col} className="px-4 py-3 font-display font-semibold capitalize text-forest-900">{col.replace(/_/g, ' ')}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border-soft">
                  {displayColumns.map((col) => (
                    <td key={col} className="max-w-xs truncate px-4 py-3 text-body">{String(row[col] ?? '')}</td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button onClick={() => openEdit(row)} className="mr-3 font-semibold text-emerald-deep">Edit</button>
                    <button onClick={() => handleDelete(row.id)} className="font-semibold text-coral">Delete</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={displayColumns.length + 1} className="px-4 py-8 text-center text-muted">
                    No items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSave} className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-7">
            <h2 className="font-display text-lg font-bold text-forest-900">{editing.id ? 'Edit' : 'Add'} {title}</h2>
            {fields.map((field) => (
              <div key={field.name}>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest-900">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={editing[field.name] ?? ''}
                    onChange={(e) => setEditing({ ...editing, [field.name]: e.target.value })}
                    required={field.required}
                    rows={4}
                    className={fieldClass}
                  />
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={!!editing[field.name]}
                    onChange={(e) => setEditing({ ...editing, [field.name]: e.target.checked })}
                    className="h-5 w-5 accent-emerald-deep"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={editing[field.name] ?? ''}
                    onChange={(e) => setEditing({ ...editing, [field.name]: e.target.value })}
                    className={fieldClass}
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'image' ? (
                  <div>
                    {editing[field.name] && <img src={editing[field.name]} alt="" className="mb-2 h-20 rounded-lg" />}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(field.name, e.target.files[0])}
                      className="text-sm text-body"
                    />
                  </div>
                ) : field.type === 'file' ? (
                  <div>
                    {editing[field.name] && (
                      <a href={editing[field.name]} target="_blank" rel="noopener" className="mb-2 block text-sm font-semibold text-emerald-deep">
                        Current file
                      </a>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(field.name, e.target.files[0])}
                      className="text-sm text-body"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={editing[field.name] ?? ''}
                    onChange={(e) => setEditing({ ...editing, [field.name]: e.target.value })}
                    required={field.required}
                    className={fieldClass}
                  />
                )}
              </div>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-sm font-semibold text-muted">
                Cancel
              </button>
              <button type="submit" className="rounded-full bg-emerald-deep px-6 py-2.5 font-display text-sm font-bold text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
