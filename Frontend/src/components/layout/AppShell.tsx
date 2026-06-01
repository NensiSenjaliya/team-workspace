import { Bell, LogOut, PanelsTopLeft, Search } from 'lucide-react';

import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export function AppShell({ children, user, onLogout }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup compact">
          <div className="brand-mark">
            <PanelsTopLeft size={22} />
          </div>
          <div>
            <strong>Workspace</strong>
            <span>Collaboration</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Primary navigation">
          <a className="active" href="#overview">Overview</a>
          <a href="#tasks">Tasks</a>
          <a href="#members">Members</a>
          <a href="#activity">Activity</a>
        </nav>

        <div className="sidebar-profile">
          <Avatar user={user} />
          <div>
            <strong>{user?.first_name || user?.username}</strong>
            <span>{user?.email || 'Signed in'}</span>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="search-box">
            <Search size={18} />
            <input placeholder="Search within your workspace" readOnly />
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
