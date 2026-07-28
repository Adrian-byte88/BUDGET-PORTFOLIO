export interface ExpenseEntry {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  amountPHP: number; // calculated at current rates
  date: string;
  familyShared: boolean;
}

export interface TradeEntry {
  id: string;
  assetKey: string;
  assetName: string;
  action: 'BUY' | 'SELL';
  units: number;
  pricePHP: number;
  amountPHP: number;
  date: string;
  notes: string;
}

export interface AssetPosition {
  key: string;
  name: string;
  platform: string;
  class: 'safe' | 'risk' | 'physical' | 'liability';
  assetType: 'cash' | 'deposit' | 'crypto' | 'commodity' | 'equity' | 'property' | 'liability';
  units: number;
  costBasisPHP: number;
  currentPricePHP: number;
  change24h?: number; // percentage fluctuation
}

export interface BudgetLimit {
  category: string;
  limitPHP: number;
  spentPHP: number;
}

export interface FamilyGoal {
  id: string;
  title: string;
  targetPHP: number;
  currentPHP: number;
  deadline: string;
}

export interface MarketAlert {
  id: string;
  timestamp: string;
  asset: string;
  message: string;
  type: 'up' | 'down' | 'info' | 'volatility';
  thresholdPercentage?: number;
  lastTriggeredDate?: string;
}

export interface UserSession {
  email: string;
  authenticated: boolean;
  needs2FA: boolean;
  verified2FA: boolean;
  biometricEnabled: boolean;
  twoFactorSecret: string;
}
