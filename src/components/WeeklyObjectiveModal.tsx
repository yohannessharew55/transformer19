import React, { useState } from 'react';
import { WeeklyObjective, ObjectiveStatus } from '../types';
import { useCockpit } from '../context/CockpitContext';
import {
  X,
  Check,
  Save,
  RotateCcw,
  Target,
  DollarSign,
  CheckSquare,
  Square,
  Trash2,
  Plus,
  BookOpen,
  Clock,
  Layers,
  ShieldCheck,
  Award
} from 'lucide-react';

interface WeeklyObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  objective: WeeklyObjective;
}

export const WeeklyObjectiveModal: React.FC<WeeklyObjectiveModalProps> = ({
  isOpen,
  onClose,
  objective
}) => {
  const {
    updateWeeklyObjective,
    resetWeeklyObjective
  } = useCockpit();

  const [primaryObjective, setPrimaryObjective] = useState<string>(objective.primaryObjective);
  const [customTargetPnl, setCustomTargetPnl] = useState<string>(
    objective.customTargetPnl !== undefined ? String(objective.customTargetPnl) : ''
  );
  const [tacticalNotes, setTacticalNotes] = useState<string>(objective.tacticalNotes || '');
  const [status, setStatus] = useState<ObjectiveStatus>(objective.status);
  const [debriefNotes, setDebriefNotes] = useState<string>(objective.debriefNotes || '');
  const [checklist, setChecklist] = useState(objective.checklist || []);
  const [newChecklistText, setNewChecklistText] = useState<string>('');
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleToggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(c => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklist(prev => [
      ...prev,
      {
        id: `${objective.weekId}_c_${Date.now()}`,
        text: newChecklistText.trim(),
        completed: false
      }
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklist(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const customNum = customTargetPnl.trim() !== '' ? parseFloat(customTargetPnl) : undefined;

    updateWeeklyObjective(objective.weekId, {
      primaryObjective: primaryObjective.trim() || objective.primaryObjective,
      customTargetPnl: isNaN(customNum as number) ? undefined : customNum,
      tacticalNotes: tacticalNotes.trim(),
      status,
      checklist,
      debriefNotes: debriefNotes.trim() || undefined,
      achievedAt: status === 'achieved' ? (objective.achievedAt || new Date().toISOString()) : undefined
    });

    setIsSavedFeedback(true);
    setTimeout(() => {
      onClose();
    }, 350);
  };

  const handleReset = () => {
    if (confirm(`Reset ${objective.weekNum} objective to master roadmap defaults?`)) {
      resetWeeklyObjective(objective.weekId);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121927] p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[11px] font-mono text-[#0082ff] font-bold uppercase tracking-wider flex items-center gap-2">
              <span>{objective.weekNum} · {objective.quarterName}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                {objective.lotSize}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
              Weekly Execution Objectives & Target
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:bg-slate-800 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          {/* Status Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
              Execution Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`py-2 px-2.5 rounded-xl font-bold border transition-all cursor-pointer text-center ${
                  status === 'in_progress'
                    ? 'bg-[#0082ff] text-white border-[#0082ff] shadow-sm'
                    : 'bg-slate-50 dark:bg-[#162032] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                In Progress
              </button>

              <button
                type="button"
                onClick={() => setStatus('achieved')}
                className={`py-2 px-2.5 rounded-xl font-bold border transition-all cursor-pointer text-center ${
                  status === 'achieved'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-[#162032] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                Achieved ✓
              </button>

              <button
                type="button"
                onClick={() => setStatus('upcoming')}
                className={`py-2 px-2.5 rounded-xl font-bold border transition-all cursor-pointer text-center ${
                  status === 'upcoming'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-[#162032] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                Upcoming
              </button>

              <button
                type="button"
                onClick={() => setStatus('missed')}
                className={`py-2 px-2.5 rounded-xl font-bold border transition-all cursor-pointer text-center ${
                  status === 'missed'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-[#162032] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                Missed / Demoted
              </button>
            </div>
          </div>

          {/* Primary Objective Input */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Target size={13} className="text-[#0082ff]" />
              <span>Primary Execution Goal / Focus</span>
            </label>
            <textarea
              rows={2}
              value={primaryObjective}
              onChange={e => setPrimaryObjective(e.target.value)}
              placeholder="e.g. Establish baseline 0.02 lot sizing discipline & clear 5/5 devotion gates"
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:border-[#0082ff] focus:ring-1 focus:ring-[#0082ff] outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Targets: Baseline Blueprint Target vs Custom Override */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-0.5">
                Master Roadmap Target
              </span>
              <div className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                ${objective.plannedTargetPnl.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {objective.drillFocus}
              </span>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center justify-between">
                <span>Custom Target P&L ($)</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional override</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={customTargetPnl}
                  onChange={e => setCustomTargetPnl(e.target.value)}
                  placeholder={String(objective.plannedTargetPnl)}
                  className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl pl-7 pr-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:border-[#0082ff] focus:ring-1 focus:ring-[#0082ff] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tactical Notes & Rules */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#0082ff]" />
              <span>Tactical Rules & Setup Strategy</span>
            </label>
            <input
              type="text"
              value={tacticalNotes}
              onChange={e => setTacticalNotes(e.target.value)}
              placeholder="e.g. Focus on London Open expansion. Stop trading immediately after session target hit."
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:border-[#0082ff] focus:ring-1 focus:ring-[#0082ff] outline-none"
            />
          </div>

          {/* Tactical Milestones Checklist */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Weekly Milestones & Discipline Checklist</span>
              <span className="text-[10px] font-mono text-slate-400">
                {checklist.filter(c => c.completed).length} / {checklist.length} Completed
              </span>
            </label>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {checklist.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 gap-2"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-center gap-2 text-left cursor-pointer flex-1 min-w-0"
                  >
                    {item.completed ? (
                      <CheckSquare size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <Square size={16} className="text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklist(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new milestone inline */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklist(e);
                  }
                }}
                placeholder="Add custom milestone..."
                className="flex-1 bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0082ff] hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors shrink-0"
              >
                <Plus size={13} className="inline mr-1" />
                Add
              </button>
            </div>
          </div>

          {/* End-of-Week Debrief / Performance Reflection */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <BookOpen size={13} className="text-[#0082ff]" />
              <span>Weekly Execution Debrief & Reflection</span>
            </label>
            <textarea
              rows={2}
              value={debriefNotes}
              onChange={e => setDebriefNotes(e.target.value)}
              placeholder="e.g. Achieved targets with 4 wins and 1 controlled stop. Maintained calm during Wednesday chop. Lot sizing discipline 100%."
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-[#0082ff] focus:ring-1 focus:ring-[#0082ff] outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-mono cursor-pointer"
              title="Reset this week to original roadmap blueprint"
            >
              <RotateCcw size={12} />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-bold text-white transition-all cursor-pointer shadow-md ${
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
                    <span>Save Objective</span>
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
