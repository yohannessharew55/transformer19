import type {
  TradingQuarter,
  TradingMonth,
  TradingWeek,
  DailySession,
  WeeklyObjective
} from '../types/index.ts';

export interface PlanGeneratorParams {
  planName: string;
  initialCapital: number; // e.g. 50, 100, 500, 1000, 10000, 100000
  annualTarget: number; // e.g. 37150, 100000, 500000
  dailyGoalPips?: number; // e.g. 20 pips
  harvestSweepPercent: number; // e.g. 20%
  harvestFrequencyWeeks?: number; // default 4 weeks
  instrument?: string; // e.g. 'Gold XAU/USD'
  notes?: string;
}

export interface GeneratedPlanResult {
  planName: string;
  quarters: TradingQuarter[];
  objectives: WeeklyObjective[];
  seedCapital: number;
  targetBanked: number;
  targetRetained: number;
  targetTotal: number;
  totalWeeks: number;
  totalSessions: number;
  lotLadder: string;
  csvString: string;
}

const QUARTER_NAMES = [
  { id: 'quarter-1', name: 'Q1: Foundation & Capital Preservation', sub: 'Weeks 01–12 · Baseline Building' },
  { id: 'quarter-2', name: 'Q2: Acceleration & Tier Escalation', sub: 'Weeks 13–24 · Scale Entries' },
  { id: 'quarter-3', name: 'Q3: Institutional Growth & Harvest', sub: 'Weeks 25–36 · Core Liquidity' },
  { id: 'quarter-4', name: 'Q4: Terminal Execution & Target Close', sub: 'Weeks 37–48 · Terminal Velocity' }
];

const DRILL_PROTOS = [
  'London Expansion Setup',
  'NY Breakout Runner',
  'Stop Hit // 20-Pip Halt',
  'DALE Retest Follow-Through',
  'Pre-Weekend Trend Harvest',
  'Tier Scale Entry (Displacement)',
  'London Session Clean Target',
  'NY Killzone Expansion Scalp',
  'London Open Momentum Push',
  'NY Continuation Run',
  'Morning Range Retest',
  'Displacement Reversal Setup'
];

/**
 * Determines appropriate micro-lot size based on working equity
 */
export function calculateLotSize(equity: number, initialCapital: number): string {
  const ratio = Math.max(1, equity / initialCapital);
  if (equity < initialCapital * 1.8) return '0.01 lot';
  if (equity < initialCapital * 3.5) return '0.02 lot';
  if (equity < initialCapital * 6.5) return '0.03 lot';
  if (equity < initialCapital * 12) return '0.05 lot';
  if (equity < initialCapital * 22) return '0.08 lot';
  if (equity < initialCapital * 40) return '0.12 lot';
  if (equity < initialCapital * 80) return '0.20 lot';
  if (equity < initialCapital * 150) return '0.35 lot';
  if (equity < initialCapital * 300) return '0.50 lot';
  return '1.00 lot';
}

/**
 * Generates a full 48-Week / 12-Month / 4-Quarter Trading Compounding Plan
 */
export function generateTradePlan(params: PlanGeneratorParams): GeneratedPlanResult {
  const seed = Math.max(10, params.initialCapital);
  const target = Math.max(seed * 1.5, params.annualTarget);
  const harvestPct = Math.min(50, Math.max(0, params.harvestSweepPercent)) / 100;
  const instrument = params.instrument || 'Gold XAU/USD';

  // Calculate needed weekly compounding factor
  // Total 48 weeks, with 10 monthly harvest deductions of harvestPct
  const weeksTotal = 48;
  const totalMonths = 12;

  // Approximate growth needed
  const growthMultiple = target / seed;
  const weeklyGrowthRate = Math.pow(growthMultiple * 1.25, 1 / weeksTotal) - 1;

  let currentWorkingBalance = seed;
  let totalBankedSweeps = 0;
  let globalDayCounter = 1;

  const quarters: TradingQuarter[] = [];
  const objectives: WeeklyObjective[] = [];

  for (let qIdx = 0; qIdx < 4; qIdx++) {
    const qMeta = QUARTER_NAMES[qIdx];
    const months: TradingMonth[] = [];

    for (let mIdx = 0; mIdx < 3; mIdx++) {
      const monthNumInt = qIdx * 3 + mIdx + 1;
      const monthNumStr = `Month ${String(monthNumInt).padStart(2, '0')}`;
      const monthId = `q${qIdx + 1}-m${mIdx + 1}`;
      const monthOpeningBal = currentWorkingBalance;
      let monthGrossGains = 0;
      let monthSweep = 0;

      const weeks: TradingWeek[] = [];

      for (let wIdx = 0; wIdx < 4; wIdx++) {
        const weekNumInt = (monthNumInt - 1) * 4 + wIdx + 1;
        const weekId = `w${String(weekNumInt).padStart(2, '0')}`;
        const weekStartBal = currentWorkingBalance;

        const lot = calculateLotSize(weekStartBal, seed);

        // Weekly gain proportional to weekStartBal and growth rate
        // Adjusted so early weeks are realistic and compounding scales smoothly
        const baseWeeklyGain = Math.max(
          seed * 0.1,
          weekStartBal * (weeklyGrowthRate * (0.85 + (weekNumInt / weeksTotal) * 0.3))
        );

        const days: DailySession[] = [];
        const isMonthClose = wIdx === 3 && monthNumInt <= 10 && harvestPct > 0;

        // Daily sessions (Mon to Fri = 5 days)
        // 4 wins, 1 controlled 20-pip stop or scratch
        const dailyTargetAvg = (baseWeeklyGain + (seed * 0.04)) / 4;
        let dayRunningBal = weekStartBal;

        for (let d = 1; d <= 5; d++) {
          const isStopDay = d === 3; // Wednesday mid-week consolidation stop
          const dayPnlNum = isStopDay
            ? -Math.max(2.0, Number((seed * 0.04).toFixed(2)))
            : Number((dailyTargetAvg * (0.85 + (d % 3) * 0.15)).toFixed(2));

          dayRunningBal += dayPnlNum;
          const protoName = DRILL_PROTOS[(weekNumInt * 5 + d) % DRILL_PROTOS.length];

          days.push({
            day: `Day ${globalDayCounter} (${d})`,
            proto: `${protoName} (${lot})`,
            pnl: dayPnlNum >= 0 ? `+$${dayPnlNum.toFixed(2)}` : `-$${Math.abs(dayPnlNum).toFixed(2)}`,
            end: `End: $${dayRunningBal.toFixed(2)}`,
            isLoss: isStopDay,
            isExtractRow: false
          });

          globalDayCounter++;
        }

        const weekGrossGain = dayRunningBal - weekStartBal;
        monthGrossGains += weekGrossGain;

        // Month-closing 20% Physical Offline Vault Sweep (Day 6)
        if (isMonthClose) {
          const sweepAmount = Number((monthGrossGains * harvestPct).toFixed(2));
          if (sweepAmount > 0) {
            dayRunningBal -= sweepAmount;
            totalBankedSweeps += sweepAmount;
            monthSweep = sweepAmount;

            days.push({
              day: `Day ${globalDayCounter} (Harvest)`,
              proto: `${Math.round(harvestPct * 100)}% Physical Bank Withdrawal (${instrument})`,
              pnl: `-$${sweepAmount.toFixed(2)}`,
              end: `End: $${dayRunningBal.toFixed(2)}`,
              isLoss: false,
              isExtractRow: true
            });
            globalDayCounter++;
          }
        }

        currentWorkingBalance = dayRunningBal;

        const weekObj: TradingWeek = {
          id: weekId,
          num: `Week ${String(weekNumInt).padStart(2, '0')} (Days ${globalDayCounter - days.length}–${globalDayCounter - 1})`,
          lot,
          net: `+$${weekGrossGain.toFixed(2)}`,
          bal: `$${weekStartBal.toFixed(2)} → $${currentWorkingBalance.toFixed(2)}`,
          isExtract: isMonthClose,
          drill: `${lot} Step // ${instrument} Session Expansion`,
          days
        };
        weeks.push(weekObj);

        // Weekly Objective Object
        objectives.push({
          weekId,
          weekNum: `Week ${String(weekNumInt).padStart(2, '0')}`,
          quarterId: qMeta.id,
          quarterName: qMeta.name,
          monthNum: monthNumStr,
          plannedTargetPnl: Math.round(weekGrossGain),
          lotSize: lot,
          drillFocus: `${instrument} Liquidity Expansion (${lot})`,
          primaryObjective: `Realize planned +$${weekGrossGain.toFixed(2)} target with disciplined 20-pip stop adherence`,
          tacticalNotes: `Clear London Open (07:00 UTC) devotion gate. Strictly cut any 20-pip adverse wicks. Maintain ${lot} ceiling.`,
          status: 'upcoming',
          checklist: [
            { id: `${weekId}_chk_1`, text: 'Pass 1-Hour Devotion Gate before opening charts', completed: false },
            { id: `${weekId}_chk_2`, text: `Execute strictly at ${lot} position ceiling`, completed: false },
            { id: `${weekId}_chk_3`, text: 'Zero trading during high-impact red folder news', completed: false },
            { id: `${weekId}_chk_4`, text: 'Log every trade into daily journal sticky reflections', completed: false }
          ],
          debriefNotes: ''
        });
      }

      months.push({
        id: monthId,
        monthNum: monthNumStr,
        name: `Month ${String(monthNumInt).padStart(2, '0')} Compounding`,
        opening: `$${monthOpeningBal.toFixed(2)}`,
        bankOut: monthSweep > 0 ? `-$${monthSweep.toFixed(2)}` : '$0.00',
        endTarget: `$${currentWorkingBalance.toFixed(2)}`,
        weeks
      });
    }

    quarters.push({
      id: qMeta.id,
      name: qMeta.name,
      subtitle: qMeta.sub,
      months
    });
  }

  const targetRetained = Number(currentWorkingBalance.toFixed(2));
  const targetBanked = Number(totalBankedSweeps.toFixed(2));
  const targetTotal = Number((targetRetained + targetBanked).toFixed(2));

  // Generate CSV String
  let csv = 'Week,Quarter,Month,Week_Num,Lot_Size,Opening_Balance,Gross_Gain,Bank_Sweep,Ending_Balance,Focus_Drill\n';
  quarters.forEach(q => {
    q.months.forEach(m => {
      m.weeks.forEach(w => {
        const parts = w.bal.replace(/[^0-9.→ ]/g, '').split('→');
        const openBal = parseFloat(parts[0]) || 0;
        const endBal = parseFloat(parts[1]) || 0;
        const gainNum = parseFloat(w.net.replace(/[^0-9.-]/g, '')) || 0;
        const sweepNum = w.isExtract ? parseFloat(w.days[w.days.length - 1]?.pnl.replace(/[^0-9.-]/g, '') || '0') : 0;
        csv += `${w.id},"${q.name}","${m.monthNum}","${w.num}","${w.lot}",${openBal},${gainNum},${Math.abs(sweepNum)},${endBal},"${w.drill}"\n`;
      });
    });
  });

  return {
    planName: params.planName,
    quarters,
    objectives,
    seedCapital: seed,
    targetBanked,
    targetRetained,
    targetTotal,
    totalWeeks: 48,
    totalSessions: globalDayCounter - 1,
    lotLadder: `${calculateLotSize(seed, seed)} → ${calculateLotSize(targetRetained, seed)}`,
    csvString: csv
  };
}
