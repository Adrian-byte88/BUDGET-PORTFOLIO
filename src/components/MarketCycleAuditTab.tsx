import React, { useState, useEffect } from 'react';
import { AssetPosition, MarketAlert } from '../types';
import { AIPopupModal } from './AIPopupModal';
import {
  Activity,
  TrendingUp,
  Info,
  Sparkles,
  Edit2,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Coins,
  Bell
} from 'lucide-react';
import SmartCalculatorInput from './SmartCalculatorInput';
import { formatTimeAgo } from '../lib/formatters';

export interface CycleItem {
  id: string;
  asset: string;
  phase: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  logic: string;
}

export interface DevaluationItem {
  id: string;
  indicator: string;
  marketRef: string;
  portfolioExposure: string;
  hedgeStatus: string;
  statusType: 'SECURE' | 'UNDER-YIELDING' | 'CRITICAL' | 'NEUTRAL';
}

export interface AuditChangeItem {
  id: string;
  title: string;
  description: string;
}

export interface DeploymentPlanItem {
  id: string;
  date: string;
  asset: string;
  amount: string;
  status: 'PROCEED' | 'ABORT' | 'HOLD';
  description: string;
}

export const INITIAL_CYCLE_ITEMS: CycleItem[] = [
  { id: 'c-1', asset: 'Bitcoin', phase: 'Consolidation', sentiment: 'Neutral', logic: 'BTC trading near $63,900, range-bound between roughly $62,700-$65,400 over the past week after slipping from summer highs near $65k-71k. Maintain long-term accumulation bias; no fresh catalyst either way.' },
  { id: 'c-2', asset: 'PAX Gold', phase: 'Consolidation', sentiment: 'Neutral', logic: 'Spot gold trading around $4,010-4,015/oz, down modestly from the ~$4,043 level in the prior audit but still near record territory. Heavy defensive base asset intact.' },
  { id: 'c-3', asset: 'REITs', phase: 'Markup', sentiment: 'Bullish', logic: 'RCR REIT up roughly 5.8% over the past month on continued dividend demand; office/commercial REIT sentiment remains constructive.' },
  { id: 'c-4', asset: 'SCC Energy', phase: 'Markdown', sentiment: 'Bearish', logic: 'SCC has drifted down toward the ₱21-25 range from ₱29+ earlier in the year on softer coal prices and lower 2025 earnings; a high-yield dividend name but still trending lower.' },
  { id: 'c-5', asset: 'SPC Power', phase: 'Markup', sentiment: 'Bullish', logic: 'SPC has climbed from the ₱9.85-10.46 range earlier in the year to ₱10.78, a solid utility demand story with a net-cash balance sheet.' },
  { id: 'c-6', asset: 'Safe Shield', phase: 'Hardening', sentiment: 'Bullish', logic: 'Dec 29 TD remains in matured/pending status; Dec 3 TD continuing to accrue at 6% p.a. HYS compounding at 5% p.a.' }
];

export const INITIAL_DEVALUATION_ITEMS: DevaluationItem[] = [
  { id: 'dv-1', indicator: 'USD/PHP Rate', marketRef: '₱61.62 (up from ₱61.42)', portfolioExposure: '15.00% (Risk Sleeve)', hedgeStatus: 'SECURE (USD-proxy assets hedge PHP volatility)', statusType: 'SECURE' },
  { id: 'dv-2', indicator: 'PH Inflation', marketRef: '6.4% (June 2026, PSA)', portfolioExposure: '85.00% (Safe Shield)', hedgeStatus: 'UNDER-YIELDING (6.4% inflation exceeds bank rates)', statusType: 'UNDER-YIELDING' }
];

export const INITIAL_AUDIT_CHANGES: AuditChangeItem[] = [
  { id: 'ac-1', title: 'BTC & PAXG Volatility', description: 'Both positions fell slightly in peso terms as spot USD values softened, even though the PHP weakened slightly against the greenback (₱61.42 → ₱61.62).' },
  { id: 'ac-2', title: 'Equities Trend Divergence', description: 'SCC Energy continued its steady downtrend (now down roughly 15.21% below registered cost bases), while SPC Power (+4.76%) and RCR REIT (+5.45%) extended positive momentum.' },
  { id: 'ac-3', title: 'Inflation Moderation', description: 'Headline Philippine Inflation eased slightly to 6.4% in June 2026, narrowing the real under-yielding yield gap versus safe cash reserves, though structural under-yielding persists.' },
  { id: 'ac-4', title: 'Loan Collection Receipt', description: 'The short-term personal receivable of ₱10,000 extended to your friend matured on Jul 11—carried over in cash balances as fully collected at ₱10,500 (+₱500 accrued premium).' },
  { id: 'ac-5', title: 'Net Capital Stagnation', description: 'Total Core Portfolio value remains essentially flat versus our last audit (-0.91%), as moderate gold/crypto soft spots were safely hedged by fixed-income deposits and REIT/utility dividends.' }
];

export const INITIAL_DEPLOYMENT_ITEMS: DeploymentPlanItem[] = [
  { id: 'dp-1', date: 'Aug 15', asset: 'HYS Savings', amount: '₱10,000.00', status: 'PROCEED', description: 'direct 100% of cash surplus to shrink the gap' },
  { id: 'dp-2', date: 'Aug 30', asset: 'HYS Savings', amount: '₱10,000.00', status: 'PROCEED', description: 'continue building cash reserves toward 85% Shield' },
  { id: 'dp-3', date: 'Risk Assets', asset: 'Various', amount: '₱0.00', status: 'ABORT', description: 'risk sleeve remains overweight' }
];

export interface MarketCycleAuditTabProps {
  assets: AssetPosition[];
  usdPhpRate: number;
  alerts?: MarketAlert[];
  onAddAlert?: (alert: Omit<MarketAlert, 'id' | 'timestamp'>) => void;
  onDeleteAlert?: (alertId: string) => void;
  highlightId?: { id: string; type?: string; timestamp: number } | null;
  cycleItems?: CycleItem[];
  onUpdateCycleItems?: (items: CycleItem[]) => void;
  devaluationItems?: DevaluationItem[];
  onUpdateDevaluationItems?: (items: DevaluationItem[]) => void;
  devaluationTactics?: string;
  onUpdateDevaluationTactics?: (tactics: string) => void;
  auditChanges?: AuditChangeItem[];
  onUpdateAuditChanges?: (changes: AuditChangeItem[]) => void;
  deploymentItems?: DeploymentPlanItem[];
  onUpdateDeploymentItems?: (items: DeploymentPlanItem[]) => void;
  budgetCap?: string;
  onUpdateBudgetCap?: (cap: string) => void;
  onTriggerPopupModal?: (type: 'quota' | 'search_grounding', title?: string, message?: string) => void;
}

export default function MarketCycleAuditTab({
  assets,
  usdPhpRate,
  alerts = [],
  onAddAlert,
  onDeleteAlert,
  highlightId,
  cycleItems: propCycleItems,
  onUpdateCycleItems,
  devaluationItems: propDevaluationItems,
  onUpdateDevaluationItems,
  devaluationTactics: propDevaluationTactics,
  onUpdateDevaluationTactics,
  auditChanges: propAuditChanges,
  onUpdateAuditChanges,
  deploymentItems: propDeploymentItems,
  onUpdateDeploymentItems,
  budgetCap: propBudgetCap,
  onUpdateBudgetCap,
  onTriggerPopupModal,
}: MarketCycleAuditTabProps) {
  const [isUpdatingAI, setIsUpdatingAI] = useState(false);
  const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [popupState, setPopupState] = useState<{ isOpen: boolean; type: 'quota' | 'search_grounding' | null; title?: string; message?: string }>({
    isOpen: false,
    type: null,
  });

  // Dynamic relative timestamp live ticker
  const [, setTimeTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTimeTicker((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  // Custom Alert Triggers state
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertAssetKey, setAlertAssetKey] = useState('all');
  const [alertType, setAlertType] = useState<'down' | 'volatility' | 'up' | 'info'>('down');
  const [alertThreshold, setAlertThreshold] = useState('5');
  const [alertMessage, setAlertMessage] = useState('Price drop exceeds 5% threshold');

  // Auto-switch / open alert form when pinpointed by search engine
  useEffect(() => {
    if (!highlightId) return;
    if (highlightId.id === 'market-alerts-section' || highlightId.id === 'alert-triggers') {
      setShowAlertForm(true);
      const el = document.getElementById('alert-triggers');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [highlightId]);

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddAlert) return;
    const targetAsset = alertAssetKey === 'all' ? 'All / Portfolio Wide' : (assets.find(a => a.key === alertAssetKey)?.name || alertAssetKey);
    onAddAlert({
      asset: targetAsset,
      type: alertType,
      thresholdPercentage: Number(alertThreshold) || undefined,
      message: alertMessage,
    });
    setShowAlertForm(false);
    setAlertMessage('Price drop exceeds 5% threshold');
    triggerLocalToast('Custom trigger rule activated!', 'success');
  };

  const triggerLocalToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setLocalToast({ message, type });
    setTimeout(() => setLocalToast(null), 4000);
  };

  // --- CYCLE ITEMS STATE ---
  const [localCycleItems, setLocalCycleItems] = useState<CycleItem[]>(() => {
    const saved = localStorage.getItem('portfolio_cycle_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CYCLE_ITEMS;
  });
  const cycleItems = (propCycleItems && propCycleItems.length > 0) ? propCycleItems : localCycleItems;
  const [isEditingCycle, setIsEditingCycle] = useState(false);

  const setCycleItems = (val: CycleItem[] | ((prev: CycleItem[]) => CycleItem[])) => {
    const next = typeof val === 'function' ? val(cycleItems) : val;
    localStorage.setItem('portfolio_cycle_items', JSON.stringify(next));
    setLocalCycleItems(next);
    onUpdateCycleItems?.(next);
  };

  // --- DEVALUATION STATE ---
  const [localDevaluationItems, setLocalDevaluationItems] = useState<DevaluationItem[]>(() => {
    const saved = localStorage.getItem('portfolio_devaluation_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DEVALUATION_ITEMS;
  });
  const devaluationItems = (propDevaluationItems && propDevaluationItems.length > 0) ? propDevaluationItems : localDevaluationItems;

  const [localDevaluationTactics, setLocalDevaluationTactics] = useState(() => {
    return localStorage.getItem('portfolio_devaluation_tactics') || '🛡️ USD Defense Tactics: Crypto positions (BTC) and Commodities (PAX Gold) act as proxy hedges, effectively minimizing raw PHP purchasing power devaluations.';
  });
  const devaluationTactics = propDevaluationTactics || localDevaluationTactics;
  const [isEditingDevaluation, setIsEditingDevaluation] = useState(false);

  const setDevaluationItems = (val: DevaluationItem[] | ((prev: DevaluationItem[]) => DevaluationItem[])) => {
    const next = typeof val === 'function' ? val(devaluationItems) : val;
    localStorage.setItem('portfolio_devaluation_items', JSON.stringify(next));
    setLocalDevaluationItems(next);
    onUpdateDevaluationItems?.(next);
  };

  const setDevaluationTactics = (val: string | ((prev: string) => string)) => {
    const next = typeof val === 'function' ? val(devaluationTactics) : val;
    localStorage.setItem('portfolio_devaluation_tactics', next);
    setLocalDevaluationTactics(next);
    onUpdateDevaluationTactics?.(next);
  };

  // --- AUDIT CHANGES STATE (Maximum 5 items enforced) ---
  const [localAuditChanges, setLocalAuditChanges] = useState<AuditChangeItem[]>(() => {
    const saved = localStorage.getItem('portfolio_audit_changes');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.slice(0, 5) : INITIAL_AUDIT_CHANGES;
      } catch (e) {}
    }
    return INITIAL_AUDIT_CHANGES;
  });
  const auditChanges = (propAuditChanges && propAuditChanges.length > 0) ? propAuditChanges.slice(0, 5) : localAuditChanges;
  const [isEditingAudit, setIsEditingAudit] = useState(false);

  const setAuditChanges = (val: AuditChangeItem[] | ((prev: AuditChangeItem[]) => AuditChangeItem[])) => {
    const next = typeof val === 'function' ? val(auditChanges) : val;
    const sliced = next.slice(0, 5);
    localStorage.setItem('portfolio_audit_changes', JSON.stringify(sliced));
    setLocalAuditChanges(sliced);
    onUpdateAuditChanges?.(sliced);
  };

  // --- DEPLOYMENT PLAN STATE ---
  const [localDeploymentItems, setLocalDeploymentItems] = useState<DeploymentPlanItem[]>(() => {
    const saved = localStorage.getItem('portfolio_deployment_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DEPLOYMENT_ITEMS;
  });
  const deploymentItems = (propDeploymentItems && propDeploymentItems.length > 0) ? propDeploymentItems : localDeploymentItems;

  const [localBudgetCap, setLocalBudgetCap] = useState(() => {
    return localStorage.getItem('portfolio_budget_cap') || 'Budget Cap: ₱20,000 Total (100% Allocation to Safe Shield, unchanged mandate)';
  });
  const budgetCap = propBudgetCap || localBudgetCap;
  const [isEditingDeployment, setIsEditingDeployment] = useState(false);

  const setDeploymentItems = (val: DeploymentPlanItem[] | ((prev: DeploymentPlanItem[]) => DeploymentPlanItem[])) => {
    const next = typeof val === 'function' ? val(deploymentItems) : val;
    localStorage.setItem('portfolio_deployment_items', JSON.stringify(next));
    setLocalDeploymentItems(next);
    onUpdateDeploymentItems?.(next);
  };

  const setBudgetCap = (val: string | ((prev: string) => string)) => {
    const next = typeof val === 'function' ? val(budgetCap) : val;
    localStorage.setItem('portfolio_budget_cap', next);
    setLocalBudgetCap(next);
    onUpdateBudgetCap?.(next);
  };

  // AI Sentiment Grounded Update
  const handleAISentimentUpdate = async () => {
    setIsUpdatingAI(true);
    triggerLocalToast('Initiating Google Search Grounding for Market Cycles & Trigger Rules...', 'info');
    try {
      const response = await fetch('/api/portfolio/ai-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      if (data.quotaExceeded) {
        if (onTriggerPopupModal) {
          onTriggerPopupModal(
            'quota',
            'Gemini API Quota Limit Reached',
            'Market cycle analysis reached request quota limits. The application seamlessly engaged cached offline market models.'
          );
        } else {
          setPopupState({
            isOpen: true,
            type: 'quota',
            title: 'Gemini API Quota Limit Reached',
            message: 'Market cycle analysis reached request quota limits. The application seamlessly engaged cached offline market models.'
          });
        }
        triggerLocalToast('⚠️ Quota limit reached: Loaded offline sentiment models.', 'error');
      } else if (data.searchGroundingSuccess || data.source === 'gemini_search_grounding') {
        if (onTriggerPopupModal) {
          onTriggerPopupModal(
            'search_grounding',
            'Search Grounding Successful',
            'Google Search Grounding successfully verified live 2026 market cycles, Philippine inflation metrics, and portfolio alert trigger rules!'
          );
        } else {
          setPopupState({
            isOpen: true,
            type: 'search_grounding',
            title: 'Search Grounding Successful',
            message: 'Google Search Grounding successfully verified live 2026 market cycles, Philippine inflation metrics, and portfolio alert trigger rules!'
          });
        }
        triggerLocalToast('✨ Market cycles & alert triggers auto-updated via Search Grounding!', 'success');
      }

      if (data.success) {
        if (data.cycleItems) setCycleItems(data.cycleItems);
        if (data.devaluationItems) setDevaluationItems(data.devaluationItems);
        if (data.deploymentItems) setDeploymentItems(data.deploymentItems);
        if (data.auditChanges) setAuditChanges(data.auditChanges.slice(0, 5));
        if (data.alerts && Array.isArray(data.alerts) && onAddAlert) {
          data.alerts.forEach((al: any) => {
            onAddAlert({
              asset: al.asset || 'Portfolio Wide',
              type: al.type || 'volatility',
              thresholdPercentage: al.thresholdPercentage || 5,
              message: al.message || 'AI Market Cycle Alert Trigger'
            });
          });
        }
      } else {
        triggerLocalToast(`⚠️ Update failed: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (e: any) {
      triggerLocalToast(`⚠️ Error: ${e.message}`, 'error');
    } finally {
      setIsUpdatingAI(false);
    }
  };

  // Dynamic Portfolio Weight Calculations
  const safeAssets = assets.filter((a) => a.class === 'safe');
  const totalSafeShield = safeAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);

  const riskAssets = assets.filter((a) => a.class === 'risk');
  const totalRiskSleeve = riskAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);

  const totalPortfolioValue = totalSafeShield + totalRiskSleeve;
  const safeWeight = totalPortfolioValue > 0 ? (totalSafeShield / totalPortfolioValue) * 100 : 0;
  const riskWeight = totalPortfolioValue > 0 ? (totalRiskSleeve / totalPortfolioValue) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Activity className="w-4 h-4" />
            <span>Macro Research & Institutional Market Audit</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Market Cycle & Audit Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time tracking of asset cycle price phases, BSP currency devaluation hedges, USD defense mechanics, and audit revision logs.
          </p>
        </div>

        <button
          onClick={handleAISentimentUpdate}
          disabled={isUpdatingAI}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 text-amber-300 ${isUpdatingAI ? 'animate-spin' : ''}`} />
          <span>{isUpdatingAI ? 'Updating Grounded Sentiment...' : 'Auto-Update Market Cycles'}</span>
        </button>
      </div>

      {/* SECTION 1: ASSET CYCLE ANALYSIS (PRICE PHASE) */}
      <div id="cycle-audit-section" data-highlight-id="cycle-audit-section" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>1. Asset Cycle Analysis (Price Phase)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cycle phase, market sentiment, and institutional thesis for key holdings
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isEditingCycle && (
              <>
                <button
                  onClick={() => {
                    const newItem: CycleItem = {
                      id: `c-${Date.now()}`,
                      asset: 'New Asset',
                      phase: 'Consolidation',
                      sentiment: 'Neutral',
                      logic: 'Institutional reasoning...'
                    };
                    setCycleItems([...cycleItems, newItem]);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Reset cycle analysis to defaults?')) {
                      setCycleItems(INITIAL_CYCLE_ITEMS);
                    }
                  }}
                  className="px-3 py-1.5 border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </>
            )}
            <button
              onClick={() => setIsEditingCycle(!isEditingCycle)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isEditingCycle 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {isEditingCycle ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              <span>{isEditingCycle ? 'Done' : 'Edit Section'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="pb-3 pl-2 w-36">Asset Class</th>
                <th className="pb-3 w-40">Cycle Phase</th>
                <th className="pb-3 w-32">Sentiment</th>
                <th className="pb-3 pr-2">Institutional Logic & Market Thesis</th>
                {isEditingCycle && <th className="pb-3 w-12 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {cycleItems.map((item) => {
                let phaseStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                if (item.phase === 'Markup' || item.phase === 'Hardening') {
                  phaseStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400';
                } else if (item.phase === 'Markdown') {
                  phaseStyle = 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400';
                } else if (item.phase === 'Consolidation') {
                  phaseStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300';
                }

                let sentimentColor = 'text-slate-600 dark:text-slate-300';
                if (item.sentiment === 'Bullish') sentimentColor = 'text-emerald-600 dark:text-emerald-400';
                else if (item.sentiment === 'Bearish') sentimentColor = 'text-rose-600 dark:text-rose-400';
                else if (item.sentiment === 'Neutral') sentimentColor = 'text-amber-600 dark:text-amber-400';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                    <td className="py-3.5 pl-2 font-bold text-slate-900 dark:text-white">
                      {isEditingCycle ? (
                        <input
                          type="text"
                          value={item.asset}
                          onChange={(e) => {
                            setCycleItems(prev => prev.map(c => c.id === item.id ? { ...c, asset: e.target.value } : c));
                          }}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                        />
                      ) : (
                        item.asset
                      )}
                    </td>
                    <td className="py-3.5">
                      {isEditingCycle ? (
                        <input
                          type="text"
                          value={item.phase}
                          onChange={(e) => {
                            setCycleItems(prev => prev.map(c => c.id === item.id ? { ...c, phase: e.target.value } : c));
                          }}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                        />
                      ) : (
                        <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase ${phaseStyle}`}>
                          {item.phase}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      {isEditingCycle ? (
                        <select
                          value={item.sentiment}
                          onChange={(e) => {
                            setCycleItems(prev => prev.map(c => c.id === item.id ? { ...c, sentiment: e.target.value as any } : c));
                          }}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                        >
                          <option value="Bullish">Bullish 🟢</option>
                          <option value="Neutral">Neutral 🟡</option>
                          <option value="Bearish">Bearish 🔴</option>
                        </select>
                      ) : (
                        <span className={`font-black uppercase text-[10px] tracking-wider ${sentimentColor}`}>
                          {item.sentiment === 'Bullish' ? '🟢 ' : item.sentiment === 'Bearish' ? '🔴 ' : '🟡 '}
                          {item.sentiment}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isEditingCycle ? (
                        <textarea
                          value={item.logic}
                          onChange={(e) => {
                            setCycleItems(prev => prev.map(c => c.id === item.id ? { ...c, logic: e.target.value } : c));
                          }}
                          rows={2}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                        />
                      ) : (
                        item.logic
                      )}
                    </td>
                    {isEditingCycle && (
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => {
                            setCycleItems(prev => prev.filter(c => c.id !== item.id));
                          }}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: CURRENCY DEVALUATION & USD ASSET DEFENSE (BSP) */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>2. Currency Devaluation & USD Asset Defense (BSP)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              BSP monetary parameters, exchange rate reference, portfolio exposure, and hedge effectiveness
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isEditingDevaluation && (
              <>
                <button
                  onClick={() => {
                    const newItem: DevaluationItem = {
                      id: `dv-${Date.now()}`,
                      indicator: 'New Indicator',
                      marketRef: 'value reference',
                      portfolioExposure: '0.00% (Custom)',
                      hedgeStatus: 'STATUS ASSESSMENT',
                      statusType: 'NEUTRAL'
                    };
                    setDevaluationItems([...devaluationItems, newItem]);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Indicator
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Reset currency devaluation section to defaults?')) {
                      setDevaluationItems(INITIAL_DEVALUATION_ITEMS);
                      setDevaluationTactics('🛡️ USD Defense Tactics: Crypto positions (BTC) and Commodities (PAX Gold) act as proxy hedges, effectively minimizing raw PHP purchasing power devaluations.');
                    }
                  }}
                  className="px-3 py-1.5 border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </>
            )}
            <button
              onClick={() => setIsEditingDevaluation(!isEditingDevaluation)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isEditingDevaluation 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {isEditingDevaluation ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              <span>{isEditingDevaluation ? 'Done' : 'Edit Section'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                <th className="pb-3 pl-2">Macro Indicator</th>
                <th className="pb-3">Market Reference</th>
                <th className="pb-3 text-right">Portfolio Exposure</th>
                <th className="pb-3 text-right pr-2">Hedge Status</th>
                {isEditingDevaluation && <th className="pb-3 text-center w-12">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {devaluationItems.map((item) => {
                let badgeCol = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
                if (item.statusType === 'SECURE') {
                  badgeCol = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400';
                } else if (item.statusType === 'UNDER-YIELDING') {
                  badgeCol = 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300';
                } else if (item.statusType === 'CRITICAL') {
                  badgeCol = 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400';
                }

                let displayExposure = item.portfolioExposure;
                if (item.portfolioExposure.includes('Risk Sleeve')) {
                  displayExposure = `${riskWeight.toFixed(2)}% (Risk Sleeve)`;
                } else if (item.portfolioExposure.includes('Safe Shield')) {
                  displayExposure = `${safeWeight.toFixed(2)}% (Safe Shield)`;
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                    <td className="py-3.5 pl-2 font-bold text-slate-900 dark:text-white">
                      {isEditingDevaluation ? (
                        <input
                          type="text"
                          value={item.indicator}
                          onChange={(e) => {
                            setDevaluationItems(prev => prev.map(d => d.id === item.id ? { ...d, indicator: e.target.value } : d));
                          }}
                          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs w-full"
                        />
                      ) : (
                        item.indicator
                      )}
                    </td>
                    <td className="py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {isEditingDevaluation ? (
                        <input
                          type="text"
                          value={item.marketRef}
                          onChange={(e) => {
                            setDevaluationItems(prev => prev.map(d => d.id === item.id ? { ...d, marketRef: e.target.value } : d));
                          }}
                          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs w-full"
                        />
                      ) : (
                        item.marketRef
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {isEditingDevaluation ? (
                        <input
                          type="text"
                          value={item.portfolioExposure}
                          onChange={(e) => {
                            setDevaluationItems(prev => prev.map(d => d.id === item.id ? { ...d, portfolioExposure: e.target.value } : d));
                          }}
                          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs text-right w-full font-mono"
                        />
                      ) : (
                        displayExposure
                      )}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      {isEditingDevaluation ? (
                        <div className="flex flex-col gap-1 items-end">
                          <input
                            type="text"
                            value={item.hedgeStatus}
                            onChange={(e) => {
                              setDevaluationItems(prev => prev.map(d => d.id === item.id ? { ...d, hedgeStatus: e.target.value } : d));
                            }}
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs text-right w-full"
                          />
                          <select
                            value={item.statusType}
                            onChange={(e) => {
                              setDevaluationItems(prev => prev.map(d => d.id === item.id ? { ...d, statusType: e.target.value as any } : d));
                            }}
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-0.5 text-[10px]"
                          >
                            <option value="SECURE">SECURE (Green)</option>
                            <option value="UNDER-YIELDING">UNDER-YIELDING (Yellow)</option>
                            <option value="CRITICAL">CRITICAL (Red)</option>
                            <option value="NEUTRAL">NEUTRAL (Gray)</option>
                          </select>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${badgeCol}`}>
                          {item.hedgeStatus}
                        </span>
                      )}
                    </td>
                    {isEditingDevaluation && (
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => {
                            setDevaluationItems(prev => prev.filter(d => d.id !== item.id));
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          {isEditingDevaluation ? (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">USD Defense Tactics Note</label>
              <textarea
                value={devaluationTactics}
                onChange={(e) => setDevaluationTactics(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
              />
            </div>
          ) : (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 text-indigo-900 dark:text-indigo-300 rounded-xl text-xs leading-relaxed font-medium">
              {devaluationTactics}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: WHAT CHANGED SINCE THE LAST AUDIT (MAXIMUM OF 5 UPDATES) */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>3. What Changed Since The Last Audit (Jul 2 → {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strict audit log tracking key balance adjustments, rate changes, and portfolio structural shifts (Maximum of 5 updates)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isEditingAudit && (
              <>
                <button
                  disabled={auditChanges.length >= 5}
                  onClick={() => {
                    if (auditChanges.length < 5) {
                      const newItem: AuditChangeItem = {
                        id: `ac-${Date.now()}`,
                        title: 'New Update Title',
                        description: 'Describe what changed since the last financial audit.'
                      };
                      setAuditChanges([...auditChanges, newItem]);
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Update ({auditChanges.length}/5)
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Reset audit changes list to default 5 updates?')) {
                      setAuditChanges(INITIAL_AUDIT_CHANGES);
                    }
                  }}
                  className="px-3 py-1.5 border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </>
            )}
            <button
              onClick={() => setIsEditingAudit(!isEditingAudit)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isEditingAudit 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {isEditingAudit ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              <span>{isEditingAudit ? 'Done' : 'Edit Updates'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-4">
            {auditChanges.slice(0, 3).map((item, idx) => (
              <div key={item.id} className="p-4 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5 rounded-xl flex items-start space-x-3 group">
                <span className="w-5 h-5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  {isEditingAudit ? (
                    <div className="space-y-1.5 w-full">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          setAuditChanges(prev => prev.map(a => a.id === item.id ? { ...a, title: e.target.value } : a));
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded px-2.5 py-1 text-xs font-bold w-full"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => {
                          setAuditChanges(prev => prev.map(a => a.id === item.id ? { ...a, description: e.target.value } : a));
                        }}
                        rows={2}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded px-2.5 py-1 text-xs w-full"
                      />
                    </div>
                  ) : (
                    <p>
                      <strong className="font-bold text-slate-900 dark:text-white">{item.title}:</strong> {item.description}
                    </p>
                  )}
                </div>
                {isEditingAudit && (
                  <button
                    onClick={() => {
                      setAuditChanges(prev => prev.filter(a => a.id !== item.id));
                    }}
                    className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded shrink-0 self-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {auditChanges.slice(3, 5).map((item, idx) => (
              <div key={item.id} className="p-4 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5 rounded-xl flex items-start space-x-3 group">
                <span className="w-5 h-5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 4}
                </span>
                <div className="flex-1">
                  {isEditingAudit ? (
                    <div className="space-y-1.5 w-full">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          setAuditChanges(prev => prev.map(a => a.id === item.id ? { ...a, title: e.target.value } : a));
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded px-2.5 py-1 text-xs font-bold w-full"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => {
                          setAuditChanges(prev => prev.map(a => a.id === item.id ? { ...a, description: e.target.value } : a));
                        }}
                        rows={2}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded px-2.5 py-1 text-xs w-full"
                      />
                    </div>
                  ) : (
                    <p>
                      <strong className="font-bold text-slate-900 dark:text-white">{item.title}:</strong> {item.description}
                    </p>
                  )}
                </div>
                {isEditingAudit && (
                  <button
                    onClick={() => {
                      setAuditChanges(prev => prev.filter(a => a.id !== item.id));
                    }}
                    className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded shrink-0 self-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: CAPITAL DEPLOYMENT PLAN */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>4. Strategic Capital Deployment Execution Plan</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tactical roadmap and execution controls for cash surplus allocations
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isEditingDeployment && (
              <>
                <button
                  onClick={() => {
                    const newItem: DeploymentPlanItem = {
                      id: `dp-${Date.now()}`,
                      date: 'Aug 15',
                      asset: 'HYS Savings',
                      amount: '₱10,000.00',
                      status: 'PROCEED',
                      description: 'surplus allocation'
                    };
                    setDeploymentItems([...deploymentItems, newItem]);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Action
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Reset deployment plan to default?')) {
                      setDeploymentItems(INITIAL_DEPLOYMENT_ITEMS);
                      setBudgetCap('Budget Cap: ₱20,000 Total (100% Allocation to Safe Shield, unchanged mandate)');
                    }
                  }}
                  className="px-3 py-1.5 border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </>
            )}
            <button
              onClick={() => setIsEditingDeployment(!isEditingDeployment)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isEditingDeployment 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {isEditingDeployment ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              <span>{isEditingDeployment ? 'Done' : 'Edit Plan'}</span>
            </button>
          </div>
        </div>

        {isEditingDeployment ? (
          <div className="mb-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Budget Cap Mandate</label>
            <input
              type="text"
              value={budgetCap}
              onChange={(e) => setBudgetCap(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-hidden font-medium"
            />
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs font-bold text-amber-900 dark:text-amber-300 mb-5 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{budgetCap}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deploymentItems.map((item) => {
            let statusStyle = 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400';
            let emoji = '🟢';
            if (item.status === 'ABORT') {
              statusStyle = 'border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400';
              emoji = '🔴';
            } else if (item.status === 'HOLD') {
              statusStyle = 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400';
              emoji = '🟡';
            }

            return (
              <div key={item.id} className={`p-4 border rounded-xl flex flex-col justify-between ${statusStyle}`}>
                <div>
                  {isEditingDeployment ? (
                    <div className="space-y-2 mb-2">
                      <input
                        type="text"
                        placeholder="Date"
                        value={item.date}
                        onChange={(e) => {
                          setDeploymentItems(prev => prev.map(d => d.id === item.id ? { ...d, date: e.target.value } : d));
                        }}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs w-full"
                      />
                      <input
                        type="text"
                        placeholder="Asset"
                        value={item.asset}
                        onChange={(e) => {
                          setDeploymentItems(prev => prev.map(d => d.id === item.id ? { ...d, asset: e.target.value } : d));
                        }}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs w-full"
                      />
                      <input
                        type="text"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => {
                          setDeploymentItems(prev => prev.map(d => d.id === item.id ? { ...d, amount: e.target.value } : d));
                        }}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs w-full"
                      />
                      <select
                        value={item.status}
                        onChange={(e) => {
                          setDeploymentItems(prev => prev.map(d => d.id === item.id ? { ...d, status: e.target.value as any } : d));
                        }}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs w-full"
                      >
                        <option value="PROCEED">PROCEED</option>
                        <option value="ABORT">ABORT</option>
                        <option value="HOLD">HOLD</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          setDeploymentItems(prev => prev.map(d => d.id === item.id ? { ...d, description: e.target.value } : d));
                        }}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          {item.date}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {emoji} {item.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.asset} {item.amount}
                      </h4>
                      <p className="text-xs mt-1 leading-relaxed opacity-90 font-medium">
                        {item.description}
                      </p>
                    </>
                  )}
                </div>

                {isEditingDeployment && (
                  <button
                    onClick={() => {
                      setDeploymentItems(prev => prev.filter(d => d.id !== item.id));
                    }}
                    className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded self-end mt-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: CUSTOM PRICE-DROP & VOLATILITY ALERT TRIGGERS */}
      <div id="alert-triggers" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>5. Custom Price-Drop & Volatility Alert Triggers</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Define custom percentage threshold triggers for specific assets or portfolio-wide indices. Receive real-time toast and news feed notifications upon breach.
            </p>
          </div>
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showAlertForm ? 'Close Form' : 'New Trigger Rule'}</span>
          </button>
        </div>

        {showAlertForm && (
          <form onSubmit={handleAlertSubmit} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 p-5 rounded-xl space-y-4 animate-slide-down">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Configure Custom Trigger Threshold</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Target Asset</label>
                <select
                  value={alertAssetKey}
                  onChange={(e) => {
                    setAlertAssetKey(e.target.value);
                    const name = e.target.value === 'all' ? 'Portfolio Wide' : (assets.find(a => a.key === e.target.value)?.name || e.target.value);
                    if (alertType === 'down') setAlertMessage(`${name} price drop exceeds ${alertThreshold}% threshold`);
                    else if (alertType === 'volatility') setAlertMessage(`${name} volatility spike exceeds ±${alertThreshold}%`);
                    else setAlertMessage(`${name} price surge exceeds +${alertThreshold}%`);
                  }}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">🌐 All Assets / Portfolio Wide</option>
                  {assets.map((a) => (
                    <option key={a.key} value={a.key}>{a.name} ({a.platform})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Trigger Condition Type</label>
                <select
                  value={alertType}
                  onChange={(e) => {
                    const type = e.target.value as any;
                    setAlertType(type);
                    const name = alertAssetKey === 'all' ? 'Portfolio Wide' : (assets.find(a => a.key === alertAssetKey)?.name || alertAssetKey);
                    if (type === 'down') setAlertMessage(`${name} price drop exceeds ${alertThreshold}% threshold`);
                    else if (type === 'volatility') setAlertMessage(`${name} volatility spike exceeds ±${alertThreshold}%`);
                    else setAlertMessage(`${name} price surge exceeds +${alertThreshold}%`);
                  }}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="down">📉 Price Drop (Drawdown)</option>
                  <option value="volatility">⚡ Volatility Spike (±% Swing)</option>
                  <option value="up">📈 Price Surge (Breakout)</option>
                  <option value="info">ℹ️ Informational / Macro</option>
                </select>
              </div>

              <div>
                <SmartCalculatorInput
                  label="Threshold Percentage (%)"
                  value={alertThreshold}
                  onChange={(val) => {
                    setAlertThreshold(val);
                    const name = alertAssetKey === 'all' ? 'Portfolio Wide' : (assets.find(a => a.key === alertAssetKey)?.name || alertAssetKey);
                    if (alertType === 'down') setAlertMessage(`${name} price drop exceeds ${val}% threshold`);
                    else if (alertType === 'volatility') setAlertMessage(`${name} volatility spike exceeds ±${val}%`);
                    else setAlertMessage(`${name} price surge exceeds +${val}%`);
                  }}
                  currencySymbol=""
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Custom Alert Notification Message</label>
              <input
                type="text"
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAlertForm(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase shadow-xs cursor-pointer"
              >
                Activate Trigger Rule
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Active Trigger Rules & News Feeds</h4>
          {(!alerts || alerts.length === 0) ? (
            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-white/10">
              No active alert rules or news feeds configured. Click "New Trigger Rule" above to add price-drop or volatility triggers.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-white/20 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        alert.type === 'up'
                          ? 'bg-emerald-100 text-emerald-800'
                          : alert.type === 'down'
                          ? 'bg-rose-100 text-rose-800'
                          : alert.type === 'volatility'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.asset}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatTimeAgo(alert.timestamp, alert.lastTriggeredDate)}
                      </span>
                      {alert.thresholdPercentage !== undefined && (
                        <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          ±{alert.thresholdPercentage}% Trigger
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{alert.message}</p>
                    {alert.lastTriggeredDate && (
                      <div className="text-[10px] text-slate-400 font-mono pt-1">
                        Last Triggered: {new Date(alert.lastTriggeredDate).toLocaleDateString()} {new Date(alert.lastTriggeredDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({formatTimeAgo(undefined, alert.lastTriggeredDate)})
                      </div>
                    )}
                  </div>
                  {onDeleteAlert && (
                    <button
                      onClick={() => onDeleteAlert(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                      title="Remove Trigger Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {localToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-white/10 dark:border-slate-200/50 flex items-center gap-2 animate-fade-in select-none">
          {localToast.type === 'success' ? (
            <span className="text-emerald-400">✔️</span>
          ) : localToast.type === 'error' ? (
            <span className="text-rose-400">❌</span>
          ) : (
            <span className="text-blue-400 animate-pulse font-bold">●</span>
          )}
          <span>{localToast.message}</span>
        </div>
      )}

      <AIPopupModal
        isOpen={popupState.isOpen}
        type={popupState.type}
        title={popupState.title}
        message={popupState.message}
        onClose={() => setPopupState((p) => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
