import React, { useState, useMemo } from 'react';
import { useCockpit } from '../context/CockpitContext';
import {
  Calculator,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';

interface InstrumentPreset {
  symbol: string;
  name: string;
  pipSize: number; // 0.1 for Gold ($0.10 movement = 1 pip), 0.0001 for EURUSD
  contractMultiplier: number;
}

const INSTRUMENTS: InstrumentPreset[] = [
  { symbol: 'XAUUSD', name: 'Gold (XAU/USD)', pipSize: 0.1, contractMultiplier: 100 },
  { symbol: 'EURUSD', name: 'EUR / USD', pipSize: 0.0001, contractMultiplier: 100000 },
  { symbol: 'GBPUSD', name: 'GBP / USD', pipSize: 0.0001, contractMultiplier: 100000 },
  { symbol: 'USDJPY', name: 'USD / JPY', pipSize: 0.01, contractMultiplier: 100000 }
];

export const TradeCalculator: React.FC = () => {
  const { metrics, quarters } = useCockpit();

  // State
  const [accountBalance, setAccountBalance] = useState<number>(() => {
    return metrics.currentWorkingEquity || 50;
  });
  const [selectedSymbol, setSelectedSymbol] = useState<string>('XAUUSD');
  const [riskType, setRiskType] = useState<'percent' | 'cash'>('cash');
  const [riskPercent, setRiskPercent] = useState<number>(2.0); // 2%
  const [riskCash, setRiskCash] = useState<number>(20.0); // $20
  const [stopLossPips, setStopLossPips] = useState<number>(20); // 20 pips
  const [takeProfitPips, setTakeProfitPips] = useState<number>(50); // 50 pips (1:2.5)
  const [selectedLotPreset, setSelectedLotPreset] = useState<string>('auto');

  const instrument = useMemo(() => {
    return INSTRUMENTS.find(i => i.symbol === selectedSymbol) || INSTRUMENTS[0];
  }, [selectedSymbol]);

  // Calculations
  const calculatedRiskAmount = useMemo(() => {
    if (riskType === 'percent') {
      return (accountBalance * riskPercent) / 100;
    }
    return Math.min(riskCash, accountBalance);
  }, [riskType, riskPercent, riskCash, accountBalance]);

  // Recommended Lot Size Calculation
  // For Gold: 0.01 lot = $0.10 per 0.1 price move (1 pip). 20 pips = $2.00 per 0.01 lot.
  // Formula: Lot = RiskAmount / (StopLossPips * ValuePerPipPerLot)
  const calculatedLotSize = useMemo(() => {
    if (stopLossPips <= 0) return 0.01;
    let pipValuePerLot = 10; // Default $10/pip on 1.00 lot for standard pairs
    if (instrument.symbol === 'XAUUSD') {
      pipValuePerLot = 10; // 1.0 lot on Gold = 100 oz. $0.10 move = $10.00. 0.01 lot = $0.10.
    }
    const rawLot = calculatedRiskAmount / (stopLossPips * pipValuePerLot);
    // Round to 2 decimal places (standard micro-lot precision 0.01)
    const rounded = Math.floor(rawLot * 100) / 100;
    return Math.max(0.01, rounded);
  }, [calculatedRiskAmount, stopLossPips, instrument]);

  const activeLotSize = useMemo(() => {
    if (selectedLotPreset !== 'auto') {
      return parseFloat(selectedLotPreset);
    }
    return calculatedLotSize;
  }, [selectedLotPreset, calculatedLotSize]);

  // Actual Risk & Profit with active lot size
  const actualRiskDollar = useMemo(() => {
    let pipValue = activeLotSize * 10;
    return stopLossPips * pipValue;
  }, [activeLotSize, stopLossPips]);

  const actualProfitDollar = useMemo(() => {
    let pipValue = activeLotSize * 10;
    return takeProfitPips * pipValue;
  }, [activeLotSize, takeProfitPips]);

  const riskRewardRatio = useMemo(() => {
    if (stopLossPips <= 0) return 0;
    return Math.round((takeProfitPips / stopLossPips) * 100) / 100;
  }, [stopLossPips, takeProfitPips]);

  const balanceAfterWin = useMemo(() => {
    return accountBalance + actualProfitDollar;
  }, [accountBalance, actualProfitDollar]);

  const balanceAfterLoss = useMemo(() => {
    return Math.max(0, accountBalance - actualRiskDollar);
  }, [accountBalance, actualRiskDollar]);

  // Transformer19 Maximum Authorized Lot Size for current capital
  const authorizedMaxLot = useMemo(() => {
    if (accountBalance < 150) return 0.01;
    if (accountBalance < 500) return 0.02;
    if (accountBalance < 1500) return 0.05;
    if (accountBalance < 5000) return 0.10;
    if (accountBalance < 15000) return 0.30;
    if (accountBalance < 50000) return 1.00;
    return 2.50;
  }, [accountBalance]);

  const isLotOverAuthorized = activeLotSize > authorizedMaxLot;

  return (
    <div className="scandi-card p-5 sm:p-7 mb-10 border border-slate-200 dark:border-slate-800/90 shadow-sm animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800/80 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#e07a5f] bg-[#e07a5f]/10 px-2 py-0.5 rounded-md">
              Precision Risk Engine
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-[11px] font-mono text-slate-500">Transformer19 Rule Compliance</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calculator className="text-[#e07a5f]" size={22} />
            <span>Position Size & Risk Calculator</span>
          </h3>
        </div>

        {/* Sync Balance with Active Retained Equity */}
        <button
          type="button"
          onClick={() => setAccountBalance(metrics.currentWorkingEquity || 50)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-[#e07a5f] transition-colors cursor-pointer self-start sm:self-auto"
          title="Reset to active cockpit working equity"
        >
          <RefreshCw size={12} />
          <span>Sync Cockpit Equity: ${metrics.currentWorkingEquity?.toFixed(2) || '50.00'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Account Balance & Instrument */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Working Account Equity ($)
              </label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={accountBalance}
                  onChange={e => setAccountBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#e07a5f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Target Instrument
              </label>
              <select
                value={selectedSymbol}
                onChange={e => setSelectedSymbol(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#e07a5f] cursor-pointer"
              >
                {INSTRUMENTS.map(i => (
                  <option key={i.symbol} value={i.symbol}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Risk Allocation Mode */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Risk Model
              </label>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setRiskType('cash')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    riskType === 'cash'
                      ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Fixed USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setRiskType('percent')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    riskType === 'percent'
                      ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Account %
                </button>
              </div>
            </div>

            {riskType === 'cash' ? (
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={riskCash}
                  onChange={e => setRiskCash(parseFloat(e.target.value) || 0)}
                  placeholder="20.00"
                  className="w-full bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#e07a5f]"
                />
              </div>
            ) : (
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="10"
                  value={riskPercent}
                  onChange={e => setRiskPercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#e07a5f]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  % of Equity (${calculatedRiskAmount.toFixed(2)})
                </span>
              </div>
            )}
          </div>

          {/* 3. Stop Loss & Take Profit in Pips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-rose-600 dark:text-rose-400 mb-1.5 flex items-center justify-between">
                <span>Stop Loss (Pips)</span>
                <span className="text-[10px] opacity-75 font-normal">Plan Std: 20 pips</span>
              </label>
              <input
                type="number"
                step="1"
                min="5"
                value={stopLossPips}
                onChange={e => setStopLossPips(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-[#121927] border border-rose-200 dark:border-rose-900/40 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center justify-between">
                <span>Take Profit (Pips)</span>
                <span className="text-[10px] opacity-75 font-normal">Plan Std: 50 pips</span>
              </label>
              <input
                type="number"
                step="1"
                min="5"
                value={takeProfitPips}
                onChange={e => setTakeProfitPips(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-[#121927] border border-emerald-200 dark:border-emerald-900/40 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 4. Lot Size Selector (Auto or Manual Override) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Lot Execution Size
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                Ladder Limit: <strong className="text-emerald-600 dark:text-emerald-400">{authorizedMaxLot} Lot</strong>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedLotPreset('auto')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedLotPreset === 'auto'
                    ? 'bg-slate-900 text-white dark:bg-[#e07a5f] border-transparent'
                    : 'bg-slate-50 dark:bg-[#121927] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Auto ({calculatedLotSize})
              </button>
              {['0.01', '0.02', '0.05'].map(lot => (
                <button
                  key={lot}
                  type="button"
                  onClick={() => setSelectedLotPreset(lot)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    selectedLotPreset === lot
                      ? 'bg-slate-900 text-white dark:bg-[#e07a5f] border-transparent'
                      : 'bg-slate-50 dark:bg-[#121927] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {lot} Lot
                </button>
              ))}
            </div>
          </div>

          {/* Over-leveraging Warning Badge */}
          {isLotOverAuthorized && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <div>
                <strong>Discipline Warning:</strong> Your selected lot size ({activeLotSize} lot) exceeds the authorized Transformer19 limit ({authorizedMaxLot} lot) for ${accountBalance.toFixed(2)} equity. Adhere to Rule 05 (demotion protocol).
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Output Simulation (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-[#faf9f6] dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/80">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
              Execution Projection
            </div>

            {/* Recommended Lot Size Big Highlight */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                  Recommended Position Size
                </span>
                <span className="font-mono text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {activeLotSize} <span className="text-xs font-bold text-slate-500">LOT</span>
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
            </div>

            {/* R:R and Pip Value Details */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500">Risk-to-Reward (R:R):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  1 : {riskRewardRatio} {riskRewardRatio >= 2 ? '✓ High Edge' : '• Moderate'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500">Stop Loss Risk:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  -${actualRiskDollar.toFixed(2)} ({((actualRiskDollar / accountBalance) * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500">Target Profit Harvest:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +${actualProfitDollar.toFixed(2)} (+{((actualProfitDollar / accountBalance) * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500">Projected Win Balance:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ${balanceAfterWin.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Projected Loss Balance:</span>
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  ${balanceAfterLoss.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Execution Tip */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info size={13} className="shrink-0 text-[#e07a5f]" />
            <span>
              On XAU/USD, 0.01 lot = $0.10 per pip. 20 pips SL locks max drawdown at $2.00, preserving capital for London/NY re-entries.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
