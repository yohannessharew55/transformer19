import React, { useState, useMemo } from 'react';
import { useCockpit } from '../../context/CockpitContext';
import { DailySession, TradingQuarter, TradingWeek } from '../../types';
import { GrowthChart } from '../GrowthChart';
import {
  Zap,
  Calendar,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Sun,
  Moon,
  Cloud,
  Wallet,
  Check,
  X,
  Plus,
  Clock,
  RotateCcw,
  Power,
  ShieldAlert,
  Layers,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Smile,
  Edit3,
  Monitor
} from 'lucide-react';

type MobileTab = 'today' | 'plan' | 'rules' | 'growth' | 'journal';

interface IPhoneCockpitProps {
  onSwitchToDesktop?: () => void;
}

export const IPhoneCockpit: React.FC<IPhoneCockpitProps> = ({ onSwitchToDesktop }) => {
  const {
    theme,
    toggleTheme,
    traderName,
    devotionGatePassedToday,
    toggleDevotionGate,
    activeAccount,
    accounts,
    switchAccount,
    metrics,
    balanceReport,
    quarters,
    updateDaySession,
    journalNotes,
    addJournalNote,
    firestoreConnected,
    isSyncing,
    lastSyncTime,
    triggerManualSync
  } = useCockpit();

  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<MobileTab>('today');
  const [selectedQuarterIndex, setSelectedQuarterIndex] = useState(0);

  // Bottom Sheet States
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);

  // Trade Logger Sheet Form State
  const [tradePnlInput, setTradePnlInput] = useState('');
  const [tradeIsLoss, setTradeIsLoss] = useState(false);
  const [tradeNotesInput, setTradeNotesInput] = useState('');
  const [selectedWeekId, setSelectedWeekId] = useState('w01');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Journal Note Sheet Form State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteMood, setNewNoteMood] = useState('calm');

  // Format currency helpers
  const formatCur = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // Find all weeks flat list
  const allWeeks = useMemo(() => {
    const list: { week: TradingWeek; qId: string; qNum: number }[] = [];
    quarters.forEach((q, qIdx) => {
      q.months.forEach(m => {
        m.weeks.forEach(w => {
          list.push({ week: w, qId: q.id, qNum: qIdx + 1 });
        });
      });
    });
    return list;
  }, [quarters]);

  // Current Week 1 for initial active focus
  const currentWeek = allWeeks[0]?.week;
  const currentWeekBalance = balanceReport?.weeks?.find(w => w.weekId === 'w01');

  // Working equity
  const currentWorkingEquity = balanceReport?.actualEquity ?? (activeAccount?.startingBalance || 50);
  const seedCapital = activeAccount?.startingBalance || 50;
  const totalNetGain = currentWorkingEquity - seedCapital;
  const percentGain = seedCapital > 0 ? (totalNetGain / seedCapital) * 100 : 0;
  const weekTarget = 75; // Week 1 planned target
  const weekTargetPercent = Math.min(Math.round((currentWorkingEquity / weekTarget) * 100), 200);

  // Open Quick Trade Logger for a specific day
  const handleOpenLogSheet = (weekId?: string, dayIdx?: number) => {
    const targetWeekId = weekId || 'w01';
    const targetDayIdx = dayIdx !== undefined ? dayIdx : 0;

    const targetWeek = allWeeks.find(item => item.week.id === targetWeekId)?.week;
    const targetDay = targetWeek?.days[targetDayIdx];

    setSelectedWeekId(targetWeekId);
    setSelectedDayIdx(targetDayIdx);

    if (targetDay && targetDay.actualPnl !== undefined) {
      setTradePnlInput(String(Math.abs(targetDay.actualPnl)));
      setTradeIsLoss(targetDay.actualPnl < 0);
      setTradeNotesInput(targetDay.notes || '');
    } else {
      setTradePnlInput(targetDay ? targetDay.pnl.replace(/[^0-9.]/g, '') : '5.00');
      setTradeIsLoss(false);
      setTradeNotesInput('');
    }

    setIsLogSheetOpen(true);
  };

  // Save Trade Result from Bottom Sheet
  const handleSaveTradeResult = () => {
    const parsedAmount = parseFloat(tradePnlInput);
    if (isNaN(parsedAmount)) return;

    const finalActual = tradeIsLoss ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);

    updateDaySession(selectedWeekId, selectedDayIdx, {
      actualPnl: finalActual,
      status: 'completed',
      isLoss: tradeIsLoss,
      notes: tradeNotesInput.trim() || undefined,
      completedAt: new Date().toISOString()
    });

    setIsLogSheetOpen(false);
  };

  // Save New Journal Note
  const handleSaveNote = async () => {
    if (!newNoteContent.trim()) return;
    await addJournalNote({
      content: newNoteContent.trim(),
      color: 'amber',
      mentalState: newNoteMood,
      mentalRating: 5,
      date: new Date().toISOString().split('T')[0]
    });
    setNewNoteContent('');
    setIsNoteSheetOpen(false);
  };

  const selectedQuarter = quarters[selectedQuarterIndex] || quarters[0];

  // Dynamic Theme Classes
  const bgClass = isDark ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#fafaf9] text-slate-900';
  const cardBg = isDark ? 'bg-[#121927] border-slate-800' : 'bg-white border-slate-200/90 shadow-xs';
  const subCardBg = isDark ? 'bg-slate-900/60 border-slate-800/60' : 'bg-slate-50 border-slate-200/70';
  const barBg = isDark ? 'bg-[#0b0f17]/90 border-slate-800/80' : 'bg-[#fafaf9]/90 border-slate-200/80';
  const bottomBarBg = isDark ? 'bg-[#0e1422]/95 border-slate-800/90' : 'bg-white/95 border-slate-200/90 shadow-lg';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex flex-col min-h-screen ${bgClass} font-sans selection:bg-blue-500 selection:text-white pb-[max(calc(env(safe-area-inset-bottom)+72px),88px)]`}>
      {/* =========================================================================
          1. iOS 16 TOP NAVIGATION BAR (Respects Top Notch Safe Area)
      ========================================================================= */}
      <header className={`sticky top-0 z-40 ${barBg} backdrop-blur-xl border-b pt-[max(env(safe-area-inset-top),14px)] px-4 pb-2.5 transition-colors`}>
        <div className="flex items-center justify-between">
          {/* Left: Brand Monogram + Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-[11px] text-white shadow-xs">
              T19
            </div>
            <button
              type="button"
              onClick={() => setIsAccountSheetOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${subCardBg} border active:scale-95 transition-all text-xs font-mono font-bold`}
            >
              <Wallet size={12} className="text-indigo-400" />
              <span className="max-w-[110px] truncate">{activeAccount?.name || 'Seed $50'}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>
          </div>

          {/* Right Controls: Devotion Gate + Sync + Theme + Desktop Switch */}
          <div className="flex items-center gap-1.5">
            {/* Devotion Pill Toggle */}
            <button
              type="button"
              onClick={toggleDevotionGate}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-black border transition-all active:scale-95 ${
                devotionGatePassedToday
                  ? isDark
                    ? 'bg-purple-950/60 text-purple-300 border-purple-700/60'
                    : 'bg-purple-50 text-purple-700 border-purple-300'
                  : isDark
                  ? 'bg-rose-950/60 text-rose-300 border-rose-700/60 animate-pulse'
                  : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              }`}
              title="Rule 01 Spiritual Prayer Gate"
            >
              {devotionGatePassedToday ? '✓ Devoted' : '! Gate'}
            </button>

            {/* Cloud Sync Pulse */}
            <button
              type="button"
              onClick={triggerManualSync}
              className={`w-7 h-7 rounded-full ${subCardBg} border flex items-center justify-center text-slate-400 active:scale-95`}
              title={firestoreConnected ? 'LibSQL / Cloud Synced' : 'Syncing'}
            >
              <Cloud size={13} className={isSyncing ? 'animate-spin text-blue-400' : 'text-emerald-500'} />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-7 h-7 rounded-full ${subCardBg} border flex items-center justify-center text-slate-400 active:scale-95`}
            >
              {isDark ? <Moon size={13} className="text-amber-400" /> : <Sun size={13} className="text-amber-500" />}
            </button>

            {/* Desktop Switcher (Optional) */}
            {onSwitchToDesktop && (
              <button
                type="button"
                onClick={onSwitchToDesktop}
                className={`w-7 h-7 rounded-full ${subCardBg} border flex items-center justify-center text-slate-400 hover:text-blue-400 active:scale-95`}
                title="Switch to Desktop Cockpit View"
              >
                <Monitor size={12} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. SCROLLABLE CONTENT BODY (Tabs 1 to 5)
      ========================================================================= */}
      <main className="flex-1 px-4 pt-3 space-y-3.5">
        {/* =====================================================================
            TAB 1: TODAY (Live Execution Dashboard)
        ===================================================================== */}
        {activeTab === 'today' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* Primary Glance Balance Card */}
            <div className={`rounded-3xl p-5 ${
              isDark
                ? 'bg-gradient-to-br from-[#121927] to-[#152033] border-slate-800'
                : 'bg-gradient-to-br from-white to-slate-50 border-slate-200/90 shadow-md'
            } border relative overflow-hidden`}>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="uppercase tracking-wider font-bold">MT5 Working Equity</span>
                <span className="text-[11px] text-emerald-500 font-bold">Week 01 Live</span>
              </div>

              {/* Big Equity Number */}
              <div className={`font-mono text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                {formatCur(currentWorkingEquity)}
              </div>

              {/* Net Gain & Target Indicator */}
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
                  isDark
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                }`}>
                  <ArrowUpRight size={13} />
                  <span>+{formatCur(totalNetGain)} ({percentGain >= 0 ? `+${percentGain.toFixed(1)}%` : `${percentGain.toFixed(1)}%`})</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target: {formatCur(weekTarget)}
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className={`w-full ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'} rounded-full h-2 mt-3.5 overflow-hidden`}>
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(weekTargetPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1">
                <span>Seed: {formatCur(seedCapital)}</span>
                <span className="text-emerald-500 font-bold">{weekTargetPercent}% of Week 1 Goal</span>
              </div>

              {/* 4 Quick Stat Pills */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3.5 border-t border-slate-800/60 text-center">
                <div className={`${subCardBg} p-2 rounded-2xl border`}>
                  <div className="text-[9px] font-mono uppercase text-slate-400">Seed</div>
                  <div className={`text-xs font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'} mt-0.5`}>
                    {formatCur(seedCapital)}
                  </div>
                </div>
                <div className={`${subCardBg} p-2 rounded-2xl border`}>
                  <div className="text-[9px] font-mono uppercase text-slate-400">Banked</div>
                  <div className="text-xs font-mono font-bold text-amber-500 mt-0.5">
                    {formatCur(metrics.currentBankedCash || 0)}
                  </div>
                </div>
                <div className={`${subCardBg} p-2 rounded-2xl border`}>
                  <div className="text-[9px] font-mono uppercase text-slate-400">Ceiling</div>
                  <div className="text-xs font-mono font-bold text-emerald-500 mt-0.5">0.01 lot</div>
                </div>
                <div className={`${subCardBg} p-2 rounded-2xl border`}>
                  <div className="text-[9px] font-mono uppercase text-slate-400">Win Rate</div>
                  <div className="text-xs font-mono font-bold text-blue-500 mt-0.5">
                    {metrics.completedSessions > 0 ? `${(metrics.completedWinRate || 66.7).toFixed(0)}%` : '66%'}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button: 1-Tap Log Trade Result */}
            <button
              type="button"
              onClick={() => handleOpenLogSheet()}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-mono font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Zap size={16} className="text-amber-300" />
              <span>Log New Trade Result</span>
            </button>

            {/* Spiritual Devotion Gate Banner Card */}
            <div
              onClick={toggleDevotionGate}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                devotionGatePassedToday
                  ? isDark
                    ? 'bg-purple-950/30 border-purple-800/50 text-purple-200'
                    : 'bg-purple-50 border-purple-200 text-purple-800'
                  : isDark
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200 animate-pulse'
                  : 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  devotionGatePassedToday
                    ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                    : isDark ? 'bg-rose-900/50 text-rose-300' : 'bg-rose-100 text-rose-700'
                }`}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold font-mono">
                    {devotionGatePassedToday ? 'Rule 01: Devotion Verified' : 'Rule 01: Prayer Gate Active'}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    {devotionGatePassedToday ? 'Spirit centered · Cleared for execution' : 'Platform shut until 1hr prayer completed'}
                  </div>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black ${
                devotionGatePassedToday
                  ? isDark ? 'bg-purple-800/40 text-purple-300' : 'bg-purple-200 text-purple-800'
                  : isDark ? 'bg-rose-800/50 text-rose-200' : 'bg-rose-200 text-rose-800'
              }`}>
                {devotionGatePassedToday ? 'PASSED' : 'TAP GATE'}
              </div>
            </div>

            {/* Today's Week Execution Days (Tap to Log/Edit) */}
            <div className={`rounded-3xl p-4 ${cardBg} border`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Week 01 Sessions</span>
                <span className="text-[11px] font-mono text-slate-500">Tap day to edit</span>
              </div>

              <div className="space-y-2">
                {currentWeek?.days.map((d, idx) => {
                  const isCompleted = d.status === 'completed' || d.actualPnl !== undefined;
                  const isWin = isCompleted && (d.actualPnl ?? 0) >= 0;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleOpenLogSheet('w01', idx)}
                      className={`w-full p-2.5 rounded-2xl ${subCardBg} border active:scale-[0.99] transition-all flex items-center justify-between text-left cursor-pointer`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          !isCompleted
                            ? isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                            : isWin
                            ? isDark ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-emerald-100 text-emerald-700'
                            : isDark ? 'bg-rose-950 text-rose-400 border border-rose-800/60' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className={`text-xs font-bold font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {d.day}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                            {d.proto}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-xs font-mono font-black ${
                          !isCompleted
                            ? 'text-slate-400'
                            : isWin
                            ? 'text-emerald-500'
                            : 'text-rose-500'
                        }`}>
                          {isCompleted ? (d.actualPnl! >= 0 ? `+${formatCur(d.actualPnl!)}` : formatCur(d.actualPnl!)) : d.pnl}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">
                          {isCompleted ? 'Recorded' : 'Planned'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantitative Circuit Breaker Badge */}
            <div className={`p-3 rounded-2xl ${subCardBg} border flex items-center justify-between text-xs font-mono`}>
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-500" />
                <span className={textMuted}>Rule 05 Circuit Breaker:</span>
                <span className="text-emerald-500 font-bold">0 / 2 Losses</span>
              </div>
              <span className="text-[10px] text-emerald-500 font-bold">SAFE</span>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: PLAN (Clean 48-Week Roadmap & Quarters)
        ===================================================================== */}
        {activeTab === 'plan' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* iOS 16 Segmented Quarter Switcher */}
            <div className={`grid grid-cols-4 gap-1 p-1 rounded-2xl ${subCardBg} border text-xs font-mono font-bold`}>
              {quarters.map((q, qIdx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedQuarterIndex(qIdx)}
                  className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                    selectedQuarterIndex === qIdx
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Q{qIdx + 1}
                </button>
              ))}
            </div>

            {/* Quarter Goal Summary Pill */}
            <div className={`px-3.5 py-2.5 rounded-2xl ${cardBg} border flex items-center justify-between text-xs font-mono`}>
              <div>
                <span className="font-bold">{selectedQuarter.name}</span>
                <div className="text-[10px] text-slate-400">12 Weeks Execution</div>
              </div>
              <div className="text-right">
                <span className="text-emerald-500 font-bold font-mono">
                  {selectedQuarter.quarterTarget || 'Target +$450'}
                </span>
                <div className="text-[10px] text-slate-400">20% Sweeps Active</div>
              </div>
            </div>

            {/* Weeks List */}
            <div className="space-y-2.5">
              {selectedQuarter.months.flatMap(m => m.weeks).map(w => {
                const wCalc = balanceReport?.weeks?.find(b => b.weekId === w.id);
                return (
                  <div
                    key={w.id}
                    className={`p-3.5 rounded-2xl ${cardBg} border shadow-xs`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs">{w.num}</span>
                        <span className={`px-1.5 py-0.5 rounded-md ${subCardBg} font-mono text-[9px] font-bold text-slate-400`}>
                          {w.lot}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-emerald-500">
                          {wCalc?.isComplete ? formatCur(wCalc.actualClosingBalance) : w.net}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {w.bal}
                        </span>
                      </div>
                    </div>

                    {/* 5 Day Touch Pills */}
                    <div className="grid grid-cols-5 gap-1.5 mt-2">
                      {w.days.map((d, dIdx) => {
                        const isDone = d.status === 'completed' || d.actualPnl !== undefined;
                        const won = isDone && (d.actualPnl ?? 0) >= 0;
                        return (
                          <button
                            key={dIdx}
                            type="button"
                            onClick={() => handleOpenLogSheet(w.id, dIdx)}
                            className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                              !isDone
                                ? `${subCardBg} text-slate-400`
                                : won
                                ? isDark ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300 font-bold' : 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                : isDark ? 'bg-rose-950/60 border-rose-800/60 text-rose-300 font-bold' : 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                            }`}
                          >
                            <div className="text-[9px] font-mono text-slate-400">D{dIdx + 1}</div>
                            <div className="text-[10px] font-mono truncate">
                              {isDone ? (d.actualPnl! >= 0 ? `+${d.actualPnl}` : `${d.actualPnl}`) : d.pnl}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: RULES (The 6 Master Execution Disciplines)
        ===================================================================== */}
        {activeTab === 'rules' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="px-1 pb-1">
              <h2 className="text-base font-black font-mono uppercase tracking-tight">
                The 6 Master Rules
              </h2>
              <p className="text-[11px] text-slate-400">
                Operating disciplines for capital protection & compounding.
              </p>
            </div>

            {/* Rule 01 */}
            <div className={`p-3.5 rounded-2xl ${cardBg} border border-purple-800/40`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-900/40 text-purple-400 flex items-center justify-center">
                    <BookOpen size={14} />
                  </div>
                  <span className="font-mono text-xs font-black">Rule 01: Devotion Gate</span>
                </div>
                <button
                  type="button"
                  onClick={toggleDevotionGate}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    devotionGatePassedToday ? 'bg-purple-900/50 text-purple-200 border-purple-600' : 'bg-rose-900/50 text-rose-200 border-rose-600'
                  }`}
                >
                  {devotionGatePassedToday ? '✓ Pass' : '! Gated'}
                </button>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} pl-9 font-sans`}>
                Platform stays shut until 1 full hour of prayer and scripture is completed.
              </p>
            </div>

            {/* Rule 02 */}
            <div className={`p-3.5 rounded-2xl ${cardBg} border border-sky-800/40`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-sky-900/40 text-sky-400 flex items-center justify-center">
                  <Clock size={14} />
                </div>
                <span className="font-mono text-xs font-black">Rule 02: London & NY Open Only</span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} pl-9 font-sans`}>
                Strict session expansion hours only. Zero Asian chop, zero off-hours churn.
              </p>
            </div>

            {/* Rule 03 */}
            <div className={`p-3.5 rounded-2xl ${cardBg} border border-amber-800/40`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-amber-900/40 text-amber-400 flex items-center justify-center">
                  <RotateCcw size={14} />
                </div>
                <span className="font-mono text-xs font-black">Rule 03: Daily Mental Reset</span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} pl-9 font-sans`}>
                Reset mind to baseline zero every morning. Tomorrow is an independent day.
              </p>
            </div>

            {/* Rule 04 */}
            <div className={`p-3.5 rounded-2xl ${cardBg} border border-rose-800/40`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-rose-900/40 text-rose-400 flex items-center justify-center">
                  <Power size={14} />
                </div>
                <span className="font-mono text-xs font-black">Rule 04: Exit on Target or Stop</span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} pl-9 font-sans`}>
                Immediate MT5 shutdown once target or loss ceiling hit. Zero screen staring.
              </p>
            </div>

            {/* Rule 05 */}
            <div className={`p-3.5 rounded-2xl ${cardBg} border border-orange-800/40`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-orange-900/40 text-orange-400 flex items-center justify-center">
                  <ShieldAlert size={14} />
                </div>
                <span className="font-mono text-xs font-black">Rule 05: 50% Cut on 2 Losses</span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} pl-9 font-sans`}>
                Halve lot size mechanically after 2 consecutive stop-outs for risk protection.
              </p>
            </div>

            {/* Rule 06 */}
            <div className={`p-3.5 rounded-2xl ${cardBg} border border-emerald-800/40`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-900/40 text-emerald-400 flex items-center justify-center">
                  <Layers size={14} />
                </div>
                <span className="font-mono text-xs font-black">Rule 06: Absolute Lot Cap</span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} pl-9 font-sans`}>
                Strict phase ceiling (0.01 lot in Q1). Zero oversize or revenge positions.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: GROWTH (Dynamic Compounding & Curves)
        ===================================================================== */}
        {activeTab === 'growth' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="px-1">
              <h2 className="text-base font-black font-mono uppercase tracking-tight">
                Compounding Growth Engine
              </h2>
              <p className="text-[11px] text-slate-400">
                48-Week curve from $50 seed to $37,150 total value.
              </p>
            </div>

            {/* Embed the Dynamic Growth Chart */}
            <div className={`rounded-3xl p-3 ${cardBg} border overflow-hidden shadow-sm`}>
              <GrowthChart />
            </div>

            {/* Milestones Card */}
            <div className={`p-4 rounded-3xl ${cardBg} border space-y-2.5`}>
              <div className="text-xs font-mono font-bold text-slate-400 uppercase">Growth Milestones</div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Seed Capital:</span>
                <span className="font-bold">{formatCur(seedCapital)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Quarter 1 Target:</span>
                <span className="text-blue-500 font-bold">$500.00</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Total Banked Sweeps:</span>
                <span className="text-amber-500 font-bold">$7,150.00</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Terminal 48-Week Target:</span>
                <span className="text-emerald-500 font-bold">$37,150.00</span>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: JOURNAL (Daily Notes & Psychology)
        ===================================================================== */}
        {activeTab === 'journal' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-base font-black font-mono uppercase tracking-tight">
                  Daily Trading Journal
                </h2>
                <p className="text-[11px] text-slate-400">
                  Reflections & psychological posture.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNoteSheetOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-mono text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                <Plus size={14} />
                <span>New Note</span>
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-2.5">
              {journalNotes && journalNotes.length > 0 ? (
                journalNotes.map(note => (
                  <div
                    key={note.id}
                    className={`p-3.5 rounded-2xl ${cardBg} border space-y-1.5`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{note.date || 'Today'}</span>
                      <span className={`px-2 py-0.5 rounded-full ${subCardBg} font-bold`}>
                        {note.mentalState || 'calm'}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'} font-sans leading-relaxed`}>
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className={`p-8 rounded-3xl ${cardBg} border text-center`}>
                  <BookOpen size={24} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs text-slate-400 font-mono">No journal notes yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsNoteSheetOpen(true)}
                    className={`mt-3 px-3 py-1 rounded-xl ${subCardBg} text-blue-500 text-xs font-mono font-bold`}
                  >
                    Add First Reflection
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          3. NATIVE iOS 16 BOTTOM TAB BAR (Respects Home Indicator Safe Area)
      ========================================================================= */}
      <nav className={`fixed bottom-0 inset-x-0 z-50 ${bottomBarBg} backdrop-blur-2xl border-t pb-[max(env(safe-area-inset-bottom),10px)] pt-2 px-3 shadow-2xl`}>
        <div className="grid grid-cols-5 gap-1 text-center">
          {/* Tab 1: Today */}
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center py-1 rounded-2xl transition-all cursor-pointer active:scale-90 ${
              activeTab === 'today' ? 'text-blue-500 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'today' ? 'bg-blue-500/20' : ''}`}>
              <Zap size={18} />
            </div>
            <span className="text-[10px] font-mono mt-0.5">Today</span>
          </button>

          {/* Tab 2: Plan */}
          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`flex flex-col items-center py-1 rounded-2xl transition-all cursor-pointer active:scale-90 ${
              activeTab === 'plan' ? 'text-blue-500 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'plan' ? 'bg-blue-500/20' : ''}`}>
              <Calendar size={18} />
            </div>
            <span className="text-[10px] font-mono mt-0.5">Plan</span>
          </button>

          {/* Tab 3: Rules */}
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex flex-col items-center py-1 rounded-2xl transition-all cursor-pointer active:scale-90 ${
              activeTab === 'rules' ? 'text-blue-500 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'rules' ? 'bg-blue-500/20' : ''}`}>
              <ShieldCheck size={18} />
            </div>
            <span className="text-[10px] font-mono mt-0.5">Rules</span>
          </button>

          {/* Tab 4: Growth */}
          <button
            type="button"
            onClick={() => setActiveTab('growth')}
            className={`flex flex-col items-center py-1 rounded-2xl transition-all cursor-pointer active:scale-90 ${
              activeTab === 'growth' ? 'text-blue-500 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'growth' ? 'bg-blue-500/20' : ''}`}>
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] font-mono mt-0.5">Growth</span>
          </button>

          {/* Tab 5: Journal */}
          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center py-1 rounded-2xl transition-all cursor-pointer active:scale-90 ${
              activeTab === 'journal' ? 'text-blue-500 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'journal' ? 'bg-blue-500/20' : ''}`}>
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-mono mt-0.5">Journal</span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          4. iOS 16 BOTTOM SHEETS (Log Trade Result, Account Switcher, Note)
      ========================================================================= */}

      {/* Sheet A: Trade Logger */}
      {isLogSheetOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsLogSheetOpen(false)}
          />
          <div className={`fixed inset-x-0 bottom-0 z-50 ${cardBg} border-t rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp pb-[max(env(safe-area-inset-bottom),20px)]`}>
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-700/60">
              <div>
                <h3 className="font-mono font-bold text-sm">Log Trade Result</h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Week {selectedWeekId.replace('w', '')} · Day {selectedDayIdx + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLogSheetOpen(false)}
                className={`w-7 h-7 rounded-full ${subCardBg} flex items-center justify-center text-slate-400`}
              >
                <X size={14} />
              </button>
            </div>

            {/* Win / Loss Switcher */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setTradeIsLoss(false)}
                className={`py-2.5 rounded-2xl font-mono text-xs font-bold transition-all ${
                  !tradeIsLoss
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : `${subCardBg} text-slate-400 border`
                }`}
              >
                ✓ Profit Target
              </button>
              <button
                type="button"
                onClick={() => setTradeIsLoss(true)}
                className={`py-2.5 rounded-2xl font-mono text-xs font-bold transition-all ${
                  tradeIsLoss
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                    : `${subCardBg} text-slate-400 border`
                }`}
              >
                ✕ Stop Out / Loss
              </button>
            </div>

            {/* Large Amount Input */}
            <div className="mb-4">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Actual Realized PnL ($)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-mono font-bold text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={tradePnlInput}
                  onChange={e => setTradePnlInput(e.target.value)}
                  placeholder="37.00"
                  className={`w-full ${subCardBg} border rounded-2xl pl-9 pr-4 py-3 font-mono text-xl font-black outline-none focus:border-blue-500`}
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Notes Input */}
            <div className="mb-5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Execution Notes & Discipline
              </label>
              <input
                type="text"
                value={tradeNotesInput}
                onChange={e => setTradeNotesInput(e.target.value)}
                placeholder="Clean London Open expansion on XAU/USD..."
                className={`w-full ${subCardBg} border rounded-2xl px-4 py-2.5 font-sans text-xs outline-none focus:border-blue-500`}
              />
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveTradeResult}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-mono font-bold text-sm shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
            >
              Save & Synchronize Database
            </button>
          </div>
        </>
      )}

      {/* Sheet B: Account Switcher */}
      {isAccountSheetOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAccountSheetOpen(false)}
          />
          <div className={`fixed inset-x-0 bottom-0 z-50 ${cardBg} border-t rounded-t-3xl p-5 shadow-2xl max-h-[70vh] overflow-y-auto animate-slideUp pb-[max(env(safe-area-inset-bottom),20px)]`}>
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/60">
              <h3 className="font-mono font-bold text-sm flex items-center gap-2">
                <Wallet size={15} className="text-indigo-400" />
                <span>Switch Trading Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAccountSheetOpen(false)}
                className={`w-7 h-7 rounded-full ${subCardBg} flex items-center justify-center text-slate-400`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {accounts.map(acc => {
                const isActive = acc.id === activeAccount?.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      switchAccount(acc.id);
                      setIsAccountSheetOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-indigo-950/60 border-indigo-700/60'
                        : `${subCardBg} border`
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-xs">{acc.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {formatCur(acc.startingBalance)} seed · {formatCur(acc.profitTarget || 37150)} target
                      </div>
                    </div>
                    {isActive && <Check size={16} className="text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Sheet C: New Journal Note */}
      {isNoteSheetOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsNoteSheetOpen(false)}
          />
          <div className={`fixed inset-x-0 bottom-0 z-50 ${cardBg} border-t rounded-t-3xl p-5 shadow-2xl animate-slideUp pb-[max(env(safe-area-inset-bottom),20px)]`}>
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/60">
              <h3 className="font-mono font-bold text-sm">New Journal Entry</h3>
              <button
                type="button"
                onClick={() => setIsNoteSheetOpen(false)}
                className={`w-7 h-7 rounded-full ${subCardBg} flex items-center justify-center text-slate-400`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="mb-3">
              <textarea
                value={newNoteContent}
                onChange={e => setNewNoteContent(e.target.value)}
                placeholder="What did the market teach you today? How was patience and execution discipline?"
                rows={4}
                className={`w-full ${subCardBg} border rounded-2xl p-3 text-xs outline-none focus:border-blue-500 font-sans`}
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={handleSaveNote}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-mono font-bold text-xs"
            >
              Save Reflection Note
            </button>
          </div>
        </>
      )}
    </div>
  );
};
