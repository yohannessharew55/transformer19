import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MT5Trade, SupabaseConfig } from '../types/mt5';
import { determineSessionWindow, calculateDurationMinutes } from '../utils/mt5Parser';

export const SUPABASE_CONFIG_STORAGE_KEY = 'transformer19_supabase_config_v1';
export const MT5_TRADES_STORAGE_KEY = 'transformer19_mt5_trades_v1';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load stored Supabase config:', e);
  }
  return {
    url: '',
    anonKey: '',
    tableName: 'mt5_live_trades',
    autoSync: true
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Supabase config:', e);
  }
}

export function getStoredMT5Trades(): MT5Trade[] {
  try {
    const raw = localStorage.getItem(MT5_TRADES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load stored MT5 trades:', e);
  }
  return [];
}

export function saveStoredMT5Trades(trades: MT5Trade[]): void {
  try {
    localStorage.setItem(MT5_TRADES_STORAGE_KEY, JSON.stringify(trades));
  } catch (e) {
    console.error('Failed to save MT5 trades to storage:', e);
  }
}

let supabaseInstance: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const cfg = config || getStoredSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) return null;

  if (supabaseInstance && currentUrl === cfg.url && currentKey === cfg.anonKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: false
      }
    });
    currentUrl = cfg.url;
    currentKey = cfg.anonKey;
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Map raw database row from Supabase mt5_live_trades to MT5Trade
 */
export function mapSupabaseRowToTrade(row: any): MT5Trade {
  const openTime = row.open_time || row.openTime || new Date().toISOString();
  const closeTime = row.close_time || row.closeTime || openTime;

  return {
    ticket: String(row.ticket || row.ticket_id || row.id || `T-${Date.now()}`),
    openTime,
    closeTime,
    symbol: row.symbol || 'XAUUSDm',
    type: (row.type || 'buy').toLowerCase().includes('sell') ? 'sell' : 'buy',
    volume: Number(row.volume || row.lots || 0.05),
    openPrice: Number(row.open_price || row.openPrice || 0),
    closePrice: Number(row.close_price || row.closePrice || 0),
    commission: Number(row.commission || 0),
    swap: Number(row.swap || 0),
    netProfit: Number(row.net_profit !== undefined ? row.net_profit : row.profit || 0),
    setupCategory: row.setup_category || row.setupCategory || 'DALE 4H Expansion',
    mistakeTag: row.mistake_tag || row.mistakeTag || 'None (Clean)',
    notes: row.notes || '',
    sessionWindow: row.session_window || determineSessionWindow(openTime),
    durationMinutes: calculateDurationMinutes(openTime, closeTime),
    source: 'supabase'
  };
}

/**
 * Fetch trades from Supabase table
 */
export async function fetchSupabaseMT5Trades(config?: SupabaseConfig): Promise<{ success: boolean; trades: MT5Trade[]; error?: string }> {
  const client = getSupabaseClient(config);
  const cfg = config || getStoredSupabaseConfig();

  if (!client) {
    return { success: false, trades: [], error: 'Supabase URL and Anon Key are required.' };
  }

  try {
    const { data, error } = await client
      .from(cfg.tableName || 'mt5_live_trades')
      .select('*')
      .order('close_time', { ascending: false });

    if (error) {
      return { success: false, trades: [], error: error.message };
    }

    const mapped = (data || []).map(mapSupabaseRowToTrade);
    return { success: true, trades: mapped };
  } catch (err: any) {
    return { success: false, trades: [], error: err.message || 'Failed connecting to Supabase' };
  }
}

/**
 * Subscribe to realtime trades from Supabase
 */
export function subscribeToSupabaseTrades(
  onNewTrade: (trade: MT5Trade) => void,
  onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void,
  config?: SupabaseConfig
) {
  const client = getSupabaseClient(config);
  const cfg = config || getStoredSupabaseConfig();

  if (!client) return () => {};

  const channelName = `mt5-realtime-${Date.now()}`;
  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: cfg.tableName || 'mt5_live_trades'
      },
      payload => {
        if (payload.new) {
          const newTrade = mapSupabaseRowToTrade(payload.new);
          onNewTrade(newTrade);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: cfg.tableName || 'mt5_live_trades'
      },
      payload => {
        if (payload.new) {
          const updatedTrade = mapSupabaseRowToTrade(payload.new);
          onNewTrade(updatedTrade);
        }
      }
    )
    .subscribe(status => {
      if (onStatusChange) {
        onStatusChange(status as any);
      }
    });

  return () => {
    client.removeChannel(channel);
  };
}

/**
 * Save updated tags (setupCategory, mistakeTag, notes) for a ticket
 */
export async function updateTradeTagsInSupabase(
  trade: MT5Trade,
  config?: SupabaseConfig
): Promise<boolean> {
  const client = getSupabaseClient(config);
  const cfg = config || getStoredSupabaseConfig();

  if (!client) return false;

  try {
    const { error } = await client
      .from(cfg.tableName || 'mt5_live_trades')
      .update({
        setup_category: trade.setupCategory,
        mistake_tag: trade.mistakeTag,
        notes: trade.notes
      })
      .eq('ticket', trade.ticket);

    return !error;
  } catch (err) {
    console.warn('Could not update trade tags in Supabase:', err);
    return false;
  }
}
