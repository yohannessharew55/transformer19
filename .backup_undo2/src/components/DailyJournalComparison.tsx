import React, { useState, useMemo } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { DailySession, DailyJournalNote, MentalStateLog } from '../types';
import { DayEditModal } from './DayEditModal';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  StickyNote,
  Edit3,
  Calendar,
  Layers,
  Database,
  Tag,
  AlertTriangle,
  Sparkles,
  Check,
  Scale,
  Plus
} from 'lucide-react';

interface DailyJournalComparisonProps {
  onOpenNewNote?: (preferredDayId?: string) => void;
}

export const DailyJournalComparison: React.FC<DailyJournalComparisonProps> = ({
  onOpenNewNote
}) => {
  const {
    quarters,
    journalNotes,
    mentalStateLogs,
    toggleDayCompletion,
    postgresConnected
  } = useCockpit();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'with_notes' | 'completed' | 'outperformed' | 'drawdowns'>('all');
  const [viewStyle, setViewStyle] = useState<'cards' | 'table'>('cards');
  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState<string>('all');

  const [editingDay, setEditingDay] = useState<{
    weekId: string;
    dayIndex: number;
    day: DailySession;
    weekNumber: string;
  } | null>(null);

  // Flatten all sessions across quarters with matched journal notes
  const combinedEntries = useMemo(() => {
    const entries: {
      quarterId: string;
      quarterName: string;
      weekId: string;
      weekNum: string;
      dayIndex: number;
      session: DailySession;
      dayId: string;
      dayLabel: string;
      plannedTarget: number;
      actualResult?: number;
      delta?: number;
      deltaPercent?: number;
      linkedNotes: DailyJournalNote[];
      mentalLog?: MentalStateLog;
      isOutperformed: boolean;
      isDrawdown: boolean;
    }[] = [];

    quarters.forEach(q => {
      q.months.forEach(m => {
        m.weeks.forEach(w => {
          w.days.forEach((d, dIdx) => {
            const dayId = `${w.id}_d${dIdx + 1}`;
            const cleaned = (d.pnl || '0').replace(/[^0-9.-]/g, '');
            const planned = parseFloat(cleaned) || 25.0;

            // Find all journal notes linked to this day
            const matchedNotes = journalNotes.filter(
              n => n.dayId === dayId || n.dayId === `${w.id}-d${dIdx + 1}`
            );

            // Find mental state log linked to this day
            const matchedMentalLog = mentalStateLogs.find(
              l => l.dayId === dayId || l.dayId === `${w.id}-d${dIdx + 1}`
            );

            // Determine actual PnL (from session actualPnl or note pnl)
            let actual: number | undefined = d.actualPnl;
            if (actual === undefined && matchedNotes.length > 0 && matchedNotes[0].pnl !== undefined) {
              actual = matchedNotes[0].pnl;
            }

            let delta: number | undefined = undefined;
            let deltaPercent: number | undefined = undefined;
            let isOutperformed = false;
            let isDrawdown = false;

            if (actual !== undefined) {
              delta = actual - planned;
              deltaPercent = planned !== 0 ? (delta / Math.abs(planned)) * 100 : 0;
              isOutperformed = delta > 0;
              isDrawdown = delta < 0 || d.isLoss || actual < 0;
            }

            entries.push({
              quarterId: q.id,
              quarterName: q.name,
              weekId: w.id,
              weekNum: w.num,
              dayIndex: dIdx,
              session: d,
              dayId,
              dayLabel: `${w.num} · ${d.day}`,
              plannedTarget: planned,
              actualResult: actual,
              delta,
              deltaPercent,
              linkedNotes: matchedNotes,
              mentalLog: matchedMentalLog,
              isOutperformed,
              isDrawdown
            });
          });
        });
      });
    });

    return entries;
  }, [quarters, journalNotes, mentalStateLogs]);

  // Filtered entries based on user selection
  const filteredEntries = useMemo(() => {
    return combinedEntries.filter(item => {
      // Quarter filter
      if (selectedQuarterFilter !== 'all' && item.quarterId !== selectedQuarterFilter) {
        return false;
      }

      // Status/Category filter
      if (filterMode === 'with_notes' && item.linkedNotes.length === 0 && !item.session.notes) {
        return false;
      }
      if (filterMode === 'completed' && item.session.status !== 'completed' && item.actualResult === undefined) {
        return false;
      }
      if (filterMode === 'outperformed' && !item.isOutperformed) {
        return false;
      }
      if (filterMode === 'drawdowns' && !item.isDrawdown) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inLabel = item.dayLabel.toLowerCase().includes(q);
        const inProto = item.session.proto.toLowerCase().includes(q);
        const inSessionNotes = (item.session.notes || '').toLowerCase().includes(q);
        const inJournal = item.linkedNotes.some(
          n => (n.title || '').toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
        );
        return inLabel || inProto || inSessionNotes || inJournal;
      }

      return true;
    });
  }, [combinedEntries, selectedQuarterFilter, filterMode, searchQuery]);

  // Aggregate stats for filtered items
  const stats = useMemo(() => {
    let totalPlanned = 0;
    let totalActual = 0;
    let recordedDays = 0;
    let totalNotes = 0;

    combinedEntries.forEach(item => {
      if (item.session.status === 'completed' || item.actualResult !== undefined) {
        totalPlanned += item.plannedTarget;
        totalActual += item.actualResult !== undefined ? item.actualResult : item.plannedTarget;
        recordedDays++;
      }
      totalNotes += item.linkedNotes.length;
    });

    const netVariance = totalActual - totalPlanned;
    const netVariancePct = totalPlanned > 0 ? (netVariance / totalPlanned) * 100 : 0;

    return {
      totalPlanned,
      totalActual,
      netVariance,
      netVariancePct,
      recordedDays,
      totalNotes
    };
  }, [combinedEntries]);

  return (
    <div className="mb-10">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0082ff]"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Forensic Execution Journal
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-mono font-bold">
              {postgresConnected ? 'SQLite Persistent' : 'Synced'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Scale size={22} className="text-[#0082ff]" />
            <span>Daily Journal · Plan vs. Actual Comparison</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Side-by-side audit of your master blueprint quotas vs. realized trading journal executions starting from Day 1.
          </p>
        </div>

        {/* View Style Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 rounded-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewStyle('cards')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewStyle === 'cards'
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cards View
            </button>
            <button
              type="button"
              onClick={() => setViewStyle('table')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewStyle === 'table'
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ledger Table
            </button>
          </div>
        </div>
      </div>

      {/* Top Comparative Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
            Planned Quota Harvest
          </span>
          <div className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white">
            ${stats.totalPlanned.toFixed(2)}
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Across {stats.recordedDays} active sessions
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
            Journaled Realized P&L
          </span>
          <div className="text-lg sm:text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
            ${stats.totalActual.toFixed(2)}
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Real feed harvest from Day 1
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
            Harvest Alpha Variance
          </span>
          <div className={`text-lg sm:text-xl font-mono font-black flex items-center gap-1 ${
            stats.netVariance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {stats.netVariance >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            <span>{stats.netVariance >= 0 ? `+${stats.netVariance.toFixed(2)}` : stats.netVariance.toFixed(2)}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            ({stats.netVariancePct >= 0 ? `+${stats.netVariancePct.toFixed(1)}%` : `${stats.netVariancePct.toFixed(1)}%`} yield)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
            Forensic Sticky Reflections
          </span>
          <div className="text-lg sm:text-xl font-mono font-black text-[#0082ff]">
            {stats.totalNotes} Logged
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Synchronized sticky reflections
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by day, setup protocol, or journal notes..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#0082ff]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white dark:bg-[#0082ff]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Days ({combinedEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('with_notes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'with_notes'
                ? 'bg-slate-900 text-white dark:bg-[#0082ff]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            With Journal Notes
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'completed'
                ? 'bg-slate-900 text-white dark:bg-[#0082ff]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completed Sessions
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('outperformed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'outperformed'
                ? 'bg-slate-900 text-white dark:bg-[#0082ff]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Target Exceeded
          </button>
        </div>
      </div>

      {/* Cards Comparison View */}
      {viewStyle === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.slice(0, 30).map(item => {
            const hasNotes = item.linkedNotes.length > 0 || item.session.notes;
            const isCompleted = item.session.status === 'completed';

            return (
              <div
                key={item.dayId}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121927] p-4 shadow-xs hover:border-[#0082ff]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Day Header Bar */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {item.dayLabel}
                      </span>
                      {item.mentalLog && (
                        <span
                          className="flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800"
                          title={`Logged Mindset: ${item.mentalLog.label} (${item.mentalLog.rating}/5)`}
                        >
                          <span>{item.mentalLog.emoji}</span>
                          <span>{item.mentalLog.rating}/5</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 size={10} />
                          <span>Completed</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDay({
                            weekId: item.weekId,
                            dayIndex: item.dayIndex,
                            day: item.session,
                            weekNumber: item.weekNum
                          });
                        }}
                        className="px-2 py-1 rounded-lg text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-[#0082ff] hover:text-white text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Edit day planned target, actual PnL, or protocol"
                      >
                        <Edit3 size={11} />
                        <span>Edit Day</span>
                      </button>
                    </div>
                  </div>

                  {/* Side-by-Side Comparison Box */}
                  <div className="grid grid-cols-2 gap-2.5 mb-3 text-xs">
                    {/* Planned Master Blueprint */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-200/80 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center justify-between mb-1">
                        <span>Planned Target</span>
                        <span className="text-slate-400 font-normal">Quota</span>
                      </div>
                      <div className="font-mono text-base font-extrabold text-slate-800 dark:text-slate-200">
                        {item.session.pnl}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.session.proto}
                      </div>
                    </div>

                    {/* Journaled Realized Execution */}
                    <div className={`p-3 rounded-xl border ${
                      item.actualResult !== undefined
                        ? item.actualResult >= item.plannedTarget
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80'
                          : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80'
                        : 'bg-slate-50/50 dark:bg-[#151d2a] border-slate-200/60 dark:border-slate-800'
                    }`}>
                      <div className="text-[10px] uppercase font-bold font-mono flex items-center justify-between mb-1">
                        <span className="text-slate-500 dark:text-slate-400">Actual Harvest</span>
                        {item.delta !== undefined && (
                          <span className={`font-mono font-bold ${
                            item.delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {item.delta >= 0 ? `+${item.delta.toFixed(2)}` : item.delta.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                        {item.actualResult !== undefined
                          ? `$${item.actualResult > 0 ? `+${item.actualResult.toFixed(2)}` : item.actualResult.toFixed(2)}`
                          : <span className="text-slate-400 text-xs font-normal">Not logged yet</span>}
                      </div>

                      <div className="text-[10px] font-mono mt-1">
                        {item.deltaPercent !== undefined ? (
                          <span className={`font-bold ${
                            item.deltaPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {item.deltaPercent >= 0 ? `+${item.deltaPercent.toFixed(1)}% Alpha` : `${item.deltaPercent.toFixed(1)}%`}
                          </span>
                        ) : (
                          <span className="text-slate-400">Pending session</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Journal Reflection Box */}
                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#151e2e] border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold mb-1">
                      <span className="flex items-center gap-1">
                        <StickyNote size={11} className="text-[#0082ff]" />
                        <span>Journal Reflection & Psychology</span>
                      </span>
                      {item.linkedNotes.length > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {item.linkedNotes.length} Note{item.linkedNotes.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Show primary note or session notes */}
                    {item.linkedNotes.length > 0 ? (
                      <div className="space-y-1.5 mt-1">
                        {item.linkedNotes.map(n => (
                          <div key={n.id} className="text-slate-700 dark:text-slate-300 italic text-[11px] leading-relaxed">
                            {n.title && <strong className="not-italic text-slate-900 dark:text-white block">{n.title}:</strong>}
                            "{n.content}"
                          </div>
                        ))}
                      </div>
                    ) : item.session.notes ? (
                      <div className="text-slate-700 dark:text-slate-300 italic text-[11px] leading-relaxed mt-1">
                        "{item.session.notes}"
                      </div>
                    ) : (
                      <div className="text-slate-400 text-[11px] italic mt-1">
                        No forensic reflection logged yet for this trading day.
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Quick Action */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => toggleDayCompletion(item.weekId, item.dayIndex)}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 size={12} className={isCompleted ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>{isCompleted ? 'Mark Pending' : 'Mark Complete'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenNewNote) {
                        onOpenNewNote(item.dayId);
                      }
                    }}
                    className="text-[11px] font-mono text-[#0082ff] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Plus size={11} />
                    <span>Log Sticky Note</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Ledger Table View */}
      {viewStyle === 'table' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121927] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Session / Day</th>
                  <th className="py-3 px-4">Setup Strategy</th>
                  <th className="py-3 px-4 text-right">Planned Target</th>
                  <th className="py-3 px-4 text-right">Actual Realized</th>
                  <th className="py-3 px-4 text-right">Harvest Alpha</th>
                  <th className="py-3 px-4">Journal & Psychology Notes</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {filteredEntries.slice(0, 40).map(item => {
                  return (
                    <tr
                      key={item.dayId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{item.dayLabel}</span>
                          {item.mentalLog && (
                            <span
                              className="text-xs"
                              title={`Mindset: ${item.mentalLog.label} (${item.mentalLog.rating}/5)`}
                            >
                              {item.mentalLog.emoji}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {item.session.proto}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {item.session.pnl}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {item.actualResult !== undefined ? `$${item.actualResult.toFixed(2)}` : '—'}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                        item.delta !== undefined
                          ? item.delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-400'
                      }`}>
                        {item.delta !== undefined ? (
                          <span>{item.delta >= 0 ? `+${item.delta.toFixed(2)}` : item.delta.toFixed(2)}</span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 text-xs max-w-sm">
                        {item.linkedNotes.length > 0 ? (
                          <div className="truncate text-slate-800 dark:text-slate-200 italic">
                            "{item.linkedNotes[0].content}"
                          </div>
                        ) : item.session.notes ? (
                          <div className="truncate italic">"{item.session.notes}"</div>
                        ) : (
                          <span className="text-slate-400 italic">No notes</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDay({
                              weekId: item.weekId,
                              dayIndex: item.dayIndex,
                              day: item.session,
                              weekNumber: item.weekNum
                            });
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#0082ff] hover:text-white text-slate-600 dark:text-slate-300 transition-colors"
                          title="Edit Day Session"
                        >
                          <Edit3 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
