import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MT5Trade, SupabaseConfig } from '../../types/mt5';
import {
  calculateMT5KPIs,
  detectOrderStacking,
  generateSampleMT5Trades,
  parseMT5Number,
  determineSessionWindow,
  calculateDurationMinutes
} from '../../utils/mt5Parser';
import {
  getStoredMT5Trades,
  saveStoredMT5Trades,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  fetchSupabaseMT5Trades,
  subscribeToSupabaseTrades,
  updateTradeTagsInSupabase
} from '../../services/supabaseMT5';
import { MT5DataIngestionBar } from './MT5DataIngestionBar';
import { MT5KpiGrid } from './MT5KpiGrid';
import { MT5TradingCalendar } from './MT5TradingCalendar';
import { MT5AnalyticsCharts } from './MT5AnalyticsCharts';
import { MT5TicketDrillDown } from './MT5TicketDrillDown';
import { MT5PythonBridgeModal } from './MT5PythonBridgeModal';
import { MT5SupabaseSettingsModal } from './MT5SupabaseSettingsModal';
import { MT5DailySessionModal } from './MT5DailySessionModal';
import { Activity, ShieldCheck, Sparkles, Layers } from 'lucide-react';

/**
 * Sanitize trade object to guarantee all required fields and prevent any NaN / undefined crashes
 */
function sanitizeTrade(t: any, index = 0): MT5Trade {
  const openTime = t.openTime || t.open_time || new Date().toISOString();
  const closeTime = t.closeTime || t.close_time || openTime;
  const netProfit = parseMT5Number(t.netProfit !== undefined ? t.netProfit : t.profit);
  const volume = parseMT5Number(t.volume !== undefined ? t.volume : t.lots) || 0.05;
  const openPrice = parseMT5Number(t.openPrice !== undefined ? t.openPrice : t.open_price) || 2650.0;
  const closePrice = parseMT5Number(t.closePrice !== undefined ? t.closePrice : t.close_price) || openPrice;
  const commission = parseMT5Number(t.commission);
  const swap = parseMT5Number(t.swap);

  return {
    ticket: String(t.ticket || t.ticket_id || t.id || `T-${Date.now()}-${index}`),
    openTime: String(openTime),
    closeTime: String(closeTime),
    symbol: String(t.symbol || 'XAUUSDm'),
    type: String(t.type || 'buy').toLowerCase().includes('sell') ? 'sell' : 'buy',
    volume: volume > 0 ? volume : 0.05,
    openPrice,
    closePrice,
    commission,
    swap,
    netProfit,
    setupCategory: t.setupCategory || t.setup_category || 'DALE 4H Expansion',
    mistakeTag: t.mistakeTag || t.mistake_tag || 'None (Clean)',
    notes: String(t.notes || ''),
    sessionWindow: t.sessionWindow || t.session_window || determineSessionWindow(openTime),
    durationMinutes: t.durationMinutes || calculateDurationMinutes(openTime, closeTime),
    isOrderStacked: Boolean(t.isOrderStacked),
    source: t.source || 'upload'
  };
}

export const LiveMT5JournalSection: React.FC = () => {
  // Trades state initialized from local cache or pre-populated sample
  const [trades, setTrades] = useState<MT5Trade[]>(() => {
    try {
      const cached = getStoredMT5Trades();
      if (Array.isArray(cached) && cached.length > 0) {
        return cached.map((t, idx) => sanitizeTrade(t, idx));
      }
    } catch (e) {
      console.warn('Failed loading cached MT5 trades:', e);
    }
    const sample = generateSampleMT5Trades();
    saveStoredMT5Trades(sample);
    return sample;
  });

  // Supabase Configuration state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => getStoredSupabaseConfig());
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(false);

  // Modals state
  const [isPythonBridgeOpen, setIsPythonBridgeOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);
  const [selectedDayModal, setSelectedDayModal] = useState<{
    isOpen: boolean;
    dateStr: string;
    trades: MT5Trade[];
  }>({
    isOpen: false,
    dateStr: '',
    trades: []
  });

  // Automatically detect order stacking and compute KPIs
  const { tradesWithStacking, kpis } = useMemo(() => {
    const { trades: stackedTrades } = detectOrderStacking(trades);
    const calculatedKpis = calculateMT5KPIs(stackedTrades);
    return {
      tradesWithStacking: stackedTrades,
      kpis: calculatedKpis
    };
  }, [trades]);

  // Handler: New trades loaded from dropzone or parser
  const handleTradesLoaded = useCallback((incomingTrades: MT5Trade[]) => {
    if (!incomingTrades || incomingTrades.length === 0) return;

    setTrades(prev => {
      const ticketMap = new Map<string, MT5Trade>();
      // Keep existing trades
      prev.forEach(t => ticketMap.set(t.ticket, t));
      // Upsert sanitized incoming trades
      incomingTrades.forEach((raw, idx) => {
        const clean = sanitizeTrade(raw, idx);
        if (ticketMap.has(clean.ticket)) {
          const existing = ticketMap.get(clean.ticket)!;
          ticketMap.set(clean.ticket, {
            ...clean,
            setupCategory: existing.setupCategory || clean.setupCategory,
            mistakeTag: existing.mistakeTag || clean.mistakeTag,
            notes: existing.notes || clean.notes
          });
        } else {
          ticketMap.set(clean.ticket, clean);
        }
      });

      const merged = Array.from(ticketMap.values());
      const { trades: stacked } = detectOrderStacking(merged);
      saveStoredMT5Trades(stacked);
      return stacked;
    });
  }, []);

  // Handler: Update trade tags (Setup, Mistake, Notes)
  const handleUpdateTrade = useCallback((ticket: string, updates: Partial<MT5Trade>) => {
    setTrades(prev => {
      const updated = prev.map(t => {
        if (t.ticket === ticket) {
          const newTrade = { ...t, ...updates };
          if (supabaseConnected) {
            updateTradeTagsInSupabase(newTrade, supabaseConfig).catch(() => {});
          }
          return newTrade;
        }
        return t;
      });
      saveStoredMT5Trades(updated);
      return updated;
    });
  }, [supabaseConnected, supabaseConfig]);

  // Handler: Clear all trades
  const handleClearTrades = useCallback(() => {
    if (window.confirm('Clear all MT5 trade tickets from your journal view?')) {
      setTrades([]);
      saveStoredMT5Trades([]);
    }
  }, []);

  // Handler: Load sample data
  const handleLoadSampleData = useCallback(() => {
    const sample = generateSampleMT5Trades();
    const { trades: stacked } = detectOrderStacking(sample);
    setTrades(stacked);
    saveStoredMT5Trades(stacked);
  }, []);

  // Fetch Supabase trades safely
  const refreshSupabaseTrades = useCallback(async () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey || !supabaseConfig.url.startsWith('http')) {
      setSupabaseConnected(false);
      return;
    }
    setIsLoadingSupabase(true);
    try {
      const res = await fetchSupabaseMT5Trades(supabaseConfig);
      setIsLoadingSupabase(false);

      if (res.success && res.trades.length > 0) {
        setSupabaseConnected(true);
        handleTradesLoaded(res.trades);
      } else if (res.success) {
        setSupabaseConnected(true);
      } else {
        setSupabaseConnected(false);
      }
    } catch (e) {
      setIsLoadingSupabase(false);
      setSupabaseConnected(false);
      console.warn('Supabase sync error:', e);
    }
  }, [supabaseConfig, handleTradesLoaded]);

  // Realtime Supabase Subscription
  useEffect(() => {
    if (
      !supabaseConfig.url ||
      !supabaseConfig.anonKey ||
      !supabaseConfig.url.startsWith('http') ||
      !supabaseConfig.autoSync
    ) {
      setSupabaseConnected(false);
      setIsRealtimeActive(false);
      return;
    }

    refreshSupabaseTrades();

    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = subscribeToSupabaseTrades(
        (newTrade: MT5Trade) => {
          handleTradesLoaded([newTrade]);
        },
        status => {
          setIsRealtimeActive(status === 'SUBSCRIBED');
        },
        supabaseConfig
      );
    } catch (err) {
      console.warn('Realtime subscription failed:', err);
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [supabaseConfig, refreshSupabaseTrades, handleTradesLoaded]);

  // Calendar day selected handler
  const handleSelectDay = (dateStr: string, dayTrades: MT5Trade[]) => {
    setSelectedDayModal({
      isOpen: true,
      dateStr,
      trades: dayTrades
    });
  };

  return (
    <section className="mb-12 animate-fadeIn" id="live-mt5-journal-suite">
      {/* Top Architectural Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0082ff] animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Transformer19 // Execution Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
              TradeZella Analytics v2.4
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Activity size={26} className="text-[#0082ff]" />
            <span>Live MT5 Journal & Analytics Suite</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Direct MetaTrader 5 statement ingestion and Supabase Realtime synchronization. Automated TradeZella-grade metrics, monthly calendar heatmap, Rule 05 streak forensics, and setup tagging.
          </p>
        </div>

        {/* Quick Badge Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 text-right min-w-[120px] shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Journal Win Rate</span>
            <span className="text-xl font-mono font-black text-[#0082ff]">
              {kpis.winRate ?? 0}%
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 text-right min-w-[130px] shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Net Realized P/L</span>
            <span
              className={`text-xl font-mono font-black ${
                (kpis.netProfit ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {(kpis.netProfit ?? 0) >= 0 ? '+' : ''}${(kpis.netProfit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Ingestion Control Bar (Dropzone + Supabase + Bridge) */}
      <MT5DataIngestionBar
        onTradesLoaded={handleTradesLoaded}
        onClearTrades={handleClearTrades}
        onLoadSampleData={handleLoadSampleData}
        onOpenPythonBridge={() => setIsPythonBridgeOpen(true)}
        onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
        tradeCount={trades.length}
        supabaseConnected={supabaseConnected}
        isRealtimeActive={isRealtimeActive}
        onRefreshSupabase={refreshSupabaseTrades}
        isLoading={isLoadingSupabase}
      />

      {/* 2. TradeZella-Grade Key Performance Indicators */}
      <MT5KpiGrid kpis={kpis} />

      {/* 3. Visual Trading Calendar Heatmap */}
      <MT5TradingCalendar
        trades={tradesWithStacking}
        onSelectDay={handleSelectDay}
      />

      {/* 4. Visual Diagnostics (Cumulative Equity Curve, Setups, Sessions) */}
      <MT5AnalyticsCharts trades={tradesWithStacking} />

      {/* 5. Closed Trades Drill-Down & Setup Journaling Table */}
      <MT5TicketDrillDown
        trades={tradesWithStacking}
        onUpdateTrade={handleUpdateTrade}
      />

      {/* Python MT5 Bridge Script Generator Modal */}
      <MT5PythonBridgeModal
        isOpen={isPythonBridgeOpen}
        onClose={() => setIsPythonBridgeOpen(false)}
        supabaseUrl={supabaseConfig.url}
      />

      {/* Supabase Realtime Configuration Modal */}
      <MT5SupabaseSettingsModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
        config={supabaseConfig}
        onConfigSaved={newCfg => {
          setSupabaseConfig(newCfg);
          saveSupabaseConfig(newCfg);
        }}
      />

      {/* Daily Calendar Session Inspect Modal */}
      <MT5DailySessionModal
        isOpen={selectedDayModal.isOpen}
        onClose={() => setSelectedDayModal(prev => ({ ...prev, isOpen: false }))}
        dateStr={selectedDayModal.dateStr}
        trades={selectedDayModal.trades}
      />
    </section>
  );
};
