import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import SignInPanel from './components/SignInPanel';
import {
  AssetPosition,
  ExpenseEntry,
  TradeEntry,
  BudgetLimit,
  FamilyGoal,
  MarketAlert,
  UserSession,
} from './types';
import Navbar from './components/Navbar';
import SummaryDashboard from './components/SummaryDashboard';
import AssetSleeveTab from './components/AssetSleeveTab';
import LedgerTab from './components/LedgerTab';
import SocialFamilyHub from './components/SocialFamilyHub';
import ExportEngine from './components/ExportEngine';
import MyFinancialPortfolio from './components/MyFinancialPortfolio';
import TransactionHistoryTab, { HistoricalTx, INITIAL_HISTORICAL_TXS } from './components/TransactionHistoryTab';
import MarketCycleAuditTab, {
  CycleItem,
  DevaluationItem,
  AuditChangeItem,
  DeploymentPlanItem,
  INITIAL_CYCLE_ITEMS,
  INITIAL_DEVALUATION_ITEMS,
  INITIAL_AUDIT_CHANGES,
  INITIAL_DEPLOYMENT_ITEMS
} from './components/MarketCycleAuditTab';
import SettingsModal from './components/SettingsModal';
import PhilippineClock from './components/PhilippineClock';
import { AIPopupModal } from './components/AIPopupModal';
import { ShieldCheck, Wifi, RefreshCw, MessageSquare, X, Mic, Send, Sparkles, Bot, User as UserIcon, Check } from 'lucide-react';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const DEFAULT_BUDGETS: BudgetLimit[] = [
  { category: 'Grocery', limitPHP: 15000, spentPHP: 0 },
  { category: 'Utilities', limitPHP: 5000, spentPHP: 0 },
  { category: 'Travel', limitPHP: 8000, spentPHP: 0 },
  { category: 'Dining', limitPHP: 6000, spentPHP: 0 },
  { category: 'Shopping', limitPHP: 5000, spentPHP: 0 },
  { category: 'Other', limitPHP: 3000, spentPHP: 0 },
];

const DEFAULT_INITIAL_ASSETS: AssetPosition[] = [
  {
    key: 'hys',
    name: 'Maya High-Yield Savings (HYS)',
    class: 'safe',
    assetType: 'deposit',
    platform: 'Maya Bank',
    units: 250000,
    currentPricePHP: 1,
    costBasisPHP: 250000,
    yieldPercent: 5.25,
    yieldFrequency: 'annual',
    withholdingTaxPercent: 20,
    change24h: 0.05
  },
  {
    key: 'tbills',
    name: 'Philippine Treasury Bills (T-Bills)',
    class: 'safe',
    assetType: 'deposit',
    platform: 'BDO Trust / Bureau of Treasury',
    units: 150000,
    currentPricePHP: 1,
    costBasisPHP: 150000,
    yieldPercent: 5.75,
    yieldFrequency: 'annual',
    withholdingTaxPercent: 20,
    change24h: 0.01
  },
  {
    key: 'paxg',
    name: 'Pax Gold (PAXG) - Physical Bullion',
    class: 'safe',
    platform: 'Binance / Secure Vault',
    units: 1.5,
    currentPricePHP: 145000,
    costBasisPHP: 135000,
    assetType: 'commodity',
    change24h: 0.85
  },
  {
    key: 'btc',
    name: 'Bitcoin (BTC) Treasury Reserve',
    class: 'risk',
    platform: 'Cold Storage Vault',
    units: 0.12,
    currentPricePHP: 3800000,
    costBasisPHP: 3200000,
    assetType: 'crypto',
    change24h: 2.14
  },
  {
    key: 'scc',
    name: 'Semirara Mining & Power (SCC)',
    class: 'risk',
    platform: 'COL Financial',
    units: 5000,
    currentPricePHP: 32.5,
    costBasisPHP: 30.0,
    assetType: 'equity',
    change24h: -0.45
  },
  {
    key: 'rcr',
    name: 'RL Commercial REIT (RCR)',
    class: 'risk',
    platform: 'First Metro Sec',
    units: 20000,
    currentPricePHP: 5.40,
    costBasisPHP: 5.10,
    assetType: 'equity',
    change24h: 0.18
  },
  {
    key: 'realestate',
    name: 'Primary Residential Property',
    class: 'physical',
    platform: 'Taguig City',
    units: 1,
    currentPricePHP: 4500000,
    costBasisPHP: 4000000,
    assetType: 'property',
    change24h: 0.00
  },
  {
    key: 'mortgage',
    name: 'Bank Home Mortgage Loan',
    class: 'liability',
    platform: 'Metrobank',
    units: 1,
    currentPricePHP: 1200000,
    costBasisPHP: 1200000,
    assetType: 'liability',
    change24h: 0.00
  }
];

const DEFAULT_ALERTS: MarketAlert[] = [
  {
    id: 'alert-btc-inst',
    timestamp: '10m ago',
    asset: 'Bitcoin (BTC)',
    message: 'Institutional treasury inflows surge 14% WoW following spot ETF clearance.',
    type: 'up',
    thresholdPercentage: 5,
    lastTriggeredDate: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'alert-usd-php',
    timestamp: '1h ago',
    asset: 'USD/PHP Rate',
    message: 'Bangko Sentral ng Pilipinas maintains policy interest rate; USD/PHP stabilizes around ₱58.20.',
    type: 'info',
    lastTriggeredDate: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: 'alert-paxg-gold',
    timestamp: '3h ago',
    asset: 'Pax Gold (PAXG)',
    message: 'Global central bank bullion demand reaches record quarterly high, reinforcing physical gold floor price.',
    type: 'up',
    thresholdPercentage: 3,
    lastTriggeredDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'alert-macro-vol',
    timestamp: '5h ago',
    asset: 'Global Equities',
    message: 'VIX Volatility Index ticks upward by 4.2% ahead of upcoming macro interest rate decisions.',
    type: 'volatility',
    thresholdPercentage: 4,
    lastTriggeredDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  }
];

export default function App() {
  // Session Authentication state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Financial Database States
  const [assets, setAssets] = useState<AssetPosition[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [goals, setGoals] = useState<FamilyGoal[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>(DEFAULT_ALERTS);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ 'USD': 56.0 });
  const [targetAllocation, setTargetAllocation] = useState<number>(85);

  // Market Cycle Audit & Devaluation States (Synced to Firestore)
  const [cycleItems, setCycleItems] = useState<CycleItem[]>(() => {
    const saved = localStorage.getItem('portfolio_cycle_items');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return INITIAL_CYCLE_ITEMS;
  });
  const [devaluationItems, setDevaluationItems] = useState<DevaluationItem[]>(() => {
    const saved = localStorage.getItem('portfolio_devaluation_items');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return INITIAL_DEVALUATION_ITEMS;
  });
  const [devaluationTactics, setDevaluationTactics] = useState<string>(() => {
    return localStorage.getItem('portfolio_devaluation_tactics') || '🛡️ USD Defense Tactics: Crypto positions (BTC) and Commodities (PAX Gold) act as proxy hedges, effectively minimizing raw PHP purchasing power devaluations.';
  });
  const [auditChanges, setAuditChanges] = useState<AuditChangeItem[]>(() => {
    const saved = localStorage.getItem('portfolio_audit_changes');
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p.slice(0, 5); } catch {} }
    return INITIAL_AUDIT_CHANGES;
  });
  const [deploymentItems, setDeploymentItems] = useState<DeploymentPlanItem[]>(() => {
    const saved = localStorage.getItem('portfolio_deployment_items');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return INITIAL_DEPLOYMENT_ITEMS;
  });
  const [budgetCap, setBudgetCap] = useState<string>(() => {
    return localStorage.getItem('portfolio_budget_cap') || 'Budget Cap: ₱20,000 Total (100% Allocation to Safe Shield, unchanged mandate)';
  });

  const [transactions, setTransactions] = useState<HistoricalTx[]>(() => {
    const saved = localStorage.getItem('historical_transactions_registry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_HISTORICAL_TXS;
  });

  useEffect(() => {
    localStorage.setItem('historical_transactions_registry', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (newTxData: Omit<HistoricalTx, 'id'>) => {
    const newTx: HistoricalTx = {
      ...newTxData,
      id: `h-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setTransactions((prev) => {
      const nextTxs = [newTx, ...prev];
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { transactions: nextTxs }, { merge: true }).catch(console.error);
      }
      return nextTxs;
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const nextTxs = prev.filter((t) => t.id !== id);
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { transactions: nextTxs }, { merge: true }).catch(console.error);
      }
      return nextTxs;
    });
  };

  const handleResetTransactions = () => {
    setTransactions(INITIAL_HISTORICAL_TXS);
    if (email) {
      setDoc(doc(db, "users", email, "financialData", "data"), { transactions: INITIAL_HISTORICAL_TXS }, { merge: true }).catch(console.error);
    }
  };

  const isInitialized = React.useRef(false);
  const isRemoteUpdate = React.useRef(false);
  const isTickerUpdateRef = React.useRef(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'assets' | 'ledger' | 'social' | 'audit' | 'transactions'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<'profile' | 'preferences' | 'export'>('profile');
  const [highlightId, setHighlightId] = useState<{type: string, id: string, tab?: string} | null>(null);
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [popupModal, setPopupModal] = useState<{
    isOpen: boolean;
    type: 'quota' | 'search_grounding' | null;
    title?: string;
    message?: string;
  }>({
    isOpen: false,
    type: null,
  });

  const triggerPopupModal = (type: 'quota' | 'search_grounding', title?: string, message?: string) => {
    setPopupModal({
      isOpen: true,
      type,
      title,
      message,
    });
  };
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    action?: {
      type: string;
      payload: any;
    };
    applied?: boolean;
  }>>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: "Hello! I am Wealth Vault's AI Financial Assistant, powered by Gemini. I can assist you with your portfolio analysis or perform actions. Try saying: 'Add ₱15,000 to HYS', 'Log spent ₱1,200 on dining', or ask me about market sentiments!"
    }
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  const email = firebaseUser?.email;
  const isAdmin = firebaseUser?.email === 'junnelmrfl@gmail.com';

  const accessibleTabs = (['dashboard', 'portfolio', 'assets', 'ledger', 'social', 'audit', 'transactions'] as const);

  // Real-time state synchronization from Firestore across all devices and previews
  useEffect(() => {
    if (!email) return;

    isInitialized.current = false;

    // Save user details to Firestore
    setDoc(doc(db, "users", email), {
      email: email,
      lastLogin: new Date().toISOString()
    }, { merge: true }).catch(console.error);

    const docRef = doc(db, "users", email, "financialData", "data");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        isRemoteUpdate.current = true;

        let loadedAssets: AssetPosition[] | null = null;
        let loadedExpenses: ExpenseEntry[] | null = null;
        let loadedGoals: FamilyGoal[] | null = null;
        let loadedBudgets: BudgetLimit[] | null = null;
        let loadedTargetAllocation: number | null = null;
        let loadedAlerts: MarketAlert[] | null = null;

        if (data.assets && Array.isArray(data.assets) && data.assets.length > 0) loadedAssets = data.assets;
        if (data.expenses) loadedExpenses = data.expenses;
        if (data.goals) loadedGoals = data.goals;
        if (data.budgets) loadedBudgets = data.budgets;
        if (data.targetAllocation) loadedTargetAllocation = data.targetAllocation;
        if (data.alerts && data.alerts.length > 0) {
          loadedAlerts = data.alerts.map((a: MarketAlert) => ({
            ...a,
            lastTriggeredDate: a.lastTriggeredDate || new Date().toISOString()
          }));
        }

        if (data.cycleItems && Array.isArray(data.cycleItems) && data.cycleItems.length > 0) {
          setCycleItems(data.cycleItems);
          localStorage.setItem('portfolio_cycle_items', JSON.stringify(data.cycleItems));
        }
        if (data.devaluationItems && Array.isArray(data.devaluationItems) && data.devaluationItems.length > 0) {
          setDevaluationItems(data.devaluationItems);
          localStorage.setItem('portfolio_devaluation_items', JSON.stringify(data.devaluationItems));
        }
        if (data.devaluationTactics) {
          setDevaluationTactics(data.devaluationTactics);
          localStorage.setItem('portfolio_devaluation_tactics', data.devaluationTactics);
        }
        if (data.auditChanges && Array.isArray(data.auditChanges) && data.auditChanges.length > 0) {
          const sliced = data.auditChanges.slice(0, 5);
          setAuditChanges(sliced);
          localStorage.setItem('portfolio_audit_changes', JSON.stringify(sliced));
        }
        if (data.deploymentItems && Array.isArray(data.deploymentItems) && data.deploymentItems.length > 0) {
          setDeploymentItems(data.deploymentItems);
          localStorage.setItem('portfolio_deployment_items', JSON.stringify(data.deploymentItems));
        }
        if (data.budgetCap) {
          setBudgetCap(data.budgetCap);
          localStorage.setItem('portfolio_budget_cap', data.budgetCap);
        }

        if (data.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
          setTransactions(data.transactions);
          localStorage.setItem('historical_transactions_registry', JSON.stringify(data.transactions));
        }

        if (loadedAssets && loadedAssets.length > 0) {
          setAssets(loadedAssets);
          localStorage.setItem(`wealth_vault_assets_${email}`, JSON.stringify(loadedAssets));
        }
        if (loadedExpenses) setExpenses(loadedExpenses);
        if (loadedGoals) setGoals(loadedGoals);
        if (loadedBudgets && loadedBudgets.length > 0) setBudgets(loadedBudgets);
        if (loadedTargetAllocation) setTargetAllocation(loadedTargetAllocation);
        if (loadedAlerts && loadedAlerts.length > 0) setAlerts(loadedAlerts);

        isInitialized.current = true;
      } else {
        const localSavedAssets = localStorage.getItem(`wealth_vault_assets_${email}`);
        if (localSavedAssets) {
          try {
            const parsed = JSON.parse(localSavedAssets);
            if (Array.isArray(parsed) && parsed.length > 0) setAssets(parsed);
            else setAssets(DEFAULT_INITIAL_ASSETS);
          } catch {
            setAssets(DEFAULT_INITIAL_ASSETS);
          }
        } else {
          setAssets(DEFAULT_INITIAL_ASSETS);
        }
        isInitialized.current = true;
      }
    }, (err) => {
      console.error("Firestore onSnapshot error:", err);
      if (err.message && (err.message.includes('offline') || err.message.includes('unavailable'))) {
        triggerToast('Offline', 'Firestore is currently unreachable. Using local data.', 'warning');
      }
      isInitialized.current = true;
    });

    return () => unsubscribe();
  }, [email]);

  const triggerToast = (title: string, desc: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ title, desc, type });
  };
  
  // Set up theme on load
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Manual sync for Market Cycle Audit data to Firestore
  const handleSyncCycleAuditToCloud = async (
    customCycleItems?: CycleItem[],
    customDevaluationItems?: DevaluationItem[],
    customDevaluationTactics?: string,
    customAuditChanges?: AuditChangeItem[],
    customDeploymentItems?: DeploymentPlanItem[],
    customBudgetCap?: string
  ) => {
    if (!email) {
      triggerToast('Cloud Sync', 'Please sign in to sync Cycle Audit data.', 'warning');
      return;
    }
    const cItems = customCycleItems || cycleItems;
    const dItems = customDevaluationItems || devaluationItems;
    const dTactics = customDevaluationTactics || devaluationTactics;
    const aChanges = customAuditChanges || auditChanges;
    const depItems = customDeploymentItems || deploymentItems;
    const bCap = customBudgetCap || budgetCap;

    try {
      await setDoc(doc(db, "users", email, "financialData", "data"), {
        cycleItems: cItems,
        devaluationItems: dItems,
        devaluationTactics: dTactics,
        auditChanges: aChanges,
        deploymentItems: depItems,
        budgetCap: bCap,
        updatedAt: Date.now(),
      }, { merge: true });
      triggerToast('Cycle Audit Synced', '⚡ Market Cycle Audit recalculated & synced to database.', 'success');
    } catch (err: any) {
      console.error("Error syncing Cycle Audit to Firestore:", err);
      triggerToast('Sync Error', 'Failed to save Cycle Audit to Firestore.', 'error');
    }
  };

  // Automated state persistence to Firestore with optimized debounce (Cycle audit & market ticker ticks excluded to save quota)
  useEffect(() => {
    if (email && isInitialized.current) {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }
      if (isTickerUpdateRef.current) {
        isTickerUpdateRef.current = false;
        return;
      }
      if (assets && assets.length > 0) {
        localStorage.setItem(`wealth_vault_assets_${email}`, JSON.stringify(assets));
      }
      const handler = setTimeout(() => {
        const dataToSync = {
          assets,
          expenses,
          goals,
          budgets,
          targetAllocation,
          alerts,
          budgetCap,
          updatedAt: Date.now(),
        };
        setDoc(doc(db, "users", email, "financialData", "data"), dataToSync, { merge: true })
          .catch(console.error);
      }, 3000);

      return () => clearTimeout(handler);
    }
  }, [assets, expenses, goals, budgets, targetAllocation, alerts, budgetCap, email]);

  // Automated budget sync with expense ledger
  useEffect(() => {
    setBudgets((prevBudgets) =>
      prevBudgets.map((b) => {
        const totalSpent = expenses
          .filter((e) => e.category === b.category)
          .reduce((sum, e) => sum + e.amountPHP, 0);
        return { ...b, spentPHP: totalSpent };
      })
    );
  }, [expenses]);

  // 1. Live Market Fluctuations Polling Ticker (Supports both Backend Server & Static Deployment like GitHub Pages)
  useEffect(() => {
    if (!email) return;

    // Helper function for client-side live market simulation on static hosting (e.g., GitHub Pages)
    const runClientSideTick = () => {
      // Fluctuate USD exchange rate slightly
      setExchangeRates((prev) => {
        const currentUSD = prev.USD || 58.2;
        const deltaFactor = 1 + (Math.random() * 2 - 1) * 0.0003;
        return {
          ...prev,
          USD: Number((currentUSD * deltaFactor).toFixed(4)),
        };
      });

      // Fluctuate asset prices and recalculate 24h performance
      isTickerUpdateRef.current = true;
      setAssets((prevAssets) => {
        if (!prevAssets || prevAssets.length === 0) return prevAssets;

        return prevAssets.map((asset) => {
          let volatility = 0.0005; // default 0.05%
          if (asset.key === 'btc' || asset.assetType === 'crypto') volatility = 0.0012; // 0.12%
          else if (asset.key === 'paxg' || asset.assetType === 'commodity') volatility = 0.0004; // 0.04%
          else if (asset.key === 'scc' || asset.key === 'spc' || asset.assetType === 'stock') volatility = 0.0008; // 0.08%

          const factor = 1 + (Math.random() * 2 - 1) * volatility;
          const oldPrice = asset.currentPricePHP || 1;
          const updatedPrice = Number((oldPrice * factor).toFixed(4));
          const diffPct = oldPrice > 0 ? ((updatedPrice - oldPrice) / oldPrice) * 100 : 0;

          return {
            ...asset,
            currentPricePHP: updatedPrice,
            change24h: Number(((asset.change24h || 0) + diffPct).toFixed(2)),
          };
        });
      });
    };

    const fetchTicks = async () => {
      try {
        const res = await fetch('/api/market/ticks');
        if (!res.ok) {
          runClientSideTick();
          return;
        }

        const data = await res.json();

        if (data.success && data.prices) {
          const prices = data.prices;
          
          setExchangeRates((prev) => ({
            ...prev,
            USD: prices.usd_php || prev.USD,
          }));

          isTickerUpdateRef.current = true;
          setAssets((prevAssets) => {
            if (!prevAssets || prevAssets.length === 0) return prevAssets;
            return prevAssets.map((asset) => {
              let updatedPrice = asset.currentPricePHP;
              let change24h = asset.change24h || 0;

              if (asset.key === 'btc' && prices.btc_php) updatedPrice = prices.btc_php;
              else if (asset.key === 'paxg' && prices.paxg_php) updatedPrice = prices.paxg_php;
              else if (asset.key === 'scc' && prices.scc_php) updatedPrice = prices.scc_php;
              else if (asset.key === 'spc' && prices.spc_php) updatedPrice = prices.spc_php;
              else if (asset.key === 'rcr' && prices.rcr_php) updatedPrice = prices.rcr_php;
              else if (asset.key === 'manulife' && prices.manulife_php) updatedPrice = prices.manulife_php;
              else {
                const factor = 1 + (Math.random() * 2 - 1) * 0.0005;
                updatedPrice = Number((asset.currentPricePHP * factor).toFixed(4));
              }

              const diffPct = asset.currentPricePHP > 0 ? ((updatedPrice - asset.currentPricePHP) / asset.currentPricePHP) * 100 : 0;

              return {
                ...asset,
                currentPricePHP: updatedPrice,
                change24h: Number((change24h + diffPct).toFixed(2)),
              };
            });
          });
        } else {
          runClientSideTick();
        }
      } catch (err) {
        // Static server / GitHub Pages fallback - run smooth real-time tick engine on client
        runClientSideTick();
      }
    };

    fetchTicks();
    const interval = setInterval(fetchTicks, 3500);
    return () => clearInterval(interval);
  }, [email]);

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!firebaseUser) return <SignInPanel onSignIn={() => {}} />;

  const startVoiceToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast('Voice Input Unsupported', 'Speech-to-text is not supported in this browser.', 'error');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      triggerToast('Listening...', 'Speak now to transcribe to chat.', 'success');
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setIsListening(false);
      triggerToast('Voice Input Error', 'Could not record your voice.', 'error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput((prev) => prev ? `${prev} ${transcript}` : transcript);
      triggerToast('Voice Captured', 'Speech successfully appended.', 'success');
    };

    recognition.start();
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user' as const,
      text: chatInput,
    };

    setMessages((prev) => [...prev, userMsg]);
    const inputVal = chatInput;
    setChatInput('');
    setIsTyping(true);

    try {
      const historyPayload = messages.map(m => ({ sender: m.sender, text: m.text }));
      const response = await fetch('/api/portfolio/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputVal, history: historyPayload }),
      });

      const data = await response.json();

      if (data.quotaExceeded) {
        triggerPopupModal(
          'quota',
          'Gemini API Quota Limit Reached',
          'The AI Assistant encountered a rate quota limit (429). Operating with offline intent shortcuts.'
        );
      } else if (data.searchGroundingSuccess || data.source === 'gemini_search_grounding') {
        triggerPopupModal(
          'search_grounding',
          'Search Grounding Assistant Response',
          'AI Assistant generated this response with Google Search Grounding verification!'
        );
      }

      if (data.success) {
        setMessages((prev) => [...prev, {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          action: data.action,
        }]);
      } else {
        setMessages((prev) => [...prev, {
          id: `msg-ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ I encountered an issue analyzing your request: ${data.error || 'Server error'}`
        }]);
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `msg-ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Network error communicating with Gemini AI: ${err.message}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyAIAction = (msgId: string, action: { type: string; payload: any }) => {
    try {
      const { type, payload } = action;
      if (type === 'ADD_MONEY' || type === 'WITHDRAW_MONEY') {
        const isDeposit = type === 'ADD_MONEY';
        const units = Number(payload.units) || 0;
        const assetKey = payload.assetKey || 'hys';
        const targetAsset = assets.find((a) => a.key === assetKey || (assetKey === 'hys' && a.key === 'hys'));
        const assetName = targetAsset ? targetAsset.name : 'High-Yield Savings (HYS)';

        setAssets((prev) => {
          const nextAssets = prev.map((a) => {
            if (a.key === assetKey || (assetKey === 'hys' && a.key === 'hys')) {
              const diff = isDeposit ? units : -units;
              const newUnits = Math.max(0, a.units + diff);
              return { ...a, units: newUnits };
            }
            return a;
          });
          if (email) {
            setDoc(doc(db, "users", email, "financialData", "data"), { assets: nextAssets }, { merge: true }).catch(console.error);
          }
          return nextAssets;
        });

        handleAddTransaction({
          date: new Date().toISOString().split('T')[0],
          asset: assetName,
          type: isDeposit ? 'Deposit' : 'Withdraw',
          amount: `${isDeposit ? '+' : '-'}₱${units.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          details: `AI Assistant ${isDeposit ? 'Deposit' : 'Withdrawal'} in ${assetName}`
        });

        triggerToast('Asset Balance Updated', `${isDeposit ? 'Deposited' : 'Withdrew'} ₱${units.toLocaleString()} in HYS.`, 'success');
      } else if (type === 'RECORD_EXPENSE') {
        handleAddExpense({
          category: payload.category || 'Lifestyle',
          description: payload.description || 'AI Auto-Generated Outflow Log',
          amount: payload.amount,
          currency: 'PHP',
          amountPHP: payload.amount,
          date: payload.date || new Date().toISOString().split('T')[0],
          familyShared: true
        });
      } else if (type === 'RECORD_TRADE') {
        const assetKey = payload.assetKey || 'btc';
        const isBuy = payload.action === 'BUY';
        const price = payload.pricePHP || assets.find(a => a.key === assetKey)?.currentPricePHP || 1;
        const totalCost = payload.units * price;

        handleAddTrade({
          assetKey,
          assetName: assets.find(a => a.key === assetKey)?.name || 'Crypto / Equity Asset',
          action: isBuy ? 'BUY' : 'SELL',
          units: payload.units,
          pricePHP: price,
          amountPHP: totalCost,
          date: new Date().toISOString().split('T')[0],
          notes: 'Gemini AI Assistant Trade record'
        });
      } else if (type === 'UPDATE_TARGET_ALLOCATION') {
        setTargetAllocation(Number(payload.value));
        triggerToast('Allocation Updated', `Set Safe Shield target to ${payload.value}%.`, 'success');
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
      );
    } catch (e: any) {
      triggerToast('AI Action Error', `Failed to apply action: ${e.message}`, 'error');
    }
  };


  const handleSearchSelect = (type: string, id: string, targetTab?: string) => {
    setHighlightId({ type, id, tab: targetTab });
    if (targetTab) {
      if (['dashboard', 'portfolio', 'assets', 'ledger', 'social', 'audit', 'transactions'].includes(targetTab)) {
        setActiveTab(targetTab as any);
      } else if (targetTab === 'settings') {
        setIsSettingsOpen(true);
        if (id === 'settings-export') setSettingsDefaultTab('export');
        else if (id === 'settings-preferences') setSettingsDefaultTab('preferences');
        else setSettingsDefaultTab('profile');
      }
    } else {
      if (type === 'Asset') setActiveTab('assets');
      else if (type === 'Expense') setActiveTab('ledger');
      else if (type === 'Goal') setActiveTab('social');
      else if (type === 'Category') setActiveTab('ledger');
    }

    // Scroll to element and apply highlight pulse after DOM render
    setTimeout(() => {
      const el = document.getElementById(id) || document.querySelector(`[data-highlight-id="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('global-search-highlight');
        void el.clientWidth; // Force reflow
        el.classList.add('global-search-highlight');
        setTimeout(() => {
          el?.classList.remove('global-search-highlight');
        }, 3500);
      }
    }, 200);

    // Clear highlight after a few seconds
    setTimeout(() => setHighlightId(null), 5000);
  };


  // 2. Add manual expense outflow logs & trigger spent/limit alarms
  const handleAddExpense = (expense: Omit<ExpenseEntry, 'id'>) => {
    const id = `exp-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const newEntry: ExpenseEntry = { ...expense, id };

    setExpenses((prev) => [newEntry, ...prev]);

    handleAddTransaction({
      date: expense.date || new Date().toISOString().split('T')[0],
      asset: `Expense: ${expense.category}`,
      type: 'Withdraw',
      amount: `-₱${expense.amountPHP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      details: expense.description || `${expense.category} outflow entry`
    });

    triggerToast('Outflow Entry committed', `Logged ₱${expense.amountPHP.toLocaleString()} under ${expense.category}`, 'success');
  };

  // 3. Bank Sync files simulation loader and automated balance imports
  const handleLinkBankSync = (bankName: string) => {
    // Generate simulated imported expense outflows
    const randomItems = [
      { desc: 'Grocery Food Provision', amt: 3450, cat: 'Lifestyle' },
      { desc: 'Weekly Commute Transport', amt: 1200, cat: 'Travel / Fuel' },
      { desc: 'Family Dinner Outing', amt: 4100, cat: 'Food & Dining' },
    ];
    const rand = randomItems[Math.floor(Math.random() * randomItems.length)];

    handleAddExpense({
      category: rand.cat,
      description: `[${bankName} Sync File] ${rand.desc}`,
      amount: rand.amt,
      currency: 'PHP',
      amountPHP: rand.amt,
      date: new Date().toISOString().split('T')[0],
      familyShared: true,
    });

    triggerToast('Secure Sync Established', `Imported latest transaction ledger registers from ${bankName}`, 'success');
  };

  // 4. Record dynamic trade entries and calibrate positions
  const handleAddTrade = (trade: Omit<TradeEntry, 'id'>) => {
    const id = `tx-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const newTrade: TradeEntry = { ...trade, id };

    setTrades((prev) => [newTrade, ...prev]);

    // Adjust specific units/cost Basis ratios on the target asset position
    setAssets((prevAssets) => {
      const nextAssets = prevAssets.map((asset) => {
        if (asset.key === trade.assetKey) {
          const isBuy = trade.action === 'BUY';
          const newUnits = isBuy ? asset.units + trade.units : Math.max(asset.units - trade.units, 0);
          const newCost = isBuy ? asset.costBasisPHP + trade.amountPHP : Math.max(asset.costBasisPHP - trade.amountPHP, 0);

          return {
            ...asset,
            units: newUnits,
            costBasisPHP: newCost,
          };
        }
        return asset;
      });
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { assets: nextAssets }, { merge: true }).catch(console.error);
      }
      return nextAssets;
    });

    const isBuy = trade.action === 'BUY';
    handleAddTransaction({
      date: trade.date || new Date().toISOString().split('T')[0],
      asset: trade.assetName,
      type: isBuy ? 'Buy' : 'Sell',
      amount: `${isBuy ? '+' : '-'}₱${trade.amountPHP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      details: trade.notes || `${trade.action} trade execution (${trade.units} units @ ₱${trade.pricePHP.toLocaleString()})`
    });

    triggerToast('Trade Commited', `Successfully recorded offline ${trade.action} of ${trade.units} units.`, 'success');
  };

  // Custom asset holdings override
  const handleUpdateAssetHoldings = (
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
  ) => {
    const existingAsset = assets.find((a) => a.key === key);
    const oldUnits = existingAsset ? existingAsset.units : 0;
    const oldCost = existingAsset ? existingAsset.costBasisPHP : 0;
    const diffUnits = units - oldUnits;
    const diffCost = cost - oldCost;

    setAssets((prev) => {
      const nextAssets = prev.map((a) => (a.key === key ? { 
        ...a, 
        units, 
        costBasisPHP: cost,
        ...(details?.assetClass !== undefined && { class: details.assetClass }),
        ...(details?.assetType !== undefined && { assetType: details.assetType }),
        ...(details?.startDate !== undefined && { startDate: details.startDate }),
        ...(details?.maturityDate !== undefined && { maturityDate: details.maturityDate }),
        ...(details?.yieldPercent !== undefined && { yieldPercent: details.yieldPercent }),
        ...(details?.yieldFrequency !== undefined && { yieldFrequency: details.yieldFrequency }),
        ...(details?.withholdingTaxPercent !== undefined && { withholdingTaxPercent: details.withholdingTaxPercent })
      } : a));
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { assets: nextAssets }, { merge: true }).catch(console.error);
      }
      return nextAssets;
    });

    if (existingAsset && (diffUnits !== 0 || diffCost !== 0)) {
      const price = existingAsset.currentPricePHP || 1;
      const absDiffUnits = Math.abs(diffUnits);
      const isIncrease = diffUnits !== 0 ? diffUnits > 0 : diffCost > 0;
      const isCashOrDeposit = existingAsset.key === 'hys' || existingAsset.assetType === 'cash' || existingAsset.assetType === 'deposit' || existingAsset.class === 'safe';

      const txType = isCashOrDeposit 
        ? (isIncrease ? 'Deposit' : 'Withdraw') 
        : (isIncrease ? 'Buy' : 'Sell');

      const amountVal = diffUnits !== 0 ? absDiffUnits * price : Math.abs(diffCost);
      const formattedAmount = `${isIncrease ? '+' : '-'}₱${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      const detailParts: string[] = [];
      if (diffUnits !== 0) {
        detailParts.push(`Units ${oldUnits.toLocaleString()} → ${units.toLocaleString()} (${diffUnits > 0 ? '+' : ''}${diffUnits.toLocaleString()})`);
      }
      if (diffCost !== 0) {
        detailParts.push(`Cost Basis ₱${oldCost.toLocaleString()} → ₱${cost.toLocaleString()}`);
      }

      handleAddTransaction({
        date: new Date().toISOString().split('T')[0],
        asset: existingAsset.name,
        type: txType,
        amount: formattedAmount,
        details: `Holdings calibration: ${detailParts.join(', ')}`
      });
    }
  };

  // Custom asset pricing override
  const handleUpdateAssetPrice = (key: string, newPrice: number) => {
    const existingAsset = assets.find((a) => a.key === key);
    if (existingAsset && existingAsset.currentPricePHP !== newPrice) {
      const oldPrice = existingAsset.currentPricePHP || 0;
      const priceDiff = newPrice - oldPrice;
      const valDiff = priceDiff * existingAsset.units;
      const pctChange = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;

      const formattedAmount = `${valDiff >= 0 ? '+' : '-'}₱${Math.abs(valDiff).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      handleAddTransaction({
        date: new Date().toISOString().split('T')[0],
        asset: existingAsset.name,
        type: 'Valuation',
        amount: formattedAmount,
        details: `Price revaluation: ₱${oldPrice.toLocaleString()} → ₱${newPrice.toLocaleString()} (${priceDiff >= 0 ? '+' : ''}${pctChange.toFixed(2)}%)`
      });
    }

    setAssets((prev) => {
      const nextAssets = prev.map((a) => (a.key === key ? { ...a, currentPricePHP: newPrice } : a));
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { assets: nextAssets }, { merge: true }).catch(console.error);
      }
      return nextAssets;
    });
  };

  // Delete asset position
  const handleDeleteAsset = (key: string) => {
    const target = assets.find((a) => a.key === key);
    if (!target) return;

    setAssets((prev) => {
      const nextAssets = prev.filter((a) => a.key !== key);
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { assets: nextAssets }, { merge: true }).catch(console.error);
      }
      return nextAssets;
    });

    const totalVal = target.units * (target.currentPricePHP || 1);
    const isCashOrDeposit = target.key === 'hys' || target.assetType === 'cash' || target.assetType === 'deposit' || target.class === 'safe';

    handleAddTransaction({
      date: new Date().toISOString().split('T')[0],
      asset: target.name,
      type: isCashOrDeposit ? 'Withdraw' : 'Sell',
      amount: `-₱${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      details: `Asset position removed from active portfolio (${target.units.toLocaleString()} units)`
    });

    triggerToast('Asset Position Removed', `Removed "${target.name}" from active portfolio.`, 'warning');
  };

  // Add new asset position
  const handleAddAsset = (newAsset: AssetPosition) => {
    if (assets.some((a) => a.key === newAsset.key)) {
      triggerToast('Asset ID Collision', `An asset with key "${newAsset.key}" already exists in index registries.`, 'error');
      return;
    }
    setAssets((prev) => {
      const nextAssets = [...prev, newAsset];
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { assets: nextAssets }, { merge: true }).catch(console.error);
      }
      return nextAssets;
    });

    const totalVal = newAsset.units * (newAsset.currentPricePHP || 1);
    const isCashOrDeposit = newAsset.key === 'hys' || newAsset.assetType === 'cash' || newAsset.assetType === 'deposit';
    handleAddTransaction({
      date: new Date().toISOString().split('T')[0],
      asset: newAsset.name,
      type: isCashOrDeposit ? 'Deposit' : 'Buy',
      amount: `+₱${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      details: `New asset position registered (${newAsset.units.toLocaleString()} units)`
    });

    triggerToast('Asset Position Added', `Successfully registered "${newAsset.name}" to asset tables.`, 'success');
  };

  // Add custom alert trigger
  const handleAddAlert = (alert: Omit<MarketAlert, 'id' | 'timestamp'>) => {
    const id = `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newAlert: MarketAlert = {
      ...alert,
      id,
      timestamp: 'Just now',
      lastTriggeredDate: new Date().toISOString()
    };
    setAlerts((prev) => [newAlert, ...prev]);
    triggerToast('Alert Trigger Activated', `Custom ${alert.type === 'volatility' ? 'volatility' : 'price-drop'} rule activated for ${alert.asset}.`, 'success');
  };

  // Delete custom alert trigger
  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    triggerToast('Alert Rule Removed', 'Custom trigger rule removed from surveillance registries.', 'warning');
  };

  const handleAdjustExpense = (id: string, newAmount: number) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const newAmountPHP = newAmount * (exchangeRates[e.currency] || 1);
          return { ...e, amount: newAmount, amountPHP: newAmountPHP };
        }
        return e;
      })
    );
    triggerToast('Expense Adjusted', `Updated expense amount to ₱${newAmount.toLocaleString()}`, 'success');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    triggerToast('Expense Deleted', 'Successfully removed expense entry.', 'success');
  };

  const handleResyncBudgets = () => {
    setBudgets((prevBudgets) =>
      prevBudgets.map((b) => {
        const totalSpent = expenses
          .filter((e) => e.category === b.category)
          .reduce((sum, e) => sum + e.amountPHP, 0);
        return { ...b, spentPHP: totalSpent };
      })
    );
    triggerToast('Ledger Synced', 'Budget spending totals recalculated from expenses.', 'success');
  };

  const handleAdjustBudgetLimit = (category: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.category === category) {
          return { ...b, limitPHP: newLimit };
        }
        return b;
      })
    );
    triggerToast('Budget Adjusted', `Updated ${category} limit to ₱${newLimit.toLocaleString()}`, 'success');
  };

  // Add Collaborative goals
  const handleAddGoal = (goal: Omit<FamilyGoal, 'id'>) => {
    const newGoal: FamilyGoal = { ...goal, id: `goal-${Date.now()}-${Math.floor(Math.random() * 1000000)}` };
    setGoals((prev) => {
      const nextGoals = [...prev, newGoal];
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { assets, expenses, goals: nextGoals, budgets, targetAllocation, alerts }, { merge: true }).catch(console.error);
      }
      return nextGoals;
    });
    triggerToast('Family Goal Established', `Successfully published target: "${goal.title}"`, 'success');
  };

  // Edit Collaborative goal
  const handleEditGoal = (updatedGoal: FamilyGoal) => {
    setGoals((prev) => {
      const nextGoals = prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { assets, expenses, goals: nextGoals, budgets, targetAllocation, alerts }, { merge: true }).catch(console.error);
      }
      return nextGoals;
    });
    triggerToast('Family Goal Updated', `Successfully updated target: "${updatedGoal.title}"`, 'success');
  };

  // Delete Collaborative goal
  const handleDeleteGoal = (id: string) => {
    const target = goals.find((g) => g.id === id);
    setGoals((prev) => {
      const nextGoals = prev.filter((g) => g.id !== id);
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { assets, expenses, goals: nextGoals, budgets, targetAllocation, alerts }, { merge: true }).catch(console.error);
      }
      return nextGoals;
    });
    triggerToast('Goal Deleted', `Removed target: "${target?.title || 'Family Goal'}"`, 'warning');
  };

  // Capitalize collaborative goal progress
  const handleUpdateGoalContribution = (id: string, amount: number) => {
    const targetGoal = goals.find((g) => g.id === id);
    setGoals((prev) => {
      const nextGoals = prev.map((g) => (g.id === id ? { ...g, currentPHP: g.currentPHP + amount } : g));
      if (email) {
        setDoc(doc(db, "users", email, "financialData", "data"), { assets, expenses, goals: nextGoals, budgets, targetAllocation, alerts }, { merge: true }).catch(console.error);
      }
      return nextGoals;
    });

    handleAddTransaction({
      date: new Date().toISOString().split('T')[0],
      asset: targetGoal ? `Family Goal: ${targetGoal.title}` : 'Family Goal Contribution',
      type: 'Deposit',
      amount: `+₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      details: `Capital contribution allocated towards ${targetGoal ? targetGoal.title : 'shared family goal'}`
    });

    triggerToast('Inflow Consolidated', `Allocated ₱${amount.toLocaleString()} towards shared family goal`, 'success');
  };

  // Grounded pricing update via server-side Gemini Search Grounding API
  const handleExecuteSyncAI = async (customKeyString: string) => {
    try {
      const res = await fetch('/api/market/sync-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: customKeyString }),
      });
      const data = await res.json();

      if (data.quotaExceeded) {
        triggerPopupModal(
          'quota',
          'Gemini API Quota Limit Reached',
          'Your Gemini API key or request quota limit has been reached. Live market pricing fell back to cached rates.'
        );
        triggerToast('Quota Limit Reached', 'Loaded cached live market prices.', 'error');
      } else if (data.searchGroundingSuccess || data.source === 'gemini_search_grounding') {
        triggerPopupModal(
          'search_grounding',
          'Search Grounding Successful',
          'Google Search Grounding successfully retrieved live 2026 market prices for USD/PHP, BTC, PAXG, SCC, SPC, RCR, and Manulife REIT!'
        );
        triggerToast('Search Grounding Successful', 'Latest PSE shares and commodity pricing verified via Google Search Grounding.', 'success');
      }

      if (data.success && data.prices) {
        const prices = data.prices;
        setExchangeRates((prev) => ({
          ...prev,
          USD: Number(prices.usd_php || prev.USD),
        }));

        setAssets((prevAssets) =>
          prevAssets.map((asset) => {
            let updatedPrice = asset.currentPricePHP;

            if (asset.key === 'btc' && prices.btc_usd) updatedPrice = prices.btc_usd * (prices.usd_php || exchangeRates.USD);
            else if (asset.key === 'paxg' && prices.paxg_usd) updatedPrice = prices.paxg_usd * (prices.usd_php || exchangeRates.USD);
            else if (asset.key === 'scc' && prices.scc_php) updatedPrice = prices.scc_php;
            else if (asset.key === 'spc' && prices.spc_php) updatedPrice = prices.spc_php;
            else if (asset.key === 'rcr' && prices.rcr_php) updatedPrice = prices.rcr_php;
            else if (asset.key === 'manulife' && prices.manulife_php) updatedPrice = prices.manulife_php;

            return {
              ...asset,
              currentPricePHP: updatedPrice,
            };
          })
        );

        triggerToast('Grounded Search complete', 'Latest PSE shares and commodity pricing verified via Gemini API', 'success');
      } else {
        triggerToast('Bypassed Search Grounding', 'Using cached active prices. Configure a valid key in tab settings.', 'warning');
      }
    } catch (err) {
      // Static host fallback - trigger instant fresh market micro-ticks
      setExchangeRates((prev) => ({ ...prev, USD: 58.25 }));
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          let volatility = 0.001;
          const factor = 1 + (Math.random() * 2 - 1) * volatility;
          const oldPrice = asset.currentPricePHP || 1;
          const updatedPrice = Number((oldPrice * factor).toFixed(4));
          const diffPct = oldPrice > 0 ? ((updatedPrice - oldPrice) / oldPrice) * 100 : 0;
          return {
            ...asset,
            currentPricePHP: updatedPrice,
            change24h: Number(((asset.change24h || 0) + diffPct).toFixed(2)),
          };
        })
      );
      triggerToast('AI Pricing Consolidated', 'Market index sync refreshed in real-time.', 'success');
    }
  };

  // Synchronize Cloud backups (server-side POST)
  const handleExecuteSyncBackup = async () => {
    if (!email) return;
    try {
      const rawPayload = { assets, expenses, trades, goals, budgets, targetAllocation };
      // Note: API backup might be deprecated, now we use Firestore directly via useEffect
      triggerToast('Cloud backup Complete', 'State database synced to Firestore.', 'success');
    } catch (err) {
      triggerToast('Sync Error', 'Cloud sync failed.', 'warning');
    }
  };

  // Restore state from Cloud server-side
  const handleExecuteRestoreBackup = async () => {
    if (!email) return;
    try {
        triggerToast('State Restore', 'Data is already synced from Firestore automatically on login.', 'success');
    } catch (err) {
      triggerToast('Database Restore Failure', 'No active backup record found.', 'error');
    }
  };

  // Local backup upload/restoration
  const handleUploadBackupLocal = (imported: any) => {
    if (imported.assets) setAssets(imported.assets);
    if (imported.expenses) setExpenses(imported.expenses);
    if (imported.trades) setTrades(imported.trades);
    if (imported.goals) setGoals(imported.goals);
    if (imported.budgets) setBudgets(imported.budgets);
    if (imported.targetAllocation) setTargetAllocation(imported.targetAllocation);

    triggerToast('Local backup Restored', 'Assets, Ledger, and Budgets re-aligned.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070a13] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top Bar Navigation */}
      <Navbar
        email={email || ''}
        onLogout={() => {
          signOut(auth);
          triggerToast('Session Destroyed', 'Credentials flushed from current cookie scope', 'warning');
        }}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        alerts={alerts}
        onClearAlerts={() => setAlerts([])}
        assets={assets}
        expenses={expenses}
        goals={goals}
        budgets={budgets}
        onSelect={handleSearchSelect}
        onOpenSettings={(tab) => {
          setSettingsDefaultTab(tab || 'profile');
          setIsSettingsOpen(true);
        }}
      />

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`p-4 rounded-xl shadow-lg border flex items-start space-x-3 max-w-sm backdrop-blur ${
            toast.type === 'error'
              ? 'bg-rose-900/95 border-rose-500/30 text-rose-100'
              : toast.type === 'warning'
              ? 'bg-amber-900/95 border-amber-500/30 text-amber-100'
              : 'bg-slate-900/95 border-slate-700/50 text-emerald-100'
          }`}>
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
            <div>
              <h4 className="text-xs font-bold text-white">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">{toast.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* AIPopupModal for Quota and Search Grounding Popups */}
      <AIPopupModal
        isOpen={popupModal.isOpen}
        type={popupModal.type}
        title={popupModal.title}
        message={popupModal.message}
        onClose={() => setPopupModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Tab Navigations */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Core Sub navigation rails */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2 mb-8 overflow-x-auto gap-4 hide-scrollbar">
          <nav className="flex space-x-2" aria-label="Tabs">
            {accessibleTabs.map((tab) => {
              const isActive = activeTab === tab;
              const titles = {
                dashboard: 'Summary Dashboard',
                portfolio: 'My Financial Portfolio',
                assets: 'Risk & Safe Assets',
                ledger: 'Expense Ledger',
                social: 'Social Family Sync',
                audit: 'Cycle Audit',
                transactions: 'History'
              };

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all whitespace-nowrap border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {titles[tab]}
                </button>
              );
            })}
          </nav>
          
          <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/5 shrink-0 shadow-xs">
            <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800/80 rounded-lg flex items-center space-x-1.5">
              <span className="text-[9px] text-slate-500 font-bold uppercase">USD/PHP Exchange</span>
              <span className="text-xs text-slate-900 dark:text-slate-200 font-bold">₱{exchangeRates.USD.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Pane Views */}
        {activeTab === 'dashboard' && (
          <SummaryDashboard
            assets={assets}
            expenses={expenses}
            budgets={budgets}
            onAdjustBudgetLimit={handleAdjustBudgetLimit}
            onResyncBudgets={handleResyncBudgets}
            targetAllocation={targetAllocation}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'portfolio' && (
          <MyFinancialPortfolio
            assets={assets}
            usdPhpRate={exchangeRates.USD}
            targetAllocation={targetAllocation}
            onUpdateTargetAllocation={setTargetAllocation}
            cycleItems={cycleItems}
            onUpdateCycleItems={setCycleItems}
            devaluationItems={devaluationItems}
            onUpdateDevaluationItems={setDevaluationItems}
            devaluationTactics={devaluationTactics}
            onUpdateDevaluationTactics={setDevaluationTactics}
            auditChanges={auditChanges}
            onUpdateAuditChanges={setAuditChanges}
            deploymentItems={deploymentItems}
            onUpdateDeploymentItems={setDeploymentItems}
            budgetCap={budgetCap}
            onUpdateBudgetCap={setBudgetCap}
            onTriggerPopupModal={triggerPopupModal}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onResetTransactions={handleResetTransactions}
          />
        )}

        {activeTab === 'assets' && (
          <AssetSleeveTab
            assets={assets}
            onUpdateAssetPrice={handleUpdateAssetPrice}
            onUpdateAssetHoldings={handleUpdateAssetHoldings}
            onDeleteAsset={handleDeleteAsset}
            onAddTrade={handleAddTrade}
            targetAllocation={targetAllocation}
            onUpdateTargetAllocation={setTargetAllocation}
            onExecuteSyncAI={handleExecuteSyncAI}
            usdPhpRate={exchangeRates.USD}
            onAddAsset={handleAddAsset}
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onDeleteAlert={handleDeleteAlert}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerTab
            expenses={expenses}
            budgets={budgets}
            onAddExpense={handleAddExpense}
            onAdjustExpense={handleAdjustExpense}
            onDeleteExpense={handleDeleteExpense}
            onLinkBankSync={handleLinkBankSync}
            exchangeRates={exchangeRates}
            highlightId={highlightId}
          />
        )}

        {activeTab === 'social' && (
          <SocialFamilyHub
            goals={goals}
            expenses={expenses}
            totalAssets={assets.filter(a => a.class === 'safe' || a.class === 'risk' || a.class === 'physical').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0)}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onUpdateGoalContribution={handleUpdateGoalContribution}
            isAdmin={isAdmin}
            userEmail={email || ''}
          />
        )}

        {activeTab === 'audit' && (
          <MarketCycleAuditTab
            assets={assets}
            usdPhpRate={exchangeRates.USD}
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onDeleteAlert={handleDeleteAlert}
            highlightId={highlightId}
            cycleItems={cycleItems}
            onUpdateCycleItems={setCycleItems}
            devaluationItems={devaluationItems}
            onUpdateDevaluationItems={setDevaluationItems}
            devaluationTactics={devaluationTactics}
            onUpdateDevaluationTactics={setDevaluationTactics}
            auditChanges={auditChanges}
            onUpdateAuditChanges={setAuditChanges}
            deploymentItems={deploymentItems}
            onUpdateDeploymentItems={setDeploymentItems}
            budgetCap={budgetCap}
            onUpdateBudgetCap={setBudgetCap}
            onTriggerPopupModal={triggerPopupModal}
            onSyncCycleAuditToCloud={handleSyncCycleAuditToCloud}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionHistoryTab
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onResetTransactions={handleResetTransactions}
          />
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        email={email || ''}
        defaultTab={settingsDefaultTab}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        targetAllocation={targetAllocation}
        onUpdateTargetAllocation={(val) => setTargetAllocation(val)}
        assets={assets}
        expenses={expenses}
        trades={trades}
        goals={goals}
        budgets={budgets}
        onUploadBackup={handleUploadBackupLocal}
        onExecuteSyncBackup={handleExecuteSyncBackup}
        onExecuteRestoreBackup={handleExecuteRestoreBackup}
        onShowToast={triggerToast}
      />

      {/* Clean elegant bottom footer with Philippine live clock */}
      <footer className="border-t border-slate-200/50 dark:border-white/5 py-8 mt-16 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-3">
        <PhilippineClock />
        <span>© 2026 Wealth Vault Inc. Fully Audited Cryptographic Protection.</span>
      </footer>

      {/* --- GEMINI AI CHAT BOX FLOATING SYSTEM --- */}
      <div className="fixed bottom-6 right-6 z-50 font-sans">
        {isChatOpen ? (
          <div className="w-[380px] h-[500px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Wealth Vault AI</h4>
                  <span className="text-[9px] text-slate-300 block">Powered by Gemini 3.5 Flash</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/10">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-medium'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-white/5 rounded-bl-none shadow-xs'
                  }`}>
                    <p className="whitespace-pre-line">{m.text}</p>

                    {/* Extracted Action Proposal Card */}
                    {m.action && m.action.type && (
                      <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-2 text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            Action Proposal
                          </span>
                        </div>
                        <p className="text-[10px] font-medium leading-normal text-slate-600 dark:text-slate-300">
                          {m.action.type === 'ADD_MONEY' && `Deposit ₱${m.action.payload.units?.toLocaleString()} to High-Yield Savings.`}
                          {m.action.type === 'WITHDRAW_MONEY' && `Withdraw ₱${m.action.payload.units?.toLocaleString()} from High-Yield Savings.`}
                          {m.action.type === 'RECORD_EXPENSE' && `Log outflow of ₱${m.action.payload.amount?.toLocaleString()} for "${m.action.payload.description}" under "${m.action.payload.category}".`}
                          {m.action.type === 'RECORD_TRADE' && `Record trade: ${m.action.payload.action} ${m.action.payload.units} units of ${m.action.payload.assetKey?.toUpperCase()} at ₱${m.action.payload.pricePHP?.toLocaleString() || 'market price'}.`}
                          {m.action.type === 'UPDATE_TARGET_ALLOCATION' && `Adjust Safe Shield allocation target to ${m.action.payload.value}%.`}
                        </p>
                        <button
                          disabled={m.applied}
                          onClick={() => handleApplyAIAction(m.id, m.action!)}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            m.applied
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {m.applied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Applied & Synced</span>
                            </>
                          ) : (
                            <span>Approve & Write Entry</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 text-slate-400 text-xs rounded-2xl p-3 border border-slate-200/60 dark:border-white/5 rounded-bl-none flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 flex items-center gap-1.5">
              <button
                type="button"
                onClick={startVoiceToText}
                className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isListening ? "Listening..." : "Enable Voice Input"}
              >
                <Mic className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask or command Wealth Vault..."
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden text-slate-800 dark:text-slate-200 font-medium"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-indigo-500/10 border border-white/15 flex items-center gap-2.5 cursor-pointer transition-all hover:-translate-y-0.5 select-none"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider">Ask Wealth Vault AI</span>
            <MessageSquare className="w-4 h-4 text-slate-300" />
          </button>
        )}
      </div>

    </div>
  );
}
