import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, Shield, LogOut, User, Menu, X, Wifi, Settings } from 'lucide-react';
import { MarketAlert, AssetPosition, ExpenseEntry, FamilyGoal, BudgetLimit } from '../types';
import SearchEngine from './SearchEngine';
import logoImg from '../assets/images/budget_portfolio_logo_1784635990294.jpg';

interface NavbarProps {
  email: string;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  alerts: MarketAlert[];
  onClearAlerts: () => void;
  assets: AssetPosition[];
  expenses: ExpenseEntry[];
  goals: FamilyGoal[];
  budgets: BudgetLimit[];
  onSelect: (type: string, id: string, targetTab?: string) => void;
  onOpenSettings: (tab?: 'profile' | 'preferences' | 'export') => void;
}

export default function Navbar({
  email,
  onLogout,
  darkMode,
  onToggleDarkMode,
  alerts,
  onClearAlerts,
  assets,
  expenses,
  goals,
  budgets,
  onSelect,
  onOpenSettings,
}: NavbarProps) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile picture and display name state
  const [profilePic, setProfilePic] = useState<string | null>(() => {
    return localStorage.getItem('wealth_vault_profile_pic') || null;
  });
  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem('wealth_vault_display_name') || email.split('@')[0] || 'User';
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfilePic(localStorage.getItem('wealth_vault_profile_pic'));
      setDisplayName(localStorage.getItem('wealth_vault_display_name') || email.split('@')[0] || 'User');
    };
    window.addEventListener('wealth_vault_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('wealth_vault_profile_updated', handleProfileUpdate);
  }, [email]);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <img src={logoImg} alt="Logo" className="w-9 h-9 rounded-lg shadow-md" />
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight uppercase">
              BUDGET PORTFOLIO
            </h1>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Enterprise Core v96.2</p>
            </div>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center space-x-4">
          <SearchEngine assets={assets} expenses={expenses} goals={goals} budgets={budgets} onSelect={onSelect} />
          
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-white/5">
            <Wifi className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">Cloud Synchronized</span>
          </div>

          <button
            onClick={onToggleDarkMode}
            className="p-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl border border-slate-200 dark:border-white/5 transition-all duration-300"
            title="Toggle Accessibility Color Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Important News Alerts Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl border border-slate-200 dark:border-white/5 transition-all duration-300"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-bounce border border-white">
                  {alerts.length}
                </span>
              )}
            </button>

            {showAlerts && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-widest">Important News Alerts</h3>
                  {alerts.length > 0 && (
                    <button
                      onClick={onClearAlerts}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Dismiss All
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No active market alerts recorded.
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            alert.type === 'up'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : alert.type === 'down'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400'
                              : alert.type === 'volatility'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
                          }`}>
                            {alert.asset}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">{alert.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{alert.message}</p>
                        {(alert.thresholdPercentage || alert.lastTriggeredDate) && (
                          <div className="flex items-center gap-2 mt-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                            {alert.thresholdPercentage !== undefined && (
                              <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                Trigger: ±{alert.thresholdPercentage}%
                              </span>
                            )}
                            {alert.lastTriggeredDate && (
                              <span className="text-[9px] text-slate-400 font-mono">
                                Triggered: {new Date(alert.lastTriggeredDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clickable User Email, Avatar & Settings Controls */}
          <div className="flex items-center space-x-2 pl-3 border-l border-slate-200 dark:border-white/5">
            <button
              onClick={() => onOpenSettings('profile')}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all cursor-pointer group text-left"
              title="Click to open App Settings & Profile"
            >
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors max-w-[140px] truncate">
                  {email}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Settings & Profile
                </span>
              </div>
              
              <div className="relative">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="User Profile"
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-white/10 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 border border-slate-200 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-rose-600 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
              title="Logout Securely"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 p-4 space-y-4 animate-slide-down">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 dark:border-white/5 pb-2">
            <button
              onClick={() => {
                onOpenSettings('profile');
                setMobileMenuOpen(false);
              }}
              className="text-left"
            >
              Logged in: <b className="text-slate-900 dark:text-white hover:underline">{email}</b>
            </button>
            <button onClick={onToggleDarkMode} className="text-blue-600 dark:text-blue-400 font-bold underline">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          <button
            onClick={() => {
              onOpenSettings('profile');
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>App Settings & Backups</span>
          </button>

          <button
            onClick={() => {
              onLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 border border-rose-200 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Securely</span>
          </button>
        </div>
      )}
    </header>
  );
}
