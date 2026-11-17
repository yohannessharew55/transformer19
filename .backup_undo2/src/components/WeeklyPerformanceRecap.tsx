import React, { useState, useMemo } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { TradingWeek, DailySession, DailyJournalNote, JournalColor } from '../types';
import {
  Trophy,
  Calendar,
  Landmark,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  StickyNote,
  FileText,
  DollarSign,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export const WeeklyPerformanceRecap: React.FC = () => {
  const { quarters, journalNotes, devotionGatePassedToday, getWeekBalance } = useCockpit();

  // Flatten all weeks from quarters
  const allWeeks = useMemo(() => {
    const list: { week: TradingWeek; monthName: string; quarterName: string }[] = [];
    quarters.forEach(q => {
      q.months.forEach(m => {
        m.weeks.forEach(w => {
          list.push({ week: w, monthName: m.name, quarterName: q.name });
        });
      });
    });
    return list;
  }, [quarters]);

  // Selected week index (default to 0: Week 1)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const currentWeekData = allWeeks[selectedWeekIndex] || allWeeks[0];
  const week = currentWeekData?.week;
  const weekCalc = week ? getWeekBalance(week.id) : undefined;

  // Calculate weekly metrics from the 5 daily sessions
  const weekStats = useMemo(() => {
    if (!week) return null;

    let completedSessions = 0;
    let winCount = 0;
    let lossCount = 0;
    let scratchCount = 0;
    let plannedTotalPnl = 0;
    let actualTotalPnl = 0;
    let hasActuals = false;

    week.days.forEach(d => {
      // Parse planned PnL e.g. "+$25.00" -> 25
      const cleanPlanned = parseFloat(d.pnl.replace(/[^0-9.-]+/g, '')) || 0;
      if (!d.isExtractRow) {
        plannedTotalPnl += cleanPlanned;
      }

      if (d.status === 'completed') {
        completedSessions++;
        if (d.isLoss) {
          lossCount++;
        } else if (!d.isExtractRow) {
          winCount++;
        }
      } else if (d.status === 'skipped') {
        scratchCount++;
      }

      if (d.actualPnl !== undefined) {
        hasActuals = true;
        if (!d.isExtractRow) {
          actualTotalPnl += d.actualPnl;
        }
      } else if (d.status === 'completed' && !d.isExtractRow) {
        actualTotalPnl += cleanPlanned;
      }
    });

    const completionRate = Math.round((completedSessions / week.days.length) * 100);
    const winRate = completedSessions > 0 ? Math.round((winCount / completedSessions) * 100) : 100;
    const delta = actualTotalPnl - plannedTotalPnl;

    // Physical Banked Cash for the week (if extraction week)
    const isExtractWeek = Boolean(week.isExtract || (weekCalc && weekCalc.displayHarvestSweep > 0));
    const bankedSweep = weekCalc ? weekCalc.displayHarvestSweep : (isExtractWeek ? (plannedTotalPnl * 0.2) : 0);

    return {
      completedSessions,
      totalDays: week.days.length,
      completionRate,
      winCount,
      lossCount,
      scratchCount,
      winRate,
      plannedTotalPnl,
      actualTotalPnl,
      delta,
      hasActuals,
      isExtractWeek,
      bankedSweep
    };
  }, [week, weekCalc]);

  // Find all daily sticky notes associated with this week's days
  const weekNotes = useMemo(() => {
    if (!week) return [];
    // Day IDs for this week: w01_d1, w01_d2, etc.
    const dayIds = new Set(week.days.map((_, idx) => `${week.id}_d${idx + 1}`));
    return journalNotes.filter(n => dayIds.has(n.dayId) || n.dayLabel?.includes(week.num));
  }, [week, journalNotes]);

  // Generate copyable text recap
  const generateTextRecap = () => {
    if (!week || !weekStats) return '';
    return `
=============================================
TRANSFORMER19: WEEKLY PERFORMANCE RECAP
${week.num.toUpperCase()} (${currentWeekData.monthName} · ${currentWeekData.quarterName})
=============================================

1. CAPITAL BALANCE & HARVEST RECONCILIATION
- Starting Working Base:   $${weekCalc ? weekCalc.displayStartBalance.toFixed(2) : '50.00'}
- Weekly Trading Target:   +$${weekStats.plannedTotalPnl.toFixed(2)}
- Actual Realized Trading: +$${weekStats.actualTotalPnl.toFixed(2)}
- 20% Offline Bank Sweep:  ${weekStats.bankedSweep > 0 ? `-$${weekStats.bankedSweep.toFixed(2)} (Deducted for Next Week)` : '$0.00 (Compounding Retained)'}
- Closing Working Equity:  $${weekCalc ? weekCalc.displayEndingBalance.toFixed(2) : '0.00'}
- Next Week Starting Base: $${weekCalc ? weekCalc.actualNextWeekStart.toFixed(2) : '0.00'} (After Harvest Deduction)
- Variance Alpha:          ${weekStats.delta >= 0 ? '+' : ''}$${weekStats.delta.toFixed(2)}
- Lot Ladder Allocation:   ${week.lot} Lot
- Sessions:                ${weekStats.completedSessions} / ${weekStats.totalDays} Completed (${weekStats.completionRate}%)
- Win Rate:                ${weekStats.winRate}% (${weekStats.winCount}W - ${weekStats.lossCount}L)

2. DISCIPLINARY COMPLIANCE
- Rule 01 Devotion: ${devotionGatePassedToday ? 'PASSED (Grounded Mental Framework)' : 'PENDING'}
- Drill Protocol:   ${week.drill}

3. DAILY JOURNAL REFLECTIONS (${weekNotes.length} Notes Logged)
${weekNotes.map((n, i) => `[${i + 1}] ${n.dayLabel || 'Session'} | ${n.sessionTag || 'Review'}: "${n.title || ''}"
  ${n.content}
  Outcome: ${n.outcome?.toUpperCase() || 'COMPLETED'} | P&L: ${n.pnl !== undefined ? (n.pnl >= 0 ? `+$${n.pnl}` : `-$${Math.abs(n.pnl)}`) : 'Standard'}
`).join('\n')}

=============================================
Dossier Generated via Transformer19 Execution Cockpit
    `.trim();
  };

  const handleCopyRecap = async () => {
    const text = generateTextRecap();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch {
      // Fallback
      setCopiedSuccess(false);
    }
  };

  if (!week || !weekStats) return null;

  return (
    <div className="scandi-card p-5 sm:p-7 mb-10 border border-slate-200 dark:border-slate-800/90 shadow-sm animate-fadeIn">
      {/* Week Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800/80 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              Synthesized Performance Digest
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-[11px] font-mono text-slate-500">
              {currentWeekData.monthName} ({currentWeekData.quarterName})
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="text-[#e07a5f]" size={22} />
            <span>Weekly Performance Recap: {week.num}</span>
          </h3>
        </div>

        {/* Week Stepper & Copy Recap */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              disabled={selectedWeekIndex === 0}
              onClick={() => setSelectedWeekIndex(prev => Math.max(0, prev - 1))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
              title="Previous week"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {selectedWeekIndex + 1} / {allWeeks.length}
            </span>
            <button
              type="button"
              disabled={selectedWeekIndex === allWeeks.length - 1}
              onClick={() => setSelectedWeekIndex(prev => Math.min(allWeeks.length - 1, prev + 1))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
              title="Next week"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyRecap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-[#e07a5f] text-xs font-bold transition-all shadow-xs hover:scale-102 active:scale-98 cursor-pointer"
            title="Copy weekly recap report to clipboard"
          >
            {copiedSuccess ? (
              <>
                <Check size={13} className="text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Recap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Main Performance Recap Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
        {/* Metric 1: Planned vs Actual Realized */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
            Weekly Net Target
          </div>
          <div className="text-base sm:text-xl font-mono font-black text-slate-900 dark:text-white mb-0.5">
            +${weekStats.actualTotalPnl.toFixed(2)}
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono flex items-center gap-1 text-slate-500 truncate">
            <span>Target: +${weekStats.plannedTotalPnl.toFixed(2)}</span>
            {weekStats.delta !== 0 && (
              <span className={`font-bold ${weekStats.delta > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                ({weekStats.delta > 0 ? `+${weekStats.delta.toFixed(0)}` : weekStats.delta.toFixed(0)})
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Completion & Win Rate */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
            Execution Progress
          </div>
          <div className="text-base sm:text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 mb-0.5">
            {weekStats.completedSessions} / {weekStats.totalDays} Days
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono text-slate-500 truncate">
            {weekStats.winRate}% Win ({weekStats.winCount}W - {weekStats.lossCount}L)
          </div>
        </div>

        {/* Metric 3: Lot Ladder Allocation */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
            Authorized Lot Size
          </div>
          <div className="text-base sm:text-xl font-mono font-black text-slate-900 dark:text-white mb-0.5">
            {week.lot} <span className="text-xs text-slate-500 font-bold">LOT</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono text-slate-500 truncate">
            Target End: <span className="font-bold text-slate-800 dark:text-slate-200">{week.bal}</span>
          </div>
        </div>

        {/* Metric 4: 20% Physical Cash Banked */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold mb-1">
            Offline 20% Sweep
          </div>
          <div className="text-base sm:text-xl font-mono font-black text-amber-600 dark:text-amber-400 mb-0.5">
            {weekStats.isExtractWeek ? `+$${weekStats.bankedSweep.toFixed(2)}` : '$0.00'}
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono text-slate-500 truncate">
            {weekStats.isExtractWeek ? 'Vault Sweep Scheduled' : '100% Compounding Retained'}
          </div>
        </div>
      </div>

      {/* Capital Ledger & Balance Reconciliation Strip */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-white dark:bg-[#0c101a] border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Landmark size={16} className="text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
              Capital Progression & Sweep Deductions ({week.num})
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Strict Formula: Start + Trading Net - Offline Sweep = Next Week Opening
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-center">
          {/* 1. Starting Working Capital */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block mb-1">
              1. Week Starting Base
            </span>
            <div className="text-base sm:text-lg font-mono font-black text-white">
              ${weekCalc ? weekCalc.displayStartBalance.toFixed(2) : '50.00'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              MT5 Opening Equity
            </span>
          </div>

          {/* 2. Trading Net Gain */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block mb-1">
              2. Trading Net Gain
            </span>
            <div className="text-base sm:text-lg font-mono font-black text-emerald-400">
              +${(weekCalc ? (weekCalc.hasActualLogs ? weekCalc.actualTradingGain : weekCalc.plannedTradingGain) : weekStats.actualTotalPnl).toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Market Performance
            </span>
          </div>

          {/* 3. 20% Offline Sweep */}
          <div className={`p-3 rounded-xl border ${
            weekStats.bankedSweep > 0
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
          }`}>
            <span className="text-[9px] uppercase font-bold text-amber-400 font-mono block mb-1">
              3. Offline Sweep
            </span>
            <div className="text-base sm:text-lg font-mono font-black text-amber-400">
              {weekStats.bankedSweep > 0 ? `-$${weekStats.bankedSweep.toFixed(2)}` : '$0.00'}
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono">
              {weekStats.bankedSweep > 0 ? 'Deducted to Vault' : 'None Scheduled'}
            </span>
          </div>

          {/* 4. Closing Working Balance */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block mb-1">
              4. Week Closing Equity
            </span>
            <div className="text-base sm:text-lg font-mono font-black text-sky-400">
              ${weekCalc ? weekCalc.displayEndingBalance.toFixed(2) : '0.00'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Retained in MT5
            </span>
          </div>

          {/* 5. Next Week Starting Base */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/60 col-span-2 sm:col-span-1">
            <span className="text-[9px] uppercase font-bold text-emerald-400 font-mono block mb-1">
              5. Next Week Starting
            </span>
            <div className="text-base sm:text-lg font-mono font-black text-emerald-300">
              ${weekCalc ? weekCalc.actualNextWeekStart.toFixed(2) : '0.00'}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              Strictly Net of Sweep
            </span>
          </div>
        </div>
      </div>

      {/* Synthesis Section: Journal Reflections for this Week */}
      <div className="p-5 rounded-2xl bg-[#faf9f6] dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <StickyNote size={16} className="text-[#e07a5f]" />
            <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">
              Daily Journal Insights ({week.num})
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {weekNotes.length} {weekNotes.length === 1 ? 'note' : 'notes'} linked to this week
          </span>
        </div>

        {weekNotes.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-white dark:bg-[#121927] border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              No daily sticky notes recorded for {week.num} yet. Log notes in the Daily Journal to see your psychological takeaways aggregated here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {weekNotes.map(n => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-[11px] text-slate-900 dark:text-white">
                    {n.dayLabel || 'Session'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {n.sessionTag || 'Review'}
                  </span>
                </div>
                {n.title && (
                  <div className="font-bold text-slate-900 dark:text-white mb-1">
                    {n.title}
                  </div>
                )}
                <p className="text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {n.content}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Outcome: <strong className="uppercase text-slate-700 dark:text-slate-300">{n.outcome || 'Complete'}</strong></span>
                  {n.pnl !== undefined && (
                    <span className={n.pnl >= 0 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                      {n.pnl >= 0 ? `+$${n.pnl.toFixed(2)}` : `-$${Math.abs(n.pnl).toFixed(2)}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Protocol Drill Reminder */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#e07a5f] shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">
              Assigned Focus Protocol: <strong className="text-slate-900 dark:text-white">{week.drill}</strong>
            </span>
          </div>

          <div className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>Plan Standard: 100% Rule Compliance</span>
          </div>
        </div>
      </div>
    </div>
  );
};
