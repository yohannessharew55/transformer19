import React, { useState, useMemo } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { generateTradePlan, GeneratedPlanResult, calculateLotSize } from '../utils/planGenerator';
import { parsePlanCsv } from '../utils/planCsvParser';
import { PortfolioAccount } from '../types';
import {
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
  Download,
  Check,
  ArrowRight,
  Zap,
  Target,
  RefreshCw,
  Building2,
  Lock,
  Sliders,
  ChevronRight,
  Scale,
  Brain,
  FileSpreadsheet,
  UploadCloud,
  FileCheck2,
  Play
} from 'lucide-react';

export const PlannerSection: React.FC = () => {
  const {
    activeAccount,
    accounts,
    switchAccount,
    saveAccount,
    updateAccountPlan,
    importPlanFromCsv,
    setActiveNavTab,
    traderName
  } = useCockpit();

  // Generator Parameters State
  const [planName, setPlanName] = useState(() => `${activeAccount?.name || 'Primary'} 1-Year Master Plan`);
  const [initialCapital, setInitialCapital] = useState<number>(() => activeAccount?.startingBalance || 50);
  const [annualTarget, setAnnualTarget] = useState<number>(() => activeAccount?.profitTarget || 37150);
  const [dailyGoalPips, setDailyGoalPips] = useState<number>(20);
  const [harvestPercent, setHarvestPercent] = useState<number>(20);
  const [instrument, setInstrument] = useState<string>('Gold XAU/USD');
  const [broker, setBroker] = useState<string>(() => activeAccount?.broker || 'MetaTrader 5');
  const [selectedPreviewQuarter, setSelectedPreviewQuarter] = useState<number>(0);
  const [activePlanTab, setActivePlanTab] = useState<'overview' | 'months' | 'weeks' | 'comparison' | 'monteCarlo'>('overview');

  // Sensitivity Sliders State
  const [simWinRate, setSimWinRate] = useState<number>(75);
  const [simRiskReward, setSimRiskReward] = useState<number>(2.0);

  // Deployment feedback
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  // Re-generate plan whenever parameters change
  const planResult: GeneratedPlanResult = useMemo(() => {
    return generateTradePlan({
      planName,
      initialCapital,
      annualTarget,
      dailyGoalPips,
      harvestSweepPercent: harvestPercent,
      instrument
    });
  }, [planName, initialCapital, annualTarget, dailyGoalPips, harvestPercent, instrument]);

  // Handle Deploy Plan to Active Account
  const handleDeployToActiveAccount = async () => {
    if (!activeAccount) return;
    await updateAccountPlan(activeAccount.id, planResult);
    setDeploySuccess(`Plan successfully deployed to ${activeAccount.name}! Cockpit is now live.`);
    setTimeout(() => setDeploySuccess(null), 4000);
  };

  // Handle Save as New Planned Account
  const handleSaveAsNewAccount = async (activateImmediately: boolean) => {
    const newAcc: PortfolioAccount = {
      id: `acc_plan_${Date.now()}`,
      name: planName.trim() || 'Custom Trade Plan',
      broker,
      accountNumber: `PLN-${Math.floor(Math.random() * 900000 + 100000)}`,
      category: initialCapital >= 50000 ? 'prop_evaluation' : 'personal_compounding',
      currency: 'USD',
      startingBalance: planResult.seedCapital,
      currentEquity: planResult.seedCapital,
      highWaterMark: planResult.seedCapital,
      dailyLossLimit: Math.round(planResult.seedCapital * 0.05) || 20,
      maxTrailingDrawdownLimit: Math.round(planResult.seedCapital * 0.10) || 25,
      profitTarget: planResult.targetTotal,
      isActive: activateImmediately,
      status: 'active',
      notes: `1-Year Compounding Plan ($${planResult.seedCapital.toLocaleString()} -> $${planResult.targetTotal.toLocaleString()})`,
      createdAt: new Date().toISOString().split('T')[0],
      csvSource: planResult.csvString,
      planQuarters: planResult.quarters,
      planObjectives: planResult.objectives,
      planBanked: planResult.targetBanked,
      planRetained: planResult.targetRetained,
      planTotal: planResult.targetTotal
    };

    saveAccount(newAcc);

    if (activateImmediately) {
      await switchAccount(newAcc.id);
      await importPlanFromCsv(planResult.csvString);
      setDeploySuccess(`New account "${newAcc.name}" created and ACTIVATED in cockpit!`);
    } else {
      setDeploySuccess(`Plan "${newAcc.name}" saved to Portfolio library.`);
    }

    setTimeout(() => setDeploySuccess(null), 4000);
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const blob = new Blob([planResult.csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${planName.toLowerCase().replace(/\s+/g, '_')}_48week_plan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 12 Months Projection Breakdown
  const monthData = useMemo(() => {
    const list: Array<{
      monthNum: number;
      quarterNum: number;
      quarterName: string;
      startBal: number;
      gain: number;
      harvest: number;
      endBal: number;
      cumulativeBanked: number;
      lotSize: string;
    }> = [];

    let runningBal = planResult.seedCapital;
    let runningHarvest = 0;
    let monthIdx = 1;

    planResult.quarters.forEach((q, qIndex) => {
      q.months.forEach((m) => {
        let mGain = 0;
        let mHarvest = 0;
        let mLot = '0.01 lot';

        m.weeks.forEach(w => {
          mLot = w.lot;
          const wNet = parseFloat(w.net.replace(/[^0-9.-]/g, '')) || 0;
          mGain += wNet;
          if (w.isExtract) {
            const sweep = mGain * (harvestPercent / 100);
            mHarvest += sweep;
          }
        });

        const startBal = runningBal;
        const endBal = Math.max(0, startBal + mGain - mHarvest);
        runningHarvest += mHarvest;
        runningBal = endBal;

        list.push({
          monthNum: monthIdx++,
          quarterNum: qIndex + 1,
          quarterName: q.name.split(':')[0],
          startBal,
          gain: mGain,
          harvest: mHarvest,
          endBal,
          cumulativeBanked: runningHarvest,
          lotSize: mLot
        });
      });
    });

    return list;
  }, [planResult, harvestPercent]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Header Banner with Account Context */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-indigo-500/30 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles size={12} className="text-indigo-400" />
                <span>1-YEAR TRADE PLANNER & COMPASS</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Account: {activeAccount?.name}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Institutional Trade Planner & Milestones Architect
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Design, simulate, and calibrate 48-week compounding roadmaps with dynamic micro-lot escalation, 20-pip stops, and 20% offline harvest sweeps across personal and funded accounts.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleDeployToActiveAccount}
              className="py-2.5 px-4 rounded-xl bg-[#0082ff] hover:bg-[#0070df] text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Zap size={14} />
              <span>Deploy to Live Cockpit</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Deploy feedback alert */}
        {deploySuccess && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>{deploySuccess}</span>
          </div>
        )}

        {/* Account Quick Switcher Strip */}
        <div className="mt-6 pt-5 border-t border-indigo-500/20 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase shrink-0 mr-1">Switch Account Plan:</span>
          {accounts.map(acc => {
            const isSelected = acc.id === activeAccount?.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  switchAccount(acc.id);
                  setPlanName(`${acc.name} 1-Year Master Plan`);
                  setInitialCapital(acc.startingBalance);
                  setAnnualTarget(acc.profitTarget || acc.startingBalance * 1.5);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-md scale-105'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                <span>{acc.name}</span>
                <span className="text-[10px] opacity-75">(${acc.startingBalance.toLocaleString()})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Plan Parameter Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#0082ff]" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Plan Architect & Compounding Parameters
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Rule 01 Devotion & 20-Pip Stop Integrated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Plan Name */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Plan Name & Label</span>
            </label>
            <input
              type="text"
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0082ff]"
              placeholder="e.g. 2026 Micro Compounding"
            />
          </div>

          {/* Instrument */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Primary Instrument
            </label>
            <select
              value={instrument}
              onChange={e => setInstrument(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0082ff]"
            >
              <option value="Gold XAU/USD">Gold XAU/USD</option>
              <option value="EUR/USD">EUR/USD</option>
              <option value="GBP/USD">GBP/USD</option>
              <option value="NAS100 / US Tech">NAS100 / US Tech</option>
              <option value="US30 / Dow">US30 / Dow</option>
              <option value="Bitcoin BTC/USD">Bitcoin BTC/USD</option>
            </select>
          </div>

          {/* Broker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Execution Platform
            </label>
            <select
              value={broker}
              onChange={e => setBroker(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0082ff]"
            >
              <option value="IC Markets (MetaTrader 5)">IC Markets (MT5)</option>
              <option value="FTMO (MetaTrader 5)">FTMO (MT5)</option>
              <option value="Topstep (Tradovate)">Topstep (Tradovate)</option>
              <option value="cTrader Standard">cTrader Standard</option>
              <option value="TradeLocker Live">TradeLocker Live</option>
            </select>
          </div>

          {/* Initial Seed Capital */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Starting Seed Capital ($)
              </label>
              <span className="font-mono text-xs font-extrabold text-[#0082ff]">
                ${initialCapital.toLocaleString()}
              </span>
            </div>
            <input
              type="number"
              min={10}
              max={1000000}
              step={10}
              value={initialCapital}
              onChange={e => setInitialCapital(Math.max(10, parseFloat(e.target.value) || 50))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0082ff]"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[50, 100, 500, 1000, 10000, 50000, 100000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setInitialCapital(val)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    initialCapital === val
                      ? 'bg-[#0082ff] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  ${val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Annual Target Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                1-Year Total Goal ($)
              </label>
              <span className="font-mono text-xs font-extrabold text-emerald-500">
                ${annualTarget.toLocaleString()}
              </span>
            </div>
            <input
              type="number"
              min={initialCapital * 1.2}
              max={5000000}
              step={100}
              value={annualTarget}
              onChange={e => setAnnualTarget(Math.max(initialCapital * 1.2, parseFloat(e.target.value) || 37150))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0082ff]"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[37150, 50000, 100000, 150000, 250000, 500000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAnnualTarget(val)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    annualTarget === val
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  ${val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal Pips Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Daily Goal Pips
              </label>
              <span className="font-mono text-xs font-extrabold text-[#0082ff]">
                {dailyGoalPips} pips/day
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={dailyGoalPips}
              onChange={e => setDailyGoalPips(parseInt(e.target.value))}
              className="w-full accent-[#0082ff] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10 pips</span>
              <span>20 pips (Default)</span>
              <span>50 pips</span>
            </div>
          </div>

          {/* Monthly Offline Harvest Sweep Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Monthly Offline Vault Sweep
              </label>
              <span className="font-mono text-xs font-extrabold text-amber-500">
                {harvestPercent}% Swept
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={harvestPercent}
              onChange={e => setHarvestPercent(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Full Reinvest)</span>
              <span>20% (Recommended)</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. High-Impact Plan KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Seed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Seed Capital</div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            ${planResult.seedCapital.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Untouched Base</div>
        </div>

        {/* Retained Working Equity */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121927] border border-blue-500/20 dark:border-blue-500/30 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-blue-500 font-bold">Working Equity</div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-1">
            ${planResult.targetRetained.toLocaleString()}
          </div>
          <div className="text-[10px] text-blue-500/80 mt-0.5">Retained in Broker</div>
        </div>

        {/* Banked Cash Vault */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121927] border border-amber-500/20 dark:border-amber-500/30 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-amber-500 font-bold">Offline Vaulted</div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1">
            ${planResult.targetBanked.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">Risk-Free Bank Sweeps</div>
        </div>

        {/* Total Target Value */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121927] border border-emerald-500/20 dark:border-emerald-500/30 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-emerald-500 font-bold">Total Year End</div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ${planResult.targetTotal.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Combined Value</div>
        </div>

        {/* Growth Multiple */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121927] border border-indigo-500/20 dark:border-indigo-500/30 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-indigo-500 font-bold">Growth Multiple</div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {(planResult.targetTotal / planResult.seedCapital).toFixed(1)}x
          </div>
          <div className="text-[10px] text-indigo-500/80 mt-0.5">48-Week Compound</div>
        </div>

        {/* Lot Size Escalation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Lot Ladder</div>
          <div className="text-xs sm:text-sm font-extrabold font-mono text-slate-900 dark:text-white mt-1.5 truncate">
            {planResult.lotLadder}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dynamic Risk Guard</div>
        </div>
      </div>

      {/* 4. Plan Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview' as const, label: 'Executive Summary', icon: Layers },
          { id: 'months' as const, label: '12-Month Milestones', icon: Calendar },
          { id: 'weeks' as const, label: '48-Week Schedule Matrix', icon: Target },
          { id: 'comparison' as const, label: 'Portfolio Plans Comparison', icon: Building2 },
          { id: 'monteCarlo' as const, label: 'Sensitivity & What-If', icon: Brain }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activePlanTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePlanTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Executive Summary */}
      {activePlanTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left 2 Cols: 4 Quarters Architecture */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers size={16} className="text-[#0082ff]" />
              <span>4-Quarter Institutional Execution Blueprint</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {planResult.quarters.map((q, idx) => {
                const qGain = q.months.reduce((acc, m) => {
                  return acc + m.weeks.reduce((wAcc, w) => {
                    return wAcc + (parseFloat(w.net.replace(/[^0-9.-]/g, '')) || 0);
                  }, 0);
                }, 0);

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        Quarter 0{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        +${qGain.toLocaleString()} Target
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {q.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {q.sub}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">12 Weeks · 60 Sessions</span>
                      <span className="text-[#0082ff] font-bold">20-Pip Stop Wall</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Execution Discipline Rules */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Core Execution Protocols</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Lock size={12} />
                  <span>Rule 01 Devotion Gate</span>
                </div>
                <div className="text-[11px] text-amber-700/90 dark:text-amber-400/90 mt-1">
                  1-hour spiritual devotion gate must be honored daily before opening charts or executing orders.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
                <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <ShieldCheck size={12} />
                  <span>2-Loss Wall Hard Circuit Breaker</span>
                </div>
                <div className="text-[11px] text-rose-700/90 dark:text-rose-400/90 mt-1">
                  If 2 consecutive session losses occur, the terminal locks execution immediately for the remainder of the session.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Landmark size={12} />
                  <span>20% Offline Vault Sweeps</span>
                </div>
                <div className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 mt-1">
                  Every 4 weeks, {harvestPercent}% of net gains are physically swept to bank to remove market risk completely.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSaveAsNewAccount(true)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play size={13} />
                <span>Save & Activate As New Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 12-Month Milestones Table */}
      {activePlanTab === 'months' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-fadeIn overflow-x-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar size={16} className="text-[#0082ff]" />
              <span>12-Month Progression & Harvest Sweep Ledger</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Sweep Rate: {harvestPercent}%
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Quarter</th>
                <th className="py-2.5 px-3 text-right">Start Equity</th>
                <th className="py-2.5 px-3 text-center">Lot Size</th>
                <th className="py-2.5 px-3 text-right">Monthly Gain</th>
                <th className="py-2.5 px-3 text-right">Banked Sweep ({harvestPercent}%)</th>
                <th className="py-2.5 px-3 text-right">Retained Equity</th>
                <th className="py-2.5 px-3 text-right">Cumulative Vault</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
              {monthData.map((m) => (
                <tr key={m.monthNum} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                    Month {m.monthNum < 10 ? `0${m.monthNum}` : m.monthNum}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    Q{m.quarterNum}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    ${m.startBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-[#0082ff] font-bold">
                      {m.lotSize}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                    +${m.gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400 font-bold">
                    ${m.harvest > 0 ? `-$${m.harvest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-blue-600 dark:text-blue-400">
                    ${m.endBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-amber-500">
                    ${m.cumulativeBanked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: 48-Week Schedule Matrix */}
      {activePlanTab === 'weeks' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-fadeIn">
          {/* Quarter selector chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
            {planResult.quarters.map((q, qIdx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedPreviewQuarter(qIdx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  selectedPreviewQuarter === qIdx
                    ? 'bg-[#0082ff] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Quarter {qIdx + 1}
              </button>
            ))}
          </div>

          {/* Weeks grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {planResult.quarters[selectedPreviewQuarter]?.months.flatMap(m => m.weeks).map((w) => (
              <div
                key={w.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200/80 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-900 dark:text-white">Week {w.num}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-500 font-bold">
                    {w.lot}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Target Net:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{w.net}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Working End:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{w.bal}</span>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800 truncate">
                  🎯 {w.drill}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Portfolio Plans Comparison */}
      {activePlanTab === 'comparison' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-fadeIn overflow-x-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 size={16} className="text-indigo-500" />
              <span>Multi-Account Plan Comparison Matrix</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {accounts.length} Total Accounts
            </span>
          </div>

          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-400">
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Seed / Balance</th>
                <th className="py-2.5 px-3 text-right">Target Goal</th>
                <th className="py-2.5 px-3 text-right">Daily Loss</th>
                <th className="py-2.5 px-3 text-right">Max Drawdown</th>
                <th className="py-2.5 px-3 text-center">Plan Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {accounts.map(acc => {
                const isActive = acc.id === activeAccount?.id;
                return (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{acc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {acc.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                      ${acc.startingBalance.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-500">
                      ${(acc.profitTarget || acc.startingBalance * 1.5).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-500">
                      ${acc.dailyLossLimit.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-500">
                      ${acc.maxTrailingDrawdownLimit.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {isActive ? 'LIVE IN COCKPIT' : 'STANDBY'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isActive ? (
                        <span className="text-emerald-500 text-xs font-bold">Active ✓</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => switchAccount(acc.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#0082ff] hover:bg-[#0070df] text-white text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Switch
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: Sensitivity & What-If Monte Carlo Analysis */}
      {activePlanTab === 'monteCarlo' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Brain size={16} className="text-cyan-500" />
              <span>What-If Mathematical Sensitivity & Stress Simulator</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              10,000 Path Distribution
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Win Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Simulated Win Rate
                </label>
                <span className="font-mono text-xs font-extrabold text-[#0082ff]">
                  {simWinRate}%
                </span>
              </div>
              <input
                type="range"
                min={45}
                max={90}
                step={1}
                value={simWinRate}
                onChange={e => setSimWinRate(parseInt(e.target.value))}
                className="w-full accent-[#0082ff] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>45% (Challenging)</span>
                <span>75% (Target)</span>
                <span>90% (Elite)</span>
              </div>
            </div>

            {/* Risk Reward Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Risk / Reward Ratio
                </label>
                <span className="font-mono text-xs font-extrabold text-emerald-500">
                  1 : {simRiskReward.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={1.0}
                max={3.0}
                step={0.1}
                value={simRiskReward}
                onChange={e => setSimRiskReward(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1:1.0</span>
                <span>1:2.0 (Target)</span>
                <span>1:3.0</span>
              </div>
            </div>
          </div>

          {/* Outcome Forecast */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Conservative (P10)</div>
              <div className="text-lg font-mono font-extrabold text-slate-700 dark:text-slate-300 mt-1">
                ${Math.round(planResult.targetTotal * (simWinRate / 100) * 0.85).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">High friction / scratches</div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
              <div className="text-[10px] font-mono uppercase text-[#0082ff] font-bold">Expected Median (P50)</div>
              <div className="text-lg font-mono font-extrabold text-[#0082ff] mt-1">
                ${planResult.targetTotal.toLocaleString()}
              </div>
              <div className="text-[10px] text-blue-500/80 mt-0.5">Baseline Plan Target</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
              <div className="text-[10px] font-mono uppercase text-emerald-500 font-bold">Optimized (P90)</div>
              <div className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                ${Math.round(planResult.targetTotal * 1.35).toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-500/80 mt-0.5">Discipline & Runner Extension</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
