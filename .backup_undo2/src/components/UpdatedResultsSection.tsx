import React, { useState, useMemo } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { TradeVarianceItem, DailySession } from '../types';
import { DayEditModal } from './DayEditModal';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  Clock,
  Sparkles,
  Layers,
  Database,
  Calculator,
  RefreshCw,
  Edit3
} from 'lucide-react';

export const UpdatedResultsSection: React.FC = () => {
  const {
    quarters,
    updateDaySession,
    metrics,
    firestoreConnected
  } = useCockpit();

  // Selected session for trade entry
  const [selectedWeekId, setSelectedWeekId] = useState<string>('w01');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [actualInput, setActualInput] = useState<string>('12');
  const [notesInput, setNotesInput] = useState<string>('Target reached +$12.00 (planned was +$10.00). Clean London Open expansion on XAU/USD.');
  const [justUpdated, setJustUpdated] = useState<boolean>(false);
  const [editingDay, setEditingDay] = useState<{
    weekId: string;
    dayIndex: number;
    day: DailySession;
    weekNumber: string;
  } | null>(null);

  // Build flat list of all sessions for easy dropdown selection
  const allSessionsList = useMemo(() => {
    const list: {
      weekId: string;
      weekNum: string;
      dayIndex: number;
      session: DailySession;
      plannedNum: number;
    }[] = [];

    quarters.forEach(q => {
      q.months.forEach(m => {
        m.weeks.forEach(w => {
          w.days.forEach((d, dIdx) => {
            const clean = d.pnl.replace(/[^0-9.-]/g, '');
            const pVal = parseFloat(clean) || 0;
            list.push({
              weekId: w.id,
              weekNum: w.num,
              dayIndex: dIdx,
              session: d,
              plannedNum: pVal
            });
          });
        });
      });
    });

    return list;
  }, [quarters]);

  // Find currently selected session
  const currentSelection = useMemo(() => {
    return allSessionsList.find(
      s => s.weekId === selectedWeekId && s.dayIndex === selectedDayIndex
    ) || allSessionsList[0];
  }, [allSessionsList, selectedWeekId, selectedDayIndex]);

  // Compute variance for currently selected item based on user input
  const currentPlanned = currentSelection ? currentSelection.plannedNum : 700;
  const currentActual = parseFloat(actualInput) || 0;
  const currentDelta = currentActual - currentPlanned;
  const currentDeltaPct = currentPlanned !== 0 ? (currentDelta / Math.abs(currentPlanned)) * 100 : 0;

  // Gather all logged trades that have actual results or completed status
  const varianceLedger = useMemo(() => {
    const ledger: TradeVarianceItem[] = [];

    allSessionsList.forEach(item => {
      const { session, weekId, weekNum, dayIndex, plannedNum } = item;
      if (session.status === 'completed' || session.actualPnl !== undefined) {
        const actual = session.actualPnl !== undefined ? session.actualPnl : plannedNum;
        const delta = actual - plannedNum;
        const deltaPercent = plannedNum !== 0 ? (delta / Math.abs(plannedNum)) * 100 : 0;

        ledger.push({
          weekId,
          weekNum,
          dayIndex,
          dayName: session.day,
          protocol: session.proto,
          plannedPnlNum: plannedNum,
          actualPnlNum: actual,
          delta,
          deltaPercent,
          status: session.status || 'completed',
          notes: session.notes,
          updatedAt: session.completedAt
        });
      }
    });

    return ledger;
  }, [allSessionsList]);

  // Summary variance statistics
  const summaryVariance = useMemo(() => {
    let totalPlanned = 0;
    let totalActual = 0;

    varianceLedger.forEach(item => {
      totalPlanned += item.plannedPnlNum;
      totalActual += item.actualPnlNum;
    });

    const netDelta = totalActual - totalPlanned;
    const updatedProjectedEquity = metrics.targetRetained + netDelta;
    const updatedTotalNetWorth = metrics.targetTotal + netDelta;

    return {
      totalPlanned,
      totalActual,
      netDelta,
      updatedProjectedEquity,
      updatedTotalNetWorth
    };
  }, [varianceLedger, metrics]);

  // Handle submit of new trade result
  const handleRecordTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelection) return;

    const actualVal = parseFloat(actualInput);
    if (isNaN(actualVal)) return;

    updateDaySession(selectedWeekId, selectedDayIndex, {
      status: 'completed',
      actualPnl: actualVal,
      notes: notesInput.trim() || undefined,
      completedAt: new Date().toISOString()
    });

    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 2500);
  };

  // Demo helper: quickly load the example (e.g. Plan $700 -> Actual $800)
  const handleLoadExample = () => {
    setSelectedWeekId('w14');
    setSelectedDayIndex(0);
    setActualInput('800');
    setNotesInput('Plan was $625/$700 target, realized $800 clean extension (+100$ alpha).');
  };

  return (
    <section className="scandi-card p-5 sm:p-7 mb-8 transition-colors">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-amber-400"></span>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Plan vs. Actual Trade Results & Execution Variance
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log your actual closed trade. If the plan called for $700 and your result was $800, track the exact variance and updated capital projection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {firestoreConnected && (
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1">
              <Database size={11} />
              <span>Cloud DB Synced</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleLoadExample}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Load $700 plan vs $800 result example"
          >
            Example ($700 → $800)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Input Form (Balanced Dark Mode Surface) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <form onSubmit={handleRecordTrade} className="space-y-4 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <PlusCircle size={14} className="text-slate-900 dark:text-slate-200" />
                <span>Log New Actual Trade Result</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (currentSelection) {
                    setEditingDay({
                      weekId: currentSelection.weekId,
                      dayIndex: currentSelection.dayIndex,
                      day: currentSelection.session,
                      weekNumber: currentSelection.weekNum
                    });
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0082ff]/10 text-[#0082ff] dark:text-[#38a1ff] border border-[#0082ff]/30 text-xs font-semibold hover:bg-[#0082ff]/20 cursor-pointer transition-colors"
                title="Open comprehensive Day Editor modal"
              >
                <Edit3 size={11} />
                <span>Full Day Editor</span>
              </button>
            </div>

            {/* Select Target Session Dropdown (All 48 Weeks Grouped) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Select Execution Day (Anytime from 48-Week Plan)
              </label>
              <select
                value={`${selectedWeekId}_${selectedDayIndex}`}
                onChange={e => {
                  const [wId, dIdx] = e.target.value.split('_');
                  setSelectedWeekId(wId);
                  setSelectedDayIndex(parseInt(dIdx, 10));
                  const found = allSessionsList.find(s => s.weekId === wId && s.dayIndex === parseInt(dIdx, 10));
                  if (found) {
                    setActualInput(found.session.actualPnl !== undefined ? String(found.session.actualPnl) : String(found.plannedNum));
                  }
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-slate-900 dark:focus:border-slate-400 font-mono"
              >
                {allSessionsList.map(item => (
                  <option key={`${item.weekId}_${item.dayIndex}`} value={`${item.weekId}_${item.dayIndex}`}>
                    {item.weekNum} · {item.session.day} — {item.session.proto} ({item.session.pnl}) {item.session.status === 'completed' ? '✓' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Comparison Grid: Planned vs Actual Input */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100/70 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
              {/* Planned Target Display */}
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-0.5">
                  Planned Target
                </span>
                <div className="font-mono text-base font-extrabold text-slate-800 dark:text-slate-200">
                  {currentSelection ? currentSelection.session.pnl : '+$700.00'}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 block truncate">
                  {currentSelection ? currentSelection.session.end : ''}
                </span>
              </div>

              {/* Actual Realized Input */}
              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-0.5">
                  Actual Result ($)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={actualInput}
                    onChange={e => setActualInput(e.target.value)}
                    placeholder="800"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-6 pr-2.5 py-1 font-mono text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Real-time Variance Preview Banner */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              currentDelta >= 0
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                {currentDelta >= 0 ? <ArrowUpRight size={18} className="text-emerald-600 dark:text-emerald-400" /> : <ArrowDownRight size={18} className="text-rose-600 dark:text-rose-400" />}
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider">
                    {currentDelta >= 0 ? 'Outperformance Variance' : 'Drawdown Variance'}
                  </div>
                  <div className="font-mono text-xs font-black">
                    {currentDelta >= 0 ? `+${currentDelta.toFixed(2)}` : currentDelta.toFixed(2)} USD
                    <span className="ml-1 font-semibold text-[11px] opacity-80">
                      ({currentDeltaPct >= 0 ? `+${currentDeltaPct.toFixed(1)}%` : `${currentDeltaPct.toFixed(1)}%`})
                    </span>
                  </div>
                </div>
              </div>

              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-xs border border-slate-200 dark:border-slate-700">
                {currentDelta >= 0 ? 'Alpha' : 'Delta'}
              </span>
            </div>

            {/* Trade Journal / Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Execution Notes & Psychology Review
              </label>
              <textarea
                rows={2}
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                placeholder="e.g. Scalped London Open expansion, took profit at $800 instead of $700."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-slate-400 resize-none"
              />
            </div>

            {/* Action Button: Balanced dark styling (no harsh white sheet) */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#e07a5f] dark:hover:bg-[#d46b50] dark:text-white font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Save & Update Database</span>
                <CheckCircle2 size={15} />
              </button>
              {justUpdated && (
                <div className="text-center text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold mt-1.5 animate-fadeIn">
                  ✓ Result updated and stored in SQLite!
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Execution Variance Summary & Ledger */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Key Updated Totals Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                Logged Trades
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {varianceLedger.length}
              </div>
              <span className="text-[10px] text-slate-400">Recorded in DB</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                Net Variance
              </span>
              <div className={`font-mono text-xl sm:text-2xl font-black ${
                summaryVariance.netDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {summaryVariance.netDelta >= 0 ? `+$${summaryVariance.netDelta.toFixed(0)}` : `-$${Math.abs(summaryVariance.netDelta).toFixed(0)}`}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {summaryVariance.netDelta >= 0 ? 'Ahead of Schedule' : 'Controlled Buffer'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                Updated Net Worth
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                ${Math.round(summaryVariance.updatedTotalNetWorth).toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Projected Year 1</span>
            </div>
          </div>

          {/* Variance Ledger List */}
          <div className="bg-slate-50/50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock size={13} className="text-slate-500" />
                <span>Recent Plan vs. Actual Records</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {varianceLedger.length} Records
              </span>
            </div>

            {varianceLedger.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <p className="mb-2">No actual trade variances logged yet.</p>
                <button
                  type="button"
                  onClick={handleLoadExample}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Click to log an example (Plan $700 → Actual $800)
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {varianceLedger.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const found = allSessionsList.find(s => s.weekId === item.weekId && s.dayIndex === item.dayIndex);
                      setEditingDay({
                        weekId: item.weekId,
                        dayIndex: item.dayIndex,
                        day: found ? found.session : {
                          day: item.dayName,
                          proto: item.protocol,
                          pnl: `$${item.plannedPnlNum.toFixed(2)}`,
                          end: '',
                          isLoss: item.actualPnlNum < 0,
                          actualPnl: item.actualPnlNum,
                          status: item.status,
                          notes: item.notes
                        },
                        weekNumber: item.weekNum
                      });
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between text-xs cursor-pointer hover:border-[#0082ff]/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all group"
                    title="Click to edit this recorded session anytime"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {item.weekNum} · {item.dayName}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] sm:max-w-xs">
                          {item.protocol}
                        </span>
                      </div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-400 italic truncate max-w-[200px] sm:max-w-md">
                          "{item.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-right shrink-0">
                      <div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400 line-through text-[11px]">
                            ${item.plannedPnlNum}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            ${item.actualPnlNum}
                          </span>
                          <span className={`text-[11px] font-bold ${
                            item.delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            ({item.delta >= 0 ? `+${item.delta}` : item.delta})
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          ✓ Click to edit
                        </span>
                      </div>

                      <button
                        type="button"
                        className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-[#0082ff] group-hover:text-white transition-colors"
                        title="Edit session details"
                      >
                        <Edit3 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Explanatory footer */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calculator size={13} className="text-slate-500" />
              <span>Variance automatically recalculates working equity without altering original 48-week targets.</span>
            </span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Active Audit Mode</span>
          </div>
        </div>
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
    </section>
  );
};
