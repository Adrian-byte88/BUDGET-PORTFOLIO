import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { AssetPosition, ExpenseEntry, TradeEntry, FamilyGoal, BudgetLimit } from '../types';
import { FileDown, Upload, Copy, FileText, CheckCircle2, ShieldCheck, RefreshCw, Sparkles, Download } from 'lucide-react';

interface ExportEngineProps {
  email: string;
  assets: AssetPosition[];
  expenses: ExpenseEntry[];
  trades: TradeEntry[];
  goals: FamilyGoal[];
  budgets: BudgetLimit[];
  onUploadBackup: (importedState: any) => void;
  onExecuteSyncBackup: () => Promise<void>;
  onExecuteRestoreBackup: () => Promise<void>;
}

export default function ExportEngine({
  email,
  assets,
  expenses,
  trades,
  goals,
  budgets,
  onUploadBackup,
  onExecuteSyncBackup,
  onExecuteRestoreBackup,
}: ExportEngineProps) {
  const [copiedBS, setCopiedBS] = useState(false);
  const [copiedPMC, setCopiedPMC] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Calculates financial balances
  const totalSafe = assets.filter((a) => a.class === 'safe').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const totalRisk = assets.filter((a) => a.class === 'risk').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const totalPhysical = assets.filter((a) => a.class === 'physical').reduce((sum, a) => sum + (a.units * a.currentPricePHP), 0);
  const grandTotalNetWorth = totalSafe + totalRisk + totalPhysical;

  const currentSafeRatio = (totalSafe + totalRisk) > 0 ? (totalSafe / (totalSafe + totalRisk)) * 100 : 0;

  // Generate portfolio_master_command.md string
  const pmcMarkdown = `# 🏛️ GLOBAL PORTFOLIO MASTER COMMAND

**System Account:** ${email}
**Audit Timestamp:** ${new Date().toISOString().split('T')[0]} | V96.2 Standard

## 1. 📊 ASSET CLASS ARCHITECTURE
* **Safe Shield Total:** ₱${totalSafe.toLocaleString(undefined, { minimumFractionDigits: 2 })}
* **Risk Sleeve Total:** ₱${totalRisk.toLocaleString(undefined, { minimumFractionDigits: 2 })}
* **Physical Asset Total:** ₱${totalPhysical.toLocaleString(undefined, { minimumFractionDigits: 2 })}
* **Comprehensive Net Worth:** ₱${grandTotalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}

## 2. 🛡️ LIQUIDITY WEIGHTS
| Class | Valuation | Current weight % | Minimum standard threshold % |
| --- | --- | --- | --- |
| **Safe Shield** | ₱${totalSafe.toLocaleString()} | **${currentSafeRatio.toFixed(2)}%** | **85%** |
| **Risk Sleeve** | ₱${totalRisk.toLocaleString()} | **${(100 - currentSafeRatio).toFixed(2)}%** | **15%** |

## 3. 📝 TRANSACTION HISTORY LOGS
${trades.length === 0 ? 'No active trade executions logged.' : trades.map(t => `* **${t.date}**: [${t.action}] ${t.units} units of ${t.assetName} @ ₱${(t.pricePHP || 0).toLocaleString()} (Notes: ${t.notes || ''})`).join('\n')}
`;

  // Generate balance_sheet_v78.md string
  const bsMarkdown = `# ⚖️ INSTITUTIONAL BALANCE SHEET

**Timestamp:** ${new Date().toUTCString()}
**Audit standard:** V78 General ledger format

## 🛡️ LIQUID & TIME DEPOSITS
${assets.filter(a => a.class === 'safe').map(a => `* **${a.name}** [${a.platform}]: ₱${((a.units || 0) * (a.currentPricePHP || 0)).toLocaleString()}`).join('\n')}

## 🚀 SPECULATIVE CRYPTO & EQUITIES
${assets.filter(a => a.class === 'risk').map(a => `* **${a.name}** [${a.platform}]: ₱${((a.units || 0) * (a.currentPricePHP || 0)).toLocaleString()}`).join('\n')}

## 🏡 FIXED PHYSICAL CONSOLIDATION
${assets.filter(a => a.class === 'physical').map(a => `* **${a.name}** [${a.platform}]: ₱${((a.units || 0) * (a.currentPricePHP || 0)).toLocaleString()}`).join('\n')}
`;

  // Generate Printable Executive Financial Summary Report
  const executiveReport = `====================================================================
               🏛️ GLOBAL PORTFOLIO EXECUTIVE SUMMARY REPORT
====================================================================
Timestamp : ${new Date().toLocaleString()}
Account   : ${email}
Security  : TWO-FACTOR CRYPTOGRAPHIC VERIFICATION ESTABLISHED
====================================================================

1. COMPREHENSIVE NET WORTH BALANCE SHEET:
--------------------------------------------------------------------
  * SAFE SHIELD (Liquid Cash & Deposits) : PHP ${totalSafe.toLocaleString(undefined, { minimumFractionDigits: 2 })}
  * RISK SLEEVE (Volatiles & Equities)   : PHP ${totalRisk.toLocaleString(undefined, { minimumFractionDigits: 2 })}
  * FIXED PHYSICAL PROPERTY ASSETS       : PHP ${totalPhysical.toLocaleString(undefined, { minimumFractionDigits: 2 })}
  ------------------------------------------------------------------
  * COMBINED COMPREHENSIVE NET WORTH      : PHP ${grandTotalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}

2. LIQUIDITY WEIGHT RATIOS:
--------------------------------------------------------------------
  * Safe Shield Weight   : ${currentSafeRatio.toFixed(2)}% (Strategy Target minimum: 85%)
  * Current Security     : ${currentSafeRatio >= 85 ? 'SECURE: Hold thresholds satisfied' : 'WARNING: Hardening protocol advised'}

3. LIVING COST EXPENSE BUDGET CONTROLS:
--------------------------------------------------------------------
${budgets.map(b => `  * ${b.category.padEnd(20)} : Spent PHP ${(b.spentPHP || 0).toLocaleString().padEnd(10)} / Limit PHP ${(b.limitPHP || 0).toLocaleString()} (${((b.spentPHP / b.limitPHP) * 100).toFixed(1)}% spent)`).join('\n')}

4. SHARED FAMILY COLLABORATIVE GOALS:
--------------------------------------------------------------------
${goals.map(g => `  * [${((g.currentPHP / g.targetPHP) * 15).toFixed(0).padEnd(15, '=')}] ${g.title.padEnd(30)} : PHP ${(g.currentPHP || 0).toLocaleString()} / PHP ${(g.targetPHP || 0).toLocaleString()} (Deadline: ${g.deadline})`).join('\n')}

====================================================================
                  SECURE VAULT AUDITING END OF REPORT
====================================================================`;

  const copyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupExportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(assets), 'Assets');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenses), 'Expenses');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trades), 'Trades');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(goals), 'Goals');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(budgets), 'Budgets');
    XLSX.writeFile(wb, `wealth_vault_backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleBackupImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const parsed = {
          assets: XLSX.utils.sheet_to_json(workbook.Sheets['Assets']),
          expenses: XLSX.utils.sheet_to_json(workbook.Sheets['Expenses']),
          trades: XLSX.utils.sheet_to_json(workbook.Sheets['Trades']),
          goals: XLSX.utils.sheet_to_json(workbook.Sheets['Goals']),
          budgets: XLSX.utils.sheet_to_json(workbook.Sheets['Budgets']),
        };
        onUploadBackup(parsed);
      } catch (err) {
        alert('Invalid backup Excel format. Parsing terminated.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCloudBackupSync = async () => {
    setSyncing(true);
    try {
      await onExecuteSyncBackup();
    } finally {
      setSyncing(false);
    }
  };

  const handleCloudBackupRestore = async () => {
    setRestoring(true);
    try {
      await onExecuteRestoreBackup();
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cloud Backups Controls */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
          <ShieldCheck className="w-5.5 h-5.5 text-blue-600 dark:text-teal-400" />
          <span>Cloud Vault Backups & Synchronization</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Ensure zero data loss from browser cache deletions. Sync your localized portfolio trades, budgets, and family shared progress to the persistent cloud database server.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleCloudBackupSync}
            disabled={syncing}
            className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xs transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Commit Cloud Backup Sync'}</span>
          </button>

          <button
            onClick={handleCloudBackupRestore}
            disabled={restoring}
            className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border border-slate-200 dark:border-white/10 shadow-xs transition-all duration-200 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{restoring ? 'Restoring...' : 'Retrieve Cloud Backup State'}</span>
          </button>

          <div className="border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/10 w-full sm:w-auto pt-4 sm:pt-0 sm:pl-4 flex flex-wrap items-center gap-4">
            <button
              onClick={handleBackupExportExcel}
              className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Data</span>
            </button>
            <label className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Data</span>
              <input type="file" accept=".xlsx" onChange={handleBackupImportExcel} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Structured report generator panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Executive Summary print view */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4.5 h-4.5 text-blue-600 dark:text-teal-400" />
                <span>Executive Monthly Summary Report</span>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">High-fidelity printable audit documentation</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => copyText(executiveReport, setCopiedReport)}
                className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-white/10 shadow-xs transition-all"
                title="Copy report text"
              >
                {copiedReport ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => downloadFile(`Executive_Financial_Report_${new Date().toISOString().split('T')[0]}.txt`, executiveReport)}
                className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-white/10 shadow-xs transition-all"
                title="Download report file"
              >
                <FileDown className="w-4 h-4 text-blue-600 dark:text-teal-400" />
              </button>
            </div>
          </div>

          <pre className="w-full flex-grow bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-lg p-5 text-[10px] sm:text-xs font-mono text-slate-600 dark:text-slate-400 overflow-x-auto custom-scrollbar whitespace-pre leading-relaxed select-text">
            {executiveReport}
          </pre>
        </div>

        {/* Local Markdown files */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-3">
              <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">portfolio_master_command.md</span>
              <button
                onClick={() => copyText(pmcMarkdown, setCopiedPMC)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest rounded-lg border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-1 transition-all"
              >
                {copiedPMC ? <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPMC ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={pmcMarkdown}
              className="w-full h-40 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-lg p-3.5 text-[10px] font-mono text-slate-600 dark:text-slate-400 focus:outline-none resize-none"
            />
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-3">
              <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">balance_sheet_v78.md</span>
              <button
                onClick={() => copyText(bsMarkdown, setCopiedBS)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest rounded-lg border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-1 transition-all"
              >
                {copiedBS ? <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBS ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={bsMarkdown}
              className="w-full h-40 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-lg p-3.5 text-[10px] font-mono text-slate-600 dark:text-slate-400 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
