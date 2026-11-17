import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Database,
  Radio,
  Code2,
  Sparkles,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { parseMT5File } from '../../utils/mt5Parser';
import { MT5Trade } from '../../types/mt5';

interface MT5DataIngestionBarProps {
  onTradesLoaded: (trades: MT5Trade[]) => void;
  onClearTrades: () => void;
  onLoadSampleData: () => void;
  onOpenPythonBridge: () => void;
  onOpenSupabaseConfig: () => void;
  tradeCount: number;
  supabaseConnected: boolean;
  isRealtimeActive: boolean;
  onRefreshSupabase: () => void;
  isLoading: boolean;
}

export const MT5DataIngestionBar: React.FC<MT5DataIngestionBarProps> = ({
  onTradesLoaded,
  onClearTrades,
  onLoadSampleData,
  onOpenPythonBridge,
  onOpenSupabaseConfig,
  tradeCount,
  supabaseConnected,
  isRealtimeActive,
  onRefreshSupabase,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [lastUploadedName, setLastUploadedName] = useState<string | null>(null);

  const handleFileProcess = async (file: File) => {
    setParseError(null);
    try {
      const parsed = await parseMT5File(file);
      if (parsed.length === 0) {
        setParseError('No closed trade tickets found in this file. Ensure it is an MT5 Account History report.');
        return;
      }
      setLastUploadedName(file.name);
      onTradesLoaded(parsed);
    } catch (err: any) {
      setParseError(`Parse failed: ${err.message || 'Corrupt or unsupported statement format'}`);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Top Banner Row: Ingestion Dropzone & Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Method A: Drag & Drop Zone (7 cols on desktop) */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`lg:col-span-7 rounded-2xl p-4 sm:p-5 border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 select-none ${
            isDragging
              ? 'border-[#0082ff] bg-[#0082ff]/10 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700/80 bg-white/70 dark:bg-[#121927]/70 hover:border-[#0082ff]/60 hover:bg-[#0082ff]/5'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileProcess(e.target.files[0]);
              }
            }}
            accept=".html,.htm,.csv,.txt"
            className="hidden"
          />

          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#0082ff]/15 dark:bg-[#0082ff]/20 text-[#0082ff] flex items-center justify-center shrink-0 shadow-xs">
              <UploadCloud size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Drop MT5 Statement Report
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  .HTML / .CSV
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically extracts tickets, lots, prices, commissions, swaps, and realized net P/L
              </p>
              {lastUploadedName && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  <CheckCircle2 size={12} />
                  <span>Parsed: {lastUploadedName}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-[#0082ff] hover:bg-[#006bd6] text-xs font-bold font-mono shrink-0 transition-colors shadow-xs"
          >
            Browse Files
          </button>
        </div>

        {/* Method B: Supabase Realtime Sync & Bridge Utilities (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Database size={16} className={supabaseConnected ? 'text-emerald-500' : 'text-slate-400'} />
                {isRealtimeActive && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                Method B: Supabase Realtime
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${
                  supabaseConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Radio size={10} className={supabaseConnected ? 'animate-pulse' : ''} />
                <span>{supabaseConnected ? (isRealtimeActive ? 'Live Realtime' : 'Connected') : 'Offline'}</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            Stream live tickets from local MT5 via Python EA bridge directly into TradeZella analytics.
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onOpenSupabaseConfig}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-[#0082ff]/50 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Database size={13} className="text-[#0082ff]" />
              <span>Configure Sync</span>
            </button>

            {supabaseConnected && (
              <button
                type="button"
                onClick={onRefreshSupabase}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Fetch latest trades from Supabase"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin text-[#0082ff]' : ''} />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenPythonBridge}
              className="px-3 py-1.5 rounded-xl border border-[#0082ff]/30 bg-[#0082ff]/10 text-[#0082ff] dark:text-[#38a1ff] hover:bg-[#0082ff]/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
            >
              <Code2 size={13} />
              <span>Python Bridge Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* Parse Error Notification */}
      {parseError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={15} className="shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Status Bar & Quick Actions Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400 uppercase text-[10px] font-bold">Total Ingested:</span>
            <span className="font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {tradeCount} Closed Trades
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Realtime TradeZella Engine Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {tradeCount === 0 && (
            <button
              type="button"
              onClick={onLoadSampleData}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Load Sample MT5 Gold History</span>
            </button>
          )}

          {tradeCount > 0 && (
            <>
              <button
                type="button"
                onClick={onLoadSampleData}
                className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reload realistic sample trades"
              >
                <Sparkles size={12} className="text-amber-500" />
                <span>Reload Sample</span>
              </button>

              <button
                type="button"
                onClick={onClearTrades}
                className="px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Clear all parsed tickets"
              >
                <Trash2 size={12} />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
