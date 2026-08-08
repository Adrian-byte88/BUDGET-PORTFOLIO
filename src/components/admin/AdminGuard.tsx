import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

interface AdminGuardProps {
  isAdmin: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminGuard({ isAdmin, children, fallback }: AdminGuardProps) {
  if (!isAdmin) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-black uppercase text-red-700 dark:text-red-400 tracking-wider">
          Access Restricted • Administrative Privileges Required
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          This panel contains institutional configuration and user management controls restricted strictly to verified administrator accounts.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
