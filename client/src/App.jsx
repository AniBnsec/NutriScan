import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
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
import MealDetailsPage from './pages/MealDetailsPage';
import FridgePage from './pages/FridgePage';
import MenuScannerPage from './pages/MenuScannerPage';
import SocialPage from './pages/SocialPage';
import GamePage from './pages/GamePage';
import AppLayout from './components/layout/AppLayout';

const Spinner = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#04060c' }}>
    <div className="spinner" />
  </div>
);

// Blocks access if not signed in → redirects to /login
function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <Spinner />;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return children;
}

// Redirects away from /login and /register if already signed in.
// IMPORTANT: must NOT redirect during Clerk's SSO callback sub-paths
// (e.g. /login/sso-callback, /login/factor-one) — those are part of
// the OAuth flow and need to complete before we can navigate away.
function PublicRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  // Allow any Clerk internal sub-routes to render freely
  const isClerkInternalPath =
    location.pathname.includes('sso-callback') ||
    location.pathname.includes('factor-one') ||
    location.pathname.includes('factor-two') ||
    location.pathname.includes('reset-password') ||
    location.pathname.includes('verify');

  if (!isLoaded) return <Spinner />;
  if (isSignedIn && !isClerkInternalPath) return <Navigate to="/dashboard" replace />;
  return children;
}

const Protected = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/*" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register/*" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/scanner" element={<Protected><ScannerPage /></Protected>} />
      <Route path="/meal-details" element={<Protected><MealDetailsPage /></Protected>} />
      <Route path="/meal/:id" element={<Protected><MealDetailsPage /></Protected>} />
      <Route path="/fridge" element={<Protected><FridgePage /></Protected>} />
      <Route path="/menu" element={<Protected><MenuScannerPage /></Protected>} />
      <Route path="/social" element={<Protected><SocialPage /></Protected>} />
      <Route path="/game" element={<Protected><GamePage /></Protected>} />
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
