import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'editor';
  created_at: string;
}

export default function Users() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' as 'super_admin' | 'editor' });
  const [error, setError] = useState('');

  async function load() {
    setUsers(await apiClient.get<StaffUser[]>('/auth/users'));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/auth/users', form);
      setForm({ name: '', email: '', password: '', role: 'editor' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this staff account?')) return;
    await apiClient.delete(`/auth/users/${id}`);
    load();
  }

  const fieldClass = 'field-input w-full rounded-xl border-[1.5px] border-border-warm px-4 py-2.5';

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-forest-900">Staff Accounts</h1>

      <div className="mb-8 overflow-x-auto rounded-2xl border border-border-soft bg-white shadow-[0_14px_34px_-28px_rgba(20,84,58,0.4)]">
        <table className="w-full text-sm">
          <thead className="bg-mint text-left">
            <tr>
              <th className="px-4 py-3 font-display font-semibold text-forest-900">Name</th>
              <th className="px-4 py-3 font-display font-semibold text-forest-900">Email</th>
              <th className="px-4 py-3 font-display font-semibold text-forest-900">Role</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border-soft">
                <td className="px-4 py-3 text-body">{u.name}</td>
                <td className="px-4 py-3 text-body">{u.email}</td>
                <td className="px-4 py-3 capitalize text-body">{u.role.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(u.id)} className="font-semibold text-coral">Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleCreate} className="max-w-lg space-y-4 rounded-2xl border border-border-soft bg-white p-7 shadow-[0_14px_34px_-28px_rgba(20,84,58,0.4)]">
        <h2 className="font-display font-bold text-forest-900">Add Staff Account</h2>
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldClass} />
        <input required type="password" placeholder="Temporary Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={fieldClass} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'super_admin' | 'editor' })} className={fieldClass}>
          <option value="editor">Editor</option>
          <option value="super_admin">Super Admin</option>
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded-full bg-emerald-deep px-6 py-2.5 font-display text-sm font-bold text-white">
          Create Account
        </button>
      </form>
    </div>
  );
}
