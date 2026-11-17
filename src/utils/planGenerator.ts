import type {
  TradingQuarter,
  TradingMonth,
  TradingWeek,
  DailySession,
  WeeklyObjective
} from '../types/index.ts';
import { INITIAL_QUARTERS } from '../data/roadmapData.ts';

export interface PlanGeneratorParams {
  planName: string;
  initialCapital: number; // e.g. 50, 100, 500, 1000, 5000
  annualTarget: number; // e.g. 37150, 74300, 371500, 743000
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

/**
 * Calculates lot size scaled directly from the proven $50 -> $37,150 model
 */
export function formatScaledLot(baseLotStr: string, scaleFactor: number): string {
  const numMatch = baseLotStr.match(/[0-9.]+/);
  if (!numMatch) return '0.01 lot';
  const baseNum = parseFloat(numMatch[0]) || 0.01;
  const scaled = baseNum * scaleFactor;
  if (scaled >= 10) return `${scaled.toFixed(1)} lot`;
  return `${scaled.toFixed(2)} lot`;
}

/**
 * Generates a full 48-Week / 12-Month / 4-Quarter Trading Compounding Plan
 * using the EXACT proven mathematical scaling curve of the $50 -> $37,150 baseline!
 */
export function generateTradePlan(params: PlanGeneratorParams): GeneratedPlanResult {
  const seed = Math.max(10, params.initialCapital);
  const scaleFactor = seed / 50; // Proven baseline seed was $50
  const standardBaselineTarget = seed * (37150 / 50); // $50 -> $37,150 (743x multiple)
  
  // Custom target multiplier if user selected a custom goal
  const targetMultiplier = params.annualTarget > 0 ? (params.annualTarget / standardBaselineTarget) : 1;
  const harvestRatio = (params.harvestSweepPercent ?? 20) / 20; // Default harvest was 20%
  const instrument = params.instrument || 'Gold XAU/USD';

  let runningBalance = seed;
  let totalBankedSweeps = 0;
  let globalSessionCount = 0;

  const quarters: TradingQuarter[] = [];
  const objectives: WeeklyObjective[] = [];

  // Deep clone and mathematically scale from proven INITIAL_QUARTERS
  INITIAL_QUARTERS.forEach((baseQuarter, qIdx) => {
    const months: TradingMonth[] = [];

    baseQuarter.months.forEach((baseMonth, mIdx) => {
      const monthOpenBal = runningBalance;
      let monthSweepTotal = 0;
      const weeks: TradingWeek[] = [];

      baseMonth.weeks.forEach((baseWeek, wIdx) => {
        const weekOpenBal = runningBalance;
        const scaledLot = formatScaledLot(baseWeek.lot, scaleFactor);

        const days: DailySession[] = [];

        baseWeek.days.forEach(baseDay => {
          globalSessionCount++;

          if (baseDay.isExtractRow) {
            // Harvest Sweep Row
            const baseSweepNum = Math.abs(parseFloat(baseDay.pnl.replace(/[^0-9.-]/g, '') || '0'));
            const scaledSweep = Number((baseSweepNum * scaleFactor * targetMultiplier * harvestRatio).toFixed(2));

            runningBalance -= scaledSweep;
            totalBankedSweeps += scaledSweep;
            monthSweepTotal += scaledSweep;

            days.push({
              day: baseDay.day,
              proto: `${Math.round((params.harvestSweepPercent || 20))}% Physical Bank Withdrawal (${instrument})`,
              pnl: `-$${scaledSweep.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              end: `MT5 Net: $${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              isLoss: false,
              isExtractRow: true
            });
          } else {
            // Trading Session Row (4 Wins, 1 Wednesday 20-Pip Stop)
            const basePnlNum = parseFloat(baseDay.pnl.replace(/[^0-9.-]/g, '') || '0');
            const scaledPnl = Number((basePnlNum * scaleFactor * targetMultiplier).toFixed(2));

            runningBalance += scaledPnl;

            // Replace baseline lot notation in protocol with scaled lot
            const cleanProto = baseDay.proto.replace(/\([0-9.]+.*?\)/, `(${scaledLot})`);

            days.push({
              day: baseDay.day,
              proto: cleanProto,
              pnl: scaledPnl >= 0
                ? `+$${scaledPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `-$${Math.abs(scaledPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              end: `End: $${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              isLoss: baseDay.isLoss,
              isExtractRow: false
            });
          }
        });

        const weekNet = runningBalance - weekOpenBal;

        const scaledWeek: TradingWeek = {
          id: baseWeek.id,
          num: baseWeek.num,
          lot: scaledLot,
          net: weekNet >= 0
            ? `+$${weekNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `-$${Math.abs(weekNet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          bal: `$${weekOpenBal.toLocaleString('en-US', { minimumFractionDigits: 2 })} → $${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          isExtract: baseWeek.isExtract,
          drill: `${scaledLot} // ${baseWeek.drill.replace(/\([0-9.]+.*?\)/, `(${scaledLot})`)}`,
          days
        };

        weeks.push(scaledWeek);

        // Weekly Objective Object
        objectives.push({
          weekId: baseWeek.id,
          weekNum: baseWeek.num.split(' ')[0] + ' ' + baseWeek.num.split(' ')[1],
          quarterId: baseQuarter.id,
          quarterName: baseQuarter.name,
          monthNum: baseMonth.monthNum,
          plannedTargetPnl: Math.round(weekNet),
          lotSize: scaledLot,
          drillFocus: scaledWeek.drill,
          primaryObjective: `Realize planned +$${weekNet.toFixed(2)} target with disciplined 20-pip stop adherence`,
          tacticalNotes: `Pass Rule 01 Devotion Gate. Trade strictly during London/NY expansion. Max position size ${scaledLot}.`,
          status: 'upcoming',
          checklist: [
            { id: `${baseWeek.id}_chk_1`, text: 'Pass 1-Hour Devotion Gate before opening charts', completed: false },
            { id: `${baseWeek.id}_chk_2`, text: `Execute strictly at ${scaledLot} position ceiling`, completed: false },
            { id: `${baseWeek.id}_chk_3`, text: 'Zero trading during high-impact red folder news', completed: false },
            { id: `${baseWeek.id}_chk_4`, text: 'Log every trade into daily journal sticky reflections', completed: false }
          ],
          debriefNotes: ''
        });
      });

      months.push({
        id: baseMonth.id,
        monthNum: baseMonth.monthNum,
        name: baseMonth.name,
        opening: `$${monthOpenBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        bankOut: monthSweepTotal > 0 ? `-$${monthSweepTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
        endTarget: `$${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        weeks
      });
    });

    quarters.push({
      id: baseQuarter.id,
      name: baseQuarter.name,
      subtitle: baseQuarter.subtitle.replace(/\$[0-9,]+/g, match => {
        const num = parseFloat(match.replace(/[^0-9.]/g, '')) || 0;
        return `$${Math.round(num * scaleFactor * targetMultiplier).toLocaleString()}`;
      }),
      months
    });
  });

  const targetRetained = Number(runningBalance.toFixed(2));
  const targetBanked = Number(totalBankedSweeps.toFixed(2));
  const targetTotal = Number((targetRetained + targetBanked).toFixed(2));

  // Lot ladder display
  const startLot = formatScaledLot('0.01 lot', scaleFactor);
  const endLot = formatScaledLot('1.20 lot', scaleFactor);

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
    totalSessions: globalSessionCount,
    lotLadder: `${startLot} → ${endLot}`,
    csvString: csv
  };
}
