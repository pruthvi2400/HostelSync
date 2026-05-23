import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setProfile(data);
      setForm({ name: data.name, phone: data.phone || '', address: data.address || '', emergencyContact: data.emergencyContact || '' });
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/users/me', form);
      setProfile(data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading…</div>;

  const roleBadge = { admin: 'badge-danger', warden: 'badge-warning', student: 'badge-info', parent: 'badge-success' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>My Profile</h2>
          <p>Manage your personal information</p>
        </div>
      </div>

      {saved && <div className="alert alert-success" style={{ maxWidth: 600 }}>Profile updated successfully!</div>}

      <div className="card profile-card">
        <div className="profile-header">
          <div className="avatar-lg">{profile?.name?.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h2>{profile?.name}</h2>
            <p>{profile?.email}</p>
            <div style={{ marginTop: 8 }}>
              <span className={`badge ${roleBadge[profile?.role] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
                {profile?.role}
              </span>
              {profile?.rollNo && (
                <span className="badge badge-gray" style={{ marginLeft: 6 }}>{profile.rollNo}</span>
              )}
            </div>
          </div>
          {!editing && (
            <button className="btn btn-outline" style={{ marginLeft: 'auto' }} onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {!editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              ['Phone', profile?.phone || '—'],
              ['Address', profile?.address || '—'],
              ['Emergency Contact', profile?.emergencyContact || '—'],
              ['Member Since', new Date(profile?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })],
              ...(profile?.room ? [['Room', `Room ${profile.room.roomNumber}, Floor ${profile.room.floor}`]] : []),
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, color: 'var(--text)' }}>{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" placeholder="9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" placeholder="Home address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ minHeight: 60 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input className="form-input" placeholder="Parent/Guardian phone" value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
