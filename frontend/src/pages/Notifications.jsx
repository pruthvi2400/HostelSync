import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', recipient: null });

  const fetchNotifications = async () => {
    const { data } = await api.get('/notifications');
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notifications', form);
      setShowModal(false);
      setForm({ title: '', message: '', type: 'info', recipient: null });
      fetchNotifications();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const typeIcon = (type) => {
    const icons = {
      info: { bg: 'var(--info-bg)', color: 'var(--info)', symbol: 'ℹ' },
      warning: { bg: 'var(--warning-bg)', color: 'var(--warning)', symbol: '⚠' },
      success: { bg: 'var(--success-bg)', color: 'var(--success)', symbol: '✓' },
      error: { bg: 'var(--danger-bg)', color: 'var(--danger)', symbol: '✕' },
    };
    const s = icons[type] || icons.info;
    return (
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
        {s.symbol}
      </div>
    );
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading…</div>;

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Notifications</h2>
          <p>{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unread > 0 && (
            <button className="btn btn-outline" onClick={markAllRead}>Mark all read</button>
          )}
          {(user?.role === 'admin' || user?.role === 'warden') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Send Notice</button>
          )}
        </div>
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <h3>No notifications</h3>
            <p>You're all caught up</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              className={`notif-item ${!n.read ? 'unread' : ''}`}
              onClick={() => !n.read && markRead(n._id)}
            >
              {typeIcon(n.type)}
              <div style={{ flex: 1 }}>
                <div className="notif-title" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">{timeAgo(n.createdAt)}</div>
              </div>
              {!n.read && <div className="notif-dot" />}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Notification</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" placeholder="Notification title" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-textarea" placeholder="Notification message…" value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })} required />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  This will be sent to all users (broadcast).
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Send</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
