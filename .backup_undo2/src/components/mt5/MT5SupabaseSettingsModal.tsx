import React, { useState } from 'react';
import { X, Database, Save, CheckCircle2, AlertCircle, RefreshCw, Key, Link } from 'lucide-react';
import { SupabaseConfig } from '../../types/mt5';
import { saveSupabaseConfig, fetchSupabaseMT5Trades } from '../../services/supabaseMT5';

interface MT5SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onConfigSaved: (config: SupabaseConfig) => void;
}

export const MT5SupabaseSettingsModal: React.FC<MT5SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigSaved
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [tableName, setTableName] = useState(config.tableName || 'mt5_live_trades');
  const [autoSync, setAutoSync] = useState(config.autoSync !== false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const testCfg: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      tableName: tableName.trim() || 'mt5_live_trades',
      autoSync
    };

    const res = await fetchSupabaseMT5Trades(testCfg);
    setTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: `Connection Verified! Successfully found ${res.trades.length} records in table '${testCfg.tableName}'.`
      });
    } else {
      setTestResult({
        success: false,
        message: `Connection Failed: ${res.error}`
      });
    }
  };

  const handleSave = () => {
    const updated: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      tableName: tableName.trim() || 'mt5_live_trades',
      autoSync
    };
    saveSupabaseConfig(updated);
    onConfigSaved(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase font-sans">
                Supabase Realtime Sync Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your cloud database for automatic live trade ingestion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {/* Supabase URL */}
          <div>
            <label className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold block mb-1.5 flex items-center gap-1.5">
              <Link size={12} />
              <span>Supabase Project URL</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://xyzabcdefg.supabase.co"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0082ff]"
            />
          </div>

          {/* Anon Key */}
          <div>
            <label className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold block mb-1.5 flex items-center gap-1.5">
              <Key size={12} />
              <span>Supabase Public Anon Key</span>
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0082ff]"
            />
          </div>

          {/* Table Name */}
          <div>
            <label className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold block mb-1.5">
              Database Table Name
            </label>
            <input
              type="text"
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              placeholder="mt5_live_trades"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#0082ff]"
            />
          </div>

          {/* Auto-sync Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Realtime Websocket Listener</span>
              <span className="text-[11px] text-slate-400">Stream incoming closed trades automatically</span>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={e => setAutoSync(e.target.checked)}
              className="w-4 h-4 rounded text-[#0082ff] focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-fadeIn ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c101a] flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !url || !anonKey}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162032] hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={testing ? 'animate-spin text-[#0082ff]' : ''} />
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-mono text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save size={13} />
              <span>Save & Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
