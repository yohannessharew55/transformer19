import React, { useState, useRef } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { PortfolioAccount } from '../types';
import { CreateTradePlanModal } from './CreateTradePlanModal';
import { parsePlanCsv, PlanParseResult } from '../utils/planCsvParser';
import { GeneratedPlanResult } from '../utils/planGenerator';
import {
  Layers,
  Plus,
  Check,
  Building2,
  Wallet,
  TrendingUp,
  ShieldAlert,
  Target,
  ExternalLink,
  CheckCircle2,
  Trash2,
  X,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  UploadCloud,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Download,
  CheckCircle,
  FileCheck,
  Zap
} from 'lucide-react';

export const MultiAccountPortfolioSection: React.FC = () => {
  const {
    traderName,
    importPlanFromCsv,
    setActiveNavTab,
    accounts,
    activeAccountId,
    activeAccount,
    switchAccount,
    saveAccount,
    deleteAccount,
    updateAccountPlan
  } = useCockpit();

  const activeAccId = activeAccountId;

  // Modal States
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [targetAccountForCsv, setTargetAccountForCsv] = useState<string>('new');
  const [csvText, setCsvText] = useState<string>('');
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvParsed, setCsvParsed] = useState<PlanParseResult | null>(null);
  const [autoActivateAfterCsv, setAutoActivateAfterCsv] = useState<boolean>(true);
  const [csvImportMessage, setCsvImportMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Manual Add Form State
  const [newName, setNewName] = useState('');
  const [newBroker, setNewBroker] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newCategory, setNewCategory] = useState<PortfolioAccount['category']>('prop_evaluation');
  const [newStartingBal, setNewStartingBal] = useState('100000');
  const [newDailyLoss, setNewDailyLoss] = useState('5000');
  const [newMaxLoss, setNewMaxLoss] = useState('10000');
  const [newTarget, setNewTarget] = useState('10000');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectActive = async (id: string) => {
    await switchAccount(id);
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount(id);
  };

  // Callback from CreateTradePlanModal when user chooses to Save & Activate
  const handlePlanCreatedAndActivated = async (account: PortfolioAccount, planResult: GeneratedPlanResult) => {
    saveAccount({ ...account, isActive: true });
    await updateAccountPlan(account.id, planResult);
    await switchAccount(account.id);
  };

  // Callback from CreateTradePlanModal when user chooses to Save as Inactive
  const handlePlanCreatedInactive = (account: PortfolioAccount, planResult: GeneratedPlanResult) => {
    saveAccount({
      ...account,
      isActive: false,
      csvSource: planResult.csvString,
      planQuarters: planResult.quarters,
      planObjectives: planResult.objectives,
      planBanked: planResult.targetBanked,
      planRetained: planResult.targetRetained,
      planTotal: planResult.targetTotal
    });
  };

  // Handle CSV file selection for CSV Import System
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvText(text || '');
        const parsed = parsePlanCsv(text || '');
        setCsvParsed(parsed);
      };
      reader.readAsText(file);
    }
  };

  // Apply CSV Import to Account
  const handleApplyCsvImport = async () => {
    if (!csvParsed || !csvParsed.success) {
      setCsvImportMessage({ success: false, text: 'Please upload a valid plan CSV file first.' });
      return;
    }

    const startingCap = csvParsed.seedCapital || 50;
    const targetTot = csvParsed.targetTotal || 37150;

    let targetId = targetAccountForCsv;

    if (targetAccountForCsv === 'new') {
      const newAcc: PortfolioAccount = {
        id: `acc_csv_${Date.now()}`,
        name: csvFileName?.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') || 'Imported CSV Account',
        broker: 'MetaTrader 5',
        accountNumber: `CSV-${Math.floor(Math.random() * 900000 + 100000)}`,
        category: startingCap >= 50000 ? 'prop_evaluation' : 'personal_compounding',
        currency: 'USD',
        startingBalance: startingCap,
        currentEquity: startingCap,
        highWaterMark: startingCap,
        dailyLossLimit: Math.round(startingCap * 0.4),
        maxTrailingDrawdownLimit: Math.round(startingCap * 0.5),
        profitTarget: targetTot,
        isActive: autoActivateAfterCsv,
        status: 'active',
        notes: `Imported from CSV (${csvFileName || 'plan.csv'}) with ${csvParsed.summary?.totalWeeks || 48} weeks`,
        createdAt: new Date().toISOString().split('T')[0],
        csvSource: csvText,
        planQuarters: csvParsed.quarters,
        planObjectives: csvParsed.objectives,
        planBanked: csvParsed.targetBanked,
        planRetained: csvParsed.targetRetained,
        planTotal: csvParsed.targetTotal
      };

      saveAccount(newAcc);

      if (autoActivateAfterCsv) {
        await switchAccount(newAcc.id);
        await importPlanFromCsv(csvText);
      }
    } else {
      // Updating existing account
      const existing = accounts.find(a => a.id === targetAccountForCsv);
      if (existing) {
        const updatedAcc: PortfolioAccount = {
          ...existing,
          startingBalance: startingCap,
          currentEquity: startingCap,
          profitTarget: targetTot,
          notes: `Updated with CSV plan (${csvFileName || 'plan.csv'})`,
          csvSource: csvText,
          planQuarters: csvParsed.quarters,
          planObjectives: csvParsed.objectives,
          planBanked: csvParsed.targetBanked,
          planRetained: csvParsed.targetRetained,
          planTotal: csvParsed.targetTotal
        };
        saveAccount(updatedAcc);

        if (autoActivateAfterCsv) {
          await switchAccount(targetAccountForCsv);
          await importPlanFromCsv(csvText);
        }
      }
    }

    setCsvImportMessage({
      success: true,
      text: autoActivateAfterCsv
        ? `Account successfully created and ACTIVATED in cockpit!`
        : `Account plan successfully imported!`
    });

    setTimeout(() => {
      setIsCsvImportModalOpen(false);
      setCsvText('');
      setCsvFileName(null);
      setCsvParsed(null);
      setCsvImportMessage(null);
    }, 800);
  };

  // Manual Account Add Form Submit
  const handleAddManualAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const startingNum = parseFloat(newStartingBal) || 50000;
    const newAcc: PortfolioAccount = {
      id: `acc_${Date.now()}`,
      name: newName.trim(),
      broker: newBroker.trim() || 'MetaTrader 5',
      accountNumber: newNumber.trim() || `ACC-${Math.floor(Math.random() * 900000 + 100000)}`,
      category: newCategory,
      currency: 'USD',
      startingBalance: startingNum,
      currentEquity: startingNum,
      highWaterMark: startingNum,
      dailyLossLimit: parseFloat(newDailyLoss) || 2500,
      maxTrailingDrawdownLimit: parseFloat(newMaxLoss) || 5000,
      profitTarget: parseFloat(newTarget) || 5000,
      isActive: false,
      status: 'active',
      notes: `Custom account added for Operator ${traderName}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    saveAccount(newAcc);
    setIsAddAccountModalOpen(false);
    setNewName('');
    setNewBroker('');
    setNewNumber('');
  };

  const totalCombinedEquity = accounts.reduce((acc, a) => acc + a.currentEquity, 0);
  const totalActiveTargets = accounts.reduce((acc, a) => acc + (a.profitTarget || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-indigo-300 font-bold uppercase tracking-wider flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Account: {activeAccount?.name}</span>
              </span>
              <span>· Multi-Account Compounding Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Institutional Multi-Account Portfolio Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Manage personal compounding accounts and prop firm challenges side by side. Import CSV plan schedules or generate customized 1-year trade plans with 1 click.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Create Trade Plan Button */}
            <button
              type="button"
              onClick={() => setIsCreatePlanModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0082ff] to-cyan-500 hover:from-[#0070df] hover:to-cyan-600 text-white text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all active:scale-95"
            >
              <Sparkles size={14} />
              <span>Create 1-Year Trade Plan</span>
            </button>

            {/* CSV Import Button */}
            <button
              type="button"
              onClick={() => setIsCsvImportModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 cursor-pointer border border-white/15 transition-all active:scale-95"
            >
              <FileSpreadsheet size={14} />
              <span>Import CSV Plan</span>
            </button>

            {/* Manual Add Account Button */}
            <button
              type="button"
              onClick={() => setIsAddAccountModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 cursor-pointer border border-white/15 transition-all active:scale-95"
              title="Add blank account"
            >
              <Plus size={14} />
              <span>Add Account</span>
            </button>
          </div>
        </div>

        {/* Consolidated Portfolio Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Capital Managed</span>
            <span className="text-lg sm:text-xl font-black text-white">
              ${totalCombinedEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Combined Target</span>
            <span className="text-lg sm:text-xl font-black text-emerald-400">
              ${totalActiveTargets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Accounts in Library</span>
            <span className="text-lg sm:text-xl font-black text-indigo-300">
              {accounts.length} Portfolios
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Live Account</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 truncate block">
              {activeAccount?.name}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Account Cards Grid with Activation Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {accounts.map(acc => {
          const isActivated = acc.id === activeAccId;

          return (
            <div
              key={acc.id}
              className={`rounded-3xl border p-5 sm:p-6 transition-all duration-200 relative flex flex-col justify-between ${
                isActivated
                  ? 'bg-blue-50/40 dark:bg-[#131d2e] border-emerald-500 dark:border-emerald-500/80 ring-4 ring-emerald-500/20 shadow-xl'
                  : 'bg-white dark:bg-[#121927] border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Activation Status Badge on Top */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {isActivated ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-black uppercase tracking-wider animate-fadeIn">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>CURRENTLY ACTIVATED · LIVE IN COCKPIT</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>INACTIVE · READY TO SWITCH</span>
                    </span>
                  )}

                  {accounts.length > 1 && !isActivated && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg cursor-pointer transition-colors"
                      title="Remove Account"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Account Details */}
                <div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      acc.category === 'personal_compounding'
                        ? 'bg-blue-100 dark:bg-blue-950/70 text-[#0082ff] border border-blue-200 dark:border-blue-800'
                        : acc.category === 'prop_funded'
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {acc.category.replace('_', ' ').toUpperCase()}
                  </span>

                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                    {acc.name}
                  </h4>
                  <p className="text-xs font-mono text-slate-400">
                    {acc.broker} · {acc.accountNumber}
                  </p>
                </div>

                {/* CSV Source Tag If Present */}
                {acc.csvSource && (
                  <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[10px] font-mono text-[#0082ff] dark:text-blue-300">
                    <FileCheck size={12} />
                    <span>Custom CSV Plan Calibrated</span>
                  </div>
                )}

                {/* Balance & Targets */}
                <div className="space-y-2.5 my-4 pt-3 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">Starting Capital:</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      ${acc.startingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">Target Profit Goal:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ${acc.profitTarget?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily Loss Cap:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      -${acc.dailyLossLimit.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Trailing Loss:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      -${acc.maxTrailingDrawdownLimit.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed italic mb-4">
                  "{acc.notes}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectActive(acc.id)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isActivated
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-[#0082ff] hover:bg-[#0070df] text-white shadow-sm'
                  }`}
                >
                  {isActivated ? (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Account Activated ✓</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>Activate & Switch to this Account</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetAccountForCsv(acc.id);
                    setIsCsvImportModalOpen(true);
                  }}
                  className="w-full py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-mono flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet size={12} />
                  <span>Update with CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. CSV Import System Modal */}
      {isCsvImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#0082ff]" />
                <span>CSV Plan Import System</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCsvImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Upload a Transformer19 48-week schedule plan CSV file. You can attach it to an existing account or create a brand new account from it.
            </p>

            {/* Target Account Selector */}
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Destination Account:
              </label>
              <select
                value={targetAccountForCsv}
                onChange={e => setTargetAccountForCsv(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
              >
                <option value="new">+ Create Brand New Account from this CSV</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    Update: {a.name} ({a.broker})
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop File Picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0082ff] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#162032]/50"
            >
              <UploadCloud size={28} className="mx-auto text-[#0082ff] mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {csvFileName ? csvFileName : 'Click to select or drag & drop .csv file'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Supports Transformer19 48-week schedule CSVs
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Live Parsing Preview */}
            {csvParsed && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                  csvParsed.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                {csvParsed.success ? (
                  <>
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={14} />
                      <span>Valid Plan CSV Verified ({csvParsed.summary?.totalWeeks} Weeks · {csvParsed.summary?.totalSessions} Sessions)</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      Seed: ${csvParsed.seedCapital} → Target: ${csvParsed.targetTotal?.toLocaleString()} (Retained: ${csvParsed.targetRetained?.toLocaleString()} + Bank Sweeps: ${csvParsed.targetBanked?.toLocaleString()})
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={14} />
                    <span>{csvParsed.error || 'Invalid CSV format'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Auto-Activate Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={autoActivateAfterCsv}
                onChange={e => setAutoActivateAfterCsv(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
              <span>Activate this account immediately and load plan into cockpit</span>
            </label>

            {csvImportMessage && (
              <div
                className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 ${
                  csvImportMessage.success
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {csvImportMessage.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>{csvImportMessage.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCsvImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!csvParsed || !csvParsed.success}
                onClick={handleApplyCsvImport}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs font-mono transition-all active:scale-95 disabled:opacity-50 shadow-md"
              >
                Import & Calibrate Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Manual Blank Account Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard size={16} className="text-[#0082ff]" />
                <span>Add Blank Portfolio Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddManualAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex $50K Evaluation"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Broker / Platform
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MetaTrader 5"
                    value={newBroker}
                    onChange={e => setNewBroker(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
                  >
                    <option value="prop_evaluation">Prop Evaluation</option>
                    <option value="prop_funded">Prop Funded</option>
                    <option value="personal_compounding">Personal Compounding</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Starting Capital ($)
                  </label>
                  <input
                    type="number"
                    value={newStartingBal}
                    onChange={e => setNewStartingBal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-[#0082ff]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Target Goal ($)
                  </label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-[#0082ff]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0082ff] hover:bg-[#0070df] text-white font-bold cursor-pointer transition-all active:scale-95 shadow-md"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. 1-Year Trade Plan Architect Modal */}
      <CreateTradePlanModal
        isOpen={isCreatePlanModalOpen}
        onClose={() => setIsCreatePlanModalOpen(false)}
        onPlanCreatedAndActivated={handlePlanCreatedAndActivated}
        onPlanCreatedInactive={handlePlanCreatedInactive}
      />
    </div>
  );
};
