import React from 'react';
import { useCockpit } from '../../context/CockpitContext';
import { scrollToElement } from '../../utils/scrollHelper';
import { DailyTradingJournal } from '../DailyTradingJournal';
import { DisciplineCards } from '../DisciplineCards';
import { PerformanceSummary } from '../PerformanceSummary';
import { GrowthChart } from '../GrowthChart';
import { UpdatedResultsSection } from '../UpdatedResultsSection';
import { MultiAccountPortfolioSection } from '../MultiAccountPortfolioSection';
import { Calendar, ShieldCheck, TrendingUp, Building2 } from 'lucide-react';
import type { ActiveTab } from '../../context/CockpitContext';

export const JournalRiskWorkspace: React.FC = () => {
  const { activeNavTab, setActiveNavTab } = useCockpit();

  const getSubTabFromNavTab = (tab: string): 'journal' | 'risk' | 'analytics' | 'accounts' => {
    if (tab === 'riskGuard' || tab === 'disciplines' || tab === 'audit') return 'risk';
    if (tab === 'analytics') return 'analytics';
    if (tab === 'portfolio') return 'accounts';
    return 'journal';
  };

  const activeSubTab = getSubTabFromNavTab(activeNavTab);

  const handleSelectSubTab = (tab: 'journal' | 'risk' | 'analytics' | 'accounts', elementId?: string) => {
    let targetNavTab: ActiveTab = 'journal';
    if (tab === 'risk') targetNavTab = 'riskGuard';
    else if (tab === 'analytics') targetNavTab = 'analytics';
    else if (tab === 'accounts') targetNavTab = 'portfolio';

    setActiveNavTab(targetNavTab);
    if (elementId) {
      scrollToElement(elementId);
    }
  };

  return (
    <div id="journal-risk-workspace" className="space-y-6 sm:space-y-8 animate-fadeIn scroll-mt-20">
      {/* Sub-Workspace Selector Pill Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => handleSelectSubTab('journal', 'daily-journal-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'journal'
                ? 'bg-white dark:bg-[#121927] text-emerald-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={13} className={activeSubTab === 'journal' ? 'text-emerald-500' : 'text-slate-400'} />
            <span>Daily Journal & Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSubTab('risk', 'risk-circuit-breaker-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'risk'
                ? 'bg-white dark:bg-[#121927] text-rose-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck size={13} className={activeSubTab === 'risk' ? 'text-emerald-500' : 'text-slate-400'} />
            <span>6 Master Rules</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSubTab('analytics', 'analytics-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'analytics'
                ? 'bg-white dark:bg-[#121927] text-amber-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={13} className={activeSubTab === 'analytics' ? 'text-amber-500' : 'text-slate-400'} />
            <span>Growth Curve & Stats</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSubTab('accounts', 'portfolio-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'accounts'
                ? 'bg-white dark:bg-[#121927] text-purple-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 size={13} className={activeSubTab === 'accounts' ? 'text-purple-500' : 'text-slate-400'} />
            <span>Personal Desks</span>
          </button>
        </div>
      </div>

      {/* 1. Daily Journal & Calendar View */}
      {activeSubTab === 'journal' && (
        <div id="daily-journal-section" className="space-y-6 sm:space-y-8 scroll-mt-24">
          <DailyTradingJournal />
        </div>
      )}

      {/* 2. 6 Master Rules View */}
      {activeSubTab === 'risk' && (
        <div id="disciplines-section" className="space-y-6 sm:space-y-8 scroll-mt-24">
          <DisciplineCards />
        </div>
      )}

      {/* 3. Growth Curve & Performance Stats View */}
      {activeSubTab === 'analytics' && (
        <div id="analytics-section" className="space-y-6 sm:space-y-8 scroll-mt-24">
          <PerformanceSummary />
          <GrowthChart />
          <UpdatedResultsSection />
        </div>
      )}

      {/* 4. Personal Desks Multi-Account View */}
      {activeSubTab === 'accounts' && (
        <div id="portfolio-section" className="space-y-6 sm:space-y-8 scroll-mt-24">
          <MultiAccountPortfolioSection />
        </div>
      )}
    </div>
  );
};
