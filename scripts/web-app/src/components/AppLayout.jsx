import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/', label: 'Home' },
  { to: '/live', label: 'Live View' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Household Monitor</p>
          <h1 className="sidebar-title">Camera Control</h1>
          <p className="sidebar-text">
            Static React front end for AWS S3 + CloudFront with CCTV and history workflows.
          </p>
        </div>

        <nav className="nav-list">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="user-card">
          <div>
            <p className="muted">Signed in as</p>
            <strong>{user?.displayName}</strong>
            <p className="muted">Role: {user?.role}</p>
          </div>
          <button className="secondary-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
