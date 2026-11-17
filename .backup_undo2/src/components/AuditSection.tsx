import React from 'react';
import { INITIAL_AUDIT } from '../data/roadmapData';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AuditSection: React.FC = () => {
  const getHeaderIcon = (category: string) => {
    switch (category) {
      case 'strengths':
        return <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />;
      case 'weaknesses':
        return <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />;
      case 'mechanics':
        return <ShieldCheck size={16} className="text-[#e07a5f]" />;
      default:
        return null;
    }
  };

  const getBorderTop = (category: string) => {
    switch (category) {
      case 'strengths':
        return 'border-t-emerald-500';
      case 'weaknesses':
        return 'border-t-rose-500';
      case 'mechanics':
        return 'border-t-[#e07a5f]';
      default:
        return 'border-t-[#718096]';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-4 bg-[#e07a5f] rounded-full"></span>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-[#1e2530] dark:text-white">
            Forensic Audit & System Truth
          </h2>
        </div>
        <span className="text-xs text-[#718096] font-mono font-bold">
          1,588 Trade Historical Post-Mortem
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {INITIAL_AUDIT.map(item => (
          <div
            key={item.id}
            className={`scandi-card p-4 sm:p-5 relative overflow-hidden transition-all duration-300 border-t-4 ${getBorderTop(
              item.category
            )}`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 rounded-lg bg-[#f1efea] dark:bg-[#2d3748]">
                {getHeaderIcon(item.category)}
              </div>
              <h3 className="text-sm font-extrabold text-[#1e2530] dark:text-white">
                {item.title}
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-[#718096] dark:text-[#a0aec0]">
              {item.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#e07a5f] font-bold shrink-0">·</span>
                  <div>
                    <strong className="text-[#1e2530] dark:text-white mr-1 font-bold">
                      {pt.bold}
                    </strong>
                    <span>{pt.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
