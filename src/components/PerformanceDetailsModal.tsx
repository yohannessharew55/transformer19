import React from 'react';
import { useCockpit } from '../context/CockpitContext';
import {
  X,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Shield,
  Layers,
  Award,
  Zap,
  Target
} from 'lucide-react';

interface PerformanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceDetailsModal: React.FC<PerformanceDetailsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    performanceRating,
    isRatingLoading,
    refreshPerformanceRating,
    metrics,
    traderName,
    devotionGatePassedToday,
    setActiveNavTab
  } = useCockpit();

  if (!isOpen) return null;

  const totalPercentage = performanceRating?.totalPercentage ?? 88;
  const metricsList = performanceRating?.metrics ?? [];

  const getScoreColor = (score: number, max: number = 10) => {
    const ratio = score / max;
    if (ratio >= 0.8) return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500',
      badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    };
    if (ratio >= 0.6) return {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500',
      badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    };
    return {
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500',
      badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    };
  };

  const getTierLabel = (pct: number) => {
    if (pct >= 90) return { title: 'Master Operator Tier', desc: 'Apex execution discipline & capital compounding' };
    if (pct >= 80) return { title: 'Institutional Tier', desc: 'Consistent risk management & protocol adherence' };
    if (pct >= 70) return { title: 'Controlled Growth Tier', desc: 'Solid foundation with minor optimization vectors' };
    return { title: 'Risk Gated Tier', desc: 'Mandatory circuit breaker & devotion protocol review required' };
  };

  const tier = getTierLabel(totalPercentage);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Circular Gauge Ring */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#0082ff] to-[#0055b3] flex items-center justify-center text-white shadow-lg shadow-[#0082ff]/20">
                <div className="text-center">
                  <span className="font-mono text-xl sm:text-2xl font-black leading-none block">
                    {totalPercentage}%
                  </span>
                  <span className="text-[8px] font-mono tracking-widest uppercase opacity-80">
                    Rating
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <Sparkles size={10} />
                    Deterministic Mathematical Audit
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Operator: <strong className="text-slate-700 dark:text-slate-200">{traderName}</strong>
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
                  {tier.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tier.desc}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close details"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Telemetry Strip */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-center font-mono text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Win Rate</span>
              <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                {(metrics.completedWinRate ?? 66.2).toFixed(1)}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Day 1 Progress</span>
              <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                {metrics.completedSessions} / {metrics.totalSessions}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Realized Harvest</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                ${(metrics.actualTotalPnL ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Devotion Gate</span>
              <span className={`font-black text-xs sm:text-sm ${devotionGatePassedToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {devotionGatePassedToday ? 'Passed' : 'Gated'}
              </span>
            </div>
          </div>
        </div>

        {/* Diagnosis & 6 Core Dimensions Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Summary Diagnosis Quote */}
          {performanceRating?.summaryDiagnosis && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-sans">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400 mb-1 font-mono">
                <Target size={12} />
                <span>Forensic Real Feed Analysis</span>
              </div>
              "{performanceRating.summaryDiagnosis}"
            </div>
          )}

          {/* The 6 Core Dimension Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>6 Core Performance Dimensions</span>
              <span>Target 10.0</span>
            </div>

            {metricsList.map(item => {
              const color = getScoreColor(item.score, item.maxScore);
              const percentage = Math.round((item.score / item.maxScore) * 100);

              return (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#121927] hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-extrabold border ${color.badge}`}>
                        {(item.score ?? 0).toFixed(1)} / {item.maxScore}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Meter */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color.bg}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-1.5">
                    {item.assessment}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Live Evidence:</span>
                    <span className="truncate">{item.evidence}</span>
                  </div>

                  {item.actionableAdvice && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-start gap-1">
                      <Zap size={12} className="shrink-0 mt-0.5 text-blue-500" />
                      <span>{item.actionableAdvice}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={refreshPerformanceRating}
            disabled={isRatingLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#162032] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0082ff] dark:hover:text-[#0082ff] transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Recalculate deterministic mathematical audit"
          >
            <RefreshCw size={13} className={isRatingLoading ? 'animate-spin text-[#0082ff]' : 'text-slate-500'} />
            <span>{isRatingLoading ? 'Auditing Telemetry...' : 'Recalculate Audit Score'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveNavTab('audit');
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#0082ff] hover:bg-[#0070df] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Full Forensic Audit</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
