import React from 'react';
import { useCockpit } from '../../context/CockpitContext';
import { scrollToElement } from '../../utils/scrollHelper';
import { MultiAccountPortfolioSection } from '../MultiAccountPortfolioSection';
import { BrokerTelemetrySection } from '../BrokerTelemetrySection';
import { DisciplineCards } from '../DisciplineCards';
import { AuditSection } from '../AuditSection';
import { Building2, ShieldAlert, Radio, ShieldCheck } from 'lucide-react';
import type { ActiveTab } from '../../context/CockpitContext';

export const AccountsRiskWorkspace: React.FC = () => {
  const { activeNavTab, setActiveNavTab } = useCockpit();

  const getSubTabFromNavTab = (tab: string): 'portfolio' | 'risk' | 'telemetry' | 'disciplines' => {
    if (tab === 'riskGuard') return 'risk';
    if (tab === 'brokerSync') return 'telemetry';
    if (tab === 'disciplines' || tab === 'audit') return 'disciplines';
    return 'portfolio';
  };

  // Synchronously derived during render: zero useEffect delay, prevents DOM collapse & scroll clamping
  const activeSubTab = getSubTabFromNavTab(activeNavTab);

  const handleSelectSubTab = (tab: 'portfolio' | 'risk' | 'telemetry' | 'disciplines', elementId?: string) => {
    let targetNavTab: ActiveTab = 'portfolio';
    if (tab === 'risk') targetNavTab = 'riskGuard';
    else if (tab === 'telemetry') targetNavTab = 'brokerSync';
    else if (tab === 'disciplines') targetNavTab = 'disciplines';

    setActiveNavTab(targetNavTab);
    if (elementId) {
      scrollToElement(elementId);
    }
  };

  return (
    <div id="accounts-workspace" className="space-y-6 sm:space-y-8 animate-fadeIn scroll-mt-20">
      {/* Sub-Workspace Selector Pill Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => handleSelectSubTab('portfolio', 'portfolio-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'portfolio'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 size={13} className={activeSubTab === 'portfolio' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>Multi-Account Portfolio</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSubTab('risk', 'risk-circuit-breaker-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'risk'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert size={13} className={activeSubTab === 'risk' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>Hard Risk Guard & Circuit Breaker</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSubTab('telemetry', 'broker-telemetry-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'telemetry'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio size={13} className={activeSubTab === 'telemetry' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>Broker Telemetry & Sync</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSubTab('disciplines', 'disciplines-section')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'disciplines'
                ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck size={13} className={activeSubTab === 'disciplines' ? 'text-[#0082ff]' : 'text-slate-400'} />
            <span>Disciplines & Audit</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Risk & Accounts Governance
        </div>
      </div>

      {/* Render Active View */}
      {activeSubTab === 'portfolio' && <MultiAccountPortfolioSection />}
      {activeSubTab === 'risk' && <DisciplineCards />}
      {activeSubTab === 'telemetry' && <BrokerTelemetrySection />}
      {activeSubTab === 'disciplines' && (
        <div className="space-y-8">
          <DisciplineCards />
          <AuditSection />
        </div>
      )}
    </div>
  );
};
