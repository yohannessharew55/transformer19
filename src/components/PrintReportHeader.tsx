import React from 'react';
import { useCockpit } from '../context/CockpitContext';

export const PrintReportHeader: React.FC = () => {
  const { traderName, metrics, devotionGatePassedToday, performanceRating } = useCockpit();

  const totalPercentage = performanceRating?.totalPercentage ?? 88;

  return (
    <div className="print-only mb-6 pb-6 border-b-2 border-slate-900 text-slate-900 font-sans">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-widest font-black uppercase text-slate-500 mb-1">
            OFFICIAL 48-WEEK WEEKLY EXECUTION BLUEPRINT & PERFORMANCE AUDIT // TRANSFORMER19
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            Weekly Execution Blueprint Report
          </h1>
          <div className="text-xs font-mono text-slate-600 mt-1">
            OPERATOR: <span className="font-bold text-slate-900">{traderName || 'Yohannes Sharew'}</span> · Generated: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · Master Blueprint: $50 → $30,000 (+$7,150 Banked Sweeps)
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block p-2 rounded-xl border border-slate-900 text-center min-w-[120px]">
            <span className="block text-[9px] font-mono uppercase font-bold text-slate-600">AI Performance</span>
            <span className="text-2xl font-mono font-black text-slate-900">{totalPercentage}%</span>
            <span className="block text-[8px] font-mono text-slate-500">6 Areas Evaluated</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-300 text-center font-mono text-xs">
        <div className="p-2 border border-slate-300 rounded-lg">
          <span className="block text-[9px] uppercase text-slate-500 font-bold">Working Equity</span>
          <span className="font-bold text-sm text-slate-900">${(metrics.currentWorkingEquity ?? 50).toFixed(2)}</span>
        </div>
        <div className="p-2 border border-slate-300 rounded-lg">
          <span className="block text-[9px] uppercase text-slate-500 font-bold">Banked Physical Cash</span>
          <span className="font-bold text-sm text-slate-900">${(metrics.currentBankedCash ?? 0).toFixed(2)}</span>
        </div>
        <div className="p-2 border border-slate-300 rounded-lg">
          <span className="block text-[9px] uppercase text-slate-500 font-bold">Total Net Worth</span>
          <span className="font-bold text-sm text-slate-900">${(metrics.currentTotalNetWorth ?? 50).toFixed(2)}</span>
        </div>
        <div className="p-2 border border-slate-300 rounded-lg">
          <span className="block text-[9px] uppercase text-slate-500 font-bold">Execution Progress</span>
          <span className="font-bold text-sm text-slate-900">{metrics.completedSessions} / {metrics.totalSessions} Sessions</span>
        </div>
        <div className="p-2 border border-slate-300 rounded-lg">
          <span className="block text-[9px] uppercase text-slate-500 font-bold">Rule 01 Devotion</span>
          <span className="font-bold text-sm text-slate-900">{devotionGatePassedToday ? 'VERIFIED' : 'GATED'}</span>
        </div>
      </div>
    </div>
  );
};
