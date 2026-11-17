import React, { useState, useMemo } from 'react';
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
import { Line, Bar } from 'react-chartjs-2';
import { useCockpit } from '../context/CockpitContext';
import { DailySession } from '../types';
import { DayEditModal } from './DayEditModal';
import { PlanCsvModal } from './PlanCsvModal';
import {
  GitCompare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Shield,
  Layers,
  Calendar,
  DollarSign,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Edit3,
  Sliders,
  CheckCircle2,
  Clock,
  Landmark,
  Scale,
  FileSpreadsheet
} from 'lucide-react';

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

type Granularity = 'daily' | 'weekly' | 'monthly';
type ChartMode = 'equity' | 'pnl' | 'delta' | 'lots';

export const PlanVsActualPage: React.FC = () => {
  const {
    quarters,
    theme,
    balanceReport,
    metrics,
    scaleMode,
    setScaleMode,
    traderName
  } = useCockpit();

  const isDark = theme === 'dark';

  // Filters & States
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [granularity, setGranularity] = useState<Granularity>('daily');
  const [chartMode, setChartMode] = useState<ChartMode>('equity');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [isPlanCsvModalOpen, setIsPlanCsvModalOpen] = useState<boolean>(false);

  // Edit Modal State
  const [editingDay, setEditingDay] = useState<{
    weekId: string;
    dayIndex: number;
    day: DailySession;
    weekNumber: string;
  } | null>(null);

  // Colors
  const colors = useMemo(() => {
    return {
      text: isDark ? '#94a3b8' : '#64748b',
      heading: isDark ? '#f8fafc' : '#0f172a',
      grid: isDark ? 'rgba(51, 65, 85, 0.35)' : 'rgba(226, 232, 240, 0.8)',
      tooltipBg: isDark ? '#0b0f19' : '#ffffff',
      tooltipBorder: isDark ? '#334155' : '#cbd5e1',
      plannedLine: isDark ? '#38bdf8' : '#0284c7', // Sky Blue
      plannedFill: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
      actualLine: '#f59e0b', // Amber / Gold
      actualFill: 'rgba(245, 158, 11, 0.15)',
      netWorthLine: '#a855f7', // Purple
      bankSweep: '#10b981', // Emerald
      lossRed: '#f43f5e',
      winGreen: '#10b981'
    };
  }, [isDark]);

  // Format currency helper
  const fmt = (val: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  // 1. Flatten all daily sessions from balanceReport with accurate running balances
  const allDailySessions = useMemo(() => {
    const list: {
      globalDayIdx: number;
      weekId: string;
      weekNum: string;
      monthNum: string;
      monthName: string;
      quarterId: string;
      quarterName: string;
      lotSize: string;
      dayIndex: number;
      dayName: string;
      proto: string;
      isExtractRow: boolean;
      plannedPnl: number;
      actualPnl?: number;
      effectivePnl: number;
      deltaPnl: number;
      plannedStartBal: number;
      plannedEndBal: number;
      actualStartBal: number;
      actualEndBal: number;
      status: string;
      rawSession: DailySession;
    }[] = [];

    let dayCounter = 1;

    balanceReport.weeks.forEach(w => {
      w.days.forEach((d, dIdx) => {
        const plannedPnl = d.plannedPnl;
        const actualPnl = d.actualPnl;
        const deltaPnl = actualPnl !== undefined ? actualPnl - plannedPnl : 0;

        // Find raw session
        const rawQ = quarters.find(q => q.id === w.quarterId);
        const rawM = rawQ?.months.find(m => m.monthNum === w.monthNum);
        const rawW = rawM?.weeks.find(rawWeek => rawWeek.id === w.weekId);
        const rawDay = rawW?.days[dIdx] || {
          day: d.dayName,
          proto: d.proto,
          pnl: String(plannedPnl),
          end: String(d.endBalance),
          isLoss: plannedPnl < 0
        };

        list.push({
          globalDayIdx: dayCounter++,
          weekId: w.weekId,
          weekNum: w.weekNum,
          monthNum: w.monthNum,
          monthName: w.monthName,
          quarterId: w.quarterId,
          quarterName: w.quarterName,
          lotSize: w.lotSize,
          dayIndex: dIdx,
          dayName: d.dayName,
          proto: d.proto,
          isExtractRow: d.isExtractRow,
          plannedPnl,
          actualPnl,
          effectivePnl: d.effectivePnl,
          deltaPnl,
          plannedStartBal: d.startBalance,
          plannedEndBal: d.endBalance,
          actualStartBal: d.startBalance, // calculated in balanceReport
          actualEndBal: d.endBalance,
          status: d.status,
          rawSession: rawDay
        });
      });
    });

    return list;
  }, [balanceReport, quarters]);

  // 2. Filter sessions by Quarter
  const filteredSessions = useMemo(() => {
    return allDailySessions.filter(s => {
      if (selectedQuarter !== 'all' && s.quarterId !== selectedQuarter) return false;
      return true;
    });
  }, [allDailySessions, selectedQuarter]);

  // 3. Weekly Aggregation
  const filteredWeeks = useMemo(() => {
    return balanceReport.weeks.filter(w => {
      if (selectedQuarter !== 'all' && w.quarterId !== selectedQuarter) return false;
      return true;
    });
  }, [balanceReport, selectedQuarter]);

  // 4. Monthly Aggregation
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, {
      monthNum: string;
      monthName: string;
      quarterId: string;
      plannedGain: number;
      actualGain: number;
      plannedSweep: number;
      actualSweep: number;
      plannedEndBalance: number;
      actualEndBalance: number;
      completedDays: number;
      totalDays: number;
    }>();

    allDailySessions.forEach(s => {
      if (!monthMap.has(s.monthNum)) {
        monthMap.set(s.monthNum, {
          monthNum: s.monthNum,
          monthName: s.monthName,
          quarterId: s.quarterId,
          plannedGain: 0,
          actualGain: 0,
          plannedSweep: 0,
          actualSweep: 0,
          plannedEndBalance: s.plannedEndBal,
          actualEndBalance: s.actualEndBal,
          completedDays: 0,
          totalDays: 0
        });
      }
      const m = monthMap.get(s.monthNum)!;
      m.totalDays++;
      if (s.isExtractRow) {
        m.plannedSweep += Math.abs(s.plannedPnl);
        if (s.actualPnl !== undefined) {
          m.actualSweep += Math.abs(s.actualPnl);
        }
      } else {
        m.plannedGain += s.plannedPnl;
        if (s.actualPnl !== undefined) {
          m.actualGain += s.actualPnl;
        }
      }
      if (s.status === 'completed') {
        m.completedDays++;
      }
      m.plannedEndBalance = s.plannedEndBal;
      m.actualEndBalance = s.actualEndBal;
    });

    return Array.from(monthMap.values()).filter(m => {
      if (selectedQuarter !== 'all' && m.quarterId !== selectedQuarter) return false;
      return true;
    });
  }, [allDailySessions, selectedQuarter]);

  // 5. High-Level Summary Statistics
  const summaryKpis = useMemo(() => {
    let completedCount = 0;
    let actualNetTotal = 0;
    let plannedNetForCompleted = 0;
    let totalPlannedNet = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let targetHitCount = 0;

    allDailySessions.forEach(s => {
      totalPlannedNet += s.plannedPnl;
      if (s.status === 'completed' || s.actualPnl !== undefined) {
        completedCount++;
        const act = s.actualPnl !== undefined ? s.actualPnl : s.plannedPnl;
        actualNetTotal += act;
        plannedNetForCompleted += s.plannedPnl;
        if (act >= s.plannedPnl) targetHitCount++;
        if (act > 0) totalWins++;
        else if (act < 0) totalLosses++;
      }
    });

    const netVariance = actualNetTotal - plannedNetForCompleted;
    const netVariancePct = plannedNetForCompleted !== 0 ? (netVariance / Math.abs(plannedNetForCompleted)) * 100 : 0;
    const adherenceRate = completedCount > 0 ? (targetHitCount / completedCount) * 100 : 100;
    const winRate = (totalWins + totalLosses) > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 100;

    const currentActualWorkingEquity = completedCount > 0
      ? balanceReport.finalActualWorkingEquity
      : 50.0;
    const currentActualBanked = balanceReport.totalActualHarvest;
    const plannedTargetEquity = 30000.0;
    const plannedTargetBanked = 7150.0;
    const plannedTargetTotal = 37150.0;

    return {
      completedCount,
      totalSessions: allDailySessions.length,
      currentActualWorkingEquity,
      currentActualBanked,
      currentActualTotal: currentActualWorkingEquity + currentActualBanked,
      plannedTargetEquity,
      plannedTargetBanked,
      plannedTargetTotal,
      netVariance,
      netVariancePct,
      adherenceRate,
      winRate,
      totalWins,
      totalLosses
    };
  }, [allDailySessions, balanceReport]);

  // ==========================================
  // CHART DATA BUILDER
  // ==========================================
  const chartData = useMemo(() => {
    // 1. Daily Granularity
    if (granularity === 'daily') {
      const labels = filteredSessions.map(s => {
        const shortDay = s.dayName.split(' ')[0] || s.dayName;
        return `${s.weekId.toUpperCase()}-${shortDay}`;
      });

      if (chartMode === 'equity') {
        const plannedEquity = filteredSessions.map(s => s.plannedEndBal);
        const actualEquity = filteredSessions.map(s => {
          // If no completed days yet, show baseline seed
          return s.status === 'completed' || s.actualPnl !== undefined ? s.actualEndBal : null;
        });

        return {
          labels,
          datasets: [
            {
              type: 'line' as const,
              label: 'Planned Equity ($30k Blueprint)',
              data: plannedEquity,
              borderColor: colors.plannedLine,
              backgroundColor: colors.plannedFill,
              borderWidth: 2,
              fill: true,
              pointRadius: 1,
              pointHoverRadius: 5,
              tension: 0.25
            },
            {
              type: 'line' as const,
              label: 'Actual Realized Equity (MT5 Live)',
              data: actualEquity,
              borderColor: colors.actualLine,
              backgroundColor: colors.actualFill,
              borderWidth: 3,
              fill: false,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: colors.actualLine,
              tension: 0.25,
              spanGaps: true
            }
          ]
        };
      } else if (chartMode === 'pnl') {
        const plannedPnl = filteredSessions.map(s => s.plannedPnl);
        const actualPnl = filteredSessions.map(s => s.actualPnl !== undefined ? s.actualPnl : 0);

        return {
          labels,
          datasets: [
            {
              type: 'bar' as const,
              label: 'Planned Target PnL ($)',
              data: plannedPnl,
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(2, 132, 199, 0.4)',
              borderColor: colors.plannedLine,
              borderWidth: 1,
              borderRadius: 3
            },
            {
              type: 'bar' as const,
              label: 'Actual Result PnL ($)',
              data: actualPnl,
              backgroundColor: filteredSessions.map(s => {
                const act = s.actualPnl !== undefined ? s.actualPnl : 0;
                return act >= 0 ? colors.winGreen : colors.lossRed;
              }),
              borderRadius: 3
            }
          ]
        };
      } else if (chartMode === 'delta') {
        let runningDelta = 0;
        const cumulativeDelta = filteredSessions.map(s => {
          if (s.status === 'completed' || s.actualPnl !== undefined) {
            runningDelta += (s.actualPnl !== undefined ? s.actualPnl : 0) - s.plannedPnl;
            return Math.round(runningDelta * 100) / 100;
          }
          return null;
        });

        return {
          labels,
          datasets: [
            {
              type: 'line' as const,
              label: 'Cumulative Delta from Plan ($)',
              data: cumulativeDelta,
              borderColor: colors.actualLine,
              backgroundColor: colors.actualFill,
              borderWidth: 2.5,
              fill: 'origin',
              pointRadius: 3,
              pointHoverRadius: 6,
              tension: 0.2,
              spanGaps: true
            }
          ]
        };
      } else {
        // Lot ladder mode
        const lotSizes = filteredSessions.map(s => {
          const match = s.lotSize.match(/[0-9.]+/);
          return match ? parseFloat(match[0]) : 0.01;
        });

        return {
          labels,
          datasets: [
            {
              type: 'line' as const,
              label: 'Planned Position Size (Lots)',
              data: lotSizes,
              borderColor: colors.plannedLine,
              backgroundColor: colors.plannedFill,
              borderWidth: 2,
              stepped: true,
              fill: true
            }
          ]
        };
      }
    }

    // 2. Weekly Granularity
    if (granularity === 'weekly') {
      const labels = filteredWeeks.map(w => `${w.weekId.toUpperCase()} (${w.lotSize})`);

      if (chartMode === 'equity') {
        const plannedEnd = filteredWeeks.map(w => w.plannedEndingBalance);
        const actualEnd = filteredWeeks.map(w => w.hasActualLogs ? w.actualEndingBalance : null);

        return {
          labels,
          datasets: [
            {
              type: 'line' as const,
              label: 'Planned End Balance ($)',
              data: plannedEnd,
              borderColor: colors.plannedLine,
              backgroundColor: colors.plannedFill,
              borderWidth: 2.5,
              fill: true,
              pointRadius: 2,
              tension: 0.3
            },
            {
              type: 'line' as const,
              label: 'Actual End Balance ($)',
              data: actualEnd,
              borderColor: colors.actualLine,
              backgroundColor: colors.actualFill,
              borderWidth: 3,
              pointRadius: 4,
              spanGaps: true,
              tension: 0.3
            }
          ]
        };
      } else {
        const plannedGain = filteredWeeks.map(w => w.plannedTradingGain);
        const actualGain = filteredWeeks.map(w => w.actualTradingGain);

        return {
          labels,
          datasets: [
            {
              type: 'bar' as const,
              label: 'Planned Weekly Gain ($)',
              data: plannedGain,
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.5)' : 'rgba(2, 132, 199, 0.5)',
              borderRadius: 4
            },
            {
              type: 'bar' as const,
              label: 'Actual Weekly Gain ($)',
              data: actualGain,
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.85)' : '#d97706',
              borderRadius: 4
            }
          ]
        };
      }
    }

    // 3. Monthly Granularity
    const labels = monthlyData.map(m => `${m.monthNum} (${m.monthName})`);
    return {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Planned Gross Gain ($)',
          data: monthlyData.map(m => m.plannedGain),
          backgroundColor: isDark ? 'rgba(56, 189, 248, 0.6)' : 'rgba(2, 132, 199, 0.6)',
          borderRadius: 6
        },
        {
          type: 'bar' as const,
          label: 'Actual Gross Gain ($)',
          data: monthlyData.map(m => m.actualGain),
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.85)' : '#d97706',
          borderRadius: 6
        },
        {
          type: 'line' as const,
          label: 'Planned 20% Bank Sweep ($)',
          data: monthlyData.map(m => m.plannedSweep),
          borderColor: colors.bankSweep,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: colors.bankSweep
        }
      ]
    };
  }, [
    granularity,
    chartMode,
    filteredSessions,
    filteredWeeks,
    monthlyData,
    colors,
    isDark
  ]);

  // Chart Options
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: colors.text,
            font: {
              family: 'JetBrains Mono, monospace',
              size: 11
            },
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.heading,
          bodyColor: colors.text,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 4,
          usePointStyle: true,
          callbacks: {
            label: (context: any) => {
              const val = context.raw;
              if (val === null || val === undefined) return `${context.dataset.label}: N/A (Pending)`;
              return `${context.dataset.label}: ${fmt(val)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: colors.grid
          },
          ticks: {
            color: colors.text,
            font: {
              family: 'JetBrains Mono, monospace',
              size: 10
            },
            maxRotation: 45
          }
        },
        y: {
          type: scaleMode as 'linear' | 'logarithmic',
          grid: {
            color: colors.grid
          },
          ticks: {
            color: colors.text,
            font: {
              family: 'JetBrains Mono, monospace',
              size: 10
            },
            callback: (val: any) => fmt(val, 0)
          }
        }
      }
    };
  }, [colors, scaleMode]);

  // Table search & status filter
  const tableRows = useMemo(() => {
    return filteredSessions.filter(s => {
      if (statusFilter === 'completed' && s.status !== 'completed' && s.actualPnl === undefined) return false;
      if (statusFilter === 'pending' && (s.status === 'completed' || s.actualPnl !== undefined)) return false;

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchName = s.dayName.toLowerCase().includes(q);
        const matchProto = s.proto.toLowerCase().includes(q);
        const matchWeek = s.weekNum.toLowerCase().includes(q);
        const matchMonth = s.monthName.toLowerCase().includes(q);
        if (!matchName && !matchProto && !matchWeek && !matchMonth) return false;
      }
      return true;
    });
  }, [filteredSessions, statusFilter, searchFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <GitCompare size={18} />
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
                Performance Telemetry // Forensic Tracking
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Plan vs. Actual Execution Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time statistical verification of planned $30K compounding parameters vs. live executed MT5 trading results. Tracking equity divergence, win rate adherence, and mechanical risk demotion walls.
            </p>
          </div>

          {/* Quick Info Badge & CSV Importer Trigger */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsPlanCsvModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              title="Upload new CSV plan or download template"
            >
              <FileSpreadsheet size={15} />
              <span>Schedule CSV</span>
            </button>
            <div className="px-3 sm:px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-right">
              <span className="block text-[9px] sm:text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold">
                Master Blueprint
              </span>
              <span className="text-xs sm:text-sm font-mono font-extrabold text-slate-900 dark:text-white">
                $50 → $30,000 Equity
              </span>
            </div>
            <div className="px-3 sm:px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right">
              <span className="block text-[9px] sm:text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                Offline Bank Sweeps
              </span>
              <span className="text-xs sm:text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                +$7,150 Harvested
              </span>
            </div>
          </div>
        </div>

        {/* 2. Top Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-4 sm:mt-6">
          {/* Card 1: Working Equity */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-mono uppercase font-bold text-[9px] sm:text-[10px]">MT5 Working Equity</span>
              <DollarSign size={14} className="text-cyan-500" />
            </div>
            <div className="text-lg sm:text-2xl font-mono font-black text-slate-900 dark:text-white">
              {fmt(summaryKpis.currentActualWorkingEquity)}
            </div>
            <div className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>Goal: $30,000.00</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                {((summaryKpis.currentActualWorkingEquity / 30000) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Card 2: Net Variance */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-mono uppercase font-bold text-[9px] sm:text-[10px]">Plan Delta (Variance)</span>
              {summaryKpis.netVariance >= 0 ? (
                <ArrowUpRight size={14} className="text-emerald-500" />
              ) : (
                <ArrowDownRight size={14} className="text-rose-500" />
              )}
            </div>
            <div className={`text-lg sm:text-2xl font-mono font-black ${
              summaryKpis.netVariance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {summaryKpis.netVariance >= 0 ? '+' : ''}{fmt(summaryKpis.netVariance)}
            </div>
            <div className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
              {summaryKpis.netVariance >= 0 ? 'Ahead of plan trajectory' : 'Behind planned target'}
            </div>
          </div>

          {/* Card 3: Adherence / Target Hit */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-mono uppercase font-bold text-[9px] sm:text-[10px]">Target Adherence</span>
              <Target size={14} className="text-amber-500" />
            </div>
            <div className="text-lg sm:text-2xl font-mono font-black text-slate-900 dark:text-white">
              {summaryKpis.adherenceRate.toFixed(1)}%
            </div>
            <div className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
              {summaryKpis.completedCount > 0 ? `${summaryKpis.completedCount} live sessions evaluated` : 'Pre-Launch Baseline Zero'}
            </div>
          </div>

          {/* Card 4: Roadmap Execution Progress */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-mono uppercase font-bold text-[9px] sm:text-[10px]">Roadmap Completion</span>
              <Clock size={14} className="text-purple-500" />
            </div>
            <div className="text-lg sm:text-2xl font-mono font-black text-slate-900 dark:text-white">
              {summaryKpis.completedCount} / {summaryKpis.totalSessions}
            </div>
            <div className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>{summaryKpis.totalSessions - summaryKpis.completedCount} left</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                {((summaryKpis.completedCount / summaryKpis.totalSessions) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Pre-Launch Simulation Banner */}
        {summaryKpis.completedCount === 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-cyan-900 dark:text-cyan-200">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shrink-0">
                <Sparkles size={18} />
              </span>
              <div className="text-xs">
                <strong className="block font-bold">Pre-Launch Ground State Active</strong>
                Starting tranche of $50.00 is locked. As you record trade executions or test what-if scenarios in the table below, the gold Actual curve plots live against the $30,000 master plan.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const firstSession = filteredSessions[0];
                if (firstSession) {
                  setEditingDay({
                    weekId: firstSession.weekId,
                    dayIndex: firstSession.dayIndex,
                    day: firstSession.rawSession,
                    weekNumber: firstSession.weekNum
                  });
                }
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
            >
              Log / Simulate Day 01
            </button>
          </div>
        )}
      </div>

      {/* 3. Interactive Chart Section */}
      <div className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xs">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-800">
          {/* Quarter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto max-w-full scrollbar-none">
            {[
              { id: 'all', label: 'All 48 Weeks' },
              { id: 'quarter-1', label: 'Q1: Foundation' },
              { id: 'quarter-2', label: 'Q2: Acceleration' },
              { id: 'quarter-3', label: 'Q3: Institutional' },
              { id: 'quarter-4', label: 'Q4: Terminal' }
            ].map(q => (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedQuarter(q.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedQuarter === q.id
                    ? 'bg-slate-900 text-white dark:bg-cyan-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Chart Mode & Granularity Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto scrollbar-none">
            {/* Granularity */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shrink-0">
              {[
                { id: 'daily', label: 'Daily (252)' },
                { id: 'weekly', label: 'Weekly (48)' },
                { id: 'monthly', label: 'Monthly (12)' }
              ].map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGranularity(g.id as Granularity)}
                  className={`px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    granularity === g.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Scale Mode */}
            <button
              type="button"
              onClick={() => setScaleMode(scaleMode === 'linear' ? 'logarithmic' : 'linear')}
              className="px-2.5 sm:px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Toggle Linear / Logarithmic Scale"
            >
              <Scale size={13} />
              <span className="capitalize">{scaleMode}</span>
            </button>
          </div>
        </div>

        {/* View Mode Pills (Equity vs PnL vs Delta vs Lots) */}
        <div className="flex items-center gap-2 pt-3 sm:pt-4 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'equity', label: 'Equity Trajectory Curve ($)' },
            { id: 'pnl', label: 'Session PnL Comparison ($)' },
            { id: 'delta', label: 'Cumulative Variance Delta (Δ)' },
            { id: 'lots', label: 'Position Lot Size Ladder' }
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setChartMode(m.id as ChartMode)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                chartMode === m.id
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Chart Canvas Container */}
        <div className="mt-3 sm:mt-4 h-[280px] sm:h-[420px] w-full">
          {chartMode === 'pnl' ? (
            <Bar data={chartData as any} options={chartOptions} />
          ) : (
            <Line data={chartData as any} options={chartOptions} />
          )}
        </div>
      </div>

      {/* 4. Forensic Daily & Weekly Ledger Table */}
      <div className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Forensic Variance Ledger & Session Audit
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detailed side-by-side comparison of planned target vs actual realized outcome for each session.
            </p>
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search session, protocol..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="flex-1 sm:w-56 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none cursor-pointer shrink-0"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="mt-4 -mx-4 sm:mx-0 overflow-x-auto max-h-[500px] overflow-y-auto sm:rounded-2xl border-y sm:border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Day #</th>
                <th className="py-3 px-4">Session / Week</th>
                <th className="py-3 px-4">Protocol Focus</th>
                <th className="py-3 px-4 text-center">Lot Size</th>
                <th className="py-3 px-4 text-right">Planned Target</th>
                <th className="py-3 px-4 text-right">Actual Result</th>
                <th className="py-3 px-4 text-right">Variance (Δ)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">
              {tableRows.slice(0, 50).map(s => {
                const hasActual = s.actualPnl !== undefined;
                const isWin = (s.actualPnl ?? 0) > 0;
                const delta = s.deltaPnl;

                return (
                  <tr
                    key={`${s.weekId}_${s.dayIndex}`}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      s.isExtractRow ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400">
                      #{s.globalDayIdx}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {s.weekId.toUpperCase()} · {s.dayName}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">
                          {s.monthName} ({s.quarterName})
                        </span>
                        {s.rawSession.date && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-200 dark:border-cyan-800">
                            📅 {s.rawSession.date}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[220px] truncate text-slate-600 dark:text-slate-400 font-sans">
                      {s.proto}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                        {s.lotSize}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-cyan-600 dark:text-cyan-400">
                      {s.plannedPnl >= 0 ? '+' : ''}{fmt(s.plannedPnl)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasActual ? (
                        <span className={`font-black ${isWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {(s.actualPnl ?? 0) >= 0 ? '+' : ''}{fmt(s.actualPnl ?? 0)}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasActual ? (
                        <span className={`font-bold ${delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {delta >= 0 ? '+' : ''}{fmt(delta)}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.isExtractRow ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                          Harvest
                        </span>
                      ) : s.status === 'completed' ? (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDay({
                            weekId: s.weekId,
                            dayIndex: s.dayIndex,
                            day: s.rawSession,
                            weekNumber: s.weekNum
                          });
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit / Log Session Result"
                      >
                        <Edit3 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {tableRows.length > 50 && (
          <div className="text-center text-xs text-slate-400 font-mono mt-3">
            Showing top 50 of {tableRows.length} sessions matching filters.
          </div>
        )}
      </div>

      {/* Edit Session Modal */}
      {editingDay && (
        <DayEditModal
          isOpen={!!editingDay}
          onClose={() => setEditingDay(null)}
          weekId={editingDay.weekId}
          dayIndex={editingDay.dayIndex}
          day={editingDay.day}
          weekNumber={editingDay.weekNumber}
        />
      )}

      {/* Anytime Schedule Plan CSV Modal */}
      <PlanCsvModal
        isOpen={isPlanCsvModalOpen}
        onClose={() => setIsPlanCsvModalOpen(false)}
      />
    </div>
  );
};
