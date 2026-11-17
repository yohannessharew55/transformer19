/**
 * Cloud Synchronization & Offline-First Engine
 * 
 * Provides robust offline-first caching and automatic two-way synchronization
 * between the local Windows desktop environment (or local offline browser)
 * and the production website server (https://transformer19.vercel.app).
 */

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'offline' | 'error';

export interface PendingMutation {
  id: string;
  type: 'session' | 'journal' | 'delete_journal' | 'state' | 'mental' | 'delete_mental' | 'objective';
  data: any;
  timestamp: string;
}

export interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
  cloudUrl: string;
  isOnline: boolean;
  lastError?: string;
}

const STORAGE_KEYS = {
  QUEUE: 'transformer19_offline_sync_queue_v2',
  LAST_SYNC: 'transformer19_last_cloud_sync_time_v2',
  CLOUD_URL: 'transformer19_cloud_url_v2',
};

export const DEFAULT_CLOUD_URL = 'https://transformer19.vercel.app';

class CloudSyncManager {
  private queue: PendingMutation[] = [];
  private status: SyncStatus = 'synced';
  private lastSyncedAt: string | null = null;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<(state: SyncState) => void> = new Set();
  private autoSyncInterval: any = null;
  private isFlushing: boolean = false;

  constructor() {
    this.loadState();
    this.initNetworkListeners();
  }

  public getCloudUrl(): string {
    if (typeof window === 'undefined') return DEFAULT_CLOUD_URL;
    try {
      if (window.location.hostname.includes('vercel.app')) {
        return window.location.origin;
      }
      return localStorage.getItem(STORAGE_KEYS.CLOUD_URL) || DEFAULT_CLOUD_URL;
    } catch {
      return DEFAULT_CLOUD_URL;
    }
  }

  public setCloudUrl(url: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLOUD_URL, url.trim().replace(/\/$/, ''));
      this.notify();
    } catch {
      // ignore
    }
  }

  public getState(): SyncState {
    return {
      status: this.status,
      pendingCount: this.queue.length,
      lastSyncedAt: this.lastSyncedAt,
      cloudUrl: this.getCloudUrl(),
      isOnline: this.isOnline,
    };
  }

  public subscribe(callback: (state: SyncState) => void): () => void {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach(cb => {
      try {
        cb(state);
      } catch (err) {
        console.error('Sync subscriber callback error:', err);
      }
    });
  }

  private loadState(): void {
    if (typeof window === 'undefined') return;
    try {
      const storedQueue = localStorage.getItem(STORAGE_KEYS.QUEUE);
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue);
      }
      this.lastSyncedAt = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      this.status = this.queue.length > 0 ? 'pending' : 'synced';
    } catch (e) {
      console.warn('Failed to load offline sync queue:', e);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to save offline sync queue:', e);
    }
  }

  private initNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[CloudSync] Network connectivity detected. Initiating upload flush...');
      this.isOnline = true;
      this.checkCloudHealthAndFlush();
    });

    window.addEventListener('offline', () => {
      console.log('[CloudSync] Device is offline. All modifications will safely queue locally.');
      this.isOnline = false;
      this.status = this.queue.length > 0 ? 'offline' : 'offline';
      this.notify();
    });

    // Run auto-sync loop every 30 seconds
    if (!this.autoSyncInterval) {
      this.autoSyncInterval = setInterval(() => {
        if (this.queue.length > 0 && this.isOnline) {
          this.flushOfflineQueue();
        }
      }, 30000);
    }

    // Initial check on load
    setTimeout(() => {
      this.checkCloudHealthAndFlush();
    }, 2500);
  }

  public async checkCloudHealth(): Promise<boolean> {
    try {
      const url = `${this.getCloudUrl()}/api/db/health`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      this.isOnline = res.ok;
      return res.ok;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  private async checkCloudHealthAndFlush(): Promise<void> {
    const isHealthy = await this.checkCloudHealth();
    if (isHealthy && this.queue.length > 0) {
      await this.flushOfflineQueue();
    } else {
      this.status = this.isOnline ? (this.queue.length > 0 ? 'pending' : 'synced') : 'offline';
      this.notify();
    }
  }

  /**
   * Enqueues a change made by the user.
   * If online, immediately triggers a background upload to the website server.
   */
  public enqueueMutation(type: PendingMutation['type'], data: any): void {
    const id = data?.id || data?.sessionId || data?.weekId || data?.userId || `${type}_${Date.now()}`;

    // Remove older duplicate mutation for same item ID to avoid duplicate writes
    this.queue = this.queue.filter(m => !(m.type === type && (m.data?.id === id || m.data?.sessionId === id || m.data?.weekId === id)));

    this.queue.push({
      id: String(id),
      type,
      data,
      timestamp: new Date().toISOString()
    });

    this.saveQueue();
    this.status = this.isOnline ? 'pending' : 'offline';
    this.notify();

    // Trigger immediate upload if currently online
    if (this.isOnline) {
      this.flushOfflineQueue();
    }
  }

  /**
   * Uploads all pending local changes to the website cloud server.
   */
  public async flushOfflineQueue(): Promise<{ success: boolean; syncedCount?: number; error?: string }> {
    if (this.isFlushing || this.queue.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    this.isFlushing = true;
    this.status = 'syncing';
    this.notify();

    try {
      const cloudUrl = this.getCloudUrl();
      const batchPayload: {
        sessions: any[];
        notes: any[];
        deletedNoteIds: string[];
        mentalLogs: any[];
        deletedMentalIds: string[];
        objectives: any[];
        state: any | null;
        clientSource: string;
      } = {
        sessions: [],
        notes: [],
        deletedNoteIds: [],
        mentalLogs: [],
        deletedMentalIds: [],
        objectives: [],
        state: null,
        clientSource: 'desktop-sync-agent'
      };

      for (const item of this.queue) {
        if (item.type === 'session') batchPayload.sessions.push(item.data);
        else if (item.type === 'journal') batchPayload.notes.push(item.data);
        else if (item.type === 'delete_journal') batchPayload.deletedNoteIds.push(item.id);
        else if (item.type === 'mental') batchPayload.mentalLogs.push(item.data);
        else if (item.type === 'delete_mental') batchPayload.deletedMentalIds.push(item.id);
        else if (item.type === 'objective') batchPayload.objectives.push(item.data);
        else if (item.type === 'state') batchPayload.state = item.data;
      }

      console.log(`[CloudSync] Uploading ${this.queue.length} pending mutations to website server at ${cloudUrl}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`${cloudUrl}/api/cloud/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(batchPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Cloud server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const result = await res.json();
      const flushedCount = this.queue.length;

      // Clear the queue on success
      this.queue = [];
      this.saveQueue();
      this.lastSyncedAt = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, this.lastSyncedAt);
      }

      this.status = 'synced';
      this.isOnline = true;
      this.notify();

      console.log(`[CloudSync] Successfully uploaded ${flushedCount} items to cloud server:`, result);
      return { success: true, syncedCount: flushedCount };
    } catch (err: any) {
      console.warn('[CloudSync] Upload failed. Modifications remain safe locally in offline queue:', err.message);
      this.status = 'offline';
      this.isOnline = false;
      this.notify();
      return { success: false, error: err.message };
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Pulls the latest full dataset from the cloud website server.
   */
  public async pullFromCloud(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      this.status = 'syncing';
      this.notify();

      const cloudUrl = this.getCloudUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${cloudUrl}/api/cloud/sync`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      this.lastSyncedAt = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, this.lastSyncedAt);
      }
      this.status = this.queue.length > 0 ? 'pending' : 'synced';
      this.isOnline = true;
      this.notify();

      return { success: true, data };
    } catch (err: any) {
      this.status = 'error';
      this.notify();
      return { success: false, error: err.message };
    }
  }

  /**
   * Full two-way sync:
   * 1. Pushes any pending desktop changes up to the website server.
   * 2. Pulls remote changes down from the website server.
   */
  public async fullTwoWaySync(): Promise<{ success: boolean; pushedCount?: number; pulledData?: any; error?: string }> {
    // 1. Flush outbound changes
    let pushed = 0;
    if (this.queue.length > 0) {
      const flushRes = await this.flushOfflineQueue();
      if (flushRes.success) {
        pushed = flushRes.syncedCount || 0;
      }
    }

    // 2. Pull inbound data
    const pullRes = await this.pullFromCloud();
    if (!pullRes.success) {
      return { success: false, pushedCount: pushed, error: pullRes.error };
    }

    return {
      success: true,
      pushedCount: pushed,
      pulledData: pullRes.data
    };
  }
}

export const cloudSync = new CloudSyncManager();
