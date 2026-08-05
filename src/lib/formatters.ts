export function formatTimeAgo(isoOrTimestamp?: string, lastTriggeredDate?: string): string {
  const targetStr = lastTriggeredDate || isoOrTimestamp;
  if (!targetStr) return 'Just now';

  if (targetStr.toLowerCase() === 'just now') return 'Just now';

  let dateMs: number | null = null;

  // Try parsing as ISO string or valid date format
  const parsed = new Date(targetStr).getTime();
  if (!isNaN(parsed) && parsed > 0) {
    dateMs = parsed;
  } else {
    // Parse legacy offset formats like "10m ago", "1h ago", "3d ago"
    const match = targetStr.match(/^(\d+)\s*([smhd0-9w]+)\s*ago$/i);
    if (match) {
      const val = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const now = Date.now();
      if (unit.startsWith('s')) dateMs = now - val * 1000;
      else if (unit.startsWith('m')) dateMs = now - val * 60 * 1000;
      else if (unit.startsWith('h')) dateMs = now - val * 3600 * 1000;
      else if (unit.startsWith('d')) dateMs = now - val * 86400 * 1000;
      else if (unit.startsWith('w')) dateMs = now - val * 604800 * 1000;
    }
  }

  if (!dateMs) {
    return targetStr; // fallback if unparseable plain string
  }

  const diffMs = Date.now() - dateMs;
  if (diffMs < 0) return 'Just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 15) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const d = new Date(dateMs);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

import { AssetPosition } from '../types';

export interface AssetValuationResult {
  totalValue: number;
  principal: number;
  interestEarned: number; // Net interest after withholding tax
  grossInterestEarned: number;
  taxWithheld: number;
  withholdingTaxPercent: number;
  daysElapsed: number;
  totalTermDays: number;
  expectedMaturityValue: number;
  isYieldBased: boolean;
}

export function getAssetValuation(asset: AssetPosition): AssetValuationResult {
  const isSafeOrCash = asset.class === 'safe' || asset.assetType === 'cash' || asset.assetType === 'deposit' || asset.assetType === 'hys';
  const isPhysical = asset.class === 'physical' || asset.assetType === 'property';
  const isLiability = asset.class === 'liability' || asset.assetType === 'liability';

  // Calculate effective price per unit in PHP for market-traded risk assets
  let effectivePrice = asset.currentPricePHP;
  if (!isSafeOrCash && !isPhysical && !isLiability) {
    if (!effectivePrice || effectivePrice <= 0 || (effectivePrice === 1 && asset.costBasisPHP > 10 && asset.units <= 10)) {
      effectivePrice = asset.units > 0 ? asset.costBasisPHP / asset.units : asset.costBasisPHP;
    }
  } else {
    effectivePrice = 1;
  }

  const costBasis = (asset.costBasisPHP !== undefined && asset.costBasisPHP !== null && !isNaN(asset.costBasisPHP)) ? asset.costBasisPHP : 0;

  let baseMarketVal = 0;
  if (isPhysical || isLiability || isSafeOrCash) {
    baseMarketVal = costBasis;
  } else {
    const units = asset.units > 0 ? asset.units : 1;
    baseMarketVal = units * effectivePrice;
  }

  const principal = (isPhysical || isLiability || isSafeOrCash) ? costBasis : (costBasis > 0 ? costBasis : baseMarketVal);
  
  // Liabilities never have withholding tax applied to interest owed
  const withholdingTaxRate = isLiability ? 0 : ((asset.withholdingTaxPercent && asset.withholdingTaxPercent > 0) ? asset.withholdingTaxPercent : 0);

  if (asset.yieldPercent !== undefined && asset.yieldPercent !== null && asset.yieldPercent !== 0 && principal > 0) {
    const now = new Date();
    const startDate = asset.startDate ? new Date(asset.startDate) : null;
    const maturityDate = asset.maturityDate ? new Date(asset.maturityDate) : null;

    let annualRate = asset.yieldPercent;
    if (asset.yieldFrequency === 'monthly') annualRate = asset.yieldPercent * 12;
    else if (asset.yieldFrequency === 'semi-annual') annualRate = asset.yieldPercent * 2;
    else if (asset.yieldFrequency === 'quarterly') annualRate = asset.yieldPercent * 4;

    if (startDate || maturityDate) {
      // Start date fallback: if not provided, assume 1 year prior or start of term if maturity is set
      const start = startDate ? startDate : (maturityDate ? new Date(maturityDate.getTime() - 365 * 24 * 60 * 60 * 1000) : now);
      
      // Effective calculation end date capped at maturity date if today > maturity
      let calcEnd = now;
      if (maturityDate && now > maturityDate) {
        calcEnd = maturityDate;
      }

      const diffMs = Math.max(0, calcEnd.getTime() - start.getTime());
      const daysElapsed = Math.max(0, diffMs / (1000 * 60 * 60 * 24));

      // Simple Interest / Appreciation / Depreciation:
      // Gross interest/change = Principal * (annualRate / 100) * (daysElapsed / 365)
      const grossInterestEarned = principal * (annualRate / 100) * (daysElapsed / 365);
      const taxWithheld = grossInterestEarned > 0 ? grossInterestEarned * (withholdingTaxRate / 100) : 0;
      const netInterestEarned = grossInterestEarned - taxWithheld;
      const totalValue = Math.max(0, baseMarketVal + netInterestEarned);

      let grossExpectedMaturityVal = grossInterestEarned;
      let totalTermDays = Math.max(1, Math.round(daysElapsed));

      if (startDate && maturityDate) {
        totalTermDays = Math.max(1, Math.round((maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        grossExpectedMaturityVal = principal * (annualRate / 100) * (totalTermDays / 365);
      } else if (maturityDate) {
        totalTermDays = 365;
        grossExpectedMaturityVal = principal * (annualRate / 100);
      }

      const taxWithheldAtMaturity = grossExpectedMaturityVal > 0 ? grossExpectedMaturityVal * (withholdingTaxRate / 100) : 0;
      const expectedMaturityValue = Math.max(0, baseMarketVal + (grossExpectedMaturityVal - taxWithheldAtMaturity));

      return {
        totalValue,
        principal,
        interestEarned: netInterestEarned,
        grossInterestEarned,
        taxWithheld,
        withholdingTaxPercent: withholdingTaxRate,
        daysElapsed: Math.round(daysElapsed),
        totalTermDays,
        expectedMaturityValue,
        isYieldBased: true,
      };
    } else {
      // No dates provided, compute 1-year annual yield / appreciation / depreciation
      const grossInterestEarned = principal * (annualRate / 100);
      const taxWithheld = grossInterestEarned > 0 ? grossInterestEarned * (withholdingTaxRate / 100) : 0;
      const netInterestEarned = grossInterestEarned - taxWithheld;
      const totalValue = Math.max(0, baseMarketVal + netInterestEarned);
      return {
        totalValue,
        principal,
        interestEarned: netInterestEarned,
        grossInterestEarned,
        taxWithheld,
        withholdingTaxPercent: withholdingTaxRate,
        daysElapsed: 365,
        totalTermDays: 365,
        expectedMaturityValue: totalValue,
        isYieldBased: true,
      };
    }
  }

  // Standard market-price or unit-price valuation
  const effectiveCostBasis = asset.costBasisPHP > 0 ? asset.costBasisPHP : baseMarketVal;
  const totalValue = baseMarketVal > 0 ? baseMarketVal : effectiveCostBasis;
  const profitLoss = totalValue - effectiveCostBasis;

  return {
    totalValue,
    principal: effectiveCostBasis,
    interestEarned: profitLoss,
    grossInterestEarned: profitLoss,
    taxWithheld: 0,
    withholdingTaxPercent: 0,
    daysElapsed: 0,
    totalTermDays: 0,
    expectedMaturityValue: totalValue,
    isYieldBased: false,
  };
}

