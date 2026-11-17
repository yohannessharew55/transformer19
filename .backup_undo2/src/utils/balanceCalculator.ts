import { TradingQuarter, TradingWeek, DailySession } from '../types';

export interface DayBalanceSnapshot {
  dayName: string;
  proto: string;
  isExtractRow: boolean;
  plannedPnl: number;
  actualPnl?: number;
  effectivePnl: number;
  startBalance: number;
  endBalance: number;
  status: string;
}

export interface WeekBalanceBreakdown {
  weekId: string;
  weekNum: string;
  monthNum: string;
  monthName: string;
  quarterId: string;
  quarterName: string;
  lotSize: string;
  isExtract: boolean;
  drill: string;

  // Planned Roadmap Balances
  plannedStartBalance: number;
  plannedTradingGain: number;
  plannedHarvestSweep: number;
  plannedEndingBalance: number;
  plannedNextWeekStart: number;

  // Realized / Live Balances (reflecting user edits, actual P&L and harvested amounts)
  actualStartBalance: number;
  actualTradingGain: number;
  actualHarvestSweep: number;
  actualBalanceBeforeHarvest: number;
  actualEndingBalance: number;
  projectedEndingBalance: number;
  actualNextWeekStart: number;
  hasActualLogs: boolean;
  isWeekFullyCompleted: boolean;

  // Convenient display helpers for UI
  displayStartBalance: number;
  displayEndingBalance: number;
  displayHarvestSweep: number;
  balancePathText: string;

  // Detailed Day Breakdown
  days: DayBalanceSnapshot[];
}

export interface RoadmapBalanceReport {
  weeks: WeekBalanceBreakdown[];
  weekMap: Map<string, WeekBalanceBreakdown>;
  totalSeedCapital: number;
  totalPlannedHarvest: number;
  totalActualHarvest: number;
  totalPlannedGain: number;
  totalActualGain: number;
  finalPlannedWorkingEquity: number;
  finalActualWorkingEquity: number;
}

/**
 * Parses numeric currency value from string (e.g. "+$25.00" -> 25, "-$50.00" -> -50)
 */
export function parsePnlNumber(val: string | number | undefined): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Computes exact start and ending balances across all 48 weeks with strict harvest deduction.
 * RULE: Any offline harvest or bank sweep withdrawn in Week N is deducted from the working balance
 * so that Week N+1 begins strictly with:
 * Start(Week N+1) = End(Week N) = Start(Week N) + Trading Gain(Week N) - Harvest Withdrawn(Week N)
 */
export function calculateRoadmapBalances(
  quarters: TradingQuarter[],
  seedCapital: number = 50
): RoadmapBalanceReport {
  const weeksList: WeekBalanceBreakdown[] = [];
  const weekMap = new Map<string, WeekBalanceBreakdown>();

  let runningPlannedStart = seedCapital;
  let runningActualStart = seedCapital;

  let totalPlannedHarvest = 0;
  let totalActualHarvest = 0;
  let totalPlannedGain = 0;
  let totalActualGain = 0;

  quarters.forEach(quarter => {
    quarter.months.forEach(month => {
      month.weeks.forEach(week => {
        let plannedTradingGain = 0;
        let plannedHarvestSweep = 0;

        let actualTradingGain = 0;
        let actualHarvestSweep = 0;
        let hasActualLogs = false;
        let completedDaysCount = 0;

        const daySnapshots: DayBalanceSnapshot[] = [];
        let dayPlannedRunning = runningPlannedStart;
        let dayActualRunning = runningActualStart;

        week.days.forEach(day => {
          const rawPlanned = parsePnlNumber(day.pnl);
          const isExtract = Boolean(day.isExtractRow || week.isExtract && day.day.toLowerCase().includes('harvest'));
          const isCompleted = day.status === 'completed';

          if (isCompleted) {
            completedDaysCount++;
          }

          if (day.actualPnl !== undefined) {
            hasActualLogs = true;
          }

          const dayStartP = dayPlannedRunning;
          const dayStartA = dayActualRunning;

          let effPlannedPnl = 0;
          let effActualPnl = 0;

          if (isExtract) {
            // Extraction / Harvest row: Represents cash pulled OUT of MT5 into physical vault
            const sweepPlanned = Math.abs(rawPlanned);
            plannedHarvestSweep += sweepPlanned;
            effPlannedPnl = -sweepPlanned;
            dayPlannedRunning -= sweepPlanned;

            // Actual harvest calculation:
            // If user explicitly logged an actualPnl for the harvest row, honor it.
            // If user marked it completed without typing custom actual, honor the planned sweep.
            let sweepActual = 0;
            if (day.actualPnl !== undefined) {
              sweepActual = Math.abs(day.actualPnl);
              hasActualLogs = true;
            } else if (isCompleted) {
              sweepActual = sweepPlanned;
            }
            actualHarvestSweep += sweepActual;
            effActualPnl = -sweepActual;
            dayActualRunning -= sweepActual;
          } else {
            // Standard trading day: Net profit/loss made from trades
            plannedTradingGain += rawPlanned;
            effPlannedPnl = rawPlanned;
            dayPlannedRunning += rawPlanned;

            // Actual trade PnL
            let tradeActual = 0;
            if (day.actualPnl !== undefined) {
              tradeActual = day.actualPnl;
              hasActualLogs = true;
            } else if (isCompleted) {
              tradeActual = rawPlanned;
            }
            actualTradingGain += tradeActual;
            effActualPnl = tradeActual;
            dayActualRunning += tradeActual;
          }

          daySnapshots.push({
            dayName: day.day,
            proto: day.proto,
            isExtractRow: isExtract,
            plannedPnl: effPlannedPnl,
            actualPnl: day.actualPnl,
            effectivePnl: effActualPnl,
            startBalance: hasActualLogs || isCompleted ? dayStartA : dayStartP,
            endBalance: hasActualLogs || isCompleted ? dayActualRunning : dayPlannedRunning,
            status: day.status || 'pending'
          });
        });

        // 1. Planned Calculations: Deduct harvest from ending balance
        const plannedEndingBalance = runningPlannedStart + plannedTradingGain - plannedHarvestSweep;
        const plannedNextWeekStart = plannedEndingBalance;

        // 2. Actual Calculations: Deduct actual harvest from ending balance
        const actualBalanceBeforeHarvest = runningActualStart + actualTradingGain;
        const actualEndingBalance = actualBalanceBeforeHarvest - actualHarvestSweep;
        const projectedEndingBalance = runningActualStart + (hasActualLogs ? actualTradingGain : plannedTradingGain) - (hasActualLogs ? actualHarvestSweep : plannedHarvestSweep);
        const actualNextWeekStart = actualEndingBalance;

        const isWeekFullyCompleted = completedDaysCount === week.days.length;

        // Display figures: Prefer live actuals if session data logged; otherwise display planned roadmap
        const displayStart = hasActualLogs || isWeekFullyCompleted ? runningActualStart : runningPlannedStart;
        const displayEnd = hasActualLogs || isWeekFullyCompleted ? actualEndingBalance : plannedEndingBalance;
        const displayHarvest = hasActualLogs || isWeekFullyCompleted ? actualHarvestSweep : plannedHarvestSweep;

        const pathText = displayHarvest > 0
          ? `${formatCurrency(displayStart)} → ${formatCurrency(displayEnd)} (-${formatCurrency(displayHarvest)} Sweep)`
          : `${formatCurrency(displayStart)} → ${formatCurrency(displayEnd)}`;

        const breakdown: WeekBalanceBreakdown = {
          weekId: week.id,
          weekNum: week.num,
          monthNum: month.monthNum,
          monthName: month.name,
          quarterId: quarter.id,
          quarterName: quarter.name,
          lotSize: week.lot,
          isExtract: week.isExtract,
          drill: week.drill,

          plannedStartBalance: runningPlannedStart,
          plannedTradingGain,
          plannedHarvestSweep,
          plannedEndingBalance,
          plannedNextWeekStart,

          actualStartBalance: runningActualStart,
          actualTradingGain,
          actualHarvestSweep,
          actualBalanceBeforeHarvest,
          actualEndingBalance,
          projectedEndingBalance,
          actualNextWeekStart,
          hasActualLogs,
          isWeekFullyCompleted,

          displayStartBalance: displayStart,
          displayEndingBalance: displayEnd,
          displayHarvestSweep: displayHarvest,
          balancePathText: pathText,

          days: daySnapshots
        };

        weeksList.push(breakdown);
        weekMap.set(week.id, breakdown);

        totalPlannedHarvest += plannedHarvestSweep;
        totalActualHarvest += actualHarvestSweep;
        totalPlannedGain += plannedTradingGain;
        totalActualGain += actualTradingGain;

        // Advance to next week:
        // Next week start balance is STRICTLY the ending balance of this week (which deducted the harvest)
        runningPlannedStart = plannedNextWeekStart;
        runningActualStart = actualNextWeekStart;
      });
    });
  });

  return {
    weeks: weeksList,
    weekMap,
    totalSeedCapital: seedCapital,
    totalPlannedHarvest,
    totalActualHarvest,
    totalPlannedGain,
    totalActualGain,
    finalPlannedWorkingEquity: runningPlannedStart,
    finalActualWorkingEquity: runningActualStart
  };
}
