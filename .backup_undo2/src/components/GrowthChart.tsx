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
import { PLANNED_GROWTH_CURVE, MONTHLY_SUMMARY } from '../data/roadmapData';
import { TrendingUp, BarChart3, ShieldAlert, PieChart } from 'lucide-react';

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
  const { theme, chartViewMode, setChartViewMode, scaleMode, setScaleMode, metrics } = useCockpit();

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
      redLine: '#f43f5e'
    };
  }, [isDark]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 1. Line Chart Data: 48-Week Compounding Curve
  const growthLineData = useMemo(() => {
    const labels = PLANNED_GROWTH_CURVE.map(p => p.label);
    const equityData = PLANNED_GROWTH_CURVE.map(p => p.equity);
    const bankedData = PLANNED_GROWTH_CURVE.map(p => p.banked);
    const totalData = PLANNED_GROWTH_CURVE.map(p => p.total);

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
          pointRadius: 1.5,
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
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: colors.primaryLine
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
        }
      ]
    };
  }, [colors]);

  // 2. Bar Chart Data: Monthly Gross vs Banked Cash Sweeps
  const monthlyBarData = useMemo(() => {
    return {
      labels: MONTHLY_SUMMARY.map(m => `${m.month} (${m.name})`),
      datasets: [
        {
          label: 'Gross Profit Generated ($)',
          data: MONTHLY_SUMMARY.map(m => m.gross),
          backgroundColor: isDark ? 'rgba(56, 189, 248, 0.8)' : '#0284c7',
          borderRadius: 6
        },
        {
          label: '20% Physical Sweep ($)',
          data: MONTHLY_SUMMARY.map(m => m.bankOut),
          backgroundColor: isDark ? '#f59e0b' : '#d97706',
          borderRadius: 6
        }
      ]
    };
  }, [isDark]);

  // 3. Lot Size Ladder & Max Risk Data
  const lotLadderData = useMemo(() => {
    const labels = PLANNED_GROWTH_CURVE.filter((_, idx) => idx % 2 === 0).map(p => p.label);
    const lots = PLANNED_GROWTH_CURVE.filter((_, idx) => idx % 2 === 0).map(p => p.lotNum);
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
  }, [colors, isDark]);

  // 4. Performance Doughnut Data
  const performanceDoughnutData = useMemo(() => {
    return {
      labels: ['Winning Expansion Trades (66.2%)', 'Strict 20-Pip Scratches (28.0%)', 'Controlled Flat / Breakeven (5.8%)'],
      datasets: [
        {
          data: [66.2, 28.0, 5.8],
          backgroundColor: ['#10b981', '#f43f5e', '#64748b'],
          borderColor: isDark ? '#111827' : '#ffffff',
          borderWidth: 3
        }
      ]
    };
  }, [isDark]);

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
          min: scaleMode === 'logarithmic' ? 40 : 0,
          grid: { color: colors.grid, drawBorder: false },
          ticks: {
            color: colors.text,
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            callback: (v: any) => `$${v >= 1000 ? v / 1000 + 'k' : v}`
          }
        }
      }
    };
  }, [colors, scaleMode]);

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

  return (
    <div className="scandi-card p-5 sm:p-6 mb-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-amber-400"></span>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Institutional Growth & Compounding Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            48-Week trajectory from $50 seed to $30,000 retained equity + $7,150 physical banked sweeps ($37,150 total value)
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
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          <div>Seed: <strong className="text-slate-900 dark:text-slate-200">$50.00</strong></div>
          <div>Banked: <strong className="text-amber-600 dark:text-amber-400">${metrics.currentBankedCash.toLocaleString()}</strong></div>
          <div>Working MT5: <strong className="text-emerald-600 dark:text-emerald-400">${metrics.currentWorkingEquity.toLocaleString()}</strong></div>
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
                  66.2%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Edge</span>
              </div>
            </div>

            <div className="max-w-md space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80">
                <strong className="text-emerald-700 dark:text-emerald-300 block mb-0.5 font-bold">
                  Statistical Edge Realized
                </strong>
                Over 1,000 verified wins across 1,588 trades. Gold expansion displacement captures +20 to +90 pips.
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80">
                <strong className="text-rose-700 dark:text-rose-300 block mb-0.5 font-bold">
                  Circuit Breaker Protection
                </strong>
                Strict 20-pip stops with 2-loss daily wall halt prevent drawdown cascades.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
