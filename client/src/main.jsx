import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles/index.css';
import { initRemindersFromStorage } from './utils/notifications';
import { LanguageProvider, RTL_LANGUAGES } from './i18n/index.jsx';

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


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
        <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 17, 26, 0.95)',
            color: '#f0f4ff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00e5a0', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ff6b6b', secondary: '#fff' } },
        }}
      />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
