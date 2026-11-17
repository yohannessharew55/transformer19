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
import { InstitutionalQuantAnalytics } from './components/InstitutionalQuantAnalytics';
import { MultiAccountPortfolioSection } from './components/MultiAccountPortfolioSection';
import { PlannerSection } from './components/PlannerSection';
import { InstitutionalTearsheetReport } from './components/InstitutionalTearsheetReport';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HierarchyWorkspace } from './components/workspaces/HierarchyWorkspace';
import { JournalRiskWorkspace } from './components/workspaces/JournalRiskWorkspace';
import { LogPerformanceWorkspace } from './components/workspaces/LogPerformanceWorkspace';
import { AccountsRiskWorkspace } from './components/workspaces/AccountsRiskWorkspace';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Database, ShieldCheck } from 'lucide-react';

const CockpitMainContent: React.FC = () => {
  const {
    theme,
    traderName,
    firestoreConnected,
    activeNavTab,
    workspaceMode,
    setWorkspaceMode
  } = useCockpit();
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-8">
        {/* Dedicated Print Report Header (Exclusively visible when generating PDF) */}
        <PrintReportHeader />

        {/* Hero Dossier Banner (Editable Per Account & Plan) */}
        <HeroBanner />

        {/* Workspace & Navigation Tabs */}
        <div id="navigation-tabs-section" className="scroll-mt-20">
          <SectionNavTabs />
        </div>

        {/* Workspace Container */}
        <div id="workspace-container" className="scroll-mt-20">
          {/* WORKSPACE 1: EXECUTION HIERARCHY (Primary Front & Center) */}
          {workspaceMode === 'hierarchy' && (
            <HierarchyWorkspace />
          )}

          {/* WORKSPACE 2: PORTFOLIO ACCOUNTS (Replaced Planner) */}
          {(workspaceMode === 'accounts' || workspaceMode === 'planner') && (
            <div id="accounts-portfolio-section" className="scroll-mt-20">
              <MultiAccountPortfolioSection />
            </div>
          )}

          {/* WORKSPACE 3: JOURNAL & RISK (Unified Daily Journal, Risk Circuit Breaker, 6 Rules, Desks, Curves) */}
          {(workspaceMode === 'journalRisk' || workspaceMode === 'performance') && (
            <JournalRiskWorkspace />
          )}

          {/* CLASSIC 14 PROGRAMS VIEW (Only active when user switches to 'classic') */}
          {workspaceMode === 'classic' && (
            <div id="classic-workspace-content" className="space-y-8 scroll-mt-20">
              {activeNavTab === 'cockpit' && <QuarterMatrix />}
              {activeNavTab === 'planner' && <PlannerSection />}
              {activeNavTab === 'portfolio' && <MultiAccountPortfolioSection />}
              {activeNavTab === 'quant' && <InstitutionalQuantAnalytics />}
              {activeNavTab === 'riskGuard' && <DisciplineCards />}
              {activeNavTab === 'brokerSync' && <BrokerTelemetrySection />}
              {activeNavTab === 'tearsheet' && <InstitutionalTearsheetReport />}
              {activeNavTab === 'objectives' && <WeeklyObjectivesSection />}
              {activeNavTab === 'planVsActual' && <PlanVsActualPage />}
              {activeNavTab === 'analytics' && (
                <div className="space-y-8">
                  <PerformanceSummary />
                  <GrowthChart />
                  <UpdatedResultsSection />
                </div>
              )}
              {activeNavTab === 'journal' && <DailyTradingJournal />}
              {activeNavTab === 'calculator' && <TradeCalculator />}
              {activeNavTab === 'rating' && <PerformanceRatingSection />}
              {activeNavTab === 'disciplines' && (
                <div className="space-y-8">
                  <DisciplineCards />
                  <AuditSection />
                </div>
              )}
              {activeNavTab === 'audit' && <AuditSection />}
            </div>
          )}
        </div>
      </main>

      {/* Clean Architectural Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 px-4 sm:px-6 pb-24 sm:pb-8 text-xs text-slate-500 bg-[#faf9f6] dark:bg-[#0c101a] print:hidden">
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

      {/* Mobile Bottom Navigation Bar (Today | Plan | Rules | Growth | Journal) */}
      <MobileBottomNav />

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
