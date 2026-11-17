import React, { useState, useMemo } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { MentalStateKey, MentalStateLog } from '../types';
import {
  MENTAL_STATE_DEFINITIONS,
  PSYCHOLOGICAL_BEHAVIORAL_TAGS,
  RATING_DESCRIPTIONS,
  MentalStateDefinition
} from '../data/mentalStateOptions';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Star,
  Tag,
  Clock,
  Calendar,
  ChevronDown,
  Trash2,
  TrendingUp,
  ShieldCheck,
  Smile,
  Zap,
  RotateCcw,
  Check
} from 'lucide-react';

interface DailyEmotionalStateTrackerProps {
  onStateLogged?: (log: MentalStateLog) => void;
}

export const DailyEmotionalStateTracker: React.FC<DailyEmotionalStateTrackerProps> = ({
  onStateLogged
}) => {
  const {
    mentalStateLogs,
    addMentalStateLog,
    deleteMentalStateLog,
    quarters,
    firestoreConnected
  } = useCockpit();

  // Collect available days for the session selector
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

  // Form State
  const [selectedDayId, setSelectedDayId] = useState<string>(availableDays[0]?.dayId || 'w01_d1');
  const [selectedSessionTag, setSelectedSessionTag] = useState<string>('London Open (07:00 UTC)');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedStateKey, setSelectedStateKey] = useState<MentalStateKey>('calm');
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Devotion gate cleared',
    'Honored 20-pip stop loss'
  ]);
  const [notes, setNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Active definition
  const activeDef = useMemo(() => {
    return MENTAL_STATE_DEFINITIONS.find(d => d.key === selectedStateKey) || MENTAL_STATE_DEFINITIONS[0];
  }, [selectedStateKey]);

  // Handle changing mental state emoji
  const handleSelectState = (def: MentalStateDefinition) => {
    setSelectedStateKey(def.key);
    setRating(def.defaultRating);
  };

  // Toggle behavioral tag
  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Submit mental state log
  const handleSaveState = async (e: React.FormEvent) => {
    e.preventDefault();

    const matchedDay = availableDays.find(d => d.dayId === selectedDayId);
    const dayLabel = matchedDay ? matchedDay.label : 'Current Session';

    const newLogData = {
      dayId: selectedDayId,
      dayLabel,
      sessionTag: selectedSessionTag,
      date: selectedDate,
      stateKey: selectedStateKey,
      emoji: activeDef.emoji,
      label: activeDef.label,
      rating,
      tags: selectedTags,
      notes: notes.trim() || undefined
    };

    await addMentalStateLog(newLogData);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2600);

    if (onStateLogged) {
      onStateLogged({
        ...newLogData,
        id: 'temp',
        loggedAt: new Date().toISOString()
      });
    }

    // Reset reflection input but keep session setup
    setNotes('');
  };

  // Computed psychological analytics
  const analytics = useMemo(() => {
    if (mentalStateLogs.length === 0) {
      return {
        avgRating: 5.0,
        totalLogs: 0,
        optimalPercent: 100,
        dominantState: 'Calm & Grounded',
        dominantEmoji: '🧘'
      };
    }

    const total = mentalStateLogs.length;
    const sumRating = mentalStateLogs.reduce((acc, log) => acc + (log.rating || 5), 0);
    const avgRating = Number((sumRating / total).toFixed(1));

    // Optimal states (flow, calm, confident)
    const optimalCount = mentalStateLogs.filter(
      l => l.stateKey === 'flow' || l.stateKey === 'calm' || l.stateKey === 'confident'
    ).length;
    const optimalPercent = Math.round((optimalCount / total) * 100);

    // Frequency of each state
    const stateCounts: Record<string, { count: number; emoji: string; label: string }> = {};
    mentalStateLogs.forEach(l => {
      if (!stateCounts[l.stateKey]) {
        stateCounts[l.stateKey] = { count: 0, emoji: l.emoji, label: l.label };
      }
      stateCounts[l.stateKey].count++;
    });

    let maxState = { label: 'Calm & Grounded', emoji: '🧘', count: 0 };
    Object.values(stateCounts).forEach(s => {
      if (s.count > maxState.count) {
        maxState = s;
      }
    });

    return {
      avgRating,
      totalLogs: total,
      optimalPercent,
      dominantState: maxState.label,
      dominantEmoji: maxState.emoji
    };
  }, [mentalStateLogs]);

  return (
    <div className="mb-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#121927] p-4 sm:p-6 shadow-sm overflow-hidden">
      {/* Top Header & Analytics Summary Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0082ff] animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Psychological & Emotional Composure Protocol
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Brain className="text-[#0082ff]" size={22} />
            <span>Daily Emotional & Psychological State Tracker</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log your real-time mindset, equanimity score, and behavioral discipline triggers for each trading session.
          </p>
        </div>

        {/* Analytics Snapshot Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2.5 shadow-2xs">
            <span className="text-lg">{analytics.dominantEmoji}</span>
            <div>
              <div className="text-[9px] font-mono uppercase text-slate-400 font-bold">Dominant State</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{analytics.dominantState}</div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center font-mono font-black text-xs text-emerald-700 dark:text-emerald-300">
              {analytics.avgRating}
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase text-slate-400 font-bold">Composure Score</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {analytics.avgRating >= 4 ? 'Disciplined (Elite)' : 'Guarded'}
              </div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700/60 flex items-center justify-center font-mono font-black text-xs text-sky-700 dark:text-sky-300">
              {analytics.optimalPercent}%
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase text-slate-400 font-bold">Optimal Equanimity</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{analytics.totalLogs} Sessions Logged</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Tracker' : 'Expand Tracker'}
          >
            <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <form onSubmit={handleSaveState} className="mt-5 space-y-5 animate-fadeIn">
          {/* Step 1: Session & Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Trading Session Day
              </label>
              <div className="relative">
                <select
                  value={selectedDayId}
                  onChange={e => setSelectedDayId(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#0082ff] cursor-pointer"
                >
                  {availableDays.slice(0, 48).map(d => (
                    <option key={d.dayId} value={d.dayId}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Killzone / Session Timing
              </label>
              <div className="relative">
                <select
                  value={selectedSessionTag}
                  onChange={e => setSelectedSessionTag(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-[#0082ff] cursor-pointer"
                >
                  <option value="London Open (07:00 UTC)">London Open (07:00 UTC)</option>
                  <option value="NY Killzone (13:30 UTC)">NY Killzone (13:30 UTC)</option>
                  <option value="Asian Session Range">Asian Session Range</option>
                  <option value="Full Day Composite">Full Day Composite</option>
                  <option value="Post-Market Debrief">Post-Market Debrief</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Calendar Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-[#0082ff]"
              />
            </div>
          </div>

          {/* Step 2: Mental State Emoji Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Smile size={14} className="text-[#0082ff]" />
                <span>Select Your Emotional & Mental State</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                Click any emoji to select
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {MENTAL_STATE_DEFINITIONS.map(def => {
                const isSelected = selectedStateKey === def.key;
                return (
                  <button
                    key={def.key}
                    type="button"
                    onClick={() => handleSelectState(def)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? `${def.bgLight} ${def.bgDark} ${def.borderLight} ${def.borderDark} ring-2 ring-[#0082ff]/50 shadow-sm scale-[1.02]`
                        : 'bg-slate-50/70 dark:bg-[#162032]/70 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {def.emoji}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#0082ff]"></span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      {def.label}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {def.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Mindset & Composure Rating (1 to 5 Stars / Level) */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">
                Mental Composure Rating
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Rating {rating} of 5:</span>
                <span className={RATING_DESCRIPTIONS[rating]?.color || 'text-slate-700'}>
                  {RATING_DESCRIPTIONS[rating]?.label}
                </span>
              </div>
            </div>

            {/* Interactive 5-Star / 5-Button Selector */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(starVal => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-all cursor-pointer ${
                    rating >= starVal
                      ? 'bg-amber-400 text-slate-900 shadow-2xs scale-105'
                      : 'bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title={`Select Rating ${starVal}/5`}
                >
                  <Star
                    size={14}
                    className={rating >= starVal ? 'fill-slate-900 text-slate-900' : 'text-slate-400'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Behavioral Discipline Tags */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#0082ff]" />
              <span>Behavioral Checkpoints Honored During This Session</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PSYCHOLOGICAL_BEHAVIORAL_TAGS.map(tag => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-[#0082ff]/10 text-[#0082ff] dark:text-[#38a1ff] border-[#0082ff]/40 font-bold shadow-2xs'
                        : 'bg-slate-50 dark:bg-[#162032] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {isActive ? <Check size={12} className="text-[#0082ff]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 5: Optional Psychological Reflection Input */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Internal Monologue & Mental Reflection (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What were you feeling right before placing the order? Did you experience fear, impatience, or serene confidence? Note any urge to overtrade..."
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0082ff] transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Action Row: Save Button & Real-time Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className={`w-2 h-2 rounded-full ${firestoreConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span>{firestoreConnected ? 'Cloud Sync Ready' : 'Local Storage Mode'}</span>
              <span>·</span>
              <span>Selected: {activeDef.emoji} {activeDef.label} ({rating}/5)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white font-bold text-xs flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Mental State Recorded ✓</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    <span>Log Mental State</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Recent Psychological Logs Strip */}
      {mentalStateLogs.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
              Recent Session Psychology History ({mentalStateLogs.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {mentalStateLogs.slice(0, 6).map(log => {
              const def = MENTAL_STATE_DEFINITIONS.find(d => d.key === log.stateKey) || MENTAL_STATE_DEFINITIONS[0];
              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#162032]/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl shrink-0">{log.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {log.label}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {log.dayLabel} · {log.sessionTag.split('(')[0]}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-700 dark:text-amber-300 font-mono font-black text-[10px] flex items-center gap-1">
                        <Star size={10} className="fill-amber-500 text-amber-500" />
                        <span>{log.rating}/5</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => deleteMentalStateLog(log.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-1 cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic mb-2 line-clamp-2">
                      "{log.notes}"
                    </p>
                  )}

                  {log.tags && log.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                      {log.tags.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-white dark:bg-[#121927] border border-slate-200/60 dark:border-slate-700/60 text-[9px] font-mono text-slate-500"
                        >
                          {t}
                        </span>
                      ))}
                      {log.tags.length > 2 && (
                        <span className="text-[9px] font-mono text-slate-400 self-center">
                          +{log.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
