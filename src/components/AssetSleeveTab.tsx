import React, { useState, useEffect } from 'react';
import { AssetPosition, TradeEntry, MarketAlert } from '../types';
import { Sliders, Plus, Play, RefreshCw, Sparkles, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp, Info, Bell, Trash2 } from 'lucide-react';
import SmartCalculatorInput from './SmartCalculatorInput';

interface AssetSleeveTabProps {
  assets: AssetPosition[];
  onUpdateAssetPrice: (key: string, newPrice: number) => void;
  onUpdateAssetHoldings: (key: string, units: number, cost: number) => void;
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

  // Auto-switch subtabs or open forms when pinpointed by search engine
  useEffect(() => {
    if (!highlightId) return;
    if (highlightId.id === 'safe-assets-section') setActiveSubTab('safe');
    else if (highlightId.id === 'risk-assets-section') setActiveSubTab('risk');
    else if (highlightId.id === 'physical-assets-section') setActiveSubTab('physical');
    else if (highlightId.id === 'trade-entry-section') setShowTradeForm(true);
    else if (highlightId.id === 'market-alerts-section' || highlightId.id === 'alert-triggers') setShowAlertForm(true);
    else if (highlightId.type === 'Asset') {
      const asset = assets.find(a => a.key === highlightId.id);
      if (asset) {
        setActiveSubTab(asset.class as any);
      }
    }
  }, [highlightId, assets]);

  // Custom Alert Triggers state
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertAssetKey, setAlertAssetKey] = useState('all');
  const [alertType, setAlertType] = useState<'down' | 'volatility' | 'up' | 'info'>('down');
  const [alertThreshold, setAlertThreshold] = useState('5');
  const [alertMessage, setAlertMessage] = useState('Price drop exceeds 5% threshold');

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
  };
  
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

  const safeAssets = assets.filter((a) => a.class === 'safe');
  const riskAssets = assets.filter((a) => a.class === 'risk');
  const physicalAssets = assets.filter((a) => a.class === 'physical');
  const liabilityAssets = assets.filter((a) => a.class === 'liability');

  const totalSafeValue = safeAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const totalRiskValue = riskAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const totalPhysicalValue = physicalAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const totalLiabilityValue = liabilityAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);

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

    onUpdateAssetHoldings(editingAsset.key, Number(editUnits), Number(editCost));
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

      {/* Target Allocation Adjuster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-teal-400" />
              <span>Safety Threshold & Asset Weights Calibrator</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 leading-relaxed">
              Dynamically calibrate your personal safety margin threshold standard. Target allocations prevent excessive leverage in speculative cryptocurrency or real estate sleeve asset indices.
            </p>
          </div>

          <div className="space-y-6 bg-slate-50 dark:bg-slate-950/50 p-5 rounded-xl border border-slate-100 dark:border-white/5">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Safe Shield protection standard target (%)</span>
                <div className="w-full sm:w-48 shrink-0">
                  <SmartCalculatorInput
                    label=""
                    value={targetAllocation.toString()}
                    onChange={(val) => {
                      const parsedVal = val.replace(/[^0-9.]/g, '');
                      const num = parseFloat(parsedVal);
                      if (!isNaN(num)) {
                        onUpdateTargetAllocation(Math.min(95, Math.max(50, num)));
                      }
                    }}
                    currencySymbol=""
                    placeholder="85"
                  />
                </div>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={targetAllocation}
                onChange={(e) => onUpdateTargetAllocation(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none transition-colors"
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
              <span>Conservative Minimum (50%)</span>
              <span>Speculative Maximum (95%)</span>
            </div>
          </div>
        </div>

        {/* Visual quick summary of assets weight */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Allocation Weights & Net Worth</h3>
          <div className="space-y-3.5 my-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Liquid Safe Shield:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₱{totalSafeValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Risk Sleeve Growth:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">₱{totalRiskValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Physical Assets:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">₱{totalPhysicalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Liabilities / Debt:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">₱{totalLiabilityValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-slate-100 dark:border-white/5 pt-2 flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Comprehensive Portfolio Size:</span>
              <span className="font-bold text-slate-900 dark:text-white">₱{(totalSafeValue + totalRiskValue + totalPhysicalValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Calculated Net Worth:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">₱{(totalSafeValue + totalRiskValue + totalPhysicalValue - totalLiabilityValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <button
            id="trade-entry-section"
            data-highlight-id="trade-entry-section"
            onClick={() => setShowTradeForm(!showTradeForm)}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all border border-slate-200 dark:border-white/5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Trade execution</span>
          </button>
        </div>
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
          <div className="p-3 sm:p-0 sm:pr-6">
            <button
              onClick={() => setShowAssetForm(true)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Asset & Risk</span>
            </button>
          </div>
        </div>

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
                <th className="p-5 text-right">Units Held</th>
                <th className="p-5 text-right">Principal Cost Basis</th>
                <th className="p-5 text-right">Current Valuation Rate</th>
                <th className="p-5 text-right">Computed Allocation</th>
                <th className="p-5 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {(activeSubTab === 'safe' ? safeAssets : activeSubTab === 'risk' ? riskAssets : activeSubTab === 'physical' ? physicalAssets : liabilityAssets).map((asset) => {
                const totalValue = asset.units * asset.currentPricePHP;
                const profitLoss = totalValue - asset.costBasisPHP;
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
                    <td className="p-5 text-right text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {asset.units.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </td>
                    <td className="p-5 text-right text-xs font-mono text-slate-500">
                      ₱{asset.costBasisPHP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-5 text-right text-xs font-mono text-slate-700 dark:text-slate-300">
                      ₱{asset.currentPricePHP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      {asset.change24h !== undefined && (
                        <span className={`inline-flex items-center text-[10px] font-bold ml-1.5 ${asset.change24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {asset.change24h >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {asset.change24h}%
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          ₱{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[10px] font-bold mt-0.5 ${isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isProfitable ? '+' : ''}₱{profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-right pr-8">
                      <button
                        onClick={() => {
                          setEditingAsset(asset);
                          setEditUnits(asset.units.toString());
                          setEditCost(asset.costBasisPHP.toString());
                          setEditPrice(asset.currentPricePHP.toString());
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider rounded-lg border border-slate-200 dark:border-white/5 transition-all"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Price-Drop & Volatility Alert Triggers UI Component */}
      <div id="alert-triggers" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Custom Price-Drop & Volatility Alert Triggers</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Define custom percentage threshold triggers for specific assets or portfolio-wide indices. Receive real-time toast and news feed notifications upon breach.
            </p>
          </div>
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-xs shrink-0"
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
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase shadow-xs"
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
                      <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                      {alert.thresholdPercentage !== undefined && (
                        <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          ±{alert.thresholdPercentage}% Trigger
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{alert.message}</p>
                    {alert.lastTriggeredDate && (
                      <div className="text-[10px] text-slate-400 font-mono pt-1">
                        Last Triggered: {new Date(alert.lastTriggeredDate).toLocaleDateString()} {new Date(alert.lastTriggeredDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    )}
                  </div>
                  {onDeleteAlert && (
                    <button
                      onClick={() => onDeleteAlert(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
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

      {/* Adjust holdings modal dialog */}
      {editingAsset && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-lg relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2.5 mb-4">
              <span>Calibrate Core Holdings: {editingAsset.name}</span>
            </h3>

            <form onSubmit={handleEditAssetSubmit} className="space-y-4">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase"
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
