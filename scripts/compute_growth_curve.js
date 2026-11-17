import fs from 'fs';

const raw = fs.readFileSync('C:\\Users\\User\\Downloads\\Terminal_30K_Realistic_Plan.csv', 'utf8').trim().split('\n');
const rows = raw.slice(1).map(line => {
  const parts = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
  return {
    q: parts[0]?.trim(),
    m: parts[1]?.trim(),
    w: parts[2]?.trim(),
    lot: parts[3]?.trim(),
    start: parseFloat(parts[4]),
    gain: parseFloat(parts[5]),
    sweep: parseFloat(parts[6]),
    end: parseFloat(parts[7]),
    risk: parseFloat(parts[8]),
    targetPips: parts[9]?.trim(),
    phase: parts[10]?.replace(/\"/g, '').trim()
  };
});

let cumulativeBanked = 0;
const growthCurve = rows.map((r, idx) => {
  cumulativeBanked += r.sweep;
  const lotNum = parseFloat(r.lot) || (r.lot.includes('1.50') ? 1.50 : 0.01);
  return {
    week: idx + 1,
    label: `W${String(idx + 1).padStart(2, '0')}`,
    lotNum,
    lotStr: r.lot,
    equity: r.end,
    banked: cumulativeBanked,
    total: r.end + cumulativeBanked,
    weeklyGain: r.gain,
    sweep: r.sweep
  };
});

const monthNames = [
  'October', 'November', 'December',
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September'
];

const monthlySummary = [];
for (let mIdx = 1; mIdx <= 12; mIdx++) {
  const mId = `M${String(mIdx).padStart(2, '0')}`;
  const mWeeks = rows.filter(r => r.m === mId);
  const mGross = mWeeks.reduce((acc, w) => acc + w.gain, 0);
  const mSweep = mWeeks.reduce((acc, w) => acc + w.sweep, 0);
  const mEnd = mWeeks[mWeeks.length - 1].end;
  monthlySummary.push({
    month: mId,
    name: monthNames[mIdx - 1],
    gross: Math.round(mGross * 100) / 100,
    bankOut: Math.round(mSweep * 100) / 100,
    endingEquity: mEnd
  });
}

console.log('Sample Growth Curve item (W01):', growthCurve[0]);
console.log('Sample Growth Curve item (W48):', growthCurve[47]);
console.log('Monthly Summary:', monthlySummary);

const exportCode = `
export interface GrowthCurvePoint {
  week: number;
  label: string;
  lotNum: number;
  lotStr: string;
  equity: number;
  banked: number;
  total: number;
  weeklyGain: number;
  sweep: number;
}

export interface MonthlySummaryItem {
  month: string;
  name: string;
  gross: number;
  bankOut: number;
  endingEquity: number;
}

export const PLANNED_GROWTH_CURVE: GrowthCurvePoint[] = ${JSON.stringify(growthCurve, null, 2)};

export const MONTHLY_SUMMARY: MonthlySummaryItem[] = ${JSON.stringify(monthlySummary, null, 2)};
`;

fs.writeFileSync('scripts/growth_exports.ts', exportCode, 'utf8');
console.log('Generated scripts/growth_exports.ts');
