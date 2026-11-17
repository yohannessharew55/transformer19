import React, { useState, useMemo, useRef } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { WeeklyObjective, ObjectiveStatus } from '../types';
import { WeeklyObjectiveModal } from './WeeklyObjectiveModal';
import {
  Target,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Layers,
  Edit3,
  CheckSquare,
  Square,
  DollarSign,
  Sparkles,
  Zap,
  Bookmark,
  ChevronDown,
  FileDown
} from 'lucide-react';

export const WeeklyObjectivesSection: React.FC = () => {
  const {
    weeklyObjectives,
    updateWeeklyObjective,
    toggleObjectiveChecklist,
    quarters,
    getWeekBalance
  } = useCockpit();

  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingObjective, setEditingObjective] = useState<WeeklyObjective | null>(null);

  // Map each weekId to its live matrix sessions for live progress computation
  const liveWeekSessionsMap = useMemo(() => {
    const map = new Map<string, { completedCount: number; totalCount: number; actualTotalPnl: number; hasActualLogs: boolean }>();

    quarters.forEach(q => {
      q.months.forEach(m => {
        m.weeks.forEach(w => {
          let completed = 0;
          let actualSum = 0;
          let hasActualLogs = false;
          w.days.forEach(d => {
            if (d.actualPnl !== undefined) {
              completed++;
              hasActualLogs = true;
              actualSum += d.actualPnl;
            } else if (d.status === 'completed') {
              completed++;
            }
          });
          map.set(w.id, {
            completedCount: completed,
            totalCount: w.days.length,
            actualTotalPnl: actualSum,
            hasActualLogs
          });
        });
      });
    });

    return map;
  }, [quarters]);

  // Overall Statistics across all 48 weeks
  const stats = useMemo(() => {
    const totalWeeks = weeklyObjectives.length;
    const achievedWeeks = weeklyObjectives.filter(w => w.status === 'achieved').length;
    const inProgressWeeks = weeklyObjectives.filter(w => w.status === 'in_progress').length;
    const achievedPercent = totalWeeks > 0 ? Math.round((achievedWeeks / totalWeeks) * 100) : 0;

    let totalPlannedTarget = 0;
    weeklyObjectives.forEach(w => {
      totalPlannedTarget += w.customTargetPnl !== undefined ? w.customTargetPnl : w.plannedTargetPnl;
    });

    return {
      totalWeeks,
      achievedWeeks,
      inProgressWeeks,
      achievedPercent,
      totalPlannedTarget
    };
  }, [weeklyObjectives]);

  // Filtered objectives list
  const filteredObjectives = useMemo(() => {
    return weeklyObjectives.filter(item => {
      // Quarter filter
      if (selectedQuarterFilter !== 'all') {
        const targetQ =
          selectedQuarterFilter === 'q1' ? 'quarter-1' :
          selectedQuarterFilter === 'q2' ? 'quarter-2' :
          selectedQuarterFilter === 'q3' ? 'quarter-3' :
          selectedQuarterFilter === 'q4' ? 'quarter-4' : selectedQuarterFilter;

        const matches =
          item.quarterId === targetQ ||
          item.quarterId.includes(selectedQuarterFilter) ||
          item.quarterId.includes(targetQ) ||
          item.quarterId.endsWith(selectedQuarterFilter.replace('q', ''));

        if (!matches) return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inNum = item.weekNum.toLowerCase().includes(q);
        const inObjective = item.primaryObjective.toLowerCase().includes(q);
        const inTactical = item.tacticalNotes.toLowerCase().includes(q);
        const inLot = item.lotSize.toLowerCase().includes(q);
        const inDrill = item.drillFocus.toLowerCase().includes(q);
        return inNum || inObjective || inTactical || inLot || inDrill;
      }

      return true;
    });
  }, [weeklyObjectives, selectedQuarterFilter, selectedStatusFilter, searchQuery]);

  const getStatusBadge = (status: ObjectiveStatus) => {
    switch (status) {
      case 'achieved':
        return {
          label: 'Achieved ✓',
          classes: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          classes: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/60 font-extrabold'
        };
      case 'partially_met':
        return {
          label: 'Partially Met',
          classes: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60'
        };
      case 'missed':
        return {
          label: 'Missed / Demoted',
          classes: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/60'
        };
      default:
        return {
          label: 'Upcoming',
          classes: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        };
    }
  };

  const handleQuickStatusChange = (weekId: string, newStatus: ObjectiveStatus) => {
    updateWeeklyObjective(weekId, {
      status: newStatus,
      achievedAt: newStatus === 'achieved' ? new Date().toISOString() : undefined
    });
  };

  const jumpToActiveWeek = () => {
    const active = weeklyObjectives.find(w => w.status === 'in_progress') || weeklyObjectives[0];
    if (active) {
      const element = document.getElementById(`week-card-${active.weekId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <section className="mb-10 text-slate-900 dark:text-white scroll-mt-20" id="weekly-execution-objectives">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0082ff]"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              48-Week Execution Roadmap
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-mono font-bold">
              Custom Objectives Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Target size={22} className="text-[#0082ff]" />
            <span>Weekly Execution Objectives</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Set, customize, and track specific execution targets, custom dollar quotas, and tactical milestones for each of the 48 weeks.
          </p>
        </div>

        {/* Quick Actions: Export as PDF & Jump to Active Week */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#121927] hover:border-[#0082ff]/50 hover:text-[#0082ff] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 group"
            title="Export Weekly Objectives Blueprint as PDF"
          >
            <FileDown size={14} className="text-[#0082ff] group-hover:translate-y-0.5 transition-transform" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={jumpToActiveWeek}
            className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0082ff] hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Zap size={13} className="text-amber-500" />
            <span>Jump to Active</span>
          </button>
        </div>
      </div>

      {/* Overview KPI Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
            Roadmap Completion
          </span>
          <div className="text-base sm:text-xl font-mono font-black text-slate-900 dark:text-white">
            {stats.achievedWeeks} / {stats.totalWeeks} Weeks
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.achievedPercent}%` }}
            />
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-1 block">
            {stats.achievedPercent}% achieved
          </span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
            Active In Progress
          </span>
          <div className="text-base sm:text-xl font-mono font-black text-[#0082ff]">
            {stats.inProgressWeeks} Active
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-1 block">
            Current execution focus
          </span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
            Total Capital Target
          </span>
          <div className="text-base sm:text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
            ${stats.totalPlannedTarget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-1 block">
            Sum of 48 week targets
          </span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
            Remaining Weeks
          </span>
          <div className="text-base sm:text-xl font-mono font-black text-slate-700 dark:text-slate-300">
            {stats.totalWeeks - stats.achievedWeeks} Weeks
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-1 block">
            Ahead on roadmap path
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs mb-6 space-y-3">
        {/* Top row: Quarter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quarter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedQuarterFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuarterFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All 48 Weeks
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuarterFilter('q1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuarterFilter === 'q1'
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Q1: Foundation (W01–W12)
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuarterFilter('q2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuarterFilter === 'q2'
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Q2: Acceleration (W13–W24)
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuarterFilter('q3')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuarterFilter === 'q3'
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Q3: Scale (W25–W36)
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuarterFilter('q4')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedQuarterFilter === 'q4'
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Q4: Mastery (W37–W48)
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[200px] sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search week, target, lot..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#0082ff]"
            />
          </div>
        </div>

        {/* Bottom row: Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Status:</span>
          {['all', 'in_progress', 'achieved', 'upcoming', 'missed'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                selectedStatusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff] font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 48 Weekly Objective Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredObjectives.map(item => {
          const live = liveWeekSessionsMap.get(item.weekId) || {
            completedCount: 0,
            totalCount: 5,
            actualTotalPnl: 0,
            hasActualLogs: false
          };
          const weekCalc = getWeekBalance(item.weekId);
          const badge = getStatusBadge(item.status);
          const completedChecklistCount = item.checklist.filter(c => c.completed).length;
          const targetValue = item.customTargetPnl !== undefined ? item.customTargetPnl : item.plannedTargetPnl;
          const isTargetReached = live.actualTotalPnl >= targetValue;

          return (
            <div
              key={item.weekId}
              id={`week-card-${item.weekId}`}
              className={`rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                item.status === 'in_progress'
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/80 ring-1 ring-blue-500/20'
                  : item.status === 'achieved'
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-white dark:bg-[#121927] border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header: Week number & Status Badge */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {item.weekNum}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                        {item.lotSize}
                      </span>
                      {weekCalc && weekCalc.displayHarvestSweep > 0 && (
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-500 dark:text-orange-400 text-[10px] select-none"
                          title={`Harvest Week: -${(weekCalc?.displayHarvestSweep ?? 0).toFixed(2)} Bank Sweep / Withdraw Target`}
                        >
                          🔒
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                      {item.drillFocus}
                    </span>
                  </div>

                  {/* Status Dropdown / Badge */}
                  <div className="relative group">
                    <button
                      type="button"
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1 ${badge.classes}`}
                      title="Click to change status"
                    >
                      <span>{badge.label}</span>
                      <ChevronDown size={11} className="opacity-70" />
                    </button>

                    {/* Quick status dropdown on hover / click */}
                    <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-700 p-1 shadow-xl z-20 hidden group-hover:block animate-fadeIn text-xs">
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(item.weekId, 'in_progress')}
                        className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-blue-600 dark:text-blue-400 cursor-pointer"
                      >
                        ● In Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(item.weekId, 'achieved')}
                        className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      >
                        ✓ Achieved
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(item.weekId, 'upcoming')}
                        className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-600 dark:text-slate-400 cursor-pointer"
                      >
                        ○ Upcoming
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(item.weekId, 'missed')}
                        className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-rose-600 dark:text-rose-400 cursor-pointer"
                      >
                        ✕ Missed
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Goal Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/80 dark:border-slate-800 mb-3 text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-[#0082ff] mb-1">
                    <Target size={12} />
                    <span>Primary Execution Objective</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {item.primaryObjective}
                  </p>
                </div>

                {/* Capital Progression: Start Balance -> Ending Balance -> Next Week Start */}
                <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#141b29] border border-slate-200/60 dark:border-slate-800 mb-3 text-[11px] font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Week Start Base:</span>
                    <strong className="text-slate-900 dark:text-white">
                      ${(weekCalc?.displayStartBalance ?? 50).toFixed(2)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Weekly Target Gain:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      +${(targetValue ?? 0).toFixed(2)}
                    </strong>
                  </div>
                  {weekCalc && weekCalc.displayHarvestSweep > 0 && (
                    <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
                      <span>Withdraw Target (Bank Sweep):</span>
                      <strong className="text-orange-500 dark:text-orange-400 font-bold">-${(weekCalc?.displayHarvestSweep ?? 0).toFixed(2)}</strong>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Balance Progression:</span>
                    <strong className="text-slate-900 dark:text-slate-100">
                      ${(weekCalc?.displayStartBalance ?? 50).toFixed(2)} → ${(weekCalc?.displayGrossPeak ?? 50).toFixed(2)}
                    </strong>
                  </div>
                  <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Next Week Starting Base:</span>
                    <strong className="text-[#0082ff] font-bold">
                      ${(weekCalc?.displayNextWeekStart ?? 0).toFixed(2)}
                    </strong>
                  </div>
                </div>

                {/* Daily Matrix Progress Indicator */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                    <span>Daily Sessions Completed</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {live.completedCount} / {live.totalCount} ({Math.round((live.completedCount / live.totalCount) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#0082ff] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((live.completedCount / live.totalCount) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Tactical Milestones Checklist */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase mb-1">
                    <span>Milestones Checklist</span>
                    <span>{completedChecklistCount}/{item.checklist.length}</span>
                  </div>

                  {item.checklist.slice(0, 3).map(check => (
                    <button
                      key={check.id}
                      type="button"
                      onClick={() => toggleObjectiveChecklist(item.weekId, check.id)}
                      className="w-full flex items-start gap-2 text-left cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      {check.completed ? (
                        <CheckSquare size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-[11px] leading-tight ${
                        check.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {check.text}
                      </span>
                    </button>
                  ))}

                  {item.checklist.length > 3 && (
                    <span className="text-[10px] font-mono text-slate-400 block text-right">
                      +{item.checklist.length - 3} more in editor
                    </span>
                  )}
                </div>

                {/* Debrief reflection if present */}
                {item.debriefNotes && (
                  <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 italic mb-3">
                    "{item.debriefNotes}"
                  </div>
                )}
              </div>

              {/* Card Footer Action */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setEditingObjective(item)}
                  className="flex items-center gap-1 text-xs font-mono font-bold text-[#0082ff] hover:underline cursor-pointer"
                >
                  <Edit3 size={12} />
                  <span>Edit Target & Checklist</span>
                </button>

                {item.status !== 'achieved' ? (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(item.weekId, 'achieved')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Mark Achieved ✓
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 size={12} />
                    <span>Goal Met</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Objective Edit Modal */}
      {editingObjective && (
        <WeeklyObjectiveModal
          isOpen={Boolean(editingObjective)}
          onClose={() => setEditingObjective(null)}
          objective={editingObjective}
        />
      )}
    </section>
  );
};
