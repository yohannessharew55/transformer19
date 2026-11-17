import type { WeeklyObjective, TradingQuarter } from '../types/index.ts';
import { INITIAL_QUARTERS } from './roadmapData.ts';

export const generateDefaultWeeklyObjectives = (quarters: TradingQuarter[] = INITIAL_QUARTERS): WeeklyObjective[] => {
  const objectives: WeeklyObjective[] = [];

  quarters.forEach(q => {
    q.months.forEach(m => {
      m.weeks.forEach((w, wIdx) => {
        // Extract numeric target from net string
        const cleanNet = w.net.replace(/[^0-9.-]/g, '');
        const plannedNum = Math.abs(parseFloat(cleanNet)) || 100;

        // Determine quarter theme & default primary objective
        let primaryGoal = `Execute planned ${w.lot} sizing and achieve ${w.net} target with zero rule breaches.`;
        let tactical = `Focus strictly on London/NY killzone setups. Maintain 20-pip fixed stops.`;

        if (w.id === 'w48') {
          primaryGoal = 'Final terminal milestone: complete the 48-week $30K compounding roadmap ($30,000 equity + $7,150 banked sweeps = $37,150 total value) and execute final $1,260 bank sweep.';
          tactical = 'Preserve institutional net worth. Execute final capital sweep to designated bank vaults.';
        } else if (w.id === 'w47') {
          primaryGoal = 'Cross the $30,000 terminal equity milestone with strict 1.50 lot discipline and 20-pip stops.';
          tactical = 'Lock in terminal capital target. Prepare for annual audit and final offline harvest.';
        } else if (w.isExtract) {
          primaryGoal = `Execute scheduled physical bank withdrawal (${w.net}) and lock offline capital reserves.`;
          tactical = `Sweep 20% of net profits offline to cold vault. Reset psychological baseline to zero.`;
        } else if (w.id === 'w01') {
          primaryGoal = 'Establish foundation discipline: clear 5/5 morning devotion gates with strict 0.01 lot ceiling.';
          tactical = 'Focus strictly on London Open expansion. Stop trading immediately after session target hit.';
        } else if (w.id === 'w02') {
          primaryGoal = 'Smoothly promote position sizing to Tier 2 (0.01-0.02 lot) while respecting the 2-loss stop wall.';
          tactical = 'Test Tier 2 lots on high-conviction London displacement setups. No overnight runner holds.';
        } else if (w.id === 'w06' || w.id === 'w07') {
          primaryGoal = 'Cross the 3-figure equity threshold ($300+) without oversized revenge positions.';
          tactical = 'Maintain calm composure at psychological milestone. Zero bullet stacking.';
        } else if (w.id === 'w13' || w.id === 'w14') {
          primaryGoal = 'Quarter 2 acceleration: transition into Tier 5 sizing (0.05-0.08 lot) with zero deviations.';
          tactical = 'Audit spreads and slippage during NY Open liquidity sweeps. Trail stops to breakeven.';
        } else if (w.id === 'w25' || w.id === 'w26') {
          primaryGoal = 'Quarter 3 scale: step into institutional lot brackets while preserving maximum drawdown buffer.';
          tactical = 'Strict adherence to Rule 05 50% risk demotion if any 2 consecutive losses occur.';
        }

        const defaultChecklist = [
          { id: `${w.id}_c1`, text: 'Clear 1-hour Bible devotion & prayer before charts each morning', completed: w.id === 'w01' },
          { id: `${w.id}_c2`, text: 'Trade strictly inside London (07:00 UTC) and NY (13:30 UTC) killzones', completed: false },
          { id: `${w.id}_c3`, text: `Enforce mechanical 20-pip stop loss limit on ${w.lot}`, completed: false },
          { id: `${w.id}_c4`, text: w.isExtract ? 'Complete 20% physical profit sweep to offline vault' : `Harvest target ${w.net} without exceeding risk ceiling`, completed: false }
        ];

        objectives.push({
          weekId: w.id,
          weekNum: w.num,
          quarterId: q.id,
          quarterName: q.name,
          monthNum: m.monthNum,
          plannedTargetPnl: plannedNum,
          lotSize: w.lot,
          drillFocus: w.drill,
          primaryObjective: primaryGoal,
          tacticalNotes: tactical,
          status: w.id === 'w01' ? 'in_progress' : 'upcoming',
          checklist: defaultChecklist,
          debriefNotes: '',
          updatedAt: new Date().toISOString()
        });
      });
    });
  });

  return objectives;
};
