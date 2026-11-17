import React, { useState, useMemo } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { generateTradePlan, GeneratedPlanResult } from '../utils/planGenerator';
import { PortfolioAccount } from '../types';
import {
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
  Download,
  Check,
  ArrowRight,
  Zap,
  Target,
  RefreshCw,
  Building2,
  Lock
} from 'lucide-react';

interface CreateTradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreatedAndActivated: (account: PortfolioAccount, planResult: GeneratedPlanResult) => void;
  onPlanCreatedInactive: (account: PortfolioAccount, planResult: GeneratedPlanResult) => void;
}

export const CreateTradePlanModal: React.FC<CreateTradePlanModalProps> = ({
  isOpen,
  onClose,
  onPlanCreatedAndActivated,
  onPlanCreatedInactive
}) => {
  const { traderName } = useCockpit();

  const [planName, setPlanName] = useState('1-Year Compounding Master Plan');
  const [initialCapital, setInitialCapital] = useState<number>(50);
  const [annualTarget, setAnnualTarget] = useState<number>(37150);
  const [harvestSweepPercent, setHarvestSweepPercent] = useState<number>(20);
  const [dailyGoalPips, setDailyGoalPips] = useState<number>(20);
  const [instrument, setInstrument] = useState('Gold XAU/USD');
  const [brokerPlatform, setBrokerPlatform] = useState('MetaTrader 5');
  const [activePreviewTab, setActivePreviewTab] = useState<'summary' | 'months' | 'csv'>('summary');
  const [isApplying, setIsApplying] = useState(false);

  // Live generated plan preview
  const generatedPlan: GeneratedPlanResult = useMemo(() => {
    return generateTradePlan({
      planName,
      initialCapital,
      annualTarget,
      harvestSweepPercent,
      dailyGoalPips,
      instrument
    });
  }, [planName, initialCapital, annualTarget, harvestSweepPercent, dailyGoalPips, instrument]);

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    const blob = new Blob([generatedPlan.csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${planName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_48w_plan.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const createAccountObject = (isActive: boolean): PortfolioAccount => {
    return {
      id: `acc_plan_${Date.now()}`,
      name: planName.trim() || 'Custom Compounding Account',
      broker: brokerPlatform.trim() || 'MetaTrader 5',
      accountNumber: `PLN-${Math.floor(Math.random() * 900000 + 100000)}`,
      category: initialCapital >= 50000 ? 'prop_evaluation' : 'personal_compounding',
      currency: 'USD',
      startingBalance: generatedPlan.seedCapital,
      currentEquity: generatedPlan.seedCapital,
      highWaterMark: generatedPlan.seedCapital,
      dailyLossLimit: Math.round(generatedPlan.seedCapital * 0.4),
      maxTrailingDrawdownLimit: Math.round(generatedPlan.seedCapital * 0.5),
      profitTarget: generatedPlan.targetTotal,
      isActive,
      status: 'active',
      notes: `Custom 1-Year Trade Plan generated for Operator ${traderName} ($${generatedPlan.seedCapital} → $${generatedPlan.targetTotal})`,
      createdAt: new Date().toISOString().split('T')[0],
      csvSource: generatedPlan.csvString
    };
  };

  const handleSaveAndActivate = async () => {
    setIsApplying(true);
    const acc = createAccountObject(true);
    onPlanCreatedAndActivated(acc, generatedPlan);
    setTimeout(() => {
      setIsApplying(false);
      onClose();
    }, 400);
  };

  const handleSaveInactive = () => {
    const acc = createAccountObject(false);
    onPlanCreatedInactive(acc, generatedPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121927] p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[#0082ff] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                <Sparkles size={11} />
                <span>1-Year Trade Plan Architect</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">· Multi-Account Engine</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Create 1-Year Master Trade Plan & Account
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set seed capital, daily goals, weekly targets, and monthly offline harvest sweeps. Instantly simulate and save as an independent switchable account.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Col 1: Plan Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plan / Account Name
              </label>
              <input
                type="text"
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                placeholder="e.g. $1,000 Prop Challenge Plan"
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Broker / Execution Platform
              </label>
              <input
                type="text"
                value={brokerPlatform}
                onChange={e => setBrokerPlatform(e.target.value)}
                placeholder="e.g. MetaTrader 5 or Tradovate"
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Trading Instrument
              </label>
              <input
                type="text"
                value={instrument}
                onChange={e => setInstrument(e.target.value)}
                placeholder="e.g. Gold XAU/USD"
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
              />
            </div>
          </div>

          {/* Col 2: Capital & Targets */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Initial Starting Money ($)
                </label>
                <div className="flex items-center gap-1">
                  {[50, 100, 1000, 50000, 100000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setInitialCapital(val)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer transition-all ${
                        initialCapital === val
                          ? 'bg-[#0082ff] text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ${val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                value={initialCapital}
                onChange={e => setInitialCapital(Math.max(10, parseFloat(e.target.value) || 50))}
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  1-Year Annual Target Goal ($)
                </label>
                <div className="flex items-center gap-1">
                  {[37150, 50000, 100000, 250000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAnnualTarget(val)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer transition-all ${
                        annualTarget === val
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ${val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                value={annualTarget}
                onChange={e => setAnnualTarget(Math.max(initialCapital * 1.5, parseFloat(e.target.value) || 37150))}
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:border-[#0082ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Goal (Target Pips / Setup)
              </label>
              <input
                type="number"
                value={dailyGoalPips}
                onChange={e => setDailyGoalPips(Math.max(5, parseFloat(e.target.value) || 20))}
                className="w-full bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[#0082ff]"
              />
            </div>
          </div>

          {/* Col 3: Harvest Protocol */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  20% Offline Vault Sweep (%)
                </label>
                <span className="font-mono text-xs font-bold text-amber-600">
                  {harvestSweepPercent}% Monthly
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={harvestSweepPercent}
                onChange={e => setHarvestSweepPercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Withdrawn into physical vault at month-end to lock in gains and prevent giving profits back.
              </p>
            </div>

            {/* Generated Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-700 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Working Capital:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ${generatedPlan.targetRetained.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vaulted Cash Sweeps:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  ${generatedPlan.targetBanked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-bold">Total Target Value:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  ${generatedPlan.targetTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setActivePreviewTab('summary')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activePreviewTab === 'summary'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Plan Overview (48 Weeks)
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('months')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activePreviewTab === 'months'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                12 Months Breakdown
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('csv')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activePreviewTab === 'csv'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                CSV Export Code
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:text-[#0082ff] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Download size={13} />
              <span>Download Plan CSV</span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activePreviewTab === 'summary' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block font-bold">Seed Capital</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  ${generatedPlan.seedCapital.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block font-bold">Total Milestones</span>
                <span className="text-base font-black text-blue-600 dark:text-blue-400">
                  48 Weeks · 252 Days
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block font-bold">Lot Size Range</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  {generatedPlan.lotLadder}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block font-bold">Compounding ROI</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  +{(((generatedPlan.targetTotal - generatedPlan.seedCapital) / generatedPlan.seedCapital) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: 12 Months Breakdown */}
          {activePreviewTab === 'months' && (
            <div className="overflow-x-auto max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] uppercase sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Month</th>
                    <th className="py-2 px-3 text-right">Opening</th>
                    <th className="py-2 px-3 text-right">Vault Sweep</th>
                    <th className="py-2 px-3 text-right">Ending Capital</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {generatedPlan.quarters.flatMap(q => q.months).map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{m.monthNum}</td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">{m.opening}</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-600">{m.bankOut}</td>
                      <td className="py-2 px-3 text-right font-black text-emerald-600">{m.endTarget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: CSV Snippet */}
          {activePreviewTab === 'csv' && (
            <pre className="p-3 rounded-2xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-52 border border-slate-800 leading-relaxed">
              {generatedPlan.csvString.slice(0, 1500)}...
            </pre>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveInactive}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold cursor-pointer transition-all active:scale-95"
            >
              Save as Inactive Account
            </button>

            <button
              type="button"
              disabled={isApplying}
              onClick={handleSaveAndActivate}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Activating Plan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Save & Activate As Active Account Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
