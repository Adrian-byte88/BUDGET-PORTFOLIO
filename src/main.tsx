import React, { useState, useEffect, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function ErrorBoundary({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error('Caught error event:', event);
      setHasError(true);
      setErrorMessage(event.message || 'An unexpected error occurred');
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {errorMessage || 'An unexpected rendering error occurred in the application interface.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Reload Wealth Vault
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);


