import React, { useState } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { DailySession } from '../types';
import { DayEditModal } from './DayEditModal';
import {
  ChevronDown,
  Search,
  CheckCircle,
  Circle,
  Edit3,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  CheckSquare,
  Database,
  Printer,
  FileDown
} from 'lucide-react';

export const QuarterMatrix: React.FC = () => {
  const {
    quarters,
    selectedQuarter,
    setSelectedQuarter,
    expandedMonths,
    toggleMonth,
    expandedWeeks,
    toggleWeek,
    expandAll,
    collapseAll,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    toggleDayCompletion,
    batchMarkWeek,
    firestoreConnected,
    getWeekBalance
  } = useCockpit();

  const [editingDay, setEditingDay] = useState<{
    weekId: string;
    dayIndex: number;
    day: DailySession;
    weekNumber: string;
  } | null>(null);

  const filteredQuarters = quarters.filter(q => {
    if (selectedQuarter === 'all') return true;
    return q.id === selectedQuarter;
  });

  return (
    <div id="quarter-matrix-section" className="mb-12 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-4 bg-slate-900 dark:bg-amber-400 rounded-full"></span>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            Execution Hierarchy [Quarter → Month → Week (Touch for Days)]
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={expandAll}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151e2e] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151e2e] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Collapse All
          </button>
          <button
            type="button"
            onClick={() => {
              expandAll();
              setTimeout(() => window.print(), 250);
            }}
            className="px-3.5 py-1.5 rounded-full border border-[#0082ff]/40 bg-[#0082ff]/10 text-[#0082ff] dark:text-[#38a1ff] font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5 hover:bg-[#0082ff]/20 active:scale-95 group"
            title="Export 48-Week Execution Blueprint to PDF"
          >
            <FileDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            <span>Export as PDF</span>
          </button>
        </div>
      </div>

      {/* Quarter Swipable Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {quarters.map(q => {
          const isActive = selectedQuarter === q.id;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setSelectedQuarter(q.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white shadow-sm'
                  : 'bg-white dark:bg-[#151e2e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{q.name}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setSelectedQuarter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            selectedQuarter === 'all'
              ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white shadow-sm'
              : 'bg-white dark:bg-[#151e2e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All 48 Weeks Matrix
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="scandi-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search setups (e.g. DALE, London, NY, 2-loss stop, Harvest, 5.00 lots)..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-full pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-slate-900 dark:focus:border-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 shrink-0 text-xs">
          <span className="text-[11px] text-slate-500 hidden md:inline mr-1 font-semibold">Filter:</span>
          {(['all', 'completed', 'pending', 'harvest'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all cursor-pointer ${
                filterStatus === f
                  ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f === 'harvest' ? 'Bank Sweeps' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Quarters Rendering */}
      <div className="space-y-6">
        {filteredQuarters.map(quarter => (
          <div key={quarter.id} className="space-y-4">
            {selectedQuarter === 'all' && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-200 tracking-wide">{quarter.name}</span>
                <span className="text-xs text-slate-500">{quarter.subtitle}</span>
              </div>
            )}

            {/* Months in this Quarter */}
            {quarter.months.map(month => {
              const isMonthOpen = expandedMonths.has(month.id);

              const matchingWeeks = month.weeks.filter(week => {
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  const matchesWeek =
                    week.num.toLowerCase().includes(q) ||
                    week.lot.toLowerCase().includes(q) ||
                    week.drill.toLowerCase().includes(q);
                  const matchesDays = week.days.some(
                    d =>
                      d.proto.toLowerCase().includes(q) ||
                      d.day.toLowerCase().includes(q) ||
                      (d.date && d.date.toLowerCase().includes(q)) ||
                      d.pnl.toLowerCase().includes(q) ||
                      (d.notes && d.notes.toLowerCase().includes(q))
                  );
                  if (!matchesWeek && !matchesDays) return false;
                }

                if (filterStatus === 'harvest') {
                  return week.isExtract || week.days.some(d => d.isExtractRow);
                }
                if (filterStatus === 'completed') {
                  return week.days.some(d => d.status === 'completed');
                }
                if (filterStatus === 'pending') {
                  return week.days.some(d => d.status !== 'completed');
                }

                return true;
              });

              if (matchingWeeks.length === 0 && searchQuery.trim()) {
                return null;
              }

              return (
                <div
                  key={month.id}
                  className="scandi-card overflow-hidden shadow-xs transition-all"
                >
                  {/* Month Accordion Header */}
                  <div
                    onClick={() => toggleMonth(month.id)}
                    className="p-4 sm:p-5 bg-white dark:bg-[#121927] border-b border-slate-200 dark:border-slate-800 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                          {month.monthNum}
                        </span>
                        <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                          {month.name}
                        </div>
                      </div>

                      <div className="sm:hidden text-slate-400">
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${
                            isMonthOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Month Target Metrics Bar */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-7 text-xs bg-slate-50 dark:bg-slate-950/70 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-200 dark:border-slate-800">
                      <div className="text-center sm:text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Opening</div>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {month.opening}
                        </div>
                      </div>

                      <div className="text-center sm:text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">20% Bank Out</div>
                        <div className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
                          {month.bankOut}
                        </div>
                      </div>

                      <div className="text-center sm:text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">End Target</div>
                        <div className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                          {month.endTarget}
                        </div>
                      </div>

                      <div className="hidden sm:block text-slate-400 ml-2">
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${
                            isMonthOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Month Body: Weeks */}
                  {isMonthOpen && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {matchingWeeks.map(week => {
                        const isWeekExpanded = expandedWeeks.has(week.id);
                        const completedDaysCount = week.days.filter(d => d.status === 'completed').length;
                        const isWeekFullyCompleted = completedDaysCount === week.days.length;
                        const weekCalc = getWeekBalance(week.id);

                        return (
                          <div
                            key={week.id}
                            className="bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                          >
                            {/* Week Touch Block */}
                            <div
                              onClick={() => toggleWeek(week.id)}
                              className="p-3.5 sm:p-4 cursor-pointer flex flex-col gap-2.5 select-none"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                                    {week.num}
                                  </span>
                                  <span className="font-mono text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {week.lot}
                                  </span>
                                  {isWeekFullyCompleted && (
                                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                                      ✓ Complete
                                    </span>
                                  )}
                                  {week.isExtract && (
                                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1 font-bold">
                                      🔒 Vault Sweep Week
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full transition-all ${
                                      isWeekExpanded
                                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                    }`}
                                  >
                                    {isWeekExpanded ? 'Close Plan ▴' : 'Touch for Daily Plan ▾'}
                                  </span>
                                </div>
                              </div>

                              {/* Week Quick Stats Grid with Real Harvest Deduction for Next Week */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                                    {week.isExtract ? '20% Offline Vault Sweep:' : 'Weekly Net Gain:'}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`font-mono font-bold ${
                                        week.isExtract
                                          ? 'text-amber-600 dark:text-amber-400'
                                          : 'text-emerald-600 dark:text-emerald-400'
                                      }`}
                                    >
                                      {week.isExtract
                                        ? `-$${weekCalc ? weekCalc.displayHarvestSweep.toFixed(2) : '50.00'} Sweep`
                                        : (weekCalc && weekCalc.hasActualLogs
                                            ? `${weekCalc.actualTradingGain >= 0 ? '+' : ''}$${weekCalc.actualTradingGain.toFixed(2)}`
                                            : week.net)}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                                    {week.isExtract ? 'Closing Working Balance:' : 'Balance Path:'}
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                    {weekCalc ? weekCalc.balancePathText : week.bal}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                                    Next Week Starting Balance:
                                  </span>
                                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                                    <span>${weekCalc ? weekCalc.actualNextWeekStart.toFixed(2) : '0.00'}</span>
                                    {weekCalc && weekCalc.displayHarvestSweep > 0 && (
                                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-normal">
                                        (Deducted -${weekCalc.displayHarvestSweep.toFixed(0)} sweep)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Dropdown: Daily Drill-Down Sessions */}
                            {isWeekExpanded && (
                              <div className="p-3.5 sm:p-5 bg-slate-50/80 dark:bg-slate-950 border-t border-dashed border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-3 text-xs">
                                  <div className="font-mono text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Database size={12} className="text-slate-400" />
                                    <span>{week.drill}</span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      batchMarkWeek(week.id, !isWeekFullyCompleted);
                                    }}
                                    className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                  >
                                    {isWeekFullyCompleted ? 'Reset Week' : 'Mark All Completed'}
                                  </button>
                                </div>

                                {/* Sessions List Header Hint */}
                                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1 px-1">
                                  <span>Daily Execution Breakdown</span>
                                  <span className="text-[#0082ff] font-semibold text-[10px]">● Click any day to edit anytime</span>
                                </div>

                                {/* Sessions List */}
                                <div className="space-y-2">
                                  {week.days.map((session, dayIdx) => {
                                    const isCompleted = session.status === 'completed';
                                    const daySnapshot = weekCalc?.days[dayIdx];

                                    let pnlColor = 'text-emerald-600 dark:text-emerald-400';
                                    if (session.isExtractRow) {
                                      pnlColor = 'text-amber-600 dark:text-amber-400 font-bold';
                                    } else if (session.isLoss) {
                                      pnlColor = 'text-rose-600 dark:text-rose-400 font-bold';
                                    } else if (session.pnl === '$0.00') {
                                      pnlColor = 'text-slate-400';
                                    }

                                    return (
                                      <div
                                        key={dayIdx}
                                        onClick={() => {
                                          setEditingDay({
                                            weekId: week.id,
                                            dayIndex: dayIdx,
                                            day: session,
                                            weekNumber: week.num
                                          });
                                        }}
                                        className={`group rounded-xl border p-3 flex items-center justify-between gap-3 transition-all cursor-pointer hover:shadow-md hover:border-[#0082ff]/60 active:scale-[0.99] ${
                                          session.isExtractRow
                                            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 hover:bg-amber-100/60 dark:hover:bg-amber-900/30'
                                            : isCompleted
                                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30'
                                            : 'bg-white dark:bg-[#151e2e] border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-[#192437]'
                                        }`}
                                        title="Click to edit session details, planned target, or actual results anytime"
                                      >
                                        {/* Left: Checkbox & Session Details */}
                                        <div className="flex items-center gap-3 min-w-0">
                                          <button
                                            type="button"
                                            onClick={e => {
                                              e.stopPropagation();
                                              toggleDayCompletion(week.id, dayIdx);
                                            }}
                                            className="shrink-0 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                            title="Toggle completion status (updates SQLite & Cloud)"
                                          >
                                            {isCompleted ? (
                                              <CheckCircle size={19} className="text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
                                            ) : (
                                              <Circle size={19} className="text-slate-300 dark:text-slate-600" />
                                            )}
                                          </button>

                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span
                                                className={`font-mono text-xs font-bold ${
                                                  session.isExtractRow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                                                }`}
                                              >
                                                {session.day}
                                              </span>
                                              {session.date && (
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0082ff] dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1 shrink-0">
                                                  <span>📅</span>
                                                  <span>{session.date}</span>
                                                </span>
                                              )}
                                              {session.actualPnl !== undefined && (
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
                                                  Actual: ${session.actualPnl > 0 ? `+${session.actualPnl}` : session.actualPnl}
                                                </span>
                                              )}
                                              {session.isExtractRow && (
                                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                                                  Deducted for Next Week
                                                </span>
                                              )}
                                              {session.notes && (
                                                <span className="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-xs italic">
                                                  "{session.notes}"
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                              {session.proto}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Right: Target PnL & Dynamic Running Balance */}
                                        <div className="flex items-center gap-2.5 shrink-0 text-right">
                                          <div>
                                            <div className={`font-mono text-xs font-extrabold ${pnlColor}`}>
                                              {session.isExtractRow
                                                ? (session.actualPnl !== undefined
                                                    ? `-$${Math.abs(session.actualPnl).toFixed(2)} Sweep`
                                                    : session.pnl)
                                                : (session.actualPnl !== undefined
                                                    ? `${session.actualPnl >= 0 ? '+' : ''}$${session.actualPnl.toFixed(2)}`
                                                    : session.pnl)}
                                            </div>
                                            <div className="font-mono text-[10px] text-slate-400 font-medium">
                                              {daySnapshot
                                                ? (session.isExtractRow
                                                    ? `Next Week Start: $${daySnapshot.endBalance.toFixed(2)}`
                                                    : `End: $${daySnapshot.endBalance.toFixed(2)}`)
                                                : session.end}
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={e => {
                                              e.stopPropagation();
                                              setEditingDay({
                                                weekId: week.id,
                                                dayIndex: dayIdx,
                                                day: session,
                                                weekNumber: week.num
                                              });
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-[#0082ff] group-hover:text-white text-slate-600 dark:text-slate-400 cursor-pointer transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-mono text-[11px] font-bold"
                                            title="Edit session details, target, or actual PnL anytime"
                                          >
                                            <Edit3 size={12} />
                                            <span className="hidden sm:inline">Edit</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
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
