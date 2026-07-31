import React from 'react';
import { AlertTriangle, CheckCircle2, Sparkles, X, ShieldAlert, RefreshCw, ZapOff } from 'lucide-react';

export interface AIPopupModalProps {
  isOpen: boolean;
  type: 'quota' | 'search_grounding' | null;
  title?: string;
  message?: string;
  onClose: () => void;
}

export const AIPopupModal: React.FC<AIPopupModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
}) => {
  if (!isOpen || !type) return null;

  const isQuota = type === 'quota';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border transition-all transform scale-100 ${
          isQuota 
            ? 'bg-slate-900 border-amber-500/40 text-slate-100' 
            : 'bg-slate-900 border-emerald-500/40 text-slate-100'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Banner Accent */}
        <div 
          className={`h-2.5 w-full ${
            isQuota 
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600' 
              : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500'
          }`} 
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Badge & Icon Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isQuota 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isQuota ? (
                <ZapOff className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
            </div>

            <div>
              <span 
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  isQuota 
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {isQuota ? 'HTTP 429 • QUOTA LIMIT REACHED' : 'GOOGLE SEARCH GROUNDED'}
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {title || (isQuota ? 'API Quota Limit Reached' : 'Search Grounding Successful')}
              </h3>
            </div>
          </div>

          {/* Body Content */}
          <div className="mt-3 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              {message || (
                isQuota 
                  ? 'Your Gemini API quota limit has been reached for current requests. The application has automatically switched to active offline caches to keep your portfolio fully operational.' 
                  : 'Google Search Grounding has successfully retrieved live 2026 market rates, PSE asset share prices, and sentiment updates.'
              )}
            </p>

            {isQuota ? (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1.5">
                <div className="flex items-center space-x-2 font-semibold text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Automatic Offline Fallback Engaged</span>
                </div>
                <p className="text-slate-400 text-[10.5px]">
                  All calculations, totals, asset rebalancing rules, and saved transactions continue to function smoothly using verified server market caches.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-[11px] text-emerald-200/90 space-y-1.5">
                <div className="flex items-center space-x-2 font-semibold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Real-time Live Market Rates Applied</span>
                </div>
                <p className="text-slate-400 text-[10.5px]">
                  Your portfolio valuations, asset pricing, macro cycle metrics, and sentiment triggers are now synchronized with live search grounding data.
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 ${
                isQuota
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400'
              }`}
            >
              {isQuota ? 'Acknowledge & Continue' : 'Awesome, Got It'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
