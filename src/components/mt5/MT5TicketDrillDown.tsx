import React, { useState, useMemo } from 'react';
import { MT5Trade, SetupCategory, MistakeTag } from '../../types/mt5';
import {
  Search,
  Filter,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit3,
  Save,
  Download,
  DollarSign,
  ChevronDown,
  Tag,
  StickyNote
} from 'lucide-react';

interface MT5TicketDrillDownProps {
  trades: MT5Trade[];
  onUpdateTrade: (ticket: string, updates: Partial<MT5Trade>) => void;
}

const SETUP_OPTIONS: SetupCategory[] = [
  'DALE 4H Expansion',
  'DALE Retest',
  'Chop Scalp',
  'Impulsive Entry',
  'London Breakout',
  'NY Session Sweep',
  'Asian Range Fade',
  'Other'
];

const MISTAKE_OPTIONS: MistakeTag[] = [
  'None (Clean)',
  'Order Stacking',
  'Moved Stop Loss',
  'Traded During News',
  'Low-Liquidity Asian Entry',
  'Revenge Trade',
  'Exceeded Max Lot',
  'Chased Entry',
  'Early Exit Panic'
];

export const MT5TicketDrillDown: React.FC<MT5TicketDrillDownProps> = ({
  trades,
  onUpdateTrade
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'wins' | 'losses' | 'stacked' | 'mistakes'>('all');
  const [selectedSetup, setSelectedSetup] = useState<string>('all');
  const [editingTicket, setEditingTicket] = useState<string | null>(null);

  // Local draft state for editing
  const [draftSetup, setDraftSetup] = useState<SetupCategory>('DALE 4H Expansion');
  const [draftMistake, setDraftMistake] = useState<MistakeTag>('None (Clean)');
  const [draftNotes, setDraftNotes] = useState<string>('');

  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    return trades.filter(t => {
      const netProfit = typeof t.netProfit === 'number' && !isNaN(t.netProfit) ? t.netProfit : 0;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTicket = String(t.ticket || '').toLowerCase().includes(q);
        const matchesSymbol = String(t.symbol || '').toLowerCase().includes(q);
        const matchesNotes = String(t.notes || '').toLowerCase().includes(q);
        const matchesSetup = String(t.setupCategory || '').toLowerCase().includes(q);
        if (!matchesTicket && !matchesSymbol && !matchesNotes && !matchesSetup) {
          return false;
        }
      }

      // Quick outcome filter
      if (selectedFilter === 'wins' && netProfit <= 0.01) return false;
      if (selectedFilter === 'losses' && netProfit >= -0.01) return false;
      if (selectedFilter === 'stacked' && !t.isOrderStacked) return false;
      if (selectedFilter === 'mistakes' && (!t.mistakeTag || t.mistakeTag === 'None (Clean)')) return false;

      // Setup filter
      if (selectedSetup !== 'all' && t.setupCategory !== selectedSetup) {
        return false;
      }

      return true;
    });
  }, [trades, searchQuery, selectedFilter, selectedSetup]);

  const handleStartEdit = (trade: MT5Trade) => {
    setEditingTicket(trade.ticket);
    setDraftSetup(trade.setupCategory || 'DALE 4H Expansion');
    setDraftMistake(trade.mistakeTag || 'None (Clean)');
    setDraftNotes(trade.notes || '');
  };

  const handleSaveEdit = (ticket: string) => {
    onUpdateTrade(ticket, {
      setupCategory: draftSetup,
      mistakeTag: draftMistake,
      notes: draftNotes
    });
    setEditingTicket(null);
  };

  const exportCSV = () => {
    if (filteredTrades.length === 0) return;
    const headers = ['Ticket', 'OpenTime', 'CloseTime', 'Symbol', 'Type', 'Volume', 'OpenPrice', 'ClosePrice', 'Commission', 'Swap', 'NetProfit', 'SetupCategory', 'MistakeTag', 'Notes'];
    const rows = filteredTrades.map(t => [
      t.ticket,
      `"${t.openTime || ''}"`,
      `"${t.closeTime || ''}"`,
      t.symbol || 'XAUUSDm',
      t.type,
      t.volume || 0,
      t.openPrice || 0,
      t.closePrice || 0,
      t.commission || 0,
      t.swap || 0,
      t.netProfit || 0,
      `"${t.setupCategory || ''}"`,
      `"${t.mistakeTag || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MT5_Journal_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
      {/* Title & Top Search / Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0082ff]"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Forensic Ticket Ledger
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <StickyNote size={20} className="text-[#0082ff]" />
            <span>Closed Trades Drill-Down & Setup Journaling</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tag execution setups, pinpoint rule friction mistakes, and record technical review notes.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Download size={13} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800 space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, symbol, setup, or notes..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0082ff]"
            />
          </div>

          {/* Setup Category Filter */}
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-slate-400 shrink-0" />
            <select
              value={selectedSetup}
              onChange={e => setSelectedSetup(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0082ff] cursor-pointer"
            >
              <option value="all">All Setup Categories</option>
              {SETUP_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-[#0082ff]'
                : 'bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All ({trades.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('wins')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'wins'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            Winners ({trades.filter(t => (t.netProfit || 0) > 0.01).length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('losses')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'losses'
                ? 'bg-rose-600 text-white'
                : 'bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400'
            }`}
          >
            Losses ({trades.filter(t => (t.netProfit || 0) < -0.01).length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('stacked')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'stacked'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400'
            }`}
          >
            Order Stacked ({trades.filter(t => t.isOrderStacked).length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('mistakes')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'mistakes'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 text-purple-600 dark:text-purple-400'
            }`}
          >
            Rule Friction / Mistakes ({trades.filter(t => t.mistakeTag && t.mistakeTag !== 'None (Clean)').length})
          </button>
        </div>
      </div>

      {/* Trades Ledger Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#0c101a] border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Ticket / Symbol</th>
              <th className="py-2.5 px-3">Type & Lots</th>
              <th className="py-2.5 px-3">Execution Times</th>
              <th className="py-2.5 px-3">Prices (In &rarr; Out)</th>
              <th className="py-2.5 px-3 text-right">Realized Net P/L</th>
              <th className="py-2.5 px-3">Setup Category</th>
              <th className="py-2.5 px-3">Mistake / Rule</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 text-xs font-mono">
                  No trades match the current filter or search criteria.
                </td>
              </tr>
            ) : (
              filteredTrades.map(trade => {
                const isEditing = editingTicket === trade.ticket;
                const netProfit = typeof trade.netProfit === 'number' && !isNaN(trade.netProfit) ? trade.netProfit : 0;
                const isWin = netProfit > 0.01;
                const isLoss = netProfit < -0.01;
                const volume = typeof trade.volume === 'number' && !isNaN(trade.volume) ? trade.volume : 0.05;
                const openPrice = typeof trade.openPrice === 'number' && !isNaN(trade.openPrice) ? trade.openPrice : 0;
                const closePrice = typeof trade.closePrice === 'number' && !isNaN(trade.closePrice) ? trade.closePrice : 0;
                const commission = typeof trade.commission === 'number' && !isNaN(trade.commission) ? trade.commission : 0;
                const swap = typeof trade.swap === 'number' && !isNaN(trade.swap) ? trade.swap : 0;

                const openTimeDisplay = String(trade.openTime || '').replace('T', ' ').split('.')[0];
                const closeTimeDisplay = String(trade.closeTime || '').replace('T', ' ').split(' ')[1] || String(trade.closeTime || '');

                return (
                  <React.Fragment key={trade.ticket}>
                    <tr
                      className={`hover:bg-slate-50/70 dark:hover:bg-[#162032]/40 transition-colors ${
                        trade.isOrderStacked ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Ticket & Symbol */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">#{trade.ticket}</span>
                          {trade.isOrderStacked && (
                            <span
                              className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold"
                              title="Order Stacking: Position was open simultaneously with another ticket"
                            >
                              STACK
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-bold">{trade.symbol}</span>
                      </td>

                      {/* Type & Volume */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold text-[10px] uppercase ${
                              trade.type === 'buy'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {trade.type}
                          </span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {(volume ?? 0).toFixed(2)} lots
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {trade.sessionWindow}
                        </span>
                      </td>

                      {/* Execution Times */}
                      <td className="py-3 px-3">
                        <span className="text-slate-800 dark:text-slate-200 block text-[11px]">
                          {openTimeDisplay}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <span>Close: {closeTimeDisplay}</span>
                          <span>·</span>
                          <span>{trade.durationMinutes || 15}m</span>
                        </div>
                      </td>

                      {/* Entry & Exit Prices */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800 dark:text-slate-200 text-xs">
                          <span>{(openPrice ?? 0).toFixed(2)}</span>
                          <span className="text-slate-400 mx-1">&rarr;</span>
                          <span>{(closePrice ?? 0).toFixed(2)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Com: ${Math.abs(commission ?? 0).toFixed(2)} | Swap: ${(swap ?? 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Net P/L */}
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`text-sm font-black ${
                            isWin
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isLoss
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isWin ? '+' : ''}${(netProfit ?? 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Setup Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold inline-block">
                          {trade.setupCategory || 'Unassigned'}
                        </span>
                      </td>

                      {/* Mistake Tag */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border inline-block ${
                            !trade.mistakeTag || trade.mistakeTag === 'None (Clean)'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {trade.mistakeTag || 'None (Clean)'}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              setEditingTicket(null);
                            } else {
                              handleStartEdit(trade);
                            }
                          }}
                          className={`p-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                            isEditing
                              ? 'bg-[#0082ff] text-white border-[#0082ff]'
                              : 'border-slate-200 dark:border-slate-700 hover:border-[#0082ff] text-slate-700 dark:text-slate-300'
                          }`}
                          title="Edit Setup, Mistake, or Notes"
                        >
                          <Edit3 size={13} />
                        </button>
                      </td>
                    </tr>

                    {/* Inline Editing Row */}
                    {isEditing && (
                      <tr className="bg-slate-50/90 dark:bg-[#0c101a] border-b border-slate-200 dark:border-slate-800">
                        <td colSpan={8} className="p-4 space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase font-sans">
                              Trade Forensics & Journal Note: #{trade.ticket}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingTicket(null)}
                                className="px-3 py-1 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(trade.ticket)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#0082ff] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Save size={13} />
                                <span>Save Changes</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                                Execution Setup Category
                              </label>
                              <select
                                value={draftSetup}
                                onChange={e => setDraftSetup(e.target.value as SetupCategory)}
                                className="w-full p-2 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0082ff]"
                              >
                                {SETUP_OPTIONS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                                Rule Breach or Mistake
                              </label>
                              <select
                                value={draftMistake}
                                onChange={e => setDraftMistake(e.target.value as MistakeTag)}
                                className="w-full p-2 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0082ff]"
                              >
                                {MISTAKE_OPTIONS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                              Post-Trade Debrief & Execution Psychology
                            </label>
                            <textarea
                              value={draftNotes}
                              onChange={e => setDraftNotes(e.target.value)}
                              rows={2}
                              placeholder="Record entry trigger confirmation, emotional state, stop loss management, or lessons learned..."
                              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0082ff]"
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
