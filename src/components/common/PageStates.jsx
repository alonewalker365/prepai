import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <p className="text-8xl font-black text-slate-200 dark:text-slate-800 font-display select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-4xl">🤔</p>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-2">
            Page not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400 rounded-xl font-medium text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-colors"
          >
            <Home size={16} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center animate-pulse-slow">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-brand-400/20 animate-ping" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{message}</p>
    </div>
  );
}

export function InlineLoader({ rows = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
        </div>
      ))}
    </div>
  );
}
