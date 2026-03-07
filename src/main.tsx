import { registerSW } from 'virtual:pwa-register'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ToastProvider } from './contexts/ToastContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { router } from './router'
import './styles/globals.css'

registerSW({ immediate: true })

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
