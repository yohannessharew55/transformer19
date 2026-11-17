import React, { useState } from 'react';
import { useCockpit } from '../../context/CockpitContext';
import { scrollToElement } from '../../utils/scrollHelper';
import { QuarterMatrix } from '../QuarterMatrix';
import { ManualPlanEditor } from '../ManualPlanEditor';
import { PlanVsActualPage } from '../PlanVsActualPage';
import { WeeklyObjectivesSection } from '../WeeklyObjectivesSection';
import { Layers, Edit3, GitCompare, Target } from 'lucide-react';
import type { ActiveTab } from '../../context/CockpitContext';

export const HierarchyWorkspace: React.FC = () => {
  const { activeNavTab, setActiveNavTab } = useCockpit();

  const [localManualTab, setLocalManualTab] = useState(false);
  const [lastNavTab, setLastNavTab] = useState(activeNavTab);

  // Synchronously reset manual tab if external navigation occurs
  if (activeNavTab !== lastNavTab) {
    setLastNavTab(activeNavTab);
    setLocalManualTab(false);
  }

  const getSubTabFromNavTab = (tab: string): 'matrix' | 'manual' | 'planVsActual' | 'objectives' => {
    if (tab === 'planVsActual') return 'manual';
    if (tab === 'objectives') return 'objectives';
    return 'matrix';
  };

  // Synchronously derived during render: zero delay, no unmount lag or scroll reset
  const activeSubTab = localManualTab ? 'manual' : getSubTabFromNavTab(activeNavTab);

  const handleSelectSubTab = (tab: 'matrix' | 'manual' | 'planVsActual' | 'objectives', elementId?: string) => {
    if (tab === 'manual') {
      setLocalManualTab(true);
      setActiveNavTab('planVsActual');
    } else {
      setLocalManualTab(false);
      let targetNavTab: ActiveTab = 'cockpit';
      if (tab === 'objectives') targetNavTab = 'objectives';
      setActiveNavTab(targetNavTab);
    }

    if (elementId) {
      scrollToElement(elementId);
    }
  };

  return (
    <div id="hierarchy-workspace" className="space-y-6 sm:space-y-8 animate-fadeIn scroll-mt-20">
      {/* Subtle Sub-Navigation Pill Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => handleSelectSubTab('matrix', 'quarter-matrix-section')}
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
            onClick={() => handleSelectSubTab('manual', 'manual-plan-editor-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'manual'
                ? 'bg-white dark:bg-[#121927] text-indigo-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 size={13} className={activeSubTab === 'manual' ? 'text-indigo-500' : 'text-slate-400'} />
            <span>Manual Plan Editor</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Primary Execution Hierarchy · Q1 → Q4 Compounding Blueprint
        </div>
      </div>

      {/* Render Active View */}
      {activeSubTab === 'matrix' && <QuarterMatrix />}
      {activeSubTab === 'manual' && <ManualPlanEditor />}
      {activeSubTab === 'planVsActual' && <PlanVsActualPage />}
      {activeSubTab === 'objectives' && <WeeklyObjectivesSection />}
    </div>
  );
};
