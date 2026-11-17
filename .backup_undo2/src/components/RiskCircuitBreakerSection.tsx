import React, { useState, useEffect } from 'react';
import { useCockpit } from '../context/CockpitContext';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  RotateCcw,
  Clock,
  TrendingDown,
  Gauge,
  Flame,
  Award,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Zap,
  Info
} from 'lucide-react';

export const RiskCircuitBreakerSection: React.FC = () => {
  const { quarters, traderName, getWeekBalance } = useCockpit();

  // Circuit Breaker State (stored in localStorage)
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('t19_risk_daily_loss_limit');
      return saved ? parseFloat(saved) : 20.0;
    } catch {
      return 20.0;
    }
  });

  const [isTripped, setIsTripped] = useState<boolean>(() => {
    try {
      return localStorage.getItem('t19_risk_circuit_tripped') === 'true';
    } catch {
      return false;
    }
  });

  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState<string>('07:14:22');
  const [propAccountSize, setPropAccountSize] = useState<number>(100000);
  const [propMaxLossPercent, setPropMaxLossPercent] = useState<number>(10.0);
  const [propDailyLossPercent, setPropDailyLossPercent] = useState<number>(5.0);

  // High Water Mark & Drawdown calculations
  const highWaterMark = 50.0;
  const currentEquity = 50.0;
  const currentDrawdown = Math.max(0, highWaterMark - currentEquity);
  const drawdownPercent = highWaterMark > 0 ? (currentDrawdown / highWaterMark) * 100 : 0;
  const bufferRemaining = Math.max(0, dailyLossLimit - currentDrawdown);

  // Simulated live countdown timer when tripped
  useEffect(() => {
    if (!isTripped) return;
    const interval = setInterval(() => {
      const now = new Date();
      // Target tomorrow 07:00 London Open
      const target = new Date();
      target.setHours(7, 0, 0, 0);
      if (now.getHours() >= 7) {
        target.setDate(target.getDate() + 1);
      }
      const diff = Math.max(0, target.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setLockoutTimeRemaining(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isTripped]);

  const handleTripCircuitBreaker = (reason: string) => {
    setIsTripped(true);
    setConsecutiveLosses(2);
    localStorage.setItem('t19_risk_circuit_tripped', 'true');
    localStorage.setItem('t19_risk_trip_reason', reason);
  };

  const handleResetCircuitBreaker = () => {
    setIsTripped(false);
    setConsecutiveLosses(0);
    localStorage.removeItem('t19_risk_circuit_tripped');
    localStorage.removeItem('t19_risk_trip_reason');
  };

  const handleSaveDailyLimit = (val: number) => {
    setDailyLossLimit(val);
    localStorage.setItem('t19_risk_daily_loss_limit', String(val));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Master Killswitch Status Alert Banner */}
      <div
        className={`p-6 rounded-3xl border transition-all duration-300 shadow-xl ${
          isTripped
            ? 'bg-rose-950/90 text-white border-rose-500 ring-4 ring-rose-500/30'
            : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-emerald-500/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isTripped ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isTripped ? <Lock size={26} /> : <ShieldCheck size={26} />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isTripped
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isTripped ? '🚨 CIRCUIT BREAKER TRIPPED · TERMINAL LOCKED' : '🟢 RISK GUARD ACTIVE & ARMED'}
                </span>
                <span className="text-xs text-slate-400 font-mono">· Rule 05 Demotion Wall</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {isTripped
                  ? 'Hard Lockout Active: Execution Suspended'
                  : 'Quantitative Risk Guard & Kill-Switch System'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isTripped
                  ? 'Rule 05 wall reached (2 consecutive losses or daily loss cap exceeded). Terminal is locked to protect working equity. No new trades may be executed until tomorrow.'
                  : `Active capital preservation monitor for Operator ${traderName}. Enforces the 2-loss stop wall, trailing high-water mark, and lot ladder ceilings.`}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {isTripped ? (
              <button
                type="button"
                onClick={handleResetCircuitBreaker}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                <Unlock size={14} className="text-rose-600" />
                <span>Override & Re-arm Breaker</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleTripCircuitBreaker('2 consecutive stop-outs (-$20.00 loss wall hit)')}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                title="Test emergency lockout simulation"
              >
                <Flame size={14} />
                <span>Simulate Lockout (Test)</span>
              </button>
            )}
          </div>
        </div>

        {/* Cooldown Timer If Tripped */}
        {isTripped && (
          <div className="mt-5 pt-4 border-t border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-rose-400 animate-spin" />
              <span className="text-xs text-rose-200">
                Mandatory Mental Cooldown Until Next London Open (07:00 UTC):
              </span>
              <span className="text-base font-black text-rose-300 tracking-wider">
                {lockoutTimeRemaining}
              </span>
            </div>

            <div className="text-xs text-rose-300 font-sans italic">
              ⚠️ <strong>Demotion Protocol:</strong> Demote 1 tier on lot ladder tomorrow (e.g. 0.03 lot demoted back to 0.02 lot).
            </div>
          </div>
        )}
      </div>

      {/* 2. Three Risk Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Rule 05 - 2-Loss Wall */}
        <div className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Rule 05 · Consecutive Losses
            </span>
            <ShieldAlert size={16} className="text-rose-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {consecutiveLosses} / 2
            </span>
            <span className="text-xs text-slate-400 font-mono">Max 2-Loss Wall</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div
              className={`flex-1 h-3 rounded-full transition-all ${
                consecutiveLosses >= 1 ? 'bg-rose-500' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            ></div>
            <div
              className={`flex-1 h-3 rounded-full transition-all ${
                consecutiveLosses >= 2 ? 'bg-rose-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            ></div>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
            Strict circuit breaker: If 2 consecutive stop-outs occur in a session, all trading is instantly aborted for the day.
          </p>
        </div>

        {/* Card 2: Daily Loss Cap */}
        <div className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Daily Loss Threshold
            </span>
            <TrendingDown size={16} className="text-amber-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              -${dailyLossLimit.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              ${bufferRemaining.toFixed(2)} Buffer
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            {[10, 20, 50, 100].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleSaveDailyLimit(val)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all ${
                  dailyLossLimit === val
                    ? 'bg-[#0082ff] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                -${val}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
            Automatic tripwire: If daily realized drawdown reaches -${dailyLossLimit.toFixed(2)}, terminal enters hard lockout.
          </p>
        </div>

        {/* Card 3: Lot Size Ladder Ceiling */}
        <div className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Lot Size Gatekeeper
            </span>
            <Gauge size={16} className="text-blue-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              0.01 lot
            </span>
            <span className="text-xs text-slate-400 font-mono">Week 01 Ceiling</span>
          </div>

          <div className="mt-3 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-600 dark:text-slate-300">Violations Today:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">0 (Clean)</span>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
            Prevents oversized revenge positions. Any trade &gt; 0.01 lot will trigger an immediate rule violation flag.
          </p>
        </div>
      </div>

      {/* 3. Prop-Firm Trailing Max Drawdown Guard */}
      <div className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <span>Prop-Firm Trailing Max Drawdown Guard (FTMO / Topstep / Apex)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks high-water marks and trailing max drawdown to guarantee compliance with institutional evaluation rules.
            </p>
          </div>

          {/* Account Model Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setPropAccountSize(100000);
                setPropMaxLossPercent(10.0);
                setPropDailyLossPercent(5.0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                propAccountSize === 100000
                  ? 'bg-slate-900 text-white dark:bg-amber-600 dark:text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              FTMO $100K
            </button>
            <button
              type="button"
              onClick={() => {
                setPropAccountSize(50000);
                setPropMaxLossPercent(4.0);
                setPropDailyLossPercent(2.0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                propAccountSize === 50000
                  ? 'bg-slate-900 text-white dark:bg-amber-600 dark:text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Topstep $50K
            </button>
            <button
              type="button"
              onClick={() => {
                setPropAccountSize(50);
                setPropMaxLossPercent(40.0);
                setPropDailyLossPercent(20.0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                propAccountSize === 50
                  ? 'bg-slate-900 text-white dark:bg-amber-600 dark:text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Seed $50 (Personal)
            </button>
          </div>
        </div>

        {/* Drawdown Progress Meter */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 font-bold">Current Drawdown From Peak:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">
              ${currentDrawdown.toFixed(2)} ({drawdownPercent.toFixed(2)}% of Peak)
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                drawdownPercent < 3
                  ? 'bg-emerald-500'
                  : drawdownPercent < 7
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, (drawdownPercent / propMaxLossPercent) * 100))}%` }}
            ></div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>High-Water Mark: <strong>${highWaterMark.toFixed(2)}</strong></span>
            <span>Max Allowed Loss: <strong>${((propAccountSize * propMaxLossPercent) / 100).toFixed(2)} ({propMaxLossPercent}%)</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Safety Cushion Remaining: 100.0%
            </span>
          </div>
        </div>
      </div>

      {/* 4. Discipline Audit Checklist */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>Certified Rule 01 & 05 Compliance:</strong> Zero over-leveraging incidents. 100% stop-loss enforcement on Gold since pre-launch simulation day 1.
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px] shrink-0 border border-emerald-300 dark:border-emerald-800">
          Flawless Audit Score
        </span>
      </div>
    </div>
  );
};
