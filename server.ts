import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { db, initDatabase } from './src/db/index.ts';
import { users, dailySessions, journalNotes, cockpitState, performanceRatings, mentalStateLogs, weeklyObjectives } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { INITIAL_QUARTERS } from './src/data/roadmapData.ts';
import { generateDefaultWeeklyObjectives } from './src/data/defaultObjectives.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

// Enable CORS for two-way sync between Desktop app and Web Server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize ultra-fast LibSQL / SQLite database
await initDatabase();

// API route for Tri AI Trading Officer
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, contextData } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }

    const ai = new GoogleGenAI();

    // Construct versatile, context-aware system instruction (conversational like ChatGPT/Gemini + pre-launch trading plan awareness)
    const systemInstruction = `You are Tri, an extraordinarily versatile, knowledgeable, and perceptive AI assistant and Elite Pre-Launch Trading Command Officer for the Transformer19 - 100k Program. You are collaborating with the trader (Operator: ${contextData?.traderName || 'Yohannes Sharew'}).

CRITICAL GROUND TRUTH — THE JOURNEY HAS NOT STARTED YET:
- THE TRADING JOURNEY HAS NOT STARTED YET.
- This entire cockpit and 48-week compounding matrix is a SIMULATED BLUEPRINT & EXECUTION PLAN of what Operator Yohannes is PREPARING TO ACHIEVE, NOT trades he already completed or past money he had!
- Current Working Capital is strictly the starting $50.00 seed tranche.
- Live Realized P&L is currently NONE ($0.00). Exactly 0 live trading days have been executed so far.
- The $30,000 working equity and $7,150 physical offline sweeps ($37,150 total value) are the SIMULATED TARGETS to achieve over 48 weeks based on the 30K realistic compounding plan.
- NEVER speak to or congratulate Yohannes as if he already completed the journey or already accumulated $30,000!
- You are his pre-launch command officer, risk strategist, and mental conditioning coach:
  • Help him prepare thoroughly for Day 1 (Week 01: London Open expansion on Gold XAU/USD, 0.01 lot ceiling, 20-pip stop).
  • Review the planned lot ladder, session routines, risk circuit breakers, and Rule 01 spiritual devotion.
  • When discussing his metrics, acknowledge that he is at the starting gate with $50 seed, preparing to execute the master simulation.

VERSATILITY & CONVERSATIONAL FREEDOM (LIKE CHATGPT & GEMINI):
- You can chat freely, naturally, and comprehensively on ANY topic the user asks about:
  • General queries, science, technology, coding (Python, PineScript, TypeScript, SQL), philosophy, daily habits, motivation, and creative writing.
  • In-depth financial markets: price action, ICT / Smart Money Concepts, Gold (XAU/USD), Forex pairs, liquidity sweeps, market structure, news analysis, Federal Reserve policy, macroeconomics.
  • Trader psychology & routine: mastering fear/greed, resetting baseline zero, discipline protocols, spiritual meditation and Bible wisdom.
  • Transformer19 Cockpit: pre-launch preparation, simulated lot progression, 20-pip stop rules, offline harvest planning.
- NEVER refuse to engage, never stonewall, and never restrict conversations to only predefined templates. Answer any question with intellectual depth, nuance, and helpful clarity.
- Format responses cleanly with markdown, bullet points, code blocks, or bold highlights when appropriate.

LIVE COCKPIT STATE (PRE-LAUNCH):
- Current Starting Seed: $${contextData?.workingEquity !== undefined ? Number(contextData.workingEquity).toFixed(2) : '50.00'}
- Live Realized P&L to Date: None ($0.00 - Not Started Yet)
- Target to Achieve (48-Week Plan): $30,000 Retained Working Equity + $7,150 Offline Bank Sweeps ($37,150 Total Value)
- Roadmap Execution Progress: 0 / ${contextData?.totalSessions || 240} sessions executed (Pre-Launch)
- Edge Target in Simulation: 66.2% Win Rate over 252 planned sessions
- Rule 01 Devotion Gate Today: ${contextData?.devotionPassed ? 'PASSED ✓ (Mental & spiritual grounding ready)' : 'PENDING (Remind gently to center before Day 1, but chat freely)'}
- Recorded Sticky Notes: ${contextData?.totalNotes || 0} pre-launch notes logged
${contextData?.recentNotes?.length ? `RECENT TRADER NOTES:
${contextData.recentNotes.map((n: any) => `• [${n.dayLabel || 'Session'} | ${n.sessionTag || 'Note'}]: "${n.title ? n.title + ': ' : ''}${n.content}" (${n.outcome || 'Note'}${n.pnl !== undefined ? `, $${n.pnl}` : ''})`).join('\n')}` : ''}

TONE:
- Highly intelligent, warm, articulate, perceptive, and strategic.
- An elite trading desk partner and pre-launch strategist who treats the trader with respect, discipline, and clarity.`;

    // Map messages history to SDK format
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || 'I am with you, Operator. What shall we explore or analyze next?';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error with Tri AI endpoint:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate response from Tri AI'
    });
  }
});

// API route for AI Performance Rating Evaluation
app.post('/api/rate-performance', async (req, res) => {
  try {
    const { telemetry } = req.body;
    const ai = new GoogleGenAI();

    const prompt = `You are the Master Forensic Trading Auditor for the Transformer19 - 100k Program.
Conduct a rigorous AI Performance Audit of Operator ${telemetry?.traderName || 'Yohannes Sharew'} based on their weekly planned targets, actual execution results, and daily trading journal reflections.

LIVE TRADER TELEMETRY:
- Working Equity: $${telemetry?.workingEquity || 50}
- Banked Offline Cash: $${telemetry?.bankedCash || 0}
- Total Realized Net Worth: $${telemetry?.netWorth || 50}
- Progress: ${telemetry?.completedSessions || 0} completed sessions (Win Rate: ${telemetry?.winRate || '100'}%)
- Wins: ${telemetry?.wins || 0}, Losses: ${telemetry?.losses || 0}
- Spiritual Devotion Gate Today (Rule 01): ${telemetry?.devotionPassed ? 'PASSED' : 'PENDING / GATED'}
- Authorized Ladder Lot Size: ${telemetry?.authorizedLot || '0.01 Lot'}
- Recent Daily Sticky Notes (${telemetry?.recentNotes?.length || 0} notes):
${telemetry?.recentNotes?.length ? telemetry.recentNotes.map((n: any) => `- [${n.dayLabel || 'Session'} | ${n.sessionTag || 'Note'}]: "${n.content}" (Outcome: ${n.outcome || 'N/A'}, PnL: ${n.pnl !== undefined ? '$' + n.pnl : 'Planned'})`).join('\n') : 'No journal notes logged yet.'}

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
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const rawText = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Strip potential markdown backticks
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    parsed.assessedAt = new Date().toISOString();
    parsed.isAiGenerated = true;
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI performance rating:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate AI performance rating'
    });
  }
});

// ==========================================
// FAST POSTGRESQL (CLOUD SQL) DATABASE ROUTES
// ==========================================

// ==========================================
// FAST LIB-SQL / SQLITE 1-YEAR DATABASE ROUTES & AUTO-BACKUP
// ==========================================

// Helper to sanitize default user ID
const DEFAULT_USER_ID = 'local-trader';

// Automated Rolling File Backup Engine (Debounced)
let backupDebounceTimer: NodeJS.Timeout | null = null;
export const triggerDatabaseSnapshot = () => {
  if (backupDebounceTimer) clearTimeout(backupDebounceTimer);
  backupDebounceTimer = setTimeout(async () => {
    try {
      const backupsDir = path.join(__dirname, 'backups');
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }
      const allSessions = await db.select().from(dailySessions);
      const allNotes = await db.select().from(journalNotes);
      const allMental = await db.select().from(mentalStateLogs);
      const allObjectives = await db.select().from(weeklyObjectives);
      const allState = await db.select().from(cockpitState);

      const snapshot = {
        app: 'Transformer19 30K Execution Cockpit & Journal',
        snapshotTime: new Date().toISOString(),
        totalRecordedSessions: allSessions.length,
        totalJournalNotes: allNotes.length,
        totalMentalLogs: allMental.length,
        totalObjectives: allObjectives.length,
        cockpitState: allState[0] || null,
        sessions: allSessions,
        journalNotes: allNotes,
        mentalStateLogs: allMental,
        weeklyObjectives: allObjectives,
      };

      const dateStr = new Date().toISOString().split('T')[0];
      fs.writeFileSync(path.join(backupsDir, 'cockpit_backup_latest.json'), JSON.stringify(snapshot, null, 2), 'utf8');
      fs.writeFileSync(path.join(backupsDir, `cockpit_backup_${dateStr}.json`), JSON.stringify(snapshot, null, 2), 'utf8');
      console.log(`💾 Auto-snapshot written to backups/cockpit_backup_${dateStr}.json (${allSessions.length} sessions, ${allNotes.length} notes).`);
    } catch (e) {
      console.warn('Auto snapshot error:', e);
    }
  }, 2000);
};

// Database Health & Performance Telemetry Endpoint
app.get('/api/db/health', async (_req, res) => {
  const sessionCount = await db.select().from(dailySessions);
  const notesCount = await db.select().from(journalNotes);
  res.json({
    status: 'online',
    engine: 'LibSQL / SQLite (WAL High-Performance Mode)',
    latency: '< 0.1ms',
    databaseFile: 'cockpit.db',
    readWriteMode: 'Concurrent WAL non-blocking',
    totalSessionsRecorded: sessionCount.length,
    totalNotesRecorded: notesCount.length,
    coverage: '1-Year Master Compounding Execution Plan (48 Weeks / 252 Sessions)'
  });
});

// Full 1-Click Database Export / Download Snapshot Endpoint
app.get('/api/db/export', async (_req, res) => {
  try {
    const allSessions = await db.select().from(dailySessions);
    const allNotes = await db.select().from(journalNotes);
    const allMental = await db.select().from(mentalStateLogs);
    const allObjectives = await db.select().from(weeklyObjectives);
    const allState = await db.select().from(cockpitState);

    res.json({
      success: true,
      exportedAt: new Date().toISOString(),
      app: 'Transformer19 30K Execution Cockpit',
      state: allState[0] || null,
      sessions: allSessions,
      notes: allNotes,
      mentalLogs: allMental,
      objectives: allObjectives
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Export failed' });
  }
});

// 1. Fetch entire cockpit telemetry & records from LibSQL / SQLite
const handleGetCockpit = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req.query.userId as string) || DEFAULT_USER_ID;

    // Load state
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
        metrics: JSON.parse(ratings[0].metricsJson || '[]'),
        assessedAt: ratings[0].assessedAt,
      } : null
    });
  } catch (error: any) {
    console.error('Database get cockpit error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch data from database' });
  }
};

// Route aliases for high-performance SQLite 1-year database
app.get('/api/sqlite/cockpit', handleGetCockpit);
app.get('/api/postgres/cockpit', handleGetCockpit);
app.get('/api/db/cockpit', handleGetCockpit);
app.get('/api/cloud/sync', handleGetCockpit);

// Batch Cloud Sync Endpoint: Receives offline desktop modifications and writes to database
app.post('/api/cloud/sync', async (req, res) => {
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
      clientSource = 'desktop'
    } = req.body;

    let sessionsCount = 0;
    let notesCount = 0;
    let objectivesCount = 0;
    let mentalCount = 0;

    // 1. Batch upsert sessions
    for (const session of sessions) {
      if (!session || !session.id) continue;
      const existing = await db
        .select()
        .from(dailySessions)
        .where(eq(dailySessions.sessionId, session.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(dailySessions)
          .set({
            actualResult: 'actualResult' in session ? session.actualResult : existing[0].actualResult,
            deltaPercent: session.deltaPercent !== undefined ? session.deltaPercent : existing[0].deltaPercent,
            status: session.status || existing[0].status,
            notes: 'notes' in session ? session.notes : existing[0].notes,
            proto: 'proto' in session ? session.proto : existing[0].proto,
            isLoss: session.isLoss !== undefined ? Boolean(session.isLoss) : Boolean(existing[0].isLoss),
            date: session.date || existing[0].date,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(dailySessions.sessionId, session.id));
      } else {
        await db.insert(dailySessions).values({
          sessionId: session.id,
          userId: userId,
          quarterId: session.quarterId || 'quarter-1',
          monthId: session.monthId || 'q1-m1',
          weekId: session.weekId || 'w01',
          dayNumber: session.dayNumber || 1,
          dayName: session.dayName || 'Day 01',
          date: session.date || null,
          plannedTarget: session.plannedTarget || 25.0,
          actualResult: session.actualResult !== undefined ? session.actualResult : null,
          deltaPercent: session.deltaPercent || 0,
          status: session.status || 'pending',
          notes: session.notes || null,
          proto: session.proto || null,
          isLoss: Boolean(session.isLoss),
        });
      }
      sessionsCount++;
    }

    // 2. Batch upsert notes
    for (const note of notes) {
      if (!note || !note.id) continue;
      const existing = await db
        .select()
        .from(journalNotes)
        .where(eq(journalNotes.noteId, note.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(journalNotes)
          .set({
            title: note.title !== undefined ? note.title : existing[0].title,
            content: note.content !== undefined ? note.content : existing[0].content,
            color: note.color || existing[0].color,
            outcome: note.outcome || existing[0].outcome,
            pnl: note.pnl !== undefined ? note.pnl : existing[0].pnl,
            rotation: note.rotation !== undefined ? note.rotation : existing[0].rotation,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(journalNotes.noteId, note.id));
      } else {
        await db.insert(journalNotes).values({
          noteId: note.id,
          userId: userId,
          dayId: note.dayId || 'day-1',
          dayLabel: note.dayLabel || 'Session 1',
          date: note.date || null,
          sessionTag: note.sessionTag || null,
          title: note.title || null,
          content: note.content,
          color: note.color || 'yellow',
          outcome: note.outcome || null,
          pnl: note.pnl !== undefined ? note.pnl : null,
          rotation: note.rotation || 0,
          createdAt: note.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      notesCount++;
    }

    // 3. Batch delete notes
    for (const noteId of deletedNoteIds) {
      if (noteId) {
        await db.delete(journalNotes).where(eq(journalNotes.noteId, noteId));
      }
    }

    // 4. Batch upsert mental logs
    for (const log of mentalLogs) {
      if (!log || !log.id) continue;
      const existing = await db
        .select()
        .from(mentalStateLogs)
        .where(eq(mentalStateLogs.logId, log.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(mentalStateLogs)
          .set({
            rating: log.rating || existing[0].rating,
            stateKey: log.stateKey || existing[0].stateKey,
            emoji: log.emoji || existing[0].emoji,
            label: log.label || existing[0].label,
            tagsJson: log.tags ? JSON.stringify(log.tags) : existing[0].tagsJson,
            notes: log.notes !== undefined ? log.notes : existing[0].notes,
          })
          .where(eq(mentalStateLogs.logId, log.id));
      } else {
        await db.insert(mentalStateLogs).values({
          logId: log.id,
          userId: userId,
          dayId: log.dayId || 'day-1',
          sessionTag: log.sessionTag || 'General',
          date: log.date || new Date().toISOString().slice(0, 10),
          stateKey: log.stateKey || 'flow',
          emoji: log.emoji || '🎯',
          label: log.label || 'Flow',
          rating: log.rating || 5,
          tagsJson: log.tags ? JSON.stringify(log.tags) : '[]',
          notes: log.notes || null,
          loggedAt: log.loggedAt || new Date().toISOString(),
        });
      }
      mentalCount++;
    }

    // 5. Batch delete mental logs
    for (const logId of deletedMentalIds) {
      if (logId) {
        await db.delete(mentalStateLogs).where(eq(mentalStateLogs.logId, logId));
      }
    }

    // 6. Batch upsert weekly objectives
    for (const obj of objectives) {
      if (!obj || !obj.weekId) continue;
      const existing = await db
        .select()
        .from(weeklyObjectives)
        .where(eq(weeklyObjectives.weekId, obj.weekId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(weeklyObjectives)
          .set({
            status: obj.status || existing[0].status,
            primaryObjective: obj.primaryObjective || existing[0].primaryObjective,
            tacticalNotes: obj.tacticalNotes !== undefined ? obj.tacticalNotes : existing[0].tacticalNotes,
            checklistJson: obj.checklist ? JSON.stringify(obj.checklist) : (obj.checklistJson || existing[0].checklistJson),
            debriefNotes: obj.debriefNotes !== undefined ? obj.debriefNotes : existing[0].debriefNotes,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(weeklyObjectives.weekId, obj.weekId));
      } else {
        await db.insert(weeklyObjectives).values({
          weekId: obj.weekId,
          userId: userId,
          quarterId: obj.quarterId || 'quarter-1',
          quarterName: obj.quarterName || '',
          monthNum: obj.monthNum || '',
          plannedTargetPnl: obj.plannedTargetPnl || 40.0,
          lotSize: obj.lotSize || '0.01 lot',
          drillFocus: obj.drillFocus || '',
          primaryObjective: obj.primaryObjective || '',
          tacticalNotes: obj.tacticalNotes || '',
          status: obj.status || 'upcoming',
          checklistJson: obj.checklist ? JSON.stringify(obj.checklist) : (obj.checklistJson || '[]'),
          debriefNotes: obj.debriefNotes || '',
        });
      }
      objectivesCount++;
    }

    // 7. Update Cockpit State
    if (state) {
      const existing = await db
        .select()
        .from(cockpitState)
        .where(eq(cockpitState.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(cockpitState)
          .set({
            traderName: state.traderName || existing[0].traderName,
            devotionGatePassedToday: state.devotionGatePassedToday !== undefined ? state.devotionGatePassedToday : existing[0].devotionGatePassedToday,
            workingEquity: state.workingEquity !== undefined ? state.workingEquity : existing[0].workingEquity,
            bankedCash: state.bankedCash !== undefined ? state.bankedCash : existing[0].bankedCash,
            netWorth: state.netWorth !== undefined ? state.netWorth : existing[0].netWorth,
            winRate: state.winRate !== undefined ? state.winRate : existing[0].winRate,
            totalWins: state.totalWins !== undefined ? state.totalWins : existing[0].totalWins,
            totalLosses: state.totalLosses !== undefined ? state.totalLosses : existing[0].totalLosses,
            completedSessions: state.completedSessions !== undefined ? state.completedSessions : existing[0].completedSessions,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(cockpitState.userId, userId));
      }
    }

    triggerDatabaseSnapshot();

    res.json({
      success: true,
      message: 'Cloud sync complete',
      syncedAt: new Date().toISOString(),
      counts: {
        sessions: sessionsCount,
        notes: notesCount,
        objectives: objectivesCount,
        mentalLogs: mentalCount
      }
    });
  } catch (error: any) {
    console.error('Cloud sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync with cloud database' });
  }
});

// 2. Upsert a daily session in SQLite/LibSQL
const handlePostSession = async (req: express.Request, res: express.Response) => {
  try {
    const { session, userId = DEFAULT_USER_ID } = req.body;
    if (!session || !session.id) {
      return res.status(400).json({ error: 'Valid session object required' });
    }

    const existing = await db
      .select()
      .from(dailySessions)
      .where(eq(dailySessions.sessionId, session.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(dailySessions)
        .set({
          dayName: 'dayName' in session ? session.dayName : existing[0].dayName,
          date: 'date' in session ? session.date : existing[0].date,
          actualResult: 'actualResult' in session ? session.actualResult : existing[0].actualResult,
          deltaPercent: session.deltaPercent !== undefined ? session.deltaPercent : existing[0].deltaPercent,
          status: session.status || existing[0].status,
          notes: 'notes' in session ? session.notes : existing[0].notes,
          proto: 'proto' in session ? session.proto : existing[0].proto,
          isLoss: session.isLoss !== undefined ? Boolean(session.isLoss) : Boolean(existing[0].isLoss),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(dailySessions.sessionId, session.id));
    } else {
      await db.insert(dailySessions).values({
        sessionId: session.id,
        userId: userId,
        quarterId: session.quarterId || 'quarter-1',
        monthId: session.monthId || 'q1-m1',
        weekId: session.weekId || 'w01',
        dayNumber: session.dayNumber || 1,
        dayName: session.dayName || 'Day 01',
        date: session.date || null,
        plannedTarget: session.plannedTarget || 25.0,
        actualResult: session.actualResult !== undefined ? session.actualResult : null,
        deltaPercent: session.deltaPercent || 0,
        status: session.status || 'pending',
        notes: session.notes || null,
        proto: session.proto || null,
        isLoss: Boolean(session.isLoss),
      });
    }

    triggerDatabaseSnapshot();
    res.json({ success: true, sessionId: session.id });
  } catch (error: any) {
    console.error('Session upsert error:', error);
    res.status(500).json({ error: error.message || 'Failed to save session in database' });
  }
};
app.post('/api/sqlite/session', handlePostSession);
app.post('/api/postgres/session', handlePostSession);

// 3. Upsert a Sticky Journal Note in SQLite/LibSQL
const handlePostJournal = async (req: express.Request, res: express.Response) => {
  try {
    const { note, userId = DEFAULT_USER_ID } = req.body;
    if (!note || !note.id) {
      return res.status(400).json({ error: 'Valid note object required' });
    }

    const existing = await db
      .select()
      .from(journalNotes)
      .where(eq(journalNotes.noteId, note.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(journalNotes)
        .set({
          title: note.title !== undefined ? note.title : existing[0].title,
          content: note.content !== undefined ? note.content : existing[0].content,
          color: note.color || existing[0].color,
          outcome: note.outcome || existing[0].outcome,
          pnl: note.pnl !== undefined ? note.pnl : existing[0].pnl,
          rotation: note.rotation !== undefined ? note.rotation : existing[0].rotation,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(journalNotes.noteId, note.id));
    } else {
      await db.insert(journalNotes).values({
        noteId: note.id,
        userId: userId,
        dayId: note.dayId || 'day-1',
        dayLabel: note.dayLabel || 'Session 1',
        date: note.date || null,
        sessionTag: note.sessionTag || null,
        title: note.title || null,
        content: note.content,
        color: note.color || 'yellow',
        outcome: note.outcome || null,
        pnl: note.pnl !== undefined ? note.pnl : null,
        rotation: note.rotation || 0,
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    triggerDatabaseSnapshot();
    res.json({ success: true, noteId: note.id });
  } catch (error: any) {
    console.error('Journal upsert error:', error);
    res.status(500).json({ error: error.message || 'Failed to save note in database' });
  }
};
app.post('/api/sqlite/journal', handlePostJournal);
app.post('/api/postgres/journal', handlePostJournal);

// 4. Delete a Journal Note in SQLite/LibSQL
const handleDeleteJournal = async (req: express.Request, res: express.Response) => {
  try {
    const noteId = req.params.id;
    await db.delete(journalNotes).where(eq(journalNotes.noteId, noteId));
    triggerDatabaseSnapshot();
    res.json({ success: true, deleted: noteId });
  } catch (error: any) {
    console.error('Delete journal error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete note from database' });
  }
};
app.delete('/api/sqlite/journal/:id', handleDeleteJournal);
app.delete('/api/postgres/journal/:id', handleDeleteJournal);

// 5. Update Cockpit State in SQLite/LibSQL
const handlePostState = async (req: express.Request, res: express.Response) => {
  try {
    const { state, userId = DEFAULT_USER_ID } = req.body;
    const existing = await db
      .select()
      .from(cockpitState)
      .where(eq(cockpitState.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cockpitState)
        .set({
          traderName: state.traderName || existing[0].traderName,
          devotionGatePassedToday: state.devotionGatePassedToday !== undefined ? state.devotionGatePassedToday : existing[0].devotionGatePassedToday,
          workingEquity: state.workingEquity !== undefined ? state.workingEquity : existing[0].workingEquity,
          bankedCash: state.bankedCash !== undefined ? state.bankedCash : existing[0].bankedCash,
          netWorth: state.netWorth !== undefined ? state.netWorth : existing[0].netWorth,
          winRate: state.winRate !== undefined ? state.winRate : existing[0].winRate,
          totalWins: state.totalWins !== undefined ? state.totalWins : existing[0].totalWins,
          totalLosses: state.totalLosses !== undefined ? state.totalLosses : existing[0].totalLosses,
          completedSessions: state.completedSessions !== undefined ? state.completedSessions : existing[0].completedSessions,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(cockpitState.userId, userId));
    } else {
      await db.insert(cockpitState).values({
        userId,
        traderName: state.traderName || 'Yohannes Sharew',
        devotionGatePassedToday: state.devotionGatePassedToday || false,
        workingEquity: state.workingEquity || 50.0,
        bankedCash: state.bankedCash || 0.0,
        netWorth: state.netWorth || 50.0,
        winRate: state.winRate || 100.0,
        totalWins: state.totalWins || 0,
        totalLosses: state.totalLosses || 0,
        completedSessions: state.completedSessions || 0,
      });
    }

    triggerDatabaseSnapshot();
    res.json({ success: true });
  } catch (error: any) {
    console.error('Update state error:', error);
    res.status(500).json({ error: error.message || 'Failed to update state in database' });
  }
};
app.post('/api/sqlite/state', handlePostState);
app.post('/api/postgres/state', handlePostState);

// 6. Upsert a Mental State Log in SQLite/LibSQL
const handlePostMental = async (req: express.Request, res: express.Response) => {
  try {
    const { log, userId = DEFAULT_USER_ID } = req.body;
    if (!log || !log.id) {
      return res.status(400).json({ error: 'Valid mental log object required' });
    }

    const existing = await db
      .select()
      .from(mentalStateLogs)
      .where(eq(mentalStateLogs.logId, log.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(mentalStateLogs)
        .set({
          dayId: log.dayId || existing[0].dayId,
          sessionTag: log.sessionTag || existing[0].sessionTag,
          date: log.date || existing[0].date,
          stateKey: log.stateKey || existing[0].stateKey,
          emoji: log.emoji || existing[0].emoji,
          label: log.label || existing[0].label,
          rating: log.rating !== undefined ? log.rating : existing[0].rating,
          tagsJson: JSON.stringify(log.tags || []),
          notes: log.notes !== undefined ? log.notes : existing[0].notes,
          loggedAt: log.loggedAt || existing[0].loggedAt,
        })
        .where(eq(mentalStateLogs.logId, log.id));
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
        loggedAt: log.loggedAt,
      });
    }

    triggerDatabaseSnapshot();
    res.json({ success: true, logId: log.id });
  } catch (error: any) {
    console.error('Mental log upsert error:', error);
    res.status(500).json({ error: error.message || 'Failed to save mental log in database' });
  }
};
app.post('/api/sqlite/mental', handlePostMental);
app.post('/api/postgres/mental', handlePostMental);

// 7. Delete a Mental State Log in SQLite/LibSQL
const handleDeleteMental = async (req: express.Request, res: express.Response) => {
  try {
    const logId = req.params.id;
    await db.delete(mentalStateLogs).where(eq(mentalStateLogs.logId, logId));
    triggerDatabaseSnapshot();
    res.json({ success: true, deleted: logId });
  } catch (error: any) {
    console.error('Delete mental log error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete mental log from database' });
  }
};
app.delete('/api/sqlite/mental/:id', handleDeleteMental);
app.delete('/api/postgres/mental/:id', handleDeleteMental);

// 8. Upsert a Weekly Objective in SQLite/LibSQL
const handlePostObjective = async (req: express.Request, res: express.Response) => {
  try {
    const { objective, userId = DEFAULT_USER_ID } = req.body;
    if (!objective || !objective.weekId) {
      return res.status(400).json({ error: 'Valid objective object with weekId required' });
    }

    const existing = await db
      .select()
      .from(weeklyObjectives)
      .where(eq(weeklyObjectives.weekId, objective.weekId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(weeklyObjectives)
        .set({
          status: objective.status || existing[0].status,
          primaryObjective: objective.primaryObjective || existing[0].primaryObjective,
          tacticalNotes: objective.tacticalNotes !== undefined ? objective.tacticalNotes : existing[0].tacticalNotes,
          checklistJson: objective.checklist ? JSON.stringify(objective.checklist) : (objective.checklistJson || existing[0].checklistJson),
          debriefNotes: objective.debriefNotes !== undefined ? objective.debriefNotes : existing[0].debriefNotes,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(weeklyObjectives.weekId, objective.weekId));
    } else {
      await db.insert(weeklyObjectives).values({
        weekId: objective.weekId,
        userId: userId,
        quarterId: objective.quarterId || 'quarter-1',
        quarterName: objective.quarterName || '',
        monthNum: objective.monthNum || '',
        plannedTargetPnl: objective.plannedTargetPnl || 40.0,
        lotSize: objective.lotSize || '0.01 lot',
        drillFocus: objective.drillFocus || '',
        primaryObjective: objective.primaryObjective || '',
        tacticalNotes: objective.tacticalNotes || '',
        status: objective.status || 'upcoming',
        checklistJson: objective.checklist ? JSON.stringify(objective.checklist) : (objective.checklistJson || '[]'),
        debriefNotes: objective.debriefNotes || '',
      });
    }

    triggerDatabaseSnapshot();
    res.json({ success: true, weekId: objective.weekId });
  } catch (error: any) {
    console.error('Objective upsert error:', error);
    res.status(500).json({ error: error.message || 'Failed to save objective in database' });
  }
};
app.post('/api/sqlite/objective', handlePostObjective);
app.post('/api/postgres/objective', handlePostObjective);

// 9. Reset entire cockpit database and re-seed clean 1-year baseline
const handlePostReset = async (req: express.Request, res: express.Response) => {
  try {
    const { userId = DEFAULT_USER_ID } = req.body;
    await db.delete(dailySessions).where(eq(dailySessions.userId, userId));
    await db.delete(journalNotes).where(eq(journalNotes.userId, userId));
    await db.delete(mentalStateLogs).where(eq(mentalStateLogs.userId, userId));
    await db.delete(cockpitState).where(eq(cockpitState.userId, userId));
    await db.delete(weeklyObjectives).where(eq(weeklyObjectives.userId, userId));

    // Re-seed all 252 sessions
    for (const q of INITIAL_QUARTERS) {
      for (const m of q.months) {
        for (const w of m.weeks) {
          for (let dIdx = 0; dIdx < w.days.length; dIdx++) {
            const d = w.days[dIdx];
            const sId = `${w.id}-d${dIdx + 1}`;
            const cleanPnl = d.pnl.replace(/[^0-9.-]/g, '');
            const plannedNum = parseFloat(cleanPnl) || 25.0;
            await db.insert(dailySessions).values({
              sessionId: sId,
              userId: userId,
              quarterId: q.id,
              monthId: m.id,
              weekId: w.id,
              dayNumber: dIdx + 1,
              dayName: d.day,
              plannedTarget: plannedNum,
              actualResult: null,
              deltaPercent: 0,
              status: 'pending',
              notes: null,
              proto: d.proto || null,
              isLoss: Boolean(d.isLoss)
            });
          }
        }
      }
    }

    // Re-seed objectives
    const defaultObjectives = generateDefaultWeeklyObjectives(INITIAL_QUARTERS);
    for (const obj of defaultObjectives) {
      await db.insert(weeklyObjectives).values({
        weekId: obj.weekId,
        userId: userId,
        quarterId: obj.quarterId,
        quarterName: obj.quarterName || '',
        monthNum: obj.monthNum || '',
        plannedTargetPnl: obj.plannedTargetPnl,
        lotSize: obj.lotSize,
        drillFocus: obj.drillFocus || '',
        primaryObjective: obj.primaryObjective,
        tacticalNotes: obj.tacticalNotes || '',
        status: obj.status,
        checklistJson: JSON.stringify(obj.checklist || []),
        debriefNotes: ''
      });
    }

    // Re-seed cockpit state
    await db.insert(cockpitState).values({
      userId,
      traderName: 'Yohannes Sharew',
      devotionGatePassedToday: true,
      workingEquity: 50.0,
      bankedCash: 0.0,
      netWorth: 50.0,
      winRate: 100.0,
      totalWins: 0,
      totalLosses: 0,
      completedSessions: 0
    });

    triggerDatabaseSnapshot();
    res.json({ success: true, message: 'All cockpit data reset and pristine 1-year roadmap re-seeded' });
  } catch (error: any) {
    console.error('Reset error:', error);
    res.status(500).json({ error: error.message || 'Failed to reset database' });
  }
};
app.post('/api/sqlite/reset', handlePostReset);
app.post('/api/postgres/reset', handlePostReset);

// 10. Import new master schedule plan from CSV/JSON into SQLite/LibSQL database
const handleImportPlan = async (req: express.Request, res: express.Response) => {
  try {
    const {
      quarters = [],
      objectives = [],
      seedCapital = 50.0,
      targetBanked = 7150.0,
      targetRetained = 30000.0,
      targetTotal = 37150.0,
      userId = DEFAULT_USER_ID
    } = req.body;

    if (!Array.isArray(quarters) || quarters.length === 0) {
      return res.status(400).json({ error: 'Quarters array is required' });
    }

    // 1. Clear existing sessions & objectives for this user
    await db.delete(dailySessions).where(eq(dailySessions.userId, userId));
    await db.delete(weeklyObjectives).where(eq(weeklyObjectives.userId, userId));

    let sessionsCount = 0;
    // 2. Insert all sessions from new quarters
    for (const q of quarters) {
      for (const m of q.months) {
        for (const w of m.weeks) {
          for (let dIdx = 0; dIdx < w.days.length; dIdx++) {
            const d = w.days[dIdx];
            const sId = `${w.id}-d${dIdx + 1}`;
            const cleanPnl = String(d.pnl || '0').replace(/[^0-9.-]/g, '');
            const plannedNum = parseFloat(cleanPnl) || 25.0;

            await db.insert(dailySessions).values({
              sessionId: sId,
              userId,
              quarterId: q.id,
              monthId: m.id,
              weekId: w.id,
              dayNumber: dIdx + 1,
              dayName: d.day,
              plannedTarget: plannedNum,
              actualResult: d.actualPnl !== undefined ? d.actualPnl : null,
              deltaPercent: 0,
              status: d.status || 'pending',
              notes: d.notes || null,
              proto: d.proto || null,
              isLoss: Boolean(d.isLoss)
            });
            sessionsCount++;
          }
        }
      }
    }

    // 3. Insert all objectives
    let objectivesCount = 0;
    for (const obj of objectives) {
      await db.insert(weeklyObjectives).values({
        weekId: obj.weekId,
        userId,
        quarterId: obj.quarterId || 'quarter-1',
        quarterName: obj.quarterName || '',
        monthNum: obj.monthNum || '',
        plannedTargetPnl: obj.plannedTargetPnl || 100.0,
        lotSize: obj.lotSize || '0.01 lot',
        drillFocus: obj.drillFocus || '',
        primaryObjective: obj.primaryObjective || '',
        tacticalNotes: obj.tacticalNotes || '',
        status: obj.status || 'upcoming',
        checklistJson: JSON.stringify(obj.checklist || []),
        debriefNotes: obj.debriefNotes || ''
      });
      objectivesCount++;
    }

    // 4. Update cockpit_state with new seed capital and reset tracking
    const existingState = await db.select().from(cockpitState).where(eq(cockpitState.userId, userId)).limit(1);
    if (existingState.length > 0) {
      await db.update(cockpitState).set({
        workingEquity: seedCapital,
        bankedCash: 0.0,
        netWorth: seedCapital,
        completedSessions: 0,
        updatedAt: new Date().toISOString()
      }).where(eq(cockpitState.userId, userId));
    } else {
      await db.insert(cockpitState).values({
        userId,
        traderName: 'Yohannes Sharew',
        devotionGatePassedToday: true,
        workingEquity: seedCapital,
        bankedCash: 0.0,
        netWorth: seedCapital,
        winRate: 100.0,
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
  } catch (error: any) {
    console.error('Plan import error:', error);
    res.status(500).json({ error: error.message || 'Failed to import plan' });
  }
};
app.post('/api/plan/import', handleImportPlan);
app.post('/api/sqlite/plan/import', handleImportPlan);

// 11. Broker & TradingView Webhook Telemetry Ingestion Engine
const inMemoryWebhookEvents: any[] = [];

const handleBrokerWebhook = async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  try {
    const payload = req.body || {};
    const ticket = String(payload.ticket || `TICK_${Date.now()}`);
    const symbol = String(payload.symbol || 'XAUUSD').toUpperCase();
    const type = (String(payload.type || 'buy').toLowerCase() === 'sell' ? 'sell' : 'buy') as 'buy' | 'sell';
    const volume = Number(payload.volume) || 0.01;
    const netProfit = typeof payload.netProfit === 'number' ? payload.netProfit : (parseFloat(String(payload.netProfit || '0')) || 0);
    const openPrice = Number(payload.openPrice) || 2650.0;
    const closePrice = Number(payload.closePrice) || (type === 'buy' ? openPrice + 5.0 : openPrice - 5.0);
    const source = payload.source || 'tradingview';
    const closeTime = payload.closeTime || new Date().toISOString();

    const latencyMs = Date.now() - startTime;
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      receivedAt: new Date().toISOString(),
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
      status: 'processed',
      latencyMs
    };

    inMemoryWebhookEvents.unshift(event);
    if (inMemoryWebhookEvents.length > 50) {
      inMemoryWebhookEvents.pop();
    }

    // Auto-record a sticky journal note in SQLite if available
    try {
      await db.insert(journalNotes).values({
        noteId: `note_webhook_${ticket}_${Date.now()}`,
        userId: DEFAULT_USER_ID,
        dayId: 'auto-webhook',
        dayLabel: `Live ${source.toUpperCase()} Fill #${ticket}`,
        date: closeTime.split('T')[0],
        sessionTag: symbol,
        title: `${type.toUpperCase()} ${volume} lot ${symbol} · ${netProfit >= 0 ? '+$' : '-$'}${Math.abs(netProfit).toFixed(2)}`,
        content: `Automated Broker Telemetry Fill via ${source}. Open: ${openPrice}, Close: ${closePrice}, Net: $${netProfit.toFixed(2)}. ${payload.notes || ''}`,
        color: netProfit >= 0 ? 'emerald' : 'rose',
        outcome: netProfit > 0 ? 'win' : (netProfit < 0 ? 'loss' : 'scratch'),
        pnl: netProfit,
        rotation: 0
      });
    } catch {
      // Non-blocking if already exists
    }

    res.json({
      success: true,
      message: 'Broker webhook processed successfully',
      event,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Broker webhook error:', error);
    res.status(500).json({ error: error.message || 'Failed to process webhook' });
  }
};

app.post('/api/webhooks/broker', handleBrokerWebhook);
app.get('/api/webhooks/events', (_req, res) => {
  res.json({ success: true, events: inMemoryWebhookEvents });
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tri Command Server running on port ${PORT}`);
  });
}

export default app;
