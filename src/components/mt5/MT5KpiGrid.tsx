import React from 'react';
import { MT5AnalyticsKPIs } from '../../types/mt5';
import {
  TrendingUp,
  Percent,
  DollarSign,
  Award,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Scale,
  Zap,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface MT5KpiGridProps {
  kpis: MT5AnalyticsKPIs;
}

export const MT5KpiGrid: React.FC<MT5KpiGridProps> = ({ kpis }) => {
  const netProfit = kpis?.netProfit ?? 0;
  const isNetPositive = netProfit >= 0;

  return (
    <div className="space-y-3 mb-6">
      {/* High-Priority Violation Banners (Rule 05 & Order Stacking) */}
      {(kpis?.rule05Breached || (kpis?.orderStackingCount ?? 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
          {kpis?.rule05Breached && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-700 dark:text-rose-300 flex items-start gap-3 shadow-xs">
              <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
                <ShieldAlert size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs uppercase tracking-wider font-mono">
                    RULE 05 BREACH DETECTED
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-mono text-[10px] font-bold">
                    {kpis.maxConsecutiveLosses ?? 0} Loss Streak
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-700 dark:text-rose-200/90 leading-relaxed">
                  The strict 2-loss maximum wall was reached or breached ({kpis.maxConsecutiveLosses ?? 0} consecutive losses). Terminal protocol mandates immediate trading suspension until next daily session.
                </p>
              </div>
            </div>
          )}

          {(kpis?.orderStackingCount ?? 0) > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-700 dark:text-amber-300 flex items-start gap-3 shadow-xs">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs uppercase tracking-wider font-mono">
                    ORDER STACKING VIOLATIONS DETECTED
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[10px] font-bold">
                    {kpis.orderStackingCount} Positions Flagged
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-700 dark:text-amber-200/90 leading-relaxed">
                  Automatic timestamp analysis identified multiple positions open concurrently. Transformer19 doctrine strictly prohibits order stacking—maintain one active position at a time.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main TradeZella-Grade High-Density Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Net Realized P/L */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Net Realized P/L</span>
            <DollarSign size={14} className={isNetPositive ? 'text-emerald-500' : 'text-rose-500'} />
          </div>
          <div className="my-2">
            <div
              className={`text-xl sm:text-2xl font-mono font-black tracking-tight ${
                isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isNetPositive ? '+' : ''}${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
            <span>Gross: +${(kpis?.grossProfits ?? 0).toFixed(0)}</span>
            <span className="text-rose-500">-${(kpis?.grossLosses ?? 0).toFixed(0)}</span>
          </div>
        </div>

        {/* 2. Win Rate % */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Win Rate</span>
            <Percent size={14} className="text-[#0082ff]" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
              {kpis?.winRate ?? 0}%
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{kpis?.winningTrades ?? 0}W</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{kpis?.losingTrades ?? 0}L</span>
            <span>{kpis?.totalTrades ?? 0} Total</span>
          </div>
        </div>

        {/* 3. Profit Factor */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Profit Factor</span>
            <Award size={14} className={(kpis?.profitFactor ?? 0) >= 2.0 ? 'text-emerald-500' : 'text-amber-500'} />
          </div>
          <div className="my-2">
            <div
              className={`text-xl sm:text-2xl font-mono font-black tracking-tight ${
                (kpis?.profitFactor ?? 0) >= 2.0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : (kpis?.profitFactor ?? 0) >= 1.2
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {(kpis?.profitFactor ?? 0).toFixed(2)}
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
            <span>{(kpis?.profitFactor ?? 0) >= 2.0 ? 'Institutional Grade (>2.0)' : 'Benchmark Target: 2.0+'}</span>
          </div>
        </div>

        {/* 4. Trade Expectancy */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Trade Expectancy</span>
            <Zap size={14} className="text-amber-500" />
          </div>
          <div className="my-2">
            <div
              className={`text-xl sm:text-2xl font-mono font-black tracking-tight ${
                (kpis?.tradeExpectancy ?? 0) >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {(kpis?.tradeExpectancy ?? 0) >= 0 ? '+' : ''}${(kpis?.tradeExpectancy ?? 0).toFixed(2)}
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
            <span>Expected edge per execution</span>
          </div>
        </div>

        {/* 5. Risk / Reward Realized */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Realized R:R</span>
            <Scale size={14} className="text-[#0082ff]" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
              1 : {(kpis?.riskRewardRatio ?? 0).toFixed(2)}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
            <span>Avg +${(kpis?.avgWin ?? 0).toFixed(0)}</span>
            <span className="text-rose-500">Avg -${(kpis?.avgLoss ?? 0).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Secondary Detailed Telemetry Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Consecutive Loss Streak & Rule 05 */}
        <div className="p-3 rounded-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Max Loss Streak
            </span>
            <span
              className={`font-mono font-black text-base ${
                kpis?.rule05Breached
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {kpis?.maxConsecutiveLosses ?? 0} Losses
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              kpis?.rule05Breached
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {kpis?.rule05Breached ? 'Breached (>=2)' : 'Within Rule 05'}
          </span>
        </div>

        {/* Largest Win vs Largest Loss */}
        <div className="p-3 rounded-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Largest Win / Loss
            </span>
            <div className="font-mono text-xs font-bold mt-0.5 space-x-1.5">
              <span className="text-emerald-600 dark:text-emerald-400">+${(kpis?.largestWin ?? 0).toFixed(1)}</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-rose-600 dark:text-rose-400">-${Math.abs(kpis?.largestLoss ?? 0).toFixed(1)}</span>
            </div>
          </div>
          <TrendingUp size={16} className="text-emerald-500" />
        </div>

        {/* Order Stacking Violations */}
        <div className="p-3 rounded-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Order Stacking
            </span>
            <span
              className={`font-mono font-black text-base ${
                (kpis?.orderStackingCount ?? 0) > 0
                  ? 'text-amber-500'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {kpis?.orderStackingCount ?? 0} Overlaps
            </span>
          </div>
          <Layers
            size={16}
            className={(kpis?.orderStackingCount ?? 0) > 0 ? 'text-amber-500' : 'text-emerald-500'}
          />
        </div>

        {/* Total Executed Volume & Fees */}
        <div className="p-3 rounded-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Volume & Commissions
            </span>
            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              <span>{(kpis?.totalVolume ?? 0).toFixed(2)} Lots</span>
              <span className="text-slate-400 font-normal ml-1">(-${Math.abs(kpis?.totalCommissions ?? 0).toFixed(2)})</span>
            </div>
          </div>
          <Scale size={16} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
};
