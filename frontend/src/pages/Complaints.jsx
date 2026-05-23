import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CATEGORIES = ['maintenance', 'food', 'security', 'hygiene', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

function Badge({ value }) {
  const map = {
    pending: 'badge-warning', 'in-progress': 'badge-info', resolved: 'badge-success',
    low: 'badge-gray', medium: 'badge-warning', high: 'badge-danger',
    maintenance: 'badge-info', food: 'badge-success', security: 'badge-danger',
    hygiene: 'badge-purple', other: 'badge-gray',
  };
  return <span className={`badge ${map[value] || 'badge-gray'}`}>{value}</span>;
}

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'maintenance', priority: 'medium' });
  const [updateForm, setUpdateForm] = useState({ status: '', resolution: '' });
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/complaints', form);
      setShowModal(false);
      setForm({ title: '', description: '', category: 'maintenance', priority: 'medium' });
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/complaints/${id}`, updateForm);
      setSelected(null);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Complaints</h2>
          <p>{user?.role === 'student' ? 'Submit and track your complaints' : 'Manage student complaints'}</p>
        </div>
        {user?.role === 'student' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Complaint</button>
        )}
      </div>

      <div className="card">
        {complaints.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3>No complaints found</h3>
            <p>{user?.role === 'student' ? 'Submit a complaint to get started' : 'No complaints from students yet'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {user?.role !== 'student' && <th>Student</th>}
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  {(user?.role === 'admin' || user?.role === 'warden') && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id}>
                    {user?.role !== 'student' && (
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.student?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.student?.rollNo}</div>
                      </td>
                    )}
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{c.description?.slice(0, 60)}…</div>
                    </td>
                    <td><Badge value={c.category} /></td>
                    <td><Badge value={c.priority} /></td>
                    <td><Badge value={c.status} /></td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    {(user?.role === 'admin' || user?.role === 'warden') && (
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => { setSelected(c); setUpdateForm({ status: c.status, resolution: c.resolution || '' }); }}
                        >
                          Update
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Complaint Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Complaint</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" placeholder="Brief complaint title" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Describe your complaint in detail…" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Complaint</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 13 }}>{selected.title}</p>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Resolution Note</label>
                <textarea className="form-textarea" placeholder="Describe how it was resolved…" value={updateForm.resolution}
                  onChange={e => setUpdateForm({ ...updateForm, resolution: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => handleUpdate(selected._id)}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
