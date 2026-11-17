import { doc, getDoc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { firestoreDb } from '../firebase';
import { PortfolioAccount, DailyJournalNote, MentalStateKey, DayStatus } from '../types';
import { WeeklyExecutionObjective } from '../data/defaultObjectives';

export interface CloudSyncTelemetry {
  isConnected: boolean;
  lastSyncedAt: string | null;
  pendingSync: boolean;
  syncSource: 'cloud' | 'local';
}

export interface FirestoreSyncCallbacks {
  onAccountsUpdated: (accounts: PortfolioAccount[], activeAccountId?: string) => void;
  onActiveAccountUpdated: (activeAccountId: string) => void;
  onProfileUpdated: (profile: { traderName?: string; devotionGatePassedToday?: boolean }) => void;
  onJournalNotesUpdated: (notes: DailyJournalNote[]) => void;
  onObjectivesUpdated: (objectives: WeeklyExecutionObjective[]) => void;
  onMentalLogsUpdated: (logs: any[]) => void;
  onSessionsUpdated: (sessionsMap: Record<string, { actualPnl?: number; status?: DayStatus; notes?: string; isLoss?: boolean; date?: string; proto?: string }>) => void;
  onSyncStatusChanged: (status: CloudSyncTelemetry) => void;
}

const PROFILE_DOC_ID = 'profile_default';

class FirestoreCloudSyncService {
  private isConnected: boolean = false;
  private lastSyncedAt: string | null = null;
  private unsubscribeProfile: (() => void) | null = null;
  private isPushingToCloud: boolean = false;

  /**
   * Initialize real-time cross-device two-way listener
   */
  public initRealtimeSync(callbacks: FirestoreSyncCallbacks): () => void {
    try {
      const profileRef = doc(firestoreDb, 'trader_profile', PROFILE_DOC_ID);

      this.unsubscribeProfile = onSnapshot(
        profileRef,
        snapshot => {
          this.isConnected = true;
          this.lastSyncedAt = new Date().toLocaleTimeString();

          callbacks.onSyncStatusChanged({
            isConnected: true,
            lastSyncedAt: this.lastSyncedAt,
            pendingSync: false,
            syncSource: 'cloud'
          });

          if (!snapshot.exists()) {
            return;
          }

          const data = snapshot.data();
          if (!data) return;

          // 1. Sync Portfolio Accounts across all devices
          if (data.accountsJson && typeof data.accountsJson === 'string') {
            try {
              const remoteAccounts: PortfolioAccount[] = JSON.parse(data.accountsJson);
              if (Array.isArray(remoteAccounts) && remoteAccounts.length > 0) {
                callbacks.onAccountsUpdated(remoteAccounts, data.activeAccountId);
              }
            } catch (err) {
              console.warn('[FirestoreSync] Failed parsing remote accountsJson:', err);
            }
          } else if (data.activeAccountId && typeof data.activeAccountId === 'string') {
            callbacks.onActiveAccountUpdated(data.activeAccountId);
          }

          // 2. Sync Trader Profile & Devotion Gate
          if (data.traderName || data.devotionGatePassedToday !== undefined) {
            callbacks.onProfileUpdated({
              traderName: data.traderName,
              devotionGatePassedToday: data.devotionGatePassedToday
            });
          }

          // 3. Sync Daily Journal Notes
          if (data.notesJson && typeof data.notesJson === 'string') {
            try {
              const remoteNotes: DailyJournalNote[] = JSON.parse(data.notesJson);
              if (Array.isArray(remoteNotes)) {
                callbacks.onJournalNotesUpdated(remoteNotes);
              }
            } catch (err) {
              console.warn('[FirestoreSync] Failed parsing remote notesJson:', err);
            }
          }

          // 4. Sync Weekly Execution Objectives & Checklists
          if (data.objectivesJson && typeof data.objectivesJson === 'string') {
            try {
              const remoteObjectives: WeeklyExecutionObjective[] = JSON.parse(data.objectivesJson);
              if (Array.isArray(remoteObjectives)) {
                callbacks.onObjectivesUpdated(remoteObjectives);
              }
            } catch (err) {
              console.warn('[FirestoreSync] Failed parsing remote objectivesJson:', err);
            }
          }

          // 5. Sync Mental State Logs
          if (data.mentalLogsJson && typeof data.mentalLogsJson === 'string') {
            try {
              const remoteMentalLogs = JSON.parse(data.mentalLogsJson);
              if (Array.isArray(remoteMentalLogs)) {
                callbacks.onMentalLogsUpdated(remoteMentalLogs);
              }
            } catch (err) {
              console.warn('[FirestoreSync] Failed parsing remote mentalLogsJson:', err);
            }
          }

          // 6. Sync Session Results & Statuses
          if (data.sessionsJson && typeof data.sessionsJson === 'string') {
            try {
              const sessionsMap = JSON.parse(data.sessionsJson);
              if (sessionsMap && typeof sessionsMap === 'object') {
                callbacks.onSessionsUpdated(sessionsMap);
              }
            } catch (err) {
              console.warn('[FirestoreSync] Failed parsing remote sessionsJson:', err);
            }
          }
        },
        error => {
          console.warn('[FirestoreSync] Realtime snapshot subscription warning:', error);
          this.isConnected = false;
          callbacks.onSyncStatusChanged({
            isConnected: false,
            lastSyncedAt: this.lastSyncedAt,
            pendingSync: false,
            syncSource: 'local'
          });
        }
      );

      return () => {
        if (this.unsubscribeProfile) {
          this.unsubscribeProfile();
          this.unsubscribeProfile = null;
        }
      };
    } catch (e) {
      console.error('[FirestoreSync] Failed initializing realtime sync:', e);
      return () => {};
    }
  }

  /**
   * Save accounts list and active account ID to Cloud Firestore
   */
  public async syncAccounts(accounts: PortfolioAccount[], activeAccountId?: string): Promise<boolean> {
    if (this.isPushingToCloud) return true;
    try {
      this.isPushingToCloud = true;
      const profileRef = doc(firestoreDb, 'trader_profile', PROFILE_DOC_ID);
      const payload: Record<string, any> = {
        accountsJson: JSON.stringify(accounts),
        lastSyncedAt: new Date().toISOString()
      };
      if (activeAccountId) {
        payload.activeAccountId = activeAccountId;
      }
      // Guarantee required schema fields for firestore.rules
      payload.traderName = 'Yohannes Sharew';
      payload.seedCapital = 50;
      payload.devotionGatePassedToday = true;

      await setDoc(profileRef, payload, { merge: true });
      return true;
    } catch (e) {
      console.error('[FirestoreSync] Failed to sync accounts to cloud:', e);
      return false;
    } finally {
      this.isPushingToCloud = false;
    }
  }

  /**
   * Sync active account selection to Cloud Firestore
   */
  public async syncActiveAccount(activeAccountId: string): Promise<boolean> {
    try {
      const profileRef = doc(firestoreDb, 'trader_profile', PROFILE_DOC_ID);
      await setDoc(
        profileRef,
        {
          activeAccountId,
          lastSyncedAt: new Date().toISOString(),
          traderName: 'Yohannes Sharew',
          seedCapital: 50,
          devotionGatePassedToday: true
        },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.error('[FirestoreSync] Failed to sync active account ID:', e);
      return false;
    }
  }

  /**
   * Sync single daily session to both daily_sessions collection and profile sessionsJson
   */
  public async syncSession(sessionId: string, sessionData: any, fullSessionsMap?: Record<string, any>): Promise<boolean> {
    try {
      // 1. Write to daily_sessions collection
      const sessionRef = doc(firestoreDb, 'daily_sessions', sessionId);
      const actualVal = sessionData.actualPnl !== undefined ? sessionData.actualPnl : sessionData.actualResult;
      const cleanPayload: Record<string, any> = {
        id: sessionId,
        weekId: sessionData.weekId || sessionId.split('-')[0] || 'w01',
        dayName: sessionData.dayName || 'Trading Day',
        protocol: sessionData.protocol || sessionData.proto || 'Standard Protocol',
        status: sessionData.status || 'pending',
      };
      if (actualVal !== undefined && actualVal !== null && !isNaN(Number(actualVal))) {
        cleanPayload.actualPnl = Number(actualVal);
      }
      if (sessionData.notes) {
        cleanPayload.notes = String(sessionData.notes);
      }
      if (sessionData.date) {
        cleanPayload.date = String(sessionData.date);
      }
      await setDoc(sessionRef, cleanPayload, { merge: true });

      // 2. Also update profile sessionsJson if map is provided
      if (fullSessionsMap) {
        await this.syncSessionsMap(fullSessionsMap);
      }
      return true;
    } catch (e) {
      console.error('[FirestoreSync] Failed to sync session to cloud:', e);
      return false;
    }
  }

  /**
   * Sync full sessions map to trader_profile sessionsJson so all devices immediately receive updates
   */
  public async syncSessionsMap(sessionsMap: Record<string, any>): Promise<boolean> {
    try {
      const profileRef = doc(firestoreDb, 'trader_profile', PROFILE_DOC_ID);
      await setDoc(
        profileRef,
        {
          sessionsJson: JSON.stringify(sessionsMap),
          lastSyncedAt: new Date().toISOString(),
          traderName: 'Yohannes Sharew',
          seedCapital: 50,
          devotionGatePassedToday: true
        },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.error('[FirestoreSync] Failed to sync sessionsMap to cloud:', e);
      return false;
    }
  }

  /**
   * Sync journal notes list to Cloud Firestore
   */
  public async syncJournalNotes(notes: DailyJournalNote[]): Promise<boolean> {
    try {
      const profileRef = doc(firestoreDb, 'trader_profile', PROFILE_DOC_ID);
      await setDoc(
        profileRef,
        {
          notesJson: JSON.stringify(notes),
          lastSyncedAt: new Date().toISOString(),
          traderName: 'Yohannes Sharew',
          seedCapital: 50,
          devotionGatePassedToday: true
        },
        { merge: true }
      );

      // Also sync latest note into daily_journal_notes collection for standalone queries
      if (notes.length > 0) {
        const latest = notes[0];
        const noteRef = doc(firestoreDb, 'daily_journal_notes', latest.id);
        await setDoc(
          noteRef,
          {
            id: latest.id,
            dayId: latest.dayId || 'general',
            content: latest.content || '',
            createdAt: latest.createdAt || new Date().toISOString(),
            dayLabel: latest.dayLabel || '',
            date: latest.date || '',
            title: latest.title || '',
            sessionTag: latest.sessionTag || '',
            color: latest.color || 'yellow',
            outcome: latest.outcome || 'executed',
            pnl: latest.pnl !== undefined ? Number(latest.pnl) : 0,
            rotation: latest.rotation || 0
          },
          { merge: true }
        );
      }

      return true;
    } catch (e) {
      console.error('[FirestoreSync] Failed to sync journal notes to cloud:', e);
      return false;
    }
  }

  /**
   * Delete journal note from Cloud Firestore
   */
  public async deleteJournalNote(noteId: string, remainingNotes: DailyJournalNote[]): Promise<boolean> {
    try {
      // 1. Delete document from daily_journal_notes collection
      const noteRef = doc(firestoreDb, 'daily_journal_notes', noteId);
      await deleteDoc(noteRef);

      // 2. Update remaining notes in profile
      const profileRef = doc(firestoreDb, 'trader_profile', PROFILE_DOC_ID);
      await setDoc(
        profileRef,
        {
          notesJson: JSON.stringify(remainingNotes),
          lastSyncedAt: new Date().toISOString(),
          traderName: 'Yohannes Sharew',
          seedCapital: 50,
          devotionGatePassedToday: true
        },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.error('[FirestoreSync] Failed to delete note from cloud:', e);
      return false;
    }
  }

  /**
   * Sync weekly objectives list to Cloud Firestore
   */
  public async syncWeeklyObjectives(objectives: WeeklyExecutionObjective[]): Promise<boolean> {
    try {
      const profileRef = doc(firestoreDb, 'trader_profile', PROFILE_DOC_ID);
      await setDoc(
        profileRef,
        {
          objectivesJson: JSON.stringify(objectives),
          lastSyncedAt: new Date().toISOString(),
          traderName: 'Yohannes Sharew',
          seedCapital: 50,
          devotionGatePassedToday: true
        },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.error('[FirestoreSync] Failed to sync weekly objectives:', e);
      return false;
    }
  }

  /**
   * Sync mental state logs to Cloud Firestore
   */
  public async syncMentalLogs(logs: any[]): Promise<boolean> {
    try {
      const profileRef = doc(firestoreDb, 'trader_profile', PROFILE_DOC_ID);
      await setDoc(
        profileRef,
        {
          mentalLogsJson: JSON.stringify(logs),
          lastSyncedAt: new Date().toISOString(),
          traderName: 'Yohannes Sharew',
          seedCapital: 50,
          devotionGatePassedToday: true
        },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.error('[FirestoreSync] Failed to sync mental logs:', e);
      return false;
    }
  }

  /**
   * Sync trader profile and devotion gate status to Cloud Firestore
   */
  public async syncProfile(data: { traderName?: string; devotionGatePassedToday?: boolean; seedCapital?: number }): Promise<boolean> {
    try {
      const profileRef = doc(firestoreDb, 'trader_profile', PROFILE_DOC_ID);
      await setDoc(
        profileRef,
        {
          traderName: data.traderName || 'Yohannes Sharew',
          seedCapital: data.seedCapital !== undefined ? data.seedCapital : 50,
          devotionGatePassedToday: Boolean(data.devotionGatePassedToday),
          lastSyncedAt: new Date().toISOString()
        },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.error('[FirestoreSync] Failed to sync trader profile:', e);
      return false;
    }
  }

  /**
   * Pull complete latest data from Cloud Firestore on demand
   */
  public async pullLatestSnapshot(): Promise<any | null> {
    try {
      const profileRef = doc(firestoreDb, 'trader_profile', PROFILE_DOC_ID);
      const snap = await getDoc(profileRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e) {
      console.error('[FirestoreSync] Failed to pull latest snapshot:', e);
      return null;
    }
  }
}

export const firestoreCloudSync = new FirestoreCloudSyncService();
