import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/rooms': 'Room Management',
  '/complaints': 'Complaints',
  '/leaves': 'Leave Requests',
  '/attendance': 'Attendance',
  '/mess': 'Mess Menu',
  '/fees': 'Fee Management',
  '/notifications': 'Notifications',
  '/profile': 'My Profile',
};

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get('/notifications').then(({ data }) => {
      setUnread(data.filter(n => !n.read).length);
    }).catch(() => {});
  }, [location.pathname]);

  const title = pageTitles[location.pathname] || 'HostelSync';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-right">
            <button className="notif-bell" onClick={() => navigate('/notifications')}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>
            <div className="topbar-user">
              <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
