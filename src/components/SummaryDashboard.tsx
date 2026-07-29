import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AssetPosition, ExpenseEntry, BudgetLimit } from '../types';
import { AlertTriangle, TrendingUp, Filter, Percent, Calendar, BarChart3, ArrowDownRight, ArrowUpRight, DollarSign, Layers } from 'lucide-react';
import SmartCalculatorInput from './SmartCalculatorInput';

interface SummaryDashboardProps {
  assets: AssetPosition[];
  expenses: ExpenseEntry[];
  budgets: BudgetLimit[];
  onAdjustBudgetLimit: (category: string, newLimit: number) => void;
  onResyncBudgets: () => void;
  targetAllocation: number;
  isAdmin?: boolean;
}

export default function SummaryDashboard({
  assets,
  expenses,
  budgets,
  onAdjustBudgetLimit,
  onResyncBudgets,
  targetAllocation,
  isAdmin = false,
}: SummaryDashboardProps) {
  const [selectedAssetClass, setSelectedAssetClass] = useState<'all' | 'safe' | 'risk' | 'physical'>('all');
  const [adjustingBudget, setAdjustingBudget] = useState<string | null>(null);
  const [adjustedLimit, setAdjustedLimit] = useState<string>('');
  const [spendViewCategory, setSpendViewCategory] = useState<'all' | 'Grocery' | 'Utilities' | 'Travel' | 'Dining' | 'Shopping' | 'Other'>('all');

  // Calculates financial aggregates
  const totalSafe = assets.filter((a) => a.class === 'safe').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const totalRisk = assets.filter((a) => a.class === 'risk').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const totalPhysical = assets.filter((a) => a.class === 'physical').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const financialNetWorth = totalSafe + totalRisk;
  const grandTotalNetWorth = financialNetWorth + totalPhysical;

  const currentSafeRatio = financialNetWorth > 0 ? (totalSafe / financialNetWorth) * 100 : 0;
  const isSafeShieldViolated = currentSafeRatio < targetAllocation;

  // Pie chart data
  const pieData = [
    { name: 'Safe Shield', value: totalSafe, color: '#10b981' },
    { name: 'Risk Sleeve', value: totalRisk, color: '#6366f1' },
    { name: 'Physical Assets', value: totalPhysical, color: '#a855f7' },
  ];

  // Chronological baseline monthly template initialized to 0 so it resets when no expenses exist and strictly syncs with ledger
  const emptyMonthlyBaseline: Record<string, { Grocery: number; Utilities: number; Travel: number; Dining: number; Shopping: number; Other: number }> = {
    'Jan 26': { Grocery: 0, Utilities: 0, Travel: 0, Dining: 0, Shopping: 0, Other: 0 },
    'Feb 26': { Grocery: 0, Utilities: 0, Travel: 0, Dining: 0, Shopping: 0, Other: 0 },
    'Mar 26': { Grocery: 0, Utilities: 0, Travel: 0, Dining: 0, Shopping: 0, Other: 0 },
    'Apr 26': { Grocery: 0, Utilities: 0, Travel: 0, Dining: 0, Shopping: 0, Other: 0 },
    'May 26': { Grocery: 0, Utilities: 0, Travel: 0, Dining: 0, Shopping: 0, Other: 0 },
    'Jun 26': { Grocery: 0, Utilities: 0, Travel: 0, Dining: 0, Shopping: 0, Other: 0 },
    'Jul 26': { Grocery: 0, Utilities: 0, Travel: 0, Dining: 0, Shopping: 0, Other: 0 },
  };

  // Helper to categorize user logged expenses
  const mapExpenseCategory = (cat: string): 'Grocery' | 'Utilities' | 'Travel' | 'Dining' | 'Shopping' | 'Other' => {
    const c = (cat || '').toLowerCase();
    if (c.includes('groc') || (c.includes('food') && !c.includes('din') && !c.includes('out')) || c.includes('supermarket')) return 'Grocery';
    if (c.includes('util') || c.includes('elect') || c.includes('water') || c.includes('bill') || c.includes('wifi') || c.includes('internet')) return 'Utilities';
    if (c.includes('trav') || c.includes('fuel') || c.includes('gas') || c.includes('commute') || c.includes('transport') || c.includes('flight') || c.includes('hotel')) return 'Travel';
    if (c.includes('din') || c.includes('rest') || c.includes('eat') || c.includes('coffee') || c.includes('cafe')) return 'Dining';
    if (c.includes('shop') || c.includes('mall') || c.includes('cloth') || c.includes('lifestyle') || c.includes('retail') || c.includes('amazon') || c.includes('lazada') || c.includes('shopee')) return 'Shopping';
    return 'Other';
  };

  // Format date string to MMM YY
  const formatMonthLabel = (dateStr: string) => {
    try {
      if (!dateStr) return 'Jul 26';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Jul 26';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    } catch {
      return 'Jul 26';
    }
  };

  // Aggregate expenses by month strictly from user ledger
  const aggregatedMonthsMap: Record<string, { Grocery: number; Utilities: number; Travel: number; Dining: number; Shopping: number; Other: number }> = JSON.parse(JSON.stringify(emptyMonthlyBaseline));

  expenses.forEach((e) => {
    const monthKey = formatMonthLabel(e.date);
    if (!aggregatedMonthsMap[monthKey]) {
      aggregatedMonthsMap[monthKey] = { Grocery: 0, Utilities: 0, Travel: 0, Dining: 0, Shopping: 0, Other: 0 };
    }
    const bucket = mapExpenseCategory(e.category);
    const amount = e.amountPHP || 0;
    aggregatedMonthsMap[monthKey][bucket] += amount;
  });

  const monthlySpendData = Object.entries(aggregatedMonthsMap).map(([month, cats]) => {
    const total = cats.Grocery + cats.Utilities + cats.Travel + cats.Dining + cats.Shopping + cats.Other;
    return {
      month,
      ...cats,
      Total: Number(total.toFixed(2)),
    };
  });

  // Calculate high-level summary KPIs for Monthly Spend Overview
  const totalSpendAllMonths = monthlySpendData.reduce((sum, item) => sum + item.Total, 0);
  const activeMonthsWithSpend = monthlySpendData.filter((item) => item.Total > 0);
  const avgMonthlySpend = activeMonthsWithSpend.length > 0 ? totalSpendAllMonths / activeMonthsWithSpend.length : 0;
  const highestSpendMonth = monthlySpendData.reduce((max, item) => (item.Total > max.Total ? item : max), { month: '-', Total: 0 });
  
  // Calculate MoM change (last month vs previous month)
  const lastMonthObj = monthlySpendData[monthlySpendData.length - 1];
  const prevMonthObj = monthlySpendData.length > 1 ? monthlySpendData[monthlySpendData.length - 2] : null;
  const momChangePercent = prevMonthObj && prevMonthObj.Total > 0 ? ((lastMonthObj.Total - prevMonthObj.Total) / prevMonthObj.Total) * 100 : 0;

  // Dynamic Cumulative Cash Burn Rate Calculation
  const savedLivingExpenses = typeof window !== 'undefined' ? localStorage.getItem('monthly_living_expenses') : null;
  const baseLivingExpenses = savedLivingExpenses && !isNaN(Number(savedLivingExpenses)) && Number(savedLivingExpenses) > 0 
    ? Number(savedLivingExpenses) 
    : 9000;
  
  const effectiveMonthlyBurn = avgMonthlySpend > 0 ? avgMonthlySpend : baseLivingExpenses;
  const cashBurnRunwayMonths = effectiveMonthlyBurn > 0 ? totalSafe / effectiveMonthlyBurn : 0;

  // Generates aggregated spending bar data
  const spendingByCategory = budgets.map((b) => ({
    category: b.category,
    spent: b.spentPHP,
    limit: b.limitPHP,
    ratio: (b.spentPHP / b.limitPHP) * 100,
  }));

  // Historical performance trends for filtered assets
  const filteredAssets = assets.filter((a) => selectedAssetClass === 'all' || a.class === selectedAssetClass);

  // Synthesize realistic historical valuation curve indices
  const historicalIndices = [
    { month: 'Dec 25', safeVal: 120000, riskVal: 20633, physicalVal: 56000 },
    { month: 'Jan 26', safeVal: 121000, riskVal: 21500, physicalVal: 56000 },
    { month: 'Feb 26', safeVal: 121500, riskVal: 20500, physicalVal: 56000 },
    { month: 'Mar 26', safeVal: 156500, riskVal: 30500, physicalVal: 56000 },
    { month: 'Apr 26', safeVal: 176500, riskVal: 38025, physicalVal: 56000 },
    { month: 'May 26', safeVal: 230500, riskVal: 38500, physicalVal: 56000 },
    { month: 'Jun 26', safeVal: 208500, riskVal: 39000, physicalVal: 56000 },
    { month: 'Jul 26', safeVal: totalSafe, riskVal: totalRisk, physicalVal: totalPhysical },
  ];

  const historicalChartData = historicalIndices.map((pt) => {
    let value = 0;
    if (selectedAssetClass === 'all') value = pt.safeVal + pt.riskVal + pt.physicalVal;
    else if (selectedAssetClass === 'safe') value = pt.safeVal;
    else if (selectedAssetClass === 'risk') value = pt.riskVal;
    else if (selectedAssetClass === 'physical') value = pt.physicalVal;

    return {
      period: pt.month,
      Valuation: Number(value.toFixed(2)),
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Target allocation visual banners and warning triggers (Admin Only) */}
      {isAdmin && (
      <div id="net-worth-summary" data-highlight-id="net-worth-summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 shadow-xs group">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1.5">Asset Net Worth</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₱{grandTotalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2.5 font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-max flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Liquid + Physical Book
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 shadow-xs group">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1.5">Safe Shield Ratio</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{currentSafeRatio.toFixed(2)}%</span>
            <span className="text-xs text-slate-500">/ {targetAllocation}% target</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 mt-3.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${isSafeShieldViolated ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(currentSafeRatio, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 shadow-xs group">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1.5">Cumulative Cash Burn Rate</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {cashBurnRunwayMonths.toFixed(1)} Months
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2.5">
            Coverage @ ₱{Math.round(effectiveMonthlyBurn).toLocaleString()}/mo baseline
          </p>
        </div>

        {/* High visual priority budget safety shield alerts */}
        <div className={`border rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5 ${
          isSafeShieldViolated 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-sm' 
            : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Shield Hardening Alert</p>
              <h4 className="text-sm font-bold mt-1 text-slate-900 dark:text-white">
                {isSafeShieldViolated ? 'Risk Buy Freeze Active' : 'Strategic Hold standard'}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {isSafeShieldViolated 
                  ? 'Your Safe Shield is underweight. Liquidate risk assets or deposit cash into HYS.'
                  : 'Shield allocation holds above structural thresholds. Dynamic allocations approved.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Historical Asset performance analysis graphs (Admin Only) */}
      {isAdmin && (
      <div id="asset-allocation-section" data-highlight-id="asset-allocation-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6 gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-teal-400" />
                <span>Historical Net Worth Curves</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Multi-period trend analysis filtered across asset divisions</p>
            </div>
            
            {/* Filter buttons */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              {(['all', 'safe', 'risk', 'physical'] as const).map((cl) => (
                <button
                  key={cl}
                  onClick={() => setSelectedAssetClass(cl)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                    selectedAssetClass === cl
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {cl}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="period" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `₱${v / 1000}k`} />
                <Tooltip
                  formatter={(val: number) => [`₱${val.toLocaleString()}`, 'Valuation']}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelClassName="text-white font-bold"
                />
                <Line
                  type="monotone"
                  dataKey="Valuation"
                  stroke={selectedAssetClass === 'safe' ? '#10b981' : selectedAssetClass === 'risk' ? '#3b82f6' : selectedAssetClass === 'physical' ? '#a855f7' : '#06b6d4'}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Doughnut Pie of Asset allocations */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Asset Class Structuring
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Proportional distribution ratios across liquid, volatile, and fixed indexes</p>
          </div>

          <div className="relative h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => `₱${val.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Liquid Worth</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ₱{(totalSafe + totalRisk).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
            {pieData.map((el) => {
              const ratio = grandTotalNetWorth > 0 ? (el.value / grandTotalNetWorth) * 100 : 0;
              return (
                <div key={el.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: el.color }} />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{el.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 font-bold">
                    <span className="text-slate-500 dark:text-slate-400">₱{el.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/5 text-[10px]">{ratio.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Monthly Spend Overview (lg:col-span-2) & Category Limit Controls (lg:col-span-1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Spend Overview */}
        <div id="monthly-spend-overview" className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <div className="flex items-center space-x-2 text-blue-600 dark:text-teal-400 font-bold uppercase tracking-widest text-xs mb-1">
                <Calendar className="w-4 h-4" />
                <span>Historical Expenditure Analysis</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-teal-400" />
                <span>Monthly Spend Overview</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Aggregated historical expenditure trends by calendar month, strictly synchronized from your ledger outflows
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 self-start sm:self-center">
              {(['all', 'Grocery', 'Utilities', 'Travel', 'Dining', 'Shopping', 'Other'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSpendViewCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                    spendViewCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All (Stacked)' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-lg p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Monthly Outflow</span>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                  ₱{avgMonthlySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-lg p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Peak Spend Month</span>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                  {highestSpendMonth.Total > 0 ? (
                    <>
                      {highestSpendMonth.month} <span className="text-xs font-normal text-slate-500">(₱{highestSpendMonth.Total.toLocaleString()})</span>
                    </>
                  ) : (
                    <span className="text-xs font-normal text-slate-400">No spend recorded</span>
                  )}
                </div>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-lg p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Latest MoM Trend</span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`text-sm font-black font-mono ${totalSpendAllMonths === 0 ? 'text-slate-400 font-normal text-xs' : momChangePercent <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {totalSpendAllMonths === 0 ? 'No trend data' : `${momChangePercent > 0 ? '+' : ''}${momChangePercent.toFixed(1)}%`}
                  </span>
                  {totalSpendAllMonths > 0 && (
                    <span className="text-[10px] text-slate-500">vs {prevMonthObj ? prevMonthObj.month : 'prev'}</span>
                  )}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${totalSpendAllMonths === 0 ? 'bg-slate-500/10 text-slate-400' : momChangePercent <= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                {totalSpendAllMonths === 0 ? <BarChart3 className="w-4 h-4" /> : momChangePercent <= 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              </div>
            </div>
          </div>

          <div className="h-80 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpendData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: number, name: string) => [`₱${val.toLocaleString()}`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelClassName="text-white font-bold"
                />
                <Legend />
                {spendViewCategory === 'all' ? (
                  <>
                    <Bar dataKey="Grocery" stackId="spend" fill="#10b981" name="Grocery" />
                    <Bar dataKey="Utilities" stackId="spend" fill="#a855f7" name="Utilities" />
                    <Bar dataKey="Travel" stackId="spend" fill="#3b82f6" name="Travel" />
                    <Bar dataKey="Dining" stackId="spend" fill="#fb7185" name="Dining" />
                    <Bar dataKey="Shopping" stackId="spend" fill="#fb923c" name="Shopping" />
                    <Bar dataKey="Other" stackId="spend" fill="#94a3b8" name="Other" radius={[4, 4, 0, 0]} />
                  </>
                ) : (
                  <Bar
                    dataKey={spendViewCategory}
                    fill={
                      spendViewCategory === 'Grocery'
                        ? '#10b981'
                        : spendViewCategory === 'Utilities'
                        ? '#a855f7'
                        : spendViewCategory === 'Travel'
                        ? '#3b82f6'
                        : spendViewCategory === 'Dining'
                        ? '#fb7185'
                        : spendViewCategory === 'Shopping'
                        ? '#fb923c'
                        : '#94a3b8'
                    }
                    name={spendViewCategory}
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget violation tracker */}
        <div id="category-limits-section" data-highlight-id="category-limits-section" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex justify-between items-center">
              Category Limit Controls
              <button onClick={onResyncBudgets} className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">Sync Ledger</button>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Live threshold meters highlighting monthly spending caps</p>
          </div>

          <div className="space-y-4.5">
            {budgets.map((b) => {
              const isOverLimit = b.spentPHP > b.limitPHP;
              const ratio = b.limitPHP > 0 ? (b.spentPHP / b.limitPHP) * 100 : 100;
              return (
                <div key={b.category} id={`budget-${b.category}`} data-highlight-id={`budget-${b.category}`} className="space-y-1.5 p-1 rounded-lg transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{b.category}</span>
                    <div className="flex items-center space-x-2">
                      {adjustingBudget === b.category ? (
                          <div className="flex items-center space-x-2">
                             <SmartCalculatorInput
                                label=""
                                value={adjustedLimit}
                                onChange={setAdjustedLimit}
                                currencySymbol=""
                                className="w-20"
                             />
                             <button onClick={() => {
                                onAdjustBudgetLimit(b.category, Number(adjustedLimit));
                                setAdjustingBudget(null);
                             }} className="text-xs bg-emerald-500 text-white px-2 py-1 rounded">Save</button>
                          </div>
                      ) : (
                        <>
                          <span className={`font-mono font-bold ${isOverLimit ? 'text-rose-500 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`}>
                            ₱{b.spentPHP.toLocaleString()} / ₱{b.limitPHP.toLocaleString()}
                          </span>
                          <button onClick={() => {
                              setAdjustingBudget(b.category);
                              setAdjustedLimit(b.limitPHP.toString());
                          }} className="text-[10px] text-blue-600 dark:text-blue-400 underline uppercase tracking-wider font-bold">Adjust</button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverLimit ? 'bg-rose-500' : ratio > 80 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(ratio, 100)}%` }}
                    />
                  </div>
                  {isOverLimit && (
                    <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wider flex items-center">
                      <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                      Critical: Budget Limit Overrun!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
