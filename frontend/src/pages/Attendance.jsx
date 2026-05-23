import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Badge({ value }) {
  const map = { present: 'badge-success', absent: 'badge-danger', 'on-leave': 'badge-warning' };
  return <span className={`badge ${map[value] || 'badge-gray'}`}>{value}</span>;
}

export default function Attendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student: '', date: new Date().toISOString().split('T')[0], status: 'present', remarks: '' });

  const fetchAttendance = async () => {
    const { data } = await api.get('/attendance');
    setAttendance(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
    if (user?.role !== 'student') {
      api.get('/users/students').then(({ data }) => setStudents(data)).catch(() => {});
    }
  }, [user]);

  const handleMark = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/single', form);
      setShowModal(false);
      setForm({ student: '', date: new Date().toISOString().split('T')[0], status: 'present', remarks: '' });
      fetchAttendance();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading…</div>;

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const pct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Attendance</h2>
          <p>{user?.role === 'student' ? `Your attendance: ${pct}% (${presentCount} present / ${attendance.length} total)` : `${attendance.length} records`}</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'warden') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Mark Attendance</button>
        )}
      </div>

      {user?.role === 'student' && attendance.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon green">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="stat-info"><h3>{presentCount}</h3><p>Days Present</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <div className="stat-info"><h3>{absentCount}</h3><p>Days Absent</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div className="stat-info"><h3>{pct}%</h3><p>Attendance Rate</p></div>
          </div>
        </div>
      )}

      <div className="card">
        {attendance.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <h3>No attendance records</h3>
            <p>Records will appear here once attendance is marked</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {user?.role !== 'student' && <th>Student</th>}
                  <th>Date</th>
                  <th>Status</th>
                  <th>Marked By</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(a => (
                  <tr key={a._id}>
                    {user?.role !== 'student' && (
                      <td>
                        <div style={{ fontWeight: 500 }}>{a.student?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{a.student?.rollNo}</div>
                      </td>
                    )}
                    <td>{new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td><Badge value={a.status} /></td>
                    <td>{a.markedBy?.name || '—'}</td>
                    <td>{a.remarks || '—'}</td>
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
              <h3>Mark Attendance</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleMark}>
                <div className="form-group">
                  <label className="form-label">Student</label>
                  <select className="form-select" value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} required>
                    <option value="">— Select student —</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.rollNo || s.email})</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="on-leave">On Leave</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input className="form-input" placeholder="Optional remarks" value={form.remarks}
                    onChange={e => setForm({ ...form, remarks: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Mark</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
