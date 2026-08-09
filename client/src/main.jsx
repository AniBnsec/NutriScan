import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import ClerkAuthBridge from './components/auth/ClerkAuthBridge.jsx';
import BackgroundGrid from './components/common/BackgroundGrid.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import './styles/index.css';
import './styles/clerk.css';
import { initRemindersFromStorage } from './utils/notifications';
import { LanguageProvider, RTL_LANGUAGES } from './i18n/index.jsx';

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_bWVhc3VyZWQtZ3JpenpseS05Ni5jbGVyay5hY2NvdW50cy5kZXYk';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Apply saved theme on load
let savedTheme = 'dark';
try { savedTheme = localStorage.getItem('theme') || 'dark'; } catch(e) {}
document.documentElement.setAttribute('data-theme', savedTheme);

// Apply saved language direction on load
let savedLang = 'en';
try { savedLang = localStorage.getItem('language') || 'en'; } catch(e) {}
document.documentElement.setAttribute('lang', savedLang);
document.documentElement.setAttribute('dir', RTL_LANGUAGES.includes(savedLang) ? 'rtl' : 'ltr');

// Init meal reminders if previously enabled
initRemindersFromStorage();

import { useNavigate } from 'react-router-dom';

function ClerkProviderWithRoutes({ children }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      forceRedirectUrl="/dashboard"
      signInUrl="/login"
      signUpUrl="/register"
      localization={{
        formFieldInputPlaceholder__username: 'Username',
      }}
    >
      {children}
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ClerkProviderWithRoutes>
          <LanguageProvider>
            <ClerkAuthBridge />
            <BackgroundGrid />
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(13, 18, 36, 0.95)',
                  color: '#f8fafc',
                  border: '1px solid rgba(0, 245, 160, 0.2)',
                  backdropFilter: 'blur(24px)',
                  borderRadius: '16px',
                  fontSize: '14px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                },
                success: { iconTheme: { primary: '#00f5a0', secondary: '#04060c' } },
                error: { iconTheme: { primary: '#ec4899', secondary: '#fff' } },
              }}
            />
          </LanguageProvider>
        </ClerkProviderWithRoutes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
