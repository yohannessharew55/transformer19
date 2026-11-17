/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CockpitProvider, useCockpit } from './context/CockpitContext';
import { TopActionBar } from './components/TopActionBar';
import { HeroBanner } from './components/HeroBanner';
import { LiveMetricsGrid } from './components/LiveMetricsGrid';
import { SectionNavTabs } from './components/SectionNavTabs';
import { DailyTradingJournal } from './components/DailyTradingJournal';
import { TradeCalculator } from './components/TradeCalculator';
import { PerformanceRatingSection } from './components/PerformanceRatingSection';
import { UpdatedResultsSection } from './components/UpdatedResultsSection';
import { GrowthChart } from './components/GrowthChart';
import { PerformanceSummary } from './components/PerformanceSummary';
import { DisciplineCards } from './components/DisciplineCards';
import { AuditSection } from './components/AuditSection';
import { QuarterMatrix } from './components/QuarterMatrix';
import { WeeklyObjectivesSection } from './components/WeeklyObjectivesSection';
import { PlanVsActualPage } from './components/PlanVsActualPage';
import { PlanCsvModal } from './components/PlanCsvModal';
import { DataBackupModal } from './components/DataBackupModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { PrintReportHeader } from './components/PrintReportHeader';
import { BrokerTelemetrySection } from './components/BrokerTelemetrySection';
import { RiskCircuitBreakerSection } from './components/RiskCircuitBreakerSection';
import { InstitutionalQuantAnalytics } from './components/InstitutionalQuantAnalytics';
import { MultiAccountPortfolioSection } from './components/MultiAccountPortfolioSection';
import { PlannerSection } from './components/PlannerSection';
import { InstitutionalTearsheetReport } from './components/InstitutionalTearsheetReport';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Database, ShieldCheck } from 'lucide-react';

const CockpitMainContent: React.FC = () => {
  const { theme, activeNavTab, traderName, firestoreConnected } = useCockpit();
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isPlanCsvModalOpen, setIsPlanCsvModalOpen] = useState(false);

  return (
    <div
      data-theme={theme}
      className={`${
        theme === 'dark' ? 'dark dark-mode bg-[#0b0f17] text-slate-100' : 'bg-[#fafaf9] text-slate-900'
      } min-h-screen min-h-[100dvh] pb-[env(safe-area-inset-bottom)] flex flex-col font-sans transition-colors duration-200 relative`}
    >
      {/* Sticky Top Navigation & Controls */}
      <TopActionBar
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenPlanCsvModal={() => setIsPlanCsvModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Dedicated Print Report Header (Exclusively visible when generating PDF) */}
        <PrintReportHeader />

        {/* Hero Dossier Banner (Image 2 with Big Fonts) */}
        <HeroBanner />

        {/* App Switcher: Execution Hierarchy as #1 Top App */}
        <SectionNavTabs />

        {/* 1. Execution Hierarchy (Core Master Roadmap on Top) */}
        {activeNavTab === 'cockpit' && (
          <QuarterMatrix />
        )}

        {/* Dedicated 1-Year Master Trade Planner Section */}
        {activeNavTab === 'planner' && (
          <PlannerSection />
        )}

        {/* Feature 4: Multi-Account & Prop Firm Portfolio */}
        {activeNavTab === 'portfolio' && (
          <MultiAccountPortfolioSection />
        )}

        {/* Feature 3: Institutional Quant Suite & 10,000 Monte Carlo */}
        {activeNavTab === 'quant' && (
          <InstitutionalQuantAnalytics />
        )}

        {/* Feature 2: Hard Risk Guard & Automated Killswitch */}
        {activeNavTab === 'riskGuard' && (
          <RiskCircuitBreakerSection />
        )}

        {/* Feature 1: Automated Broker Telemetry & Real-Time Sync */}
        {activeNavTab === 'brokerSync' && (
          <BrokerTelemetrySection />
        )}

        {/* Feature 6: Institutional Investor Tearsheet & PDF Dossier */}
        {activeNavTab === 'tearsheet' && (
          <InstitutionalTearsheetReport />
        )}

        {/* 2. Dedicated Weekly Execution Objectives View */}
        {activeNavTab === 'objectives' && (
          <WeeklyObjectivesSection />
        )}

        {/* 3. Dedicated Plan vs. Actual Graph Chart View */}
        {activeNavTab === 'planVsActual' && (
          <PlanVsActualPage />
        )}

        {/* 4. Performance Summary, Win/Loss, Profit Factor & Growth Curve */}
        {activeNavTab === 'analytics' && (
          <div className="space-y-8">
            <PerformanceSummary />
            <GrowthChart />
            <UpdatedResultsSection />
          </div>
        )}

        {/* 4. Daily Trading Journal View (Dedicated Tactile Sticky Notes) */}
        {activeNavTab === 'journal' && (
          <DailyTradingJournal />
        )}

        {/* 5. Precision Trade & Risk Calculator */}
        {activeNavTab === 'calculator' && (
          <TradeCalculator />
        )}

        {/* 6. Gemini AI Performance Rating Section */}
        {activeNavTab === 'rating' && (
          <PerformanceRatingSection />
        )}

        {/* 7. The 6 Master Execution Disciplines & Audit */}
        {activeNavTab === 'disciplines' && (
          <div className="space-y-8">
            <DisciplineCards />
            <AuditSection />
          </div>
        )}

        {/* 8. Forensic Audit & System Truth */}
        {activeNavTab === 'audit' && (
          <AuditSection />
        )}
      </main>

      {/* Clean Architectural Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 px-4 sm:px-6 text-xs text-slate-500 bg-[#faf9f6] dark:bg-[#0c101a] print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-slate-900 dark:text-white uppercase font-sans tracking-tight">
              Transformer19 Trading Cockpit
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Trader: {traderName}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>48-Week Execution Blueprint</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${firestoreConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span>{firestoreConnected ? 'LibSQL / SQLite Database Synchronized' : 'Local Storage Mode'}</span>
            </div>
            <span>·</span>
            <span>Elegant · Simple · Systematic</span>
          </div>
        </div>
      </footer>

      {/* Data Backup & Restore Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onOpenPlanCsvModal={() => setIsPlanCsvModalOpen(true)}
      />

      {/* Anytime Schedule Plan CSV Modal */}
      <PlanCsvModal
        isOpen={isPlanCsvModalOpen}
        onClose={() => setIsPlanCsvModalOpen(false)}
      />

      {/* Floating Move to Up Button on Right Corner */}
      <ScrollToTopButton />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <CockpitProvider>
        <CockpitMainContent />
      </CockpitProvider>
    </ErrorBoundary>
  );
}
