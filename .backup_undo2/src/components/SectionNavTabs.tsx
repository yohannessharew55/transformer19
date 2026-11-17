import React from 'react';
import { useCockpit } from '../context/CockpitContext';
import {
  Layers,
  Target,
  TrendingUp,
  ShieldCheck,
  StickyNote,
  Calculator,
  Sparkles,
  GitCompare,
  Calendar,
  Building2,
  Brain,
  ShieldAlert,
  Radio,
  FileText
} from 'lucide-react';

export const SectionNavTabs: React.FC = () => {
  const { activeNavTab, setActiveNavTab, journalNotes, performanceRating } = useCockpit();

  const totalPercentage = performanceRating?.totalPercentage ?? 88;

  const cards = [
    {
      id: 'cockpit' as const,
      label: 'Execution Hierarchy',
      subtitle: 'Q1 → Q4 · 48 Weeks',
      icon: Layers,
      accentColor: 'text-[#0082ff] dark:text-[#38a1ff]'
    },
    {
      id: 'planner' as const,
      label: 'Trade Planner',
      subtitle: '1-Year Master Targets',
      icon: Sparkles,
      accentColor: 'text-indigo-500 dark:text-indigo-400'
    },
    {
      id: 'portfolio' as const,
      label: 'Multi-Account',
      subtitle: 'Personal & Prop Desks',
      icon: Building2,
      accentColor: 'text-indigo-500 dark:text-indigo-400'
    },
    {
      id: 'planVsActual' as const,
      label: 'Plan vs. Actual',
      subtitle: 'Equity & Delta Charts',
      icon: GitCompare,
      accentColor: 'text-cyan-500 dark:text-cyan-400'
    },
    {
      id: 'quant' as const,
      label: 'Quant Analytics',
      subtitle: 'Sharpe & 10K Monte Carlo',
      icon: Brain,
      accentColor: 'text-cyan-500 dark:text-cyan-400'
    },
    {
      id: 'riskGuard' as const,
      label: 'Risk & Killswitch',
      subtitle: 'Rule 05 & Drawdown Guard',
      icon: ShieldAlert,
      accentColor: 'text-rose-500 dark:text-rose-400'
    },
    {
      id: 'brokerSync' as const,
      label: 'Broker Telemetry',
      subtitle: 'Live Webhooks & TV/MT5',
      icon: Radio,
      accentColor: 'text-emerald-500 dark:text-emerald-400'
    },
    {
      id: 'tearsheet' as const,
      label: 'Investor Tearsheet',
      subtitle: 'Institutional PDF Dossier',
      icon: FileText,
      accentColor: 'text-amber-500 dark:text-amber-400'
    },
    {
      id: 'journal' as const,
      label: 'Trade Calendar & Journal',
      subtitle: 'Monthly Calendar, MT5 & Notes',
      icon: Calendar,
      accentColor: 'text-[#0082ff]'
    },
    {
      id: 'objectives' as const,
      label: 'Weekly Objectives',
      subtitle: '48 Targets & Quotas',
      icon: Target,
      accentColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'analytics' as const,
      label: 'Performance & Analytics',
      subtitle: 'PF, Win/Loss & Curve',
      icon: TrendingUp,
      accentColor: 'text-amber-500 dark:text-amber-400'
    },
    {
      id: 'calculator' as const,
      label: 'Trade Calculator',
      subtitle: 'Risk & Lot Ladder',
      icon: Calculator,
      accentColor: 'text-indigo-500 dark:text-indigo-400'
    },
    {
      id: 'rating' as const,
      label: 'AI Rating',
      subtitle: `${totalPercentage}% Performance`,
      icon: Sparkles,
      accentColor: 'text-[#0082ff]'
    },
    {
      id: 'disciplines' as const,
      label: 'Disciplines & Audit',
      subtitle: '6 Rules & Edge Audit',
      icon: ShieldCheck,
      accentColor: 'text-emerald-500'
    }
  ];

  return (
    <div className="mb-6 print:hidden">
      {/* Mobile Swipeable Tab Carousel (Smooth touch scroll with snap) */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
        {cards.map(card => {
          const Icon = card.icon;
          const isActive = activeNavTab === card.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveNavTab(card.id)}
              className={`snap-start shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-[#1a2436] dark:text-white border-slate-900 dark:border-[#0082ff] shadow-md ring-2 ring-[#0082ff]/30'
                  : 'bg-white dark:bg-[#121927] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white/15 dark:bg-[#0082ff]/25 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : card.accentColor} />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-xs whitespace-nowrap leading-tight">
                  {card.label}
                </div>
                <div className="text-[10px] font-mono opacity-70 whitespace-nowrap leading-tight mt-0.5">
                  {card.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop / Tablet App Switcher Grid (8 Cards) */}
      <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {cards.map(card => {
          const Icon = card.icon;
          const isActive = activeNavTab === card.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveNavTab(card.id)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between select-none relative overflow-hidden group ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-[#1a2436] dark:text-white border-slate-900 dark:border-[#0082ff] shadow-md ring-2 ring-[#0082ff]/30 scale-[1.02]'
                  : 'bg-white dark:bg-[#121927] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01] active:scale-[0.99] shadow-xs'
              }`}
            >
              {/* Top row: Icon and active beacon */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-white/15 dark:bg-[#0082ff]/25 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-white' : card.accentColor} />
                </div>

                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20"></span>
                )}
              </div>

              {/* Title & subtitle: 100% readable, zero truncation */}
              <div>
                <div
                  className={`font-bold text-xs sm:text-[13px] tracking-tight leading-tight ${
                    isActive
                      ? 'text-white font-extrabold'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {card.label}
                </div>

                <div
                  className={`text-[10px] font-mono mt-0.5 leading-tight ${
                    isActive
                      ? 'text-slate-300 dark:text-slate-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {card.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
