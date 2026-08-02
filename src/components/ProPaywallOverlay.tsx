import React from 'react';
import { Crown, Lock, CheckCircle2, ShieldAlert, ArrowRight, Sparkles, Layers, Activity, PieChart } from 'lucide-react';

interface ProPaywallOverlayProps {
  tabName: string;
  onUpgrade: () => void;
  onGoDashboard: () => void;
}

export default function ProPaywallOverlay({ tabName, onUpgrade, onGoDashboard }: ProPaywallOverlayProps) {
  return (
    <div className="max-w-4xl mx-auto my-8 p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 text-center space-y-6">
        {/* Top Lock Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-full text-amber-700 dark:text-amber-400 text-xs font-extrabold uppercase tracking-widest shadow-xs">
          <Lock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>PRO SUBSCRIPTION FEATURE</span>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{tabName}</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            You are currently on the <b className="text-slate-800 dark:text-slate-200">Free Tier</b>. Upgrade to Wealth Vault Pro for full access to advanced asset allocation, risk sleeve engines, and macro cycle audits.
          </p>
        </div>

        {/* Feature Matrix Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left my-8">
          {/* Free Tier Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Free Tier (Included)</span>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">₱0 / month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Summary Dashboard Overview</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Expense Ledger & Budget Tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Social Family Sync & Shared Goals</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Transaction Registry History</span>
              </li>
            </ul>
          </div>

          {/* Pro Tier Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-500/40 dark:border-blue-500/30 space-y-3 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest shadow-xs">
              RECOMMENDED
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Pro Plan Full Access</span>
              </span>
              <span className="text-xs font-black text-blue-900 dark:text-blue-200">$9.99 / month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center space-x-2 font-bold">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>My Financial Portfolio (Net Worth Engine)</span>
              </li>
              <li className="flex items-center space-x-2 font-bold">
                <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Editable Risk Sleeve Sub-Allocations</span>
              </li>
              <li className="flex items-center space-x-2 font-bold">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Asset Sleeve Registry & Trade Entries</span>
              </li>
              <li className="flex items-center space-x-2 font-bold">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Market Cycle Audit & USD Defense Matrix</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onUpgrade}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Upgrade via GCash (₱499/mo)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onGoDashboard}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl transition-all cursor-pointer"
          >
            Stay on Free Tier (Return to Summary)
          </button>
        </div>
      </div>
    </div>
  );
}
