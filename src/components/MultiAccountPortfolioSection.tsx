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
  Edit3,
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
  Zap,
  ArrowRight
} from 'lucide-react';
import { scrollToElement } from '../utils/scrollHelper';

export const MultiAccountPortfolioSection: React.FC = () => {
  const {
    traderName,
    importPlanFromCsv,
    setActiveNavTab,
    setWorkspaceMode,
    accounts,
    activeAccountId,
    activeAccount,
    switchAccount,
    saveAccount,
    deleteAccount,
    removeDemoAccounts,
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
  const [newCategory, setNewCategory] = useState<PortfolioAccount['category']>('personal_compounding');
  const [newStartingBal, setNewStartingBal] = useState('50');
  const [newDailyLoss, setNewDailyLoss] = useState('20');
  const [newMaxLoss, setNewMaxLoss] = useState('25');
  const [newTarget, setNewTarget] = useState('37150');

  // Edit Account State & Form Handlers
  const [editingAccount, setEditingAccount] = useState<PortfolioAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editBroker, setEditBroker] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editCategory, setEditCategory] = useState<PortfolioAccount['category']>('personal_compounding');
  const [editStartingBal, setEditStartingBal] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editDailyLoss, setEditDailyLoss] = useState('');
  const [editTrailingLoss, setEditTrailingLoss] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editHeroSubtitle, setEditHeroSubtitle] = useState('');

  const handleStartEdit = (account: PortfolioAccount) => {
    setEditingAccount(account);
    setEditName(account.name);
    setEditBroker(account.broker || '');
    setEditAccountNumber(account.accountNumber || '');
    setEditCategory(account.category || 'personal_compounding');
    setEditStartingBal(String(account.startingBalance));
    setEditTarget(String(account.profitTarget || ''));
    setEditDailyLoss(String(account.dailyLossLimit || ''));
    setEditTrailingLoss(String(account.maxTrailingDrawdownLimit || ''));
    setEditNotes(account.notes || '');
    setEditHeroSubtitle(account.heroSubtitle || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    const sBal = parseFloat(editStartingBal) || editingAccount.startingBalance;
    const pTarget = parseFloat(editTarget) || editingAccount.profitTarget || Math.round(sBal * 743);
    const dLoss = parseFloat(editDailyLoss) || editingAccount.dailyLossLimit || Math.round(sBal * 0.4);
    const tLoss = parseFloat(editTrailingLoss) || editingAccount.maxTrailingDrawdownLimit || Math.round(sBal * 0.5);

    const updated: PortfolioAccount = {
      ...editingAccount,
      name: editName.trim() || editingAccount.name,
      broker: editBroker.trim() || editingAccount.broker,
      accountNumber: editAccountNumber.trim() || editingAccount.accountNumber,
      category: editCategory,
      startingBalance: sBal,
      currentEquity: editingAccount.currentEquity === editingAccount.startingBalance ? sBal : editingAccount.currentEquity,
      highWaterMark: Math.max(editingAccount.highWaterMark, sBal),
      profitTarget: pTarget,
      dailyLossLimit: dLoss,
      maxTrailingDrawdownLimit: tLoss,
      notes: editNotes.trim(),
      heroSubtitle: editHeroSubtitle.trim() || editingAccount.heroSubtitle
    };

    saveAccount(updated);
    setEditingAccount(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectActive = async (id: string) => {
    await switchAccount(id);
  };

  const handleShowInHierarchy = async (account: PortfolioAccount) => {
    if (!account.isActive) {
      await switchAccount(account.id);
    }
    setWorkspaceMode('hierarchy');
    setActiveNavTab('cockpit');
    setTimeout(() => {
      const el = document.getElementById('quarter-matrix-section') || document.getElementById('hierarchy-workspace');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        scrollToElement('quarter-matrix-section');
      }
    }, 80);
  };

  const handleDirectToManualPlanner = async (account: PortfolioAccount) => {
    if (!account.isActive) {
      await switchAccount(account.id);
    }
    setWorkspaceMode('hierarchy');
    setActiveNavTab('planVsActual');
    setTimeout(() => {
      scrollToElement('manual-plan-editor-section');
    }, 60);
  };

  const handleDeleteAccount = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    const confirmMsg = acc?.isActive && accounts.length > 1
      ? `"${acc?.name}" is currently active in the cockpit. Delete it and switch to another account?`
      : `Are you sure you want to delete "${acc?.name || 'this account'}"?`;
    if (window.confirm(confirmMsg)) {
      deleteAccount(id);
    }
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
        category: startingCap >= 1000 ? 'personal_harvest' : startingCap >= 200 ? 'personal_accelerator' : 'personal_compounding',
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

  // Realistic Planned Money View Mode: 'active' (Primary single execution desk) | 'combined' (Full portfolio library sum)
  const [summaryViewMode, setSummaryViewMode] = useState<'active' | 'combined'>('active');

  const activeSeed = activeAccount?.startingBalance || 50;
  const activeTarget = activeAccount?.profitTarget || activeAccount?.planTotal || 37150;
  const activePlannedNetProfit = Math.max(0, activeTarget - activeSeed);
  const activeBankedSweeps = activeAccount?.planBanked || 7150;
  const activeRetainedEquity = activeAccount?.planRetained || Math.max(0, activeTarget - activeBankedSweeps);

  const totalCombinedSeed = accounts.reduce((acc, a) => acc + (a.startingBalance || 0), 0);
  const totalCombinedPlannedProfit = accounts.reduce((acc, a) => acc + Math.max(0, (a.profitTarget || a.planTotal || 0) - (a.startingBalance || 0)), 0);
  const totalActiveTargets = accounts.reduce((acc, a) => acc + (a.profitTarget || a.planTotal || 0), 0);

  return (
    <div id="portfolio-section" className="space-y-6 animate-fadeIn scroll-mt-20">
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
              Manage personal compounding accounts and growth desks side by side. Import CSV plan schedules or generate customized 1-year trade plans with 1 click.
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

            {/* Remove Demo Desks Button if any default demo accounts exist */}
            {accounts.some(a => a.id === 'acc_personal_500' || a.id === 'acc_personal_1000' || a.name.toLowerCase().includes('challenge') || a.name.toLowerCase().includes('express')) && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Remove all demo/placeholder accounts?')) {
                    removeDemoAccounts();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold font-mono flex items-center justify-center gap-1.5 cursor-pointer border border-rose-500/30 transition-all active:scale-95"
                title="Remove default demo and placeholder accounts"
              >
                <Trash2 size={13} />
                <span>Remove Demo Desks</span>
              </button>
            )}
          </div>
        </div>

        {/* Consolidated Portfolio Bar with Mode Toggle */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-3 font-mono">
          {/* View Mode Segmented Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400">Execution Plan Horizon:</span>
              <span className="font-bold text-white">
                {summaryViewMode === 'active' ? activeAccount?.name : `All Desks Combined (${accounts.length} Portfolios)`}
              </span>
            </div>

            <div className="inline-flex p-0.5 rounded-xl bg-black/40 border border-white/10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSummaryViewMode('active')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  summaryViewMode === 'active'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="View realistic single active trading account target"
              >
                Active Desk Goal (+${activePlannedNetProfit.toLocaleString()} Net)
              </button>
              <button
                type="button"
                onClick={() => setSummaryViewMode('combined')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  summaryViewMode === 'combined'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="View combined sum across all accounts in library"
              >
                Portfolio Library Sum ({accounts.length} Desks)
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          {summaryViewMode === 'active' ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Seed Capital</span>
                <span className="text-lg sm:text-xl font-black text-white">
                  ${activeSeed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Starting live balance</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 block uppercase font-bold">Real Profit to Achieve</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400">
                  +${activePlannedNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-emerald-300/80 block mt-0.5">Net planned profit gain</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Planned Bank Sweeps</span>
                <span className="text-lg sm:text-xl font-black text-cyan-300">
                  ${activeBankedSweeps.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">20% offline vault sweeps</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Retained Terminal Equity</span>
                <span className="text-lg sm:text-xl font-black text-indigo-300">
                  ${activeRetainedEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Working trading margin</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Target Milestone</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400">
                  ${activeTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Retained + Banked Sweeps</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Combined Seed Capital</span>
                <span className="text-lg sm:text-xl font-black text-white">
                  ${totalCombinedSeed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Sum of all starting seeds</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 block uppercase font-bold">Real Net Profit to Achieve</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400">
                  +${totalCombinedPlannedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-emerald-300/80 block mt-0.5">Cumulative net profit target</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Combined Target Milestones</span>
                <span className="text-lg sm:text-xl font-black text-cyan-300">
                  ${totalActiveTargets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Sum of all target balances</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Accounts in Library</span>
                <span className="text-lg sm:text-xl font-black text-indigo-300">
                  {accounts.length} Portfolios
                </span>
                <span className="text-[9px] text-emerald-400 block mt-0.5 truncate">Active: {activeAccount?.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Account Cards Grid with Activation Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {accounts.map(acc => {
          const isActivated = acc.id === activeAccId;

          return (
            <div
              key={acc.id}
              className={`group rounded-3xl border p-5 sm:p-6 transition-all duration-200 relative flex flex-col justify-between ${
                isActivated
                  ? 'bg-blue-50/40 dark:bg-[#131d2e] border-emerald-500 dark:border-emerald-500/80 ring-4 ring-emerald-500/20 shadow-xl'
                  : 'bg-white dark:bg-[#121927] border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Activation Status Badge on Top */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {isActivated ? (
                    <div
                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400/40 dark:border-emerald-600/40 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold shadow-2xs select-none"
                      title="Active Account"
                    >
                      {/* Green On Switch */}
                      <span className="w-7 h-4 bg-emerald-500 rounded-full flex items-center justify-end p-0.5 shadow-inner">
                        <span className="w-3 h-3 bg-white rounded-full shadow-xs"></span>
                      </span>
                      <span>Active</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectActive(acc.id)}
                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 text-xs font-mono font-medium cursor-pointer transition-all active:scale-95 shadow-2xs group/btn"
                      title="Click to activate and switch to this account"
                    >
                      {/* Off Switch */}
                      <span className="w-7 h-4 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-start p-0.5 transition-colors group-hover/btn:bg-slate-400 shadow-inner">
                        <span className="w-3 h-3 bg-white rounded-full shadow-xs"></span>
                      </span>
                      <span>Inactive</span>
                    </button>
                  )}

                  {/* Actions (Only visible on hover until then invisible) */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={() => handleShowInHierarchy(acc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border border-[#0082ff]/30 bg-blue-50/90 dark:bg-blue-950/70 text-[#0082ff] dark:text-blue-300 hover:text-white hover:bg-[#0082ff] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                      title="Show in Hierarchy Copilot"
                    >
                      <Layers size={11} />
                      <span>Copilot</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectToManualPlanner(acc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border border-indigo-200 dark:border-indigo-800 bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white hover:border-indigo-500 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                      title="Direct to Manual Planner to edit Foundation, targets, and lot sizes"
                    >
                      <Edit3 size={11} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(acc)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162032] text-slate-700 dark:text-slate-300 hover:text-[#0082ff] transition-all cursor-pointer"
                      title="Edit title & account login credentials"
                    >
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg cursor-pointer transition-colors"
                      title="Delete this account"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Account Details */}
                <div
                  onClick={() => handleStartEdit(acc)}
                  className="group cursor-pointer"
                  title="Click to edit account title and parameters"
                >
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      acc.category === 'personal_compounding'
                        ? 'bg-blue-100 dark:bg-blue-950/70 text-[#0082ff] border border-blue-200 dark:border-blue-800'
                        : acc.category === 'personal_accelerator'
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    {acc.category.replace('_', ' ').toUpperCase()}
                  </span>

                  <div className="flex items-center gap-2 mt-1.5">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#0082ff] transition-colors">
                      {acc.name}
                    </h4>
                    <Edit3 size={12} className="opacity-0 group-hover:opacity-100 text-[#0082ff] transition-opacity shrink-0" />
                  </div>
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

                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500">Planned Net Gain:</span>
                    <span className="font-black text-emerald-500 dark:text-emerald-400">
                      +${Math.max(0, (acc.profitTarget || 0) - acc.startingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

                {acc.notes && acc.notes.trim() && (
                  <p className="text-[11px] text-slate-500 leading-relaxed italic mb-4">
                    "{acc.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleShowInHierarchy(acc)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-98 shadow-md ${
                    isActivated
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#0082ff] hover:bg-[#0070df] text-white'
                  }`}
                  title={isActivated ? "Account is Active! Click to show and execute directly in Hierarchy Copilot" : "Activate account and launch into Hierarchy Copilot"}
                >
                  <Layers size={15} className="text-white" />
                  <span>Show in Hierarchy Copilot →</span>
                </button>

                {/* Direct to Manual Planner on Foundation Button */}
                <button
                  type="button"
                  onClick={() => handleDirectToManualPlanner(acc)}
                  className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold font-mono text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-98 shadow-2xs"
                  title="Directs to Manual Planner to edit Foundation, daily targets, and lot ladders"
                >
                  <Edit3 size={13} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Edit Foundation in Manual Planner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetAccountForCsv(acc.id);
                    setIsCsvImportModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet size={13} />
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
                    <option value="personal_compounding">Personal Compounding (Seed)</option>
                    <option value="personal_accelerator">Personal Accelerator (Growth)</option>
                    <option value="personal_harvest">Personal Harvest (Master Portfolio)</option>
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

      {/* 4. Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-xl my-8 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-[#0082ff] flex items-center justify-center">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit Account & Parameters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update title, broker details, targets, risk limits, and content notes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Direct to Manual Planner Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/90 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Customize 48-Week Schedule & Foundation</span>
                  </div>
                  <div className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                    Directs to the Manual Plan Editor to edit Q1: Foundation lot ladder, daily targets, and compounding.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const accToEdit = editingAccount;
                    setEditingAccount(null);
                    handleDirectToManualPlanner(accToEdit);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Open Manual Planner</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Account Title / Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="e.g. Personal $50 Seed Compounding"
                  className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-semibold outline-none focus:border-[#0082ff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Broker / Platform
                  </label>
                  <input
                    type="text"
                    value={editBroker}
                    onChange={e => setEditBroker(e.target.value)}
                    placeholder="e.g. IC Markets (MetaTrader 5)"
                    className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Account / Login ID
                  </label>
                  <input
                    type="text"
                    value={editAccountNumber}
                    onChange={e => setEditAccountNumber(e.target.value)}
                    placeholder="e.g. MT5-948201"
                    className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono outline-none focus:border-[#0082ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Portfolio Category
                </label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
                >
                  <option value="personal_compounding">Personal Compounding (Seed)</option>
                  <option value="personal_accelerator">Personal Accelerator (Growth)</option>
                  <option value="personal_harvest">Personal Harvest (Master Portfolio)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Starting Capital ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editStartingBal}
                    onChange={e => setEditStartingBal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-[#0082ff]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Target Profit Goal ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editTarget}
                    onChange={e => setEditTarget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-[#0082ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Daily Loss Cap ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editDailyLoss}
                    onChange={e => setEditDailyLoss(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-rose-600 dark:text-rose-400 font-mono font-bold outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Max Trailing Loss ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editTrailingLoss}
                    onChange={e => setEditTrailingLoss(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-amber-600 dark:text-amber-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Content / Strategy Roadmap Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="e.g. 48-Week Master Execution Roadmap ($50 -> $30K working + $7,150 banked sweeps)"
                  className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-sans outline-none focus:border-[#0082ff] resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Hero Dossier Subtitle (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editHeroSubtitle}
                  onChange={e => setEditHeroSubtitle(e.target.value)}
                  placeholder="Custom mission statement displayed at the top of the cockpit..."
                  className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-sans outline-none focus:border-[#0082ff] resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${editingAccount.name}"?`)) {
                      deleteAccount(editingAccount.id);
                      setEditingAccount(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Delete Account</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0082ff] hover:bg-[#0070df] text-white font-bold cursor-pointer transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                  >
                    <Check size={15} />
                    <span>Save Changes</span>
                  </button>
                </div>
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
