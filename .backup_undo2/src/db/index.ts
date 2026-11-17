import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.ts';
import { INITIAL_QUARTERS } from '../data/roadmapData.ts';
import { generateDefaultWeeklyObjectives } from '../data/defaultObjectives.ts';

// On Vercel serverless environments, hydrate /tmp/cockpit.db from the bundled pre-seeded SQLite database
if (process.env.VERCEL) {
  try {
    const bundled = path.join(process.cwd(), 'cockpit.db');
    const target = '/tmp/cockpit.db';
    if (fs.existsSync(bundled) && !fs.existsSync(target)) {
      fs.copyFileSync(bundled, target);
      console.log('⚡ Initialized /tmp/cockpit.db from bundled SQLite database.');
    }
  } catch (err) {
    console.warn('Could not copy bundled SQLite database:', err);
  }
}

// Best & fastest database: embedded local LibSQL/SQLite file or remote Turso cloud database
const dbPath = process.env.DATABASE_URL || (process.env.VERCEL ? 'file:/tmp/cockpit.db' : 'file:cockpit.db');

export const client = createClient({
  url: dbPath,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

// Auto-initialize tables on startup with high-performance WAL mode and seed 1-year roadmap
export async function initDatabase() {
  try {
    // Enable Write-Ahead Logging (WAL) for maximum concurrent read/write throughput
    if (!dbPath.startsWith('http')) {
      await client.execute('PRAGMA journal_mode = WAL;');
      await client.execute('PRAGMA synchronous = NORMAL;');
    }

    // 1. Users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        trader_name TEXT DEFAULT 'Yohannes Sharew',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 2. Daily Sessions table (Tracks all 252 sessions for the 1-year roadmap)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS daily_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        quarter_id TEXT NOT NULL,
        month_id TEXT NOT NULL,
        week_id TEXT NOT NULL,
        day_number INTEGER NOT NULL,
        day_name TEXT NOT NULL,
        date TEXT,
        planned_target REAL NOT NULL,
        actual_result REAL,
        delta_percent REAL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        proto TEXT,
        is_loss INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Ensure columns exist if table was created earlier without proto / is_loss
    try {
      await client.execute('ALTER TABLE daily_sessions ADD COLUMN proto TEXT;');
    } catch {
      // Column may already exist
    }
    try {
      await client.execute('ALTER TABLE daily_sessions ADD COLUMN is_loss INTEGER DEFAULT 0;');
    } catch {
      // Column may already exist
    }
    try {
      await client.execute('ALTER TABLE daily_sessions ADD COLUMN date TEXT;');
    } catch {
      // Column may already exist
    }

    await client.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_sessions_user_sid ON daily_sessions(user_id, session_id);
    `);

    // 3. Journal Notes table (Forensic sticky notes, reflections, trade reviews)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS journal_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        day_id TEXT NOT NULL,
        day_label TEXT,
        date TEXT,
        session_tag TEXT,
        title TEXT,
        content TEXT NOT NULL,
        color TEXT DEFAULT 'yellow',
        outcome TEXT,
        pnl REAL,
        rotation REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );
    `);

    // 4. Cockpit State table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS cockpit_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        trader_name TEXT DEFAULT 'Yohannes Sharew',
        devotion_gate_passed INTEGER DEFAULT 0,
        working_equity REAL DEFAULT 50.0,
        banked_cash REAL DEFAULT 0.0,
        net_worth REAL DEFAULT 50.0,
        win_rate REAL DEFAULT 100.0,
        total_wins INTEGER DEFAULT 0,
        total_losses INTEGER DEFAULT 0,
        completed_sessions INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 5. Performance Ratings table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS performance_ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        total_percentage INTEGER NOT NULL,
        summary_diagnosis TEXT NOT NULL,
        metrics_json TEXT NOT NULL,
        assessed_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 6. Mental State Logs table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS mental_state_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_id TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        day_id TEXT NOT NULL,
        session_tag TEXT NOT NULL,
        date TEXT NOT NULL,
        state_key TEXT NOT NULL,
        emoji TEXT NOT NULL,
        label TEXT NOT NULL,
        rating INTEGER NOT NULL,
        tags_json TEXT DEFAULT '[]',
        notes TEXT,
        logged_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 7. Weekly Execution Objectives table (48 weeks master goals & checklist items)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS weekly_objectives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_id TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        quarter_id TEXT NOT NULL,
        quarter_name TEXT,
        month_num TEXT,
        planned_target_pnl REAL NOT NULL,
        lot_size TEXT NOT NULL,
        drill_focus TEXT,
        primary_objective TEXT NOT NULL,
        tactical_notes TEXT,
        status TEXT NOT NULL DEFAULT 'upcoming',
        checklist_json TEXT DEFAULT '[]',
        debrief_notes TEXT,
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // =========================================================================
    // SEEDING: Ensure the complete 1-Year Roadmap (252 Sessions) is in Database
    // =========================================================================
    const sessionCountRes = await client.execute("SELECT COUNT(*) as cnt FROM daily_sessions WHERE user_id = 'local-trader';");
    const sessionCount = Number(sessionCountRes.rows[0]?.cnt || 0);

    const sampleSessionCheck = await client.execute("SELECT planned_target FROM daily_sessions WHERE session_id = 'w01-d1' AND user_id = 'local-trader';");
    const firstTarget = sampleSessionCheck.rows[0]?.planned_target !== undefined ? Number(sampleSessionCheck.rows[0]?.planned_target) : null;
    const needsSessionReseed = sessionCount < 252 || firstTarget !== 8.0;

    if (needsSessionReseed) {
      console.log(`Seeding/Calibrating 252 daily sessions for the 30K compounding roadmap... (Current: ${sessionCount}, w01-d1: ${firstTarget})`);
      for (const q of INITIAL_QUARTERS) {
        for (const m of q.months) {
          for (const w of m.weeks) {
            for (let dIdx = 0; dIdx < w.days.length; dIdx++) {
              const d = w.days[dIdx];
              const sId = `${w.id}-d${dIdx + 1}`;
              const cleanPnl = d.pnl.replace(/[^0-9.-]/g, '');
              const plannedNum = parseFloat(cleanPnl) || 25.0;
              await client.execute({
                sql: `INSERT OR REPLACE INTO daily_sessions 
                      (session_id, user_id, quarter_id, month_id, week_id, day_number, day_name, planned_target, status, notes, proto, is_loss) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                  sId,
                  'local-trader',
                  q.id,
                  m.id,
                  w.id,
                  dIdx + 1,
                  d.day,
                  plannedNum,
                  d.status || 'pending',
                  d.notes || null,
                  d.proto || null,
                  d.isLoss ? 1 : 0
                ]
              });
            }
          }
        }
      }
      console.log('✅ Seeded 252 daily sessions for the 30K compounding roadmap.');
    }

    // Seed 48 Weekly Objectives
    const objCountRes = await client.execute("SELECT COUNT(*) as cnt FROM weekly_objectives WHERE user_id = 'local-trader';");
    const objCount = Number(objCountRes.rows[0]?.cnt || 0);

    const sampleObjCheck = await client.execute("SELECT planned_target_pnl FROM weekly_objectives WHERE week_id = 'w01' AND user_id = 'local-trader';");
    const firstObjTarget = sampleObjCheck.rows[0]?.planned_target_pnl !== undefined ? Number(sampleObjCheck.rows[0]?.planned_target_pnl) : null;
    const needsObjReseed = objCount < 48 || firstObjTarget !== 25.0;

    if (needsObjReseed) {
      console.log(`Seeding/Calibrating 48 weekly execution objectives... (Current: ${objCount}, w01: ${firstObjTarget})`);
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
      console.log('✅ Seeded 48 weekly objectives.');
    }

    // Seed Initial State
    await client.execute({
      sql: `INSERT OR IGNORE INTO cockpit_state 
            (user_id, trader_name, devotion_gate_passed, working_equity, banked_cash, net_worth, win_rate, total_wins, total_losses, completed_sessions) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['local-trader', 'Yohannes Sharew', 1, 50.0, 0.0, 50.0, 100.0, 0, 0, 0]
    });

    // Seed Initial Orientation Note
    await client.execute({
      sql: `INSERT OR IGNORE INTO journal_notes 
            (note_id, user_id, day_id, day_label, date, session_tag, title, content, color, outcome, rotation, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'jn_prep_1',
        'local-trader',
        'prep_day',
        'Pre-Flight Briefing',
        new Date().toISOString().split('T')[0],
        'Pre-Launch Readiness',
        'Baseline Zero Ready: $50 Seed Tranche Grounded',
        'All 48-week targets verified against the $30K realistic compounding roadmap. Starting with untouched $50 seed capital. Strict 0.01 lot calibration and 20-pip stop on Gold XAU/USD. Rule 01 spiritual devotion foundation is locked in before opening charts on Day 1.',
        'amber',
        'devotion',
        -1.2,
        new Date().toISOString()
      ]
    });

    console.log('⚡ LibSQL / SQLite 1-Year Database initialized & fully synchronized.');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
  }
}
