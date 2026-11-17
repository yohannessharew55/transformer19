import React, { useState } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { PerformanceMetricItem } from '../types';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Flame,
  TrendingUp,
  Clock,
  Activity,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Calendar,
  Layers,
  Award
} from 'lucide-react';

const METRIC_ICONS: Record<string, React.ElementType> = {
  ruleRespecting: ShieldCheck,
  riskManagement: ShieldAlert,
  discipline: Flame,
  profitMaximizing: TrendingUp,
  patience: Clock,
  tradeManagement: Activity
};

export const PerformanceRatingSection: React.FC = () => {
  const {
    performanceRating,
    isRatingLoading,
    refreshPerformanceRating,
    metrics,
    devotionGatePassedToday,
    journalNotes
  } = useCockpit();

  // Expanded card tracking for "show details when touched"
  const [expandedCardKey, setExpandedCardKey] = useState<string | null>(null);

  const toggleCard = (key: string) => {
    setExpandedCardKey(prev => (prev === key ? null : key));
  };

  const totalPercentage = performanceRating?.totalPercentage ?? 88;

  // Strict color threshold formatting
  // Green for >75%, Orange for >50%, Red for <=50%
  const getScoreColor = (percentOrScore10: number, isScoreOutOf10 = false) => {
    const val = isScoreOutOf10 ? percentOrScore10 * 10 : percentOrScore10;
    if (val > 75) {
      return {
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800/80',
        bar: 'bg-emerald-500',
        ring: 'ring-emerald-500/30'
      };
    }
    if (val > 50) {
      return {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800/80',
        bar: 'bg-amber-500',
        ring: 'ring-amber-500/30'
      };
    }
    return {
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-900/80',
      bar: 'bg-rose-500',
      ring: 'ring-rose-500/30'
    };
  };

  const totalColor = getScoreColor(totalPercentage);

  return (
    <section className="mb-12 animate-fadeIn">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800/80 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e07a5f] animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Gemini AI Telemetry Audit Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Award className="text-[#e07a5f]" size={28} />
            <span>AI Performance Rating</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Automated forensic grading out of 10.0 across 6 operational areas evaluated by Gemini AI using planned roadmap milestones, actual session harvests, and daily journal notes.
          </p>
        </div>

        {/* Action Button: Run AI Evaluation */}
        <button
          type="button"
          onClick={() => refreshPerformanceRating()}
          disabled={isRatingLoading}
          className="btn-terracotta flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isRatingLoading ? 'animate-spin' : ''} />
          <span>{isRatingLoading ? 'Gemini Auditing Data...' : 'Re-Audit with Gemini'}</span>
        </button>
      </div>

      {/* Top Banner: Total Performance Percentage (Out of 100%) */}
      <div className={`p-6 sm:p-7 rounded-3xl border ${totalColor.border} ${totalColor.bg} mb-8 shadow-xs relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Big Percentage Presentation */}
          <div className="flex items-center gap-5">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-[#121927] border ${totalColor.border} flex flex-col items-center justify-center p-2 shadow-sm shrink-0`}>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 leading-tight">Total Score</span>
              <span className={`text-3xl sm:text-4xl font-mono font-black tracking-tight ${totalColor.text}`}>
                {totalPercentage}%
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-0.5">Scale: 100%</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-xs font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${totalColor.border} ${totalColor.bg} ${totalColor.text}`}>
                  {totalPercentage > 75 ? 'Tier 1 · Elite Execution (>75%)' : totalPercentage > 50 ? 'Tier 2 · Moderate Variance (>50%)' : 'Tier 3 · Risk Critical (<50%)'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Last evaluated: {new Date(performanceRating.assessedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                Transformer19 Forensic Performance Index
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                {performanceRating.summaryDiagnosis}
              </p>
            </div>
          </div>

          {/* Telemetry Summary Stats */}
          <div className="grid grid-cols-3 gap-2.5 lg:border-l lg:border-black/10 dark:lg:border-white/10 lg:pl-6 shrink-0">
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#121927]/70 text-center">
              <span className="block text-[10px] font-mono uppercase text-slate-400 font-bold">Devotion</span>
              <span className={`text-xs font-mono font-bold ${devotionGatePassedToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {devotionGatePassedToday ? 'Verified' : 'Gated'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#121927]/70 text-center">
              <span className="block text-[10px] font-mono uppercase text-slate-400 font-bold">Win Rate</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {metrics.completedWinRate.toFixed(1)}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#121927]/70 text-center">
              <span className="block text-[10px] font-mono uppercase text-slate-400 font-bold">Journals</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {journalNotes.length} Notes
              </span>
            </div>
          </div>
        </div>

        {/* Subtle Background Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#e07a5f]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid of the 6 Core Performance Metrics (Each Rated out of 10) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            6 Operational Metric Areas (Rated Out of 10 · Touch Card for Forensic Proof)
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Touch or hover to inspect details
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {performanceRating.metrics.map(metric => {
            const Icon = METRIC_ICONS[metric.key] || Sparkles;
            const scoreColor = getScoreColor(metric.score, true);
            const isExpanded = expandedCardKey === metric.key;

            return (
              <div
                key={metric.key}
                onClick={() => toggleCard(metric.key)}
                className={`group relative rounded-2xl p-5 bg-white dark:bg-[#121927] border transition-all duration-300 cursor-pointer select-none ${
                  isExpanded
                    ? `shadow-xl ${scoreColor.border} ring-2 ${scoreColor.ring} -translate-y-1`
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Card Top: Area Name, Icon & Score out of 10 */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${scoreColor.bg} ${scoreColor.text} shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {metric.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        Operational Area
                      </span>
                    </div>
                  </div>

                  {/* Score Pill /10 */}
                  <div className="text-right">
                    <div className={`font-mono text-xl font-black ${scoreColor.text} leading-none`}>
                      {metric.score.toFixed(1)}
                      <span className="text-xs font-bold text-slate-400">/10</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">
                      {((metric.score / metric.maxScore) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Progress Fill Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${scoreColor.bar}`}
                    style={{ width: `${Math.min(100, (metric.score / metric.maxScore) * 100)}%` }}
                  />
                </div>

                {/* Short Assessment (Always visible) */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                  {metric.assessment}
                </p>

                {/* Expandable Details Container (Triggered when touched/clicked) */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 animate-fadeIn text-xs">
                    {/* Telemetry Evidence */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                        <FileText size={11} className="text-[#e07a5f]" />
                        <span>Telemetry Evidence:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                        {metric.evidence}
                      </p>
                    </div>

                    {/* Actionable Advice to reach 10/10 */}
                    <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 mb-1">
                        <Lightbulb size={11} className="text-amber-500" />
                        <span>Advice to Reach 10/10:</span>
                      </div>
                      <p className="text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
                        {metric.actionableAdvice}
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Footer: Touch hint & Chevron */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="group-hover:text-[#e07a5f] transition-colors">
                    {isExpanded ? 'Tap to collapse' : 'Tap for forensic details'}
                  </span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
