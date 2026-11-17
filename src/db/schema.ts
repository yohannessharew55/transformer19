import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// Users table (maps to Firebase Auth UID or Local Operator)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  traderName: text('trader_name').default('Yohannes Sharew'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Daily Trading Sessions (48-week execution roadmap)
export const dailySessions = sqliteTable('daily_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull(), // e.g. "q1-m1-w01-d1"
  userId: text('user_id').notNull(), // references users.uid
  quarterId: text('quarter_id').notNull(),
  monthId: text('month_id').notNull(),
  weekId: text('week_id').notNull(),
  dayNumber: integer('day_number').notNull(),
  dayName: text('day_name').notNull(),
  date: text('date'),
  plannedTarget: real('planned_target').notNull(),
  actualResult: real('actual_result'),
  deltaPercent: real('delta_percent').default(0),
  status: text('status').notNull().default('pending'), // 'pending' | 'completed' | 'skipped'
  notes: text('notes'),
  proto: text('proto'),
  isLoss: integer('is_loss', { mode: 'boolean' }).default(false),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Sticky Note Reflections & Trade Journals
export const journalNotes = sqliteTable('journal_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  noteId: text('note_id').notNull().unique(),
  userId: text('user_id').notNull(),
  dayId: text('day_id').notNull(), // e.g. "q1-m1-w01-d1"
  dayLabel: text('day_label'),
  date: text('date'),
  sessionTag: text('session_tag'), // 'London Open' | 'NY Open' | 'Asian Scalp'
  title: text('title'),
  content: text('content').notNull(),
  color: text('color').default('yellow'),
  outcome: text('outcome'), // 'WIN' | 'LOSS' | 'SCRATCH' | 'NOTE'
  pnl: real('pnl'),
  rotation: real('rotation').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
});

// Real-time compounding cockpit state
export const cockpitState = sqliteTable('cockpit_state', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  traderName: text('trader_name').default('Yohannes Sharew'),
  devotionGatePassedToday: integer('devotion_gate_passed', { mode: 'boolean' }).default(false),
  workingEquity: real('working_equity').default(50.0),
  bankedCash: real('banked_cash').default(0.0),
  netWorth: real('net_worth').default(50.0),
  winRate: real('win_rate').default(100.0),
  totalWins: integer('total_wins').default(1),
  totalLosses: integer('total_losses').default(0),
  completedSessions: integer('completed_sessions').default(1),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// AI Performance Audit Ratings
export const performanceRatings = sqliteTable('performance_ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  totalPercentage: integer('total_percentage').notNull(),
  summaryDiagnosis: text('summary_diagnosis').notNull(),
  metricsJson: text('metrics_json').notNull(), // stringified array of 6 discipline ratings
  assessedAt: text('assessed_at').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// Mental State Tracker Logs
export const mentalStateLogs = sqliteTable('mental_state_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  logId: text('log_id').notNull().unique(),
  userId: text('user_id').notNull(),
  dayId: text('day_id').notNull(),
  sessionTag: text('session_tag').notNull(),
  date: text('date').notNull(),
  stateKey: text('state_key').notNull(),
  emoji: text('emoji').notNull(),
  label: text('label').notNull(),
  rating: integer('rating').notNull(),
  tagsJson: text('tags_json').default('[]'),
  notes: text('notes'),
  loggedAt: text('logged_at').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// Weekly Execution Objectives (48 weeks roadmap targets & checklist items)
export const weeklyObjectives = sqliteTable('weekly_objectives', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  weekId: text('week_id').notNull().unique(), // e.g. "w01", "w02", ..., "w48"
  userId: text('user_id').notNull(),
  quarterId: text('quarter_id').notNull(),
  quarterName: text('quarter_name'),
  monthNum: text('month_num'),
  plannedTargetPnl: real('planned_target_pnl').notNull(),
  lotSize: text('lot_size').notNull(),
  drillFocus: text('drill_focus'),
  primaryObjective: text('primary_objective').notNull(),
  tacticalNotes: text('tactical_notes'),
  status: text('status').notNull().default('upcoming'), // 'upcoming' | 'in_progress' | 'completed' | 'missed'
  checklistJson: text('checklist_json').default('[]'),
  debriefNotes: text('debrief_notes'),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});
