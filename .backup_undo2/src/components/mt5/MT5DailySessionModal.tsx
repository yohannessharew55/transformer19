import React from 'react';
import { X, Calendar, DollarSign, Clock, Layers, ArrowRight } from 'lucide-react';
import { MT5Trade } from '../../types/mt5';
import { parseTradeDate } from '../../utils/mt5Parser';

interface MT5DailySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  trades: MT5Trade[];
}

export const MT5DailySessionModal: React.FC<MT5DailySessionModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  trades
}) => {
  if (!isOpen) return null;

  const totalPnl = trades.reduce((sum, t) => {
    const val = typeof t.netProfit === 'number' && !isNaN(t.netProfit) ? t.netProfit : 0;
    return sum + val;
  }, 0);

  const wins = trades.filter(t => (t.netProfit || 0) > 0.01).length;
  const losses = trades.filter(t => (t.netProfit || 0) < -0.01).length;
  const totalLots = trades.reduce((sum, t) => sum + (t.volume || 0), 0);
  const isNetPositive = totalPnl >= 0;

  const parsedDate = parseTradeDate(dateStr) || new Date();
  const formattedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0082ff]/15 text-[#0082ff] flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  Daily Execution Audit
                </span>
                <span className="font-mono text-xs text-slate-500">· {dateStr}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase font-sans">
                {formattedDate}
              </h3>
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

        {/* Daily Summary Strip */}
        <div className="grid grid-cols-4 gap-2.5 p-4 bg-slate-50 dark:bg-[#0c101a] border-b border-slate-200 dark:border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Day Net P/L</span>
            <span
              className={`font-black text-base ${
                isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isNetPositive ? '+' : ''}${totalPnl.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Executions</span>
            <span className="font-black text-base text-slate-900 dark:text-white">
              {trades.length} {trades.length === 1 ? 'Trade' : 'Trades'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Win / Loss</span>
            <div className="font-black text-base space-x-1 mt-0.5">
              <span className="text-emerald-600 dark:text-emerald-400">{wins}W</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-rose-600 dark:text-rose-400">{losses}L</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Volume</span>
            <span className="font-black text-base text-slate-800 dark:text-slate-200">
              {totalLots.toFixed(2)} Lots
            </span>
          </div>
        </div>

        {/* Tickets List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 font-mono text-xs">
          {trades.map(trade => {
            const netProfit = typeof trade.netProfit === 'number' && !isNaN(trade.netProfit) ? trade.netProfit : 0;
            const isWin = netProfit > 0.01;
            const isLoss = netProfit < -0.01;
            const volume = typeof trade.volume === 'number' && !isNaN(trade.volume) ? trade.volume : 0.05;
            const openPrice = typeof trade.openPrice === 'number' && !isNaN(trade.openPrice) ? trade.openPrice : 0;
            const closePrice = typeof trade.closePrice === 'number' && !isNaN(trade.closePrice) ? trade.closePrice : 0;

            const openTimeClean = String(trade.openTime || '').split(' ')[1] || String(trade.openTime || '');
            const closeTimeClean = String(trade.closeTime || '').split(' ')[1] || String(trade.closeTime || '');

            return (
              <div
                key={trade.ticket}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-2.5"
              >
                {/* Top Ticket Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">#{trade.ticket}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-bold text-[#0082ff]">{trade.symbol || 'XAUUSDm'}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        trade.type === 'buy'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {trade.type} {volume.toFixed(2)} lots
                    </span>
                    {trade.isOrderStacked && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[10px] font-bold">
                        STACKED
                      </span>
                    )}
                  </div>

                  <div
                    className={`text-base font-black ${
                      isWin
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isLoss
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isWin ? '+' : ''}${netProfit.toFixed(2)}
                  </div>
                </div>

                {/* Execution Details & Prices */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0c101a] text-[11px] text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Open &rarr; Close Price</span>
                    <span>{openPrice.toFixed(2)} &rarr; {closePrice.toFixed(2)}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Timestamps</span>
                    <span>{openTimeClean} &rarr; {closeTimeClean}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Session Window</span>
                    <span>{trade.sessionWindow || 'London'} ({trade.durationMinutes || 15}m)</span>
                  </div>
                </div>

                {/* Setup Category & Mistake Tag */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Setup:</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                      {trade.setupCategory || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Rule:</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        !trade.mistakeTag || trade.mistakeTag === 'None (Clean)'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {trade.mistakeTag || 'None (Clean)'}
                    </span>
                  </div>
                </div>

                {/* Notes if available */}
                {trade.notes && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0c101a] p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Journal Note:</span> {trade.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c101a] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-700 text-xs font-bold font-mono transition-colors"
          >
            Close Session
          </button>
        </div>
      </div>
    </div>
  );
};
