import React, { useState } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { Maximize2, Minimize2, Activity } from 'lucide-react';

export const LiveXauChart: React.FC = () => {
  const { theme } = useCockpit();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<string>('60'); // 15, 60, 240, D

  const isDark = theme === 'dark';

  // TradingView embed URL with custom options
  const tvTheme = isDark ? 'dark' : 'light';
  const iframeSrc = `https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUUSD&interval=${timeframe}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=${isDark ? '12161f' : 'f8fafc'}&theme=${tvTheme}&style=1&timezone=Etc%2FUTC&studies=%5B%22RSI%40tv-basicstudies%22%2C%22MASimple%40tv-basicstudies%22%5D&locale=en`;

  return (
    <div className="w-full bg-[#faf9f6] dark:bg-[#0e1420] border-b border-slate-200 dark:border-slate-800/80 transition-colors print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Ticker & Expand Header Bar */}
        <div className="py-2.5 flex items-center justify-between flex-wrap gap-3">
          {/* Symbol & Session Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-mono text-xs font-black tracking-tight text-slate-900 dark:text-white">
                XAU / USD
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                SPOT GOLD
              </span>
            </div>
          </div>

          {/* Timeframe selector & Expand Toggle */}
          <div className="flex items-center gap-2">
            {isExpanded && (
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">
                {[
                  { label: '15m', val: '15' },
                  { label: '1H', val: '60' },
                  { label: '4H', val: '240' },
                  { label: 'Daily', val: 'D' }
                ].map(tf => (
                  <button
                    key={tf.val}
                    type="button"
                    onClick={() => setTimeframe(tf.val)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      timeframe === tf.val
                        ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <Minimize2 size={13} className="text-slate-600 dark:text-slate-300" />
                  <span className="hidden sm:inline">Collapse Chart</span>
                  <span className="sm:hidden">Close</span>
                </>
              ) : (
                <>
                  <Activity size={13} className="text-amber-500" />
                  <span className="hidden sm:inline">Expand Live Gold Chart</span>
                  <span className="sm:hidden">Live Chart</span>
                  <Maximize2 size={13} className="text-slate-400" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Chart Canvas */}
        {isExpanded && (
          <div className="pb-4 pt-1 animate-fadeIn">
            <div className="w-full h-[320px] sm:h-[540px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-inner">
              <iframe
                title="Live XAUUSD TradingView Chart"
                src={iframeSrc}
                className="w-full h-full border-0"
                loading="lazy"
                allow="autoplay"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1 font-mono">
              <span>● Source: OANDA XAU/USD Spot Gold via TradingView Engine</span>
              <span>Rule 04: Exit MT5 Immediately After Target or Loss Hit</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
