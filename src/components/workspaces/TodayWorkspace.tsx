import React, { useState, useMemo } from 'react';
import { useCockpit } from '../../context/CockpitContext';
import {
  ShieldCheck,
  Zap,
  Calculator,
  CheckCircle2,
  Minimize2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Building2,
  Calendar,
  Lock,
  Flame,
  Check
} from 'lucide-react';

interface TodayWorkspaceProps {
  onEnterZen: () => void;
  onNavigateToRoadmap: () => void;
  onNavigateToJournal: () => void;
  onNavigateToAccounts: () => void;
}

export const TodayWorkspace: React.FC<TodayWorkspaceProps> = ({
  onEnterZen,
  onNavigateToRoadmap,
  onNavigateToJournal,
  onNavigateToAccounts
}) => {
  const {
    activeAccount,
    accounts,
    switchAccount,
    devotionGatePassedToday,
    toggleDevotionGate,
    quarters,
    journalNotes
  } = useCockpit();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // Find active week for lot sizing
  const activeWeek = useMemo(() => {
    for (const q of quarters) {
      for (const m of q.months) {
        for (const w of m.weeks) {
          const hasPending = w.days.some(d => d.status === 'pending');
          if (hasPending) return w;
        }
      }
    }
    return quarters[0]?.months[0]?.weeks[0];
  }, [quarters]);

  // Find next pending day in active week
  const pendingDay = useMemo(() => {
    return activeWeek?.days.find(d => d.status === 'pending') || activeWeek?.days[0];
  }, [activeWeek]);

  // Mini lot calculator inside Today Workspace
  const [stopLossPips, setStopLossPips] = useState<number>(20);
  const [maxRiskDollars, setMaxRiskDollars] = useState<number>(() => {
    return activeAccount ? Math.round(activeAccount.startingBalance * 0.02) || 2 : 2;
  });

  const calculatedLots = useMemo(() => {
    if (stopLossPips <= 0) return 0.01;
    // Pip value on XAUUSD: 1 lot = $10/pip, 0.01 lot = $0.10/pip
    const lot = maxRiskDollars / (stopLossPips * 10);
    const rounded = Math.floor(lot * 100) / 100;
    return Math.max(0.01, rounded);
  }, [maxRiskDollars, stopLossPips]);

  // Today's notes
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayNotesCount = journalNotes.filter(n => n.date === todayDateStr || n.createdAt.startsWith(todayDateStr)).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Header Banner: Active Account & Zen Trigger */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>TODAY'S EXECUTION DESK</span>
              </span>

              {/* Account Dropdown Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#0082ff] transition-all cursor-pointer"
                >
                  <Building2 size={12} className="text-[#0082ff]" />
                  <span>{activeAccount?.name || 'Personal $50'}</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#151d2f] border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Switch Active Account:
                    </div>
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          switchAccount(acc.id);
                          setIsAccountMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs font-mono flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                          acc.id === activeAccount?.id ? 'text-[#0082ff] font-bold bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${acc.id === activeAccount?.id ? 'bg-[#0082ff]' : 'bg-slate-400'}`}></span>
                          <span className="truncate">{acc.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ${acc.startingBalance.toLocaleString()}
                        </span>
                      </button>
                    ))}
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onNavigateToAccounts();
                        }}
                        className="w-full py-1 text-center text-[11px] font-mono text-[#0082ff] hover:underline"
                      >
                        + Manage / Add Accounts
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Quiet Execution. Unshakable Rules.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Maintain serenity, execute the prescribed lot size, and honor your 20-pip stops. Today's compound milestone moves the entire roadmap forward.
            </p>
          </div>

          {/* Quick Action Zen Mode Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onEnterZen}
              className="px-5 py-3 rounded-2xl bg-slate-900 dark:bg-emerald-500/20 text-white dark:text-emerald-300 border border-slate-800 dark:border-emerald-500/40 font-mono text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Minimize2 size={14} className="text-emerald-400" />
              <span>Zen Focus Mode (Z)</span>
            </button>
          </div>
        </div>

        {/* 3 Core Execution Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          {/* Equity */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Active Working Equity</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
              ${(activeAccount?.currentEquity || 50).toLocaleString()}
            </div>
            <div className="text-[11px] text-blue-500 mt-1 flex items-center gap-1 font-mono">
              <TrendingUp size={11} />
              <span>Target: ${(activeAccount?.profitTarget || 37150).toLocaleString()}</span>
            </div>
          </div>

          {/* Lot Size */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Today's Target & Lot Size</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-baseline gap-2">
              <span>{activeWeek?.lot || '0.01'} Lot</span>
              <span className="text-xs font-normal text-slate-400 font-mono">· 20 Pips</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {activeWeek?.num ? `Week ${activeWeek.num}` : 'Week 1'} · Daily Goal: {pendingDay?.pnl || '+$2.50'}
            </div>
          </div>

          {/* Daily Loss Limit */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Daily Loss Killswitch Limit</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
              ${(activeAccount?.dailyLossLimit || 20).toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-500/80 mt-1 font-mono flex items-center gap-1">
              <ShieldCheck size={11} />
              <span>Automatic stop line — zero revenge</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tactical Execution Grid: Lot Calculator & Devotion Pre-flight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Quick Precision Lot Calculator */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-[#0082ff]" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Live Lot & Risk Calculator
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">XAU/USD Gold Sizer</span>
          </div>

          <div className="space-y-4">
            {/* Stop Loss Pips */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-400">Stop Loss Distance:</span>
                <span className="font-bold text-slate-900 dark:text-white">{stopLossPips} Pips ($0.10/pip on 0.01 lot)</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={stopLossPips}
                onChange={e => setStopLossPips(parseInt(e.target.value))}
                className="w-full accent-[#0082ff] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10 Pips (Tight)</span>
                <span>20 Pips (Rule 05 Standard)</span>
                <span>50 Pips</span>
              </div>
            </div>

            {/* Risk in Dollars */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-400">Dollar Risk Budget:</span>
                <span className="font-bold text-slate-900 dark:text-white">${maxRiskDollars}</span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(50, Math.round((activeAccount?.startingBalance || 50) * 0.1))}
                step={1}
                value={maxRiskDollars}
                onChange={e => setMaxRiskDollars(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$1</span>
                <span>${maxRiskDollars}</span>
                <span>Max ${(activeAccount?.dailyLossLimit || 20)}</span>
              </div>
            </div>

            {/* Punch Into MT5 Output Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Order Volume for MT5 / cTrader:
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {calculatedLots} <span className="text-xs text-slate-400">Lots</span>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <div>Pip Val: ${(calculatedLots * 10).toFixed(2)}</div>
                <div className="text-rose-500 font-bold">Max Loss: ${maxRiskDollars}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Rule 01 Devotion & Pre-Flight Checklist */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Rule 01 Spiritual Mindset Gate
                </h2>
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                devotionGatePassedToday
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {devotionGatePassedToday ? 'ALIGNED ✓' : 'GATE PENDING'}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              "I surrender the outcome to the market. I honor the 20-pip stop as my highest form of self-respect. If the market gives no edge today, my discipline in doing nothing protects my future wealth."
            </p>

            <div className="space-y-2.5">
              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-xs font-mono">
                <input
                  type="checkbox"
                  checked={devotionGatePassedToday}
                  onChange={toggleDevotionGate}
                  className="rounded text-[#0082ff] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  I have meditated on Rule 01 and feel complete stillness.
                </span>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs font-mono">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  Fixed 20-pip stop loss will be entered simultaneously with entry.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onNavigateToJournal}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#0082ff] hover:bg-[#0070df] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Calendar size={14} />
              <span>Log Session / Journal Trade</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToRoadmap}
              className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <span>View 48-Week Plan</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
