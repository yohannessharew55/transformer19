var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server.ts
import express from "express";
import dotenv from "dotenv";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// src/db/index.ts
import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cockpitState: () => cockpitState,
  dailySessions: () => dailySessions,
  journalNotes: () => journalNotes,
  mentalStateLogs: () => mentalStateLogs,
  performanceRatings: () => performanceRatings,
  users: () => users,
  weeklyObjectives: () => weeklyObjectives
});
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
var users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull(),
  traderName: text("trader_name").default("Yohannes Sharew"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`)
});
var dailySessions = sqliteTable("daily_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  // e.g. "q1-m1-w01-d1"
  userId: text("user_id").notNull(),
  // references users.uid
  quarterId: text("quarter_id").notNull(),
  monthId: text("month_id").notNull(),
  weekId: text("week_id").notNull(),
  dayNumber: integer("day_number").notNull(),
  dayName: text("day_name").notNull(),
  date: text("date"),
  plannedTarget: real("planned_target").notNull(),
  actualResult: real("actual_result"),
  deltaPercent: real("delta_percent").default(0),
  status: text("status").notNull().default("pending"),
  // 'pending' | 'completed' | 'skipped'
  notes: text("notes"),
  proto: text("proto"),
  isLoss: integer("is_loss", { mode: "boolean" }).default(false),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`)
});
var journalNotes = sqliteTable("journal_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  noteId: text("note_id").notNull().unique(),
  userId: text("user_id").notNull(),
  dayId: text("day_id").notNull(),
  // e.g. "q1-m1-w01-d1"
  dayLabel: text("day_label"),
  date: text("date"),
  sessionTag: text("session_tag"),
  // 'London Open' | 'NY Open' | 'Asian Scalp'
  title: text("title"),
  content: text("content").notNull(),
  color: text("color").default("yellow"),
  outcome: text("outcome"),
  // 'WIN' | 'LOSS' | 'SCRATCH' | 'NOTE'
  pnl: real("pnl"),
  rotation: real("rotation").default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at")
});
var cockpitState = sqliteTable("cockpit_state", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(),
  traderName: text("trader_name").default("Yohannes Sharew"),
  devotionGatePassedToday: integer("devotion_gate_passed", { mode: "boolean" }).default(false),
  workingEquity: real("working_equity").default(50),
  bankedCash: real("banked_cash").default(0),
  netWorth: real("net_worth").default(50),
  winRate: real("win_rate").default(100),
  totalWins: integer("total_wins").default(1),
  totalLosses: integer("total_losses").default(0),
  completedSessions: integer("completed_sessions").default(1),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`)
});
var performanceRatings = sqliteTable("performance_ratings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  totalPercentage: integer("total_percentage").notNull(),
  summaryDiagnosis: text("summary_diagnosis").notNull(),
  metricsJson: text("metrics_json").notNull(),
  // stringified array of 6 discipline ratings
  assessedAt: text("assessed_at").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`)
});
var mentalStateLogs = sqliteTable("mental_state_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  logId: text("log_id").notNull().unique(),
  userId: text("user_id").notNull(),
  dayId: text("day_id").notNull(),
  sessionTag: text("session_tag").notNull(),
  date: text("date").notNull(),
  stateKey: text("state_key").notNull(),
  emoji: text("emoji").notNull(),
  label: text("label").notNull(),
  rating: integer("rating").notNull(),
  tagsJson: text("tags_json").default("[]"),
  notes: text("notes"),
  loggedAt: text("logged_at").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`)
});
var weeklyObjectives = sqliteTable("weekly_objectives", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weekId: text("week_id").notNull().unique(),
  // e.g. "w01", "w02", ..., "w48"
  userId: text("user_id").notNull(),
  quarterId: text("quarter_id").notNull(),
  quarterName: text("quarter_name"),
  monthNum: text("month_num"),
  plannedTargetPnl: real("planned_target_pnl").notNull(),
  lotSize: text("lot_size").notNull(),
  drillFocus: text("drill_focus"),
  primaryObjective: text("primary_objective").notNull(),
  tacticalNotes: text("tactical_notes"),
  status: text("status").notNull().default("upcoming"),
  // 'upcoming' | 'in_progress' | 'completed' | 'missed'
  checklistJson: text("checklist_json").default("[]"),
  debriefNotes: text("debrief_notes"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`)
});

// src/data/roadmapData.ts
var INITIAL_QUARTERS = [
  {
    "id": "quarter-1",
    "name": "Q1: Foundation",
    "subtitle": "Months 01\u201303 // Micro-scale calibration from $50 to $800 ($190 Banked)",
    "months": [
      {
        "id": "q1-m1",
        "monthNum": "M01",
        "name": "Micro Boot-Up (Tiers 1 \u2192 2)",
        "opening": "$50.00",
        "bankOut": "-$30.00",
        "endTarget": "$170.00",
        "weeks": [
          {
            "id": "w01",
            "num": "Week 01 (Days 1\u20135)",
            "lot": "0.01 lot",
            "net": "+$25.00",
            "bal": "$50.00 \u2192 $75.00",
            "isExtract": false,
            "drill": "Seed Capital Calibration // 20-Pip Stop",
            "days": [
              {
                "day": "Day 1 (1)",
                "proto": "Tier Scale Entry (Displacement) (0.01 lot)",
                "pnl": "+$5.94",
                "end": "End: $55.94",
                "isLoss": false
              },
              {
                "day": "Day 2 (2)",
                "proto": "London Session Clean Target (0.01 lot)",
                "pnl": "+$7.56",
                "end": "End: $63.50",
                "isLoss": false
              },
              {
                "day": "Day 3 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.01 lot)",
                "pnl": "-$2.00",
                "end": "End: $61.50",
                "isLoss": true
              },
              {
                "day": "Day 4 (4)",
                "proto": "London Open Momentum Push (0.01 lot)",
                "pnl": "+$7.02",
                "end": "End: $68.52",
                "isLoss": false
              },
              {
                "day": "Day 5 (5)",
                "proto": "NY Continuation Run (0.01 lot)",
                "pnl": "+$6.48",
                "end": "End: $75.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w02",
            "num": "Week 02 (Days 6\u201310)",
            "lot": "0.01 lot",
            "net": "+$35.00",
            "bal": "$75.00 \u2192 $110.00",
            "isExtract": false,
            "drill": "Crossing $100 Barrier Cleanly",
            "days": [
              {
                "day": "Day 6 (1)",
                "proto": "Morning Range Retest (0.01 lot)",
                "pnl": "+$8.14",
                "end": "End: $83.14",
                "isLoss": false
              },
              {
                "day": "Day 7 (2)",
                "proto": "Displacement Reversal Setup (0.01 lot)",
                "pnl": "+$10.36",
                "end": "End: $93.50",
                "isLoss": false
              },
              {
                "day": "Day 8 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.01 lot)",
                "pnl": "-$2.00",
                "end": "End: $91.50",
                "isLoss": true
              },
              {
                "day": "Day 9 (4)",
                "proto": "NY Breakout Runner (0.01 lot)",
                "pnl": "+$9.62",
                "end": "End: $101.12",
                "isLoss": false
              },
              {
                "day": "Day 10 (5)",
                "proto": "Chop Scratch // 20-Pip Stop (0.01 lot)",
                "pnl": "+$8.88",
                "end": "End: $110.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w03",
            "num": "Week 03 (Days 11\u201315)",
            "lot": "0.02 lot",
            "net": "+$40.00",
            "bal": "$110.00 \u2192 $150.00",
            "isExtract": false,
            "drill": "First 0.02 Lot Step // Structure Shift",
            "days": [
              {
                "day": "Day 11 (1)",
                "proto": "DALE Retest Follow-Through (0.02 lot)",
                "pnl": "+$9.68",
                "end": "End: $119.68",
                "isLoss": false
              },
              {
                "day": "Day 12 (2)",
                "proto": "Pre-Weekend Trend Harvest (0.02 lot)",
                "pnl": "+$12.32",
                "end": "End: $132.00",
                "isLoss": false
              },
              {
                "day": "Day 13 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.02 lot)",
                "pnl": "-$4.00",
                "end": "End: $128.00",
                "isLoss": true
              },
              {
                "day": "Day 14 (4)",
                "proto": "London Session Clean Target (0.02 lot)",
                "pnl": "+$11.44",
                "end": "End: $139.44",
                "isLoss": false
              },
              {
                "day": "Day 15 (5)",
                "proto": "NY Killzone Expansion Scalp (0.02 lot)",
                "pnl": "+$10.56",
                "end": "End: $150.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w04",
            "num": "Week 04 (Days 16\u201321)",
            "lot": "0.02 lot",
            "net": "+$50 (-$30 Sweep)",
            "bal": "$150.00 \u2192 $170.00",
            "isExtract": true,
            "drill": "M01 Target ($200 Gross) & $30 Bank Sweep",
            "days": [
              {
                "day": "Day 16 (1)",
                "proto": "London Open Momentum Push (0.02 lot)",
                "pnl": "+$11.88",
                "end": "End: $161.88",
                "isLoss": false
              },
              {
                "day": "Day 17 (2)",
                "proto": "NY Continuation Run (0.02 lot)",
                "pnl": "+$15.12",
                "end": "End: $177.00",
                "isLoss": false
              },
              {
                "day": "Day 18 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.02 lot)",
                "pnl": "-$4.00",
                "end": "End: $173.00",
                "isLoss": true
              },
              {
                "day": "Day 19 (4)",
                "proto": "Displacement Reversal Setup (0.02 lot)",
                "pnl": "+$14.04",
                "end": "End: $187.04",
                "isLoss": false
              },
              {
                "day": "Day 20 (5)",
                "proto": "London Expansion Setup (0.02 lot)",
                "pnl": "+$12.96",
                "end": "End: $200.00",
                "isLoss": false
              },
              {
                "day": "Day 21 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$30.00)",
                "pnl": "-$30.00",
                "end": "MT5 Net: $170.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      },
      {
        "id": "q1-m2",
        "monthNum": "M02",
        "name": "Tier 3 Micro Scaling",
        "opening": "$170.00",
        "bankOut": "-$60.00",
        "endTarget": "$390.00",
        "weeks": [
          {
            "id": "w05",
            "num": "Week 05 (Days 22\u201326)",
            "lot": "0.02 lot",
            "net": "+$50.00",
            "bal": "$170.00 \u2192 $220.00",
            "isExtract": false,
            "drill": "Crossing $200 Base // London Expansions",
            "days": [
              {
                "day": "Day 22 (1)",
                "proto": "NY Breakout Runner (0.02 lot)",
                "pnl": "+$11.88",
                "end": "End: $181.88",
                "isLoss": false
              },
              {
                "day": "Day 23 (2)",
                "proto": "Chop Scratch // 20-Pip Stop (0.02 lot)",
                "pnl": "+$15.12",
                "end": "End: $197.00",
                "isLoss": false
              },
              {
                "day": "Day 24 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.02 lot)",
                "pnl": "-$4.00",
                "end": "End: $193.00",
                "isLoss": true
              },
              {
                "day": "Day 25 (4)",
                "proto": "Pre-Weekend Trend Harvest (0.02 lot)",
                "pnl": "+$14.04",
                "end": "End: $207.04",
                "isLoss": false
              },
              {
                "day": "Day 26 (5)",
                "proto": "Tier Scale Entry (Displacement) (0.02 lot)",
                "pnl": "+$12.96",
                "end": "End: $220.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w06",
            "num": "Week 06 (Days 27\u201331)",
            "lot": "0.03 lot",
            "net": "+$65.00",
            "bal": "$220.00 \u2192 $285.00",
            "isExtract": false,
            "drill": "0.03 Lot Calibration // DALE Retests",
            "days": [
              {
                "day": "Day 27 (1)",
                "proto": "London Session Clean Target (0.03 lot)",
                "pnl": "+$15.62",
                "end": "End: $235.62",
                "isLoss": false
              },
              {
                "day": "Day 28 (2)",
                "proto": "NY Killzone Expansion Scalp (0.03 lot)",
                "pnl": "+$19.88",
                "end": "End: $255.50",
                "isLoss": false
              },
              {
                "day": "Day 29 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.03 lot)",
                "pnl": "-$6.00",
                "end": "End: $249.50",
                "isLoss": true
              },
              {
                "day": "Day 30 (4)",
                "proto": "NY Continuation Run (0.03 lot)",
                "pnl": "+$18.46",
                "end": "End: $267.96",
                "isLoss": false
              },
              {
                "day": "Day 31 (5)",
                "proto": "Morning Range Retest (0.03 lot)",
                "pnl": "+$17.04",
                "end": "End: $285.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w07",
            "num": "Week 07 (Days 32\u201336)",
            "lot": "0.03 lot",
            "net": "+$75.00",
            "bal": "$285.00 \u2192 $360.00",
            "isExtract": false,
            "drill": "Approaching Tier 3 ($350 Milestone)",
            "days": [
              {
                "day": "Day 32 (1)",
                "proto": "Displacement Reversal Setup (0.03 lot)",
                "pnl": "+$17.82",
                "end": "End: $302.82",
                "isLoss": false
              },
              {
                "day": "Day 33 (2)",
                "proto": "London Expansion Setup (0.03 lot)",
                "pnl": "+$22.68",
                "end": "End: $325.50",
                "isLoss": false
              },
              {
                "day": "Day 34 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.03 lot)",
                "pnl": "-$6.00",
                "end": "End: $319.50",
                "isLoss": true
              },
              {
                "day": "Day 35 (4)",
                "proto": "Chop Scratch // 20-Pip Stop (0.03 lot)",
                "pnl": "+$21.06",
                "end": "End: $340.56",
                "isLoss": false
              },
              {
                "day": "Day 36 (5)",
                "proto": "DALE Retest Follow-Through (0.03 lot)",
                "pnl": "+$19.44",
                "end": "End: $360.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w08",
            "num": "Week 08 (Days 37\u201342)",
            "lot": "0.04 lot",
            "net": "+$90 (-$60 Sweep)",
            "bal": "$360.00 \u2192 $390.00",
            "isExtract": true,
            "drill": "M02 Target ($450 Gross) & $60 Bank Sweep",
            "days": [
              {
                "day": "Day 37 (1)",
                "proto": "Pre-Weekend Trend Harvest (0.04 lot)",
                "pnl": "+$21.56",
                "end": "End: $381.56",
                "isLoss": false
              },
              {
                "day": "Day 38 (2)",
                "proto": "Tier Scale Entry (Displacement) (0.04 lot)",
                "pnl": "+$27.44",
                "end": "End: $409.00",
                "isLoss": false
              },
              {
                "day": "Day 39 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.04 lot)",
                "pnl": "-$8.00",
                "end": "End: $401.00",
                "isLoss": true
              },
              {
                "day": "Day 40 (4)",
                "proto": "NY Killzone Expansion Scalp (0.04 lot)",
                "pnl": "+$25.48",
                "end": "End: $426.48",
                "isLoss": false
              },
              {
                "day": "Day 41 (5)",
                "proto": "London Open Momentum Push (0.04 lot)",
                "pnl": "+$23.52",
                "end": "End: $450.00",
                "isLoss": false
              },
              {
                "day": "Day 42 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$60.00)",
                "pnl": "-$60.00",
                "end": "MT5 Net: $390.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      },
      {
        "id": "q1-m3",
        "monthNum": "M03",
        "name": "Tier 4 Foundation Climax",
        "opening": "$390.00",
        "bankOut": "-$100.00",
        "endTarget": "$800.00",
        "weeks": [
          {
            "id": "w09",
            "num": "Week 09 (Days 43\u201347)",
            "lot": "0.04 lot",
            "net": "+$100.00",
            "bal": "$390.00 \u2192 $490.00",
            "isExtract": false,
            "drill": "Crossing $450 Barrier // Risk Demotion Check",
            "days": [
              {
                "day": "Day 43 (1)",
                "proto": "NY Continuation Run (0.04 lot)",
                "pnl": "+$23.76",
                "end": "End: $413.76",
                "isLoss": false
              },
              {
                "day": "Day 44 (2)",
                "proto": "Morning Range Retest (0.04 lot)",
                "pnl": "+$30.24",
                "end": "End: $444.00",
                "isLoss": false
              },
              {
                "day": "Day 45 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.04 lot)",
                "pnl": "-$8.00",
                "end": "End: $436.00",
                "isLoss": true
              },
              {
                "day": "Day 46 (4)",
                "proto": "London Expansion Setup (0.04 lot)",
                "pnl": "+$28.08",
                "end": "End: $464.08",
                "isLoss": false
              },
              {
                "day": "Day 47 (5)",
                "proto": "NY Breakout Runner (0.04 lot)",
                "pnl": "+$25.92",
                "end": "End: $490.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w10",
            "num": "Week 10 (Days 48\u201352)",
            "lot": "0.05 lot",
            "net": "+$120.00",
            "bal": "$490.00 \u2192 $610.00",
            "isExtract": false,
            "drill": "Crossing $500 Milestone // 0.05 Lot",
            "days": [
              {
                "day": "Day 48 (1)",
                "proto": "Chop Scratch // 20-Pip Stop (0.05 lot)",
                "pnl": "+$28.60",
                "end": "End: $518.60",
                "isLoss": false
              },
              {
                "day": "Day 49 (2)",
                "proto": "DALE Retest Follow-Through (0.05 lot)",
                "pnl": "+$36.40",
                "end": "End: $555.00",
                "isLoss": false
              },
              {
                "day": "Day 50 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.05 lot)",
                "pnl": "-$10.00",
                "end": "End: $545.00",
                "isLoss": true
              },
              {
                "day": "Day 51 (4)",
                "proto": "Tier Scale Entry (Displacement) (0.05 lot)",
                "pnl": "+$33.80",
                "end": "End: $578.80",
                "isLoss": false
              },
              {
                "day": "Day 52 (5)",
                "proto": "London Session Clean Target (0.05 lot)",
                "pnl": "+$31.20",
                "end": "End: $610.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w11",
            "num": "Week 11 (Days 53\u201357)",
            "lot": "0.06 lot",
            "net": "+$140.00",
            "bal": "$610.00 \u2192 $750.00",
            "isExtract": false,
            "drill": "Scaling Toward Q1 Climax",
            "days": [
              {
                "day": "Day 53 (1)",
                "proto": "NY Killzone Expansion Scalp (0.06 lot)",
                "pnl": "+$33.44",
                "end": "End: $643.44",
                "isLoss": false
              },
              {
                "day": "Day 54 (2)",
                "proto": "London Open Momentum Push (0.06 lot)",
                "pnl": "+$42.56",
                "end": "End: $686.00",
                "isLoss": false
              },
              {
                "day": "Day 55 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.06 lot)",
                "pnl": "-$12.00",
                "end": "End: $674.00",
                "isLoss": true
              },
              {
                "day": "Day 56 (4)",
                "proto": "Morning Range Retest (0.06 lot)",
                "pnl": "+$39.52",
                "end": "End: $713.52",
                "isLoss": false
              },
              {
                "day": "Day 57 (5)",
                "proto": "Displacement Reversal Setup (0.06 lot)",
                "pnl": "+$36.48",
                "end": "End: $750.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w12",
            "num": "Week 12 (Days 58\u201363)",
            "lot": "0.07 lot",
            "net": "+$150 (-$100 Sweep)",
            "bal": "$750.00 \u2192 $800.00",
            "isExtract": true,
            "drill": "Q1 Close ($900 Gross) & $100 Bank Sweep",
            "days": [
              {
                "day": "Day 58 (1)",
                "proto": "London Expansion Setup (0.07 lot)",
                "pnl": "+$36.08",
                "end": "End: $786.08",
                "isLoss": false
              },
              {
                "day": "Day 59 (2)",
                "proto": "NY Breakout Runner (0.07 lot)",
                "pnl": "+$45.92",
                "end": "End: $832.00",
                "isLoss": false
              },
              {
                "day": "Day 60 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.07 lot)",
                "pnl": "-$14.00",
                "end": "End: $818.00",
                "isLoss": true
              },
              {
                "day": "Day 61 (4)",
                "proto": "DALE Retest Follow-Through (0.07 lot)",
                "pnl": "+$42.64",
                "end": "End: $860.64",
                "isLoss": false
              },
              {
                "day": "Day 62 (5)",
                "proto": "Pre-Weekend Trend Harvest (0.07 lot)",
                "pnl": "+$39.36",
                "end": "End: $900.00",
                "isLoss": false
              },
              {
                "day": "Day 63 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$100.00)",
                "pnl": "-$100.00",
                "end": "MT5 Net: $800.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "quarter-2",
    "name": "Q2: Acceleration",
    "subtitle": "Months 04\u201306 // Scaling from $800 to $4,090 ($820 Banked)",
    "months": [
      {
        "id": "q2-m1",
        "monthNum": "M04",
        "name": "Mini-Contract Runway",
        "opening": "$800.00",
        "bankOut": "-$160.00",
        "endTarget": "$1,440.00",
        "weeks": [
          {
            "id": "w13",
            "num": "Week 13 (Days 64\u201368)",
            "lot": "0.08 lot",
            "net": "+$160.00",
            "bal": "$800.00 \u2192 $960.00",
            "isExtract": false,
            "drill": "0.08 Lot Discipline // Approaching 4 Figures",
            "days": [
              {
                "day": "Day 64 (1)",
                "proto": "Tier Scale Entry (Displacement) (0.08 lot)",
                "pnl": "+$38.72",
                "end": "End: $838.72",
                "isLoss": false
              },
              {
                "day": "Day 65 (2)",
                "proto": "London Session Clean Target (0.08 lot)",
                "pnl": "+$49.28",
                "end": "End: $888.00",
                "isLoss": false
              },
              {
                "day": "Day 66 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.08 lot)",
                "pnl": "-$16.00",
                "end": "End: $872.00",
                "isLoss": true
              },
              {
                "day": "Day 67 (4)",
                "proto": "London Open Momentum Push (0.08 lot)",
                "pnl": "+$45.76",
                "end": "End: $917.76",
                "isLoss": false
              },
              {
                "day": "Day 68 (5)",
                "proto": "NY Continuation Run (0.08 lot)",
                "pnl": "+$42.24",
                "end": "End: $960.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w14",
            "num": "Week 14 (Days 69\u201373)",
            "lot": "0.09 lot",
            "net": "+$180.00",
            "bal": "$960.00 \u2192 $1,140.00",
            "isExtract": false,
            "drill": "Crossing $1,000 Institutional Milestone",
            "days": [
              {
                "day": "Day 69 (1)",
                "proto": "Morning Range Retest (0.09 lot)",
                "pnl": "+$43.56",
                "end": "End: $1,003.56",
                "isLoss": false
              },
              {
                "day": "Day 70 (2)",
                "proto": "Displacement Reversal Setup (0.09 lot)",
                "pnl": "+$55.44",
                "end": "End: $1,059.00",
                "isLoss": false
              },
              {
                "day": "Day 71 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.09 lot)",
                "pnl": "-$18.00",
                "end": "End: $1,041.00",
                "isLoss": true
              },
              {
                "day": "Day 72 (4)",
                "proto": "NY Breakout Runner (0.09 lot)",
                "pnl": "+$51.48",
                "end": "End: $1,092.48",
                "isLoss": false
              },
              {
                "day": "Day 73 (5)",
                "proto": "Chop Scratch // 20-Pip Stop (0.09 lot)",
                "pnl": "+$47.52",
                "end": "End: $1,140.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w15",
            "num": "Week 15 (Days 74\u201378)",
            "lot": "0.10 lot",
            "net": "+$220.00",
            "bal": "$1,140.00 \u2192 $1,360.00",
            "isExtract": false,
            "drill": "Standard Mini-Contract (0.10 Lot) Runway",
            "days": [
              {
                "day": "Day 74 (1)",
                "proto": "DALE Retest Follow-Through (0.10 lot)",
                "pnl": "+$52.80",
                "end": "End: $1,192.80",
                "isLoss": false
              },
              {
                "day": "Day 75 (2)",
                "proto": "Pre-Weekend Trend Harvest (0.10 lot)",
                "pnl": "+$67.20",
                "end": "End: $1,260.00",
                "isLoss": false
              },
              {
                "day": "Day 76 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.10 lot)",
                "pnl": "-$20.00",
                "end": "End: $1,240.00",
                "isLoss": true
              },
              {
                "day": "Day 77 (4)",
                "proto": "London Session Clean Target (0.10 lot)",
                "pnl": "+$62.40",
                "end": "End: $1,302.40",
                "isLoss": false
              },
              {
                "day": "Day 78 (5)",
                "proto": "NY Killzone Expansion Scalp (0.10 lot)",
                "pnl": "+$57.60",
                "end": "End: $1,360.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w16",
            "num": "Week 16 (Days 79\u201384)",
            "lot": "0.12 lot",
            "net": "+$240 (-$160 Sweep)",
            "bal": "$1,360.00 \u2192 $1,440.00",
            "isExtract": true,
            "drill": "M04 Target ($1.6k Gross) & $160 Bank Sweep",
            "days": [
              {
                "day": "Day 79 (1)",
                "proto": "London Open Momentum Push (0.12 lot)",
                "pnl": "+$58.08",
                "end": "End: $1,418.08",
                "isLoss": false
              },
              {
                "day": "Day 80 (2)",
                "proto": "NY Continuation Run (0.12 lot)",
                "pnl": "+$73.92",
                "end": "End: $1,492.00",
                "isLoss": false
              },
              {
                "day": "Day 81 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.12 lot)",
                "pnl": "-$24.00",
                "end": "End: $1,468.00",
                "isLoss": true
              },
              {
                "day": "Day 82 (4)",
                "proto": "Displacement Reversal Setup (0.12 lot)",
                "pnl": "+$68.64",
                "end": "End: $1,536.64",
                "isLoss": false
              },
              {
                "day": "Day 83 (5)",
                "proto": "London Expansion Setup (0.12 lot)",
                "pnl": "+$63.36",
                "end": "End: $1,600.00",
                "isLoss": false
              },
              {
                "day": "Day 84 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$160.00)",
                "pnl": "-$160.00",
                "end": "MT5 Net: $1,440.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      },
      {
        "id": "q2-m2",
        "monthNum": "M05",
        "name": "Mid-Tier Expansion",
        "opening": "$1,440.00",
        "bankOut": "-$250.00",
        "endTarget": "$2,450.00",
        "weeks": [
          {
            "id": "w17",
            "num": "Week 17 (Days 85\u201389)",
            "lot": "0.12 lot",
            "net": "+$260.00",
            "bal": "$1,440.00 \u2192 $1,700.00",
            "isExtract": false,
            "drill": "Approaching $2,000 Capital Tier",
            "days": [
              {
                "day": "Day 85 (1)",
                "proto": "NY Breakout Runner (0.12 lot)",
                "pnl": "+$62.48",
                "end": "End: $1,502.48",
                "isLoss": false
              },
              {
                "day": "Day 86 (2)",
                "proto": "Chop Scratch // 20-Pip Stop (0.12 lot)",
                "pnl": "+$79.52",
                "end": "End: $1,582.00",
                "isLoss": false
              },
              {
                "day": "Day 87 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.12 lot)",
                "pnl": "-$24.00",
                "end": "End: $1,558.00",
                "isLoss": true
              },
              {
                "day": "Day 88 (4)",
                "proto": "Pre-Weekend Trend Harvest (0.12 lot)",
                "pnl": "+$73.84",
                "end": "End: $1,631.84",
                "isLoss": false
              },
              {
                "day": "Day 89 (5)",
                "proto": "Tier Scale Entry (Displacement) (0.12 lot)",
                "pnl": "+$68.16",
                "end": "End: $1,700.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w18",
            "num": "Week 18 (Days 90\u201394)",
            "lot": "0.15 lot",
            "net": "+$300.00",
            "bal": "$1,700.00 \u2192 $2,000.00",
            "isExtract": false,
            "drill": "Crossing $2,000 Milestone Cleanly",
            "days": [
              {
                "day": "Day 90 (1)",
                "proto": "London Session Clean Target (0.15 lot)",
                "pnl": "+$72.60",
                "end": "End: $1,772.60",
                "isLoss": false
              },
              {
                "day": "Day 91 (2)",
                "proto": "NY Killzone Expansion Scalp (0.15 lot)",
                "pnl": "+$92.40",
                "end": "End: $1,865.00",
                "isLoss": false
              },
              {
                "day": "Day 92 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.15 lot)",
                "pnl": "-$30.00",
                "end": "End: $1,835.00",
                "isLoss": true
              },
              {
                "day": "Day 93 (4)",
                "proto": "NY Continuation Run (0.15 lot)",
                "pnl": "+$85.80",
                "end": "End: $1,920.80",
                "isLoss": false
              },
              {
                "day": "Day 94 (5)",
                "proto": "Morning Range Retest (0.15 lot)",
                "pnl": "+$79.20",
                "end": "End: $2,000.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w19",
            "num": "Week 19 (Days 95\u201399)",
            "lot": "0.16 lot",
            "net": "+$340.00",
            "bal": "$2,000.00 \u2192 $2,340.00",
            "isExtract": false,
            "drill": "Structure Expansion // Zero Stacking",
            "days": [
              {
                "day": "Day 95 (1)",
                "proto": "Displacement Reversal Setup (0.16 lot)",
                "pnl": "+$81.84",
                "end": "End: $2,081.84",
                "isLoss": false
              },
              {
                "day": "Day 96 (2)",
                "proto": "London Expansion Setup (0.16 lot)",
                "pnl": "+$104.16",
                "end": "End: $2,186.00",
                "isLoss": false
              },
              {
                "day": "Day 97 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.16 lot)",
                "pnl": "-$32.00",
                "end": "End: $2,154.00",
                "isLoss": true
              },
              {
                "day": "Day 98 (4)",
                "proto": "Chop Scratch // 20-Pip Stop (0.16 lot)",
                "pnl": "+$96.72",
                "end": "End: $2,250.72",
                "isLoss": false
              },
              {
                "day": "Day 99 (5)",
                "proto": "DALE Retest Follow-Through (0.16 lot)",
                "pnl": "+$89.28",
                "end": "End: $2,340.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w20",
            "num": "Week 20 (Days 100\u2013105)",
            "lot": "0.18 lot",
            "net": "+$360 (-$250 Sweep)",
            "bal": "$2,340.00 \u2192 $2,450.00",
            "isExtract": true,
            "drill": "M05 Target ($2.7k Gross) & $250 Bank Sweep",
            "days": [
              {
                "day": "Day 100 (1)",
                "proto": "Pre-Weekend Trend Harvest (0.18 lot)",
                "pnl": "+$87.12",
                "end": "End: $2,427.12",
                "isLoss": false
              },
              {
                "day": "Day 101 (2)",
                "proto": "Tier Scale Entry (Displacement) (0.18 lot)",
                "pnl": "+$110.88",
                "end": "End: $2,538.00",
                "isLoss": false
              },
              {
                "day": "Day 102 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.18 lot)",
                "pnl": "-$36.00",
                "end": "End: $2,502.00",
                "isLoss": true
              },
              {
                "day": "Day 103 (4)",
                "proto": "NY Killzone Expansion Scalp (0.18 lot)",
                "pnl": "+$102.96",
                "end": "End: $2,604.96",
                "isLoss": false
              },
              {
                "day": "Day 104 (5)",
                "proto": "London Open Momentum Push (0.18 lot)",
                "pnl": "+$95.04",
                "end": "End: $2,700.00",
                "isLoss": false
              },
              {
                "day": "Day 105 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$250.00)",
                "pnl": "-$250.00",
                "end": "MT5 Net: $2,450.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      },
      {
        "id": "q2-m3",
        "monthNum": "M06",
        "name": "Quarter-Way Milestone",
        "opening": "$2,450.00",
        "bankOut": "-$410.00",
        "endTarget": "$4,090.00",
        "weeks": [
          {
            "id": "w21",
            "num": "Week 21 (Days 106\u2013110)",
            "lot": "0.20 lot",
            "net": "+$420.00",
            "bal": "$2,450.00 \u2192 $2,870.00",
            "isExtract": false,
            "drill": "Crossing $2,500 Base // 0.20 Lot",
            "days": [
              {
                "day": "Day 106 (1)",
                "proto": "NY Continuation Run (0.20 lot)",
                "pnl": "+$101.20",
                "end": "End: $2,551.20",
                "isLoss": false
              },
              {
                "day": "Day 107 (2)",
                "proto": "Morning Range Retest (0.20 lot)",
                "pnl": "+$128.80",
                "end": "End: $2,680.00",
                "isLoss": false
              },
              {
                "day": "Day 108 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.20 lot)",
                "pnl": "-$40.00",
                "end": "End: $2,640.00",
                "isLoss": true
              },
              {
                "day": "Day 109 (4)",
                "proto": "London Expansion Setup (0.20 lot)",
                "pnl": "+$119.60",
                "end": "End: $2,759.60",
                "isLoss": false
              },
              {
                "day": "Day 110 (5)",
                "proto": "NY Breakout Runner (0.20 lot)",
                "pnl": "+$110.40",
                "end": "End: $2,870.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w22",
            "num": "Week 22 (Days 111\u2013115)",
            "lot": "0.22 lot",
            "net": "+$480.00",
            "bal": "$2,870.00 \u2192 $3,350.00",
            "isExtract": false,
            "drill": "Crossing $3,000 Milestone",
            "days": [
              {
                "day": "Day 111 (1)",
                "proto": "Chop Scratch // 20-Pip Stop (0.22 lot)",
                "pnl": "+$115.28",
                "end": "End: $2,985.28",
                "isLoss": false
              },
              {
                "day": "Day 112 (2)",
                "proto": "DALE Retest Follow-Through (0.22 lot)",
                "pnl": "+$146.72",
                "end": "End: $3,132.00",
                "isLoss": false
              },
              {
                "day": "Day 113 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.22 lot)",
                "pnl": "-$44.00",
                "end": "End: $3,088.00",
                "isLoss": true
              },
              {
                "day": "Day 114 (4)",
                "proto": "Tier Scale Entry (Displacement) (0.22 lot)",
                "pnl": "+$136.24",
                "end": "End: $3,224.24",
                "isLoss": false
              },
              {
                "day": "Day 115 (5)",
                "proto": "London Session Clean Target (0.22 lot)",
                "pnl": "+$125.76",
                "end": "End: $3,350.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w23",
            "num": "Week 23 (Days 116\u2013120)",
            "lot": "0.25 lot",
            "net": "+$550.00",
            "bal": "$3,350.00 \u2192 $3,900.00",
            "isExtract": false,
            "drill": "Approaching $4,000 Mid-Year Mark",
            "days": [
              {
                "day": "Day 116 (1)",
                "proto": "NY Killzone Expansion Scalp (0.25 lot)",
                "pnl": "+$132.00",
                "end": "End: $3,482.00",
                "isLoss": false
              },
              {
                "day": "Day 117 (2)",
                "proto": "London Open Momentum Push (0.25 lot)",
                "pnl": "+$168.00",
                "end": "End: $3,650.00",
                "isLoss": false
              },
              {
                "day": "Day 118 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.25 lot)",
                "pnl": "-$50.00",
                "end": "End: $3,600.00",
                "isLoss": true
              },
              {
                "day": "Day 119 (4)",
                "proto": "Morning Range Retest (0.25 lot)",
                "pnl": "+$156.00",
                "end": "End: $3,756.00",
                "isLoss": false
              },
              {
                "day": "Day 120 (5)",
                "proto": "Displacement Reversal Setup (0.25 lot)",
                "pnl": "+$144.00",
                "end": "End: $3,900.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w24",
            "num": "Week 24 (Days 121\u2013126)",
            "lot": "0.28 lot",
            "net": "+$600 (-$410 Sweep)",
            "bal": "$3,900.00 \u2192 $4,090.00",
            "isExtract": true,
            "drill": "Mid-Year Climax ($4.5k Gross) & $410 Sweep",
            "days": [
              {
                "day": "Day 121 (1)",
                "proto": "London Expansion Setup (0.28 lot)",
                "pnl": "+$144.32",
                "end": "End: $4,044.32",
                "isLoss": false
              },
              {
                "day": "Day 122 (2)",
                "proto": "NY Breakout Runner (0.28 lot)",
                "pnl": "+$183.68",
                "end": "End: $4,228.00",
                "isLoss": false
              },
              {
                "day": "Day 123 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.28 lot)",
                "pnl": "-$56.00",
                "end": "End: $4,172.00",
                "isLoss": true
              },
              {
                "day": "Day 124 (4)",
                "proto": "DALE Retest Follow-Through (0.28 lot)",
                "pnl": "+$170.56",
                "end": "End: $4,342.56",
                "isLoss": false
              },
              {
                "day": "Day 125 (5)",
                "proto": "Pre-Weekend Trend Harvest (0.28 lot)",
                "pnl": "+$157.44",
                "end": "End: $4,500.00",
                "isLoss": false
              },
              {
                "day": "Day 126 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$410.00)",
                "pnl": "-$410.00",
                "end": "MT5 Net: $4,090.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "quarter-3",
    "name": "Q3: Institutional Scale",
    "subtitle": "Months 07\u201309 // Expansion from $4,090 to $13,940 ($2,450 Banked)",
    "months": [
      {
        "id": "q3-m1",
        "monthNum": "M07",
        "name": "Half-Way Elevation",
        "opening": "$4,090.00",
        "bankOut": "-$580.00",
        "endTarget": "$6,420.00",
        "weeks": [
          {
            "id": "w25",
            "num": "Week 25 (Days 127\u2013131)",
            "lot": "0.30 lot",
            "net": "+$640.00",
            "bal": "$4,090.00 \u2192 $4,730.00",
            "isExtract": false,
            "drill": "Q3 Opening Drive // 0.30 Lot",
            "days": [
              {
                "day": "Day 127 (1)",
                "proto": "Tier Scale Entry (Displacement) (0.30 lot)",
                "pnl": "+$154.00",
                "end": "End: $4,244.00",
                "isLoss": false
              },
              {
                "day": "Day 128 (2)",
                "proto": "London Session Clean Target (0.30 lot)",
                "pnl": "+$196.00",
                "end": "End: $4,440.00",
                "isLoss": false
              },
              {
                "day": "Day 129 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.30 lot)",
                "pnl": "-$60.00",
                "end": "End: $4,380.00",
                "isLoss": true
              },
              {
                "day": "Day 130 (4)",
                "proto": "London Open Momentum Push (0.30 lot)",
                "pnl": "+$182.00",
                "end": "End: $4,562.00",
                "isLoss": false
              },
              {
                "day": "Day 131 (5)",
                "proto": "NY Continuation Run (0.30 lot)",
                "pnl": "+$168.00",
                "end": "End: $4,730.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w26",
            "num": "Week 26 (Days 132\u2013136)",
            "lot": "0.35 lot",
            "net": "+$720.00",
            "bal": "$4,730.00 \u2192 $5,450.00",
            "isExtract": false,
            "drill": "Crossing $5,000 Halfway Milestone",
            "days": [
              {
                "day": "Day 132 (1)",
                "proto": "Morning Range Retest (0.35 lot)",
                "pnl": "+$173.80",
                "end": "End: $4,903.80",
                "isLoss": false
              },
              {
                "day": "Day 133 (2)",
                "proto": "Displacement Reversal Setup (0.35 lot)",
                "pnl": "+$221.20",
                "end": "End: $5,125.00",
                "isLoss": false
              },
              {
                "day": "Day 134 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.35 lot)",
                "pnl": "-$70.00",
                "end": "End: $5,055.00",
                "isLoss": true
              },
              {
                "day": "Day 135 (4)",
                "proto": "NY Breakout Runner (0.35 lot)",
                "pnl": "+$205.40",
                "end": "End: $5,260.40",
                "isLoss": false
              },
              {
                "day": "Day 136 (5)",
                "proto": "Chop Scratch // 20-Pip Stop (0.35 lot)",
                "pnl": "+$189.60",
                "end": "End: $5,450.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w27",
            "num": "Week 27 (Days 137\u2013141)",
            "lot": "0.38 lot",
            "net": "+$750.00",
            "bal": "$5,450.00 \u2192 $6,200.00",
            "isExtract": false,
            "drill": "Crossing $6,000 Boundary Cleanly",
            "days": [
              {
                "day": "Day 137 (1)",
                "proto": "DALE Retest Follow-Through (0.38 lot)",
                "pnl": "+$181.72",
                "end": "End: $5,631.72",
                "isLoss": false
              },
              {
                "day": "Day 138 (2)",
                "proto": "Pre-Weekend Trend Harvest (0.38 lot)",
                "pnl": "+$231.28",
                "end": "End: $5,863.00",
                "isLoss": false
              },
              {
                "day": "Day 139 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.38 lot)",
                "pnl": "-$76.00",
                "end": "End: $5,787.00",
                "isLoss": true
              },
              {
                "day": "Day 140 (4)",
                "proto": "London Session Clean Target (0.38 lot)",
                "pnl": "+$214.76",
                "end": "End: $6,001.76",
                "isLoss": false
              },
              {
                "day": "Day 141 (5)",
                "proto": "NY Killzone Expansion Scalp (0.38 lot)",
                "pnl": "+$198.24",
                "end": "End: $6,200.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w28",
            "num": "Week 28 (Days 142\u2013147)",
            "lot": "0.40 lot",
            "net": "+$800 (-$580 Sweep)",
            "bal": "$6,200.00 \u2192 $6,420.00",
            "isExtract": true,
            "drill": "M07 Target ($7.0k Gross) & $580 Bank Sweep",
            "days": [
              {
                "day": "Day 142 (1)",
                "proto": "London Open Momentum Push (0.40 lot)",
                "pnl": "+$193.60",
                "end": "End: $6,393.60",
                "isLoss": false
              },
              {
                "day": "Day 143 (2)",
                "proto": "NY Continuation Run (0.40 lot)",
                "pnl": "+$246.40",
                "end": "End: $6,640.00",
                "isLoss": false
              },
              {
                "day": "Day 144 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.40 lot)",
                "pnl": "-$80.00",
                "end": "End: $6,560.00",
                "isLoss": true
              },
              {
                "day": "Day 145 (4)",
                "proto": "Displacement Reversal Setup (0.40 lot)",
                "pnl": "+$228.80",
                "end": "End: $6,788.80",
                "isLoss": false
              },
              {
                "day": "Day 146 (5)",
                "proto": "London Expansion Setup (0.40 lot)",
                "pnl": "+$211.20",
                "end": "End: $7,000.00",
                "isLoss": false
              },
              {
                "day": "Day 147 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$580.00)",
                "pnl": "-$580.00",
                "end": "MT5 Net: $6,420.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      },
      {
        "id": "q3-m2",
        "monthNum": "M08",
        "name": "5-Figure Approach",
        "opening": "$6,420.00",
        "bankOut": "-$810.00",
        "endTarget": "$9,690.00",
        "weeks": [
          {
            "id": "w29",
            "num": "Week 29 (Days 148\u2013152)",
            "lot": "0.45 lot",
            "net": "+$900.00",
            "bal": "$6,420.00 \u2192 $7,320.00",
            "isExtract": false,
            "drill": "Crossing $7,000 Base // London Windows",
            "days": [
              {
                "day": "Day 148 (1)",
                "proto": "NY Breakout Runner (0.45 lot)",
                "pnl": "+$217.80",
                "end": "End: $6,637.80",
                "isLoss": false
              },
              {
                "day": "Day 149 (2)",
                "proto": "Chop Scratch // 20-Pip Stop (0.45 lot)",
                "pnl": "+$277.20",
                "end": "End: $6,915.00",
                "isLoss": false
              },
              {
                "day": "Day 150 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.45 lot)",
                "pnl": "-$90.00",
                "end": "End: $6,825.00",
                "isLoss": true
              },
              {
                "day": "Day 151 (4)",
                "proto": "Pre-Weekend Trend Harvest (0.45 lot)",
                "pnl": "+$257.40",
                "end": "End: $7,082.40",
                "isLoss": false
              },
              {
                "day": "Day 152 (5)",
                "proto": "Tier Scale Entry (Displacement) (0.45 lot)",
                "pnl": "+$237.60",
                "end": "End: $7,320.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w30",
            "num": "Week 30 (Days 153\u2013157)",
            "lot": "0.50 lot",
            "net": "+$1,000.00",
            "bal": "$7,320.00 \u2192 $8,320.00",
            "isExtract": false,
            "drill": "0.50 Half-Standard Execution",
            "days": [
              {
                "day": "Day 153 (1)",
                "proto": "London Session Clean Target (0.50 lot)",
                "pnl": "+$242.00",
                "end": "End: $7,562.00",
                "isLoss": false
              },
              {
                "day": "Day 154 (2)",
                "proto": "NY Killzone Expansion Scalp (0.50 lot)",
                "pnl": "+$308.00",
                "end": "End: $7,870.00",
                "isLoss": false
              },
              {
                "day": "Day 155 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.50 lot)",
                "pnl": "-$100.00",
                "end": "End: $7,770.00",
                "isLoss": true
              },
              {
                "day": "Day 156 (4)",
                "proto": "NY Continuation Run (0.50 lot)",
                "pnl": "+$286.00",
                "end": "End: $8,056.00",
                "isLoss": false
              },
              {
                "day": "Day 157 (5)",
                "proto": "Morning Range Retest (0.50 lot)",
                "pnl": "+$264.00",
                "end": "End: $8,320.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w31",
            "num": "Week 31 (Days 158\u2013162)",
            "lot": "0.55 lot",
            "net": "+$1,080.00",
            "bal": "$8,320.00 \u2192 $9,400.00",
            "isExtract": false,
            "drill": "Approaching 5-Figure Threshold ($10k)",
            "days": [
              {
                "day": "Day 158 (1)",
                "proto": "Displacement Reversal Setup (0.55 lot)",
                "pnl": "+$261.80",
                "end": "End: $8,581.80",
                "isLoss": false
              },
              {
                "day": "Day 159 (2)",
                "proto": "London Expansion Setup (0.55 lot)",
                "pnl": "+$333.20",
                "end": "End: $8,915.00",
                "isLoss": false
              },
              {
                "day": "Day 160 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.55 lot)",
                "pnl": "-$110.00",
                "end": "End: $8,805.00",
                "isLoss": true
              },
              {
                "day": "Day 161 (4)",
                "proto": "Chop Scratch // 20-Pip Stop (0.55 lot)",
                "pnl": "+$309.40",
                "end": "End: $9,114.40",
                "isLoss": false
              },
              {
                "day": "Day 162 (5)",
                "proto": "DALE Retest Follow-Through (0.55 lot)",
                "pnl": "+$285.60",
                "end": "End: $9,400.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w32",
            "num": "Week 32 (Days 163\u2013168)",
            "lot": "0.60 lot",
            "net": "+$1,100 (-$810 Sweep)",
            "bal": "$9,400.00 \u2192 $9,690.00",
            "isExtract": true,
            "drill": "M08 Target ($10.5k Gross) & $810 Sweep",
            "days": [
              {
                "day": "Day 163 (1)",
                "proto": "Pre-Weekend Trend Harvest (0.60 lot)",
                "pnl": "+$268.40",
                "end": "End: $9,668.40",
                "isLoss": false
              },
              {
                "day": "Day 164 (2)",
                "proto": "Tier Scale Entry (Displacement) (0.60 lot)",
                "pnl": "+$341.60",
                "end": "End: $10,010.00",
                "isLoss": false
              },
              {
                "day": "Day 165 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.60 lot)",
                "pnl": "-$120.00",
                "end": "End: $9,890.00",
                "isLoss": true
              },
              {
                "day": "Day 166 (4)",
                "proto": "NY Killzone Expansion Scalp (0.60 lot)",
                "pnl": "+$317.20",
                "end": "End: $10,207.20",
                "isLoss": false
              },
              {
                "day": "Day 167 (5)",
                "proto": "London Open Momentum Push (0.60 lot)",
                "pnl": "+$292.80",
                "end": "End: $10,500.00",
                "isLoss": false
              },
              {
                "day": "Day 168 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$810.00)",
                "pnl": "-$810.00",
                "end": "MT5 Net: $9,690.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      },
      {
        "id": "q3-m3",
        "monthNum": "M09",
        "name": "Q3 Institutional Climax",
        "opening": "$9,690.00",
        "bankOut": "-$1,060.00",
        "endTarget": "$13,940.00",
        "weeks": [
          {
            "id": "w33",
            "num": "Week 33 (Days 169\u2013173)",
            "lot": "0.65 lot",
            "net": "+$1,250.00",
            "bal": "$9,690.00 \u2192 $10,940.00",
            "isExtract": false,
            "drill": "Firmly Crossing 5-Figure Base ($10k)",
            "days": [
              {
                "day": "Day 169 (1)",
                "proto": "NY Continuation Run (0.65 lot)",
                "pnl": "+$303.60",
                "end": "End: $9,993.60",
                "isLoss": false
              },
              {
                "day": "Day 170 (2)",
                "proto": "Morning Range Retest (0.65 lot)",
                "pnl": "+$386.40",
                "end": "End: $10,380.00",
                "isLoss": false
              },
              {
                "day": "Day 171 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.65 lot)",
                "pnl": "-$130.00",
                "end": "End: $10,250.00",
                "isLoss": true
              },
              {
                "day": "Day 172 (4)",
                "proto": "London Expansion Setup (0.65 lot)",
                "pnl": "+$358.80",
                "end": "End: $10,608.80",
                "isLoss": false
              },
              {
                "day": "Day 173 (5)",
                "proto": "NY Breakout Runner (0.65 lot)",
                "pnl": "+$331.20",
                "end": "End: $10,940.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w34",
            "num": "Week 34 (Days 174\u2013178)",
            "lot": "0.70 lot",
            "net": "+$1,350.00",
            "bal": "$10,940.00 \u2192 $12,290.00",
            "isExtract": false,
            "drill": "Structure Displacement Confirmation",
            "days": [
              {
                "day": "Day 174 (1)",
                "proto": "Chop Scratch // 20-Pip Stop (0.70 lot)",
                "pnl": "+$327.80",
                "end": "End: $11,267.80",
                "isLoss": false
              },
              {
                "day": "Day 175 (2)",
                "proto": "DALE Retest Follow-Through (0.70 lot)",
                "pnl": "+$417.20",
                "end": "End: $11,685.00",
                "isLoss": false
              },
              {
                "day": "Day 176 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.70 lot)",
                "pnl": "-$140.00",
                "end": "End: $11,545.00",
                "isLoss": true
              },
              {
                "day": "Day 177 (4)",
                "proto": "Tier Scale Entry (Displacement) (0.70 lot)",
                "pnl": "+$387.40",
                "end": "End: $11,932.40",
                "isLoss": false
              },
              {
                "day": "Day 178 (5)",
                "proto": "London Session Clean Target (0.70 lot)",
                "pnl": "+$357.60",
                "end": "End: $12,290.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w35",
            "num": "Week 35 (Days 179\u2013183)",
            "lot": "0.75 lot",
            "net": "+$1,350.00",
            "bal": "$12,290.00 \u2192 $13,640.00",
            "isExtract": false,
            "drill": "Scale Shock Defense // Emotion Baseline",
            "days": [
              {
                "day": "Day 179 (1)",
                "proto": "NY Killzone Expansion Scalp (0.75 lot)",
                "pnl": "+$330.00",
                "end": "End: $12,620.00",
                "isLoss": false
              },
              {
                "day": "Day 180 (2)",
                "proto": "London Open Momentum Push (0.75 lot)",
                "pnl": "+$420.00",
                "end": "End: $13,040.00",
                "isLoss": false
              },
              {
                "day": "Day 181 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.75 lot)",
                "pnl": "-$150.00",
                "end": "End: $12,890.00",
                "isLoss": true
              },
              {
                "day": "Day 182 (4)",
                "proto": "Morning Range Retest (0.75 lot)",
                "pnl": "+$390.00",
                "end": "End: $13,280.00",
                "isLoss": false
              },
              {
                "day": "Day 183 (5)",
                "proto": "Displacement Reversal Setup (0.75 lot)",
                "pnl": "+$360.00",
                "end": "End: $13,640.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w36",
            "num": "Week 36 (Days 184\u2013189)",
            "lot": "0.80 lot",
            "net": "+$1,360 (-$1,060 Sweep)",
            "bal": "$13,640.00 \u2192 $13,940.00",
            "isExtract": true,
            "drill": "Q3 Harvest ($15k Gross) & $1,060 Sweep",
            "days": [
              {
                "day": "Day 184 (1)",
                "proto": "London Expansion Setup (0.80 lot)",
                "pnl": "+$334.40",
                "end": "End: $13,974.40",
                "isLoss": false
              },
              {
                "day": "Day 185 (2)",
                "proto": "NY Breakout Runner (0.80 lot)",
                "pnl": "+$425.60",
                "end": "End: $14,400.00",
                "isLoss": false
              },
              {
                "day": "Day 186 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.80 lot)",
                "pnl": "-$160.00",
                "end": "End: $14,240.00",
                "isLoss": true
              },
              {
                "day": "Day 187 (4)",
                "proto": "DALE Retest Follow-Through (0.80 lot)",
                "pnl": "+$395.20",
                "end": "End: $14,635.20",
                "isLoss": false
              },
              {
                "day": "Day 188 (5)",
                "proto": "Pre-Weekend Trend Harvest (0.80 lot)",
                "pnl": "+$364.80",
                "end": "End: $15,000.00",
                "isLoss": false
              },
              {
                "day": "Day 189 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$1,060.00)",
                "pnl": "-$1,060.00",
                "end": "MT5 Net: $13,940.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "quarter-4",
    "name": "Q4: Harvest & Terminal",
    "subtitle": "Months 10\u201312 // Peak terminal compounding to $30,000 ($3,690 Banked)",
    "months": [
      {
        "id": "q4-m1",
        "monthNum": "M10",
        "name": "1.00 Standard Lot Gateway",
        "opening": "$13,940.00",
        "bankOut": "-$1,110.00",
        "endTarget": "$18,390.00",
        "weeks": [
          {
            "id": "w37",
            "num": "Week 37 (Days 190\u2013194)",
            "lot": "0.80 lot",
            "net": "+$1,350.00",
            "bal": "$13,940.00 \u2192 $15,290.00",
            "isExtract": false,
            "drill": "Q4 Kickoff // Capital Retention Mode",
            "days": [
              {
                "day": "Day 190 (1)",
                "proto": "Tier Scale Entry (Displacement) (0.80 lot)",
                "pnl": "+$332.20",
                "end": "End: $14,272.20",
                "isLoss": false
              },
              {
                "day": "Day 191 (2)",
                "proto": "London Session Clean Target (0.80 lot)",
                "pnl": "+$422.80",
                "end": "End: $14,695.00",
                "isLoss": false
              },
              {
                "day": "Day 192 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.80 lot)",
                "pnl": "-$160.00",
                "end": "End: $14,535.00",
                "isLoss": true
              },
              {
                "day": "Day 193 (4)",
                "proto": "London Open Momentum Push (0.80 lot)",
                "pnl": "+$392.60",
                "end": "End: $14,927.60",
                "isLoss": false
              },
              {
                "day": "Day 194 (5)",
                "proto": "NY Continuation Run (0.80 lot)",
                "pnl": "+$362.40",
                "end": "End: $15,290.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w38",
            "num": "Week 38 (Days 195\u2013199)",
            "lot": "0.85 lot",
            "net": "+$1,370.00",
            "bal": "$15,290.00 \u2192 $16,660.00",
            "isExtract": false,
            "drill": "Crossing $16,000 Capital Base",
            "days": [
              {
                "day": "Day 195 (1)",
                "proto": "Morning Range Retest (0.85 lot)",
                "pnl": "+$338.80",
                "end": "End: $15,628.80",
                "isLoss": false
              },
              {
                "day": "Day 196 (2)",
                "proto": "Displacement Reversal Setup (0.85 lot)",
                "pnl": "+$431.20",
                "end": "End: $16,060.00",
                "isLoss": false
              },
              {
                "day": "Day 197 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.85 lot)",
                "pnl": "-$170.00",
                "end": "End: $15,890.00",
                "isLoss": true
              },
              {
                "day": "Day 198 (4)",
                "proto": "NY Breakout Runner (0.85 lot)",
                "pnl": "+$400.40",
                "end": "End: $16,290.40",
                "isLoss": false
              },
              {
                "day": "Day 199 (5)",
                "proto": "Chop Scratch // 20-Pip Stop (0.85 lot)",
                "pnl": "+$369.60",
                "end": "End: $16,660.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w39",
            "num": "Week 39 (Days 200\u2013204)",
            "lot": "0.90 lot",
            "net": "+$1,420.00",
            "bal": "$16,660.00 \u2192 $18,080.00",
            "isExtract": false,
            "drill": "Approaching 1.00 Standard Contract",
            "days": [
              {
                "day": "Day 200 (1)",
                "proto": "DALE Retest Follow-Through (0.90 lot)",
                "pnl": "+$352.00",
                "end": "End: $17,012.00",
                "isLoss": false
              },
              {
                "day": "Day 201 (2)",
                "proto": "Pre-Weekend Trend Harvest (0.90 lot)",
                "pnl": "+$448.00",
                "end": "End: $17,460.00",
                "isLoss": false
              },
              {
                "day": "Day 202 (3)",
                "proto": "Stop Hit // 20-Pip Halt (0.90 lot)",
                "pnl": "-$180.00",
                "end": "End: $17,280.00",
                "isLoss": true
              },
              {
                "day": "Day 203 (4)",
                "proto": "London Session Clean Target (0.90 lot)",
                "pnl": "+$416.00",
                "end": "End: $17,696.00",
                "isLoss": false
              },
              {
                "day": "Day 204 (5)",
                "proto": "NY Killzone Expansion Scalp (0.90 lot)",
                "pnl": "+$384.00",
                "end": "End: $18,080.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w40",
            "num": "Week 40 (Days 205\u2013210)",
            "lot": "1.00 lot",
            "net": "+$1,420 (-$1,110 Sweep)",
            "bal": "$18,080.00 \u2192 $18,390.00",
            "isExtract": true,
            "drill": "M10 Target ($19.5k Gross) & $1,110 Sweep",
            "days": [
              {
                "day": "Day 205 (1)",
                "proto": "London Open Momentum Push (1.00 lot)",
                "pnl": "+$356.40",
                "end": "End: $18,436.40",
                "isLoss": false
              },
              {
                "day": "Day 206 (2)",
                "proto": "NY Continuation Run (1.00 lot)",
                "pnl": "+$453.60",
                "end": "End: $18,890.00",
                "isLoss": false
              },
              {
                "day": "Day 207 (3)",
                "proto": "Stop Hit // 20-Pip Halt (1.00 lot)",
                "pnl": "-$200.00",
                "end": "End: $18,690.00",
                "isLoss": true
              },
              {
                "day": "Day 208 (4)",
                "proto": "Displacement Reversal Setup (1.00 lot)",
                "pnl": "+$421.20",
                "end": "End: $19,111.20",
                "isLoss": false
              },
              {
                "day": "Day 209 (5)",
                "proto": "London Expansion Setup (1.00 lot)",
                "pnl": "+$388.80",
                "end": "End: $19,500.00",
                "isLoss": false
              },
              {
                "day": "Day 210 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$1,110.00)",
                "pnl": "-$1,110.00",
                "end": "MT5 Net: $18,390.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      },
      {
        "id": "q4-m2",
        "monthNum": "M11",
        "name": "Terminal Expansion Step",
        "opening": "$18,390.00",
        "bankOut": "-$1,320.00",
        "endTarget": "$23,680.00",
        "weeks": [
          {
            "id": "w41",
            "num": "Week 41 (Days 211\u2013215)",
            "lot": "1.00 lot",
            "net": "+$1,600.00",
            "bal": "$18,390.00 \u2192 $19,990.00",
            "isExtract": false,
            "drill": "1.00 Standard Lot Consistency",
            "days": [
              {
                "day": "Day 211 (1)",
                "proto": "NY Breakout Runner (1.00 lot)",
                "pnl": "+$396.00",
                "end": "End: $18,786.00",
                "isLoss": false
              },
              {
                "day": "Day 212 (2)",
                "proto": "Chop Scratch // 20-Pip Stop (1.00 lot)",
                "pnl": "+$504.00",
                "end": "End: $19,290.00",
                "isLoss": false
              },
              {
                "day": "Day 213 (3)",
                "proto": "Stop Hit // 20-Pip Halt (1.00 lot)",
                "pnl": "-$200.00",
                "end": "End: $19,090.00",
                "isLoss": true
              },
              {
                "day": "Day 214 (4)",
                "proto": "Pre-Weekend Trend Harvest (1.00 lot)",
                "pnl": "+$468.00",
                "end": "End: $19,558.00",
                "isLoss": false
              },
              {
                "day": "Day 215 (5)",
                "proto": "Tier Scale Entry (Displacement) (1.00 lot)",
                "pnl": "+$432.00",
                "end": "End: $19,990.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w42",
            "num": "Week 42 (Days 216\u2013220)",
            "lot": "1.10 lot",
            "net": "+$1,650.00",
            "bal": "$19,990.00 \u2192 $21,640.00",
            "isExtract": false,
            "drill": "Crossing $20,000 Milestone",
            "days": [
              {
                "day": "Day 216 (1)",
                "proto": "London Session Clean Target (1.10 lot)",
                "pnl": "+$411.40",
                "end": "End: $20,401.40",
                "isLoss": false
              },
              {
                "day": "Day 217 (2)",
                "proto": "NY Killzone Expansion Scalp (1.10 lot)",
                "pnl": "+$523.60",
                "end": "End: $20,925.00",
                "isLoss": false
              },
              {
                "day": "Day 218 (3)",
                "proto": "Stop Hit // 20-Pip Halt (1.10 lot)",
                "pnl": "-$220.00",
                "end": "End: $20,705.00",
                "isLoss": true
              },
              {
                "day": "Day 219 (4)",
                "proto": "NY Continuation Run (1.10 lot)",
                "pnl": "+$486.20",
                "end": "End: $21,191.20",
                "isLoss": false
              },
              {
                "day": "Day 220 (5)",
                "proto": "Morning Range Retest (1.10 lot)",
                "pnl": "+$448.80",
                "end": "End: $21,640.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w43",
            "num": "Week 43 (Days 221\u2013225)",
            "lot": "1.20 lot",
            "net": "+$1,660.00",
            "bal": "$21,640.00 \u2192 $23,300.00",
            "isExtract": false,
            "drill": "Controlled Expansion // 2-Loss Wall",
            "days": [
              {
                "day": "Day 221 (1)",
                "proto": "Displacement Reversal Setup (1.20 lot)",
                "pnl": "+$418.00",
                "end": "End: $22,058.00",
                "isLoss": false
              },
              {
                "day": "Day 222 (2)",
                "proto": "London Expansion Setup (1.20 lot)",
                "pnl": "+$532.00",
                "end": "End: $22,590.00",
                "isLoss": false
              },
              {
                "day": "Day 223 (3)",
                "proto": "Stop Hit // 20-Pip Halt (1.20 lot)",
                "pnl": "-$240.00",
                "end": "End: $22,350.00",
                "isLoss": true
              },
              {
                "day": "Day 224 (4)",
                "proto": "Chop Scratch // 20-Pip Stop (1.20 lot)",
                "pnl": "+$494.00",
                "end": "End: $22,844.00",
                "isLoss": false
              },
              {
                "day": "Day 225 (5)",
                "proto": "DALE Retest Follow-Through (1.20 lot)",
                "pnl": "+$456.00",
                "end": "End: $23,300.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w44",
            "num": "Week 44 (Days 226\u2013231)",
            "lot": "1.25 lot",
            "net": "+$1,700 (-$1,320 Sweep)",
            "bal": "$23,300.00 \u2192 $23,680.00",
            "isExtract": true,
            "drill": "M11 Target ($25k Gross) & $1,320 Sweep",
            "days": [
              {
                "day": "Day 226 (1)",
                "proto": "Pre-Weekend Trend Harvest (1.25 lot)",
                "pnl": "+$429.00",
                "end": "End: $23,729.00",
                "isLoss": false
              },
              {
                "day": "Day 227 (2)",
                "proto": "Tier Scale Entry (Displacement) (1.25 lot)",
                "pnl": "+$546.00",
                "end": "End: $24,275.00",
                "isLoss": false
              },
              {
                "day": "Day 228 (3)",
                "proto": "Stop Hit // 20-Pip Halt (1.25 lot)",
                "pnl": "-$250.00",
                "end": "End: $24,025.00",
                "isLoss": true
              },
              {
                "day": "Day 229 (4)",
                "proto": "NY Killzone Expansion Scalp (1.25 lot)",
                "pnl": "+$507.00",
                "end": "End: $24,532.00",
                "isLoss": false
              },
              {
                "day": "Day 230 (5)",
                "proto": "London Open Momentum Push (1.25 lot)",
                "pnl": "+$468.00",
                "end": "End: $25,000.00",
                "isLoss": false
              },
              {
                "day": "Day 231 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$1,320.00)",
                "pnl": "-$1,320.00",
                "end": "MT5 Net: $23,680.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      },
      {
        "id": "q4-m3",
        "monthNum": "M12",
        "name": "Terminal $30,000 Milestone",
        "opening": "$23,680.00",
        "bankOut": "-$1,260.00",
        "endTarget": "$30,000.00",
        "weeks": [
          {
            "id": "w45",
            "num": "Week 45 (Days 232\u2013236)",
            "lot": "1.30 lot",
            "net": "+$1,800.00",
            "bal": "$23,680.00 \u2192 $25,480.00",
            "isExtract": false,
            "drill": "Crossing Quarter-Way to $30k",
            "days": [
              {
                "day": "Day 232 (1)",
                "proto": "NY Continuation Run (1.30 lot)",
                "pnl": "+$453.20",
                "end": "End: $24,133.20",
                "isLoss": false
              },
              {
                "day": "Day 233 (2)",
                "proto": "Morning Range Retest (1.30 lot)",
                "pnl": "+$576.80",
                "end": "End: $24,710.00",
                "isLoss": false
              },
              {
                "day": "Day 234 (3)",
                "proto": "Stop Hit // 20-Pip Halt (1.30 lot)",
                "pnl": "-$260.00",
                "end": "End: $24,450.00",
                "isLoss": true
              },
              {
                "day": "Day 235 (4)",
                "proto": "London Expansion Setup (1.30 lot)",
                "pnl": "+$535.60",
                "end": "End: $24,985.60",
                "isLoss": false
              },
              {
                "day": "Day 236 (5)",
                "proto": "NY Breakout Runner (1.30 lot)",
                "pnl": "+$494.40",
                "end": "End: $25,480.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w46",
            "num": "Week 46 (Days 237\u2013241)",
            "lot": "1.40 lot",
            "net": "+$1,880.00",
            "bal": "$25,480.00 \u2192 $27,360.00",
            "isExtract": false,
            "drill": "Approaching Final Terminal Objective",
            "days": [
              {
                "day": "Day 237 (1)",
                "proto": "Chop Scratch // 20-Pip Stop (1.40 lot)",
                "pnl": "+$475.20",
                "end": "End: $25,955.20",
                "isLoss": false
              },
              {
                "day": "Day 238 (2)",
                "proto": "DALE Retest Follow-Through (1.40 lot)",
                "pnl": "+$604.80",
                "end": "End: $26,560.00",
                "isLoss": false
              },
              {
                "day": "Day 239 (3)",
                "proto": "Stop Hit // 20-Pip Halt (1.40 lot)",
                "pnl": "-$280.00",
                "end": "End: $26,280.00",
                "isLoss": true
              },
              {
                "day": "Day 240 (4)",
                "proto": "Tier Scale Entry (Displacement) (1.40 lot)",
                "pnl": "+$561.60",
                "end": "End: $26,841.60",
                "isLoss": false
              },
              {
                "day": "Day 241 (5)",
                "proto": "London Session Clean Target (1.40 lot)",
                "pnl": "+$518.40",
                "end": "End: $27,360.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w47",
            "num": "Week 47 (Days 242\u2013246)",
            "lot": "1.50 lot",
            "net": "+$2,640.00",
            "bal": "$27,360.00 \u2192 $30,000.00",
            "isExtract": false,
            "drill": "Reaching $30,000 Terminal Goal",
            "days": [
              {
                "day": "Day 242 (1)",
                "proto": "NY Killzone Expansion Scalp (1.50 lot)",
                "pnl": "+$646.80",
                "end": "End: $28,006.80",
                "isLoss": false
              },
              {
                "day": "Day 243 (2)",
                "proto": "London Open Momentum Push (1.50 lot)",
                "pnl": "+$823.20",
                "end": "End: $28,830.00",
                "isLoss": false
              },
              {
                "day": "Day 244 (3)",
                "proto": "Stop Hit // 20-Pip Halt (1.50 lot)",
                "pnl": "-$300.00",
                "end": "End: $28,530.00",
                "isLoss": true
              },
              {
                "day": "Day 245 (4)",
                "proto": "Morning Range Retest (1.50 lot)",
                "pnl": "+$764.40",
                "end": "End: $29,294.40",
                "isLoss": false
              },
              {
                "day": "Day 246 (5)",
                "proto": "Displacement Reversal Setup (1.50 lot)",
                "pnl": "+$705.60",
                "end": "End: $30,000.00",
                "isLoss": false
              }
            ]
          },
          {
            "id": "w48",
            "num": "Week 48 (Days 247\u2013252)",
            "lot": "1.50 CAP",
            "net": "-$1,260 Sweep",
            "bal": "$30,000.00 \u2192 $30,000.00",
            "isExtract": true,
            "drill": "Annual Harvest // Final $1,260 Sweep & Freeze",
            "days": [
              {
                "day": "Day 247 (1)",
                "proto": "London Expansion Setup (1.50 CAP)",
                "pnl": "+$343.20",
                "end": "End: $30,343.20",
                "isLoss": false
              },
              {
                "day": "Day 248 (2)",
                "proto": "NY Breakout Runner (1.50 CAP)",
                "pnl": "+$436.80",
                "end": "End: $30,780.00",
                "isLoss": false
              },
              {
                "day": "Day 249 (3)",
                "proto": "Stop Hit // 20-Pip Halt (1.50 CAP)",
                "pnl": "-$300.00",
                "end": "End: $30,480.00",
                "isLoss": true
              },
              {
                "day": "Day 250 (4)",
                "proto": "DALE Retest Follow-Through (1.50 CAP)",
                "pnl": "+$405.60",
                "end": "End: $30,885.60",
                "isLoss": false
              },
              {
                "day": "Day 251 (5)",
                "proto": "Pre-Weekend Trend Harvest (1.50 CAP)",
                "pnl": "+$374.40",
                "end": "End: $31,260.00",
                "isLoss": false
              },
              {
                "day": "Day 252 (Harvest)",
                "proto": "20% Physical Bank Withdrawal (-$1,260.00)",
                "pnl": "-$1,260.00",
                "end": "MT5 Net: $30,000.00",
                "isLoss": false,
                "isExtractRow": true
              }
            ]
          }
        ]
      }
    ]
  }
];

// src/data/defaultObjectives.ts
var generateDefaultWeeklyObjectives = (quarters = INITIAL_QUARTERS) => {
  const objectives = [];
  quarters.forEach((q) => {
    q.months.forEach((m) => {
      m.weeks.forEach((w, wIdx) => {
        const cleanNet = w.net.replace(/[^0-9.-]/g, "");
        const plannedNum = Math.abs(parseFloat(cleanNet)) || 100;
        let primaryGoal = `Execute planned ${w.lot} sizing and achieve ${w.net} target with zero rule breaches.`;
        let tactical = `Focus strictly on London/NY killzone setups. Maintain 20-pip fixed stops.`;
        if (w.id === "w48") {
          primaryGoal = "Final terminal milestone: complete the 48-week $30K compounding roadmap ($30,000 equity + $7,150 banked sweeps = $37,150 total value) and execute final $1,260 bank sweep.";
          tactical = "Preserve institutional net worth. Execute final capital sweep to designated bank vaults.";
        } else if (w.id === "w47") {
          primaryGoal = "Cross the $30,000 terminal equity milestone with strict 1.50 lot discipline and 20-pip stops.";
          tactical = "Lock in terminal capital target. Prepare for annual audit and final offline harvest.";
        } else if (w.isExtract) {
          primaryGoal = `Execute scheduled physical bank withdrawal (${w.net}) and lock offline capital reserves.`;
          tactical = `Sweep 20% of net profits offline to cold vault. Reset psychological baseline to zero.`;
        } else if (w.id === "w01") {
          primaryGoal = "Establish foundation discipline: clear 5/5 morning devotion gates with strict 0.01 lot ceiling.";
          tactical = "Focus strictly on London Open expansion. Stop trading immediately after session target hit.";
        } else if (w.id === "w02") {
          primaryGoal = "Smoothly promote position sizing to Tier 2 (0.01-0.02 lot) while respecting the 2-loss stop wall.";
          tactical = "Test Tier 2 lots on high-conviction London displacement setups. No overnight runner holds.";
        } else if (w.id === "w06" || w.id === "w07") {
          primaryGoal = "Cross the 3-figure equity threshold ($300+) without oversized revenge positions.";
          tactical = "Maintain calm composure at psychological milestone. Zero bullet stacking.";
        } else if (w.id === "w13" || w.id === "w14") {
          primaryGoal = "Quarter 2 acceleration: transition into Tier 5 sizing (0.05-0.08 lot) with zero deviations.";
          tactical = "Audit spreads and slippage during NY Open liquidity sweeps. Trail stops to breakeven.";
        } else if (w.id === "w25" || w.id === "w26") {
          primaryGoal = "Quarter 3 scale: step into institutional lot brackets while preserving maximum drawdown buffer.";
          tactical = "Strict adherence to Rule 05 50% risk demotion if any 2 consecutive losses occur.";
        }
        const defaultChecklist = [
          { id: `${w.id}_c1`, text: "Clear 1-hour Bible devotion & prayer before charts each morning", completed: w.id === "w01" },
          { id: `${w.id}_c2`, text: "Trade strictly inside London (07:00 UTC) and NY (13:30 UTC) killzones", completed: false },
          { id: `${w.id}_c3`, text: `Enforce mechanical 20-pip stop loss limit on ${w.lot}`, completed: false },
          { id: `${w.id}_c4`, text: w.isExtract ? "Complete 20% physical profit sweep to offline vault" : `Harvest target ${w.net} without exceeding risk ceiling`, completed: false }
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
          status: w.id === "w01" ? "in_progress" : "upcoming",
          checklist: defaultChecklist,
          debriefNotes: "",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      });
    });
  });
  return objectives;
};

// src/db/index.ts
if (process.env.VERCEL) {
  try {
    const bundled = path.join(process.cwd(), "cockpit.db");
    const target = "/tmp/cockpit.db";
    if (fs.existsSync(bundled) && !fs.existsSync(target)) {
      fs.copyFileSync(bundled, target);
      console.log("\u26A1 Initialized /tmp/cockpit.db from bundled SQLite database.");
    }
  } catch (err) {
    console.warn("Could not copy bundled SQLite database:", err);
  }
}
var dbPath = process.env.DATABASE_URL || (process.env.VERCEL ? "file:/tmp/cockpit.db" : "file:cockpit.db");
var client = createClient({
  url: dbPath,
  authToken: process.env.DATABASE_AUTH_TOKEN
});
var db = drizzle(client, { schema: schema_exports });
async function initDatabase() {
  try {
    if (!dbPath.startsWith("http")) {
      await client.execute("PRAGMA journal_mode = WAL;");
      await client.execute("PRAGMA synchronous = NORMAL;");
    }
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
    try {
      await client.execute("ALTER TABLE daily_sessions ADD COLUMN proto TEXT;");
    } catch {
    }
    try {
      await client.execute("ALTER TABLE daily_sessions ADD COLUMN is_loss INTEGER DEFAULT 0;");
    } catch {
    }
    try {
      await client.execute("ALTER TABLE daily_sessions ADD COLUMN date TEXT;");
    } catch {
    }
    await client.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_sessions_user_sid ON daily_sessions(user_id, session_id);
    `);
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
    const sessionCountRes = await client.execute("SELECT COUNT(*) as cnt FROM daily_sessions WHERE user_id = 'local-trader';");
    const sessionCount = Number(sessionCountRes.rows[0]?.cnt || 0);
    const sampleSessionCheck = await client.execute("SELECT planned_target FROM daily_sessions WHERE session_id = 'w01-d1' AND user_id = 'local-trader';");
    const firstTarget = sampleSessionCheck.rows[0]?.planned_target !== void 0 ? Number(sampleSessionCheck.rows[0]?.planned_target) : null;
    const needsSessionReseed = sessionCount < 252 || firstTarget !== 8;
    if (needsSessionReseed) {
      console.log(`Seeding/Calibrating 252 daily sessions for the 30K compounding roadmap... (Current: ${sessionCount}, w01-d1: ${firstTarget})`);
      for (const q of INITIAL_QUARTERS) {
        for (const m of q.months) {
          for (const w of m.weeks) {
            for (let dIdx = 0; dIdx < w.days.length; dIdx++) {
              const d = w.days[dIdx];
              const sId = `${w.id}-d${dIdx + 1}`;
              const cleanPnl = d.pnl.replace(/[^0-9.-]/g, "");
              const plannedNum = parseFloat(cleanPnl) || 25;
              await client.execute({
                sql: `INSERT OR REPLACE INTO daily_sessions 
                      (session_id, user_id, quarter_id, month_id, week_id, day_number, day_name, planned_target, status, notes, proto, is_loss) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                  sId,
                  "local-trader",
                  q.id,
                  m.id,
                  w.id,
                  dIdx + 1,
                  d.day,
                  plannedNum,
                  d.status || "pending",
                  d.notes || null,
                  d.proto || null,
                  d.isLoss ? 1 : 0
                ]
              });
            }
          }
        }
      }
      console.log("\u2705 Seeded 252 daily sessions for the 30K compounding roadmap.");
    }
    const objCountRes = await client.execute("SELECT COUNT(*) as cnt FROM weekly_objectives WHERE user_id = 'local-trader';");
    const objCount = Number(objCountRes.rows[0]?.cnt || 0);
    const sampleObjCheck = await client.execute("SELECT planned_target_pnl FROM weekly_objectives WHERE week_id = 'w01' AND user_id = 'local-trader';");
    const firstObjTarget = sampleObjCheck.rows[0]?.planned_target_pnl !== void 0 ? Number(sampleObjCheck.rows[0]?.planned_target_pnl) : null;
    const needsObjReseed = objCount < 48 || firstObjTarget !== 25;
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
            "local-trader",
            obj.quarterId,
            obj.quarterName || "",
            obj.monthNum || "",
            obj.plannedTargetPnl,
            obj.lotSize,
            obj.drillFocus || "",
            obj.primaryObjective,
            obj.tacticalNotes || "",
            obj.status,
            JSON.stringify(obj.checklist || []),
            obj.debriefNotes || ""
          ]
        });
      }
      console.log("\u2705 Seeded 48 weekly objectives.");
    }
    await client.execute({
      sql: `INSERT OR IGNORE INTO cockpit_state 
            (user_id, trader_name, devotion_gate_passed, working_equity, banked_cash, net_worth, win_rate, total_wins, total_losses, completed_sessions) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ["local-trader", "Yohannes Sharew", 1, 50, 0, 50, 100, 0, 0, 0]
    });
    await client.execute({
      sql: `INSERT OR IGNORE INTO journal_notes 
            (note_id, user_id, day_id, day_label, date, session_tag, title, content, color, outcome, rotation, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "jn_prep_1",
        "local-trader",
        "prep_day",
        "Pre-Flight Briefing",
        (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        "Pre-Launch Readiness",
        "Baseline Zero Ready: $50 Seed Tranche Grounded",
        "All 48-week targets verified against the $30K realistic compounding roadmap. Starting with untouched $50 seed capital. Strict 0.01 lot calibration and 20-pip stop on Gold XAU/USD. Rule 01 spiritual devotion foundation is locked in before opening charts on Day 1.",
        "amber",
        "devotion",
        -1.2,
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    });
    console.log("\u26A1 LibSQL / SQLite 1-Year Database initialized & fully synchronized.");
  } catch (error) {
    console.error("Failed to initialize database tables:", error);
  }
}

// server.ts
import { eq, desc } from "drizzle-orm";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3001;
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
await initDatabase();
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, contextData } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Valid messages array is required" });
    }
    const ai = new GoogleGenAI();
    const systemInstruction = `You are Tri, an extraordinarily versatile, knowledgeable, and perceptive AI assistant and Elite Pre-Launch Trading Command Officer for the Transformer19 - 100k Program. You are collaborating with the trader (Operator: ${contextData?.traderName || "Yohannes Sharew"}).

CRITICAL GROUND TRUTH \u2014 THE JOURNEY HAS NOT STARTED YET:
- THE TRADING JOURNEY HAS NOT STARTED YET.
- This entire cockpit and 48-week compounding matrix is a SIMULATED BLUEPRINT & EXECUTION PLAN of what Operator Yohannes is PREPARING TO ACHIEVE, NOT trades he already completed or past money he had!
- Current Working Capital is strictly the starting $50.00 seed tranche.
- Live Realized P&L is currently NONE ($0.00). Exactly 0 live trading days have been executed so far.
- The $30,000 working equity and $7,150 physical offline sweeps ($37,150 total value) are the SIMULATED TARGETS to achieve over 48 weeks based on the 30K realistic compounding plan.
- NEVER speak to or congratulate Yohannes as if he already completed the journey or already accumulated $30,000!
- You are his pre-launch command officer, risk strategist, and mental conditioning coach:
  \u2022 Help him prepare thoroughly for Day 1 (Week 01: London Open expansion on Gold XAU/USD, 0.01 lot ceiling, 20-pip stop).
  \u2022 Review the planned lot ladder, session routines, risk circuit breakers, and Rule 01 spiritual devotion.
  \u2022 When discussing his metrics, acknowledge that he is at the starting gate with $50 seed, preparing to execute the master simulation.

VERSATILITY & CONVERSATIONAL FREEDOM (LIKE CHATGPT & GEMINI):
- You can chat freely, naturally, and comprehensively on ANY topic the user asks about:
  \u2022 General queries, science, technology, coding (Python, PineScript, TypeScript, SQL), philosophy, daily habits, motivation, and creative writing.
  \u2022 In-depth financial markets: price action, ICT / Smart Money Concepts, Gold (XAU/USD), Forex pairs, liquidity sweeps, market structure, news analysis, Federal Reserve policy, macroeconomics.
  \u2022 Trader psychology & routine: mastering fear/greed, resetting baseline zero, discipline protocols, spiritual meditation and Bible wisdom.
  \u2022 Transformer19 Cockpit: pre-launch preparation, simulated lot progression, 20-pip stop rules, offline harvest planning.
- NEVER refuse to engage, never stonewall, and never restrict conversations to only predefined templates. Answer any question with intellectual depth, nuance, and helpful clarity.
- Format responses cleanly with markdown, bullet points, code blocks, or bold highlights when appropriate.

LIVE COCKPIT STATE (PRE-LAUNCH):
- Current Starting Seed: $${contextData?.workingEquity !== void 0 ? Number(contextData.workingEquity).toFixed(2) : "50.00"}
- Live Realized P&L to Date: None ($0.00 - Not Started Yet)
- Target to Achieve (48-Week Plan): $30,000 Retained Working Equity + $7,150 Offline Bank Sweeps ($37,150 Total Value)
- Roadmap Execution Progress: 0 / ${contextData?.totalSessions || 240} sessions executed (Pre-Launch)
- Edge Target in Simulation: 66.2% Win Rate over 252 planned sessions
- Rule 01 Devotion Gate Today: ${contextData?.devotionPassed ? "PASSED \u2713 (Mental & spiritual grounding ready)" : "PENDING (Remind gently to center before Day 1, but chat freely)"}
- Recorded Sticky Notes: ${contextData?.totalNotes || 0} pre-launch notes logged
${contextData?.recentNotes?.length ? `RECENT TRADER NOTES:
${contextData.recentNotes.map((n) => `\u2022 [${n.dayLabel || "Session"} | ${n.sessionTag || "Note"}]: "${n.title ? n.title + ": " : ""}${n.content}" (${n.outcome || "Note"}${n.pnl !== void 0 ? `, $${n.pnl}` : ""})`).join("\n")}` : ""}

TONE:
- Highly intelligent, warm, articulate, perceptive, and strategic.
- An elite trading desk partner and pre-launch strategist who treats the trader with respect, discipline, and clarity.`;
    const contents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });
    const reply = response.text || "I am with you, Operator. What shall we explore or analyze next?";
    res.json({ reply });
  } catch (error) {
    console.error("Error with Tri AI endpoint:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate response from Tri AI"
    });
  }
});
app.post("/api/rate-performance", async (req, res) => {
  try {
    const { telemetry } = req.body;
    const ai = new GoogleGenAI();
    const prompt = `You are the Master Forensic Trading Auditor for the Transformer19 - 100k Program.
Conduct a rigorous AI Performance Audit of Operator ${telemetry?.traderName || "Yohannes Sharew"} based on their weekly planned targets, actual execution results, and daily trading journal reflections.

LIVE TRADER TELEMETRY:
- Working Equity: $${telemetry?.workingEquity || 50}
- Banked Offline Cash: $${telemetry?.bankedCash || 0}
- Total Realized Net Worth: $${telemetry?.netWorth || 50}
- Progress: ${telemetry?.completedSessions || 0} completed sessions (Win Rate: ${telemetry?.winRate || "100"}%)
- Wins: ${telemetry?.wins || 0}, Losses: ${telemetry?.losses || 0}
- Spiritual Devotion Gate Today (Rule 01): ${telemetry?.devotionPassed ? "PASSED" : "PENDING / GATED"}
- Authorized Ladder Lot Size: ${telemetry?.authorizedLot || "0.01 Lot"}
- Recent Daily Sticky Notes (${telemetry?.recentNotes?.length || 0} notes):
${telemetry?.recentNotes?.length ? telemetry.recentNotes.map((n) => `- [${n.dayLabel || "Session"} | ${n.sessionTag || "Note"}]: "${n.content}" (Outcome: ${n.outcome || "N/A"}, PnL: ${n.pnl !== void 0 ? "$" + n.pnl : "Planned"})`).join("\n") : "No journal notes logged yet."}

AUDIT INSTRUCTIONS:
Evaluate the trader across EXACTLY these 6 performance areas, rating each strictly out of 10.0 (e.g. 8.5, 9.2, 7.8):
1. "ruleRespecting" (Rule Respecting): Respecting Rule 01 spiritual devotion foundation, lot ladder ceiling, 20% offline profit sweeps, zero off-plan gambles.
2. "riskManagement" (Risk Management): Strict 20-pip stops, position sizing within balance limits, protecting equity from catastrophic drawdowns.
3. "discipline" (Discipline): Zero revenge trading, emotional stability after scratches or losses, adhering to execution protocols.
4. "profitMaximizing" (Profit Maximizing): Hitting planned session profit targets, not cutting winners prematurely due to fear, executing the 20% physical harvest.
5. "patience" (Patience): Waiting for London (07:00 UTC) and NY (13:30 UTC) killzones, letting liquidity sweeps develop, avoiding choppy Asian consolidation.
6. "tradeManagement" (Trade Management): Trade entry displacement precision, moving stops to breakeven systematically, managing trade without erratic tinkering.

OUTPUT FORMAT:
Return pure, valid JSON with no markdown wrapping or code blocks:
{
  "totalPercentage": number (integer between 0 and 100, equal to round((sum of 6 scores / 60) * 100)),
  "summaryDiagnosis": "string (2-3 sentences summarizing the trader's systemic edge, emotional control, and current phase)",
  "metrics": [
    {
      "key": "ruleRespecting",
      "name": "Rule Respecting",
      "score": number (0 to 10 with 1 decimal place),
      "maxScore": 10,
      "assessment": "string (1-2 sentences explaining why this score was given based on their telemetry)",
      "evidence": "string (specific data point from their telemetry)",
      "actionableAdvice": "string (concrete tactical step to reach a 10/10)"
    },
    {
      "key": "riskManagement",
      "name": "Risk Management",
      "score": number,
      "maxScore": 10,
      "assessment": "string",
      "evidence": "string",
      "actionableAdvice": "string"
    },
    {
      "key": "discipline",
      "name": "Discipline",
      "score": number,
      "maxScore": 10,
      "assessment": "string",
      "evidence": "string",
      "actionableAdvice": "string"
    },
    {
      "key": "profitMaximizing",
      "name": "Profit Maximizing",
      "score": number,
      "maxScore": 10,
      "assessment": "string",
      "evidence": "string",
      "actionableAdvice": "string"
    },
    {
      "key": "patience",
      "name": "Patience",
      "score": number,
      "maxScore": 10,
      "assessment": "string",
      "evidence": "string",
      "actionableAdvice": "string"
    },
    {
      "key": "tradeManagement",
      "name": "Trade Management",
      "score": number,
      "maxScore": 10,
      "assessment": "string",
      "evidence": "string",
      "actionableAdvice": "string"
    }
  ]
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });
    const rawText = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }
    parsed.assessedAt = (/* @__PURE__ */ new Date()).toISOString();
    parsed.isAiGenerated = true;
    res.json(parsed);
  } catch (error) {
    console.error("Error generating AI performance rating:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate AI performance rating"
    });
  }
});
var DEFAULT_USER_ID = "local-trader";
var backupDebounceTimer = null;
var triggerDatabaseSnapshot = () => {
  if (backupDebounceTimer) clearTimeout(backupDebounceTimer);
  backupDebounceTimer = setTimeout(async () => {
    try {
      const backupsDir = path2.join(__dirname, "backups");
      if (!fs2.existsSync(backupsDir)) {
        fs2.mkdirSync(backupsDir, { recursive: true });
      }
      const allSessions = await db.select().from(dailySessions);
      const allNotes = await db.select().from(journalNotes);
      const allMental = await db.select().from(mentalStateLogs);
      const allObjectives = await db.select().from(weeklyObjectives);
      const allState = await db.select().from(cockpitState);
      const snapshot = {
        app: "Transformer19 30K Execution Cockpit & Journal",
        snapshotTime: (/* @__PURE__ */ new Date()).toISOString(),
        totalRecordedSessions: allSessions.length,
        totalJournalNotes: allNotes.length,
        totalMentalLogs: allMental.length,
        totalObjectives: allObjectives.length,
        cockpitState: allState[0] || null,
        sessions: allSessions,
        journalNotes: allNotes,
        mentalStateLogs: allMental,
        weeklyObjectives: allObjectives
      };
      const dateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      fs2.writeFileSync(path2.join(backupsDir, "cockpit_backup_latest.json"), JSON.stringify(snapshot, null, 2), "utf8");
      fs2.writeFileSync(path2.join(backupsDir, `cockpit_backup_${dateStr}.json`), JSON.stringify(snapshot, null, 2), "utf8");
      console.log(`\u{1F4BE} Auto-snapshot written to backups/cockpit_backup_${dateStr}.json (${allSessions.length} sessions, ${allNotes.length} notes).`);
    } catch (e) {
      console.warn("Auto snapshot error:", e);
    }
  }, 2e3);
};
app.get("/api/db/health", async (_req, res) => {
  const sessionCount = await db.select().from(dailySessions);
  const notesCount = await db.select().from(journalNotes);
  res.json({
    status: "online",
    engine: "LibSQL / SQLite (WAL High-Performance Mode)",
    latency: "< 0.1ms",
    databaseFile: "cockpit.db",
    readWriteMode: "Concurrent WAL non-blocking",
    totalSessionsRecorded: sessionCount.length,
    totalNotesRecorded: notesCount.length,
    coverage: "1-Year Master Compounding Execution Plan (48 Weeks / 252 Sessions)"
  });
});
app.get("/api/db/export", async (_req, res) => {
  try {
    const allSessions = await db.select().from(dailySessions);
    const allNotes = await db.select().from(journalNotes);
    const allMental = await db.select().from(mentalStateLogs);
    const allObjectives = await db.select().from(weeklyObjectives);
    const allState = await db.select().from(cockpitState);
    res.json({
      success: true,
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      app: "Transformer19 30K Execution Cockpit",
      state: allState[0] || null,
      sessions: allSessions,
      notes: allNotes,
      mentalLogs: allMental,
      objectives: allObjectives
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Export failed" });
  }
});
var handleGetCockpit = async (req, res) => {
  try {
    const userId = req.query.userId || DEFAULT_USER_ID;
    const states = await db.select().from(cockpitState).where(eq(cockpitState.userId, userId)).limit(1);
    const sessions = await db.select().from(dailySessions).where(eq(dailySessions.userId, userId));
    const notes = await db.select().from(journalNotes).where(eq(journalNotes.userId, userId)).orderBy(desc(journalNotes.id));
    const mentalLogs = await db.select().from(mentalStateLogs).where(eq(mentalStateLogs.userId, userId)).orderBy(desc(mentalStateLogs.id));
    const objectives = await db.select().from(weeklyObjectives).where(eq(weeklyObjectives.userId, userId));
    const ratings = await db.select().from(performanceRatings).where(eq(performanceRatings.userId, userId)).orderBy(desc(performanceRatings.id)).limit(1);
    res.json({
      success: true,
      state: states[0] || null,
      sessions: sessions || [],
      notes: notes || [],
      mentalLogs: mentalLogs || [],
      objectives: objectives || [],
      latestRating: ratings[0] ? {
        totalPercentage: ratings[0].totalPercentage,
        summaryDiagnosis: ratings[0].summaryDiagnosis,
        metrics: JSON.parse(ratings[0].metricsJson || "[]"),
        assessedAt: ratings[0].assessedAt
      } : null
    });
  } catch (error) {
    console.error("Database get cockpit error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch data from database" });
  }
};
app.get("/api/sqlite/cockpit", handleGetCockpit);
app.get("/api/postgres/cockpit", handleGetCockpit);
app.get("/api/db/cockpit", handleGetCockpit);
app.get("/api/cloud/sync", handleGetCockpit);
app.post("/api/cloud/sync", async (req, res) => {
  try {
    const {
      sessions = [],
      notes = [],
      deletedNoteIds = [],
      mentalLogs = [],
      deletedMentalIds = [],
      objectives = [],
      state = null,
      userId = DEFAULT_USER_ID,
      clientSource = "desktop"
    } = req.body;
    let sessionsCount = 0;
    let notesCount = 0;
    let objectivesCount = 0;
    let mentalCount = 0;
    for (const session of sessions) {
      if (!session || !session.id) continue;
      const existing = await db.select().from(dailySessions).where(eq(dailySessions.sessionId, session.id)).limit(1);
      if (existing.length > 0) {
        await db.update(dailySessions).set({
          actualResult: "actualResult" in session ? session.actualResult : existing[0].actualResult,
          deltaPercent: session.deltaPercent !== void 0 ? session.deltaPercent : existing[0].deltaPercent,
          status: session.status || existing[0].status,
          notes: "notes" in session ? session.notes : existing[0].notes,
          proto: "proto" in session ? session.proto : existing[0].proto,
          isLoss: session.isLoss !== void 0 ? Boolean(session.isLoss) : Boolean(existing[0].isLoss),
          date: session.date || existing[0].date,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq(dailySessions.sessionId, session.id));
      } else {
        await db.insert(dailySessions).values({
          sessionId: session.id,
          userId,
          quarterId: session.quarterId || "quarter-1",
          monthId: session.monthId || "q1-m1",
          weekId: session.weekId || "w01",
          dayNumber: session.dayNumber || 1,
          dayName: session.dayName || "Day 01",
          date: session.date || null,
          plannedTarget: session.plannedTarget || 25,
          actualResult: session.actualResult !== void 0 ? session.actualResult : null,
          deltaPercent: session.deltaPercent || 0,
          status: session.status || "pending",
          notes: session.notes || null,
          proto: session.proto || null,
          isLoss: Boolean(session.isLoss)
        });
      }
      sessionsCount++;
    }
    for (const note of notes) {
      if (!note || !note.id) continue;
      const existing = await db.select().from(journalNotes).where(eq(journalNotes.noteId, note.id)).limit(1);
      if (existing.length > 0) {
        await db.update(journalNotes).set({
          title: note.title !== void 0 ? note.title : existing[0].title,
          content: note.content !== void 0 ? note.content : existing[0].content,
          color: note.color || existing[0].color,
          outcome: note.outcome || existing[0].outcome,
          pnl: note.pnl !== void 0 ? note.pnl : existing[0].pnl,
          rotation: note.rotation !== void 0 ? note.rotation : existing[0].rotation,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq(journalNotes.noteId, note.id));
      } else {
        await db.insert(journalNotes).values({
          noteId: note.id,
          userId,
          dayId: note.dayId || "day-1",
          dayLabel: note.dayLabel || "Session 1",
          date: note.date || null,
          sessionTag: note.sessionTag || null,
          title: note.title || null,
          content: note.content,
          color: note.color || "yellow",
          outcome: note.outcome || null,
          pnl: note.pnl !== void 0 ? note.pnl : null,
          rotation: note.rotation || 0,
          createdAt: note.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      notesCount++;
    }
    for (const noteId of deletedNoteIds) {
      if (noteId) {
        await db.delete(journalNotes).where(eq(journalNotes.noteId, noteId));
      }
    }
    for (const log of mentalLogs) {
      if (!log || !log.id) continue;
      const existing = await db.select().from(mentalStateLogs).where(eq(mentalStateLogs.logId, log.id)).limit(1);
      if (existing.length > 0) {
        await db.update(mentalStateLogs).set({
          rating: log.rating || existing[0].rating,
          stateKey: log.stateKey || existing[0].stateKey,
          emoji: log.emoji || existing[0].emoji,
          label: log.label || existing[0].label,
          tagsJson: log.tags ? JSON.stringify(log.tags) : existing[0].tagsJson,
          notes: log.notes !== void 0 ? log.notes : existing[0].notes
        }).where(eq(mentalStateLogs.logId, log.id));
      } else {
        await db.insert(mentalStateLogs).values({
          logId: log.id,
          userId,
          dayId: log.dayId || "day-1",
          sessionTag: log.sessionTag || "General",
          date: log.date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
          stateKey: log.stateKey || "flow",
          emoji: log.emoji || "\u{1F3AF}",
          label: log.label || "Flow",
          rating: log.rating || 5,
          tagsJson: log.tags ? JSON.stringify(log.tags) : "[]",
          notes: log.notes || null,
          loggedAt: log.loggedAt || (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      mentalCount++;
    }
    for (const logId of deletedMentalIds) {
      if (logId) {
        await db.delete(mentalStateLogs).where(eq(mentalStateLogs.logId, logId));
      }
    }
    for (const obj of objectives) {
      if (!obj || !obj.weekId) continue;
      const existing = await db.select().from(weeklyObjectives).where(eq(weeklyObjectives.weekId, obj.weekId)).limit(1);
      if (existing.length > 0) {
        await db.update(weeklyObjectives).set({
          status: obj.status || existing[0].status,
          primaryObjective: obj.primaryObjective || existing[0].primaryObjective,
          tacticalNotes: obj.tacticalNotes !== void 0 ? obj.tacticalNotes : existing[0].tacticalNotes,
          checklistJson: obj.checklist ? JSON.stringify(obj.checklist) : obj.checklistJson || existing[0].checklistJson,
          debriefNotes: obj.debriefNotes !== void 0 ? obj.debriefNotes : existing[0].debriefNotes,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq(weeklyObjectives.weekId, obj.weekId));
      } else {
        await db.insert(weeklyObjectives).values({
          weekId: obj.weekId,
          userId,
          quarterId: obj.quarterId || "quarter-1",
          quarterName: obj.quarterName || "",
          monthNum: obj.monthNum || "",
          plannedTargetPnl: obj.plannedTargetPnl || 40,
          lotSize: obj.lotSize || "0.01 lot",
          drillFocus: obj.drillFocus || "",
          primaryObjective: obj.primaryObjective || "",
          tacticalNotes: obj.tacticalNotes || "",
          status: obj.status || "upcoming",
          checklistJson: obj.checklist ? JSON.stringify(obj.checklist) : obj.checklistJson || "[]",
          debriefNotes: obj.debriefNotes || ""
        });
      }
      objectivesCount++;
    }
    if (state) {
      const existing = await db.select().from(cockpitState).where(eq(cockpitState.userId, userId)).limit(1);
      if (existing.length > 0) {
        await db.update(cockpitState).set({
          traderName: state.traderName || existing[0].traderName,
          devotionGatePassedToday: state.devotionGatePassedToday !== void 0 ? state.devotionGatePassedToday : existing[0].devotionGatePassedToday,
          workingEquity: state.workingEquity !== void 0 ? state.workingEquity : existing[0].workingEquity,
          bankedCash: state.bankedCash !== void 0 ? state.bankedCash : existing[0].bankedCash,
          netWorth: state.netWorth !== void 0 ? state.netWorth : existing[0].netWorth,
          winRate: state.winRate !== void 0 ? state.winRate : existing[0].winRate,
          totalWins: state.totalWins !== void 0 ? state.totalWins : existing[0].totalWins,
          totalLosses: state.totalLosses !== void 0 ? state.totalLosses : existing[0].totalLosses,
          completedSessions: state.completedSessions !== void 0 ? state.completedSessions : existing[0].completedSessions,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq(cockpitState.userId, userId));
      }
    }
    triggerDatabaseSnapshot();
    res.json({
      success: true,
      message: "Cloud sync complete",
      syncedAt: (/* @__PURE__ */ new Date()).toISOString(),
      counts: {
        sessions: sessionsCount,
        notes: notesCount,
        objectives: objectivesCount,
        mentalLogs: mentalCount
      }
    });
  } catch (error) {
    console.error("Cloud sync error:", error);
    res.status(500).json({ error: error.message || "Failed to sync with cloud database" });
  }
});
var handlePostSession = async (req, res) => {
  try {
    const { session, userId = DEFAULT_USER_ID } = req.body;
    if (!session || !session.id) {
      return res.status(400).json({ error: "Valid session object required" });
    }
    const existing = await db.select().from(dailySessions).where(eq(dailySessions.sessionId, session.id)).limit(1);
    if (existing.length > 0) {
      await db.update(dailySessions).set({
        dayName: "dayName" in session ? session.dayName : existing[0].dayName,
        date: "date" in session ? session.date : existing[0].date,
        actualResult: "actualResult" in session ? session.actualResult : existing[0].actualResult,
        deltaPercent: session.deltaPercent !== void 0 ? session.deltaPercent : existing[0].deltaPercent,
        status: session.status || existing[0].status,
        notes: "notes" in session ? session.notes : existing[0].notes,
        proto: "proto" in session ? session.proto : existing[0].proto,
        isLoss: session.isLoss !== void 0 ? Boolean(session.isLoss) : Boolean(existing[0].isLoss),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq(dailySessions.sessionId, session.id));
    } else {
      await db.insert(dailySessions).values({
        sessionId: session.id,
        userId,
        quarterId: session.quarterId || "quarter-1",
        monthId: session.monthId || "q1-m1",
        weekId: session.weekId || "w01",
        dayNumber: session.dayNumber || 1,
        dayName: session.dayName || "Day 01",
        date: session.date || null,
        plannedTarget: session.plannedTarget || 25,
        actualResult: session.actualResult !== void 0 ? session.actualResult : null,
        deltaPercent: session.deltaPercent || 0,
        status: session.status || "pending",
        notes: session.notes || null,
        proto: session.proto || null,
        isLoss: Boolean(session.isLoss)
      });
    }
    triggerDatabaseSnapshot();
    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Session upsert error:", error);
    res.status(500).json({ error: error.message || "Failed to save session in database" });
  }
};
app.post("/api/sqlite/session", handlePostSession);
app.post("/api/postgres/session", handlePostSession);
var handlePostJournal = async (req, res) => {
  try {
    const { note, userId = DEFAULT_USER_ID } = req.body;
    if (!note || !note.id) {
      return res.status(400).json({ error: "Valid note object required" });
    }
    const existing = await db.select().from(journalNotes).where(eq(journalNotes.noteId, note.id)).limit(1);
    if (existing.length > 0) {
      await db.update(journalNotes).set({
        title: note.title !== void 0 ? note.title : existing[0].title,
        content: note.content !== void 0 ? note.content : existing[0].content,
        color: note.color || existing[0].color,
        outcome: note.outcome || existing[0].outcome,
        pnl: note.pnl !== void 0 ? note.pnl : existing[0].pnl,
        rotation: note.rotation !== void 0 ? note.rotation : existing[0].rotation,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq(journalNotes.noteId, note.id));
    } else {
      await db.insert(journalNotes).values({
        noteId: note.id,
        userId,
        dayId: note.dayId || "day-1",
        dayLabel: note.dayLabel || "Session 1",
        date: note.date || null,
        sessionTag: note.sessionTag || null,
        title: note.title || null,
        content: note.content,
        color: note.color || "yellow",
        outcome: note.outcome || null,
        pnl: note.pnl !== void 0 ? note.pnl : null,
        rotation: note.rotation || 0,
        createdAt: note.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    triggerDatabaseSnapshot();
    res.json({ success: true, noteId: note.id });
  } catch (error) {
    console.error("Journal upsert error:", error);
    res.status(500).json({ error: error.message || "Failed to save note in database" });
  }
};
app.post("/api/sqlite/journal", handlePostJournal);
app.post("/api/postgres/journal", handlePostJournal);
var handleDeleteJournal = async (req, res) => {
  try {
    const noteId = req.params.id;
    await db.delete(journalNotes).where(eq(journalNotes.noteId, noteId));
    triggerDatabaseSnapshot();
    res.json({ success: true, deleted: noteId });
  } catch (error) {
    console.error("Delete journal error:", error);
    res.status(500).json({ error: error.message || "Failed to delete note from database" });
  }
};
app.delete("/api/sqlite/journal/:id", handleDeleteJournal);
app.delete("/api/postgres/journal/:id", handleDeleteJournal);
var handlePostState = async (req, res) => {
  try {
    const { state, userId = DEFAULT_USER_ID } = req.body;
    const existing = await db.select().from(cockpitState).where(eq(cockpitState.userId, userId)).limit(1);
    if (existing.length > 0) {
      await db.update(cockpitState).set({
        traderName: state.traderName || existing[0].traderName,
        devotionGatePassedToday: state.devotionGatePassedToday !== void 0 ? state.devotionGatePassedToday : existing[0].devotionGatePassedToday,
        workingEquity: state.workingEquity !== void 0 ? state.workingEquity : existing[0].workingEquity,
        bankedCash: state.bankedCash !== void 0 ? state.bankedCash : existing[0].bankedCash,
        netWorth: state.netWorth !== void 0 ? state.netWorth : existing[0].netWorth,
        winRate: state.winRate !== void 0 ? state.winRate : existing[0].winRate,
        totalWins: state.totalWins !== void 0 ? state.totalWins : existing[0].totalWins,
        totalLosses: state.totalLosses !== void 0 ? state.totalLosses : existing[0].totalLosses,
        completedSessions: state.completedSessions !== void 0 ? state.completedSessions : existing[0].completedSessions,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq(cockpitState.userId, userId));
    } else {
      await db.insert(cockpitState).values({
        userId,
        traderName: state.traderName || "Yohannes Sharew",
        devotionGatePassedToday: state.devotionGatePassedToday || false,
        workingEquity: state.workingEquity || 50,
        bankedCash: state.bankedCash || 0,
        netWorth: state.netWorth || 50,
        winRate: state.winRate || 100,
        totalWins: state.totalWins || 0,
        totalLosses: state.totalLosses || 0,
        completedSessions: state.completedSessions || 0
      });
    }
    triggerDatabaseSnapshot();
    res.json({ success: true });
  } catch (error) {
    console.error("Update state error:", error);
    res.status(500).json({ error: error.message || "Failed to update state in database" });
  }
};
app.post("/api/sqlite/state", handlePostState);
app.post("/api/postgres/state", handlePostState);
var handlePostMental = async (req, res) => {
  try {
    const { log, userId = DEFAULT_USER_ID } = req.body;
    if (!log || !log.id) {
      return res.status(400).json({ error: "Valid mental log object required" });
    }
    const existing = await db.select().from(mentalStateLogs).where(eq(mentalStateLogs.logId, log.id)).limit(1);
    if (existing.length > 0) {
      await db.update(mentalStateLogs).set({
        dayId: log.dayId || existing[0].dayId,
        sessionTag: log.sessionTag || existing[0].sessionTag,
        date: log.date || existing[0].date,
        stateKey: log.stateKey || existing[0].stateKey,
        emoji: log.emoji || existing[0].emoji,
        label: log.label || existing[0].label,
        rating: log.rating !== void 0 ? log.rating : existing[0].rating,
        tagsJson: JSON.stringify(log.tags || []),
        notes: log.notes !== void 0 ? log.notes : existing[0].notes,
        loggedAt: log.loggedAt || existing[0].loggedAt
      }).where(eq(mentalStateLogs.logId, log.id));
    } else {
      await db.insert(mentalStateLogs).values({
        logId: log.id,
        userId,
        dayId: log.dayId,
        sessionTag: log.sessionTag,
        date: log.date,
        stateKey: log.stateKey,
        emoji: log.emoji,
        label: log.label,
        rating: log.rating,
        tagsJson: JSON.stringify(log.tags || []),
        notes: log.notes || null,
        loggedAt: log.loggedAt
      });
    }
    triggerDatabaseSnapshot();
    res.json({ success: true, logId: log.id });
  } catch (error) {
    console.error("Mental log upsert error:", error);
    res.status(500).json({ error: error.message || "Failed to save mental log in database" });
  }
};
app.post("/api/sqlite/mental", handlePostMental);
app.post("/api/postgres/mental", handlePostMental);
var handleDeleteMental = async (req, res) => {
  try {
    const logId = req.params.id;
    await db.delete(mentalStateLogs).where(eq(mentalStateLogs.logId, logId));
    triggerDatabaseSnapshot();
    res.json({ success: true, deleted: logId });
  } catch (error) {
    console.error("Delete mental log error:", error);
    res.status(500).json({ error: error.message || "Failed to delete mental log from database" });
  }
};
app.delete("/api/sqlite/mental/:id", handleDeleteMental);
app.delete("/api/postgres/mental/:id", handleDeleteMental);
var handlePostObjective = async (req, res) => {
  try {
    const { objective, userId = DEFAULT_USER_ID } = req.body;
    if (!objective || !objective.weekId) {
      return res.status(400).json({ error: "Valid objective object with weekId required" });
    }
    const existing = await db.select().from(weeklyObjectives).where(eq(weeklyObjectives.weekId, objective.weekId)).limit(1);
    if (existing.length > 0) {
      await db.update(weeklyObjectives).set({
        status: objective.status || existing[0].status,
        primaryObjective: objective.primaryObjective || existing[0].primaryObjective,
        tacticalNotes: objective.tacticalNotes !== void 0 ? objective.tacticalNotes : existing[0].tacticalNotes,
        checklistJson: objective.checklist ? JSON.stringify(objective.checklist) : objective.checklistJson || existing[0].checklistJson,
        debriefNotes: objective.debriefNotes !== void 0 ? objective.debriefNotes : existing[0].debriefNotes,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq(weeklyObjectives.weekId, objective.weekId));
    } else {
      await db.insert(weeklyObjectives).values({
        weekId: objective.weekId,
        userId,
        quarterId: objective.quarterId || "quarter-1",
        quarterName: objective.quarterName || "",
        monthNum: objective.monthNum || "",
        plannedTargetPnl: objective.plannedTargetPnl || 40,
        lotSize: objective.lotSize || "0.01 lot",
        drillFocus: objective.drillFocus || "",
        primaryObjective: objective.primaryObjective || "",
        tacticalNotes: objective.tacticalNotes || "",
        status: objective.status || "upcoming",
        checklistJson: objective.checklist ? JSON.stringify(objective.checklist) : objective.checklistJson || "[]",
        debriefNotes: objective.debriefNotes || ""
      });
    }
    triggerDatabaseSnapshot();
    res.json({ success: true, weekId: objective.weekId });
  } catch (error) {
    console.error("Objective upsert error:", error);
    res.status(500).json({ error: error.message || "Failed to save objective in database" });
  }
};
app.post("/api/sqlite/objective", handlePostObjective);
app.post("/api/postgres/objective", handlePostObjective);
var handlePostReset = async (req, res) => {
  try {
    const { userId = DEFAULT_USER_ID } = req.body;
    await db.delete(dailySessions).where(eq(dailySessions.userId, userId));
    await db.delete(journalNotes).where(eq(journalNotes.userId, userId));
    await db.delete(mentalStateLogs).where(eq(mentalStateLogs.userId, userId));
    await db.delete(cockpitState).where(eq(cockpitState.userId, userId));
    await db.delete(weeklyObjectives).where(eq(weeklyObjectives.userId, userId));
    for (const q of INITIAL_QUARTERS) {
      for (const m of q.months) {
        for (const w of m.weeks) {
          for (let dIdx = 0; dIdx < w.days.length; dIdx++) {
            const d = w.days[dIdx];
            const sId = `${w.id}-d${dIdx + 1}`;
            const cleanPnl = d.pnl.replace(/[^0-9.-]/g, "");
            const plannedNum = parseFloat(cleanPnl) || 25;
            await db.insert(dailySessions).values({
              sessionId: sId,
              userId,
              quarterId: q.id,
              monthId: m.id,
              weekId: w.id,
              dayNumber: dIdx + 1,
              dayName: d.day,
              plannedTarget: plannedNum,
              actualResult: null,
              deltaPercent: 0,
              status: "pending",
              notes: null,
              proto: d.proto || null,
              isLoss: Boolean(d.isLoss)
            });
          }
        }
      }
    }
    const defaultObjectives = generateDefaultWeeklyObjectives(INITIAL_QUARTERS);
    for (const obj of defaultObjectives) {
      await db.insert(weeklyObjectives).values({
        weekId: obj.weekId,
        userId,
        quarterId: obj.quarterId,
        quarterName: obj.quarterName || "",
        monthNum: obj.monthNum || "",
        plannedTargetPnl: obj.plannedTargetPnl,
        lotSize: obj.lotSize,
        drillFocus: obj.drillFocus || "",
        primaryObjective: obj.primaryObjective,
        tacticalNotes: obj.tacticalNotes || "",
        status: obj.status,
        checklistJson: JSON.stringify(obj.checklist || []),
        debriefNotes: ""
      });
    }
    await db.insert(cockpitState).values({
      userId,
      traderName: "Yohannes Sharew",
      devotionGatePassedToday: true,
      workingEquity: 50,
      bankedCash: 0,
      netWorth: 50,
      winRate: 100,
      totalWins: 0,
      totalLosses: 0,
      completedSessions: 0
    });
    triggerDatabaseSnapshot();
    res.json({ success: true, message: "All cockpit data reset and pristine 1-year roadmap re-seeded" });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ error: error.message || "Failed to reset database" });
  }
};
app.post("/api/sqlite/reset", handlePostReset);
app.post("/api/postgres/reset", handlePostReset);
var handleImportPlan = async (req, res) => {
  try {
    const {
      quarters = [],
      objectives = [],
      seedCapital = 50,
      targetBanked = 7150,
      targetRetained = 3e4,
      targetTotal = 37150,
      userId = DEFAULT_USER_ID
    } = req.body;
    if (!Array.isArray(quarters) || quarters.length === 0) {
      return res.status(400).json({ error: "Quarters array is required" });
    }
    await db.delete(dailySessions).where(eq(dailySessions.userId, userId));
    await db.delete(weeklyObjectives).where(eq(weeklyObjectives.userId, userId));
    let sessionsCount = 0;
    for (const q of quarters) {
      for (const m of q.months) {
        for (const w of m.weeks) {
          for (let dIdx = 0; dIdx < w.days.length; dIdx++) {
            const d = w.days[dIdx];
            const sId = `${w.id}-d${dIdx + 1}`;
            const cleanPnl = String(d.pnl || "0").replace(/[^0-9.-]/g, "");
            const plannedNum = parseFloat(cleanPnl) || 25;
            await db.insert(dailySessions).values({
              sessionId: sId,
              userId,
              quarterId: q.id,
              monthId: m.id,
              weekId: w.id,
              dayNumber: dIdx + 1,
              dayName: d.day,
              plannedTarget: plannedNum,
              actualResult: d.actualPnl !== void 0 ? d.actualPnl : null,
              deltaPercent: 0,
              status: d.status || "pending",
              notes: d.notes || null,
              proto: d.proto || null,
              isLoss: Boolean(d.isLoss)
            });
            sessionsCount++;
          }
        }
      }
    }
    let objectivesCount = 0;
    for (const obj of objectives) {
      await db.insert(weeklyObjectives).values({
        weekId: obj.weekId,
        userId,
        quarterId: obj.quarterId || "quarter-1",
        quarterName: obj.quarterName || "",
        monthNum: obj.monthNum || "",
        plannedTargetPnl: obj.plannedTargetPnl || 100,
        lotSize: obj.lotSize || "0.01 lot",
        drillFocus: obj.drillFocus || "",
        primaryObjective: obj.primaryObjective || "",
        tacticalNotes: obj.tacticalNotes || "",
        status: obj.status || "upcoming",
        checklistJson: JSON.stringify(obj.checklist || []),
        debriefNotes: obj.debriefNotes || ""
      });
      objectivesCount++;
    }
    const existingState = await db.select().from(cockpitState).where(eq(cockpitState.userId, userId)).limit(1);
    if (existingState.length > 0) {
      await db.update(cockpitState).set({
        workingEquity: seedCapital,
        bankedCash: 0,
        netWorth: seedCapital,
        completedSessions: 0,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq(cockpitState.userId, userId));
    } else {
      await db.insert(cockpitState).values({
        userId,
        traderName: "Yohannes Sharew",
        devotionGatePassedToday: true,
        workingEquity: seedCapital,
        bankedCash: 0,
        netWorth: seedCapital,
        winRate: 100,
        totalWins: 0,
        totalLosses: 0,
        completedSessions: 0
      });
    }
    triggerDatabaseSnapshot();
    res.json({
      success: true,
      message: `Successfully adapted master plan: ${sessionsCount} sessions and ${objectivesCount} objectives saved in SQLite database`,
      sessionsCount,
      objectivesCount,
      seedCapital,
      targetBanked,
      targetRetained,
      targetTotal
    });
  } catch (error) {
    console.error("Plan import error:", error);
    res.status(500).json({ error: error.message || "Failed to import plan" });
  }
};
app.post("/api/plan/import", handleImportPlan);
app.post("/api/sqlite/plan/import", handleImportPlan);
var inMemoryWebhookEvents = [];
var handleBrokerWebhook = async (req, res) => {
  const startTime = Date.now();
  try {
    const payload = req.body || {};
    const ticket = String(payload.ticket || `TICK_${Date.now()}`);
    const symbol = String(payload.symbol || "XAUUSD").toUpperCase();
    const type = String(payload.type || "buy").toLowerCase() === "sell" ? "sell" : "buy";
    const volume = Number(payload.volume) || 0.01;
    const netProfit = typeof payload.netProfit === "number" ? payload.netProfit : parseFloat(String(payload.netProfit || "0")) || 0;
    const openPrice = Number(payload.openPrice) || 2650;
    const closePrice = Number(payload.closePrice) || (type === "buy" ? openPrice + 5 : openPrice - 5);
    const source = payload.source || "tradingview";
    const closeTime = payload.closeTime || (/* @__PURE__ */ new Date()).toISOString();
    const latencyMs = Date.now() - startTime;
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
      ticket,
      symbol,
      type,
      volume,
      openPrice,
      closePrice,
      netProfit,
      commission: Number(payload.commission) || 0,
      swap: Number(payload.swap) || 0,
      source,
      status: "processed",
      latencyMs
    };
    inMemoryWebhookEvents.unshift(event);
    if (inMemoryWebhookEvents.length > 50) {
      inMemoryWebhookEvents.pop();
    }
    try {
      await db.insert(journalNotes).values({
        noteId: `note_webhook_${ticket}_${Date.now()}`,
        userId: DEFAULT_USER_ID,
        dayId: "auto-webhook",
        dayLabel: `Live ${source.toUpperCase()} Fill #${ticket}`,
        date: closeTime.split("T")[0],
        sessionTag: symbol,
        title: `${type.toUpperCase()} ${volume} lot ${symbol} \xB7 ${netProfit >= 0 ? "+$" : "-$"}${Math.abs(netProfit).toFixed(2)}`,
        content: `Automated Broker Telemetry Fill via ${source}. Open: ${openPrice}, Close: ${closePrice}, Net: $${netProfit.toFixed(2)}. ${payload.notes || ""}`,
        color: netProfit >= 0 ? "emerald" : "rose",
        outcome: netProfit > 0 ? "win" : netProfit < 0 ? "loss" : "scratch",
        pnl: netProfit,
        rotation: 0
      });
    } catch {
    }
    res.json({
      success: true,
      message: "Broker webhook processed successfully",
      event,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Broker webhook error:", error);
    res.status(500).json({ error: error.message || "Failed to process webhook" });
  }
};
app.post("/api/webhooks/broker", handleBrokerWebhook);
app.get("/api/webhooks/events", (_req, res) => {
  res.json({ success: true, events: inMemoryWebhookEvents });
});
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  app.use(express.static(path2.join(__dirname, "dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path2.join(__dirname, "dist", "index.html"));
  });
} else {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
}
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tri Command Server running on port ${PORT}`);
  });
}
var server_default = app;

// api/entry.ts
var entry_default = server_default;
export {
  entry_default as default
};
