import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useCockpit } from '../context/CockpitContext';
import { TrendingUp, BarChart3, ShieldAlert, PieChart, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

export const GrowthChart: React.FC = () => {
  const {
    theme,
    chartViewMode,
    setChartViewMode,
    scaleMode,
    setScaleMode,
    metrics,
    cockpitData,
    quarters,
    balanceReport
  } = useCockpit();

  const isDark = theme === 'dark';

  // Balanced contrast color palette
  const colors = useMemo(() => {
    return {
      text: isDark ? '#94a3b8' : '#64748b',
      heading: isDark ? '#f8fafc' : '#0f172a',
      grid: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)',
      tooltipBg: isDark ? '#0b0f19' : '#ffffff',
      tooltipBorder: isDark ? '#334155' : '#cbd5e1',
      primaryLine: isDark ? '#38bdf8' : '#0284c7',
      primaryFill: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
      goldLine: '#f59e0b',
      goldFill: 'rgba(245, 158, 11, 0.08)',
      greenLine: '#10b981',
      purpleLine: '#a855f7',
      redLine: '#f43f5e',
      baselineLine: isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.45)'
    };
  }, [isDark]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Dynamic 48-Week Compounding Trajectory computed directly from user's live daily trade edits
  const dynamicTrajectory = useMemo(() => {
    const seed = cockpitData?.seedCapital || 50;
    let runningLiveEquity = seed;
    let runningLiveBanked = 0;
    let runningPlannedEquity = seed;
    let runningPlannedBanked = 0;

    const weeks = balanceReport?.weeks || [];

    return weeks.map((wb, idx) => {
      const pGain = wb.plannedTradingGain ?? 0;
      const pSweep = wb.plannedHarvestSweep ?? 0;
      runningPlannedEquity = runningPlannedEquity + pGain - pSweep;
      runningPlannedBanked += pSweep;
      const plannedTotal = runningPlannedEquity + runningPlannedBanked;

      // Realtime Actuals:
      // Does this week have completed days or actual PnL logged?
      const hasLogs = Boolean(
        wb.hasActualLogs ||
        wb.isWeekFullyCompleted ||
        wb.days.some(d => d.status === 'completed' || d.actualPnl !== undefined)
      );
      const actualGain = wb.actualTradingGain ?? 0;
      const actualSweep = wb.actualHarvestSweep ?? 0;

      if (hasLogs) {
        // Week has actual executed trade data:
        // Use the exact realized ending balance and banked sweep
        runningLiveEquity = wb.actualEndingBalance;
        runningLiveBanked += actualSweep;
      } else {
        // Future week: compounds forward dynamically from current live equity base using roadmap targets!
        runningLiveEquity = runningLiveEquity + pGain - pSweep;
        runningLiveBanked += pSweep;
      }

      const liveTotal = runningLiveEquity + runningLiveBanked;

      return {
        index: idx,
        weekNum: idx + 1,
        label: `W${String(idx + 1).padStart(2, '0')}`,
        lotNum: parseFloat(wb.lotSize) || 0.01,
        lotStr: wb.lotSize,
        hasLogs,

        // Dynamic Live Numbers (updates with every daily session edit!)
        equity: Math.round(runningLiveEquity * 100) / 100,
        banked: Math.round(runningLiveBanked * 100) / 100,
        total: Math.round(liveTotal * 100) / 100,

        // Roadmap Baseline Target (for visual comparison against target)
        plannedEquity: Math.round(runningPlannedEquity * 100) / 100,
        plannedBanked: Math.round(runningPlannedBanked * 100) / 100,
        plannedTotal: Math.round(plannedTotal * 100) / 100
      };
    });
  }, [cockpitData?.seedCapital, balanceReport]);

  // 1. Line Chart Data: 48-Week Dynamic Compounding Curve
  const growthLineData = useMemo(() => {
    const labels = dynamicTrajectory.map(p => p.label);
    const equityData = dynamicTrajectory.map(p => p.equity);
    const bankedData = dynamicTrajectory.map(p => p.banked);
    const totalData = dynamicTrajectory.map(p => p.total);
    const plannedTotalData = dynamicTrajectory.map(p => p.plannedTotal);

    return {
      labels,
      datasets: [
        {
          label: 'Total Realized Net Worth ($)',
          data: totalData,
          borderColor: colors.goldLine,
          backgroundColor: colors.goldFill,
          borderWidth: 2.5,
          tension: 0.35,
          fill: false,
          pointRadius: (ctx: any) => (dynamicTrajectory[ctx.dataIndex]?.hasLogs ? 4.5 : 1.5),
          pointHoverRadius: 6,
          pointBackgroundColor: colors.goldLine
        },
        {
          label: 'MT5 Working Equity ($)',
          data: equityData,
          borderColor: colors.primaryLine,
          backgroundColor: colors.primaryFill,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointRadius: (ctx: any) => (dynamicTrajectory[ctx.dataIndex]?.hasLogs ? 5 : 2),
          pointHoverRadius: 7,
          pointBackgroundColor: (ctx: any) => (dynamicTrajectory[ctx.dataIndex]?.hasLogs ? '#10b981' : colors.primaryLine)
        },
        {
          label: 'Cumulative Cash Banked ($)',
          data: bankedData,
          borderColor: colors.greenLine,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 4],
          tension: 0.2,
          fill: false,
          pointRadius: 1,
          pointHoverRadius: 5,
          pointBackgroundColor: colors.greenLine
        },
        {
          label: 'Roadmap Target Plan ($)',
          data: plannedTotalData,
          borderColor: colors.baselineLine,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [3, 3],
          tension: 0.35,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    };
  }, [dynamicTrajectory, colors]);

  // 2. Bar Chart Data: Monthly Gross vs Banked Cash Sweeps (Dynamic per month)
  const monthlyBarData = useMemo(() => {
    const monthsList: {
      name: string;
      gross: number;
      bankOut: number;
      hasLogs: boolean;
    }[] = [];

    quarters.forEach(q => {
      q.months.forEach(m => {
        let actualGross = 0;
        let actualBankOut = 0;
        let plannedGross = 0;
        let plannedBankOut = 0;
        let monthHasLogs = false;

        m.weeks.forEach(w => {
          const wb = balanceReport?.weekMap.get(w.id);
          plannedGross += wb?.plannedTradingGain ?? 0;
          plannedBankOut += wb?.plannedHarvestSweep ?? 0;

          if (wb?.hasActualLogs || w.days.some(d => d.status === 'completed' || d.actualPnl !== undefined)) {
            monthHasLogs = true;
          }
          actualGross += wb?.actualTradingGain ?? 0;
          actualBankOut += wb?.actualHarvestSweep ?? 0;
        });

        monthsList.push({
          name: `${m.monthNum} (${m.name.split('(')[0].trim()})`,
          gross: monthHasLogs ? actualGross : plannedGross,
          bankOut: monthHasLogs ? actualBankOut : plannedBankOut,
          hasLogs: monthHasLogs
        });
      });
    });

    return {
      labels: monthsList.map(m => m.name),
      datasets: [
        {
          label: 'Gross Profit Generated ($)',
          data: monthsList.map(m => m.gross),
          backgroundColor: isDark ? 'rgba(56, 189, 248, 0.8)' : '#0284c7',
          borderRadius: 6
        },
        {
          label: '20% Physical Sweep ($)',
          data: monthsList.map(m => m.bankOut),
          backgroundColor: isDark ? '#f59e0b' : '#d97706',
          borderRadius: 6
        }
      ]
    };
  }, [quarters, balanceReport, isDark]);

  // 3. Lot Size Ladder & Max Risk Data (Dynamic from active weeks)
  const lotLadderData = useMemo(() => {
    const sampledWeeks = dynamicTrajectory.filter((_, idx) => idx % 2 === 0);
    const labels = sampledWeeks.map(p => p.label);
    const lots = sampledWeeks.map(p => p.lotNum);
    const riskDollar = lots.map(l => l * 20 * 20);

    return {
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: 'Max Lot Cap',
          data: lots,
          borderColor: colors.purpleLine,
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          yAxisID: 'yLots',
          tension: 0.2,
          pointRadius: 3
        },
        {
          type: 'bar' as const,
          label: '20-Pip Stop Loss Dollar Risk ($)',
          data: riskDollar,
          backgroundColor: isDark ? 'rgba(244, 63, 94, 0.4)' : 'rgba(225, 29, 72, 0.35)',
          borderColor: colors.redLine,
          borderWidth: 1,
          borderRadius: 5,
          yAxisID: 'yRisk'
        }
      ]
    };
  }, [dynamicTrajectory, colors, isDark]);

  // 4. Performance Doughnut Data (Dynamic from actual trade sessions)
  const performanceStats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let flat = 0;

    quarters.forEach(q => {
      q.months.forEach(m => {
        m.weeks.forEach(w => {
          w.days.forEach(d => {
            if (d.status === 'completed' || d.actualPnl !== undefined) {
              const val = d.actualPnl !== undefined ? d.actualPnl : (parseFloat(d.pnl.replace(/[^0-9.-]/g, '')) || 0);
              if (val > 0) wins++;
              else if (val < 0) losses++;
              else flat++;
            }
          });
        });
      });
    });

    const total = wins + losses + flat;
    const hasLiveTrades = total > 0;

    const winPct = hasLiveTrades ? Math.round((wins / total) * 1000) / 10 : 66.2;
    const lossPct = hasLiveTrades ? Math.round((losses / total) * 1000) / 10 : 28.0;
    const flatPct = hasLiveTrades ? Math.round((flat / total) * 1000) / 10 : 5.8;

    return {
      wins,
      losses,
      flat,
      total,
      hasLiveTrades,
      winPct,
      lossPct,
      flatPct
    };
  }, [quarters]);

  const performanceDoughnutData = useMemo(() => {
    return {
      labels: [
        `Winning Expansion Trades (${performanceStats.winPct}%)`,
        `Strict 20-Pip Scratches (${performanceStats.lossPct}%)`,
        `Controlled Flat / Breakeven (${performanceStats.flatPct}%)`
      ],
      datasets: [
        {
          data: [performanceStats.winPct, performanceStats.lossPct, performanceStats.flatPct],
          backgroundColor: ['#10b981', '#f43f5e', '#64748b'],
          borderColor: isDark ? '#111827' : '#ffffff',
          borderWidth: 3
        }
      ]
    };
  }, [performanceStats, isDark]);

  // Common line chart options
  const lineChartOptions: any = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: colors.heading,
            boxWidth: 12,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.heading,
          bodyColor: colors.text,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          callbacks: {
            title: (items: any[]) => {
              const idx = items[0]?.dataIndex;
              const pt = dynamicTrajectory[idx];
              return `${pt?.label || ''} · Week ${pt?.weekNum || ''} ${pt?.hasLogs ? '(● Realized Live)' : '(Dynamic Compound Projection)'}`;
            },
            label: (ctx: any) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: colors.grid, drawBorder: false },
          ticks: {
            color: colors.text,
            maxRotation: 45,
            autoSkip: true,
            maxTicksLimit: 14,
            font: { family: "'JetBrains Mono', monospace", size: 10 }
          }
        },
        y: {
          type: scaleMode === 'logarithmic' ? 'logarithmic' : 'linear',
          min: scaleMode === 'logarithmic' ? Math.max(10, Math.floor((cockpitData?.seedCapital || 50) * 0.8)) : 0,
          grid: { color: colors.grid, drawBorder: false },
          ticks: {
            color: colors.text,
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            callback: (v: any) => `$${v >= 1000 ? v / 1000 + 'k' : v}`
          }
        }
      }
    };
  }, [colors, scaleMode, dynamicTrajectory, cockpitData?.seedCapital]);

  const barChartOptions: any = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { position: 'top' as const, labels: { color: colors.heading, boxWidth: 12 } },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.heading,
          bodyColor: colors.text,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` }
        }
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { family: "'JetBrains Mono', monospace", size: 10 } }
        },
        y: {
          grid: { color: colors.grid },
          ticks: {
            color: colors.text,
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            callback: (v: any) => `$${v >= 1000 ? v / 1000 + 'k' : v}`
          }
        }
      }
    };
  }, [colors]);

  const lotRiskOptions: any = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { position: 'top' as const, labels: { color: colors.heading, boxWidth: 12 } },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.heading,
          bodyColor: colors.text,
          borderColor: colors.tooltipBorder,
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { family: "'JetBrains Mono', monospace", size: 10 } }
        },
        yLots: {
          type: 'linear' as const,
          position: 'left' as const,
          title: { display: true, text: 'Lot Size Ceiling', color: colors.purpleLine },
          ticks: { color: colors.purpleLine, font: { family: "'JetBrains Mono', monospace", size: 10 } },
          grid: { color: colors.grid }
        },
        yRisk: {
          type: 'linear' as const,
          position: 'right' as const,
          title: { display: true, text: '20-Pip Stop Loss ($)', color: colors.redLine },
          ticks: {
            color: colors.redLine,
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            callback: (v: any) => `$${v}`
          },
          grid: { drawOnChartArea: false }
        }
      }
    };
  }, [colors]);

  const seedDisplay = cockpitData?.seedCapital || 50;
  const targetRetained = cockpitData?.targetRetained || 30000;
  const targetBanked = cockpitData?.targetBanked || 7150;
  const targetTotal = cockpitData?.targetTotal || 37150;

  return (
    <div className="scandi-card p-5 sm:p-6 mb-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-amber-400"></span>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Institutional Growth & Compounding Architecture</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Dynamic Live Sync
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            48-Week dynamic trajectory from {formatCurrency(seedDisplay)} seed to {formatCurrency(targetRetained)} retained equity + {formatCurrency(targetBanked)} banked sweeps ({formatCurrency(targetTotal)} total value)
          </p>
        </div>

        {/* View Mode Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setChartViewMode('growth')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              chartViewMode === 'growth'
                ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Growth Curve
          </button>
          <button
            type="button"
            onClick={() => setChartViewMode('monthly')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              chartViewMode === 'monthly'
                ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly Sweeps
          </button>
          <button
            type="button"
            onClick={() => setChartViewMode('lotsize')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              chartViewMode === 'lotsize'
                ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Lot Ladder
          </button>
          <button
            type="button"
            onClick={() => setChartViewMode('performance')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              chartViewMode === 'performance'
                ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Edge Audit
          </button>
        </div>
      </div>

      {/* Sub bar: Telemetry and Scale */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          <div>Seed: <strong className="text-slate-900 dark:text-slate-200">${seedDisplay.toFixed(2)}</strong></div>
          <div>Banked: <strong className="text-amber-600 dark:text-amber-400">${(metrics.currentBankedCash || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
          <div>Working MT5: <strong className="text-emerald-600 dark:text-emerald-400">${(metrics.currentWorkingEquity || seedDisplay).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
          <div>Total Net Worth: <strong className="text-[#0082ff] dark:text-[#38a1ff] font-bold">${((metrics.currentWorkingEquity || seedDisplay) + (metrics.currentBankedCash || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
        </div>

        {chartViewMode === 'growth' && (
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-full px-2 py-0.5 bg-slate-50 dark:bg-slate-900">
            <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Scale:</span>
            <button
              type="button"
              onClick={() => setScaleMode('linear')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono cursor-pointer transition-colors ${
                scaleMode === 'linear'
                  ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Linear
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('logarithmic')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono cursor-pointer transition-colors ${
                scaleMode === 'logarithmic'
                  ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Logarithmic
            </button>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-[290px] sm:h-[350px] w-full relative">
        {chartViewMode === 'growth' && (
          <Line data={growthLineData} options={lineChartOptions} />
        )}
        {chartViewMode === 'monthly' && (
          <Bar data={monthlyBarData} options={barChartOptions} />
        )}
        {chartViewMode === 'lotsize' && (
          <Bar data={lotLadderData as any} options={lotRiskOptions} />
        )}
        {chartViewMode === 'performance' && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-full py-4">
            <div className="w-[200px] h-[200px] relative">
              <Doughnut
                data={performanceDoughnutData}
                options={{ responsive: true, cutout: '72%', plugins: { legend: { display: false } } }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {performanceStats.winPct}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  {performanceStats.hasLiveTrades ? 'Live Win Rate' : 'Modeled Edge'}
                </span>
              </div>
            </div>

            <div className="max-w-md space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80">
                <strong className="text-emerald-700 dark:text-emerald-300 block mb-0.5 font-bold">
                  {performanceStats.hasLiveTrades ? 'Statistical Edge Realized' : 'Institutional Edge Model'}
                </strong>
                {performanceStats.hasLiveTrades ? (
                  <span>
                    {performanceStats.wins} verified {performanceStats.wins === 1 ? 'win' : 'wins'} out of {performanceStats.total} closed {performanceStats.total === 1 ? 'session' : 'sessions'} ({performanceStats.winPct}% live edge). Realized Net P&L: <strong className="text-emerald-600 font-bold">{formatCurrency(metrics.actualTotalPnL)}</strong>.
                  </span>
                ) : (
                  <span>
                    Over 1,000 verified wins across 1,588 trades. Gold expansion displacement captures +20 to +90 pips.
                  </span>
                )}
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80">
                <strong className="text-rose-700 dark:text-rose-300 block mb-0.5 font-bold">
                  Circuit Breaker Protection
                </strong>
                Strict 20-pip stops with 2-loss daily wall halt prevent drawdown cascades. Recorded scratches: {performanceStats.losses}.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
