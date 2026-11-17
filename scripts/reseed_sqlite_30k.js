import { client, initDatabase } from '../src/db/index.ts';
import { generateDefaultWeeklyObjectives } from '../src/data/defaultObjectives.ts';
import { INITIAL_QUARTERS } from '../src/data/roadmapData.ts';

await initDatabase();

const defaultObjectives = generateDefaultWeeklyObjectives(INITIAL_QUARTERS);
for (const obj of defaultObjectives) {
  await client.execute({
    sql: `INSERT OR REPLACE INTO weekly_objectives 
          (week_id, user_id, quarter_id, quarter_name, month_num, planned_target_pnl, lot_size, drill_focus, primary_objective, tactical_notes, status, checklist_json, debrief_notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      obj.weekId,
      'local-trader',
      obj.quarterId,
      obj.quarterName || '',
      obj.monthNum || '',
      obj.plannedTargetPnl,
      obj.lotSize,
      obj.drillFocus || '',
      obj.primaryObjective,
      obj.tacticalNotes || '',
      obj.status,
      JSON.stringify(obj.checklist || []),
      obj.debriefNotes || ''
    ]
  });
}
console.log('✅ Re-seeded all 48 objectives in cockpit.db');

const w1 = await client.execute("SELECT week_id, planned_target_pnl, lot_size, primary_objective FROM weekly_objectives WHERE week_id = 'w01';");
const w48 = await client.execute("SELECT week_id, planned_target_pnl, lot_size, primary_objective FROM weekly_objectives WHERE week_id = 'w48';");
console.log('Week 1:', w1.rows[0]);
console.log('Week 48:', w48.rows[0]);
