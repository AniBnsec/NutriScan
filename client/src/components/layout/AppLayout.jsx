import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import BackgroundGrid from '../common/BackgroundGrid';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <BackgroundGrid />
      <Sidebar />
      <main className="app-content">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
