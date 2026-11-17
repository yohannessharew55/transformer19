import React from 'react';
import { useCockpit } from '../../context/CockpitContext';
import { scrollToElement } from '../../utils/scrollHelper';
import { DailyTradingJournal } from '../DailyTradingJournal';
import { PerformanceSummary } from '../PerformanceSummary';
import { GrowthChart } from '../GrowthChart';
import { UpdatedResultsSection } from '../UpdatedResultsSection';
import { InstitutionalTearsheetReport } from '../InstitutionalTearsheetReport';
import { PerformanceRatingSection } from '../PerformanceRatingSection';
import { InstitutionalQuantAnalytics } from '../InstitutionalQuantAnalytics';
import { Calendar, TrendingUp, FileText, Brain, Sparkles } from 'lucide-react';
import type { ActiveTab } from '../../context/CockpitContext';

export const LogPerformanceWorkspace: React.FC = () => {
  const { activeNavTab, setActiveNavTab } = useCockpit();

  const getSubTabFromNavTab = (tab: string): 'journal' | 'analytics' | 'tearsheet' | 'rating' | 'quant' => {
    if (tab === 'analytics') return 'analytics';
    if (tab === 'tearsheet') return 'tearsheet';
    if (tab === 'rating') return 'rating';
    if (tab === 'quant') return 'quant';
    return 'journal';
  };

  // Synchronously derived during render: zero delay, no DOM collapse or scroll clamping
  const activeSubTab = getSubTabFromNavTab(activeNavTab);

  const handleSelectSubTab = (tab: 'journal' | 'analytics' | 'tearsheet' | 'rating' | 'quant', elementId?: string) => {
    setActiveNavTab(tab);
    if (elementId) {
      scrollToElement(elementId);
    }
  };

  return (
    <div id="performance-workspace" className="space-y-6 sm:space-y-8 animate-fadeIn scroll-mt-20">
      {/* Sub-Workspace Selector Pill Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => handleSelectSubTab('journal', 'daily-journal-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'journal'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={13} className={activeSubTab === 'journal' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>Calendar & Journal</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSubTab('analytics', 'analytics-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'analytics'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={13} className={activeSubTab === 'analytics' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>Analytics & Growth</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSubTab('tearsheet', 'tearsheet-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'tearsheet'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText size={13} className={activeSubTab === 'tearsheet' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>Investor Tearsheet</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSubTab('rating', 'performance-rating-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'rating'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={13} className={activeSubTab === 'rating' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>AI Rating</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSubTab('quant', 'quant-analytics-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'quant'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Brain size={13} className={activeSubTab === 'quant' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>Quant & Monte Carlo</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Performance & Debrief Desk
        </div>
      </div>

      {/* Render Active View */}
      {activeSubTab === 'journal' && <DailyTradingJournal />}
      {activeSubTab === 'analytics' && (
        <div className="space-y-8">
          <PerformanceSummary />
          <GrowthChart />
          <UpdatedResultsSection />
        </div>
      )}
      {activeSubTab === 'tearsheet' && <InstitutionalTearsheetReport />}
      {activeSubTab === 'rating' && <PerformanceRatingSection />}
      {activeSubTab === 'quant' && <InstitutionalQuantAnalytics />}
    </div>
  );
};
