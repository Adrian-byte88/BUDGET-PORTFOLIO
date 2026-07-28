import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { AssetPosition } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Percent,
  TrendingDown,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Activity,
  Coins,
  History,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Calendar,
  Check,
  Edit2,
  RotateCcw
} from 'lucide-react';

interface HistoricalTx {
  id: string;
  date: string;
  asset: string;
  type: string;
  amount: string;
  details: string;
}

const INITIAL_HISTORICAL_TXS: HistoricalTx[] = [
  { id: 'h-1', date: '2025-12-29', asset: 'Time Deposit', type: 'Buy', amount: '₱60,000.00', details: 'Initial Placement (Accrued).' },
  { id: 'h-2', date: '2025-12-29', asset: 'PAX Gold', type: 'Buy', amount: '₱10,000.00', details: 'Initial commodity hedge.' },
  { id: 'h-3', date: '2025-12-30', asset: 'Bitcoin', type: 'Buy', amount: '₱10,000.00', details: 'Initial GCrypto entry.' },
  { id: 'h-4', date: '2026-02-24', asset: 'PAX Gold', type: 'Sell', amount: '-₱1,000.00', details: 'Tactical trim.' },
  { id: 'h-5', date: '2026-03-02', asset: 'PAX Gold', type: 'Sell', amount: '-₱1,000.00', details: 'Profit take.' },
  { id: 'h-6', date: '2026-03-03', asset: 'Manulife REIT', type: 'Buy', amount: '₱10,000.00', details: 'Asia-Pacific REIT Entry.' },
  { id: 'h-7', date: '2026-03-04', asset: 'Bond', type: 'Buy', amount: '₱25,000.00', details: 'Principal locked.' },
  { id: 'h-8', date: '2026-03-11', asset: 'PAX Gold', type: 'Buy', amount: '+₱12,000.00', details: 'Major scale-in.' },
  { id: 'h-9', date: '2026-04-08', asset: 'HYS Savings', type: 'Deposit', amount: '+₱1,000.00', details: 'Shield hardening.' },
  { id: 'h-10', date: '2026-04-10', asset: 'HYS Savings', type: 'Deposit', amount: '+₱30,000.00', details: 'Major liquidity injection.' },
  { id: 'h-11', date: '2026-04-14', asset: 'HYS Savings', type: 'Deposit', amount: '+₱10,000.00', details: 'Shield consolidation.' },
  { id: 'h-12', date: '2026-04-21', asset: 'Income Assets', type: 'Buy', amount: '₱7,493.07', details: 'DragonFi entry (RCR, SCC, SPC).' },
  { id: 'h-13', date: '2026-04-27', asset: 'BTC', type: 'Buy', amount: '+₱316.00', details: 'Micro-Sizing execution.' },
  { id: 'h-14', date: '2026-04-27', asset: 'PAX Gold', type: 'Buy', amount: '+₱633.00', details: 'Micro-Sizing execution.' },
  { id: 'h-15', date: '2026-04-28', asset: 'Strategy', type: 'Pivot', amount: 'Proportional 20%', details: 'Pivot to 80/20 Salary Funding model.' },
  { id: 'h-16', date: '2026-04-29', asset: 'HYS Savings', type: 'Deposit', amount: '+₱10,000.00', details: 'Independent liquidity addition.' },
  { id: 'h-17', date: '2026-05-17', asset: 'HYS Savings', type: 'Deposit', amount: '+₱43,000.00', details: 'Massive Shield Hardening Inflow (Cash).' },
  { id: 'h-18', date: '2026-05-30', asset: 'HYS Savings', type: 'Deposit', amount: '+₱11,000.00', details: 'Liquidity sync / surplus placement.' },
  { id: 'h-19', date: '2026-06-03', asset: 'Bond (June 3)', type: 'Liquidate', amount: '-₱25,350.00', details: 'Bond matured at yield ceiling. Full liquidation.' },
  { id: 'h-20', date: '2026-06-03', asset: 'HYS Savings', type: 'Transfer', amount: '+₱25,350.00', details: 'Matured bond proceeds.' },
  { id: 'h-21', date: '2026-06-03', asset: 'Time Deposit', type: 'Buy', amount: '-₱100,000.00', details: '6-Month Placement (6% p.a., matures Dec 3, 2026).' },
  { id: 'h-22', date: '2026-06-03', asset: 'HYS Savings', type: 'Withdraw', amount: '-₱100,000.00', details: 'Consolidated HYS capital transfer to Time Deposit.' },
  { id: 'h-23', date: '2026-06-09', asset: 'HYS Savings', type: 'Deposit', amount: '+₱8,500.00', details: 'Cash deposit; initial HYS rate change.' },
  { id: 'h-24', date: '2026-06-11', asset: 'HYS Savings', type: 'Withdraw', amount: '-₱10,000.00', details: 'Capital withdrawal for private loan.' },
  { id: 'h-25', date: '2026-06-11', asset: 'Personal Loan', type: 'Lend', amount: '+₱10,000.00', details: '1-Month cash loan to friend (5% fixed interest, matures Jul 11).' },
  { id: 'h-26', date: '2026-06-16', asset: 'HYS Savings', type: 'Deposit', amount: '+₱11,500.00', details: 'Cash deposit; HYS interest rate consolidated to 5% p.a.' },
  { id: 'h-27', date: '2026-06-21', asset: 'HYS Savings', type: 'Withdraw', amount: '-₱3,000.00', details: 'Capital withdrawal from savings reserves.' },
  { id: 'h-28', date: '2026-06-29', asset: 'Time Deposit', type: 'Maturity', amount: '+₱1,271.51', details: 'Dec 29 TD matured at 4.25% p.a. holding in matured pending status.' },
  { id: 'h-29', date: '2026-07-02', asset: 'HYS Savings', type: 'Deposit', amount: '+₱10,000.00', details: 'Salary-based cash injection; Safe Shield consolidation.' }
];

interface CycleItem {
  id: string;
  asset: string;
  phase: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  logic: string;
}

const INITIAL_CYCLE_ITEMS: CycleItem[] = [
  { id: 'c-1', asset: 'Bitcoin', phase: 'Consolidation', sentiment: 'Neutral', logic: 'BTC trading near $63,900, range-bound between roughly $62,700-$65,400 over the past week after slipping from summer highs near $65k-71k. Maintain long-term accumulation bias; no fresh catalyst either way.' },
  { id: 'c-2', asset: 'PAX Gold', phase: 'Consolidation', sentiment: 'Neutral', logic: 'Spot gold trading around $4,010-4,015/oz, down modestly from the ~$4,043 level in the prior audit but still near record territory. Heavy defensive base asset intact.' },
  { id: 'c-3', asset: 'REITs', phase: 'Markup', sentiment: 'Bullish', logic: 'RCR REIT up roughly 5.8% over the past month on continued dividend demand; office/commercial REIT sentiment remains constructive.' },
  { id: 'c-4', asset: 'SCC Energy', phase: 'Markdown', sentiment: 'Bearish', logic: 'SCC has drifted down toward the ₱21-25 range from ₱29+ earlier in the year on softer coal prices and lower 2025 earnings; a high-yield dividend name but still trending lower.' },
  { id: 'c-5', asset: 'SPC Power', phase: 'Markup', sentiment: 'Bullish', logic: 'SPC has climbed from the ₱9.85-10.46 range earlier in the year to ₱10.78, a solid utility demand story with a net-cash balance sheet.' },
  { id: 'c-6', asset: 'Safe Shield', phase: 'Hardening', sentiment: 'Bullish', logic: 'Dec 29 TD remains in matured/pending status; Dec 3 TD continuing to accrue at 6% p.a. HYS compounding at 5% p.a.' }
];

interface DeploymentPlanItem {
  id: string;
  date: string;
  asset: string;
  amount: string;
  status: 'PROCEED' | 'ABORT' | 'HOLD';
  description: string;
}

const INITIAL_DEPLOYMENT_ITEMS: DeploymentPlanItem[] = [
  { id: 'dp-1', date: 'Aug 15', asset: 'HYS Savings', amount: '₱10,000.00', status: 'PROCEED', description: 'direct 100% of cash surplus to shrink the gap' },
  { id: 'dp-2', date: 'Aug 30', asset: 'HYS Savings', amount: '₱10,000.00', status: 'PROCEED', description: 'continue building cash reserves toward 85% Shield' },
  { id: 'dp-3', date: 'Risk Assets', asset: 'Various', amount: '₱0.00', status: 'ABORT', description: 'risk sleeve remains overweight' }
];

interface DevaluationItem {
  id: string;
  indicator: string;
  marketRef: string;
  portfolioExposure: string;
  hedgeStatus: string;
  statusType: 'SECURE' | 'UNDER-YIELDING' | 'CRITICAL' | 'NEUTRAL';
}

const INITIAL_DEVALUATION_ITEMS: DevaluationItem[] = [
  { id: 'dv-1', indicator: 'USD/PHP Rate', marketRef: '₱61.62 (up from ₱61.42)', portfolioExposure: '15.00% (Risk Sleeve)', hedgeStatus: 'SECURE (USD-proxy assets hedge PHP volatility)', statusType: 'SECURE' },
  { id: 'dv-2', indicator: 'PH Inflation', marketRef: '6.4% (June 2026, PSA)', portfolioExposure: '85.00% (Safe Shield)', hedgeStatus: 'UNDER-YIELDING (6.4% inflation exceeds bank rates)', statusType: 'UNDER-YIELDING' }
];

interface AuditChangeItem {
  id: string;
  title: string;
  description: string;
}

const INITIAL_AUDIT_CHANGES: AuditChangeItem[] = [
  { id: 'ac-1', title: 'BTC & PAXG Volatility', description: 'Both positions fell slightly in peso terms as spot USD values softened, even though the PHP weakened slightly against the greenback (₱61.42 → ₱61.62).' },
  { id: 'ac-2', title: 'Equities Trend Divergence', description: 'SCC Energy continued its steady downtrend (now down roughly 15.21% below registered cost bases), while SPC Power (+4.76%) and RCR REIT (+5.45%) extended positive momentum.' },
  { id: 'ac-3', title: 'Inflation Moderation', description: 'Headline Philippine Inflation eased slightly to 6.4% in June 2026, narrowing the real under-yielding yield gap versus safe cash reserves, though structural under-yielding persists.' },
  { id: 'ac-4', title: 'Loan Collection Receipt', description: 'The short-term personal receivable of ₱10,000 extended to your friend matured on Jul 11—carried over in cash balances as fully collected at ₱10,500 (+₱500 accrued premium).' },
  { id: 'ac-5', title: 'Net Capital Stagnation', description: 'Total Core Portfolio value remains essentially flat versus our last audit (-0.91%), as moderate gold/crypto soft spots were safely hedged by fixed-income deposits and REIT/utility dividends.' }
];

interface MyFinancialPortfolioProps {
  assets: AssetPosition[];
  usdPhpRate: number;
  targetAllocation?: number;
}

export default function MyFinancialPortfolio({ assets, usdPhpRate, targetAllocation = 85 }: MyFinancialPortfolioProps) {
  // --- AI AND LOCAL TOAST STATES ---
  const [isUpdatingAI, setIsUpdatingAI] = useState(false);
  const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerLocalToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setLocalToast({ message, type });
    setTimeout(() => setLocalToast(null), 4000);
  };

  const handleAISentimentUpdate = async () => {
    setIsUpdatingAI(true);
    triggerLocalToast('Initiating Google Search Grounding...', 'info');
    try {
      const response = await fetch('/api/portfolio/ai-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.success) {
        if (data.cycleItems) setCycleItems(data.cycleItems);
        if (data.devaluationItems) setDevaluationItems(data.devaluationItems);
        if (data.deploymentItems) setDeploymentItems(data.deploymentItems);
        if (data.auditChanges) setAuditChanges(data.auditChanges);
        triggerLocalToast('✨ Portfolio sentiments auto-updated successfully!', 'success');
      } else {
        triggerLocalToast(`⚠️ Update failed: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (e: any) {
      triggerLocalToast(`⚠️ Error: ${e.message}`, 'error');
    } finally {
      setIsUpdatingAI(false);
    }
  };

  // --- HISTORICAL TRANSACTION REGISTRY STATES ---
  const [txs, setTxs] = useState<HistoricalTx[]>(() => {
    const saved = localStorage.getItem('historical_transactions_registry');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore and fallback
      }
    }
    return INITIAL_HISTORICAL_TXS;
  });

  useEffect(() => {
    localStorage.setItem('historical_transactions_registry', JSON.stringify(txs));
  }, [txs]);

  // --- 4. CYCLE ITEMS STATE ---
  const [cycleItems, setCycleItems] = useState<CycleItem[]>(() => {
    const saved = localStorage.getItem('portfolio_cycle_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CYCLE_ITEMS;
  });
  const [isEditingCycle, setIsEditingCycle] = useState(false);
  useEffect(() => {
    localStorage.setItem('portfolio_cycle_items', JSON.stringify(cycleItems));
  }, [cycleItems]);

  // --- 5. DEPLOYMENT PLAN STATE ---
  const [deploymentItems, setDeploymentItems] = useState<DeploymentPlanItem[]>(() => {
    const saved = localStorage.getItem('portfolio_deployment_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DEPLOYMENT_ITEMS;
  });
  const [budgetCap, setBudgetCap] = useState(() => {
    return localStorage.getItem('portfolio_budget_cap') || 'Budget Cap: ₱20,000 Total (100% Allocation to Safe Shield, unchanged mandate)';
  });
  const [isEditingDeployment, setIsEditingDeployment] = useState(false);
  useEffect(() => {
    localStorage.setItem('portfolio_deployment_items', JSON.stringify(deploymentItems));
    localStorage.setItem('portfolio_budget_cap', budgetCap);
  }, [deploymentItems, budgetCap]);

  // --- 7. CURRENCY DEVALUATION STATE ---
  const [devaluationItems, setDevaluationItems] = useState<DevaluationItem[]>(() => {
    const saved = localStorage.getItem('portfolio_devaluation_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DEVALUATION_ITEMS;
  });
  const [devaluationTactics, setDevaluationTactics] = useState(() => {
    return localStorage.getItem('portfolio_devaluation_tactics') || '🛡️ USD Defense Tactics: Crypto positions (BTC) and Commodities (PAX Gold) act as proxy hedges, effectively minimizing raw PHP purchasing power devaluations.';
  });
  const [isEditingDevaluation, setIsEditingDevaluation] = useState(false);
  useEffect(() => {
    localStorage.setItem('portfolio_devaluation_items', JSON.stringify(devaluationItems));
    localStorage.setItem('portfolio_devaluation_tactics', devaluationTactics);
  }, [devaluationItems, devaluationTactics]);

  // --- 9. WHAT CHANGED SINCE LAST AUDIT STATE ---
  const [auditChanges, setAuditChanges] = useState<AuditChangeItem[]>(() => {
    const saved = localStorage.getItem('portfolio_audit_changes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_AUDIT_CHANGES;
  });
  const [isEditingAudit, setIsEditingAudit] = useState(false);
  useEffect(() => {
    localStorage.setItem('portfolio_audit_changes', JSON.stringify(auditChanges));
  }, [auditChanges]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form states for adding new transaction
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [newDate, setNewDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [newAsset, setNewAsset] = useState('');
  const [newType, setNewType] = useState('Buy');
  const [newAmount, setNewAmount] = useState('');
  const [newDetails, setNewDetails] = useState('');

  // --- HISTORICAL TRANSACTION REGISTRY LOGIC ---
  const filteredTxs = useMemo(() => {
    return txs.filter((tx) => {
      const matchSearch =
        tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.date.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchType = selectedType === 'All' || tx.type === selectedType;
      return matchSearch && matchType;
    }).sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending by default
  }, [txs, searchTerm, selectedType]);

  // Unique types of transactions for filters
  const txTypes = useMemo(() => {
    const types = new Set<string>();
    txs.forEach(t => {
      if (t.type) types.add(t.type);
    });
    return ['All', ...Array.from(types).sort()];
  }, [txs]);

  // Pagination Math
  const totalItems = filteredTxs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTxs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTxs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTxs, currentPage, itemsPerPage]);

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, itemsPerPage]);

  const exportToCSV = () => {
    const headers = ['Date', 'Asset', 'Type', 'Amount', 'Details'];
    const rows = txs.map((tx) => [
      tx.date,
      tx.asset,
      tx.type,
      tx.amount,
      tx.details
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'historical_transaction_registry.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newAsset || !newAmount || !newDetails) return;

    // Helper to format currency amount cleanly if entered as a raw number
    let formattedAmount = newAmount;
    if (!isNaN(Number(newAmount.replace(/[^0-9.-]/g, '')))) {
      const numericVal = Number(newAmount.replace(/[^0-9.-]/g, ''));
      const sign = numericVal > 0 && (newType === 'Deposit' || newType === 'Buy' || newType === 'Transfer' || newType === 'Maturity' || newType === 'Lend') ? '+' : '';
      formattedAmount = `${sign}₱${numericVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const newTx: HistoricalTx = {
      id: `h-user-${Date.now()}`,
      date: newDate,
      asset: newAsset,
      type: newType,
      amount: formattedAmount,
      details: newDetails
    };

    setTxs([newTx, ...txs]);
    setNewAsset('');
    setNewAmount('');
    setNewDetails('');
    setIsAddingTx(false);
  };

  const handleDeleteTx = (id: string) => {
    setTxs(txs.filter(tx => tx.id !== id));
  };

  const handleResetTxs = () => {
    if (window.confirm('Are you sure you want to reset to default historical transactions?')) {
      setTxs(INITIAL_HISTORICAL_TXS);
    }
  };

  // 1. DYNAMIC ASSET COMPILATIONS
  // Safe Shield (Savings + TDs + Loans)
  const safeAssets = assets.filter((a) => a.class === 'safe');
  const totalSafeShield = safeAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);

  // Risk Sleeve (Crypto, Stocks, REITs)
  const riskAssets = assets.filter((a) => a.class === 'risk');
  const totalRiskSleeve = riskAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);

  // Physical Assets (Honda Bike, Macbook Air, etc.)
  const physicalAssets = assets.filter((a) => a.class === 'physical');
  const totalPhysical = physicalAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);

  // Liabilities (Mortgages, Auto Loans, Personal Loans)
  const liabilityAssets = assets.filter((a) => a.class === 'liability');
  const totalLiabilities = liabilityAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);

  // Total Assets
  const totalAssets = totalSafeShield + totalRiskSleeve + totalPhysical;

  // Real-time calculated Net Worth
  const netWorth = totalAssets - totalLiabilities;

  // Core Financial Portfolio excludes Physical Assets for Allocation Calculations (as shown in image where Portfolio = Safe Shield + Risk Sleeve)
  const totalPortfolioValue = totalSafeShield + totalRiskSleeve;

  // Percentage Weights
  const safeWeight = totalPortfolioValue > 0 ? (totalSafeShield / totalPortfolioValue) * 100 : 0;
  const riskWeight = totalPortfolioValue > 0 ? (totalRiskSleeve / totalPortfolioValue) * 100 : 0;

  const targetSafe = targetAllocation;
  const targetRisk = 100 - targetSafe;

  // Status Labels
  const safeStatus = safeWeight < targetSafe ? 'UNDERWEIGHT' : 'ALIGNED';
  const riskStatus = riskWeight > targetRisk ? 'OVERWEIGHT' : 'ALIGNED';

  // 2. RISK SLEEVE PILLARS SUB-ALLOCATIONS
  // Pillar 1: Crypto/Gold (BTC + PAXG)
  const cryptoGoldAssets = riskAssets.filter(
    (a) => a.assetType === 'crypto' || a.assetType === 'commodity' || a.key === 'btc' || a.key === 'paxg'
  );
  const cryptoGoldValue = cryptoGoldAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const cryptoGoldWeightOfTotal = totalPortfolioValue > 0 ? (cryptoGoldValue / totalPortfolioValue) * 100 : 0;
  const targetCryptoGoldOfTotal = 9.38; // As in the image (62.5% of the 15% risk sleeve)
  const cryptoGoldStatus = cryptoGoldWeightOfTotal > targetCryptoGoldOfTotal ? 'OVERWEIGHT' : 'UNDERWEIGHT';

  // Pillar 2: REITs (Manulife + RCR)
  const reitAssets = riskAssets.filter(
    (a) => a.key === 'manulife' || a.key === 'rcr' || a.name.toLowerCase().includes('reit')
  );
  const reitValue = reitAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const reitWeightOfTotal = totalPortfolioValue > 0 ? (reitValue / totalPortfolioValue) * 100 : 0;
  const targetReitOfTotal = 3.75; // As in the image (25% of the 15% risk sleeve)
  const reitStatus = reitWeightOfTotal > targetReitOfTotal ? 'OVERWEIGHT' : 'UNDERWEIGHT';

  // Pillar 3: Stocks (SCC + SPC)
  const stockAssets = riskAssets.filter(
    (a) => (a.assetType === 'equity' || a.key === 'scc' || a.key === 'spc') && !reitAssets.some((r) => r.key === a.key)
  );
  const stockValue = stockAssets.reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const stockWeightOfTotal = totalPortfolioValue > 0 ? (stockValue / totalPortfolioValue) * 100 : 0;
  const targetStockOfTotal = 1.87; // As in the image (12.5% of the 15% risk sleeve)
  const stockStatus = stockWeightOfTotal > targetStockOfTotal ? 'OVERWEIGHT' : 'UNDERWEIGHT';

  // 3. SALARY DILUTION MATH AUDIT
  const targetPortfolioSize = targetRisk > 0 ? totalRiskSleeve / (targetRisk / 100) : 0;
  const targetSafeShieldValue = targetPortfolioSize * (targetSafe / 100);
  const institutionalFundingGap = Math.max(0, targetSafeShieldValue - totalSafeShield);

  // 4. SECTOR ALLOCATION & DIVERSIFICATION DATA
  // Fixed Income / Cash, Commodities (Gold), Real Estate (REITs), Digital Assets, Energy / Utilities
  const sectorData = [
    {
      sector: 'Fixed Income / Cash',
      currentValue: totalSafeShield,
      portfolioPct: safeWeight,
      riskRating: 'Low',
      color: '#3b82f6', // blue
    },
    {
      sector: 'Commodities (Gold)',
      currentValue: assets.filter((a) => a.key === 'paxg' || a.assetType === 'commodity').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0),
      portfolioPct: totalPortfolioValue > 0 ? (assets.filter((a) => a.key === 'paxg' || a.assetType === 'commodity').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0) / totalPortfolioValue) * 100 : 0,
      riskRating: 'Moderate',
      color: '#eab308', // gold/yellow
    },
    {
      sector: 'Real Estate (REITs)',
      currentValue: reitValue,
      portfolioPct: reitWeightOfTotal,
      riskRating: 'Moderate',
      color: '#10b981', // emerald
    },
    {
      sector: 'Digital Assets',
      currentValue: assets.filter((a) => a.key === 'btc' || a.assetType === 'crypto').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0),
      portfolioPct: totalPortfolioValue > 0 ? (assets.filter((a) => a.key === 'btc' || a.assetType === 'crypto').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0) / totalPortfolioValue) * 100 : 0,
      riskRating: 'High',
      color: '#6366f1', // indigo
    },
    {
      sector: 'Energy / Utilities',
      currentValue: stockValue,
      portfolioPct: stockWeightOfTotal,
      riskRating: 'Moderate',
      color: '#f97316', // orange
    },
  ];

  const pieChartData = sectorData.map((s) => ({
    name: s.sector,
    value: Number(s.currentValue.toFixed(2)),
  }));

  // Months to close gap at ₱20,000 net monthly surplus
  const monthlySurplusRate = 20000;
  const monthsToCloseGap = monthlySurplusRate > 0 ? (institutionalFundingGap / monthlySurplusRate) : 0;

  // Active risk freeze status
  const isRiskFreezeActive = safeWeight < targetSafe;

  return (
    <div className="space-y-10 animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Portfolio Top Bar Alert/Status */}
      <div id="portfolio-allocation-section" data-highlight-id="portfolio-allocation-section" className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isRiskFreezeActive
          ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-500/20 text-amber-900 dark:text-amber-400'
          : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-400'
      }`}>
        <div className="flex items-start space-x-3.5">
          {isRiskFreezeActive ? (
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span>Risk Management Status:</span>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                isRiskFreezeActive ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
              }`}>
                {isRiskFreezeActive ? '⚠️ RISK FREEZE ACTIVE' : '🛡️ PORTFOLIO SECURED'}
              </span>
            </h4>
            <p className="text-xs mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
              {isRiskFreezeActive
                ? `Safe Shield ratio (${safeWeight.toFixed(2)}%) is below the requested 85.00% target floor. Direct 100% of incoming cash flows to Safe Shield cash registries.`
                : 'Your portfolio' + "'s" + ' defensive Safe Shield matches or exceeds the 85.00% target parameters.'}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleAISentimentUpdate}
            disabled={isUpdatingAI}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer select-none"
          >
            {isUpdatingAI ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>AI Grounding...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
                <span>AI Auto-Update Sections</span>
              </>
            )}
          </button>
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-lg text-center sm:text-right">
            <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest">Funding Gap</span>
            <span className="text-sm font-black font-mono text-rose-600 dark:text-rose-400">
              ₱{institutionalFundingGap.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Header Grid with Recharts Pie & Bar */}
      <div id="portfolio-charts-section" data-highlight-id="portfolio-charts-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Allocation Pizza Pie */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Asset Allocation Mix</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Visualization of current sector book valuation</p>
          </div>

          <div className="h-64 relative flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => `₱${val.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Active</span>
              <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                ₱{totalPortfolioValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
            {sectorData.map((s) => (
              <div key={s.sector} className="flex items-center space-x-2 text-[10px]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{s.sector}</span>
                <span className="font-mono font-bold ml-auto">{s.portfolioPct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Bar Comparison */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target vs Current Target Weights</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Discrepancy audit in Core Tiers & Pillars</p>
          </div>

          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Safe Shield', Current: Number(safeWeight.toFixed(2)), Target: targetSafe },
                  { name: 'Risk: Crypto/Gold', Current: Number(cryptoGoldWeightOfTotal.toFixed(2)), Target: targetCryptoGoldOfTotal },
                  { name: 'Risk: REITs', Current: Number(reitWeightOfTotal.toFixed(2)), Target: targetReitOfTotal },
                  { name: 'Risk: Stocks', Current: Number(stockWeightOfTotal.toFixed(2)), Target: targetStockOfTotal },
                ]}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} unit="%" />
                <Tooltip
                  formatter={(val: number) => `${val}%`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target" fill="#94a3b8" opacity={0.4} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-lg text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
            💡 <b>Strategic Benchmark:</b> Your objective is to expand the Safe Shield block dynamically until the <b>₱{institutionalFundingGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b> gap is dissolved. Focus entirely on Safe Cash Assets.
          </div>
        </div>

      </div>

      {/* 2. THE 85/15 ALLOCATION ARCHITECTURE TABLES */}
      <div id="portfolio-table-section" data-highlight-id="portfolio-table-section" className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>2. The 85/15 Allocation Architecture</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Strategy: 85% Safe Shield / 15% Risk Sleeve (Salary-Only Dilution)</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-950/40 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10">
                  <th className="py-4 pl-5">Tier</th>
                  <th className="py-4">Assets Included</th>
                  <th className="py-4 text-right">Current Value</th>
                  <th className="py-4 text-right">Weight %</th>
                  <th className="py-4 text-right">Target %</th>
                  <th className="py-4 text-center pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                  <td className="py-4 pl-5 text-xs font-extrabold text-blue-600 dark:text-blue-400">🛡️ SAFE SHIELD</td>
                  <td className="py-4 text-xs text-slate-600 dark:text-slate-300">Savings + TDs + Loan ({safeAssets.length} active)</td>
                  <td className="py-4 text-xs font-mono font-bold text-right text-slate-900 dark:text-white">
                    ₱{totalSafeShield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 text-xs font-mono font-bold text-right">{safeWeight.toFixed(2)}%</td>
                  <td className="py-4 text-xs font-mono text-right text-slate-400">85.0%</td>
                  <td className="py-4 text-center pr-5">
                    <span className={`px-2.5 py-1 text-[9px] font-extrabold rounded-md ${
                      safeStatus === 'UNDERWEIGHT' 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400' 
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                    }`}>
                      {safeStatus}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                  <td className="py-4 pl-5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">🚀 RISK SLEEVE</td>
                  <td className="py-4 text-xs text-slate-600 dark:text-slate-300">Crypto, Stocks, REITs ({riskAssets.length} active)</td>
                  <td className="py-4 text-xs font-mono font-bold text-right text-slate-900 dark:text-white">
                    ₱{totalRiskSleeve.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 text-xs font-mono font-bold text-right">{riskWeight.toFixed(2)}%</td>
                  <td className="py-4 text-xs font-mono text-right text-slate-400">15.0%</td>
                  <td className="py-4 text-center pr-5">
                    <span className={`px-2.5 py-1 text-[9px] font-extrabold rounded-md ${
                      riskStatus === 'OVERWEIGHT'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                    }`}>
                      {riskStatus}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                  <td className="py-4 pl-5 text-xs font-extrabold text-purple-600 dark:text-purple-400">🏠 PHYSICAL ASSETS</td>
                  <td className="py-4 text-xs text-slate-600 dark:text-slate-300">House, Vehicles, Hardware ({physicalAssets.length} active)</td>
                  <td className="py-4 text-xs font-mono font-bold text-right text-slate-900 dark:text-white">
                    ₱{totalPhysical.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 text-xs font-mono text-right text-slate-400">-</td>
                  <td className="py-4 text-xs font-mono text-right text-slate-400">-</td>
                  <td className="py-4 text-center pr-5">
                    <span className="px-2.5 py-1 text-[9px] font-extrabold rounded-md bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400">
                      PHYSICAL
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                  <td className="py-4 pl-5 text-xs font-extrabold text-rose-600 dark:text-rose-400">💸 TOTAL LIABILITIES</td>
                  <td className="py-4 text-xs text-slate-600 dark:text-slate-300">Mortgages, Auto Loans, Debts ({liabilityAssets.length} active)</td>
                  <td className="py-4 text-xs font-mono font-bold text-right text-rose-600 dark:text-rose-400">
                    -₱{totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 text-xs font-mono text-right text-slate-400">-</td>
                  <td className="py-4 text-xs font-mono text-right text-slate-400">-</td>
                  <td className="py-4 text-center pr-5">
                    <span className="px-2.5 py-1 text-[9px] font-extrabold rounded-md bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400">
                      OUTFLOW DEBT
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-white/10 font-bold">
                <tr className="bg-blue-500/5">
                  <td className="py-4 pl-5 text-xs font-black text-blue-600 dark:text-teal-400 uppercase tracking-widest">Calculated Real-Time Net Worth</td>
                  <td className="py-4 text-[10px] text-slate-500 dark:text-slate-400">Net Worth Valuation</td>
                  <td className="py-4 text-sm font-mono font-black text-right text-blue-600 dark:text-teal-400">
                    ₱{netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan={3} className="py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Risk Sleeve Sub-Allocation Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950">
            <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Risk Sleeve Sub-Allocation (The Proportional 15%)
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 text-[9px] font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10">
                  <th className="py-3 pl-5">Priority Pillar</th>
                  <th className="py-3">Included Assets</th>
                  <th className="py-3 text-right">Current Value</th>
                  <th className="py-3 text-right">Current %</th>
                  <th className="py-3 text-right">Target %</th>
                  <th className="py-3 text-center pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                  <td className="py-3.5 pl-5 text-xs font-bold text-slate-800 dark:text-slate-200">1. Crypto/Gold</td>
                  <td className="py-3.5 text-xs text-slate-500 font-mono">BTC + PAXG</td>
                  <td className="py-3.5 text-xs font-mono text-right font-bold text-slate-800 dark:text-slate-200">
                    ₱{cryptoGoldValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-xs font-mono text-right font-bold">{cryptoGoldWeightOfTotal.toFixed(2)}%</td>
                  <td className="py-3.5 text-xs font-mono text-right text-slate-400">9.38%</td>
                  <td className="py-3.5 text-center pr-5">
                    <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded ${
                      cryptoGoldStatus === 'OVERWEIGHT'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
                    }`}>
                      {cryptoGoldStatus}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                  <td className="py-3.5 pl-5 text-xs font-bold text-slate-800 dark:text-slate-200">2. REITs</td>
                  <td className="py-3.5 text-xs text-slate-500 font-mono">Manulife + RCR</td>
                  <td className="py-3.5 text-xs font-mono text-right font-bold text-slate-800 dark:text-slate-200">
                    ₱{reitValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-xs font-mono text-right font-bold">{reitWeightOfTotal.toFixed(2)}%</td>
                  <td className="py-3.5 text-xs font-mono text-right text-slate-400">3.75%</td>
                  <td className="py-3.5 text-center pr-5">
                    <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded ${
                      reitStatus === 'OVERWEIGHT'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
                    }`}>
                      {reitStatus}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                  <td className="py-3.5 pl-5 text-xs font-bold text-slate-800 dark:text-slate-200">3. Stocks</td>
                  <td className="py-3.5 text-xs text-slate-500 font-mono">SCC + SPC</td>
                  <td className="py-3.5 text-xs font-mono text-right font-bold text-slate-800 dark:text-slate-200">
                    ₱{stockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-xs font-mono text-right font-bold">{stockWeightOfTotal.toFixed(2)}%</td>
                  <td className="py-3.5 text-xs font-mono text-right text-slate-400">1.87%</td>
                  <td className="py-3.5 text-center pr-5">
                    <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded ${
                      stockStatus === 'UNDERWEIGHT'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
                    }`}>
                      {stockStatus}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. SALARY DILUTION MATH AUDIT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>3. Salary Dilution Math Audit</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <ul className="space-y-3.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <li className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                <span>Current Risk Sleeve Value</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₱{totalRiskSleeve.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                <span>Target Portfolio Size <span className="text-[10px] text-slate-400">(Risk Sleeve ÷ {(targetRisk / 100).toFixed(2)})</span></span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₱{targetPortfolioSize.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                <span>Target Safe Shield <span className="text-[10px] text-slate-400">({targetSafe}% of target total)</span></span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₱{targetSafeShieldValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                <span>Current Safe Shield Value</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₱{totalSafeShield.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </li>
              <li className="flex justify-between items-center text-sm font-extrabold pt-1">
                <span className="text-rose-600 dark:text-rose-400">🚨 INSTITUTIONAL FUNDING GAP</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 underline underline-offset-4">
                  ₱{institutionalFundingGap.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl space-y-4">
            <h4 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Surplus Deployment Calculation</span>
            </h4>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {monthsToCloseGap.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Months</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              At a net surplus allocation rate of <b>₱{monthlySurplusRate.toLocaleString()}/month</b> from salary balance sheets, it will take precisely <b>{monthsToCloseGap.toFixed(1)} months</b> of consistent 100% defensive allocation to clear the ₱{institutionalFundingGap.toLocaleString(undefined, { maximumFractionDigits: 0 })} gap.
            </p>
          </div>
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

    </div>
  );
}
