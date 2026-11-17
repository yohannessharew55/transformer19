import React, { useState } from 'react';
import { PlannerSection } from '../PlannerSection';
import { QuarterMatrix } from '../QuarterMatrix';
import { PlanVsActualPage } from '../PlanVsActualPage';
import { WeeklyObjectivesSection } from '../WeeklyObjectivesSection';
import { Sparkles, Layers, GitCompare, Target } from 'lucide-react';

export const RoadmapWorkspace: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'matrix' | 'planVsActual' | 'objectives'>('planner');

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Sub-Workspace Selector Pill Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('planner')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'planner'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={13} className={activeSubTab === 'planner' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>1-Year Trade Planner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'matrix'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers size={13} className={activeSubTab === 'matrix' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>48-Week Schedule Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('planVsActual')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'planVsActual'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitCompare size={13} className={activeSubTab === 'planVsActual' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>Plan vs. Actual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('objectives')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'objectives'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Target size={13} className={activeSubTab === 'objectives' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>Weekly Objectives</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Roadmap Workspace · 48 Weeks Strategy
        </div>
      </div>

      {/* Render Active View */}
      {activeSubTab === 'planner' && <PlannerSection />}
      {activeSubTab === 'matrix' && <QuarterMatrix />}
      {activeSubTab === 'planVsActual' && <PlanVsActualPage />}
      {activeSubTab === 'objectives' && <WeeklyObjectivesSection />}
    </div>
  );
};
