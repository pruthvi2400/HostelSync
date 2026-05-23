import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Badge({ value }) {
  const map = { paid: 'badge-success', pending: 'badge-warning', overdue: 'badge-danger' };
  return <span className={`badge ${map[value] || 'badge-gray'}`}>{value}</span>;
}

export default function Fees() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student: '', amount: '', type: 'hostel', status: 'pending', month: '', dueDate: '', remarks: '' });

  const fetchFees = async () => {
    const { data } = await api.get('/fees');
    setFees(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFees();
    if (user?.role === 'admin') {
      api.get('/users/students').then(({ data }) => setStudents(data)).catch(() => {});
    }
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees', form);
      setShowModal(false);
      setForm({ student: '', amount: '', type: 'hostel', status: 'pending', month: '', dueDate: '', remarks: '' });
      fetchFees();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.put(`/fees/${id}`, { status: 'paid', paidDate: new Date() });
      fetchFees();
    } catch (err) { alert('Failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading…</div>;

  const totalAmount = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const paidAmount = fees.filter(f => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0);
  const pendingAmount = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + (f.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Fee Management</h2>
          <p>Track and manage hostel fee payments</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Fee Record</button>
        )}
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-info"><h3>₹{totalAmount.toLocaleString()}</h3><p>Total Fees</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="stat-info"><h3>₹{paidAmount.toLocaleString()}</h3><p>Collected</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="stat-info"><h3>₹{pendingAmount.toLocaleString()}</h3><p>Outstanding</p></div>
        </div>
      </div>

      <div className="card">
        {fees.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3>No fee records</h3>
            <p>{user?.role === 'admin' ? 'Add a fee record to get started' : 'No fee records found'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {user?.role === 'admin' && <th>Student</th>}
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Month</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Paid Date</th>
                  {user?.role === 'admin' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {fees.map(f => (
                  <tr key={f._id}>
                    {user?.role === 'admin' && (
                      <td>
                        <div style={{ fontWeight: 500 }}>{f.student?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{f.student?.rollNo}</div>
                      </td>
                    )}
                    <td style={{ textTransform: 'capitalize' }}>{f.type}</td>
                    <td style={{ fontWeight: 600 }}>₹{f.amount?.toLocaleString()}</td>
                    <td>{f.month || '—'}</td>
                    <td>{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</td>
                    <td><Badge value={f.status} /></td>
                    <td>{f.paidDate ? new Date(f.paidDate).toLocaleDateString() : '—'}</td>
                    {user?.role === 'admin' && f.status !== 'paid' && (
                      <td>
                        <button className="btn btn-success btn-sm" onClick={() => handleMarkPaid(f._id)}>Mark Paid</button>
                      </td>
                    )}
                    {user?.role === 'admin' && f.status === 'paid' && <td>—</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Fee Record</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Student</label>
                  <select className="form-select" value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} required>
                    <option value="">— Select student —</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNo || s.email})</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="hostel">Hostel</option>
                      <option value="mess">Mess</option>
                      <option value="security">Security</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" className="form-input" placeholder="5000" value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <input className="form-input" placeholder="e.g. April 2025" value={form.month}
                      onChange={e => setForm({ ...form, month: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input className="form-input" placeholder="Optional note" value={form.remarks}
                    onChange={e => setForm({ ...form, remarks: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Record</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
