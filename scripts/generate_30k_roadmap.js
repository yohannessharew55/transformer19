import fs from 'fs';

const content = fs.readFileSync('c:/Users/User/Downloads/Terminal_30K_Realistic_Plan.csv', 'utf8');
const lines = content.trim().split('\n').slice(1);

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

const csvRows = lines.map((l, i) => {
  const parts = parseCSVLine(l);
  return {
    weekIdx: i + 1,
    quarter: parts[0],
    month: parts[1],
    weekStr: parts[2],
    lot: parts[3],
    start: parseFloat(parts[4]),
    gain: parseFloat(parts[5]),
    sweep: parseFloat(parts[6]),
    end: parseFloat(parts[7]),
    maxRisk: parseFloat(parts[8]),
    targetPips: parts[9],
    phaseFocus: parts[10]
  };
});

// Group into 4 quarters, each with 3 months, each with 4 weeks
const quartersDef = [
  { id: 'quarter-1', name: 'Q1: Foundation', subtitle: 'Months 01–03 // Micro-scale calibration from $50 to $800 ($190 Banked)' },
  { id: 'quarter-2', name: 'Q2: Acceleration', subtitle: 'Months 04–06 // Scaling from $800 to $4,090 ($820 Banked)' },
  { id: 'quarter-3', name: 'Q3: Institutional Scale', subtitle: 'Months 07–09 // Expansion from $4,090 to $13,940 ($2,450 Banked)' },
  { id: 'quarter-4', name: 'Q4: Harvest & Terminal', subtitle: 'Months 10–12 // Peak terminal compounding to $30,000 ($3,690 Banked)' }
];

const monthsMeta = [
  { num: 'M01', name: 'Micro Boot-Up (Tiers 1 → 2)', qId: 'quarter-1' },
  { num: 'M02', name: 'Tier 3 Micro Scaling', qId: 'quarter-1' },
  { num: 'M03', name: 'Tier 4 Foundation Climax', qId: 'quarter-1' },
  { num: 'M04', name: 'Mini-Contract Runway', qId: 'quarter-2' },
  { num: 'M05', name: 'Mid-Tier Expansion', qId: 'quarter-2' },
  { num: 'M06', name: 'Quarter-Way Milestone', qId: 'quarter-2' },
  { num: 'M07', name: 'Half-Way Elevation', qId: 'quarter-3' },
  { num: 'M08', name: '5-Figure Approach', qId: 'quarter-3' },
  { num: 'M09', name: 'Q3 Institutional Climax', qId: 'quarter-3' },
  { num: 'M10', name: '1.00 Standard Lot Gateway', qId: 'quarter-4' },
  { num: 'M11', name: 'Terminal Expansion Step', qId: 'quarter-4' },
  { num: 'M12', name: 'Terminal $30,000 Milestone', qId: 'quarter-4' }
];

// Setup trading protocols pool for variety and forensic realism
const protos = [
  'London Expansion Setup',
  'NY Breakout Runner',
  'Chop Scratch // 20-Pip Stop',
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

let globalDayCounter = 1;
const quarters = [];

for (let qIdx = 0; qIdx < 4; qIdx++) {
  const qDef = quartersDef[qIdx];
  const qMonths = [];

  for (let mIdx = 0; mIdx < 3; mIdx++) {
    const globalMonthIdx = qIdx * 3 + mIdx;
    const mMeta = monthsMeta[globalMonthIdx];
    const mWeeks = [];

    // 4 weeks per month
    const startWeekIdx = globalMonthIdx * 4;
    const endWeekIdx = startWeekIdx + 4;
    const monthRows = csvRows.slice(startWeekIdx, endWeekIdx);

    const monthOpening = '$' + monthRows[0].start.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const monthSweepVal = monthRows[3].sweep;
    const monthBankOut = monthSweepVal > 0 
      ? '-$' + monthSweepVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '$0.00';
    const monthEndTarget = '$' + monthRows[3].end.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    for (let wIdx = 0; wIdx < 4; wIdx++) {
      const row = monthRows[wIdx];
      const weekId = `w${String(row.weekIdx).padStart(2, '0')}`;
      const isExtract = row.sweep > 0;
      
      const lotStr = row.lot.toLowerCase().includes('cap') || row.lot.toLowerCase().includes('lot')
        ? row.lot
        : `${row.lot} lot`;

      const netStr = isExtract && row.gain === row.sweep
        ? `-$${row.sweep.toLocaleString()} Sweep`
        : isExtract 
        ? `+$${row.gain.toLocaleString()} (-$${row.sweep.toLocaleString()} Sweep)`
        : `+$${row.gain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      const balStr = `$${row.start.toLocaleString('en-US', { minimumFractionDigits: 2 })} → $${row.end.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

      // Days generation: 5 trading days (+ 1 sweep day if isExtract)
      const days = [];
      const dayStartNum = globalDayCounter;
      const weeklyGain = row.gain;
      const maxRisk = row.maxRisk;

      // Realistic 4-win, 1-loss distribution
      // Day 3 is loss day (-maxRisk)
      const lossPnl = -Math.round(maxRisk * 100) / 100;
      const targetPositive = weeklyGain - lossPnl; // gain + maxRisk

      // Distribute positive across 4 days (Day 1, 2, 4, 5)
      // e.g. 22%, 28%, 26%, 24%
      const p1 = Math.round(targetPositive * 0.22 * 100) / 100;
      const p2 = Math.round(targetPositive * 0.28 * 100) / 100;
      const p4 = Math.round(targetPositive * 0.26 * 100) / 100;
      const p5 = Math.round((targetPositive - p1 - p2 - p4) * 100) / 100;

      const dailyPnls = [p1, p2, lossPnl, p4, p5];
      const dayNames = ['Day 1 (Mon)', 'Day 2 (Tue)', 'Day 3 (Wed)', 'Day 4 (Thu)', 'Day 5 (Fri)'];

      let runningBal = row.start;

      for (let d = 0; d < 5; d++) {
        const dPnl = dailyPnls[d];
        runningBal = Math.round((runningBal + dPnl) * 100) / 100;
        const isLoss = dPnl < 0;
        const pnlStr = dPnl >= 0 
          ? `+$${dPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `-$${Math.abs(dPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const protoName = isLoss 
          ? `Stop Hit // 20-Pip Halt (${lotStr})`
          : protos[(row.weekIdx * 5 + d) % protos.length] + ` (${lotStr})`;

        days.push({
          day: `Day ${globalDayCounter} (${dayNames[d].split(' ')[1].replace(/[()]/g, '')})`,
          proto: protoName,
          pnl: pnlStr,
          end: `End: $${runningBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          isLoss
        });
        globalDayCounter++;
      }

      // If week 4 (sweep week), add Day 6 (Harvest row)
      if (isExtract) {
        runningBal = Math.round((runningBal - row.sweep) * 100) / 100;
        days.push({
          day: `Day ${globalDayCounter} (Harvest)`,
          proto: `20% Physical Bank Withdrawal (-$${row.sweep.toLocaleString('en-US', { minimumFractionDigits: 2 })})`,
          pnl: `-$${row.sweep.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          end: `MT5 Net: $${runningBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          isLoss: false,
          isExtractRow: true
        });
        globalDayCounter++;
      }

      const dayEndNum = isExtract ? globalDayCounter - 1 : globalDayCounter - 1;
      const numStr = `Week ${String(row.weekIdx).padStart(2, '0')} (Days ${dayStartNum}–${dayEndNum})`;

      mWeeks.push({
        id: weekId,
        num: numStr,
        lot: lotStr,
        net: netStr,
        bal: balStr,
        isExtract,
        drill: row.phaseFocus,
        days
      });
    }

    qMonths.push({
      id: `q${qIdx + 1}-m${mIdx + 1}`,
      monthNum: mMeta.num,
      name: mMeta.name,
      opening: monthOpening,
      bankOut: monthBankOut,
      endTarget: monthEndTarget,
      weeks: mWeeks
    });
  }

  quarters.push({
    id: qDef.id,
    name: qDef.name,
    subtitle: qDef.subtitle,
    months: qMonths
  });
}

console.log('Quarters created:', quarters.length);
console.log('Total sessions generated:', globalDayCounter - 1);

// Write to file
const fileContent = `import { TradingQuarter, DisciplineRule, AuditItem } from '../types';

export const INITIAL_DISCIPLINES: DisciplineRule[] = [
  {
    id: 'rule-01',
    tag: 'Rule 01 // Spiritual Foundation',
    title: '1-Hour Devotion & Prayer Gate',
    description: 'Zero trading before 1 full hour of Bible reading, meditation, and prayer. Platform stays shut until spirit and mind are fully centered.',
    type: 'devotion'
  },
  {
    id: 'rule-02',
    tag: 'Rule 02 // Session Gating',
    title: 'Clear London & NY Open Only',
    description: 'Strictly trade during clear London Open and New York Open expansion. Zero Asian chop, zero pre-market entries, zero late churn.',
    type: 'session'
  },
  {
    id: 'rule-03',
    tag: 'Rule 03 // Mental Hygiene',
    title: 'The Art of Daily Resetting',
    description: 'Whether today is a maximum win or a cut loss, the mind immediately resets to baseline zero. Tomorrow is an independent day.',
    type: 'reset'
  },
  {
    id: 'rule-04',
    tag: 'Rule 04 // Screen Disconnect',
    title: 'Exit After Target or Loss Hit',
    description: 'The moment maximum profit (+125 pips) or maximum daily loss is hit, close MT5 immediately. Zero post-market screen attachment.',
    type: 'terminal'
  },
  {
    id: 'rule-05',
    tag: 'Rule 05 // Mechanical Circuit Breaker',
    title: '50% Risk Demotion on 2 Losses',
    description: 'If two consecutive losses occur in a row, risk is mechanically cut in half (50% lot reduction) for the next trading days.',
    type: 'demotion'
  },
  {
    id: 'rule-06',
    tag: 'Rule 06 // Capital Integrity',
    title: 'Absolute Max Lot Respect',
    description: 'The matrix ceiling is absolute. Zero bullet stacking, zero revenge oversized tickets. Never front-run the next tier lot size.',
    type: 'lotsize'
  }
];

export const INITIAL_AUDIT: AuditItem[] = [
  {
    id: 'audit-strengths',
    category: 'strengths',
    title: '1. Proven Edge (What Works)',
    points: [
      { bold: '66.18% Verified Win Rate:', text: 'Over 1,000 winning trades across 1,588 executions prove your edge is statistically real.' },
      { bold: 'Net Positive Cash Flow:', text: 'Total deposits of $355.05 vs $425.30 withdrawn leaves you +$70.25 net ahead in real money.' },
      { bold: 'Displacement Capture:', text: 'When Gold expands out of Asian chop, your DALE setups capture +20 to +90 pips cleanly.' }
    ]
  },
  {
    id: 'audit-weaknesses',
    category: 'weaknesses',
    title: '2. Why Accounts Blew Up',
    points: [
      { bold: 'Consolidation Trap:', text: 'Trading inside 15-pip chop boxes (up to 41 trades in 45 min) allowed broker spread to burn 25% of equity.' },
      { bold: 'Synthetic Stacking:', text: 'Stacking 3 to 6 micro-lots created fatal 0.06 to 0.08 lot sizes, erasing $60 in under 10 minutes.' },
      { bold: 'Ignoring Circuit Breakers:', text: 'Bypassing the 2-loss daily wall after normal scratches turned small pullbacks into total liquidations.' }
    ]
  },
  {
    id: 'audit-mechanics',
    category: 'mechanics',
    title: '3. The New Operating Protocol',
    points: [
      { bold: 'Pre-Trade 4H Filter:', text: 'Overlapping 1H/4H candles inside yesterday range = MT5 stays closed.' },
      { bold: 'Single Ticket Only:', text: 'Strictly 1 open order at a time. Multi-ticket stacking is permanently banned.' },
      { bold: '20% Monthly Sweeps:', text: 'Withdraw 20% of net profits every month to guarantee physical cash in hand.' }
    ]
  }
];

export const INITIAL_QUARTERS: TradingQuarter[] = ${JSON.stringify(quarters, null, 2)};
`;

fs.writeFileSync('src/data/roadmapData.ts', fileContent, 'utf8');
console.log('Successfully wrote updated 30K realistic roadmap to src/data/roadmapData.ts!');
