import React from 'react';
import { useCockpit } from '../context/CockpitContext';
import { DollarSign, Landmark, Wallet, Trophy } from 'lucide-react';

export const LiveMetricsGrid: React.FC = () => {
  const { metrics } = useCockpit();

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
      {/* 1. Seed Capital */}
      <div className="scandi-card p-3.5 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Seed Capital
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <DollarSign size={13} />
          </div>
        </div>
        <div className="font-mono text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5 sm:mb-1">
          $50.00
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          Starting tranche base
        </div>
      </div>

      {/* 2. Cash Banked (20%) */}
      <div className="scandi-card p-3.5 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
            Cash Banked (20%)
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Landmark size={13} />
          </div>
        </div>
        <div className="font-mono text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight mb-0.5 sm:mb-1">
          {formatMoney(metrics.currentBankedCash)}
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          Personal offline sweeps
        </div>
      </div>

      {/* 3. Retained Working Equity */}
      <div className="scandi-card p-3.5 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
            Retained Equity
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Wallet size={13} />
          </div>
        </div>
        <div className="font-mono text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mb-0.5 sm:mb-1">
          {formatMoney(metrics.currentWorkingEquity)}
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          Active MT5 capital
        </div>
      </div>

      {/* 4. Total Realized Value */}
      <div className="scandi-card p-3.5 sm:p-5 relative overflow-hidden border-slate-300 dark:border-slate-700/80">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
            Total Realized Value
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
            <Trophy size={13} />
          </div>
        </div>
        <div className="font-mono text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5 sm:mb-1">
          {formatMoney(metrics.currentTotalNetWorth)}
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          Year 1 Net Worth
        </div>
      </div>
    </div>
  );
};
