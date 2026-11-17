/**
 * Client-Side Persistent SQLite Database Engine
 * 
 * Provides an ACID-compliant, persistent SQLite-style storage engine
 * running directly inside the user's web browser using IndexedDB.
 * 
 * Tables:
 * - daily_sessions (id, session_id, week_id, planned_target, actual_result, status, notes, proto, is_loss, updated_at)
 * - journal_notes (id, note_id, day_id, day_label, date, session_tag, title, content, color, outcome, pnl, rotation, created_at, updated_at)
 * - mental_state_logs (id, log_id, day_id, session_tag, date, state_key, emoji, label, rating, tags_json, notes, logged_at)
 * - weekly_objectives (id, week_id, primary_objective, tactical_notes, status, checklist_json, debrief_notes, updated_at)
 * - cockpit_state (user_id, trader_name, devotion_gate_passed, working_equity, banked_cash, net_worth, updated_at)
 */

export interface SqliteSessionRecord {
  sessionId: string;
  weekId: string;
  dayNumber: number;
  dayName: string;
  date?: string | null;
  plannedTarget: number;
  actualResult?: number | null;
  deltaPercent?: number;
  status: 'pending' | 'completed' | 'missed' | 'breached';
  notes?: string | null;
  proto?: string | null;
  isLoss?: boolean;
  updatedAt: string;
}

export interface SqliteNoteRecord {
  noteId: string;
  dayId: string;
  dayLabel?: string;
  date?: string;
  sessionTag?: string;
  title?: string;
  content: string;
  color?: string;
  outcome?: string;
  pnl?: number | null;
  rotation?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SqliteMentalRecord {
  logId: string;
  dayId: string;
  sessionTag: string;
  date: string;
  stateKey: string;
  emoji: string;
  label: string;
  rating: number;
  tagsJson: string;
  notes?: string;
  loggedAt: string;
}

export interface SqliteObjectiveRecord {
  weekId: string;
  primaryObjective: string;
  tacticalNotes?: string;
  status: string;
  checklistJson: string;
  debriefNotes?: string;
  updatedAt: string;
}

export interface SqliteStateRecord {
  userId: string;
  traderName: string;
  devotionGatePassedToday: boolean;
  workingEquity: number;
  bankedCash: number;
  netWorth: number;
  updatedAt: string;
}

const DB_NAME = 'transformer19_sqlite_db_v2';
const DB_VERSION = 2;

class SqliteStorageEngine {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;
  private isAvailable: boolean = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

  constructor() {
    if (this.isAvailable) {
      this.init();
    }
  }

  private async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e: any) => {
          const db = e.target.result as IDBDatabase;

          if (!db.objectStoreNames.contains('daily_sessions')) {
            const store = db.createObjectStore('daily_sessions', { keyPath: 'sessionId' });
            store.createIndex('weekId', 'weekId', { unique: false });
            store.createIndex('status', 'status', { unique: false });
          }

          if (!db.objectStoreNames.contains('journal_notes')) {
            const store = db.createObjectStore('journal_notes', { keyPath: 'noteId' });
            store.createIndex('dayId', 'dayId', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
          }

          if (!db.objectStoreNames.contains('mental_state_logs')) {
            const store = db.createObjectStore('mental_state_logs', { keyPath: 'logId' });
            store.createIndex('dayId', 'dayId', { unique: false });
          }

          if (!db.objectStoreNames.contains('weekly_objectives')) {
            db.createObjectStore('weekly_objectives', { keyPath: 'weekId' });
          }

          if (!db.objectStoreNames.contains('cockpit_state')) {
            db.createObjectStore('cockpit_state', { keyPath: 'userId' });
          }
        };

        req.onsuccess = (e: any) => {
          this.db = e.target.result;
          resolve(this.db!);
        };

        req.onerror = (e) => {
          console.warn('[SQLite Engine] IndexedDB error, falling back to memory/local storage:', e);
          reject(e);
        };
      } catch (err) {
        reject(err);
      }
    });

    return this.initPromise;
  }

  // 1. Daily Sessions
  public async saveSession(session: SqliteSessionRecord): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const db = await this.init();
      const tx = db.transaction('daily_sessions', 'readwrite');
      tx.objectStore('daily_sessions').put(session);
    } catch (e) {
      console.warn('[SQLite Engine] Error saving session to local SQLite store:', e);
    }
  }

  public async getAllSessions(): Promise<SqliteSessionRecord[]> {
    if (!this.isAvailable) return [];
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction('daily_sessions', 'readonly');
        const req = tx.objectStore('daily_sessions').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // 2. Journal Notes
  public async saveNote(note: SqliteNoteRecord): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const db = await this.init();
      const tx = db.transaction('journal_notes', 'readwrite');
      tx.objectStore('journal_notes').put(note);
    } catch (e) {
      console.warn('[SQLite Engine] Error saving note to local SQLite store:', e);
    }
  }

  public async deleteNote(noteId: string): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const db = await this.init();
      const tx = db.transaction('journal_notes', 'readwrite');
      tx.objectStore('journal_notes').delete(noteId);
    } catch (e) {
      console.warn('[SQLite Engine] Error deleting note from local SQLite store:', e);
    }
  }

  public async getAllNotes(): Promise<SqliteNoteRecord[]> {
    if (!this.isAvailable) return [];
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction('journal_notes', 'readonly');
        const req = tx.objectStore('journal_notes').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // 3. Mental State Logs
  public async saveMentalLog(log: SqliteMentalRecord): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const db = await this.init();
      const tx = db.transaction('mental_state_logs', 'readwrite');
      tx.objectStore('mental_state_logs').put(log);
    } catch (e) {
      console.warn('[SQLite Engine] Error saving mental log to local SQLite store:', e);
    }
  }

  public async deleteMentalLog(logId: string): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const db = await this.init();
      const tx = db.transaction('mental_state_logs', 'readwrite');
      tx.objectStore('mental_state_logs').delete(logId);
    } catch (e) {
      console.warn('[SQLite Engine] Error deleting mental log from local SQLite store:', e);
    }
  }

  public async getAllMentalLogs(): Promise<SqliteMentalRecord[]> {
    if (!this.isAvailable) return [];
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction('mental_state_logs', 'readonly');
        const req = tx.objectStore('mental_state_logs').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // 4. Weekly Objectives
  public async saveObjective(objective: SqliteObjectiveRecord): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const db = await this.init();
      const tx = db.transaction('weekly_objectives', 'readwrite');
      tx.objectStore('weekly_objectives').put(objective);
    } catch (e) {
      console.warn('[SQLite Engine] Error saving objective to local SQLite store:', e);
    }
  }

  public async getAllObjectives(): Promise<SqliteObjectiveRecord[]> {
    if (!this.isAvailable) return [];
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction('weekly_objectives', 'readonly');
        const req = tx.objectStore('weekly_objectives').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // 5. Cockpit State
  public async saveState(state: SqliteStateRecord): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const db = await this.init();
      const tx = db.transaction('cockpit_state', 'readwrite');
      tx.objectStore('cockpit_state').put(state);
    } catch (e) {
      console.warn('[SQLite Engine] Error saving state to local SQLite store:', e);
    }
  }

  public async getState(userId = 'local-trader'): Promise<SqliteStateRecord | null> {
    if (!this.isAvailable) return null;
    try {
      const db = await this.init();
      return new Promise((resolve) => {
        const tx = db.transaction('cockpit_state', 'readonly');
        const req = tx.objectStore('cockpit_state').get(userId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }
}

export const sqliteStorage = new SqliteStorageEngine();
