import type { TradingQuarter, TradingMonth, TradingWeek, DailySession, WeeklyObjective } from '../types/index.ts';

export interface PlanCsvRow {
  weekIdx: number;
  quarter: string;
  month: string;
  weekStr: string;
  lot: string;
  start: number;
  gain: number;
  sweep: number;
  end: number;
  maxRisk: number;
  targetPips: string;
  phaseFocus: string;
}

export interface PlanParseResult {
  success: boolean;
  error?: string;
  validationErrors: string[];
  summary?: {
    totalWeeks: number;
    totalSessions: number;
    startingCapital: number;
    totalGrossGains: number;
    totalBankSweeps: number;
    terminalRetained: number;
    terminalTotal: number;
    lotSizeRange: string;
  };
  quarters?: TradingQuarter[];
  objectives?: WeeklyObjective[];
  seedCapital?: number;
  targetBanked?: number;
  targetRetained?: number;
  targetTotal?: number;
}

const DEFAULT_PROTOS = [
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

/**
 * Splits a single CSV row handling quoted cells with commas.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
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

/**
 * Parses raw CSV string into fully calibrated Transformer19 roadmap and objectives.
 */
export function parsePlanCsv(csvContent: string): PlanParseResult {
  const validationErrors: string[] = [];
  if (!csvContent || typeof csvContent !== 'string') {
    return { success: false, error: 'Empty or invalid CSV content provided', validationErrors: ['File is empty'] };
  }

  const rawLines = csvContent.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (rawLines.length < 2) {
    return { success: false, error: 'CSV must contain at least a header and 1 week row', validationErrors: ['Insufficient rows'] };
  }

  const headerParts = parseCSVLine(rawLines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
  
  // Find column indices flexibly
  const findCol = (aliases: string[]): number => {
    return headerParts.findIndex(h => aliases.some(a => h.includes(a)));
  };

  const colQuarter = findCol(['quarter', 'qtr', 'q']);
  const colMonth = findCol(['month', 'mon', 'm']);
  const colWeek = findCol(['week', 'wk', 'w']);
  const colLot = findCol(['lot_size', 'lotsize', 'lot']);
  const colStart = findCol(['start_balance', 'startbalance', 'start', 'opening']);
  const colGain = findCol(['weekly_net_gain', 'weeklynetgain', 'net_gain', 'gain', 'target']);
  const colSweep = findCol(['bank_sweep', 'banksweep', 'sweep', 'withdrawal', 'harvest']);
  const colEnd = findCol(['ending_balance', 'endingbalance', 'end_balance', 'end']);
  const colRisk = findCol(['max_risk', 'maxrisk', 'risk']);
  const colPips = findCol(['target_pips', 'targetpips', 'pips']);
  const colFocus = findCol(['phase_focus', 'phasefocus', 'focus', 'objective', 'notes']);

  if (colStart === -1 || colGain === -1 || colEnd === -1) {
    return {
      success: false,
      error: 'CSV is missing required financial columns (Start_Balance, Weekly_Net_Gain, Ending_Balance)',
      validationErrors: ['Required columns not found in header']
    };
  }

  const rows: PlanCsvRow[] = [];

  for (let idx = 1; idx < rawLines.length; idx++) {
    const parts = parseCSVLine(rawLines[idx]);
    if (parts.length < 3) continue;

    const parseNum = (cIdx: number, defaultVal: number = 0) => {
      if (cIdx === -1 || !parts[cIdx]) return defaultVal;
      const clean = parts[cIdx].replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? defaultVal : parsed;
    };

    const weekIdx = idx;
    const quarter = colQuarter !== -1 && parts[colQuarter] ? parts[colQuarter] : `Q${Math.min(4, Math.ceil(idx / 12))}`;
    const month = colMonth !== -1 && parts[colMonth] ? parts[colMonth] : `M${String(Math.min(12, Math.ceil(idx / 4))).padStart(2, '0')}`;
    const weekStr = colWeek !== -1 && parts[colWeek] ? parts[colWeek] : `Week ${String(idx).padStart(2, '0')}`;
    const lot = colLot !== -1 && parts[colLot] ? parts[colLot] : '0.01 lot';
    const start = parseNum(colStart);
    const gain = parseNum(colGain);
    const sweep = parseNum(colSweep, 0);
    const end = parseNum(colEnd);
    const maxRisk = parseNum(colRisk, parseFloat(lot.replace(/[^0-9.]/g, '') || '0.01') * 20 * 10);
    const targetPips = colPips !== -1 && parts[colPips] ? parts[colPips] : '40-50';
    const phaseFocus = colFocus !== -1 && parts[colFocus] ? parts[colFocus].replace(/"/g, '').trim() : '';

    // Mathematical formula validation: Start + Gain - Sweep = End (tolerance 0.05)
    const expectedEnd = Math.round((start + gain - sweep) * 100) / 100;
    if (Math.abs(expectedEnd - end) > 0.1) {
      validationErrors.push(`Row ${idx} (${weekStr}): Math variance. Start ($${start}) + Gain ($${gain}) - Sweep ($${sweep}) = $${expectedEnd}, but CSV specifies $${end}.`);
    }

    rows.push({
      weekIdx,
      quarter,
      month,
      weekStr,
      lot,
      start,
      gain,
      sweep,
      end,
      maxRisk,
      targetPips,
      phaseFocus
    });
  }

  if (rows.length === 0) {
    return { success: false, error: 'No valid data rows found in CSV', validationErrors: ['Zero valid rows parsed'] };
  }

  // Calculate totals
  const totalWeeks = rows.length;
  const startingCapital = rows[0].start;
  const totalGrossGains = Math.round(rows.reduce((acc, r) => acc + r.gain, 0) * 100) / 100;
  const totalBankSweeps = Math.round(rows.reduce((acc, r) => acc + r.sweep, 0) * 100) / 100;
  const terminalRetained = rows[rows.length - 1].end;
  const terminalTotal = Math.round((terminalRetained + totalBankSweeps) * 100) / 100;
  const minLot = rows[0].lot;
  const maxLot = rows[rows.length - 1].lot;
  const lotSizeRange = `${minLot} → ${maxLot}`;

  // Group into 4 quarters, 12 months, 48 weeks
  const quartersDef = [
    { id: 'quarter-1', name: 'Q1: Foundation', subtitle: 'Foundation & Risk Grounding' },
    { id: 'quarter-2', name: 'Q2: Acceleration', subtitle: 'System Scaling & Position Elevation' },
    { id: 'quarter-3', name: 'Q3: Institutional Scale', subtitle: 'Institutional Brackets & Compounding' },
    { id: 'quarter-4', name: 'Q4: Harvest & Terminal', subtitle: 'Peak Compounding & Annual Sweep' }
  ];

  const monthNames = [
    'October', 'November', 'December',
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September'
  ];

  const quarters: TradingQuarter[] = [];
  const objectives: WeeklyObjective[] = [];
  let globalDayCounter = 1;

  for (let qIdx = 0; qIdx < 4; qIdx++) {
    const qDef = quartersDef[qIdx];
    const qMonths: TradingMonth[] = [];

    for (let mIdx = 0; mIdx < 3; mIdx++) {
      const globalMonthIdx = qIdx * 3 + mIdx;
      const monthNumStr = `M${String(globalMonthIdx + 1).padStart(2, '0')}`;
      const monthNameStr = monthNames[globalMonthIdx] || `Month ${globalMonthIdx + 1}`;
      
      const startWeekIdx = globalMonthIdx * 4;
      const endWeekIdx = startWeekIdx + 4;
      const monthRows = rows.slice(startWeekIdx, endWeekIdx);
      if (monthRows.length === 0) continue;

      const monthOpening = '$' + monthRows[0].start.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const lastMonthRow = monthRows[monthRows.length - 1];
      const monthSweepVal = monthRows.reduce((acc, r) => acc + r.sweep, 0);
      const monthBankOut = monthSweepVal > 0 
        ? '-$' + monthSweepVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '$0.00';
      const monthEndTarget = '$' + lastMonthRow.end.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const mWeeks: TradingWeek[] = [];

      for (let wIdx = 0; wIdx < monthRows.length; wIdx++) {
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
        const days: DailySession[] = [];
        const weeklyGain = row.gain;
        const maxRisk = row.maxRisk || 20;

        // Realistic 4-win, 1-loss distribution
        const lossPnl = -Math.round(maxRisk * 100) / 100;
        const targetPositive = weeklyGain - lossPnl; // gain + maxRisk

        // Distribute positive across 4 days (22%, 28%, 26%, 24%)
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
            : `${DEFAULT_PROTOS[(row.weekIdx * 5 + d) % DEFAULT_PROTOS.length]} (${lotStr})`;

          days.push({
            day: `Day ${globalDayCounter} (${dayNames[d].split(' ')[1].replace(/[()]/g, '')})`,
            proto: protoName,
            pnl: pnlStr,
            end: `End: $${runningBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            isLoss
          });
          globalDayCounter++;
        }

        // If week has bank sweep, append Day 6 Harvest row
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

        const drillText = row.phaseFocus || `Tier Execution // ${lotStr}`;

        mWeeks.push({
          id: weekId,
          num: `Week ${String(row.weekIdx).padStart(2, '0')} (Days ${days[0]?.day.split(' ')[1] || '1'}–${days[days.length - 1]?.day.split(' ')[1] || '5'})`,
          lot: lotStr,
          net: netStr,
          bal: balStr,
          isExtract,
          drill: drillText,
          days
        });

        // Weekly Objective Generation
        const plannedNum = isExtract ? row.sweep : row.gain;
        let primaryGoal = row.phaseFocus
          ? `${row.phaseFocus} (${netStr} target)`
          : `Execute planned ${lotStr} sizing and achieve ${netStr} target with zero rule breaches.`;

        if (row.weekIdx === totalWeeks) {
          primaryGoal = `Final terminal milestone: complete the ${totalWeeks}-week master compounding plan ($${terminalRetained.toLocaleString()} equity + $${totalBankSweeps.toLocaleString()} banked sweeps = $${terminalTotal.toLocaleString()} total value).`;
        }

        objectives.push({
          weekId,
          weekNum: `Week ${String(row.weekIdx).padStart(2, '0')}`,
          quarterId: qDef.id,
          quarterName: qDef.name,
          monthNum: monthNumStr,
          plannedTargetPnl: plannedNum,
          lotSize: lotStr,
          drillFocus: drillText,
          primaryObjective: primaryGoal,
          tacticalNotes: isExtract 
            ? 'Execute scheduled 20% physical bank sweep. Reset emotional baseline to zero.'
            : 'Maintain strict 20-pip stops. Stop trading immediately after session target reached.',
          status: row.weekIdx === 1 ? 'in_progress' : 'upcoming',
          checklist: [
            { id: `${weekId}_c1`, text: 'Clear 1-hour Bible devotion & prayer before charts each morning', completed: row.weekIdx === 1 },
            { id: `${weekId}_c2`, text: 'Trade strictly inside London (07:00 UTC) and NY (13:30 UTC) killzones', completed: false },
            { id: `${weekId}_c3`, text: `Enforce mechanical 20-pip stop loss limit on ${lotStr}`, completed: false },
            { id: `${weekId}_c4`, text: isExtract ? `Complete 20% physical profit sweep ($${row.sweep})` : `Harvest target ${netStr} without exceeding risk budget`, completed: false }
          ],
          debriefNotes: '',
          updatedAt: new Date().toISOString()
        });
      }

      qMonths.push({
        id: `q${qIdx + 1}-m${mIdx + 1}`,
        monthNum: monthNumStr,
        name: monthNameStr,
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

  const totalSessions = globalDayCounter - 1;

  return {
    success: true,
    validationErrors,
    summary: {
      totalWeeks,
      totalSessions,
      startingCapital,
      totalGrossGains,
      totalBankSweeps,
      terminalRetained,
      terminalTotal,
      lotSizeRange
    },
    quarters,
    objectives,
    seedCapital: startingCapital,
    targetBanked: totalBankSweeps,
    targetRetained: terminalRetained,
    targetTotal: terminalTotal
  };
}

/**
 * Exports current quarters schedule back into a standard CSV string.
 */
export function exportCurrentPlanToCsv(quarters: TradingQuarter[]): string {
  const headers = [
    'Quarter',
    'Month',
    'Week',
    'Lot_Size',
    'Start_Balance',
    'Weekly_Net_Gain',
    'Bank_Sweep_20pct',
    'Ending_Balance',
    'Max_Risk_20Pips',
    'Target_Pips',
    'Phase_Focus'
  ];

  const rows: string[] = [headers.join(',')];

  let weekCounter = 1;

  quarters.forEach(q => {
    q.months.forEach(m => {
      m.weeks.forEach(w => {
        const weekNumStr = `Week ${String(weekCounter).padStart(2, '0')}`;
        const lotClean = w.lot;
        
        // Extract balances
        const balParts = w.bal.split('→').map(b => parseFloat(b.replace(/[^0-9.-]/g, '')) || 0);
        const startBal = balParts[0] || 0;
        const endBal = balParts[1] || 0;

        // Extract gain & sweep
        let gain = 0;
        let sweep = 0;

        if (w.days && w.days.length > 0) {
          w.days.forEach(d => {
            const num = parseFloat(d.pnl.replace(/[^0-9.-]/g, '')) || 0;
            if (d.isExtractRow) {
              sweep = Math.abs(num);
            } else {
              gain += num;
            }
          });
        } else {
          gain = endBal - startBal;
        }

        const maxRiskMatch = w.lot.match(/[0-9.]+/);
        const lotVal = maxRiskMatch ? parseFloat(maxRiskMatch[0]) : 0.01;
        const maxRisk = Math.round(lotVal * 20 * 10 * 100) / 100;

        const row = [
          q.name.split(':')[0] || 'Q1',
          m.monthNum,
          weekNumStr,
          `"${lotClean}"`,
          startBal.toFixed(1),
          gain.toFixed(1),
          sweep.toFixed(1),
          endBal.toFixed(1),
          maxRisk.toFixed(1),
          '40-50',
          `"${(w.drill || '').replace(/"/g, '""')}"`
        ];

        rows.push(row.join(','));
        weekCounter++;
      });
    });
  });

  return rows.join('\n');
}
