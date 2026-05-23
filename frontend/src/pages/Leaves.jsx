import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Badge({ value }) {
  const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
  return <span className={`badge ${map[value] || 'badge-gray'}`}>{value}</span>;
}

export default function Leaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ fromDate: '', toDate: '', reason: '', destination: '', contactDuringLeave: '' });
  const [updateForm, setUpdateForm] = useState({ status: 'approved', remarks: '' });

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/leaves');
      setLeaves(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      setShowModal(false);
      setForm({ fromDate: '', toDate: '', reason: '', destination: '', contactDuringLeave: '' });
      fetchLeaves();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/leaves/${id}`, updateForm);
      setSelected(null);
      fetchLeaves();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading…</div>;

  const days = (from, to) => Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Leave Requests</h2>
          <p>{user?.role === 'student' ? 'Apply for and track leave requests' : 'Review and approve leave requests'}</p>
        </div>
        {user?.role === 'student' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Apply for Leave</button>
        )}
      </div>

      <div className="card">
        {leaves.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <h3>No leave requests</h3>
            <p>{user?.role === 'student' ? 'Apply for a leave to get started' : 'No pending requests'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {user?.role !== 'student' && <th>Student</th>}
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied</th>
                  {(user?.role === 'admin' || user?.role === 'warden') && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l._id}>
                    {user?.role !== 'student' && (
                      <td>
                        <div style={{ fontWeight: 500 }}>{l.student?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.student?.rollNo}</div>
                      </td>
                    )}
                    <td>{new Date(l.fromDate).toLocaleDateString()}</td>
                    <td>{new Date(l.toDate).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>{days(l.fromDate, l.toDate)}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                    <td><Badge value={l.status} /></td>
                    <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                    {(user?.role === 'admin' || user?.role === 'warden') && l.status === 'pending' && (
                      <td>
                        <button className="btn btn-outline btn-sm"
                          onClick={() => { setSelected(l); setUpdateForm({ status: 'approved', remarks: '' }); }}>
                          Review
                        </button>
                      </td>
                    )}
                    {(user?.role === 'admin' || user?.role === 'warden') && l.status !== 'pending' && (
                      <td><Badge value={l.status} /></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Apply for Leave</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">From Date</label>
                    <input type="date" className="form-input" value={form.fromDate}
                      onChange={e => setForm({ ...form, fromDate: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To Date</label>
                    <input type="date" className="form-input" value={form.toDate}
                      onChange={e => setForm({ ...form, toDate: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input className="form-input" placeholder="e.g. Home - Pune" value={form.destination}
                    onChange={e => setForm({ ...form, destination: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact During Leave</label>
                  <input className="form-input" placeholder="Phone number" value={form.contactDuringLeave}
                    onChange={e => setForm({ ...form, contactDuringLeave: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea className="form-textarea" placeholder="Explain your reason for leave…" value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })} required />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Leave Request</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                <p><strong>Student:</strong> {selected.student?.name}</p>
                <p><strong>Period:</strong> {new Date(selected.fromDate).toLocaleDateString()} → {new Date(selected.toDate).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> {selected.reason}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Decision</label>
                <select className="form-select" value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks (optional)</label>
                <textarea className="form-textarea" placeholder="Any remarks…" value={updateForm.remarks}
                  onChange={e => setUpdateForm({ ...updateForm, remarks: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
                <button
                  className={`btn ${updateForm.status === 'approved' ? 'btn-success' : 'btn-danger'}`}
                  onClick={() => handleUpdate(selected._id)}
                >
                  {updateForm.status === 'approved' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
