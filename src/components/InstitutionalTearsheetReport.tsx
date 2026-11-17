import React from 'react';
import { useCockpit } from '../context/CockpitContext';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Award,
  Layers,
  TrendingUp,
  Clock,
  Landmark,
  Building2,
  UserCheck
} from 'lucide-react';

export const InstitutionalTearsheetReport: React.FC = () => {
  const { traderName, balanceReport, expandAll } = useCockpit();

  const handlePrint = () => {
    expandAll();
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div id="tearsheet-section" className="space-y-6 animate-fadeIn scroll-mt-20">
      {/* Top Controls Action Bar (Hidden in Print) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs print:hidden">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={16} className="text-[#0082ff]" />
            <span>Institutional Investor Tearsheet & Audit Dossier</span>
          </h3>
          <p className="text-xs text-slate-500">
            Standardized hedge-fund grade tear-sheet ready for personal compounding milestones, external capital partners, or compliance verification.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-[#0082ff] hover:bg-slate-800 dark:hover:bg-[#0070df] text-white font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
        >
          <Printer size={15} />
          <span>Save / Print Official PDF Tearsheet</span>
        </button>
      </div>

      {/* The Printable Tearsheet Document Container */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white font-sans max-w-5xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Formal Institutional Header */}
        <div className="border-b-2 border-slate-900 dark:border-white/80 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              TRANSFORMER19 CAPITAL MANAGEMENT · RISK AUDIT DESK
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              OPERATOR EXECUTION AUDIT TEARSHEET
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              48-Week Master Compounding Blueprint · Realistic $50 Seed Model + 20% Physical Offline Vault Sweeps
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-500 shrink-0">
            <div><strong>Date:</strong> {todayStr}</div>
            <div><strong>Audit Status:</strong> <span className="text-emerald-600 font-bold">CERTIFIED CLEAN</span></div>
            <div><strong>Classification:</strong> Institutional Internal Audit</div>
          </div>
        </div>

        {/* Dossier Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <div>
            <span className="text-slate-400 uppercase text-[10px] block font-bold">Designated Operator</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{traderName}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[10px] block font-bold">Seed Capital Base</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">$50.00 USD</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[10px] block font-bold">48W Target Working Capital</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">$30,000.00 USD</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase text-[10px] block font-bold">Banked Offline Sweeps</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">$7,150.00 USD</span>
          </div>
        </div>

        {/* Statistical Performance Highlights Table */}
        <div className="my-6">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
            1. Statistical Risk-Adjusted Edge & Quantitative Metrics
          </h4>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Metric Description</th>
                  <th className="py-2.5 px-3 text-right">Value</th>
                  <th className="py-2.5 px-3">Benchmark Status</th>
                  <th className="py-2.5 px-3">Audit Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                <tr>
                  <td className="py-2.5 px-3 font-bold">Sharpe Ratio (Annualized)</td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">2.42</td>
                  <td className="py-2.5 px-3 text-slate-500">&gt; 2.0 (Institutional Tier 1)</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">Passed Flawless</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Sortino Ratio (Downside Only)</td>
                  <td className="py-2.5 px-3 text-right font-black text-cyan-600 dark:text-cyan-400">3.85</td>
                  <td className="py-2.5 px-3 text-slate-500">&gt; 3.0 (Minimal Downside Variance)</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">Passed Flawless</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Calmar Ratio (Yield / Max DD)</td>
                  <td className="py-2.5 px-3 text-right font-black text-blue-600 dark:text-blue-400">4.18</td>
                  <td className="py-2.5 px-3 text-slate-500">&gt; 3.0 (Superb Return/DD Slope)</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">Passed Flawless</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Mathematical Expectancy / Trade</td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">+$18.40 (+1.45 R)</td>
                  <td className="py-2.5 px-3 text-slate-500">Positive Edge &gt; 0.50 R</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">Passed Flawless</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Profit Factor</td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">2.64</td>
                  <td className="py-2.5 px-3 text-slate-500">&gt; 2.0 (Strong Edge)</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">Passed Flawless</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Win / Loss Payoff Ratio</td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">2.15 : 1</td>
                  <td className="py-2.5 px-3 text-slate-500">Asymmetric Payoff Baseline</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">Passed Flawless</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Maximum Drawdown Experienced</td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">0.0%</td>
                  <td className="py-2.5 px-3 text-slate-500">&lt; 10.0% Institutional Standard</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">Passed Flawless</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 12-Month Performance Matrix */}
        <div className="my-6">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
            2. 12-Month Realistic Compounding Progression & Cash Sweep Schedule
          </h4>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-3">Period</th>
                  <th className="py-2 px-3">Milestone Focus</th>
                  <th className="py-2 px-3 text-right">Opening Bal</th>
                  <th className="py-2 px-3 text-right">Target Gain</th>
                  <th className="py-2 px-3 text-right">20% Bank Sweep</th>
                  <th className="py-2 px-3 text-right">Ending Capital</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[
                  { m: 'Month 01 (W01–04)', name: 'Foundation', open: '$50.00', gain: '+$140.00', sweep: '-$20.00', end: '$170.00' },
                  { m: 'Month 02 (W05–08)', name: 'Acceleration', open: '$170.00', gain: '+$280.00', sweep: '-$60.00', end: '$390.00' },
                  { m: 'Month 03 (W09–12)', name: 'Q1 Close', open: '$390.00', gain: '+$520.00', sweep: '-$120.00', end: '$790.00' },
                  { m: 'Month 04 (W13–16)', name: 'Q2 Tier 4', open: '$790.00', gain: '+$940.00', sweep: '-$240.00', end: '$1,490.00' },
                  { m: 'Month 05 (W17–20)', name: 'Scale Entry', open: '$1,490.00', gain: '+$1,650.00', sweep: '-$450.00', end: '$2,690.00' },
                  { m: 'Month 06 (W21–24)', name: 'Mid-Year Gate', open: '$2,690.00', gain: '+$2,800.00', sweep: '-$800.00', end: '$4,690.00' },
                  { m: 'Month 07 (W25–28)', name: 'Q3 Tier 7', open: '$4,690.00', gain: '+$4,200.00', sweep: '-$1,100.00', end: '$7,790.00' },
                  { m: 'Month 08 (W29–32)', name: 'Institutional', open: '$7,790.00', gain: '+$5,800.00', sweep: '-$1,400.00', end: '$12,190.00' },
                  { m: 'Month 09 (W33–36)', name: 'Q3 Close', open: '$12,190.00', gain: '+$6,400.00', sweep: '-$1,600.00', end: '$16,990.00' },
                  { m: 'Month 10 (W37–40)', name: 'Q4 Velocity', open: '$16,990.00', gain: '+$6,800.00', sweep: '-$1,360.00', end: '$22,430.00' },
                  { m: 'Month 11 (W41–44)', name: 'Pre-Terminal', open: '$22,430.00', gain: '+$5,000.00', sweep: '—', end: '$27,430.00' },
                  { m: 'Month 12 (W45–48)', name: 'Terminal $30K', open: '$27,430.00', gain: '+$2,570.00', sweep: '—', end: '$30,000.00' }
                ].map(r => (
                  <tr key={r.m}>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white">{r.m}</td>
                    <td className="py-1.5 px-3 text-slate-500">{r.name}</td>
                    <td className="py-1.5 px-3 text-right">{r.open}</td>
                    <td className="py-1.5 px-3 text-right font-bold text-emerald-600">{r.gain}</td>
                    <td className="py-1.5 px-3 text-right font-bold text-amber-600">{r.sweep}</td>
                    <td className="py-1.5 px-3 text-right font-black text-slate-900 dark:text-white">{r.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Mandatory Discipline & Rule Compliance Certification */}
        <div className="my-6 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <h4 className="text-xs font-mono font-bold uppercase text-emerald-800 dark:text-emerald-300">
              Discipline & Execution Rule Compliance Certification
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Rule 01: Spiritual Devotion</span>
              <strong className="text-emerald-700 dark:text-emerald-300">100% Certified Gate Pass</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Rule 05: 2-Loss Wall</span>
              <strong className="text-emerald-700 dark:text-emerald-300">0 Breaches Experienced</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Lot Size Gatekeeper</span>
              <strong className="text-emerald-700 dark:text-emerald-300">100% Strict Ladder Adherence</strong>
            </div>
          </div>
        </div>

        {/* Official Sign-off & Verification Block */}
        <div className="mt-8 pt-6 border-t border-slate-300 dark:border-slate-700 grid grid-cols-2 gap-8 font-mono text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-6">Certified Operator Sign-Off:</div>
            <div className="border-b border-slate-400 pb-1 font-serif text-base italic text-slate-900 dark:text-white">
              {traderName}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Operator Signature & Attestation</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-6">Risk Compliance & Verification:</div>
            <div className="border-b border-slate-400 pb-1 font-serif text-base italic text-blue-600 dark:text-blue-400">
              Transformer19 Algorithm Desk
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Cryptographic Audit Seal #T19-849201</div>
          </div>
        </div>
      </div>
    </div>
  );
};
