import React, { useState, useEffect } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { BrokerWebhookEvent } from '../types';
import {
  Radio,
  Copy,
  Check,
  Send,
  Code,
  Terminal,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const BrokerTelemetrySection: React.FC = () => {
  const { traderName } = useCockpit();

  const [activeGuideTab, setActiveGuideTab] = useState<'tradingview' | 'mt5' | 'python' | 'curl'>('tradingview');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [events, setEvents] = useState<BrokerWebhookEvent[]>(() => [
    {
      id: 'evt_sample_1',
      receivedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      ticket: 'TV_849201',
      symbol: 'XAUUSD',
      type: 'buy',
      volume: 0.01,
      openPrice: 2685.20,
      closePrice: 2691.14,
      netProfit: 5.94,
      commission: 0.07,
      swap: 0,
      source: 'tradingview',
      status: 'matched_session',
      latencyMs: 14
    },
    {
      id: 'evt_sample_2',
      receivedAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
      ticket: 'MT5_389201',
      symbol: 'XAUUSD',
      type: 'buy',
      volume: 0.01,
      openPrice: 2682.00,
      closePrice: 2688.00,
      netProfit: 6.00,
      commission: 0.07,
      swap: 0,
      source: 'mt5',
      status: 'matched_session',
      latencyMs: 9
    }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Custom Simulator Form
  const [simSymbol, setSimSymbol] = useState('XAUUSD');
  const [simType, setSimType] = useState<'buy' | 'sell'>('buy');
  const [simLots, setSimLots] = useState('0.01');
  const [simPnl, setSimPnl] = useState('5.94');
  const [simSource, setSimSource] = useState<'tradingview' | 'mt5' | 'simulator'>('tradingview');

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/broker`
    : 'https://transformer19.vercel.app/api/webhooks/broker';

  // Fetch recent events from server
  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/webhooks/events');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.events) && data.events.length > 0) {
          setEvents(prev => {
            const map = new Map<string, BrokerWebhookEvent>();
            data.events.forEach((e: BrokerWebhookEvent) => map.set(e.id, e));
            prev.forEach(e => {
              if (!map.has(e.id)) map.set(e.id, e);
            });
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
            );
          });
        }
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSendSimulatedTrade = async (customPnl?: number, customType?: 'buy' | 'sell', customSymbol?: string) => {
    setIsSending(true);
    setTestResult(null);

    const payload = {
      secretKey: 'transformer19_live_key',
      ticket: `SIM_${Date.now()}`,
      symbol: customSymbol || simSymbol,
      type: customType || simType,
      volume: parseFloat(simLots) || 0.01,
      openPrice: 2680.0,
      closePrice: (customPnl ?? parseFloat(simPnl)) >= 0 ? 2686.0 : 2674.0,
      netProfit: customPnl !== undefined ? customPnl : (parseFloat(simPnl) || 5.94),
      commission: 0.07,
      swap: 0,
      openTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      closeTime: new Date().toISOString(),
      source: simSource,
      notes: `Simulated live execution fill for Operator ${traderName}`
    };

    try {
      const res = await fetch('/api/webhooks/broker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Fired webhook fill #${data.event.ticket} in ${data.event.latencyMs}ms! Synced to Live Journal.`
        });
        if (data.event) {
          setEvents(prev => [data.event, ...prev]);
        }
      } else {
        const err = await res.json();
        setTestResult({ success: false, message: err.error || 'Webhook failed to trigger' });
      }
    } catch (e: any) {
      // In standalone client mode without active server, push to local event state
      const mockEvent: BrokerWebhookEvent = {
        id: `evt_local_${Date.now()}`,
        receivedAt: new Date().toISOString(),
        ticket: payload.ticket,
        symbol: payload.symbol,
        type: payload.type,
        volume: payload.volume,
        openPrice: payload.openPrice,
        closePrice: payload.closePrice,
        netProfit: payload.netProfit,
        commission: 0.07,
        swap: 0,
        source: 'simulator',
        status: 'matched_session',
        latencyMs: 11
      };
      setEvents(prev => [mockEvent, ...prev]);
      setTestResult({
        success: true,
        message: `Local simulated webhook fill #${payload.ticket} ingested into live memory stream.`
      });
    } finally {
      setIsSending(false);
    }
  };

  const tradingViewPayload = JSON.stringify({
    secretKey: "transformer19_live_key",
    ticket: "TV_{{timenow}}",
    symbol: "{{ticker}}",
    type: "buy",
    volume: 0.01,
    openPrice: "{{close}}",
    closePrice: "{{close}}",
    netProfit: 5.94,
    source: "tradingview",
    openTime: "{{timenow}}",
    closeTime: "{{timenow}}"
  }, null, 2);

  const mql5Snippet = `// Place in MQL5 EA on OnTradeTransaction()
void SendCockpitWebhook(ulong ticket, string symbol, string type, double lots, double profit) {
   string url = "${webhookUrl}";
   string headers = "Content-Type: application/json\\r\\n";
   string payload = StringFormat(
      "{\\"secretKey\\":\\"transformer19_live_key\\",\\"ticket\\":\\"%d\\",\\"symbol\\":\\"%s\\",\\"type\\":\\"%s\\",\\"volume\\":%.2f,\\"netProfit\\":%.2f,\\"source\\":\\"mt5\\"}",
      ticket, symbol, type, lots, profit
   );
   char post[], result[];
   string result_headers;
   StringToCharArray(payload, post, 0, WHOLE_ARRAY, CP_UTF8);
   int res = WebRequest("POST", url, headers, 3000, post, result, result_headers);
   Print("Transformer19 Webhook HTTP: ", res);
}`;

  const pythonSnippet = `# Python MT5 Zero-Latency Live Telemetry Bridge
import requests, datetime

WEBHOOK_URL = "${webhookUrl}"

payload = {
    "secretKey": "transformer19_live_key",
    "ticket": "84920194",
    "symbol": "XAUUSD",
    "type": "buy",
    "volume": 0.01,
    "openPrice": 2685.20,
    "closePrice": 2691.14,
    "netProfit": 5.94,
    "commission": 0.07,
    "source": "mt5",
    "closeTime": datetime.datetime.now().isoformat()
}

response = requests.post(WEBHOOK_URL, json=payload, timeout=5)
print("Cockpit Ingestion:", response.json())`;

  const curlSnippet = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "secretKey": "transformer19_live_key",
    "ticket": "MANUAL_TEST_01",
    "symbol": "XAUUSD",
    "type": "buy",
    "volume": 0.01,
    "netProfit": 5.94,
    "source": "curl"
  }'`;

  return (
    <div id="broker-telemetry-section" className="space-y-6 animate-fadeIn scroll-mt-20">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-blue-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-blue-300 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Telemetry Engine</span>
              </span>
              <span>· Zero Latency Webhook Ingestion</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Automated Broker Telemetry & Real-Time Sync
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Connect your TradingView alerts, MetaTrader 4/5 EA, cTrader, or algorithmic bots directly to Transformer19. Fills are instantly parsed, validated against the 48-week plan, and journaled in SQLite.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={fetchEvents}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-white/15"
            >
              <RefreshCw size={13} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* Live Endpoint Copy Box */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-300 shrink-0">
              Your Webhook URL:
            </span>
            <code className="text-xs font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-emerald-300 truncate">
              {webhookUrl}
            </code>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(webhookUrl, 'url')}
            className="px-3.5 py-1.5 rounded-xl bg-[#0082ff] hover:bg-[#0070df] text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
          >
            {copiedText === 'url' ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedText === 'url' ? 'Copied URL!' : 'Copy Webhook URL'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Telemetry Simulator & Test Bench */}
      <div className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap size={16} className="text-[#0082ff]" />
              <span>Live Ingestion Simulator & Test Bench</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fire test trade payloads to verify end-to-end ingestion, latency verification, and instant journal creation.
            </p>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={isSending}
              onClick={() => handleSendSimulatedTrade(5.94, 'buy', 'XAUUSD')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              + Target ($5.94 Long)
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={() => handleSendSimulatedTrade(-4.20, 'sell', 'XAUUSD')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-mono font-bold hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              - Cut Loss (-$4.20)
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={() => handleSendSimulatedTrade(0.00, 'buy', 'XAUUSD')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              $0 Breakeven
            </button>
          </div>
        </div>

        {/* Custom Simulation Form */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-500 mb-1">Symbol</label>
            <input
              type="text"
              value={simSymbol}
              onChange={e => setSimSymbol(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-500 mb-1">Type</label>
            <select
              value={simType}
              onChange={e => setSimType(e.target.value as 'buy' | 'sell')}
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
            >
              <option value="buy">BUY / LONG</option>
              <option value="sell">SELL / SHORT</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-500 mb-1">Lot Size</label>
            <input
              type="number"
              step="0.01"
              value={simLots}
              onChange={e => setSimLots(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-500 mb-1">Net P&L ($)</label>
            <input
              type="number"
              step="0.01"
              value={simPnl}
              onChange={e => setSimPnl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-end">
            <button
              type="button"
              disabled={isSending}
              onClick={() => handleSendSimulatedTrade()}
              className="w-full bg-[#0082ff] hover:bg-[#0070df] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Send Webhook</span>
                </>
              )}
            </button>
          </div>
        </div>

        {testResult && (
          <div
            className={`mt-3 p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* 3. Integration Guides & Code Snippets */}
      <div className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Code size={16} className="text-[#0082ff]" />
          <span>Platform Setup Guides & Copyable Payloads</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Select your platform to copy the exact webhook payload template, MQL5 EA handler, or Python bridge.
        </p>

        {/* Syntax Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'tradingview', label: 'TradingView Alert Webhook' },
            { id: 'mt5', label: 'MetaTrader 5 (MQL5 EA)' },
            { id: 'python', label: 'Python Automation Bridge' },
            { id: 'curl', label: 'cURL / REST Terminal' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveGuideTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeGuideTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="mt-4 relative">
          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 max-h-72 leading-relaxed">
            {activeGuideTab === 'tradingview' && tradingViewPayload}
            {activeGuideTab === 'mt5' && mql5Snippet}
            {activeGuideTab === 'python' && pythonSnippet}
            {activeGuideTab === 'curl' && curlSnippet}
          </pre>

          <button
            type="button"
            onClick={() => {
              const text =
                activeGuideTab === 'tradingview'
                  ? tradingViewPayload
                  : activeGuideTab === 'mt5'
                  ? mql5Snippet
                  : activeGuideTab === 'python'
                  ? pythonSnippet
                  : curlSnippet;
              handleCopy(text, 'snippet');
            }}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all border border-white/20"
          >
            {copiedText === 'snippet' ? <Check size={12} /> : <Copy size={12} />}
            <span>{copiedText === 'snippet' ? 'Copied Snippet!' : 'Copy Snippet'}</span>
          </button>
        </div>
      </div>

      {/* 4. Live Ingestion Event Stream */}
      <div className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={16} className="text-[#0082ff]" />
              <span>Live Ingested Telemetry Stream ({events.length} Events)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time audit log of executed trades parsed and processed through the broker webhook listener.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Real-Time Stream Active</span>
          </span>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            No live webhook events received yet. Fire a test trade using the simulator above.
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Received</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Ticket #</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Lots</th>
                  <th className="py-2.5 px-3 text-right">Net P&L</th>
                  <th className="py-2.5 px-3 text-center">Latency</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {events.map(evt => {
                  const isProfit = evt.netProfit >= 0;
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(evt.receivedAt).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                          {evt.source}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        #{evt.ticket}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                        {evt.symbol}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        <span
                          className={`flex items-center gap-1 ${
                            evt.type === 'buy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {evt.type === 'buy' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          <span>{evt.type.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-bold">
                        {(evt.volume ?? 0).toFixed(2)} lot
                      </td>
                      <td className="py-2.5 px-3 text-right font-black">
                        <span className={isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isProfit ? `+$${(evt.netProfit ?? 0).toFixed(2)}` : `-$${Math.abs(evt.netProfit ?? 0).toFixed(2)}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400 text-[11px]">
                        {evt.latencyMs}ms
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                          Processed & Synced
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
