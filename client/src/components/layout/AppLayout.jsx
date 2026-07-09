import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
