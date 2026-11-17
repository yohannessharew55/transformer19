import React, { useState, useMemo } from 'react';
import { MT5Trade, SessionWindow, SetupCategory } from '../../types/mt5';
import { parseTradeDate } from '../../utils/mt5Parser';
import {
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface MT5AnalyticsChartsProps {
  trades: MT5Trade[];
}

export const MT5AnalyticsCharts: React.FC<MT5AnalyticsChartsProps> = ({ trades }) => {
  const [activeTab, setActiveTab] = useState<'equity' | 'setups' | 'sessions'>('equity');

  // 1. Calculate Cumulative Equity Curve & Drawdown Series
  const equitySeries = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // Chronological order by closeTime
    const sorted = [...trades].sort((a, b) => {
      const tA = parseTradeDate(a.closeTime)?.getTime() ?? 0;
      const tB = parseTradeDate(b.closeTime)?.getTime() ?? 0;
      return tA - tB;
    });

    let runningPnl = 0;
    let highWatermark = 0;

    return sorted.map((t, idx) => {
      const pnl = typeof t.netProfit === 'number' && !isNaN(t.netProfit) ? t.netProfit : 0;
      runningPnl += pnl;
      if (runningPnl > highWatermark) {
        highWatermark = runningPnl;
      }
      const drawdown = highWatermark - runningPnl;
      const drawdownPct = highWatermark > 0 ? (drawdown / highWatermark) * 100 : 0;

      return {
        tradeIndex: idx + 1,
        ticket: t.ticket,
        date: t.closeTime ? String(t.closeTime).split(' ')[0] : 'N/A',
        time: t.closeTime,
        pnl,
        cumulativePnl: Number(runningPnl.toFixed(2)),
        highWatermark: Number(highWatermark.toFixed(2)),
        drawdown: Number(drawdown.toFixed(2)),
        drawdownPct: Number(drawdownPct.toFixed(1))
      };
    });
  }, [trades]);

  // 2. Setup Category Breakdown
  const setupBreakdown = useMemo(() => {
    const map = new Map<SetupCategory, { count: number; wins: number; losses: number; netPnl: number }>();

    trades.forEach(t => {
      const cat = t.setupCategory || 'Other';
      if (!map.has(cat)) {
        map.set(cat, { count: 0, wins: 0, losses: 0, netPnl: 0 });
      }
      const entry = map.get(cat)!;
      const pnl = typeof t.netProfit === 'number' && !isNaN(t.netProfit) ? t.netProfit : 0;
      entry.count++;
      entry.netPnl += pnl;
      if (pnl > 0.01) entry.wins++;
      else if (pnl < -0.01) entry.losses++;
    });

    const result: Array<{
      category: SetupCategory;
      count: number;
      wins: number;
      losses: number;
      winRate: number;
      netPnl: number;
    }> = [];

    map.forEach((val, key) => {
      const winRate = val.count > 0 ? (val.wins / val.count) * 100 : 0;
      result.push({
        category: key,
        count: val.count,
        wins: val.wins,
        losses: val.losses,
        winRate: Number(winRate.toFixed(1)),
        netPnl: Number(val.netPnl.toFixed(2))
      });
    });

    return result.sort((a, b) => b.count - a.count);
  }, [trades]);

  // 3. Session Window Breakdown
  const sessionBreakdown = useMemo(() => {
    const sessions: SessionWindow[] = ['London', 'New York', 'Asian', 'Overlap / Other'];
    const map = new Map<SessionWindow, { count: number; wins: number; losses: number; netPnl: number; volume: number }>();

    sessions.forEach(s => map.set(s, { count: 0, wins: 0, losses: 0, netPnl: 0, volume: 0 }));

    trades.forEach(t => {
      const s = t.sessionWindow || 'London';
      const entry = map.get(s) || { count: 0, wins: 0, losses: 0, netPnl: 0, volume: 0 };
      const pnl = typeof t.netProfit === 'number' && !isNaN(t.netProfit) ? t.netProfit : 0;
      const vol = typeof t.volume === 'number' && !isNaN(t.volume) ? t.volume : 0;
      entry.count++;
      entry.netPnl += pnl;
      entry.volume += vol;
      if (pnl > 0.01) entry.wins++;
      else if (pnl < -0.01) entry.losses++;
      map.set(s, entry);
    });

    return sessions.map(s => {
      const val = map.get(s)!;
      const winRate = val.count > 0 ? (val.wins / val.count) * 100 : 0;
      return {
        session: s,
        count: val.count,
        wins: val.wins,
        losses: val.losses,
        winRate: Number(winRate.toFixed(1)),
        netPnl: Number(val.netPnl.toFixed(2)),
        volume: Number(val.volume.toFixed(2))
      };
    });
  }, [trades]);

  // Max and Min for Equity Curve scaling
  const { minPnl, maxPnl, rangePnl } = useMemo(() => {
    if (equitySeries.length === 0) return { minPnl: 0, maxPnl: 100, rangePnl: 100 };
    const values = equitySeries.map(p => p.cumulativePnl);
    let min = Math.min(...values, 0);
    let max = Math.max(...values, 10);
    const padding = (max - min) * 0.1 || 10;
    const computedMin = min - padding;
    const computedMax = max + padding;
    const range = (computedMax - computedMin) || 1;
    return { minPnl: computedMin, maxPnl: computedMax, rangePnl: range };
  }, [equitySeries]);

  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
      {/* Header and Chart Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0082ff]"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Institutional Trade Diagnostics
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 size={20} className="text-[#0082ff]" />
            <span>Visual Performance & Setup Breakdown</span>
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800 self-start sm:self-auto font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('equity')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'equity'
                ? 'bg-white dark:bg-[#162032] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp size={13} className="text-emerald-500" />
            <span>Cumulative Curve</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('setups')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'setups'
                ? 'bg-white dark:bg-[#162032] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Target size={13} className="text-[#0082ff]" />
            <span>Setup Breakdown</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sessions'
                ? 'bg-white dark:bg-[#162032] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock size={13} className="text-amber-500" />
            <span>Session Windows</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Cumulative Equity Curve with Drawdown Watermark */}
      {activeTab === 'equity' && (
        <div>
          {equitySeries.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-slate-400">
              No closed tickets available to plot equity curve. Drop an MT5 report or load sample data.
            </div>
          ) : (
            <div>
              {/* Telemetry Header */}
              <div className="flex items-center justify-between text-xs font-mono mb-3">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Latest Realized Net</span>
                    <span
                      className={`text-base font-black ${
                        equitySeries[equitySeries.length - 1].cumulativePnl >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      ${(equitySeries[equitySeries.length - 1].cumulativePnl || 0).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">High Watermark Peak</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ${(equitySeries[equitySeries.length - 1].highWatermark || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {hoveredPoint && (
                  <div className="text-right p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-fadeIn">
                    <span className="text-[10px] text-slate-400 block">Trade #{hoveredPoint.tradeIndex} · {hoveredPoint.ticket}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      P/L: {hoveredPoint.pnl >= 0 ? '+' : ''}${(hoveredPoint.pnl || 0).toFixed(2)} | Net: ${(hoveredPoint.cumulativePnl || 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive High-Precision SVG Equity Curve Canvas */}
              <div className="relative w-full h-[260px] bg-slate-50/50 dark:bg-[#0c101a]/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 select-none overflow-hidden">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 220" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>

                    <linearGradient id="watermarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0082ff" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0082ff" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Zero Line */}
                  {(() => {
                    const rawZeroY = 200 - ((0 - minPnl) / rangePnl) * 180;
                    const zeroY = isNaN(rawZeroY) ? 100 : Math.max(10, Math.min(210, rawZeroY));
                    return (
                      <line
                        x1="0"
                        y1={zeroY}
                        x2="800"
                        y2={zeroY}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                        strokeOpacity="0.5"
                      />
                    );
                  })()}

                  {/* High Watermark Line */}
                  {(() => {
                    if (equitySeries.length < 2) return null;
                    const stepX = 800 / (equitySeries.length - 1);

                    const wmPoints = equitySeries.map((pt, idx) => {
                      const x = idx * stepX;
                      const rawY = 200 - ((pt.highWatermark - minPnl) / rangePnl) * 180;
                      const y = isNaN(rawY) ? 100 : Math.max(10, Math.min(210, rawY));
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    }).join(' ');

                    return (
                      <polyline
                        points={wmPoints}
                        fill="none"
                        stroke="url(#watermarkGrad)"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />
                    );
                  })()}

                  {/* Main Cumulative Equity Line & Area */}
                  {(() => {
                    if (equitySeries.length === 0) return null;
                    const divisor = equitySeries.length > 1 ? equitySeries.length - 1 : 1;
                    const stepX = 800 / divisor;

                    const points = equitySeries.map((pt, idx) => {
                      const x = equitySeries.length === 1 ? 400 : idx * stepX;
                      const rawY = 200 - ((pt.cumulativePnl - minPnl) / rangePnl) * 180;
                      const y = isNaN(rawY) ? 100 : Math.max(10, Math.min(210, rawY));
                      return { x, y, pt };
                    });

                    const polyPoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
                    const areaPoints = `0,220 ${polyPoints} 800,220`;

                    return (
                      <>
                        <polygon points={areaPoints} fill="url(#equityGradient)" />
                        <polyline
                          points={polyPoints}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {points.map((p, idx) => (
                          <circle
                            key={idx}
                            cx={p.x}
                            cy={p.y}
                            r={hoveredPoint?.tradeIndex === p.pt.tradeIndex ? '6' : '3.5'}
                            fill={p.pt.pnl >= 0 ? '#10b981' : '#f43f5e'}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPoint(p.pt)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Bottom Legend */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-emerald-500 rounded"></span>
                    <span>Cumulative Net P/L ($)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-b border-dashed border-[#0082ff]"></span>
                    <span>High Watermark Peak</span>
                  </div>
                </div>
                <span>{equitySeries.length} closed trades plotted</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Setup Category Breakdown */}
      {activeTab === 'setups' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {setupBreakdown.map(setup => {
              const isProfit = setup.netPnl >= 0;
              return (
                <div
                  key={setup.category}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0082ff]"></span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {setup.category}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-mono font-black ${
                        isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}${(setup.netPnl || 0).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400 text-[10px]">Win Rate</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {setup.winRate}% ({setup.wins}W / {setup.losses}L)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, setup.winRate))}%` }}
                      />
                      <div
                        className="bg-rose-500 h-full rounded-r-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, 100 - setup.winRate))}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span>Executions: {setup.count} Trades</span>
                    <span>Avg: ${(setup.count > 0 ? (setup.netPnl / setup.count).toFixed(2) : '0.00')} / trade</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Session Window Breakdown */}
      {activeTab === 'sessions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sessionBreakdown.map(sess => {
            const isProfit = sess.netPnl >= 0;
            return (
              <div
                key={sess.session}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {sess.session}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      {sess.count} Trades
                    </span>
                  </div>

                  <div className="my-2">
                    <span
                      className={`text-lg font-mono font-black ${
                        isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}${(sess.netPnl || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-slate-400">
                    <span>Win Rate:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sess.winRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#0082ff] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, sess.winRate))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                    <span>Volume: {(sess.volume || 0).toFixed(2)} Lots</span>
                    <span className="text-emerald-500">{sess.wins}W</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
