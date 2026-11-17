import React from 'react';
import { useCockpit } from '../context/CockpitContext';
import { scrollToElement } from '../utils/scrollHelper';
import { Zap, Calendar, ShieldCheck, TrendingUp, BookOpen } from 'lucide-react';

export type MobileNavTab = 'today' | 'plan' | 'rules' | 'growth' | 'journal';

export const MobileBottomNav: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    workspaceMode,
    setWorkspaceMode,
    setJournalSubView
  } = useCockpit();

  // Determine current active mobile tab from cockpit state
  const getActiveTab = (): MobileNavTab => {
    if (activeNavTab === 'riskGuard' || activeNavTab === 'disciplines') {
      return 'rules';
    }
    if (activeNavTab === 'journal') {
      return 'journal';
    }
    if (activeNavTab === 'analytics') {
      return 'growth';
    }
    if (activeNavTab === 'planner' || activeNavTab === 'planVsActual') {
      return 'plan';
    }
    return 'today';
  };

  const currentTab = getActiveTab();

  const handleTabClick = (tab: MobileNavTab) => {
    switch (tab) {
      case 'today':
        setWorkspaceMode('hierarchy');
        setActiveNavTab('cockpit');
        scrollToElement('quarter-matrix-section');
        break;

      case 'plan':
        setWorkspaceMode('hierarchy');
        setActiveNavTab('cockpit');
        scrollToElement('quarter-matrix-section');
        break;

      case 'rules':
        setWorkspaceMode('journalRisk');
        setActiveNavTab('riskGuard');
        scrollToElement('disciplines-section');
        break;

      case 'growth':
        setWorkspaceMode('journalRisk');
        setActiveNavTab('journal');
        setJournalSubView('weekly_recap');
        scrollToElement('growth-curve-section');
        break;

      case 'journal':
        setWorkspaceMode('journalRisk');
        setActiveNavTab('journal');
        setJournalSubView('notes');
        scrollToElement('daily-journal-section');
        break;
    }
  };

  const navItems = [
    {
      id: 'today' as const,
      label: 'Today',
      icon: Zap
    },
    {
      id: 'plan' as const,
      label: 'Plan',
      icon: Calendar
    },
    {
      id: 'rules' as const,
      label: 'Rules',
      icon: ShieldCheck
    },
    {
      id: 'growth' as const,
      label: 'Growth',
      icon: TrendingUp
    },
    {
      id: 'journal' as const,
      label: 'Journal',
      icon: BookOpen
    }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 dark:bg-[#0c101a]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 px-3 shadow-2xl transition-colors">
      <div className="grid grid-cols-5 gap-1 text-center items-center">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              className="flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-90"
              aria-label={item.label}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[11px] font-mono mt-0.5 tracking-tight ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-400 dark:text-slate-500 font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
