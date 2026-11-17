import React, { useState, useMemo } from 'react';
import { DailySession, DayStatus } from '../types';
import { useCockpit } from '../context/CockpitContext';
import {
  X,
  Check,
  Save,
  Database,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  BookOpen,
  Clock,
  Landmark,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ExternalLink
} from 'lucide-react';

interface DayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekId: string;
  dayIndex: number;
  day: DailySession;
  weekNumber: string;
}

export const DayEditModal: React.FC<DayEditModalProps> = ({
  isOpen,
  onClose,
  weekId,
  dayIndex,
  day,
  weekNumber
}) => {
  const { updateDaySession, firestoreConnected, postgresConnected, getWeekBalance, setActiveNavTab } = useCockpit();

  const weekCalc = getWeekBalance(weekId);
  const daySnapshot = weekCalc?.days[dayIndex];

  // Editable fields: All editable anytime
  const [dayName, setDayName] = useState<string>(day.day);
  const [proto, setProto] = useState<string>(day.proto);
  const [plannedPnl, setPlannedPnl] = useState<string>(day.pnl);
  const [status, setStatus] = useState<DayStatus>(day.status || 'pending');
  const [actualPnl, setActualPnl] = useState<string>(
    day.actualPnl !== undefined ? String(day.isExtractRow ? Math.abs(day.actualPnl) : day.actualPnl) : ''
  );
  const [notes, setNotes] = useState<string>(day.notes || '');
  const [isLoss, setIsLoss] = useState<boolean>(day.isLoss || false);
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);

  // Calendar Date State & Picker
  const [sessionDate, setSessionDate] = useState<string>(() => {
    if (day.date) return day.date;
    if (day.completedAt) return day.completedAt.split('T')[0];
    return '';
  });
  const [showCalendarGrid, setShowCalendarGrid] = useState<boolean>(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => {
    if (day.date) {
      const parsed = new Date(day.date + 'T00:00:00');
      if (!isNaN(parsed.getTime())) return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  if (!isOpen) return null;

  // Extract numeric planned value for quick presets
  const cleanedPlanned = Math.abs(parseFloat((plannedPnl || '0').replace(/[^0-9.-]/g, '')) || 25);

  const handleQuickPreset = (preset: 'target' | 'breakeven' | 'loss') => {
    if (preset === 'target') {
      setActualPnl(String(cleanedPlanned));
      setStatus('completed');
      setIsLoss(false);
    } else if (preset === 'breakeven') {
      setActualPnl('0');
      setStatus('completed');
      setIsLoss(false);
    } else if (preset === 'loss') {
      const lossVal = cleanedPlanned > 0 ? -Math.round(cleanedPlanned * 0.8) : -20;
      setActualPnl(String(lossVal));
      setStatus('completed');
      setIsLoss(true);
    }
  };

  // Quick date presets
  const setQuickDate = (type: 'today' | 'yesterday' | 'tomorrow' | 'clear') => {
    if (type === 'clear') {
      setSessionDate('');
      return;
    }
    const target = new Date();
    if (type === 'yesterday') {
      target.setDate(target.getDate() - 1);
    } else if (type === 'tomorrow') {
      target.setDate(target.getDate() + 1);
    }
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setSessionDate(dateStr);
    setCalendarViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
  };

  // Formatted date string for user friendly preview
  const formattedSelectedDate = useMemo(() => {
    if (!sessionDate) return null;
    try {
      const d = new Date(sessionDate + 'T00:00:00');
      if (isNaN(d.getTime())) return sessionDate;
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return sessionDate;
    }
  }, [sessionDate]);

  // Mini Calendar Navigation
  const calYear = calendarViewDate.getFullYear();
  const calMonth = calendarViewDate.getMonth();

  const handlePrevCalMonth = () => {
    setCalendarViewDate(new Date(calYear, calMonth - 1, 1));
  };
  const handleNextCalMonth = () => {
    setCalendarViewDate(new Date(calYear, calMonth + 1, 1));
  };

  // Build 35 or 42 calendar grid cells (Monday-first)
  const miniCalDays = useMemo(() => {
    const firstDayOfMonth = new Date(calYear, calMonth, 1);
    const lastDayOfMonth = new Date(calYear, calMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    // Monday as 0, Sunday as 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: { dayNum: number; dateStr: string; isCurrentMonth: boolean; isWeekend: boolean }[] = [];

    // Prev month padding
    const prevMonthLastDay = new Date(calYear, calMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(calYear, calMonth - 1, d);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dayFormatted = String(d).padStart(2, '0');
      days.push({
        dayNum: d,
        dateStr: `${y}-${m}-${dayFormatted}`,
        isCurrentMonth: false,
        isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(calYear, calMonth, d);
      const m = String(calMonth + 1).padStart(2, '0');
      const dayFormatted = String(d).padStart(2, '0');
      days.push({
        dayNum: d,
        dateStr: `${calYear}-${m}-${dayFormatted}`,
        isCurrentMonth: true,
        isWeekend: currDate.getDay() === 0 || currDate.getDay() === 6
      });
    }

    // Next month padding to fill complete grid of 35 or 42
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(calYear, calMonth + 1, d);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dayFormatted = String(d).padStart(2, '0');
      days.push({
        dayNum: d,
        dateStr: `${y}-${m}-${dayFormatted}`,
        isCurrentMonth: false,
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6
      });
    }

    return days;
  }, [calYear, calMonth]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPnl = actualPnl.trim();
    let numPnl = trimmedPnl !== '' ? parseFloat(trimmedPnl) : undefined;

    if (numPnl !== undefined && !isNaN(numPnl) && day.isExtractRow) {
      // Offline harvest / bank sweep is strictly deducted from working equity
      numPnl = -Math.abs(numPnl);
    }

    const finalIsLoss = isLoss || (numPnl !== undefined && !isNaN(numPnl) && numPnl < 0 && !day.isExtractRow);

    updateDaySession(weekId, dayIndex, {
      day: dayName.trim() || day.day,
      proto: proto.trim() || day.proto,
      pnl: plannedPnl.trim() || day.pnl,
      status,
      actualPnl: numPnl !== undefined && !isNaN(numPnl) ? numPnl : undefined,
      isLoss: finalIsLoss,
      notes: notes.trim() !== '' ? notes.trim() : undefined,
      date: sessionDate.trim() !== '' ? sessionDate.trim() : undefined,
      completedAt: status === 'completed' ? (day.completedAt || (sessionDate ? new Date(sessionDate).toISOString() : new Date().toISOString())) : undefined
    });

    setIsSavedFeedback(true);
    setTimeout(() => {
      onClose();
    }, 350);
  };

  const handleWipeDay = () => {
    updateDaySession(weekId, dayIndex, {
      status: 'pending',
      actualPnl: undefined,
      notes: undefined,
      completedAt: undefined,
      date: undefined,
      isLoss: false
    });
    setSessionDate('');
    setIsSavedFeedback(true);
    setTimeout(() => {
      onClose();
    }, 350);
  };

  const handleResetDefaults = () => {
    setDayName(day.day);
    setProto(day.proto);
    setPlannedPnl(day.pnl);
    setStatus('pending');
    setActualPnl('');
    setNotes('');
    setSessionDate(day.date || '');
    setIsLoss(day.isLoss || false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121927] p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[11px] font-mono text-[#0082ff] font-bold uppercase tracking-wider flex items-center gap-2 flex-wrap">
              <span>{weekNumber} · {dayName}</span>
              {sessionDate && (
                <span className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  <CalendarIcon size={10} />
                  <span>{sessionDate}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                <Database size={10} />
                <span>{postgresConnected ? 'SQLite & Cloud Synced' : 'SQLite Local Active'}</span>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
              Edit Session & Realized Results
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Close editor"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          {/* Specialized Banner for 20% Offline Harvest / Cash Sweep Sessions */}
          {day.isExtractRow && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider font-mono text-amber-700 dark:text-amber-400">
                <Landmark size={14} />
                <span>20% Offline Capital Harvest (Vault Deduction)</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-amber-200/90 leading-relaxed">
                This is a designated cash harvest session. Any amount entered here will be vaulted in physical cash and <strong>strictly deducted from next week's starting working balance</strong>.
              </p>
              {daySnapshot && (
                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">
                    MT5 Prior: <strong className="text-slate-900 dark:text-white">${daySnapshot.startBalance.toFixed(2)}</strong>
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    Sweep: -${(parseFloat(actualPnl) > 0 ? parseFloat(actualPnl) : cleanedPlanned).toFixed(2)}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Next Week Starts: ${(daySnapshot.startBalance - (parseFloat(actualPnl) > 0 ? parseFloat(actualPnl) : cleanedPlanned)).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Running Balance Preview for Normal Trading Day */}
          {!day.isExtractRow && daySnapshot && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Day Open: ${daySnapshot.startBalance.toFixed(2)}</span>
              <span className="text-slate-400">→</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Projected Day Close: ${(daySnapshot.startBalance + (parseFloat(actualPnl) || cleanedPlanned)).toFixed(2)}
              </span>
            </div>
          )}
          {/* Session Label & Target Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Tag size={12} className="text-[#0082ff]" />
                <span>Session Label</span>
              </label>
              <input
                type="text"
                value={dayName}
                onChange={e => setDayName(e.target.value)}
                placeholder="e.g. Day 01 or London Scalp"
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:border-[#0082ff] focus:ring-1 focus:ring-[#0082ff] outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Clock size={12} className="text-[#0082ff]" />
                <span>Planned Target ($)</span>
              </label>
              <input
                type="text"
                value={plannedPnl}
                onChange={e => setPlannedPnl(e.target.value)}
                placeholder="+$25.00"
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:border-[#0082ff] focus:ring-1 focus:ring-[#0082ff] outline-none"
              />
            </div>
          </div>

          {/* Interactive Calendar Execution Date Card */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-[#131d2e] border border-blue-200/90 dark:border-blue-900/60 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1.5 text-xs">
                <CalendarIcon size={14} className="text-[#0082ff]" />
                <span>Execution Calendar Date</span>
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-[#0082ff] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-mono font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 cursor-pointer active:scale-95 transition-all"
                  title="Set execution date to today"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('yesterday')}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-mono hover:text-slate-900 dark:hover:text-white cursor-pointer active:scale-95 transition-all"
                  title="Set execution date to yesterday"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('tomorrow')}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-mono hover:text-slate-900 dark:hover:text-white cursor-pointer active:scale-95 transition-all"
                  title="Set execution date to tomorrow"
                >
                  Tomorrow
                </button>
                {sessionDate && (
                  <button
                    type="button"
                    onClick={() => setQuickDate('clear')}
                    className="px-1.5 py-0.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 text-[10px] font-mono cursor-pointer"
                    title="Clear selected calendar date"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCalendarGrid(!showCalendarGrid)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    showCalendarGrid
                      ? 'bg-[#0082ff] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#0082ff]'
                  }`}
                  title="Toggle Visual Calendar Picker"
                >
                  <CalendarDays size={11} />
                  <span>{showCalendarGrid ? 'Hide Calendar' : 'Visual Picker'}</span>
                </button>
              </div>
            </div>

            {/* Input & Formatted Date Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={sessionDate}
                  onChange={e => {
                    setSessionDate(e.target.value);
                    if (e.target.value) {
                      const parsed = new Date(e.target.value + 'T00:00:00');
                      if (!isNaN(parsed.getTime())) {
                        setCalendarViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
                      }
                    }
                  }}
                  className="w-full bg-white dark:bg-[#162032] border border-blue-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:border-[#0082ff] focus:ring-1 focus:ring-[#0082ff] outline-none cursor-pointer"
                />
              </div>

              {formattedSelectedDate && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#0082ff] dark:text-blue-300 font-mono text-[11px] font-bold shrink-0">
                  <CalendarIcon size={12} />
                  <span>{formattedSelectedDate}</span>
                </div>
              )}
            </div>

            {/* Inline Interactive Monthly Calendar Widget */}
            {showCalendarGrid && (
              <div className="mt-2.5 pt-2.5 border-t border-blue-200/70 dark:border-slate-800 animate-fadeIn">
                {/* Month Navigator Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handlePrevCalMonth}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(calendarViewDate)}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextCalMonth}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Weekday Labels: Mon -> Sun */}
                <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-bold text-slate-400 mb-1">
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span className="text-amber-500">Sa</span>
                  <span className="text-amber-500">Su</span>
                </div>

                {/* Day Cells Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {miniCalDays.map(cell => {
                    const isSelected = cell.dateStr === sessionDate;
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isToday = cell.dateStr === todayStr;

                    return (
                      <button
                        key={cell.dateStr}
                        type="button"
                        onClick={() => setSessionDate(cell.dateStr)}
                        className={`h-7 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center relative ${
                          isSelected
                            ? 'bg-[#0082ff] text-white font-bold shadow-sm scale-105 z-10'
                            : isToday
                            ? 'border border-[#0082ff] text-[#0082ff] dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40'
                            : cell.isCurrentMonth
                            ? cell.isWeekend
                              ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                              : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            : 'text-slate-300 dark:text-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                        }`}
                        title={cell.dateStr}
                      >
                        {cell.dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Setup Protocol Description */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Setup Strategy & Execution Protocol
            </label>
            <input
              type="text"
              value={proto}
              onChange={e => setProto(e.target.value)}
              placeholder="e.g. 20 pip London Open expansion scalp"
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:border-[#0082ff] focus:ring-1 focus:ring-[#0082ff] outline-none"
            />
          </div>

          {/* Execution Status Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
              Execution Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setStatus('completed');
                  setIsLoss(false);
                }}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === 'completed' && !isLoss
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-[#162032] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Check size={14} />
                <span>Completed</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('pending');
                  setIsLoss(false);
                }}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  status === 'pending'
                    ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-[#162032] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                Pending
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('skipped');
                  setIsLoss(false);
                }}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  status === 'skipped'
                    ? 'bg-slate-500 text-white border-slate-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-[#162032] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                Skipped
              </button>
            </div>
          </div>

          {/* Actual Realized P&L ($) or Harvest Withdrawn & Fast Presets */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
              <label className="text-slate-700 dark:text-slate-300 font-semibold">
                {day.isExtractRow ? 'Actual Cash Sweep Withdrawn to Vault ($)' : 'Actual Realized P&L ($)'}
              </label>
              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('target')}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold hover:scale-105 active:scale-95 cursor-pointer"
                  title={day.isExtractRow ? "Set Actual Sweep to Planned Target" : "Set Actual PnL to Full Target"}
                >
                  {day.isExtractRow ? 'Planned Sweep' : '+Target'}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('breakeven')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold hover:scale-105 active:scale-95 cursor-pointer"
                  title="Set Actual PnL to Breakeven $0.00"
                >
                  $0 Breakeven
                </button>
                {!day.isExtractRow && (
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('loss')}
                    className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[10px] font-mono font-bold hover:scale-105 active:scale-95 cursor-pointer"
                    title="Set Actual PnL to Controlled Loss"
                  >
                    -Loss
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">
                {day.isExtractRow ? '-$' : '$'}
              </span>
              <input
                type="number"
                step="0.01"
                value={actualPnl}
                onChange={e => {
                  setActualPnl(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val < 0 && !day.isExtractRow) {
                    setIsLoss(true);
                  }
                }}
                placeholder={String(cleanedPlanned)}
                className={`w-full bg-slate-50 dark:bg-[#162032] border rounded-xl pl-8 pr-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm outline-none ${
                  day.isExtractRow
                    ? 'border-amber-300 dark:border-amber-700 focus:border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-700 focus:border-[#0082ff] focus:ring-1 focus:ring-[#0082ff]'
                }`}
              />
            </div>
          </div>

          {/* Trade Notes & Session Psychology */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <BookOpen size={12} className="text-[#0082ff]" />
              <span>Session Psychology & Forensic Notes</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Cleared 1-hour devotion gate. London Open gold expansion clean scalp. Stopped out at exact target."
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-[#0082ff] focus:ring-1 focus:ring-[#0082ff] outline-none resize-none leading-relaxed"
            ></textarea>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <button
                type="button"
                onClick={handleWipeDay}
                className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-mono cursor-pointer font-bold"
                title="Wipe actual PnL and notes back to clean baseline"
              >
                <RotateCcw size={12} />
                <span>Wipe & Clear Day</span>
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-mono cursor-pointer"
                title="Reset fields to plan template"
              >
                <span>Reset Fields</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex items-center justify-center gap-1.5 px-5 py-2 rounded-full font-bold text-white transition-all cursor-pointer shadow-md flex-1 sm:flex-initial ${
                  isSavedFeedback
                    ? 'bg-emerald-600 scale-95'
                    : 'bg-[#0082ff] hover:bg-[#0070df] active:scale-95'
                }`}
              >
                {isSavedFeedback ? (
                  <>
                    <Check size={14} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save & Sync Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
