import React, { useState, useEffect } from 'react';
import { AssetPosition, TradeEntry, MarketAlert } from '../types';
import { Sliders, Plus, Play, RefreshCw, Sparkles, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp, Info, Bell, Trash2, Calendar, Percent } from 'lucide-react';
import SmartCalculatorInput from './SmartCalculatorInput';
import { formatTimeAgo, getAssetValuation } from '../lib/formatters';

interface AssetSleeveTabProps {
  assets: AssetPosition[];
  onUpdateAssetPrice: (key: string, newPrice: number) => void;
  onUpdateAssetHoldings: (
    key: string, 
    units: number, 
    cost: number, 
    details?: { 
      startDate?: string; 
      maturityDate?: string; 
      yieldPercent?: number; 
      yieldFrequency?: 'annual' | 'monthly' | 'semi-annual' | 'quarterly'; 
      withholdingTaxPercent?: number;
      assetClass?: 'safe' | 'risk' | 'physical' | 'liability';
      assetType?: 'cash' | 'deposit' | 'crypto' | 'commodity' | 'equity' | 'property' | 'liability';
    }
  ) => void;
  onAddTrade: (trade: Omit<TradeEntry, 'id'>) => void;
  targetAllocation: number;
  onUpdateTargetAllocation: (val: number) => void;
  onExecuteSyncAI: (customKey: string) => Promise<any>;
  usdPhpRate: number;
  onAddAsset: (asset: AssetPosition) => void;
  alerts?: MarketAlert[];
  onAddAlert?: (alert: Omit<MarketAlert, 'id' | 'timestamp'>) => void;
  onDeleteAlert?: (id: string) => void;
  highlightId?: { type: string; id: string; tab?: string } | null;
}

export default function AssetSleeveTab({
  assets,
  onUpdateAssetPrice,
  onUpdateAssetHoldings,
  onAddTrade,
  targetAllocation,
  onUpdateTargetAllocation,
  onExecuteSyncAI,
  usdPhpRate,
  onAddAsset,
  alerts = [],
  onAddAlert,
  onDeleteAlert,
  highlightId,
}: AssetSleeveTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'safe' | 'risk' | 'physical' | 'liability'>('safe');
  const [syncLoading, setSyncLoading] = useState(false);
  const [customKey, setCustomKey] = useState('');

  // Relative timestamp ticker
  const [, setTimeTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTimeTicker((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  // Auto-switch subtabs or open forms when pinpointed by search engine
  useEffect(() => {
    if (!highlightId) return;
    if (highlightId.id === 'safe-assets-section') setActiveSubTab('safe');
    else if (highlightId.id === 'risk-assets-section') setActiveSubTab('risk');
    else if (highlightId.id === 'physical-assets-section') setActiveSubTab('physical');
    else if (highlightId.id === 'trade-entry-section') setShowTradeForm(true);
    else if (highlightId.type === 'Asset') {
      const asset = assets.find(a => a.key === highlightId.id);
      if (asset) {
        setActiveSubTab(asset.class as any);
      }
    }
  }, [highlightId, assets]);
  
  // Manual Trade Entry Form
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeAssetKey, setTradeAssetKey] = useState('btc');
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeUnits, setTradeUnits] = useState('0.0005');
  const [tradePricePHP, setTradePricePHP] = useState('');
  const [tradeNotes, setTradeNotes] = useState('Manual offline trade entry');

  // Manual Asset Adjust Modal state
  const [editingAsset, setEditingAsset] = useState<AssetPosition | null>(null);
  const [editUnits, setEditUnits] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editClass, setEditClass] = useState<'safe' | 'risk' | 'physical' | 'liability'>('safe');
  const [editAssetType, setEditAssetType] = useState<'cash' | 'deposit' | 'crypto' | 'commodity' | 'equity' | 'property' | 'liability'>('cash');
  const [editStartDate, setEditStartDate] = useState('');
  const [editMaturityDate, setEditMaturityDate] = useState('');
  const [editYieldPercent, setEditYieldPercent] = useState('');
  const [editYieldFrequency, setEditYieldFrequency] = useState<'annual' | 'monthly' | 'semi-annual' | 'quarterly'>('annual');
  const [editWithholdingTax, setEditWithholdingTax] = useState('');

  const handleQuickTransferClass = (asset: AssetPosition, targetClass: 'safe' | 'risk' | 'physical' | 'liability') => {
    const targetType = targetClass === 'liability' ? 'liability' : (asset.assetType === 'liability' ? 'property' : asset.assetType);
    onUpdateAssetHoldings(asset.key, asset.units, asset.costBasisPHP, {
      startDate: asset.startDate,
      maturityDate: asset.maturityDate,
      yieldPercent: asset.yieldPercent,
      yieldFrequency: asset.yieldFrequency,
      withholdingTaxPercent: asset.withholdingTaxPercent,
      assetClass: targetClass,
      assetType: targetType,
    });
  };

  // Add Asset Form state
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [newAssetKey, setNewAssetKey] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetPlatform, setNewAssetPlatform] = useState('');
  const [newAssetClass, setNewAssetClass] = useState<'safe' | 'risk' | 'physical'>('safe');
  const [newAssetType, setNewAssetType] = useState<'cash' | 'deposit' | 'crypto' | 'commodity' | 'equity' | 'property'>('cash');
  const [newAssetUnits, setNewAssetUnits] = useState('1');
  const [newAssetCost, setNewAssetCost] = useState('0');
  const [newAssetPrice, setNewAssetPrice] = useState('1');
  const [newAssetStartDate, setNewAssetStartDate] = useState('');
  const [newAssetMaturityDate, setNewAssetMaturityDate] = useState('');
  const [newAssetYieldPercent, setNewAssetYieldPercent] = useState('');
  const [newAssetYieldFrequency, setNewAssetYieldFrequency] = useState<'annual' | 'monthly' | 'semi-annual' | 'quarterly'>('annual');
  const [newAssetWithholdingTax, setNewAssetWithholdingTax] = useState('20');

  const safeAssets = assets.filter((a) => a.class === 'safe');
  const riskAssets = assets.filter((a) => a.class === 'risk');
  const physicalAssets = assets.filter((a) => a.class === 'physical');
  const liabilityAssets = assets.filter((a) => a.class === 'liability');

  const totalSafeValue = safeAssets.reduce((sum, a) => sum + getAssetValuation(a).totalValue, 0);
  const totalRiskValue = riskAssets.reduce((sum, a) => sum + getAssetValuation(a).totalValue, 0);
  const totalPhysicalValue = physicalAssets.reduce((sum, a) => sum + getAssetValuation(a).totalValue, 0);
  const totalLiabilityValue = liabilityAssets.reduce((sum, a) => sum + getAssetValuation(a).totalValue, 0);

  const handleAISyncClick = async () => {
    setSyncLoading(true);
    try {
      await onExecuteSyncAI(customKey);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.key === tradeAssetKey);
    if (!asset) return;

    const unitsNum = Number(tradeUnits);
    const priceNum = Number(tradePricePHP) || asset.currentPricePHP;
    const amountPHP = unitsNum * priceNum;

    onAddTrade({
      assetKey: tradeAssetKey,
      assetName: asset.name,
      action: tradeAction,
      units: unitsNum,
      pricePHP: priceNum,
      amountPHP,
      date: new Date().toISOString().split('T')[0],
      notes: tradeNotes,
    });

    setShowTradeForm(false);
    setTradePricePHP('');
  };

  const handleEditAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    onUpdateAssetHoldings(editingAsset.key, Number(editUnits), Number(editCost), {
      startDate: editStartDate || undefined,
      maturityDate: editMaturityDate || undefined,
      yieldPercent: editYieldPercent !== '' && !isNaN(Number(editYieldPercent)) ? Number(editYieldPercent) : undefined,
      yieldFrequency: editYieldFrequency,
      withholdingTaxPercent: editWithholdingTax !== '' && !isNaN(Number(editWithholdingTax)) ? Number(editWithholdingTax) : undefined,
      assetClass: editClass,
      assetType: editAssetType,
    });
    onUpdateAssetPrice(editingAsset.key, Number(editPrice));
    setEditingAsset(null);
  };

  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetKey || !newAssetName || !newAssetPlatform) return;

    onAddAsset({
      key: newAssetKey.toLowerCase().trim().replace(/\s+/g, '_'),
      name: newAssetName,
      platform: newAssetPlatform,
      class: newAssetClass,
      assetType: newAssetType,
      units: Number(newAssetUnits) || 0,
      costBasisPHP: Number(newAssetCost) || 0,
      currentPricePHP: Number(newAssetPrice) || 0,
      change24h: 0,
      startDate: newAssetStartDate || undefined,
      maturityDate: newAssetMaturityDate || undefined,
      yieldPercent: newAssetYieldPercent !== '' && !isNaN(Number(newAssetYieldPercent)) ? Number(newAssetYieldPercent) : undefined,
      yieldFrequency: newAssetYieldFrequency,
      withholdingTaxPercent: newAssetWithholdingTax !== '' && !isNaN(Number(newAssetWithholdingTax)) ? Number(newAssetWithholdingTax) : undefined,
    });

    setShowAssetForm(false);
    setNewAssetKey('');
    setNewAssetName('');
    setNewAssetPlatform('');
    setNewAssetClass('safe');
    setNewAssetType('cash');
    setNewAssetUnits('1');
    setNewAssetCost('0');
    setNewAssetPrice('1');
    setNewAssetStartDate('');
    setNewAssetMaturityDate('');
    setNewAssetYieldPercent('');
    setNewAssetYieldFrequency('annual');
    setNewAssetWithholdingTax('20');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* AISync control panel */}
      <div className="bg-gradient-to-r from-blue-50/80 via-white to-transparent dark:from-slate-900/80 dark:via-slate-900/40 dark:to-transparent border border-slate-200 dark:border-white/5 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-teal-400 animate-pulse" />
            <span>Grounded Live Market pricing Engine</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Consolidate indices with current real-world quotes. Uses Gemini 2.5-Flash with Google Search grounding. Securely bypasses local rate boundaries when you specify your personal key.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="password"
              placeholder="Paste custom Gemini API key (optional)..."
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 w-64 placeholder:text-slate-400"
            />
            <span className="text-[10px] text-slate-400 font-semibold">Key saved browser-locally only</span>
          </div>
        </div>

        <button
          onClick={handleAISyncClick}
          disabled={syncLoading}
          className="relative overflow-hidden group shrink-0 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
          <span>{syncLoading ? 'Executing Grounded AI Search...' : 'Consolidate via Gemini AI'}</span>
        </button>
      </div>

      {/* Manual trade execution form block */}
      {showTradeForm && (
        <form onSubmit={handleTradeSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-xl space-y-4 shadow-sm animate-slide-down">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Record Manual trade (Offline Sync)</h4>
            <button type="button" onClick={() => setShowTradeForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs">Cancel</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">Select Asset Target</label>
              <select
                value={tradeAssetKey}
                onChange={(e) => setTradeAssetKey(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
              >
                {assets.map((a) => (
                  <option key={a.key} value={a.key}>{a.name} ({a.platform})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">Operation</label>
              <select
                value={tradeAction}
                onChange={(e) => setTradeAction(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
              >
                <option value="BUY">BUY Inflow</option>
                <option value="SELL">SELL Outflow</option>
              </select>
            </div>
            <div>
              <SmartCalculatorInput
                label="Units Count / Volume"
                value={tradeUnits}
                onChange={setTradeUnits}
                currencySymbol=""
              />
            </div>
            <div>
              <SmartCalculatorInput
                label="Custom Price (PHP) [Optional]"
                value={tradePricePHP}
                onChange={setTradePricePHP}
                placeholder="Market Rate Default"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">Audit Trail Note</label>
            <input
              type="text"
              value={tradeNotes}
              onChange={(e) => setTradeNotes(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            Commit offline trade synchronization
          </button>
        </form>
      )}

      {/* Tables layout section with toggle sub-tab */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10">
          <div className="flex flex-wrap border-b sm:border-b-0 border-slate-200 dark:border-white/10">
            <button
              onClick={() => setActiveSubTab('safe')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeSubTab === 'safe'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-500/5 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              🛡️ Safe Shield Protection Assets
            </button>
            <button
              onClick={() => setActiveSubTab('risk')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeSubTab === 'risk'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-500/5 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              🚀 Risk Sleeve Growth
            </button>
            <button
              onClick={() => setActiveSubTab('physical')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeSubTab === 'physical'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/20 dark:bg-purple-500/5 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              🏠 Physical Assets
            </button>
            <button
              onClick={() => setActiveSubTab('liability')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeSubTab === 'liability'
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400 bg-rose-50/20 dark:bg-rose-500/5 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              💸 Liabilities & Loans
            </button>
          </div>
          <div className="p-3 sm:p-0 sm:pr-6 flex flex-wrap items-center gap-2">
            <button
              id="trade-entry-section"
              data-highlight-id="trade-entry-section"
              onClick={() => setShowTradeForm(!showTradeForm)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all border border-slate-200 dark:border-white/5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Record Trade</span>
            </button>
            <button
              onClick={() => setShowAssetForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Asset & Risk</span>
            </button>
          </div>
        </div>

        {activeSubTab === 'physical' && (
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                  Cash-Flow Asset vs. Liability Audit
                </h4>
                <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  Does this physical item put money <i>into</i> your pocket (positive cash flow or yields) or take money <i>out</i> (mortgage payments, taxes, maintenance)? Under cash-flow accounting, items causing net financial drain are <b>Liabilities</b>. You can transfer any item directly to Liabilities below with complete data retention.
                </p>
              </div>
            </div>
          </div>
        )}

        <div 
          id={activeSubTab === 'safe' ? 'safe-assets-section' : activeSubTab === 'risk' ? 'risk-assets-section' : activeSubTab === 'physical' ? 'physical-assets-section' : 'liability-assets-section'}
          data-highlight-id={activeSubTab === 'safe' ? 'safe-assets-section' : activeSubTab === 'risk' ? 'risk-assets-section' : activeSubTab === 'physical' ? 'physical-assets-section' : 'liability-assets-section'}
          className="overflow-x-auto"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/5">
                <th className="p-5 pl-8">Asset Identifier</th>
                <th className="p-5">Custodian / Platform</th>
                <th className="p-5 text-right">Yield / Rate (%)</th>
                <th className="p-5 text-center">Term / Dates</th>
                <th className="p-5 text-right">Units Held</th>
                <th className="p-5 text-right">Principal Cost Basis</th>
                <th className="p-5 text-right">Total Valuation (PHP)</th>
                <th className="p-5 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {(activeSubTab === 'safe' ? safeAssets : activeSubTab === 'risk' ? riskAssets : activeSubTab === 'physical' ? physicalAssets : liabilityAssets).map((asset) => {
                const valuation = getAssetValuation(asset);
                const totalValue = valuation.totalValue;
                const profitLoss = valuation.interestEarned;
                const isProfitable = profitLoss >= 0;

                return (
                  <tr key={asset.key} id={asset.key} data-highlight-id={asset.key} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors duration-150">
                    <td className="p-5 pl-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-200 text-xs">{asset.name}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 capitalize">{asset.assetType} index</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500 dark:text-slate-400 text-xs">{asset.platform}</td>
                    <td className="p-5 text-right text-xs font-mono font-bold">
                      {asset.yieldPercent !== undefined && asset.yieldPercent !== null ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-md font-extrabold inline-flex items-center gap-1">
                            <Percent className="w-2.5 h-2.5" />
                            {asset.yieldPercent}% {
                              asset.yieldFrequency === 'monthly' ? 'p.m.' :
                              asset.yieldFrequency === 'semi-annual' ? '/ 6 mos' :
                              asset.yieldFrequency === 'quarterly' ? '/ quarter' :
                              'p.a.'
                            }
                          </span>
                          {asset.withholdingTaxPercent !== undefined && asset.withholdingTaxPercent > 0 && (
                            <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                              Less {asset.withholdingTaxPercent}% WHT
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="p-5 text-center text-xs">
                      {asset.startDate || asset.maturityDate ? (
                        <div className="flex flex-col items-center justify-center space-y-0.5">
                          {asset.startDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                              <Calendar className="w-2.5 h-2.5 text-slate-400" />
                              <span>Start: <b>{asset.startDate}</b></span>
                            </span>
                          )}
                          {asset.maturityDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                              <Calendar className="w-2.5 h-2.5 text-blue-500" />
                              <span>Matures: {asset.maturityDate}</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-5 text-right text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {asset.units.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </td>
                    <td className="p-5 text-right text-xs font-mono text-slate-500">
                      ₱{asset.costBasisPHP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          ₱{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <div className="flex flex-col items-end mt-0.5">
                          {valuation.isYieldBased ? (
                            <>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                +₱{valuation.interestEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} net yield ({valuation.daysElapsed}d)
                              </span>
                              {valuation.taxWithheld > 0 && (
                                <span className="text-[9px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 font-mono">
                                  (Less ₱{valuation.taxWithheld.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} WHT)
                                </span>
                              )}
                              {asset.maturityDate && valuation.expectedMaturityValue > valuation.totalValue && (
                                <span className="text-[9px] text-slate-400 mt-0.5">
                                  Est. Maturity: ₱{valuation.expectedMaturityValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center space-x-1.5">
                              <span className={`text-[10px] font-bold ${isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {isProfitable ? '+' : ''}₱{profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              {asset.change24h !== undefined && asset.change24h !== 0 && (
                                <span className={`inline-flex items-center text-[9px] font-extrabold ${asset.change24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  ({asset.change24h >= 0 ? '+' : ''}{asset.change24h}%)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {asset.class === 'physical' && (
                          <button
                            onClick={() => handleQuickTransferClass(asset, 'liability')}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-rose-200 dark:border-rose-800/40 transition-all flex items-center gap-1 shrink-0"
                            title="Transfer item to Liabilities & Loans (Zero Data Loss)"
                          >
                            <span>To Liabilities 💸</span>
                          </button>
                        )}
                        {asset.class === 'liability' && (
                          <button
                            onClick={() => handleQuickTransferClass(asset, 'physical')}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-purple-200 dark:border-purple-800/40 transition-all flex items-center gap-1 shrink-0"
                            title="Transfer item to Physical Assets"
                          >
                            <span>To Physical 🏠</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setEditUnits(asset.units.toString());
                            setEditCost(asset.costBasisPHP.toString());
                            setEditPrice(asset.currentPricePHP.toString());
                            setEditClass(asset.class);
                            setEditAssetType(asset.assetType);
                            setEditStartDate(asset.startDate || '');
                            setEditMaturityDate(asset.maturityDate || '');
                            setEditYieldPercent(asset.yieldPercent !== undefined && asset.yieldPercent !== null ? asset.yieldPercent.toString() : '');
                            setEditYieldFrequency(asset.yieldFrequency || 'annual');
                            setEditWithholdingTax(asset.withholdingTaxPercent !== undefined && asset.withholdingTaxPercent !== null ? asset.withholdingTaxPercent.toString() : '');
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider rounded-lg border border-slate-200 dark:border-white/5 transition-all"
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust holdings modal dialog */}
      {editingAsset && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-lg relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2.5 mb-4">
              <span>Calibrate Core Holdings: {editingAsset.name}</span>
            </h3>

            <form onSubmit={handleEditAssetSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">Class Group</label>
                  <select
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
                  >
                    <option value="safe">🛡️ Safe Shield</option>
                    <option value="risk">🚀 Risk Sleeve</option>
                    <option value="physical">🏠 Physical</option>
                    <option value="liability">💸 Liability / Loan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">Asset Category</label>
                  <select
                    value={editAssetType}
                    onChange={(e) => setEditAssetType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="deposit">Deposit</option>
                    <option value="crypto">Crypto</option>
                    <option value="commodity">Commodity</option>
                    <option value="equity">Equity</option>
                    <option value="property">Property</option>
                    <option value="liability">Liability</option>
                  </select>
                </div>
              </div>
              <div>
                <SmartCalculatorInput
                  label="Units / Shares volume"
                  value={editUnits}
                  onChange={setEditUnits}
                  currencySymbol=""
                />
              </div>

              <div>
                <SmartCalculatorInput
                  label="Total Acquisition Cost (PHP)"
                  value={editCost}
                  onChange={setEditCost}
                />
              </div>

              <div>
                <SmartCalculatorInput
                  label="Current Price Quotation (PHP)"
                  value={editPrice}
                  onChange={setEditPrice}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-white/5">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    <span>Starting Date</span>
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    <span>Maturity Date</span>
                  </label>
                  <input
                    type="date"
                    value={editMaturityDate}
                    onChange={(e) => setEditMaturityDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3 text-emerald-500" />
                  <span>Yield / Interest Rate</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  <div className="relative col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 5.25"
                      value={editYieldPercent}
                      onChange={(e) => setEditYieldPercent(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 pr-8"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                  </div>
                  <select
                    value={editYieldFrequency}
                    onChange={(e) => setEditYieldFrequency(e.target.value as any)}
                    className="col-span-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-2 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="annual">p.a. (Per Annum)</option>
                    <option value="monthly">per month</option>
                    <option value="semi-annual">per 6 mos</option>
                    <option value="quarterly">per quarter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-500" />
                    <span>Withholding Tax (%)</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">Standard PH: 20%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="20 (leave blank if 0%)"
                    value={editWithholdingTax}
                    onChange={(e) => setEditWithholdingTax(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 pr-8"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase"
                >
                  Commit Holdings Calibration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Asset Modal Dialog */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-lg relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2.5 mb-4">
              <span>Register New Asset / Risk Position</span>
            </h3>

            <form onSubmit={handleAddAssetSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">Asset Key ID (e.g. apple, eth, pse_sm)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. apple_shares"
                  value={newAssetKey}
                  onChange={(e) => setNewAssetKey(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple Inc. Shares (PSE)"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">Custodian Platform / Broker</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DragonFi Brokerage"
                  value={newAssetPlatform}
                  onChange={(e) => setNewAssetPlatform(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">Asset Class Group</label>
                  <select
                    value={newAssetClass}
                    onChange={(e) => setNewAssetClass(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="safe">🛡️ Safe Shield</option>
                    <option value="risk">🚀 Risk Sleeve (Growth)</option>
                    <option value="physical">🏠 Risk Sleeve (Physical)</option>
                    <option value="liability">💸 Liability / Loan / Mortgage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">Asset Type Category</label>
                  <select
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="deposit">Deposit / Time Dep</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="commodity">Commodity / Metals</option>
                    <option value="equity">Equity / PSE Stocks</option>
                    <option value="property">Property / Real Estate</option>
                    <option value="liability">Liability / Loan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <SmartCalculatorInput
                    label="Units Count"
                    value={newAssetUnits}
                    onChange={setNewAssetUnits}
                    currencySymbol=""
                  />
                </div>

                <div>
                  <SmartCalculatorInput
                    label="Cost Basis"
                    value={newAssetCost}
                    onChange={setNewAssetCost}
                  />
                </div>

                <div>
                  <SmartCalculatorInput
                    label="Price Per Unit"
                    value={newAssetPrice}
                    onChange={setNewAssetPrice}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-white/5">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    <span>Starting Date</span>
                  </label>
                  <input
                    type="date"
                    value={newAssetStartDate}
                    onChange={(e) => setNewAssetStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    <span>Maturity Date</span>
                  </label>
                  <input
                    type="date"
                    value={newAssetMaturityDate}
                    onChange={(e) => setNewAssetMaturityDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3 text-emerald-500" />
                  <span>Yield / Interest Rate</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  <div className="relative col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 5.25"
                      value={newAssetYieldPercent}
                      onChange={(e) => setNewAssetYieldPercent(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 pr-8"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                  </div>
                  <select
                    value={newAssetYieldFrequency}
                    onChange={(e) => setNewAssetYieldFrequency(e.target.value as any)}
                    className="col-span-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-2 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="annual">p.a. (Per Annum)</option>
                    <option value="monthly">per month</option>
                    <option value="semi-annual">per 6 mos</option>
                    <option value="quarterly">per quarter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-500" />
                    <span>Withholding Tax (%)</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">Standard PH: 20%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="20 (leave blank if 0%)"
                    value={newAssetWithholdingTax}
                    onChange={(e) => setNewAssetWithholdingTax(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 pr-8"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAssetForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase"
                >
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
