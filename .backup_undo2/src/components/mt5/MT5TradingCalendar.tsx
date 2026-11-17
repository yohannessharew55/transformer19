import React, { useState, useMemo, useEffect } from 'react';
import { MT5Trade } from '../../types/mt5';
import { parseTradeDate, formatTradeDateKey } from '../../utils/mt5Parser';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  TrendingUp,
  DollarSign,
  Award,
  Layers,
  Clock
} from 'lucide-react';

interface MT5TradingCalendarProps {
  trades: MT5Trade[];
  onSelectDay: (dateStr: string, dayTrades: MT5Trade[]) => void;
}

export const MT5TradingCalendar: React.FC<MT5TradingCalendarProps> = ({
  trades,
  onSelectDay
}) => {
  // Current viewing month (year and month index 0-11)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (trades.length > 0) {
      const dates = trades
        .map(t => parseTradeDate(t.closeTime))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime());
      if (dates.length > 0) return dates[0];
    }
    return new Date(2026, 9, 2); // October 2026
  });

  // Whenever trades update (e.g. after uploading MT5 report or syncing), jump to the latest trade month
  useEffect(() => {
    if (trades.length > 0) {
      const dates = trades
        .map(t => parseTradeDate(t.closeTime))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime());
      if (dates.length > 0) {
        setCurrentDate(dates[0]);
      }
    }
  }, [trades]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCurrentMonth = () => {
    if (trades.length > 0) {
      const dates = trades
        .map(t => parseTradeDate(t.closeTime))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime());
      if (dates.length > 0) {
        setCurrentDate(dates[0]);
        return;
      }
    }
    setCurrentDate(new Date(2026, 9, 2));
  };

  // Group trades by date string YYYY-MM-DD using robust parser
  const tradesByDay = useMemo(() => {
    const map = new Map<string, MT5Trade[]>();

    trades.forEach(trade => {
      const d = parseTradeDate(trade.closeTime);
      if (!d) return;
      const key = formatTradeDateKey(d);

      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(trade);
    });

    return map;
  }, [trades]);

  // Compute month statistics
  const monthStats = useMemo(() => {
    let monthPnl = 0;
    let activeDays = 0;
    let winningDays = 0;
    let losingDays = 0;
    let totalTradesThisMonth = 0;

    tradesByDay.forEach((dayTrades, dateKey) => {
      const d = parseTradeDate(dateKey);
      if (!d) return;
      if (d.getFullYear() === year && d.getMonth() === month) {
        const net = dayTrades.reduce((acc, t) => {
          const val = typeof t.netProfit === 'number' && !isNaN(t.netProfit) ? t.netProfit : 0;
          return acc + val;
        }, 0);

        monthPnl += net;
        activeDays++;
        totalTradesThisMonth += dayTrades.length;
        if (net > 0.01) winningDays++;
        else if (net < -0.01) losingDays++;
      }
    });

    const dayWinRate = activeDays > 0 ? (winningDays / activeDays) * 100 : 0;

    return {
      monthPnl: Number(monthPnl.toFixed(2)),
      activeDays,
      winningDays,
      losingDays,
      totalTradesThisMonth,
      dayWinRate: Number(dayWinRate.toFixed(0))
    };
  }, [tradesByDay, year, month]);

  // Generate calendar grid for Mon - Fri trading days
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const cells: Array<{
      date: Date;
      dateKey: string;
      isCurrentMonth: boolean;
      trades: MT5Trade[];
      netPnl: number;
      winCount: number;
      lossCount: number;
    }> = [];

    // Find the Monday of the first week
    const start = new Date(firstDayOfMonth);
    const dayOfWeek = start.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + distanceToMonday);

    // End on Friday of the last week
    const end = new Date(lastDayOfMonth);
    const endDayOfWeek = end.getDay();
    const distanceToFriday = endDayOfWeek === 6 ? -1 : 5 - endDayOfWeek;
    end.setDate(end.getDate() + distanceToFriday);

    const cursor = new Date(start);

    while (cursor <= end) {
      const dow = cursor.getDay();
      if (dow >= 1 && dow <= 5) {
        const dateKey = formatTradeDateKey(cursor);
        const dayTrades = tradesByDay.get(dateKey) || [];
        const netPnl = dayTrades.reduce((sum, t) => {
          const val = typeof t.netProfit === 'number' && !isNaN(t.netProfit) ? t.netProfit : 0;
          return sum + val;
        }, 0);

        const winCount = dayTrades.filter(t => (t.netProfit || 0) > 0.01).length;
        const lossCount = dayTrades.filter(t => (t.netProfit || 0) < -0.01).length;

        cells.push({
          date: new Date(cursor),
          dateKey,
          isCurrentMonth: cursor.getMonth() === month,
          trades: dayTrades,
          netPnl: Number(netPnl.toFixed(2)),
          winCount,
          lossCount
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return cells;
  }, [year, month, tradesByDay]);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
      {/* Header & Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0082ff]"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Interactive Forensic Heatmap
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon size={22} className="text-[#0082ff]" />
            <span>Trading Calendar Heatmap</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            TradeZella-grade P/L density matrix. Click any active session cell to inspect closed ticket forensics.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={handleCurrentMonth}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162032] text-xs font-mono font-black text-slate-900 dark:text-white shadow-2xs hover:border-[#0082ff]/50 transition-all cursor-pointer"
            title="Click to jump to latest active month"
          >
            {monthName}
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Monthly Performance Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Month Realized P/L</span>
          <span
            className={`font-black text-base sm:text-lg ${
              monthStats.monthPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {monthStats.monthPnl >= 0 ? '+' : ''}${monthStats.monthPnl.toFixed(2)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Trading Days</span>
          <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
            {monthStats.activeDays} Days ({monthStats.totalTradesThisMonth} Trades)
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Day Win Rate</span>
          <span className="font-black text-base sm:text-lg text-[#0082ff]">
            {monthStats.dayWinRate}%
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Win / Loss Days</span>
          <div className="font-black text-base sm:text-lg mt-0.5 space-x-1">
            <span className="text-emerald-600 dark:text-emerald-400">{monthStats.winningDays}W</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-rose-600 dark:text-rose-400">{monthStats.losingDays}L</span>
          </div>
        </div>
      </div>

      {/* Days of Week Header (Mon - Fri) */}
      <div className="grid grid-cols-5 gap-2 mb-2 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <div>Monday</div>
        <div>Tuesday</div>
        <div>Wednesday</div>
        <div>Thursday</div>
        <div>Friday</div>
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
        {calendarCells.map(cell => {
          const hasTrades = cell.trades.length > 0;
          const isWin = cell.netPnl > 0.01;
          const isLoss = cell.netPnl < -0.01;

          return (
            <div
              key={cell.dateKey}
              onClick={() => {
                if (hasTrades) {
                  onSelectDay(cell.dateKey, cell.trades);
                }
              }}
              className={`min-h-[85px] sm:min-h-[105px] p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between select-none relative ${
                !cell.isCurrentMonth
                  ? 'opacity-35 bg-slate-50/50 dark:bg-[#0e1422]/50 border-slate-200/50 dark:border-slate-800/50'
                  : hasTrades
                  ? isWin
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/35 border-emerald-500/40 dark:border-emerald-500/30 hover:border-emerald-500 hover:shadow-md cursor-pointer group hover:scale-[1.02]'
                    : isLoss
                    ? 'bg-rose-500/10 dark:bg-rose-950/35 border-rose-500/40 dark:border-rose-500/30 hover:border-rose-500 hover:shadow-md cursor-pointer group hover:scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 hover:border-[#0082ff] cursor-pointer'
                  : 'bg-slate-50/70 dark:bg-[#0e1422]/60 border-slate-200/70 dark:border-slate-800/70'
              }`}
            >
              {/* Day Number and Trade Count Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-bold ${
                    cell.isCurrentMonth
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {cell.date.getDate()}
                </span>

                {hasTrades && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                      isWin
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : isLoss
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cell.trades.length} {cell.trades.length === 1 ? 'trade' : 'trades'}
                  </span>
                )}
              </div>

              {/* Day Net Realized P/L */}
              {hasTrades ? (
                <div className="my-1">
                  <div
                    className={`text-sm sm:text-base font-mono font-black tracking-tight ${
                      isWin
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isLoss
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isWin ? '+' : ''}${cell.netPnl.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{cell.winCount}W</span>
                    <span>·</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">{cell.lossCount}L</span>
                  </div>
                </div>
              ) : (
                <div className="my-auto text-center">
                  <span className="text-[10px] font-mono text-slate-300 dark:text-slate-700 select-none">
                    -
                  </span>
                </div>
              )}

              {/* Bottom Subtle Click Prompt */}
              {hasTrades && (
                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-[#0082ff] transition-colors truncate">
                  Inspect Tickets &rarr;
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
