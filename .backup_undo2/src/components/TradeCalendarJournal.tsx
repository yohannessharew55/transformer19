import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { DailyJournalNote, MentalStateKey } from '../types';
import { MT5Trade } from '../types/mt5';
import {
  parseTradeDate,
  formatTradeDateKey,
  generateSampleMT5Trades,
  detectOrderStacking
} from '../utils/mt5Parser';
import { getStoredMT5Trades, saveStoredMT5Trades } from '../services/supabaseMT5';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Plus,
  X,
  StickyNote,
  DollarSign,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Award,
  ArrowRight,
  Edit3,
  Brain,
  Smile,
  FileText,
  RotateCcw,
  Check,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';
import { TradeImporterModal } from './TradeImporterModal';

interface TradeCalendarJournalProps {
  onOpenNewNoteForDate: (dateStr: string, dayLabel?: string) => void;
  onEditNote: (note: DailyJournalNote) => void;
}

export const TradeCalendarJournal: React.FC<TradeCalendarJournalProps> = ({
  onOpenNewNoteForDate,
  onEditNote
}) => {
  const { journalNotes, mentalStateLogs, quarters } = useCockpit();

  // MT5 or logged trades cache
  const [trades, setTrades] = useState<MT5Trade[]>(() => {
    try {
      const stored = getStoredMT5Trades();
      if (Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch {
      // fallback
    }
    const sample = generateSampleMT5Trades();
    saveStoredMT5Trades(sample);
    return sample;
  });

  // Current viewing month (default to today's current month automatically)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // 1-Click CSV / Broker Statement Importer Modal State
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  // Selected Day Modal State
  const [selectedDayModal, setSelectedDayModal] = useState<{
    isOpen: boolean;
    dateStr: string;
    dayLabel: string;
    notes: DailyJournalNote[];
    trades: MT5Trade[];
    netPnl: number;
  }>({
    isOpen: false,
    dateStr: '',
    dayLabel: '',
    notes: [],
    trades: [],
    netPnl: 0
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToCurrentMonth = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Group journal notes by date string YYYY-MM-DD
  const notesByDay = useMemo(() => {
    const map = new Map<string, DailyJournalNote[]>();
    journalNotes.forEach(note => {
      if (!note.date) return;
      const key = formatTradeDateKey(note.date);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(note);
    });
    return map;
  }, [journalNotes]);

  // Group mental state logs by date string YYYY-MM-DD
  const mentalLogsByDay = useMemo(() => {
    const map = new Map<string, typeof mentalStateLogs>();
    mentalStateLogs.forEach(log => {
      if (!log.date) return;
      const key = formatTradeDateKey(log.date);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(log);
    });
    return map;
  }, [mentalStateLogs]);

  // Group trades by date string YYYY-MM-DD
  const tradesByDay = useMemo(() => {
    const map = new Map<string, MT5Trade[]>();
    trades.forEach(trade => {
      const d = parseTradeDate(trade.closeTime);
      if (!d) return;
      const key = formatTradeDateKey(d);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(trade);
    });
    return map;
  }, [trades]);

  // Generate calendar grid for Mon - Fri trading days
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const cells: Array<{
      date: Date;
      dateKey: string;
      isCurrentMonth: boolean;
      dayNumber: number;
      dayOfWeek: number;
      notes: DailyJournalNote[];
      trades: MT5Trade[];
      mentalLogs: typeof mentalStateLogs;
      netPnl: number;
      winCount: number;
      lossCount: number;
      hasPnl: boolean;
      primaryOutcome?: string;
    }> = [];

    // Find the Monday of the first week
    const start = new Date(firstDayOfMonth);
    const dayOfWeek = start.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + distanceToMonday);

    // End on Friday of the last week
    const end = new Date(lastDayOfMonth);
    const endDayOfWeek = end.getDay();
    const distanceToFriday = endDayOfWeek === 6 ? -1 : 5 - endDayOfWeek;
    end.setDate(end.getDate() + distanceToFriday);

    const cursor = new Date(start);

    while (cursor <= end) {
      const dow = cursor.getDay();
      // Only include Monday through Friday
      if (dow >= 1 && dow <= 5) {
        const dateKey = formatTradeDateKey(cursor);
        const dayNotes = notesByDay.get(dateKey) || [];
        const dayTrades = tradesByDay.get(dateKey) || [];
        const dayMentalLogs = mentalLogsByDay.get(dateKey) || [];

        // Compute net P&L: prioritize trade tickets if present; else sum journal note PnL
        let netPnl = 0;
        let hasPnl = false;
        let winCount = 0;
        let lossCount = 0;

        if (dayTrades.length > 0) {
          hasPnl = true;
          dayTrades.forEach(t => {
            const p = typeof t.netProfit === 'number' && !isNaN(t.netProfit) ? t.netProfit : 0;
            netPnl += p;
            if (p > 0.01) winCount++;
            else if (p < -0.01) lossCount++;
          });
        } else if (dayNotes.length > 0) {
          dayNotes.forEach(n => {
            if (n.pnl !== undefined && !isNaN(n.pnl)) {
              hasPnl = true;
              netPnl += n.pnl;
              if (n.pnl > 0.01) winCount++;
              else if (n.pnl < -0.01) lossCount++;
            } else if (n.outcome === 'win') {
              winCount++;
            } else if (n.outcome === 'loss') {
              lossCount++;
            }
          });
        }

        // Primary outcome tag
        let primaryOutcome: string | undefined;
        if (hasPnl) {
          if (netPnl > 0.01) primaryOutcome = 'win';
          else if (netPnl < -0.01) primaryOutcome = 'loss';
          else primaryOutcome = 'scratch';
        } else if (dayNotes.length > 0) {
          primaryOutcome = dayNotes[0].outcome || 'note';
        }

        cells.push({
          date: new Date(cursor),
          dateKey,
          isCurrentMonth: cursor.getMonth() === month,
          dayNumber: cursor.getDate(),
          dayOfWeek: dow,
          notes: dayNotes,
          trades: dayTrades,
          mentalLogs: dayMentalLogs,
          netPnl: Number(netPnl.toFixed(2)),
          winCount,
          lossCount,
          hasPnl,
          primaryOutcome
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return cells;
  }, [year, month, notesByDay, tradesByDay, mentalLogsByDay]);

  // Compute month statistics
  const monthStats = useMemo(() => {
    let monthPnl = 0;
    let activeDays = 0;
    let winningDays = 0;
    let losingDays = 0;
    let totalNotesThisMonth = 0;
    let totalTradesThisMonth = 0;

    calendarCells.forEach(cell => {
      if (cell.isCurrentMonth) {
        const hasActivity = cell.notes.length > 0 || cell.trades.length > 0;
        if (hasActivity) {
          activeDays++;
          totalNotesThisMonth += cell.notes.length;
          totalTradesThisMonth += cell.trades.length;

          if (cell.hasPnl) {
            monthPnl += cell.netPnl;
            if (cell.netPnl > 0.01) winningDays++;
            else if (cell.netPnl < -0.01) losingDays++;
          } else if (cell.primaryOutcome === 'win') {
            winningDays++;
          } else if (cell.primaryOutcome === 'loss') {
            losingDays++;
          }
        }
      }
    });

    const winRate = activeDays > 0 ? (winningDays / activeDays) * 100 : 0;

    return {
      monthPnl: Number(monthPnl.toFixed(2)),
      activeDays,
      winningDays,
      losingDays,
      totalNotesThisMonth,
      totalTradesThisMonth,
      winRate: Math.round(winRate)
    };
  }, [calendarCells]);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

  // Handle cell click
  const handleSelectCell = (cell: (typeof calendarCells)[0]) => {
    const formattedDayLabel = cell.date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    setSelectedDayModal({
      isOpen: true,
      dateStr: cell.dateKey,
      dayLabel: formattedDayLabel,
      notes: cell.notes,
      trades: cell.trades,
      netPnl: cell.netPnl
    });
  };

  // Quick reload sample data for rich experience
  const handleReloadSampleData = () => {
    const sample = generateSampleMT5Trades();
    const { trades: stacked } = detectOrderStacking(sample);
    setTrades(stacked);
    saveStoredMT5Trades(stacked);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Calendar Header Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0082ff]"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Journal Execution Heatmap
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#0082ff]/10 text-[#0082ff] border border-[#0082ff]/20 text-[10px] font-mono font-bold">
                P/L Calendar View
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <CalendarIcon size={24} className="text-[#0082ff]" />
              <span>Trading Calendar & Session Logs</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Visual session heatmap combining your journal notes, trade tickets, and realized P/L density. Click any day cell to inspect notes or pin new reflections.
            </p>
          </div>

          {/* Controls: 1-Click Importer & Month Selector */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsImporterOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0082ff] hover:bg-[#0070df] text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Import MT4/MT5 statement or Broker CSV"
            >
              <UploadCloud size={15} />
              <span>Import Broker CSV</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={handleJumpToCurrentMonth}
                className="px-3 py-1 rounded-lg bg-white dark:bg-[#162032] text-xs font-mono font-black text-slate-900 dark:text-white shadow-2xs hover:border-[#0082ff]/50 transition-all cursor-pointer"
                title="Click to jump to Current Month"
              >
                {monthName}
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Performance Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Month Realized P/L</span>
            <span
              className={`font-black text-base sm:text-lg ${
                monthStats.monthPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {monthStats.monthPnl >= 0 ? '+' : ''}${monthStats.monthPnl.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Trading Days</span>
            <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
              {monthStats.activeDays} Days
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Day Win Rate</span>
            <span className="font-black text-base sm:text-lg text-[#0082ff]">
              {monthStats.winRate}%
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Win / Loss Days</span>
            <div className="font-black text-base sm:text-lg mt-0.5 space-x-1">
              <span className="text-emerald-600 dark:text-emerald-400">{monthStats.winningDays}W</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-rose-600 dark:text-rose-400">{monthStats.losingDays}L</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Journal Notes</span>
            <span className="font-black text-base sm:text-lg text-[#e07a5f]">
              {monthStats.totalNotesThisMonth} Notes
            </span>
          </div>
        </div>

        {/* Days of Week Header (Mon - Fri) */}
        <div className="grid grid-cols-5 gap-2 mb-2 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <div>Monday</div>
          <div>Tuesday</div>
          <div>Wednesday</div>
          <div>Thursday</div>
          <div>Friday</div>
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          {calendarCells.map(cell => {
            const hasNotes = cell.notes.length > 0;
            const hasTrades = cell.trades.length > 0;
            const hasActivity = hasNotes || hasTrades;
            const isWin = cell.hasPnl ? cell.netPnl > 0.01 : cell.primaryOutcome === 'win';
            const isLoss = cell.hasPnl ? cell.netPnl < -0.01 : cell.primaryOutcome === 'loss';
            const isScratch = cell.primaryOutcome === 'scratch' || (cell.hasPnl && Math.abs(cell.netPnl) <= 0.01);

            return (
              <div
                key={cell.dateKey}
                onClick={() => handleSelectCell(cell)}
                className={`min-h-[92px] sm:min-h-[110px] p-2.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none relative cursor-pointer group ${
                  !cell.isCurrentMonth
                    ? 'opacity-35 bg-slate-50/50 dark:bg-[#0e1422]/50 border-slate-200/50 dark:border-slate-800/50 hover:opacity-70'
                    : hasActivity
                    ? isWin
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/35 border-emerald-500/40 dark:border-emerald-500/30 hover:border-emerald-500 hover:shadow-md hover:scale-[1.02]'
                      : isLoss
                      ? 'bg-rose-500/10 dark:bg-rose-950/35 border-rose-500/40 dark:border-rose-500/30 hover:border-rose-500 hover:shadow-md hover:scale-[1.02]'
                      : 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/40 dark:border-amber-500/30 hover:border-amber-500 hover:shadow-md hover:scale-[1.02]'
                    : 'bg-slate-50/70 dark:bg-[#0e1422]/60 border-slate-200/70 dark:border-slate-800/70 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-[#121927]'
                }`}
              >
                {/* Top Row: Date Number and Badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold ${
                      cell.isCurrentMonth
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Sticky Note Badge */}
                    {hasNotes && (
                      <span
                        className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#e07a5f]/20 text-[#e07a5f] border border-[#e07a5f]/30 flex items-center gap-0.5"
                        title={`${cell.notes.length} Journal Sticky Note(s)`}
                      >
                        <StickyNote size={9} />
                        <span>{cell.notes.length}</span>
                      </span>
                    )}

                    {/* Trade Count Badge */}
                    {hasTrades && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                          isWin
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : isLoss
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                        title={`${cell.trades.length} Executed MT5 Trade(s)`}
                      >
                        {cell.trades.length}T
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Net Realized P/L */}
                {hasActivity ? (
                  <div className="my-1">
                    {cell.hasPnl ? (
                      <div
                        className={`text-sm sm:text-base font-mono font-black tracking-tight ${
                          isWin
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isLoss
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cell.netPnl > 0 ? '+' : ''}${cell.netPnl.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">
                        {cell.primaryOutcome || 'Note Logged'}
                      </div>
                    )}

                    {/* Win/Loss small counter or Note title preview */}
                    <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {cell.hasPnl && (cell.winCount > 0 || cell.lossCount > 0) ? (
                        <>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{cell.winCount}W</span>
                          <span>·</span>
                          <span className="text-rose-600 dark:text-rose-400 font-bold">{cell.lossCount}L</span>
                        </>
                      ) : cell.notes.length > 0 ? (
                        <span className="truncate italic">
                          {cell.notes[0].title || cell.notes[0].sessionTag || 'Journal Entry'}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="my-auto text-center">
                    <span className="text-[10px] font-mono text-slate-300 dark:text-slate-700 group-hover:text-slate-400 select-none">
                      + Add Note
                    </span>
                  </div>
                )}

                {/* Bottom Prompt */}
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-[#0082ff] transition-colors">
                  <span>{hasActivity ? 'Audit Session' : 'Blank Day'}</span>
                  <span>&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Session Detail Modal */}
      {selectedDayModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0082ff]/15 text-[#0082ff] flex items-center justify-center">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                      Session Journal Audit
                    </span>
                    <span className="font-mono text-xs text-slate-500">· {selectedDayModal.dateStr}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase font-sans">
                    {new Date(selectedDayModal.dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayModal(prev => ({ ...prev, isOpen: false }))}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Daily Summary Strip */}
            <div className="grid grid-cols-3 gap-2.5 p-4 bg-slate-50 dark:bg-[#0c101a] border-b border-slate-200 dark:border-slate-800 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Day Net P/L</span>
                <span
                  className={`font-black text-base ${
                    selectedDayModal.netPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {selectedDayModal.netPnl >= 0 ? '+' : ''}${selectedDayModal.netPnl.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Journal Notes</span>
                <span className="font-black text-base text-[#e07a5f]">
                  {selectedDayModal.notes.length} Sticky Notes
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Executed Trades</span>
                <span className="font-black text-base text-[#0082ff]">
                  {selectedDayModal.trades.length} Tickets
                </span>
              </div>
            </div>

            {/* Modal Body: Sticky Notes & Trades */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Journal Notes Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <StickyNote size={14} className="text-[#e07a5f]" />
                    <span>Journal Sticky Notes ({selectedDayModal.notes.length})</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDayModal(prev => ({ ...prev, isOpen: false }));
                      onOpenNewNoteForDate(selectedDayModal.dateStr, selectedDayModal.dayLabel);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e07a5f] hover:bg-[#c96a50] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Plus size={13} />
                    <span>Pin Note for this Day</span>
                  </button>
                </div>

                {selectedDayModal.notes.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    No sticky notes logged for this session date yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayModal.notes.map(note => (
                      <div
                        key={note.id}
                        className="p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/70 dark:bg-[#1f1910] text-slate-900 dark:text-amber-100 shadow-xs relative"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{note.mentalEmoji || '🧘'}</span>
                            <span className="font-bold text-xs">{note.title || 'Untitled Session Note'}</span>
                            {note.sessionTag && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-bold">
                                {note.sessionTag}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {note.pnl !== undefined && (
                              <span
                                className={`text-xs font-mono font-black ${
                                  note.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {note.pnl >= 0 ? '+' : ''}${note.pnl.toFixed(2)}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDayModal(prev => ({ ...prev, isOpen: false }));
                                onEditNote(note);
                              }}
                              className="p-1 rounded-md hover:bg-amber-200/50 dark:hover:bg-amber-800/50 text-slate-500 cursor-pointer"
                              title="Edit Note"
                            >
                              <Edit3 size={13} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs whitespace-pre-wrap leading-relaxed">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trade Tickets Section (if trades exist) */}
              {selectedDayModal.trades.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-3">
                    <Layers size={14} className="text-[#0082ff]" />
                    <span>Closed Trade Tickets ({selectedDayModal.trades.length})</span>
                  </h4>

                  <div className="space-y-2.5">
                    {selectedDayModal.trades.map(trade => {
                      const netProfit = typeof trade.netProfit === 'number' && !isNaN(trade.netProfit) ? trade.netProfit : 0;
                      const isWin = netProfit > 0.01;
                      const isLoss = netProfit < -0.01;
                      const volume = typeof trade.volume === 'number' && !isNaN(trade.volume) ? trade.volume : 0.05;

                      return (
                        <div
                          key={trade.ticket}
                          className="p-3 rounded-2xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 font-mono text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">#{trade.ticket}</span>
                            <span className="text-slate-400">·</span>
                            <span className="font-bold text-[#0082ff]">{trade.symbol || 'XAUUSDm'}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                trade.type === 'buy'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {trade.type} {volume.toFixed(2)} lots
                            </span>
                            {trade.setupCategory && (
                              <span className="text-[10px] text-slate-400">({trade.setupCategory})</span>
                            )}
                          </div>

                          <div
                            className={`font-black ${
                              isWin
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isLoss
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {isWin ? '+' : ''}${netProfit.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c101a] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedDayModal(prev => ({ ...prev, isOpen: false }));
                  onOpenNewNoteForDate(selectedDayModal.dateStr, selectedDayModal.dayLabel);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e07a5f] hover:bg-[#c96a50] text-white text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Note for this Date</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDayModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-700 text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 1-Click CSV & Broker Statement Importer Modal */}
      <TradeImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportComplete={(_count, newTrades) => {
          setTrades(newTrades);
        }}
      />
    </div>
  );
};
