import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen h-dvh overflow-hidden bg-[var(--app-bg)] text-[var(--app-fg)]">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
