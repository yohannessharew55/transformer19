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

const plan = lines.map((l, i) => {
  const parts = parseCSVLine(l);
  return {
    weekIdx: i + 1,
    quarter: parts[0],
    month: parts[1],
    week: parts[2],
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

console.log('Total weeks:', plan.length);
let anyError = false;
plan.forEach(w => {
  const calcEnd = Math.round((w.start + w.gain - w.sweep) * 100) / 100;
  if (Math.abs(calcEnd - w.end) > 0.05) {
    console.error(`Mismatch Week ${w.weekIdx} (${w.week}): start=${w.start}, gain=${w.gain}, sweep=${w.sweep}, expected=${w.end}, got=${calcEnd}`);
    anyError = true;
  }
});

if (!anyError) {
  console.log('All 48 weeks match the compounding formula exactly!');
}

console.log(JSON.stringify(plan.slice(0, 4), null, 2));
console.log(JSON.stringify(plan.slice(44, 48), null, 2));
