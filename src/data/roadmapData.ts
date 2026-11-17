import type { TradingQuarter, DisciplineRule, AuditItem } from '../types/index.ts';

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

export const INITIAL_QUARTERS: TradingQuarter[] = [
  {
    "id": "quarter-1",
    "name": "Q1: Foundation",
    "subtitle": "Months 01–03 // Micro-scale calibration from $50 to $800 ($190 Banked)",
    "months": [
      {
        "id": "q1-m1",
        "monthNum": "M01",
        "name": "Micro Boot-Up (Tiers 1 → 2)",
        "opening": "$50.00",
        "bankOut": "-$30.00",
        "endTarget": "$170.00",
        "weeks": [
          {
            "id": "w01",
            "num": "Week 01 (Days 1–5)",
            "lot": "0.01 lot",
            "net": "+$25.00",
            "bal": "$50.00 → $75.00",
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
            "num": "Week 02 (Days 6–10)",
            "lot": "0.01 lot",
            "net": "+$35.00",
            "bal": "$75.00 → $110.00",
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
            "num": "Week 03 (Days 11–15)",
            "lot": "0.02 lot",
            "net": "+$40.00",
            "bal": "$110.00 → $150.00",
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
            "num": "Week 04 (Days 16–21)",
            "lot": "0.02 lot",
            "net": "+$50 (-$30 Sweep)",
            "bal": "$150.00 → $170.00",
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
            "num": "Week 05 (Days 22–26)",
            "lot": "0.02 lot",
            "net": "+$50.00",
            "bal": "$170.00 → $220.00",
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
            "num": "Week 06 (Days 27–31)",
            "lot": "0.03 lot",
            "net": "+$65.00",
            "bal": "$220.00 → $285.00",
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
            "num": "Week 07 (Days 32–36)",
            "lot": "0.03 lot",
            "net": "+$75.00",
            "bal": "$285.00 → $360.00",
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
            "num": "Week 08 (Days 37–42)",
            "lot": "0.04 lot",
            "net": "+$90 (-$60 Sweep)",
            "bal": "$360.00 → $390.00",
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
            "num": "Week 09 (Days 43–47)",
            "lot": "0.04 lot",
            "net": "+$100.00",
            "bal": "$390.00 → $490.00",
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
            "num": "Week 10 (Days 48–52)",
            "lot": "0.05 lot",
            "net": "+$120.00",
            "bal": "$490.00 → $610.00",
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
            "num": "Week 11 (Days 53–57)",
            "lot": "0.06 lot",
            "net": "+$140.00",
            "bal": "$610.00 → $750.00",
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
            "num": "Week 12 (Days 58–63)",
            "lot": "0.07 lot",
            "net": "+$150 (-$100 Sweep)",
            "bal": "$750.00 → $800.00",
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
    "subtitle": "Months 04–06 // Scaling from $800 to $4,090 ($820 Banked)",
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
            "num": "Week 13 (Days 64–68)",
            "lot": "0.08 lot",
            "net": "+$160.00",
            "bal": "$800.00 → $960.00",
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
            "num": "Week 14 (Days 69–73)",
            "lot": "0.09 lot",
            "net": "+$180.00",
            "bal": "$960.00 → $1,140.00",
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
            "num": "Week 15 (Days 74–78)",
            "lot": "0.10 lot",
            "net": "+$220.00",
            "bal": "$1,140.00 → $1,360.00",
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
            "num": "Week 16 (Days 79–84)",
            "lot": "0.12 lot",
            "net": "+$240 (-$160 Sweep)",
            "bal": "$1,360.00 → $1,440.00",
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
            "num": "Week 17 (Days 85–89)",
            "lot": "0.12 lot",
            "net": "+$260.00",
            "bal": "$1,440.00 → $1,700.00",
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
            "num": "Week 18 (Days 90–94)",
            "lot": "0.15 lot",
            "net": "+$300.00",
            "bal": "$1,700.00 → $2,000.00",
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
            "num": "Week 19 (Days 95–99)",
            "lot": "0.16 lot",
            "net": "+$340.00",
            "bal": "$2,000.00 → $2,340.00",
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
            "num": "Week 20 (Days 100–105)",
            "lot": "0.18 lot",
            "net": "+$360 (-$250 Sweep)",
            "bal": "$2,340.00 → $2,450.00",
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
            "num": "Week 21 (Days 106–110)",
            "lot": "0.20 lot",
            "net": "+$420.00",
            "bal": "$2,450.00 → $2,870.00",
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
            "num": "Week 22 (Days 111–115)",
            "lot": "0.22 lot",
            "net": "+$480.00",
            "bal": "$2,870.00 → $3,350.00",
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
            "num": "Week 23 (Days 116–120)",
            "lot": "0.25 lot",
            "net": "+$550.00",
            "bal": "$3,350.00 → $3,900.00",
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
            "num": "Week 24 (Days 121–126)",
            "lot": "0.28 lot",
            "net": "+$600 (-$410 Sweep)",
            "bal": "$3,900.00 → $4,090.00",
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
    "subtitle": "Months 07–09 // Expansion from $4,090 to $13,940 ($2,450 Banked)",
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
            "num": "Week 25 (Days 127–131)",
            "lot": "0.30 lot",
            "net": "+$640.00",
            "bal": "$4,090.00 → $4,730.00",
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
            "num": "Week 26 (Days 132–136)",
            "lot": "0.35 lot",
            "net": "+$720.00",
            "bal": "$4,730.00 → $5,450.00",
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
            "num": "Week 27 (Days 137–141)",
            "lot": "0.38 lot",
            "net": "+$750.00",
            "bal": "$5,450.00 → $6,200.00",
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
            "num": "Week 28 (Days 142–147)",
            "lot": "0.40 lot",
            "net": "+$800 (-$580 Sweep)",
            "bal": "$6,200.00 → $6,420.00",
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
            "num": "Week 29 (Days 148–152)",
            "lot": "0.45 lot",
            "net": "+$900.00",
            "bal": "$6,420.00 → $7,320.00",
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
            "num": "Week 30 (Days 153–157)",
            "lot": "0.50 lot",
            "net": "+$1,000.00",
            "bal": "$7,320.00 → $8,320.00",
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
            "num": "Week 31 (Days 158–162)",
            "lot": "0.55 lot",
            "net": "+$1,080.00",
            "bal": "$8,320.00 → $9,400.00",
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
            "num": "Week 32 (Days 163–168)",
            "lot": "0.60 lot",
            "net": "+$1,100 (-$810 Sweep)",
            "bal": "$9,400.00 → $9,690.00",
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
            "num": "Week 33 (Days 169–173)",
            "lot": "0.65 lot",
            "net": "+$1,250.00",
            "bal": "$9,690.00 → $10,940.00",
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
            "num": "Week 34 (Days 174–178)",
            "lot": "0.70 lot",
            "net": "+$1,350.00",
            "bal": "$10,940.00 → $12,290.00",
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
            "num": "Week 35 (Days 179–183)",
            "lot": "0.75 lot",
            "net": "+$1,350.00",
            "bal": "$12,290.00 → $13,640.00",
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
            "num": "Week 36 (Days 184–189)",
            "lot": "0.80 lot",
            "net": "+$1,360 (-$1,060 Sweep)",
            "bal": "$13,640.00 → $13,940.00",
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
    "subtitle": "Months 10–12 // Peak terminal compounding to $30,000 ($3,690 Banked)",
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
            "num": "Week 37 (Days 190–194)",
            "lot": "0.80 lot",
            "net": "+$1,350.00",
            "bal": "$13,940.00 → $15,290.00",
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
            "num": "Week 38 (Days 195–199)",
            "lot": "0.85 lot",
            "net": "+$1,370.00",
            "bal": "$15,290.00 → $16,660.00",
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
            "num": "Week 39 (Days 200–204)",
            "lot": "0.90 lot",
            "net": "+$1,420.00",
            "bal": "$16,660.00 → $18,080.00",
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
            "num": "Week 40 (Days 205–210)",
            "lot": "1.00 lot",
            "net": "+$1,420 (-$1,110 Sweep)",
            "bal": "$18,080.00 → $18,390.00",
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
            "num": "Week 41 (Days 211–215)",
            "lot": "1.00 lot",
            "net": "+$1,600.00",
            "bal": "$18,390.00 → $19,990.00",
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
            "num": "Week 42 (Days 216–220)",
            "lot": "1.10 lot",
            "net": "+$1,650.00",
            "bal": "$19,990.00 → $21,640.00",
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
            "num": "Week 43 (Days 221–225)",
            "lot": "1.20 lot",
            "net": "+$1,660.00",
            "bal": "$21,640.00 → $23,300.00",
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
            "num": "Week 44 (Days 226–231)",
            "lot": "1.25 lot",
            "net": "+$1,700 (-$1,320 Sweep)",
            "bal": "$23,300.00 → $23,680.00",
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
            "num": "Week 45 (Days 232–236)",
            "lot": "1.30 lot",
            "net": "+$1,800.00",
            "bal": "$23,680.00 → $25,480.00",
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
            "num": "Week 46 (Days 237–241)",
            "lot": "1.40 lot",
            "net": "+$1,880.00",
            "bal": "$25,480.00 → $27,360.00",
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
            "num": "Week 47 (Days 242–246)",
            "lot": "1.50 lot",
            "net": "+$2,640.00",
            "bal": "$27,360.00 → $30,000.00",
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
            "num": "Week 48 (Days 247–252)",
            "lot": "1.50 CAP",
            "net": "-$1,260 Sweep",
            "bal": "$30,000.00 → $30,000.00",
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

export const PLANNED_GROWTH_CURVE: GrowthCurvePoint[] = [
  {
    "week": 1,
    "label": "W01",
    "lotNum": 0.01,
    "lotStr": "0.01",
    "equity": 75,
    "banked": 0,
    "total": 75,
    "weeklyGain": 25,
    "sweep": 0
  },
  {
    "week": 2,
    "label": "W02",
    "lotNum": 0.01,
    "lotStr": "0.01",
    "equity": 110,
    "banked": 0,
    "total": 110,
    "weeklyGain": 35,
    "sweep": 0
  },
  {
    "week": 3,
    "label": "W03",
    "lotNum": 0.02,
    "lotStr": "0.02",
    "equity": 150,
    "banked": 0,
    "total": 150,
    "weeklyGain": 40,
    "sweep": 0
  },
  {
    "week": 4,
    "label": "W04",
    "lotNum": 0.02,
    "lotStr": "0.02",
    "equity": 170,
    "banked": 30,
    "total": 200,
    "weeklyGain": 50,
    "sweep": 30
  },
  {
    "week": 5,
    "label": "W05",
    "lotNum": 0.02,
    "lotStr": "0.02",
    "equity": 220,
    "banked": 30,
    "total": 250,
    "weeklyGain": 50,
    "sweep": 0
  },
  {
    "week": 6,
    "label": "W06",
    "lotNum": 0.03,
    "lotStr": "0.03",
    "equity": 285,
    "banked": 30,
    "total": 315,
    "weeklyGain": 65,
    "sweep": 0
  },
  {
    "week": 7,
    "label": "W07",
    "lotNum": 0.03,
    "lotStr": "0.03",
    "equity": 360,
    "banked": 30,
    "total": 390,
    "weeklyGain": 75,
    "sweep": 0
  },
  {
    "week": 8,
    "label": "W08",
    "lotNum": 0.04,
    "lotStr": "0.04",
    "equity": 390,
    "banked": 90,
    "total": 480,
    "weeklyGain": 90,
    "sweep": 60
  },
  {
    "week": 9,
    "label": "W09",
    "lotNum": 0.04,
    "lotStr": "0.04",
    "equity": 490,
    "banked": 90,
    "total": 580,
    "weeklyGain": 100,
    "sweep": 0
  },
  {
    "week": 10,
    "label": "W10",
    "lotNum": 0.05,
    "lotStr": "0.05",
    "equity": 610,
    "banked": 90,
    "total": 700,
    "weeklyGain": 120,
    "sweep": 0
  },
  {
    "week": 11,
    "label": "W11",
    "lotNum": 0.06,
    "lotStr": "0.06",
    "equity": 750,
    "banked": 90,
    "total": 840,
    "weeklyGain": 140,
    "sweep": 0
  },
  {
    "week": 12,
    "label": "W12",
    "lotNum": 0.07,
    "lotStr": "0.07",
    "equity": 800,
    "banked": 190,
    "total": 990,
    "weeklyGain": 150,
    "sweep": 100
  },
  {
    "week": 13,
    "label": "W13",
    "lotNum": 0.08,
    "lotStr": "0.08",
    "equity": 960,
    "banked": 190,
    "total": 1150,
    "weeklyGain": 160,
    "sweep": 0
  },
  {
    "week": 14,
    "label": "W14",
    "lotNum": 0.09,
    "lotStr": "0.09",
    "equity": 1140,
    "banked": 190,
    "total": 1330,
    "weeklyGain": 180,
    "sweep": 0
  },
  {
    "week": 15,
    "label": "W15",
    "lotNum": 0.1,
    "lotStr": "0.10",
    "equity": 1360,
    "banked": 190,
    "total": 1550,
    "weeklyGain": 220,
    "sweep": 0
  },
  {
    "week": 16,
    "label": "W16",
    "lotNum": 0.12,
    "lotStr": "0.12",
    "equity": 1440,
    "banked": 350,
    "total": 1790,
    "weeklyGain": 240,
    "sweep": 160
  },
  {
    "week": 17,
    "label": "W17",
    "lotNum": 0.12,
    "lotStr": "0.12",
    "equity": 1700,
    "banked": 350,
    "total": 2050,
    "weeklyGain": 260,
    "sweep": 0
  },
  {
    "week": 18,
    "label": "W18",
    "lotNum": 0.15,
    "lotStr": "0.15",
    "equity": 2000,
    "banked": 350,
    "total": 2350,
    "weeklyGain": 300,
    "sweep": 0
  },
  {
    "week": 19,
    "label": "W19",
    "lotNum": 0.16,
    "lotStr": "0.16",
    "equity": 2340,
    "banked": 350,
    "total": 2690,
    "weeklyGain": 340,
    "sweep": 0
  },
  {
    "week": 20,
    "label": "W20",
    "lotNum": 0.18,
    "lotStr": "0.18",
    "equity": 2450,
    "banked": 600,
    "total": 3050,
    "weeklyGain": 360,
    "sweep": 250
  },
  {
    "week": 21,
    "label": "W21",
    "lotNum": 0.2,
    "lotStr": "0.20",
    "equity": 2870,
    "banked": 600,
    "total": 3470,
    "weeklyGain": 420,
    "sweep": 0
  },
  {
    "week": 22,
    "label": "W22",
    "lotNum": 0.22,
    "lotStr": "0.22",
    "equity": 3350,
    "banked": 600,
    "total": 3950,
    "weeklyGain": 480,
    "sweep": 0
  },
  {
    "week": 23,
    "label": "W23",
    "lotNum": 0.25,
    "lotStr": "0.25",
    "equity": 3900,
    "banked": 600,
    "total": 4500,
    "weeklyGain": 550,
    "sweep": 0
  },
  {
    "week": 24,
    "label": "W24",
    "lotNum": 0.28,
    "lotStr": "0.28",
    "equity": 4090,
    "banked": 1010,
    "total": 5100,
    "weeklyGain": 600,
    "sweep": 410
  },
  {
    "week": 25,
    "label": "W25",
    "lotNum": 0.3,
    "lotStr": "0.30",
    "equity": 4730,
    "banked": 1010,
    "total": 5740,
    "weeklyGain": 640,
    "sweep": 0
  },
  {
    "week": 26,
    "label": "W26",
    "lotNum": 0.35,
    "lotStr": "0.35",
    "equity": 5450,
    "banked": 1010,
    "total": 6460,
    "weeklyGain": 720,
    "sweep": 0
  },
  {
    "week": 27,
    "label": "W27",
    "lotNum": 0.38,
    "lotStr": "0.38",
    "equity": 6200,
    "banked": 1010,
    "total": 7210,
    "weeklyGain": 750,
    "sweep": 0
  },
  {
    "week": 28,
    "label": "W28",
    "lotNum": 0.4,
    "lotStr": "0.40",
    "equity": 6420,
    "banked": 1590,
    "total": 8010,
    "weeklyGain": 800,
    "sweep": 580
  },
  {
    "week": 29,
    "label": "W29",
    "lotNum": 0.45,
    "lotStr": "0.45",
    "equity": 7320,
    "banked": 1590,
    "total": 8910,
    "weeklyGain": 900,
    "sweep": 0
  },
  {
    "week": 30,
    "label": "W30",
    "lotNum": 0.5,
    "lotStr": "0.50",
    "equity": 8320,
    "banked": 1590,
    "total": 9910,
    "weeklyGain": 1000,
    "sweep": 0
  },
  {
    "week": 31,
    "label": "W31",
    "lotNum": 0.55,
    "lotStr": "0.55",
    "equity": 9400,
    "banked": 1590,
    "total": 10990,
    "weeklyGain": 1080,
    "sweep": 0
  },
  {
    "week": 32,
    "label": "W32",
    "lotNum": 0.6,
    "lotStr": "0.60",
    "equity": 9690,
    "banked": 2400,
    "total": 12090,
    "weeklyGain": 1100,
    "sweep": 810
  },
  {
    "week": 33,
    "label": "W33",
    "lotNum": 0.65,
    "lotStr": "0.65",
    "equity": 10940,
    "banked": 2400,
    "total": 13340,
    "weeklyGain": 1250,
    "sweep": 0
  },
  {
    "week": 34,
    "label": "W34",
    "lotNum": 0.7,
    "lotStr": "0.70",
    "equity": 12290,
    "banked": 2400,
    "total": 14690,
    "weeklyGain": 1350,
    "sweep": 0
  },
  {
    "week": 35,
    "label": "W35",
    "lotNum": 0.75,
    "lotStr": "0.75",
    "equity": 13640,
    "banked": 2400,
    "total": 16040,
    "weeklyGain": 1350,
    "sweep": 0
  },
  {
    "week": 36,
    "label": "W36",
    "lotNum": 0.8,
    "lotStr": "0.80",
    "equity": 13940,
    "banked": 3460,
    "total": 17400,
    "weeklyGain": 1360,
    "sweep": 1060
  },
  {
    "week": 37,
    "label": "W37",
    "lotNum": 0.8,
    "lotStr": "0.80",
    "equity": 15290,
    "banked": 3460,
    "total": 18750,
    "weeklyGain": 1350,
    "sweep": 0
  },
  {
    "week": 38,
    "label": "W38",
    "lotNum": 0.85,
    "lotStr": "0.85",
    "equity": 16660,
    "banked": 3460,
    "total": 20120,
    "weeklyGain": 1370,
    "sweep": 0
  },
  {
    "week": 39,
    "label": "W39",
    "lotNum": 0.9,
    "lotStr": "0.90",
    "equity": 18080,
    "banked": 3460,
    "total": 21540,
    "weeklyGain": 1420,
    "sweep": 0
  },
  {
    "week": 40,
    "label": "W40",
    "lotNum": 1,
    "lotStr": "1.00",
    "equity": 18390,
    "banked": 4570,
    "total": 22960,
    "weeklyGain": 1420,
    "sweep": 1110
  },
  {
    "week": 41,
    "label": "W41",
    "lotNum": 1,
    "lotStr": "1.00",
    "equity": 19990,
    "banked": 4570,
    "total": 24560,
    "weeklyGain": 1600,
    "sweep": 0
  },
  {
    "week": 42,
    "label": "W42",
    "lotNum": 1.1,
    "lotStr": "1.10",
    "equity": 21640,
    "banked": 4570,
    "total": 26210,
    "weeklyGain": 1650,
    "sweep": 0
  },
  {
    "week": 43,
    "label": "W43",
    "lotNum": 1.2,
    "lotStr": "1.20",
    "equity": 23300,
    "banked": 4570,
    "total": 27870,
    "weeklyGain": 1660,
    "sweep": 0
  },
  {
    "week": 44,
    "label": "W44",
    "lotNum": 1.25,
    "lotStr": "1.25",
    "equity": 23680,
    "banked": 5890,
    "total": 29570,
    "weeklyGain": 1700,
    "sweep": 1320
  },
  {
    "week": 45,
    "label": "W45",
    "lotNum": 1.3,
    "lotStr": "1.30",
    "equity": 25480,
    "banked": 5890,
    "total": 31370,
    "weeklyGain": 1800,
    "sweep": 0
  },
  {
    "week": 46,
    "label": "W46",
    "lotNum": 1.4,
    "lotStr": "1.40",
    "equity": 27360,
    "banked": 5890,
    "total": 33250,
    "weeklyGain": 1880,
    "sweep": 0
  },
  {
    "week": 47,
    "label": "W47",
    "lotNum": 1.5,
    "lotStr": "1.50",
    "equity": 30000,
    "banked": 5890,
    "total": 35890,
    "weeklyGain": 2640,
    "sweep": 0
  },
  {
    "week": 48,
    "label": "W48",
    "lotNum": 1.5,
    "lotStr": "1.50 CAP",
    "equity": 30000,
    "banked": 7150,
    "total": 37150,
    "weeklyGain": 1260,
    "sweep": 1260
  }
];

export const MONTHLY_SUMMARY: MonthlySummaryItem[] = [
  {
    "month": "M01",
    "name": "October",
    "gross": 150,
    "bankOut": 30,
    "endingEquity": 170
  },
  {
    "month": "M02",
    "name": "November",
    "gross": 280,
    "bankOut": 60,
    "endingEquity": 390
  },
  {
    "month": "M03",
    "name": "December",
    "gross": 510,
    "bankOut": 100,
    "endingEquity": 800
  },
  {
    "month": "M04",
    "name": "January",
    "gross": 800,
    "bankOut": 160,
    "endingEquity": 1440
  },
  {
    "month": "M05",
    "name": "February",
    "gross": 1260,
    "bankOut": 250,
    "endingEquity": 2450
  },
  {
    "month": "M06",
    "name": "March",
    "gross": 2050,
    "bankOut": 410,
    "endingEquity": 4090
  },
  {
    "month": "M07",
    "name": "April",
    "gross": 2910,
    "bankOut": 580,
    "endingEquity": 6420
  },
  {
    "month": "M08",
    "name": "May",
    "gross": 4080,
    "bankOut": 810,
    "endingEquity": 9690
  },
  {
    "month": "M09",
    "name": "June",
    "gross": 5310,
    "bankOut": 1060,
    "endingEquity": 13940
  },
  {
    "month": "M10",
    "name": "July",
    "gross": 5560,
    "bankOut": 1110,
    "endingEquity": 18390
  },
  {
    "month": "M11",
    "name": "August",
    "gross": 6610,
    "bankOut": 1320,
    "endingEquity": 23680
  },
  {
    "month": "M12",
    "name": "September",
    "gross": 7580,
    "bankOut": 1260,
    "endingEquity": 30000
  }
];
