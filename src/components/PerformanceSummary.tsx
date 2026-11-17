import React, { useState, useMemo } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { DailySession, DailyJournalNote } from '../types';
import { DayEditModal } from './DayEditModal';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Award,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  PieChart,
  Percent,
  DollarSign,
  Activity,
  Layers,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Edit3,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface JournalTradeRecord {
  id: string;
  source: 'note' | 'session' | 'merged';
  date: string;
  sessionTitle: string;
  protocol: string;
  weekId: string;
  weekNum: string;
  dayIndex: number;
  session?: DailySession;
  pnl: number;
  isWin: boolean;
  isLoss: boolean;
  isBreakeven: boolean;
  outcomeTag: string;
  notes?: string;
  color?: string;
}

interface PerformanceSummaryMetrics {
  totalTrades: number;
  decisiveTrades: number;
  winCount: number;
  lossCount: number;
  breakevenCount: number;
  grossProfit: number;
  grossLoss: number;
  netPnl: number;
  profitFactor: number;
  isProfitFactorInfinity: boolean;
  winLossRatio: number;
  winRate: number;
  lossRate: number;
  avgWin: number;
  avgLoss: number;
  payoffRatio: number;
  expectancy: number;
  largestWin: number;
  largestLoss: number;
  profitRetention: number;
  currentStreakType: 'win' | 'loss' | null;
  currentStreakCount: number;
  maxWinStreak: number;
  maxLossStreak: number;
}

export const PerformanceSummary: React.FC = () => {
  const { quarters, journalNotes, postgresConnected } = useCockpit();

  // Filter States
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [dataSource, setDataSource] = useState<'all' | 'notes' | 'sessions'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'wins' | 'losses' | 'breakeven'>('all');
  const [benchmarkMode, setBenchmarkMode] = useState<boolean>(false);
  const [editingDay, setEditingDay] = useState<{
    weekId: string;
    dayIndex: number;
    day: DailySession;
    weekNumber: string;
  } | null>(null);

  // Extract all trade records from both sticky journal notes and daily execution roadmap
  const allTradeRecords = useMemo(() => {
    const records: JournalTradeRecord[] = [];
    const seenDayIds = new Set<string>();

    // 1. Process Daily Sessions with actual results from quarters roadmap
    quarters.forEach(q => {
      q.months.forEach(m => {
        m.weeks.forEach(w => {
          w.days.forEach((d, dIdx) => {
            const dayId = `${w.id}_d${dIdx + 1}`;
            const plannedClean = parseFloat((d.pnl || '0').replace(/[^0-9.-]/g, '')) || 25;

            // Check if this session has a recorded result
            const hasActual = d.actualPnl !== undefined && d.actualPnl !== null;
            const isCompleted = d.status === 'completed';

            if (hasActual || isCompleted) {
              const pnlVal = hasActual ? Number(d.actualPnl) : plannedClean;
              const isWin = pnlVal > 0;
              const isLoss = pnlVal < 0 || Boolean(d.isLoss);
              const isBreakeven = pnlVal === 0 && !d.isLoss;

              records.push({
                id: `session_${dayId}`,
                source: 'session',
                date: d.day,
                sessionTitle: `${w.num} · ${d.day}`,
                protocol: d.proto,
                weekId: w.id,
                weekNum: w.num,
                dayIndex: dIdx,
                session: d,
                pnl: pnlVal,
                isWin,
                isLoss,
                isBreakeven,
                outcomeTag: isWin ? 'Target Win' : isLoss ? 'Risk Halt' : 'Breakeven',
                notes: d.notes || undefined,
                color: isWin ? 'emerald' : isLoss ? 'rose' : 'slate'
              });

              seenDayIds.add(dayId);
              seenDayIds.add(`${w.id}-d${dIdx + 1}`);
            }
          });
        });
      });
    });

    // 2. Process Sticky Journal Notes (notes with numerical P&L or explicit win/loss outcome)
    journalNotes.forEach(note => {
      const pnlVal = note.pnl !== undefined ? Number(note.pnl) : undefined;
      const outcome = note.outcome;

      // Check if this note represents a financial trade execution
      const isExplicitTrade = pnlVal !== undefined || outcome === 'win' || outcome === 'loss' || outcome === 'scratch';

      if (isExplicitTrade) {
        // If note has no numeric PnL, infer from outcome
        const effectivePnl = pnlVal !== undefined ? pnlVal : (outcome === 'loss' ? -15 : outcome === 'win' ? 25 : 0);
        const isWin = effectivePnl > 0 || outcome === 'win';
        const isLoss = effectivePnl < 0 || outcome === 'loss';
        const isBreakeven = effectivePnl === 0 || outcome === 'scratch';

        records.push({
          id: `note_${note.id}`,
          source: 'note',
          date: note.date || note.createdAt.split('T')[0],
          sessionTitle: note.dayLabel || note.sessionTag || 'Journal Session',
          protocol: note.title || note.sessionTag || 'Price Action Execution',
          weekId: 'custom',
          weekNum: note.dayLabel ? note.dayLabel.split(' ')[0] : 'Trade',
          dayIndex: 0,
          pnl: effectivePnl,
          isWin,
          isLoss,
          isBreakeven,
          outcomeTag: outcome ? outcome.toUpperCase() : (isWin ? 'WIN' : isLoss ? 'LOSS' : 'NOTE'),
          notes: note.content,
          color: isWin ? 'emerald' : isLoss ? 'rose' : 'amber'
        });
      }
    });

    return records;
  }, [quarters, journalNotes]);

  // Master Simulation Benchmark baseline (What the 48-week plan expects)
  const benchmarkMetrics: PerformanceSummaryMetrics = useMemo(() => {
    return {
      profitFactor: 3.12,
      isProfitFactorInfinity: false,
      winLossRatio: 1.96, // 167 wins vs 85 losses = 1.96 count ratio
      winRate: 66.2,
      lossRate: 33.8,
      avgWin: 980.5,
      avgLoss: 382.4,
      payoffRatio: 2.56,
      grossProfit: 163740,
      grossLoss: 52420,
      netPnl: 111320,
      totalTrades: 252,
      decisiveTrades: 252,
      winCount: 167,
      lossCount: 85,
      breakevenCount: 0,
      expectancy: 520.4,
      largestWin: 4200,
      largestLoss: -950,
      profitRetention: 68.0,
      currentStreakType: 'win',
      currentStreakCount: 3,
      maxWinStreak: 9,
      maxLossStreak: 2
    };
  }, []);

  // Filtered trade dataset according to user controls
  const filteredTrades = useMemo(() => {
    return allTradeRecords.filter(trade => {
      // Source filter
      if (dataSource === 'notes' && trade.source !== 'note') return false;
      if (dataSource === 'sessions' && trade.source !== 'session') return false;

      // Quarter filter
      if (selectedQuarter !== 'all' && trade.weekId !== 'custom') {
        const weekNumInt = parseInt(trade.weekId.replace('w', ''), 10) || 1;
        if (selectedQuarter === 'q1' && (weekNumInt < 1 || weekNumInt > 12)) return false;
        if (selectedQuarter === 'q2' && (weekNumInt < 13 || weekNumInt > 24)) return false;
        if (selectedQuarter === 'q3' && (weekNumInt < 25 || weekNumInt > 36)) return false;
        if (selectedQuarter === 'q4' && (weekNumInt < 37 || weekNumInt > 48)) return false;
      }

      // Outcome filter
      if (outcomeFilter === 'wins' && !trade.isWin) return false;
      if (outcomeFilter === 'losses' && !trade.isLoss) return false;
      if (outcomeFilter === 'breakeven' && !trade.isBreakeven) return false;

      return true;
    });
  }, [allTradeRecords, dataSource, selectedQuarter, outcomeFilter]);

  // Computed Quantitative Metrics from Journal Trades
  const performanceMetrics: PerformanceSummaryMetrics = useMemo(() => {
    const trades = filteredTrades;
    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let lossCount = 0;
    let breakevenCount = 0;
    let largestWin = 0;
    let largestLoss = 0;

    let currentStreakType: 'win' | 'loss' | null = null;
    let currentStreakCount = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    trades.forEach(t => {
      if (t.isWin) {
        grossProfit += t.pnl;
        winCount++;
        if (t.pnl > largestWin) largestWin = t.pnl;

        if (currentStreakType === 'win') {
          currentStreakCount++;
        } else {
          currentStreakType = 'win';
          currentStreakCount = 1;
        }
        if (currentStreakCount > maxWinStreak) maxWinStreak = currentStreakCount;
      } else if (t.isLoss) {
        grossLoss += Math.abs(t.pnl);
        lossCount++;
        if (t.pnl < largestLoss) largestLoss = t.pnl;

        if (currentStreakType === 'loss') {
          currentStreakCount++;
        } else {
          currentStreakType = 'loss';
          currentStreakCount = 1;
        }
        if (currentStreakCount > maxLossStreak) maxLossStreak = currentStreakCount;
      } else {
        breakevenCount++;
        currentStreakType = null;
        currentStreakCount = 0;
      }
    });

    const totalTrades = trades.length;
    const decisiveTrades = winCount + lossCount;
    const netPnl = grossProfit - grossLoss;

    // Profit Factor calculation
    let profitFactor = 0;
    let isProfitFactorInfinity = false;
    if (grossLoss > 0) {
      profitFactor = grossProfit / grossLoss;
    } else if (grossProfit > 0) {
      isProfitFactorInfinity = true;
      profitFactor = 99.9; // Representation for zero loss
    }

    // Win/Loss Count Ratio
    const winLossRatio = lossCount > 0 ? winCount / lossCount : (winCount > 0 ? winCount : 0);

    // Win Rate & Loss Rate
    const winRate = decisiveTrades > 0 ? (winCount / decisiveTrades) * 100 : 0;
    const lossRate = decisiveTrades > 0 ? (lossCount / decisiveTrades) * 100 : 0;

    // Average Win vs Average Loss & Payoff Ratio
    const avgWin = winCount > 0 ? grossProfit / winCount : 0;
    const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0;
    const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? avgWin : 0);

    // Expectancy per trade = (Win% * AvgWin) - (Loss% * AvgLoss)
    const winDec = winRate / 100;
    const lossDec = lossRate / 100;
    const expectancy = (winDec * avgWin) - (lossDec * avgLoss);

    // Profit Retention Percentage
    const profitRetention = grossProfit > 0 ? Math.max(0, (netPnl / grossProfit) * 100) : 0;

    return {
      totalTrades,
      decisiveTrades,
      winCount,
      lossCount,
      breakevenCount,
      grossProfit,
      grossLoss,
      netPnl,
      profitFactor,
      isProfitFactorInfinity,
      winLossRatio,
      winRate,
      lossRate,
      avgWin,
      avgLoss,
      payoffRatio,
      expectancy,
      largestWin,
      largestLoss,
      profitRetention,
      currentStreakType,
      currentStreakCount,
      maxWinStreak,
      maxLossStreak
    };
  }, [filteredTrades]);

  // Display metrics (either real journal data or blueprint simulation benchmark)
  const display: PerformanceSummaryMetrics = benchmarkMode ? benchmarkMetrics : performanceMetrics;
  const hasData = filteredTrades.length > 0 || benchmarkMode;

  // Grade badge helper for Profit Factor
  const getProfitFactorStatus = (pf: number, isInf: boolean) => {
    if (isInf) return { label: 'Infinite Edge (0 Losses)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    if (pf >= 2.5) return { label: 'Elite Institutional (≥2.5)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    if (pf >= 1.75) return { label: 'Solid Statistical Edge (≥1.75)', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    if (pf >= 1.2) return { label: 'Marginally Profitable (≥1.2)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    if (pf >= 1.0) return { label: 'Breakeven Churn (1.0)', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    return { label: 'Sub-Optimal (<1.0)', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
  };

  const pfStatus = getProfitFactorStatus(display.profitFactor, display.isProfitFactorInfinity);

  return (
    <div id="analytics-section" className="space-y-6 animate-fadeIn scroll-mt-20">
      {/* Top Header & Forensic Telemetry Dossier */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0082ff] animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0082ff]">
              Journal Analytics & Execution Forensics
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-mono font-bold">
              {postgresConnected ? 'SQLite Persistent' : 'Synced'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Scale className="text-[#0082ff]" size={28} />
            <span>Performance Summary · Win/Loss & Profit Factor</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
            Forensic mathematical verification of your edge calculated directly from realized journal executions and daily trading sessions.
          </p>
        </div>

        {/* Global Blueprint Benchmark Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => setBenchmarkMode(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              benchmarkMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Toggle between Live Journal Data and Master 48-Week Blueprint Target"
          >
            <Sparkles size={14} className={benchmarkMode ? 'text-white' : 'text-amber-500'} />
            <span>{benchmarkMode ? 'Viewing Blueprint Target' : 'Compare Blueprint Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Segmentation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 text-xs">
        {/* Source Segment */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} />
            <span>Source:</span>
          </span>
          {(['all', 'notes', 'sessions'] as const).map(src => (
            <button
              key={src}
              type="button"
              onClick={() => setDataSource(src)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                dataSource === src
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {src === 'all' ? 'All Journal Data' : src === 'notes' ? 'Sticky Notes' : 'Roadmap Sessions'}
            </button>
          ))}
        </div>

        {/* Quarter Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-400 mr-1">
            Timeframe:
          </span>
          {(['all', 'q1', 'q2', 'q3', 'q4'] as const).map(q => (
            <button
              key={q}
              type="button"
              onClick={() => setSelectedQuarter(q)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedQuarter === q
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {q.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State / Pre-launch Notice if 0 trades recorded */}
      {!hasData && (
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#121927] border border-dashed border-slate-300 dark:border-slate-800 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0082ff] flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-900">
            <Scale size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
            No Realized Journal Trades Found Yet (Pre-Launch Baseline)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
            Your trading journey starts with the $50 seed. As you record actual session P&L in the daily roadmap or pin journal notes with outcomes, Win/Loss and Profit Factor metrics will calculate automatically here.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setBenchmarkMode(true)}
              className="px-5 py-2.5 rounded-full bg-[#0082ff] hover:bg-[#0070df] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={14} />
              <span>Preview 48-Week Target Benchmark</span>
            </button>
          </div>
        </div>
      )}

      {/* Core Executive KPI Cards (Grid of 4 Major Forensic Engines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. PROFIT FACTOR CARD */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Profit Factor (Edge)
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${pfStatus.color}`}>
              {display.profitFactor >= 2.0 ? 'Elite' : display.profitFactor >= 1.5 ? 'Strong' : 'Active'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-3xl sm:text-4xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
              {'isProfitFactorInfinity' in display && display.isProfitFactorInfinity ? '∞' : (display.profitFactor ?? 0) > 0 ? (display.profitFactor ?? 0).toFixed(2) : '0.00'}
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">
              PF Ratio
            </span>
          </div>

          {/* Gross Profit vs Loss pill */}
          <div className="flex items-center justify-between text-[11px] font-mono pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              +${(display.grossProfit ?? 0).toFixed(0)} Wins
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              -${(display.grossLoss ?? 0).toFixed(0)} Losses
            </span>
          </div>

          {/* Visual Mini Ratio Progress */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{
                width: `${display.grossProfit + display.grossLoss > 0 ? (display.grossProfit / (display.grossProfit + display.grossLoss)) * 100 : 50}%`
              }}
            ></div>
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{
                width: `${display.grossProfit + display.grossLoss > 0 ? (display.grossLoss / (display.grossProfit + display.grossLoss)) * 100 : 50}%`
              }}
            ></div>
          </div>
        </div>

        {/* 2. WIN / LOSS RATIO CARD */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Win / Loss Ratio
            </span>
            <span className="text-[10px] font-mono font-bold text-[#0082ff] bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
              {(display.winRate ?? 66.2).toFixed(1)}% Win Rate
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-3xl sm:text-4xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
              {(display.winLossRatio ?? 0).toFixed(2)}:1
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">
              Wins/Loss
            </span>
          </div>

          {/* Count Breakdown */}
          <div className="flex items-center justify-between text-[11px] font-mono pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>{display.winCount} Wins</span>
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
              <XCircle size={12} />
              <span>{display.lossCount} Losses</span>
            </span>
            {'breakevenCount' in display && display.breakevenCount > 0 && (
              <span className="text-slate-400 font-bold">
                {display.breakevenCount} BE
              </span>
            )}
          </div>

          {/* Visual Win Rate Gauge */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#0082ff] h-full transition-all duration-500"
              style={{ width: `${display.winRate}%` }}
            ></div>
          </div>
        </div>

        {/* 3. PAYOFF RATIO & EXPECTANCY */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Reward / Risk Payoff
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
              +${(display.expectancy ?? 0).toFixed(0)}/Trade
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-3xl sm:text-4xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
              {(display.payoffRatio ?? 0).toFixed(2)}:1
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">
              Avg Size
            </span>
          </div>

          {/* Avg Win vs Avg Loss */}
          <div className="flex items-center justify-between text-[11px] font-mono pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Avg +${(display.avgWin ?? 0).toFixed(0)}
            </span>
            <span className="text-slate-400">vs</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              Avg -${(display.avgLoss ?? 0).toFixed(0)}
            </span>
          </div>

          {/* Relative Payoff Size Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{
                width: `${display.avgWin + display.avgLoss > 0 ? (display.avgWin / (display.avgWin + display.avgLoss)) * 100 : 50}%`
              }}
            ></div>
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{
                width: `${display.avgWin + display.avgLoss > 0 ? (display.avgLoss / (display.avgWin + display.avgLoss)) * 100 : 50}%`
              }}
            ></div>
          </div>
        </div>

        {/* 4. NET REALIZED P&L */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Net Realized P&L
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
              {display.totalTrades} Executions
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <div className={`text-3xl sm:text-4xl font-mono font-black tracking-tight ${
              display.netPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {(display.netPnl ?? 0) >= 0 ? `+${(display.netPnl ?? 0).toFixed(0)}` : `-${Math.abs(display.netPnl ?? 0).toFixed(0)}`}
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">
              USD
            </span>
          </div>

          {/* Retention % and largest win */}
          <div className="flex items-center justify-between text-[11px] font-mono pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">
              Best: <strong className="text-emerald-500">+${(display.largestWin ?? 0).toFixed(0)}</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Max Draw: <strong className="text-rose-500">${(display.largestLoss ?? 0).toFixed(0)}</strong>
            </span>
          </div>

          {/* Full-width retention bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                display.netPnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, ('profitRetention' in display ? display.profitRetention : 68)))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Secondary Forensic Analysis Panel: Distribution & Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Capital Flow (Gross Profit vs Loss vs Net) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-[#0082ff]" size={18} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Capital Flow & Profit Retention Breakdown
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Institutional Edge Audit
            </span>
          </div>

          {/* Visual Horizontal Gauge Bars */}
          <div className="space-y-4">
            {/* Gross Profit */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                  Gross Profits Harvested
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  +${display.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-700 w-full"></div>
              </div>
            </div>

            {/* Gross Loss */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                  Gross Drawdowns Incurred
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  -${display.grossLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${display.grossProfit > 0 ? Math.min(100, (display.grossLoss / display.grossProfit) * 100) : (display.grossLoss > 0 ? 100 : 0)}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Net PnL */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0082ff]"></span>
                  Net Retained P&L (Equity Growth)
                </span>
                <span className={`font-bold text-sm ${display.netPnl >= 0 ? 'text-[#0082ff]' : 'text-rose-600'}`}>
                  {display.netPnl >= 0 ? `+$${display.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(display.netPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${display.netPnl >= 0 ? 'bg-[#0082ff]' : 'bg-rose-500'}`}
                  style={{
                    width: `${display.grossProfit > 0 ? Math.max(0, Math.min(100, (display.netPnl / display.grossProfit) * 100)) : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Context Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c101a] border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Profit Retention</span>
              <div className="text-base font-mono font-black text-slate-800 dark:text-slate-200">
                {'profitRetention' in display ? (display.profitRetention ?? 68).toFixed(1) : '68.0'}%
              </div>
              <span className="text-[10px] text-slate-400">Net kept from gross</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c101a] border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Streak Momentum</span>
              <div className="text-base font-mono font-black text-slate-800 dark:text-slate-200">
                {'maxWinStreak' in display ? `${display.maxWinStreak}W max` : '8W max'}
              </div>
              <span className="text-[10px] text-slate-400">Max loss streak: {'maxLossStreak' in display ? display.maxLossStreak : 2}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c101a] border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Mathematical Edge</span>
              <div className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">
                {display.profitFactor >= 2.0 ? 'Positive Edge' : display.profitFactor >= 1.0 ? 'Breakeven' : 'Demoted'}
              </div>
              <span className="text-[10px] text-slate-400">Rule 05 wall intact</span>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Rules & Benchmark Guide */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <ShieldCheck className="text-emerald-500" size={18} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edge Standards & Thresholds
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between mb-1">
                  <span>Profit Factor ≥ 2.0</span>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-emerald-200/50 dark:bg-emerald-800/50">Elite Target</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Earns $2.00+ for every $1.00 risked. Allows compounding through Tier 4 and beyond.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div className="font-bold text-blue-800 dark:text-blue-300 flex items-center justify-between mb-1">
                  <span>Win Rate: 60% – 70%</span>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-blue-200/50 dark:bg-blue-800/50">Plan Base</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Grounded on Yohannes's verified 66.18% historical edge over 1,588 executions.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center justify-between mb-1">
                  <span>Rule 05: 2 Consecutive Losses</span>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-rose-200/50 dark:bg-rose-800/50">Demotion Wall</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Halves risk by 50% immediately to preserve equity and protect the seed capital.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>Formulas: PF = Gross Profit ÷ Gross Loss; W/L = Wins ÷ Losses</span>
          </div>
        </div>
      </div>

      {/* Contributory Journal Trade Execution Table */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-[#0082ff]" />
              <span>Contributory Journal Trades ({filteredTrades.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Audited trade ledger feeding the Win/Loss and Profit Factor calculations above.
            </p>
          </div>

          {/* Outcome Filter Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            {(['all', 'wins', 'losses', 'breakeven'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setOutcomeFilter(f)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  outcomeFilter === f
                    ? 'bg-white dark:bg-[#121927] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'wins' ? 'Wins' : f === 'losses' ? 'Losses' : 'BE'}
              </button>
            ))}
          </div>
        </div>

        {filteredTrades.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono italic">
            No journal trades match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-mono uppercase font-bold text-slate-400">
                  <th className="py-2.5 px-3">Session / Date</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Protocol / Title</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3 text-right">Realized P&L</th>
                  <th className="py-2.5 px-3">Contribution</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
                {filteredTrades.map(trade => (
                  <tr key={trade.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {trade.sessionTitle}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                        trade.source === 'session'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      }`}>
                        {trade.source === 'session' ? 'Roadmap' : 'Sticky Note'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate font-sans text-xs">
                      {trade.protocol}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        trade.isWin
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                          : trade.isLoss
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {trade.outcomeTag}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-black ${
                      trade.isWin ? 'text-emerald-600 dark:text-emerald-400' : trade.isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                    }`}>
                      {(trade.pnl ?? 0) > 0 ? `+${(trade.pnl ?? 0).toFixed(2)}` : (trade.pnl ?? 0) < 0 ? `-${Math.abs(trade.pnl ?? 0).toFixed(2)}` : '$0.00'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold ${
                        trade.isWin ? 'text-emerald-600' : trade.isLoss ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        {trade.isWin ? 'Gross Profit Pool' : trade.isLoss ? 'Gross Loss Pool' : 'Breakeven Neutral'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {trade.session ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDay({
                              weekId: trade.weekId,
                              dayIndex: trade.dayIndex,
                              day: trade.session as DailySession,
                              weekNumber: trade.weekNum
                            });
                          }}
                          className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#0082ff] hover:text-white text-slate-600 dark:text-slate-300 transition-colors"
                          title="Edit Session Data"
                        >
                          <Edit3 size={12} />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Day Session Edit Modal */}
      {editingDay && (
        <DayEditModal
          isOpen={Boolean(editingDay)}
          onClose={() => setEditingDay(null)}
          weekId={editingDay.weekId}
          dayIndex={editingDay.dayIndex}
          day={editingDay.day}
          weekNumber={editingDay.weekNumber}
        />
      )}
    </div>
  );
};
