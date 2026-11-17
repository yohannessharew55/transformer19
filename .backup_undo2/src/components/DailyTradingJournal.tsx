import React, { useState, useMemo } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { DailyJournalNote, JournalColor, JournalOutcome, MentalStateKey } from '../types';
import { WeeklyPerformanceRecap } from './WeeklyPerformanceRecap';
import { DailyJournalComparison } from './DailyJournalComparison';
import { DailyEmotionalStateTracker } from './DailyEmotionalStateTracker';
import { TradeCalendarJournal } from './TradeCalendarJournal';
import { TradeImporterModal } from './TradeImporterModal';
import { MENTAL_STATE_DEFINITIONS } from '../data/mentalStateOptions';
import {
  StickyNote,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  Search,
  Check,
  X,
  Sparkles,
  Database,
  Share2,
  Flame,
  ShieldCheck,
  ChevronDown,
  Trophy,
  LayoutGrid,
  Scale,
  Star,
  Smile,
  Brain,
  UploadCloud
} from 'lucide-react';

const COLOR_STYLES: Record<JournalColor, {
  bg: string;
  tape: string;
  border: string;
  badge: string;
  accent: string;
  shadow: string;
}> = {
  yellow: {
    bg: 'bg-[#fffbeb] dark:bg-[#232014] text-slate-900 dark:text-amber-100',
    tape: 'bg-amber-200/70 dark:bg-amber-500/20 border-amber-300/40',
    border: 'border-[#fde68a] dark:border-amber-700/40',
    badge: 'bg-amber-200/50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border-amber-300/60 dark:border-amber-700/60',
    accent: '#d97706',
    shadow: 'shadow-amber-900/10 dark:shadow-black/50'
  },
  amber: {
    bg: 'bg-[#fff7ed] dark:bg-[#271b15] text-slate-900 dark:text-orange-100',
    tape: 'bg-orange-200/70 dark:bg-orange-500/20 border-orange-300/40',
    border: 'border-[#fed7aa] dark:border-orange-700/40',
    badge: 'bg-orange-200/50 dark:bg-orange-900/40 text-orange-900 dark:text-orange-200 border-orange-300/60 dark:border-orange-700/60',
    accent: '#ea580c',
    shadow: 'shadow-orange-900/10 dark:shadow-black/50'
  },
  emerald: {
    bg: 'bg-[#f0fdf4] dark:bg-[#122419] text-slate-900 dark:text-emerald-100',
    tape: 'bg-emerald-200/70 dark:bg-emerald-500/20 border-emerald-300/40',
    border: 'border-[#bbf7d0] dark:border-emerald-700/40',
    badge: 'bg-emerald-200/50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border-emerald-300/60 dark:border-emerald-700/60',
    accent: '#16a34a',
    shadow: 'shadow-emerald-900/10 dark:shadow-black/50'
  },
  sky: {
    bg: 'bg-[#f0f9ff] dark:bg-[#112334] text-slate-900 dark:text-sky-100',
    tape: 'bg-sky-200/70 dark:bg-sky-500/20 border-sky-300/40',
    border: 'border-[#bae6fd] dark:border-sky-700/40',
    badge: 'bg-sky-200/50 dark:bg-sky-900/40 text-sky-900 dark:text-sky-200 border-sky-300/60 dark:border-sky-700/60',
    accent: '#0284c7',
    shadow: 'shadow-sky-900/10 dark:shadow-black/50'
  },
  purple: {
    bg: 'bg-[#faf5ff] dark:bg-[#22152e] text-slate-900 dark:text-purple-100',
    tape: 'bg-purple-200/70 dark:bg-purple-500/20 border-purple-300/40',
    border: 'border-[#e9d5ff] dark:border-purple-700/40',
    badge: 'bg-purple-200/50 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 border-purple-300/60 dark:border-purple-700/60',
    accent: '#9333ea',
    shadow: 'shadow-purple-900/10 dark:shadow-black/50'
  },
  rose: {
    bg: 'bg-[#fff1f2] dark:bg-[#281318] text-slate-900 dark:text-rose-100',
    tape: 'bg-rose-200/70 dark:bg-rose-500/20 border-rose-300/40',
    border: 'border-[#fecdd3] dark:border-rose-700/40',
    badge: 'bg-rose-200/50 dark:bg-rose-900/40 text-rose-900 dark:text-rose-200 border-rose-300/60 dark:border-rose-700/60',
    accent: '#e11d48',
    shadow: 'shadow-rose-900/10 dark:shadow-black/50'
  }
};

const COMMON_TAGS = [
  'London Open',
  'NY Killzone',
  'Displacement Setup',
  'Harvest & Sweep',
  'Risk Guard',
  'Asian Range',
  'Rule 01 Devotion',
  'Weekend Review'
];

export const DailyTradingJournal: React.FC = () => {
  const {
    journalNotes,
    addJournalNote,
    updateJournalNote,
    deleteJournalNote,
    quarters,
    firestoreConnected
  } = useCockpit();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [journalSubView, setJournalSubView] = useState<'calendar' | 'comparison' | 'notes' | 'weekly_recap'>('calendar');

  // Filter state
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [colorFilter, setColorFilter] = useState<string>('all');

  // Form state
  const [formDayId, setFormDayId] = useState<string>('w01_d1');
  const [formDayLabel, setFormDayLabel] = useState<string>('Week 1 · Day 1 (Mon)');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formSessionTag, setFormSessionTag] = useState<string>('London Open');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formColor, setFormColor] = useState<JournalColor>('yellow');
  const [formOutcome, setFormOutcome] = useState<JournalOutcome>('win');
  const [formPnl, setFormPnl] = useState<string>('');
  const [formMentalState, setFormMentalState] = useState<MentalStateKey>('calm');
  const [formMentalRating, setFormMentalRating] = useState<number>(5);
  const [formMentalEmoji, setFormMentalEmoji] = useState<string>('🧘');

  // Collect all trading days from quarters for the day selector
  const availableDays = useMemo(() => {
    const list: { dayId: string; label: string; weekNum: string }[] = [];
    quarters.forEach(q => {
      q.months.forEach(m => {
        m.weeks.forEach(w => {
          w.days.forEach((d, idx) => {
            list.push({
              dayId: `${w.id}_d${idx + 1}`,
              label: `${w.num} · ${d.day}`,
              weekNum: w.num
            });
          });
        });
      });
    });
    return list;
  }, [quarters]);

  // Open modal for new note
  const handleOpenNewNote = (preferredDayId?: string) => {
    setEditingNoteId(null);
    if (preferredDayId) {
      setFormDayId(preferredDayId);
      const match = availableDays.find(d => d.dayId === preferredDayId);
      if (match) setFormDayLabel(match.label);
    } else {
      setFormDayId(availableDays[0]?.dayId || 'w01_d1');
      setFormDayLabel(availableDays[0]?.label || 'Week 1 · Day 1 (Mon)');
    }
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSessionTag('London Open');
    setFormTitle('');
    setFormContent('');
    setFormColor('yellow');
    setFormOutcome('win');
    setFormPnl('');
    setFormMentalState('calm');
    setFormMentalRating(5);
    setFormMentalEmoji('🧘');
    setIsModalOpen(true);
  };

  // Open modal for new note with specific date from calendar
  const handleOpenNewNoteForDate = (dateStr: string, dayLabel?: string) => {
    setEditingNoteId(null);
    setFormDate(dateStr);
    if (dayLabel) {
      setFormDayLabel(dayLabel);
    } else {
      setFormDayLabel(`Session ${dateStr}`);
    }
    setFormDayId(`custom_${dateStr}`);
    setFormSessionTag('London Open');
    setFormTitle('');
    setFormContent('');
    setFormColor('yellow');
    setFormOutcome('win');
    setFormPnl('');
    setFormMentalState('calm');
    setFormMentalRating(5);
    setFormMentalEmoji('🧘');
    setIsModalOpen(true);
  };

  // Open modal for editing note
  const handleEditNote = (note: DailyJournalNote) => {
    setEditingNoteId(note.id);
    setFormDayId(note.dayId);
    setFormDayLabel(note.dayLabel || 'Custom Day');
    setFormDate(note.date || new Date().toISOString().split('T')[0]);
    setFormSessionTag(note.sessionTag || 'London Open');
    setFormTitle(note.title || '');
    setFormContent(note.content);
    setFormColor(note.color || 'yellow');
    setFormOutcome(note.outcome || 'win');
    setFormPnl(note.pnl !== undefined ? String(note.pnl) : '');
    setFormMentalState(note.mentalState || 'calm');
    setFormMentalRating(note.mentalRating !== undefined ? note.mentalRating : 5);
    setFormMentalEmoji(note.mentalEmoji || '🧘');
    setIsModalOpen(true);
  };

  // Submit note (create or update)
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) return;

    const pnlNum = formPnl.trim() !== '' ? parseFloat(formPnl) : undefined;

    if (editingNoteId) {
      await updateJournalNote(editingNoteId, {
        dayId: formDayId,
        dayLabel: formDayLabel,
        date: formDate,
        sessionTag: formSessionTag,
        title: formTitle.trim() || undefined,
        content: formContent.trim(),
        color: formColor,
        outcome: formOutcome,
        pnl: !isNaN(pnlNum as number) ? pnlNum : undefined,
        mentalState: formMentalState,
        mentalRating: formMentalRating,
        mentalEmoji: formMentalEmoji
      });
    } else {
      await addJournalNote({
        dayId: formDayId,
        dayLabel: formDayLabel,
        date: formDate,
        sessionTag: formSessionTag,
        title: formTitle.trim() || undefined,
        content: formContent.trim(),
        color: formColor,
        outcome: formOutcome,
        pnl: !isNaN(pnlNum as number) ? pnlNum : undefined,
        mentalState: formMentalState,
        mentalRating: formMentalRating,
        mentalEmoji: formMentalEmoji
      });
    }

    setIsModalOpen(false);
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    return journalNotes.filter(note => {
      // Day filter
      if (selectedDayFilter !== 'all' && note.dayId !== selectedDayFilter) {
        return false;
      }
      // Color filter
      if (colorFilter !== 'all' && (note.color || 'yellow') !== colorFilter) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inContent = note.content.toLowerCase().includes(query);
        const inTitle = note.title?.toLowerCase().includes(query) || false;
        const inTag = note.sessionTag?.toLowerCase().includes(query) || false;
        const inLabel = note.dayLabel?.toLowerCase().includes(query) || false;
        return inContent || inTitle || inTag || inLabel;
      }
      return true;
    });
  }, [journalNotes, selectedDayFilter, colorFilter, searchQuery]);

  return (
    <section className="mb-12 animate-fadeIn">
      {/* Section Header with Scandinavian Typography */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e07a5f] animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Tactile Trading Psychology & Session Proof
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <StickyNote className="text-[#e07a5f]" size={26} />
            <span>Daily Trading Journal</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Sticky note session reflections stored in SQLite database. Hover or touch any note to lift it from the board. Record execution observations, emotional discipline, and specific day outcomes.
          </p>
        </div>

        {/* Action Buttons: Import CSV & Pin New Sticky Note */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsImporterOpen(true)}
            className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162032] text-slate-800 dark:text-slate-200 hover:border-[#0082ff]/50 shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <UploadCloud size={15} className="text-[#0082ff]" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenNewNote()}
            className="flex-1 sm:flex-initial justify-center btn-terracotta flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-bold rounded-xl cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={16} />
            <span>Pin Sticky Note</span>
          </button>
        </div>
      </div>

      {/* Daily Emotional and Psychological State Tracker */}
      <DailyEmotionalStateTracker />

      {/* Journal View Switcher: Trade Calendar vs Plan vs Actual vs Sticky Notes vs Weekly Recap */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setJournalSubView('calendar')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            journalSubView === 'calendar'
              ? 'bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white shadow-xs'
              : 'bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar size={14} />
          <span>Trade Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setJournalSubView('comparison')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            journalSubView === 'comparison'
              ? 'bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white shadow-xs'
              : 'bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scale size={14} />
          <span>Plan vs. Actual Journal</span>
        </button>

        <button
          type="button"
          onClick={() => setJournalSubView('notes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            journalSubView === 'notes'
              ? 'bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white shadow-xs'
              : 'bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutGrid size={14} />
          <span>Sticky Notes Board ({journalNotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setJournalSubView('weekly_recap')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            journalSubView === 'weekly_recap'
              ? 'bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white shadow-xs'
              : 'bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy size={14} />
          <span>Weekly Performance Recap</span>
        </button>
      </div>

      {journalSubView === 'calendar' ? (
        <TradeCalendarJournal
          onOpenNewNoteForDate={handleOpenNewNoteForDate}
          onEditNote={handleEditNote}
        />
      ) : journalSubView === 'comparison' ? (
        <DailyJournalComparison onOpenNewNote={handleOpenNewNote} />
      ) : journalSubView === 'weekly_recap' ? (
        <WeeklyPerformanceRecap />
      ) : (
        <>
          {/* Control & Filter Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800/80 mb-8 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Day Selector Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar size={15} className="text-slate-400 shrink-0" />
          <div className="relative flex-1 sm:w-60">
            <select
              value={selectedDayFilter}
              onChange={e => setSelectedDayFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-[#e07a5f] cursor-pointer"
            >
              <option value="all">All Days (Show All Notes)</option>
              {availableDays.slice(0, 50).map(d => (
                <option key={d.dayId} value={d.dayId}>
                  {d.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes, setups, reflections..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-[#e07a5f]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Color Tone Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setColorFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
              colorFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Colors
          </button>
          {(['yellow', 'amber', 'emerald', 'sky', 'purple', 'rose'] as JournalColor[]).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColorFilter(c)}
              className={`w-6 h-6 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                c === 'yellow' ? 'bg-[#fef08a] border-amber-400' :
                c === 'amber' ? 'bg-[#fed7aa] border-orange-400' :
                c === 'emerald' ? 'bg-[#bbf7d0] border-emerald-400' :
                c === 'sky' ? 'bg-[#bae6fd] border-sky-400' :
                c === 'purple' ? 'bg-[#e9d5ff] border-purple-400' :
                'bg-[#fecdd3] border-rose-400'
              } ${colorFilter === c ? 'ring-2 ring-[#e07a5f] scale-110' : 'opacity-70 hover:opacity-100'}`}
              title={`Filter by ${c} note`}
            >
              {colorFilter === c && <Check size={11} className="text-slate-900 font-bold" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Notes Corkboard Grid */}
      {filteredNotes.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-slate-100/50 dark:bg-[#121927]/40 border-2 border-dashed border-slate-200 dark:border-slate-800">
          <StickyNote size={38} className="mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Sticky Notes Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchQuery || selectedDayFilter !== 'all' || colorFilter !== 'all'
              ? 'No notes match the current filters. Try resetting the filter.'
              : 'Start your daily trading discipline log by pinning your first sticky note.'}
          </p>
          <button
            type="button"
            onClick={() => handleOpenNewNote()}
            className="btn-terracotta inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl cursor-pointer"
          >
            <Plus size={14} />
            <span>Pin First Sticky Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 pt-2">
          {filteredNotes.map((note, index) => {
            const colorKey = (note.color || 'yellow') as JournalColor;
            const style = COLOR_STYLES[colorKey] || COLOR_STYLES.yellow;
            const rotationDeg = note.rotation !== undefined ? note.rotation : (index % 4 === 0 ? -1.5 : index % 4 === 1 ? 1.2 : index % 4 === 2 ? -0.8 : 1.8);

            return (
              <div
                key={note.id}
                style={{
                  transform: `rotate(${rotationDeg}deg)`
                }}
                className={`group relative rounded-2xl p-5 sm:p-6 border ${style.border} ${style.bg} ${style.shadow} transition-all duration-300 ease-out cursor-default hover:-translate-y-2 hover:scale-[1.03] hover:rotate-0 hover:shadow-2xl hover:z-20 active:scale-[1.01]`}
              >
                {/* Washi Tape Strip at Top Center (Tactile Sticky Note Element) */}
                <div
                  className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 rounded-xs border backdrop-blur-xs ${style.tape} shadow-xs z-10 transition-transform group-hover:scale-105`}
                />

                {/* Note Top Bar: Specific Day Label & Session Tag */}
                <div className="flex items-start justify-between gap-2 mb-3 pt-1">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {note.dayLabel || 'Day Session'}
                    </span>
                    {note.date && (
                      <span className="text-[10px] font-mono opacity-60">
                        {note.date}
                      </span>
                    )}
                  </div>

                  {/* Session Tag Pill */}
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                    {note.sessionTag || 'Session Note'}
                  </span>
                </div>

                {/* Note Headline/Title */}
                {note.title && (
                  <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white leading-snug mb-2">
                    {note.title}
                  </h4>
                )}

                {/* Note Body Text */}
                <div className="font-sans text-xs leading-relaxed opacity-90 whitespace-pre-wrap mb-4 line-clamp-6 group-hover:line-clamp-none">
                  {note.content}
                </div>

                {/* Note Footer: Outcome & P&L Badges + Interactive Controls */}
                <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs mt-auto">
                  {/* Outcome Tag & PnL */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {note.outcome && (
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                        note.outcome === 'win'
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                          : note.outcome === 'loss'
                          ? 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                          : note.outcome === 'devotion'
                          ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-800 dark:text-slate-300 border border-slate-500/30'
                      }`}>
                        {note.outcome}
                      </span>
                    )}

                    {note.pnl !== undefined && (
                      <span className={`text-[11px] font-mono font-bold ${
                        note.pnl > 0 ? 'text-emerald-700 dark:text-emerald-300' :
                        note.pnl < 0 ? 'text-rose-700 dark:text-rose-300' :
                        'text-slate-600 dark:text-slate-400'
                      }`}>
                        {note.pnl >= 0 ? `+$${note.pnl.toFixed(2)}` : `-$${Math.abs(note.pnl).toFixed(2)}`}
                      </span>
                    )}

                    {note.mentalEmoji && (
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center gap-1"
                        title={`Mindset: ${note.mentalState || ''} (${note.mentalRating !== undefined ? note.mentalRating : 5}/5)`}
                      >
                        <span>{note.mentalEmoji}</span>
                        {note.mentalRating !== undefined && <span>{note.mentalRating}/5</span>}
                      </span>
                    )}
                  </div>

                  {/* Hover Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditNote(note);
                      }}
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Edit note"
                      aria-label="Edit note"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this journal sticky note from the database?')) {
                          deleteJournalNote(note.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Cloud Sync Status Indicator Stamp */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 pointer-events-none opacity-20 group-hover:opacity-60 transition-opacity">
                  <Database size={9} />
                  <span className="text-[8px] font-mono uppercase font-bold">SQL</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* Create / Edit Sticky Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#121927] rounded-3xl p-4 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#e07a5f]/10 border border-[#e07a5f]/30 flex items-center justify-center text-[#e07a5f]">
                  <StickyNote size={16} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {editingNoteId ? 'Edit Sticky Journal Note' : 'Pin New Trading Journal Note'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Persisted directly to SQLite database
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Note Editor Form */}
            <form onSubmit={handleSaveNote} className="space-y-4">
              {/* Day Mapping Selector */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  1. Specific Trading Day (48-Week Execution Matrix)
                </label>
                <div className="relative">
                  <select
                    value={formDayId}
                    onChange={e => {
                      setFormDayId(e.target.value);
                      const match = availableDays.find(d => d.dayId === e.target.value);
                      if (match) setFormDayLabel(match.label);
                    }}
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#e07a5f] cursor-pointer"
                  >
                    {availableDays.map(d => (
                      <option key={d.dayId} value={d.dayId}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Session Tag & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    2. Session Tag
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formSessionTag}
                      onChange={e => setFormSessionTag(e.target.value)}
                      placeholder="e.g. London Open"
                      list="session-tags-list"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#e07a5f]"
                    />
                    <datalist id="session-tags-list">
                      {COMMON_TAGS.map(tag => (
                        <option key={tag} value={tag} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Calendar Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[#e07a5f]"
                  />
                </div>
              </div>

              {/* Title / Headline (Optional) */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  3. Note Headline (Optional)
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Clean Displaced Breakout on Gold"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#e07a5f]"
                />
              </div>

              {/* Text Notes Content */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  4. Session Notes & Reflections <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder="Write your trade execution details: displacement pips, stop loss placement, emotional state, rule compliance, market reaction..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs leading-relaxed text-slate-900 dark:text-white outline-none focus:border-[#e07a5f] resize-none"
                />
              </div>

              {/* Sticky Note Color Tone Picker */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  5. Sticky Note Paper Color
                </label>
                <div className="flex items-center gap-2">
                  {(['yellow', 'amber', 'emerald', 'sky', 'purple', 'rose'] as JournalColor[]).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`flex-1 py-2 rounded-xl border text-[11px] font-bold capitalize transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        c === 'yellow' ? 'bg-[#fef9c3] dark:bg-[#232014] text-amber-900 dark:text-amber-200 border-amber-300' :
                        c === 'amber' ? 'bg-[#ffedd5] dark:bg-[#271b15] text-orange-900 dark:text-orange-200 border-orange-300' :
                        c === 'emerald' ? 'bg-[#dcfce7] dark:bg-[#122419] text-emerald-900 dark:text-emerald-200 border-emerald-300' :
                        c === 'sky' ? 'bg-[#e0f2fe] dark:bg-[#112334] text-sky-900 dark:text-sky-200 border-sky-300' :
                        c === 'purple' ? 'bg-[#f3e8ff] dark:bg-[#22152e] text-purple-900 dark:text-purple-200 border-purple-300' :
                        'bg-[#ffe4e6] dark:bg-[#281318] text-rose-900 dark:text-rose-200 border-rose-300'
                      } ${formColor === c ? 'ring-2 ring-[#e07a5f] shadow-sm font-black scale-102' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {formColor === c && <Check size={12} />}
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Outcome & P&L */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Session Outcome
                  </label>
                  <select
                    value={formOutcome}
                    onChange={e => setFormOutcome(e.target.value as JournalOutcome)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#e07a5f] cursor-pointer"
                  >
                    <option value="win">Win (Target Reached)</option>
                    <option value="loss">Loss (Controlled Scratch)</option>
                    <option value="scratch">Scratch / Breakeven</option>
                    <option value="devotion">Rule 01 Devotion / Reset</option>
                    <option value="observation">Market Observation Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Realized P&L ($ Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPnl}
                    onChange={e => setFormPnl(e.target.value)}
                    placeholder="e.g. 25.00 or -20.00"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[#e07a5f]"
                  />
                </div>
              </div>

              {/* Psychological & Mental State Selector in Sticky Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Smile size={14} className="text-[#0082ff]" />
                    <span>Mental State & Psychological Rating</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-amber-500">
                    {formMentalEmoji} Score: {formMentalRating}/5
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-2.5">
                  {MENTAL_STATE_DEFINITIONS.map(def => {
                    const isSelected = formMentalState === def.key;
                    return (
                      <button
                        key={def.key}
                        type="button"
                        onClick={() => {
                          setFormMentalState(def.key);
                          setFormMentalEmoji(def.emoji);
                          setFormMentalRating(def.defaultRating);
                        }}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0082ff]/10 border-[#0082ff] ring-2 ring-[#0082ff]/40 font-bold shadow-2xs scale-105'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                        title={`${def.label}: ${def.description}`}
                      >
                        <div className="text-base leading-none">{def.emoji}</div>
                        <div className="text-[8px] font-mono truncate mt-0.5">{def.label.split(' ')[0]}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Rating 1 to 5 Stars selector */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-mono text-slate-500">Composure Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(starVal => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setFormMentalRating(starVal)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold transition-all cursor-pointer ${
                          formMentalRating >= starVal
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-white dark:bg-slate-700 text-slate-400'
                        }`}
                      >
                        <Star size={11} className={formMentalRating >= starVal ? 'fill-slate-900 text-slate-900' : 'text-slate-400'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-terracotta px-5 py-2 text-xs font-bold rounded-xl cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {editingNoteId ? 'Update Sticky Note' : 'Pin Note to Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 1-Click CSV & Broker Statement Importer Modal */}
      <TradeImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportComplete={() => {
          // Calendar and sticky notes auto-updated
        }}
      />
    </section>
  );
};
