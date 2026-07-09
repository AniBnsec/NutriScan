import { Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ScannerPage from './pages/ScannerPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import WeightPage from './pages/WeightPage';
import ExercisePage from './pages/ExercisePage';
import CoachPage from './pages/CoachPage';
import PlannerPage from './pages/PlannerPage';
import SupplementsPage from './pages/SupplementsPage';
import SettingsPage from './pages/SettingsPage';
import ComparePage from './pages/ComparePage';
import GalleryPage from './pages/GalleryPage';
import AppLayout from './components/layout/AppLayout';

function ProtectedRoute({ children }) {
  const isAuthenticated = useStore(s => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const isAuthenticated = useStore(s => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

const Protected = ({ children }) => (
  <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/scanner" element={<Protected><ScannerPage /></Protected>} />
      <Route path="/history" element={<Protected><HistoryPage /></Protected>} />
      <Route path="/analytics" element={<Protected><AnalyticsPage /></Protected>} />
      <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
      <Route path="/weight" element={<Protected><WeightPage /></Protected>} />
      <Route path="/exercise" element={<Protected><ExercisePage /></Protected>} />
      <Route path="/coach" element={<Protected><CoachPage /></Protected>} />
      <Route path="/planner" element={<Protected><PlannerPage /></Protected>} />
      <Route path="/supplements" element={<Protected><SupplementsPage /></Protected>} />
      <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
      <Route path="/compare" element={<Protected><ComparePage /></Protected>} />
      <Route path="/gallery" element={<Protected><GalleryPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
