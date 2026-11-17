import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  Check,
  Terminal,
  Database,
  ExternalLink,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';

interface MT5PythonBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseUrl?: string;
}

export const MT5PythonBridgeModal: React.FC<MT5PythonBridgeModalProps> = ({
  isOpen,
  onClose,
  supabaseUrl = ''
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'sql' | 'guide'>('script');

  if (!isOpen) return null;

  const pythonScript = `"""
Transformer19 // Official MT5 Live Bridge Engine
Author: Yohannes Sharew / Transformer19
Description: Connects to local MetaTrader 5 terminal, polls closed deal history every 30 seconds,
and automatically streams new trade tickets directly to Supabase REST API in realtime.
"""

import time
import datetime
from decimal import Decimal
import MetaTrader5 as mt5
from supabase import create_client, Client

# ==========================================================
# 1. SUPABASE CREDENTIALS CONFIGURATION
# Replace these with your Supabase Project settings
# ==========================================================
SUPABASE_URL = "${supabaseUrl || 'https://your-project-id.supabase.co'}"
SUPABASE_KEY = "your-supabase-anon-key-here"
TABLE_NAME = "mt5_live_trades"

def init_supabase() -> Client:
    try:
        client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(" Connected to Supabase REST API successfully.")
        return client
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        exit(1)

def init_mt5() -> bool:
    print(" Initializing MetaTrader 5 connection...")
    if not mt5.initialize():
        print(f"❌ mt5.initialize() failed, error code = {mt5.last_error()}")
        return False
    
    account_info = mt5.account_info()
    if account_info is not None:
        print(f" Connected to MT5 Account: #{account_info.login} ({account_info.server})")
        print(f"   Balance: \${account_info.balance:.2f} | Equity: \${account_info.equity:.2f}")
        return True
    return False

def determine_session(hour_utc: int) -> str:
    if 7 <= hour_utc < 12:
        return "London"
    elif 12 <= hour_utc < 20:
        return "New York"
    elif 0 <= hour_utc < 7:
        return "Asian"
    return "Overlap / Other"

def sync_closed_trades(supabase: Client, processed_tickets: set):
    now = datetime.datetime.now()
    from_date = now - datetime.timedelta(days=7)  # Sync last 7 days of closed deals
    
    deals = mt5.history_deals_get(from_date, now)
    if deals is None or len(deals) == 0:
        return

    # In MT5, DEAL_ENTRY_OUT (1) marks the closing of a position
    for deal in deals:
        if deal.entry != 1:  # Only capture closing deals with realized P/L
            continue
            
        ticket_str = str(deal.position_id)
        if ticket_str in processed_tickets:
            continue

        deal_time = datetime.datetime.fromtimestamp(deal.time)
        session_window = determine_session(deal_time.hour)
        order_type = "sell" if deal.type == 0 else "buy"  # Inverse of exit deal

        trade_payload = {
            "ticket": ticket_str,
            "open_time": (deal_time - datetime.timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S"),
            "close_time": deal_time.strftime("%Y-%m-%d %H:%M:%S"),
            "symbol": str(deal.symbol),
            "type": order_type,
            "volume": float(deal.volume),
            "open_price": float(deal.price),
            "close_price": float(deal.price),
            "commission": float(deal.commission),
            "swap": float(deal.swap),
            "net_profit": float(deal.profit),
            "setup_category": "DALE 4H Expansion",
            "mistake_tag": "None (Clean)",
            "session_window": session_window,
            "notes": "Synced via MT5 Python Auto-Bridge"
        }

        try:
            # Upsert into Supabase to prevent duplicates
            res = supabase.table(TABLE_NAME).upsert(trade_payload, on_conflict="ticket").execute()
            print(f" [SYNCED] Ticket #{ticket_str} | {deal.symbol} | P/L: \${deal.profit:.2f} ({session_window})")
            processed_tickets.add(ticket_str)
        except Exception as err:
            print(f"⚠️ Error uploading ticket #{ticket_str}: {err}")

def main():
    print("==================================================")
    print("   TRANSFORMER19 - MT5 REALTIME BRIDGE v2.0       ")
    print("==================================================")
    
    if not init_mt5():
        return
    
    supabase = init_supabase()
    processed_tickets = set()
    
    print("\\n📡 Listening for closed MT5 positions... (Press Ctrl+C to stop)\\n")
    try:
        while True:
            sync_closed_trades(supabase, processed_tickets)
            time.sleep(30)  # Polling interval in seconds
    except KeyboardInterrupt:
        print("\\n🛑 Bridge stopped by user.")
    finally:
        mt5.shutdown()
        print("MT5 connection closed gracefully.")

if __name__ == "__main__":
    main()
`;

  const sqlSchema = `-- ================================================================
-- Transformer19: mt5_live_trades Supabase Table Schema
-- Paste this directly into your Supabase Project SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS public.mt5_live_trades (
    id BIGSERIAL PRIMARY KEY,
    ticket VARCHAR(64) UNIQUE NOT NULL,
    open_time TIMESTAMP WITH TIME ZONE NOT NULL,
    close_time TIMESTAMP WITH TIME ZONE NOT NULL,
    symbol VARCHAR(32) NOT NULL DEFAULT 'XAUUSDm',
    type VARCHAR(16) NOT NULL, -- 'buy' or 'sell'
    volume NUMERIC(10, 4) NOT NULL,
    open_price NUMERIC(14, 5) NOT NULL,
    close_price NUMERIC(14, 5) NOT NULL,
    commission NUMERIC(10, 2) DEFAULT 0,
    swap NUMERIC(10, 2) DEFAULT 0,
    net_profit NUMERIC(12, 2) NOT NULL,
    setup_category VARCHAR(64) DEFAULT 'DALE 4H Expansion',
    mistake_tag VARCHAR(64) DEFAULT 'None (Clean)',
    session_window VARCHAR(32) DEFAULT 'London',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Supabase Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.mt5_live_trades;

-- Enable Row Level Security (RLS) and allow anon read/insert for your dashboard
ALTER TABLE public.mt5_live_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to mt5_live_trades"
    ON public.mt5_live_trades FOR SELECT
    USING (true);

CREATE POLICY "Allow anon insert/upsert for local Python bridge"
    ON public.mt5_live_trades FOR ALL
    USING (true)
    WITH CHECK (true);
`;

  const copyToClipboard = (text: string, type: 'script' | 'sql') => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0082ff]/15 text-[#0082ff] flex items-center justify-center">
              <Code2 size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase font-sans">
                Python MT5 Auto-Bridge Script Generator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plug-and-play desktop background service for realtime MT5 &rarr; Supabase streaming
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

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c101a] font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('script')}
            className={`py-2 px-3 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'script'
                ? 'border-[#0082ff] text-[#0082ff]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            1. Python Bridge Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`py-2 px-3 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'sql'
                ? 'border-[#0082ff] text-[#0082ff]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            2. Supabase SQL Schema
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-3 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'guide'
                ? 'border-[#0082ff] text-[#0082ff]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            3. Setup Instructions
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Save as <code className="font-bold text-slate-900 dark:text-white">mt5_supabase_bridge.py</code> on your trading workstation
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(pythonScript, 'script')}
                  className="px-3 py-1.5 rounded-xl bg-[#0082ff] text-white text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#0070dc]"
                >
                  {copiedScript ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Python Script'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[420px] border border-slate-800">
                  <code>{pythonScript}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Run in Supabase &gt; SQL Editor to provision the table & realtime stream
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sqlSchema, 'sql')}
                  className="px-3 py-1.5 rounded-xl bg-[#0082ff] text-white text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#0070dc]"
                >
                  {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[420px] border border-slate-800">
                  <code>{sqlSchema}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Play size={15} className="text-[#0082ff]" />
                  <span>3-Step Quickstart Guide</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>
                    <strong>Install Dependencies:</strong> Open your terminal / Command Prompt on Windows and install the official libraries:
                    <div className="mt-1 p-2 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px]">
                      pip install MetaTrader5 supabase
                    </div>
                  </li>
                  <li>
                    <strong>Create the Supabase Table:</strong> Copy the SQL schema from Tab 2, navigate to your Supabase dashboard &gt; <em>SQL Editor</em>, paste it, and click <em>Run</em>.
                  </li>
                  <li>
                    <strong>Launch the Bridge:</strong> Open your MetaTrader 5 terminal, log into your live/demo account, and start the script:
                    <div className="mt-1 p-2 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px]">
                      python mt5_supabase_bridge.py
                    </div>
                  </li>
                </ol>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white">Realtime Zero-Click Experience</h5>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    As soon as you take profit or exit a gold position in MT5, the bridge detects it and publishes it to Supabase. This dashboard updates its calendar heatmap, KPIs, and equity curve in real time without refreshing!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c101a] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Transformer19 Forensic Suite · Realtime MT5 Auto-Bridge
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-700 text-xs font-bold font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
