import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function RoleBadge({ role }) {
  const map = { admin: 'badge-danger', warden: 'badge-warning', student: 'badge-info', parent: 'badge-success' };
  return <span className={`badge ${map[role] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{role}</span>;
}

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    const endpoint = user?.role === 'admin' ? '/users' : '/users/students';
    api.get(endpoint).then(({ data }) => { setUsers(data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading…</div>;

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || (u.rollNo || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{user?.role === 'admin' ? 'User Management' : 'Students'}</h2>
          <p>{filtered.length} {filterRole || 'user'}{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          className="form-input"
          placeholder="Search by name, email, roll no…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        {user?.role === 'admin' && (
          <select className="form-select" style={{ maxWidth: 160 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="warden">Wardens</option>
            <option value="admin">Admins</option>
            <option value="parent">Parents</option>
          </select>
        )}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" /></svg>
            <h3>No users found</h3>
            <p>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {user?.role === 'admin' && <th>Role</th>}
                  <th>Roll No</th>
                  <th>Room</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  {user?.role === 'admin' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm">{u.name.charAt(0).toUpperCase()}</div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    {user?.role === 'admin' && <td><RoleBadge role={u.role} /></td>}
                    <td>{u.rollNo || '—'}</td>
                    <td>{u.room ? `Room ${u.room.roomNumber}` : '—'}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    {user?.role === 'admin' && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
