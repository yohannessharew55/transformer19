import React, { useState, useMemo, useEffect } from 'react';
import { useCockpit } from '../context/CockpitContext';
import {
  TradingQuarter,
  TradingMonth,
  TradingWeek,
  DailySession
} from '../types';
import {
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  DollarSign,
  Calendar,
  Zap,
  Download,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const ManualPlanEditor: React.FC = () => {
  const {
    activeAccount,
    quarters,
    saveAccount,
    importPlanFromCsv,
    exportPlanToCsv
  } = useCockpit();

  // Local draft of the full 4-quarter roadmap for editing
  const [draftQuarters, setDraftQuarters] = useState<TradingQuarter[]>(() => {
    return JSON.parse(JSON.stringify(quarters));
  });

  // Navigation state within editor (defaults directly to Foundation)
  const [selectedQuarterId, setSelectedQuarterId] = useState<string>('quarter-1');
  const [selectedMonthId, setSelectedMonthId] = useState<string>('q1-m1');
  const [selectedWeekId, setSelectedWeekId] = useState<string>('w01');

  // Synchronize draft when active account or quarters change, locking directly onto Q1 Foundation
  useEffect(() => {
    setDraftQuarters(JSON.parse(JSON.stringify(quarters)));
    setSelectedQuarterId('quarter-1');
    setSelectedMonthId('q1-m1');
    setSelectedWeekId('w01');
  }, [activeAccount?.id, quarters]);

  // Feedback states
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Active Quarter, Month, and Week
  const activeQuarter = useMemo(() => {
    return draftQuarters.find(q => q.id === selectedQuarterId) || draftQuarters[0];
  }, [draftQuarters, selectedQuarterId]);

  const activeMonth = useMemo(() => {
    return activeQuarter?.months.find(m => m.id === selectedMonthId) || activeQuarter?.months[0];
  }, [activeQuarter, selectedMonthId]);

  const activeWeek = useMemo(() => {
    return activeMonth?.weeks.find(w => w.id === selectedWeekId) || activeMonth?.weeks[0];
  }, [activeMonth, selectedWeekId]);

  // Overall Plan Metrics calculated from draft
  const summaryMetrics = useMemo(() => {
    let startingCap = 50;
    try {
      const firstOpening = draftQuarters[0]?.months[0]?.opening?.replace(/[^0-9.]/g, '');
      if (firstOpening) startingCap = parseFloat(firstOpening) || 50;
    } catch {}

    let totalSweeps = 0;
    let finalEquity = startingCap;

    draftQuarters.forEach(q => {
      q.months.forEach(m => {
        const sweepNum = Math.abs(parseFloat(m.bankOut?.replace(/[^0-9.]/g, '') || '0'));
        totalSweeps += sweepNum;
        const endNum = parseFloat(m.endTarget?.replace(/[^0-9.]/g, '') || '0');
        if (endNum > 0) finalEquity = endNum;
      });
    });

    return {
      startingCap,
      finalEquity,
      totalSweeps,
      totalValue: finalEquity + totalSweeps
    };
  }, [draftQuarters]);

  // Update Quarter details
  const handleUpdateQuarter = (qId: string, field: 'name' | 'subtitle', val: string) => {
    setDraftQuarters(prev =>
      prev.map(q => (q.id === qId ? { ...q, [field]: val } : q))
    );
  };

  // Update Month details
  const handleUpdateMonth = (mId: string, field: 'name' | 'opening' | 'bankOut' | 'endTarget', val: string) => {
    setDraftQuarters(prev =>
      prev.map(q => ({
        ...q,
        months: q.months.map(m => (m.id === mId ? { ...m, [field]: val } : m))
      }))
    );
  };

  // Update Week details
  const handleUpdateWeek = (wId: string, field: 'lot' | 'net' | 'drill', val: string) => {
    setDraftQuarters(prev =>
      prev.map(q => ({
        ...q,
        months: q.months.map(m => ({
          ...m,
          weeks: m.weeks.map(w => (w.id === wId ? { ...w, [field]: val } : w))
        }))
      }))
    );
  };

  // Update Daily Session details
  const handleUpdateDay = (wId: string, dayIndex: number, field: keyof DailySession, val: any) => {
    setDraftQuarters(prev =>
      prev.map(q => ({
        ...q,
        months: q.months.map(m => ({
          ...m,
          weeks: m.weeks.map(w => {
            if (w.id !== wId) return w;
            const newDays = [...w.days];
            if (newDays[dayIndex]) {
              newDays[dayIndex] = { ...newDays[dayIndex], [field]: val };
            }
            return { ...w, days: newDays };
          })
        }))
      }))
    );
  };

  // Delete a specific daily session from a week
  const handleDeleteDay = (wId: string, dayIndex: number) => {
    setDraftQuarters(prev =>
      prev.map(q => ({
        ...q,
        months: q.months.map(m => ({
          ...m,
          weeks: m.weeks.map(w => {
            if (w.id !== wId) return w;
            const newDays = w.days.filter((_, idx) => idx !== dayIndex);
            return { ...w, days: newDays };
          })
        }))
      }))
    );
  };

  // Add a new daily session to a week
  const handleAddDay = (wId: string) => {
    setDraftQuarters(prev =>
      prev.map(q => ({
        ...q,
        months: q.months.map(m => ({
          ...m,
          weeks: m.weeks.map(w => {
            if (w.id !== wId) return w;
            const newDay: DailySession = {
              day: `Day ${w.days.length + 1} (${w.days.length + 1})`,
              proto: 'Execution Protocol',
              pnl: '+0.00',
              end: '',
              isLoss: false
            };
            return { ...w, days: [...w.days, newDay] };
          })
        }))
      }))
    );
  };

  // Clear default placeholder text & drills in Foundation (Q1)
  const handleClearFoundation = () => {
    if (!window.confirm('Clear all default placeholder focus drills and protocols in Q1: Foundation?')) return;
    setDraftQuarters(prev =>
      prev.map(q => {
        if (q.id !== 'quarter-1') return q;
        return {
          ...q,
          months: q.months.map(m => ({
            ...m,
            weeks: m.weeks.map(w => ({
              ...w,
              drill: '',
              days: w.days.map((d, i) => ({
                ...d,
                proto: `Execution Session ${i + 1}`,
                pnl: d.pnl || '+0.00',
                isLoss: false
              }))
            }))
          }))
        };
      })
    );
    setSaveStatus('Cleared default placeholder text from Q1: Foundation!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Recalculate & Cascade All Balances
  // Walks from Day 1 to Day 252, calculating ending balances and month targets
  const handleAutoCascade = () => {
    let runningBalance = summaryMetrics.startingCap;
    let totalBanked = 0;

    const newQuarters = draftQuarters.map(q => {
      const newMonths = q.months.map(m => {
        const monthOpen = runningBalance;
        let monthGrossGains = 0;
        let monthSweep = 0;

        const newWeeks = m.weeks.map(w => {
          const weekOpen = runningBalance;
          const newDays = w.days.map(d => {
            if (d.isExtractRow) {
              // Sweep day
              const sweepNum = Math.abs(parseFloat(d.pnl.replace(/[^0-9.-]/g, '') || '0'));
              runningBalance -= sweepNum;
              totalBanked += sweepNum;
              monthSweep += sweepNum;
              return {
                ...d,
                end: `End: $${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              };
            } else {
              const pnlNum = parseFloat(d.pnl.replace(/[^0-9.-]/g, '') || '0');
              runningBalance += pnlNum;
              monthGrossGains += pnlNum;
              return {
                ...d,
                end: `End: $${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              };
            }
          });

          const weekNetGains = runningBalance - weekOpen;

          return {
            ...w,
            bal: `$${weekOpen.toLocaleString('en-US', { minimumFractionDigits: 2 })} → $${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            net: weekNetGains >= 0 ? `+$${weekNetGains.toFixed(2)}` : `-$${Math.abs(weekNetGains).toFixed(2)}`,
            days: newDays
          };
        });

        return {
          ...m,
          opening: `$${monthOpen.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          bankOut: monthSweep > 0 ? `-$${monthSweep.toFixed(2)}` : '$0.00',
          endTarget: `$${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          weeks: newWeeks
        };
      });

      return {
        ...q,
        months: newMonths
      };
    });

    setDraftQuarters(newQuarters);
    setSaveStatus('Balances recalculated & cascaded from Day 1 to Day 252!');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Save manual plan to active account
  const handleSaveToActiveAccount = () => {
    if (!activeAccount) return;

    // Generate CSV representation
    let csv = 'Week,Quarter,Month,Week_Num,Lot_Size,Opening_Balance,Gross_Gain,Bank_Sweep,Ending_Balance,Focus_Drill\n';
    draftQuarters.forEach(q => {
      q.months.forEach(m => {
        m.weeks.forEach(w => {
          const parts = w.bal.replace(/[^0-9.→ ]/g, '').split('→');
          const openBal = parseFloat(parts[0]) || 0;
          const endBal = parseFloat(parts[1]) || 0;
          const gainNum = parseFloat(w.net.replace(/[^0-9.-]/g, '')) || 0;
          const sweepNum = w.isExtract ? parseFloat(w.days[w.days.length - 1]?.pnl.replace(/[^0-9.-]/g, '') || '0') : 0;
          csv += `${w.id},"${q.name}","${m.monthNum}","${w.num}","${w.lot}",${openBal},${gainNum},${Math.abs(sweepNum)},${endBal},"${w.drill}"\n`;
        });
      });
    });

    saveAccount({
      ...activeAccount,
      planQuarters: draftQuarters,
      startingBalance: summaryMetrics.startingCap,
      profitTarget: summaryMetrics.totalValue,
      planBanked: summaryMetrics.totalSweeps,
      planRetained: summaryMetrics.finalEquity,
      planTotal: summaryMetrics.totalValue,
      csvSource: csv
    });

    setSaveStatus(`Plan successfully saved and applied to "${activeAccount.name}"!`);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  return (
    <div id="manual-plan-editor-section" className="space-y-6 sm:space-y-8 animate-fadeIn scroll-mt-20">
      {/* 1. Header Banner & Plan Metrics */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                MANUAL PLAN ARCHITECT
              </span>
              <span className="text-xs font-mono text-slate-400">
                Account: {activeAccount?.name}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Full Year, Quarter, Month, Week & Daily Customizer
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Customize targets, lot sizes, protocols, and daily profits manually. Click "Cascade Balances" to mathematically sync all 252 sessions.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleClearFoundation}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-rose-300 active:scale-95"
              title="Clear all default placeholder text and protocols in Q1 Foundation"
            >
              <RotateCcw size={13} />
              <span>Clear Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleAutoCascade}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95"
              title="Recalculate running balance through all 48 weeks"
            >
              <Zap size={14} className="text-amber-500" />
              <span>Cascade Balances</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToActiveAccount}
              className="py-2.5 px-4 rounded-xl bg-[#0082ff] hover:bg-[#0070df] text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Save size={14} />
              <span>Save & Apply to Cockpit</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveStatus && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Seed Capital</div>
            <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
              ${summaryMetrics.startingCap.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase text-blue-500 font-bold">Retained Equity Target</div>
            <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
              ${Math.round(summaryMetrics.finalEquity).toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase text-amber-500 font-bold">Banked Vault Sweeps</div>
            <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
              ${Math.round(summaryMetrics.totalSweeps).toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase text-emerald-500 font-bold">Total Planned Value</div>
            <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              ${Math.round(summaryMetrics.totalValue).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hierarchical Navigation Strip: Quarters -> Months -> Weeks */}
      <div className="space-y-3">
        {/* Quarter Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-mono text-slate-400 font-bold shrink-0 mr-1">Quarter:</span>
          {draftQuarters.map(q => {
            const isSelected = q.id === selectedQuarterId;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setSelectedQuarterId(q.id);
                  if (q.months[0]) setSelectedMonthId(q.months[0].id);
                  if (q.months[0]?.weeks[0]) setSelectedWeekId(q.months[0].weeks[0].id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#0082ff] text-white shadow-md'
                    : 'bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {q.name}
              </button>
            );
          })}
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-mono text-slate-400 font-bold shrink-0 mr-1">Month:</span>
          {activeQuarter?.months.map(m => {
            const isSelected = m.id === selectedMonthId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedMonthId(m.id);
                  if (m.weeks[0]) setSelectedWeekId(m.weeks[0].id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m.monthNum} ({m.name})
              </button>
            );
          })}
        </div>

        {/* Week Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-mono text-slate-400 font-bold shrink-0 mr-1">Week:</span>
          {activeMonth?.weeks.map(w => {
            const isSelected = w.id === selectedWeekId;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWeekId(w.id)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {w.num.split(' ')[0]} ({w.lot})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Week Details & Daily Sessions Editor */}
      {activeWeek && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Week Overview Fields */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <div className="text-[10px] font-mono text-[#0082ff] font-bold uppercase tracking-wider">
                {activeQuarter?.name} · {activeMonth?.monthNum}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {activeWeek.num}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Lot Size:
                </label>
                <input
                  type="text"
                  value={activeWeek.lot}
                  onChange={e => handleUpdateWeek(activeWeek.id, 'lot', e.target.value)}
                  className="w-28 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Net Goal:
                </label>
                <input
                  type="text"
                  value={activeWeek.net}
                  onChange={e => handleUpdateWeek(activeWeek.id, 'net', e.target.value)}
                  className="w-32 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Focus Drill Setup Input */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-500 font-bold uppercase">
              Week Focus Drill / Strategy Setup:
            </label>
            <input
              type="text"
              value={activeWeek.drill}
              onChange={e => handleUpdateWeek(activeWeek.id, 'drill', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          {/* Daily Sessions Editor Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
                Daily Sessions & Profit Targets (Days 1–5 + Sweep):
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                {activeWeek.days.length} Sessions In Week
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {activeWeek.days.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    day.isExtractRow
                      ? 'bg-amber-500/10 dark:bg-amber-500/5'
                      : day.isLoss
                      ? 'bg-rose-500/10 dark:bg-rose-500/5'
                      : 'bg-white dark:bg-[#121927]'
                  }`}
                >
                  {/* Day Label & Win/Loss indicator */}
                  <div className="flex items-center gap-3 w-full sm:w-1/4">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-600 dark:text-slate-400 shrink-0">
                      {dIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={day.day}
                      onChange={e => handleUpdateDay(activeWeek.id, dIdx, 'day', e.target.value)}
                      className="px-2 py-1 rounded-lg bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white w-full"
                    />
                  </div>

                  {/* Protocol / Setup */}
                  <div className="w-full sm:w-2/5">
                    <input
                      type="text"
                      value={day.proto}
                      onChange={e => handleUpdateDay(activeWeek.id, dIdx, 'proto', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Planned Target PnL */}
                  <div className="flex items-center gap-3 w-full sm:w-1/3 justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400">Target:</span>
                      <input
                        type="text"
                        value={day.pnl}
                        onChange={e => handleUpdateDay(activeWeek.id, dIdx, 'pnl', e.target.value)}
                        className={`w-24 px-2 py-1 rounded-lg bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold ${
                          day.pnl.startsWith('-') ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      />
                    </div>

                    {/* Controlled Stop Checkbox */}
                    {!day.isExtractRow && (
                      <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.isLoss}
                          onChange={e => handleUpdateDay(activeWeek.id, dIdx, 'isLoss', e.target.checked)}
                          className="rounded text-rose-500"
                        />
                        <span>20p Stop</span>
                      </label>
                    )}

                    {/* Delete Session Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteDay(activeWeek.id, dIdx)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg cursor-pointer transition-colors"
                      title="Delete this session"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Session Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleAddDay(activeWeek.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
              >
                <Plus size={13} />
                <span>Add Daily Session</span>
              </button>
              <span className="text-[11px] font-mono text-slate-400">
                You have full control to add, edit, or delete any session
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
