import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ivory)' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full z-40"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--taupe)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen pb-20 md:pb-0">
        <div className="md:ml-[240px] min-h-screen">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ height: 'var(--bottomnav-height)' }}
      >
        <BottomNav />
      </nav>
    </div>
  );
}
