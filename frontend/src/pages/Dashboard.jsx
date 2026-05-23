import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}

const icons = {
  users: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  rooms: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  complaint: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  leave: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  fee: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  att: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [complaints, leaves, rooms, users, fees, attendance] = await Promise.allSettled([
          api.get('/complaints'),
          api.get('/leaves'),
          api.get('/rooms'),
          api.get('/users'),
          api.get('/fees'),
          api.get('/attendance'),
        ]);
        const c = complaints.value?.data || [];
        const l = leaves.value?.data || [];
        const r = rooms.value?.data || [];
        const u = users.value?.data || [];
        const f = fees.value?.data || [];
        const a = attendance.value?.data || [];

        setData({
          totalStudents: u.filter(x => x.role === 'student').length,
          totalRooms: r.length,
          availableRooms: r.filter(x => x.status === 'available').length,
          pendingComplaints: c.filter(x => x.status === 'pending').length,
          resolvedComplaints: c.filter(x => x.status === 'resolved').length,
          totalComplaints: c.length,
          pendingLeaves: l.filter(x => x.status === 'pending').length,
          approvedLeaves: l.filter(x => x.status === 'approved').length,
          pendingFees: f.filter(x => x.status === 'pending' || x.status === 'overdue').length,
          totalFees: f.length,
          presentToday: a.filter(x => {
            const d = new Date(x.date);
            const today = new Date();
            return d.toDateString() === today.toDateString() && x.status === 'present';
          }).length,
        });
        setRecentComplaints(c.slice(0, 5));
        setRecentLeaves(l.slice(0, 5));
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading dashboard…</div>;

  const statusBadge = (s) => {
    const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', resolved: 'badge-success', 'in-progress': 'badge-info' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p>Here's what's happening at the hostel today.</p>
        </div>
      </div>

      {/* Admin / Warden stats */}
      {(user?.role === 'admin' || user?.role === 'warden') && (
        <div className="stats-grid">
          <StatCard icon={icons.users} label="Total Students" value={data.totalStudents || 0} color="blue" />
          <StatCard icon={icons.rooms} label="Available Rooms" value={data.availableRooms || 0} color="green" />
          <StatCard icon={icons.complaint} label="Pending Complaints" value={data.pendingComplaints || 0} color="yellow" />
          <StatCard icon={icons.leave} label="Pending Leaves" value={data.pendingLeaves || 0} color="purple" />
          {user?.role === 'admin' && (
            <StatCard icon={icons.fee} label="Pending Fees" value={data.pendingFees || 0} color="red" />
          )}
          <StatCard icon={icons.att} label="Present Today" value={data.presentToday || 0} color="green" />
        </div>
      )}

      {/* Student stats */}
      {user?.role === 'student' && (
        <div className="stats-grid">
          <StatCard icon={icons.complaint} label="My Complaints" value={data.totalComplaints || 0} color="blue" />
          <StatCard icon={icons.leave} label="Leave Requests" value={data.approvedLeaves || 0} color="green" />
          <StatCard icon={icons.fee} label="Pending Fees" value={data.pendingFees || 0} color="red" />
          <StatCard icon={icons.att} label="Present Days" value={data.presentToday || 0} color="purple" />
        </div>
      )}

      {/* Parent stats */}
      {user?.role === 'parent' && (
        <div className="stats-grid">
          <StatCard icon={icons.att} label="Present Days" value={data.presentToday || 0} color="green" />
          <StatCard icon={icons.leave} label="Leave Requests" value={data.totalComplaints || 0} color="blue" />
          <StatCard icon={icons.fee} label="Pending Fees" value={data.pendingFees || 0} color="red" />
        </div>
      )}

      {/* Recent tables for admin/warden */}
      {(user?.role === 'admin' || user?.role === 'warden') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Complaints</span>
            </div>
            {recentComplaints.length === 0 ? (
              <p className="text-secondary text-sm">No complaints yet.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Student</th><th>Title</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentComplaints.map(c => (
                      <tr key={c._id}>
                        <td>{c.student?.name || '—'}</td>
                        <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                        <td>{statusBadge(c.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Leave Requests</span>
            </div>
            {recentLeaves.length === 0 ? (
              <p className="text-secondary text-sm">No leave requests yet.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Student</th><th>From</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentLeaves.map(l => (
                      <tr key={l._id}>
                        <td>{l.student?.name || '—'}</td>
                        <td>{new Date(l.fromDate).toLocaleDateString()}</td>
                        <td>{statusBadge(l.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
