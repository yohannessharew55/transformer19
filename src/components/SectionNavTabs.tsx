import React from 'react';
import { useCockpit } from '../context/CockpitContext';
import { scrollToElement } from '../utils/scrollHelper';
import {
  Layers,
  Building2,
  Calendar
} from 'lucide-react';

export const SectionNavTabs: React.FC = () => {
  const {
    workspaceMode,
    setWorkspaceMode,
    setActiveNavTab,
    accounts
  } = useCockpit();

  // The 3 Consolidated Lean Workspaces (Execution Hierarchy at the FRONT)
  const workspaces = [
    {
      id: 'hierarchy' as const,
      label: 'Execution Hierarchy',
      badge: '48 Weeks',
      subtitle: 'Q1 → Q4 · Master Roadmap & Devotion',
      icon: Layers,
      activeColor: 'bg-[#0082ff] text-white',
      iconColor: 'text-[#0082ff]'
    },
    {
      id: 'accounts' as const,
      label: 'Portfolio Accounts',
      badge: `${accounts.length} Accounts`,
      subtitle: 'Manage & Calibrate Trading Desks',
      icon: Building2,
      activeColor: 'bg-indigo-600 text-white',
      iconColor: 'text-indigo-500'
    },
    {
      id: 'journalRisk' as const,
      label: 'Journal & Risk',
      badge: 'Daily + Risk Guard',
      subtitle: 'Calendar, 6 Rules & Personal Desks',
      icon: Calendar,
      activeColor: 'bg-emerald-600 text-white',
      iconColor: 'text-emerald-500'
    }
  ];

  return (
    <div className="mb-6 sm:mb-8 print:hidden space-y-3">
      {/* 3-WORKSPACE SEGMENTED GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {workspaces.map(ws => {
          const Icon = ws.icon;
          const isSelected =
            ws.id === 'journalRisk'
              ? workspaceMode === 'journalRisk' || workspaceMode === 'performance'
              : ws.id === 'accounts'
              ? workspaceMode === 'accounts' || workspaceMode === 'planner'
              : workspaceMode === ws.id;

          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => {
                setWorkspaceMode(ws.id);
                if (ws.id === 'hierarchy') setActiveNavTab('cockpit');
                else if (ws.id === 'accounts') setActiveNavTab('portfolio');
                else if (ws.id === 'journalRisk') setActiveNavTab('journal');

                scrollToElement('workspace-container');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none flex flex-col justify-between relative overflow-hidden group shadow-xs ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-[#151f30] dark:text-white border-slate-900 dark:border-[#0082ff] ring-2 ring-[#0082ff]/30 shadow-md scale-[1.01]'
                  : 'bg-white dark:bg-[#121927] border-slate-200 dark:border-slate-800/90 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.005]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                >
                  <Icon size={16} className={isSelected ? 'text-white' : ws.iconColor} />
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {ws.badge}
                </span>
              </div>

              <div>
                <div className={`font-bold text-sm tracking-tight leading-tight ${
                  isSelected ? 'text-white font-extrabold' : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {ws.label}
                </div>
                <div className={`text-[11px] font-mono mt-0.5 leading-tight truncate ${
                  isSelected ? 'text-slate-300 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {ws.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
