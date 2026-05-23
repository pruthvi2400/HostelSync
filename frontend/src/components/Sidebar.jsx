import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  users: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  rooms: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  complaints: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  leaves: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  attendance: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  mess: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  fees: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  notifications: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  profile: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  logout: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

const navByRole = {
  admin: [
    { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
    { label: 'Users', to: '/users', icon: 'users' },
    { label: 'Rooms', to: '/rooms', icon: 'rooms' },
    { label: 'Complaints', to: '/complaints', icon: 'complaints' },
    { label: 'Leave Requests', to: '/leaves', icon: 'leaves' },
    { label: 'Attendance', to: '/attendance', icon: 'attendance' },
    { label: 'Mess Menu', to: '/mess', icon: 'mess' },
    { label: 'Fees', to: '/fees', icon: 'fees' },
    { label: 'Notifications', to: '/notifications', icon: 'notifications' },
    { label: 'Profile', to: '/profile', icon: 'profile' },
  ],
  warden: [
    { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
    { label: 'Students', to: '/users', icon: 'users' },
    { label: 'Rooms', to: '/rooms', icon: 'rooms' },
    { label: 'Complaints', to: '/complaints', icon: 'complaints' },
    { label: 'Leave Requests', to: '/leaves', icon: 'leaves' },
    { label: 'Attendance', to: '/attendance', icon: 'attendance' },
    { label: 'Mess Menu', to: '/mess', icon: 'mess' },
    { label: 'Notifications', to: '/notifications', icon: 'notifications' },
    { label: 'Profile', to: '/profile', icon: 'profile' },
  ],
  student: [
    { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
    { label: 'My Room', to: '/rooms', icon: 'rooms' },
    { label: 'Complaints', to: '/complaints', icon: 'complaints' },
    { label: 'Leave Request', to: '/leaves', icon: 'leaves' },
    { label: 'Attendance', to: '/attendance', icon: 'attendance' },
    { label: 'Mess Menu', to: '/mess', icon: 'mess' },
    { label: 'Fees', to: '/fees', icon: 'fees' },
    { label: 'Notifications', to: '/notifications', icon: 'notifications' },
    { label: 'Profile', to: '/profile', icon: 'profile' },
  ],
  parent: [
    { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
    { label: 'Attendance', to: '/attendance', icon: 'attendance' },
    { label: 'Leave Requests', to: '/leaves', icon: 'leaves' },
    { label: 'Fees', to: '/fees', icon: 'fees' },
    { label: 'Notifications', to: '/notifications', icon: 'notifications' },
    { label: 'Profile', to: '/profile', icon: 'profile' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Hostel<span>Sync</span></h1>
        <p>{user?.role} portal</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {icons[item.icon]}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          {icons.logout}
          Logout
        </button>
      </div>
    </aside>
  );
}
