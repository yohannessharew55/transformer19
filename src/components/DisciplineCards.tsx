import React from 'react';
import { INITIAL_DISCIPLINES } from '../data/roadmapData';
import { useCockpit } from '../context/CockpitContext';
import { BookOpen, Clock, RefreshCw, Power, ShieldAlert, Layers } from 'lucide-react';

export const DisciplineCards: React.FC = () => {
  const { devotionGatePassedToday, toggleDevotionGate } = useCockpit();

  const getIcon = (type: string) => {
    switch (type) {
      case 'devotion': return <BookOpen size={16} className="text-[#8b5cf6]" />;
      case 'session': return <Clock size={16} className="text-[#0284c7]" />;
      case 'reset': return <RefreshCw size={16} className="text-[#e07a5f]" />;
      case 'terminal': return <Power size={16} className="text-[#ef4444]" />;
      case 'demotion': return <ShieldAlert size={16} className="text-[#ef4444]" />;
      case 'lotsize': return <Layers size={16} className="text-[#10b981]" />;
      default: return <Clock size={16} className="text-[#e07a5f]" />;
    }
  };

  const getBorderTop = (type: string) => {
    switch (type) {
      case 'devotion': return 'border-t-[#8b5cf6]';
      case 'session': return 'border-t-[#0284c7]';
      case 'reset': return 'border-t-[#e07a5f]';
      case 'terminal': return 'border-t-[#ef4444]';
      case 'demotion': return 'border-t-[#ef4444]';
      case 'lotsize': return 'border-t-[#10b981]';
      default: return 'border-t-[#e07a5f]';
    }
  };

  return (
    <div id="disciplines-section" className="mb-8 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-4 bg-[#e07a5f] rounded-full"></span>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-[#1e2530] dark:text-white">
            The 6 Master Execution Disciplines
          </h2>
        </div>
        <span className="text-xs text-[#718096] font-mono font-bold">
          Governing Operating Constitution
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {INITIAL_DISCIPLINES.map((rule, idx) => {
          const isDevotion = rule.type === 'devotion';

          return (
            <div
              key={rule.id}
              className={`scandi-card p-4 sm:p-5 relative overflow-hidden transition-all duration-300 border-t-4 ${getBorderTop(
                rule.type
              )}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#f1efea] dark:bg-[#2d3748]">
                    {getIcon(rule.type)}
                  </div>
                  <span className="font-mono text-[11px] font-extrabold text-[#718096] uppercase tracking-wider">
                    {`Rule 0${idx + 1}`}
                  </span>
                </div>

                {isDevotion && (
                  <button
                    type="button"
                    onClick={toggleDevotionGate}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border transition-all cursor-pointer ${
                      devotionGatePassedToday
                        ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/30'
                        : 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                    }`}
                  >
                    {devotionGatePassedToday ? '✓ Devotion Verified' : '! Gated'}
                  </button>
                )}
              </div>

              <h4 className="text-sm font-bold text-[#1e2530] dark:text-white mb-1.5">
                {rule.title}
              </h4>

              <p className="text-xs text-[#718096] dark:text-[#a0aec0] leading-relaxed font-normal">
                {rule.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
