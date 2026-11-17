import React, { useState } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { PerformanceDetailsModal } from './PerformanceDetailsModal';
import {
  Sun,
  Moon,
  Printer,
  Download,
  FileDown,
  CheckCircle2,
  Menu,
  X,
  Layers,
  TrendingUp,
  ShieldCheck,
  FileCheck2,
  User,
  StickyNote,
  Calculator,
  Sparkles,
  Target,
  Gauge,
  AppWindow,
  Cloud,
  CloudOff,
  RefreshCw,
  FileSpreadsheet,
  GitCompare,
  Building2,
  Brain,
  ShieldAlert,
  Radio,
  FileText,
  ChevronDown,
  Check
} from 'lucide-react';

interface TopActionBarProps {
  onOpenBackupModal: () => void;
  onOpenPlanCsvModal?: () => void;
}

export const TopActionBar: React.FC<TopActionBarProps> = ({ onOpenBackupModal, onOpenPlanCsvModal }) => {
  const {
    theme,
    toggleTheme,
    traderName,
    setTraderName,
    devotionGatePassedToday,
    toggleDevotionGate,
    activeNavTab,
    setActiveNavTab,
    firestoreConnected,
    performanceRating,
    expandAll,
    syncState,
    triggerManualSync,
    activeAccount,
    accounts,
    switchAccount
  } = useCockpit();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(traderName);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const handlePrintReport = () => {
    expandAll();
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const totalPercentage = performanceRating?.totalPercentage ?? 88;
  const ratingBadgeClasses =
    totalPercentage > 75
      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/60'
      : totalPercentage > 50
      ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60'
      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700/60';

  const ratingIconColor =
    totalPercentage > 75 ? 'text-emerald-500' : totalPercentage > 50 ? 'text-amber-500' : 'text-rose-500';

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setTraderName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const navItems = [
    {
      id: 'cockpit' as const,
      label: 'Execution Hierarchy',
      badge: '48 Weeks',
      icon: Layers
    },
    {
      id: 'planner' as const,
      label: 'Trade Planner',
      badge: '1-Year Milestones',
      icon: Sparkles
    },
    {
      id: 'portfolio' as const,
      label: 'Multi-Account Portfolio',
      badge: 'Personal & Prop',
      icon: Building2
    },
    {
      id: 'quant' as const,
      label: 'Quant & Monte Carlo',
      badge: 'Sharpe & 10K',
      icon: Brain
    },
    {
      id: 'riskGuard' as const,
      label: 'Risk & Killswitch',
      badge: 'Rule 05 Wall',
      icon: ShieldAlert
    },
    {
      id: 'brokerSync' as const,
      label: 'Broker Telemetry',
      badge: 'Live Webhooks',
      icon: Radio
    },
    {
      id: 'tearsheet' as const,
      label: 'Investor Tearsheet',
      badge: 'Official PDF',
      icon: FileText
    },
    {
      id: 'planVsActual' as const,
      label: 'Plan vs. Actual',
      badge: 'Equity & Delta',
      icon: GitCompare
    },
    {
      id: 'objectives' as const,
      label: 'Weekly Objectives',
      badge: '48 Targets',
      icon: Target
    },
    {
      id: 'journal' as const,
      label: 'Trade Calendar & Journal',
      badge: 'Calendar & Notes',
      icon: StickyNote
    },
    {
      id: 'calculator' as const,
      label: 'Trade Calculator',
      badge: 'Risk & Lot',
      icon: Calculator
    },
    {
      id: 'rating' as const,
      label: 'AI Performance Rating',
      badge: `${totalPercentage}%`,
      icon: Sparkles
    },
    {
      id: 'disciplines' as const,
      label: '6 Master Rules',
      badge: 'Disciplines',
      icon: ShieldCheck
    },
    {
      id: 'audit' as const,
      label: 'Forensic Audit',
      badge: 'Edge Truth',
      icon: FileCheck2
    }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#faf9f6]/95 dark:bg-[#0c101a]/95 backdrop-blur-md border-b border-[#e8e6df] dark:border-[#1e293b] transition-colors pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3">
          {/* Zone 1: Minimalist Circular Monogram Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#1e2530] dark:border-[#f4a261] flex items-center justify-center font-bold text-xs tracking-tighter text-[#1e2530] dark:text-[#f4a261]">
                T19
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#1e2530] dark:text-white uppercase font-sans">
                  Transformer19
                </span>
              </div>
              {typeof window !== 'undefined' && (window as any).electron?.isDesktop && (
                <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <AppWindow size={11} className="text-cyan-400" />
                  <span>WIN DESKTOP</span>
                </span>
              )}
            </div>

            {/* Mobile-only performance pill */}
            <button
              type="button"
              onClick={() => setIsPerformanceModalOpen(true)}
              className={`sm:hidden flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xs ${ratingBadgeClasses}`}
              title="Touch to view detailed AI performance breakdown"
            >
              <Sparkles size={10} className={ratingIconColor} />
              <span>{totalPercentage}%</span>
            </button>

            <span className="text-[#dcd8ce] dark:text-[#374151] hidden sm:inline">/</span>

            {/* Trader Name Edit (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="text-[#718096] dark:text-[#a0aec0] font-medium">OPERATOR:</span>
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    className="bg-white dark:bg-[#1a202c] border border-[#e07a5f] rounded-full px-2.5 py-0.5 text-xs font-mono text-[#e07a5f] outline-none w-36"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-xs text-[#e07a5f] hover:underline font-bold px-1"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempName(traderName);
                    setIsEditingName(true);
                  }}
                  className="font-mono font-bold text-[#1e2530] dark:text-white hover:text-[#e07a5f] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Click to edit trader identity"
                >
                  <span>{traderName}</span>
                  <span className="text-[10px] text-[#a0aec0]">✎</span>
                </button>
              )}

              {/* AI Performance Percentage Badge with Gauge Icon */}
              <button
                type="button"
                onClick={() => setIsPerformanceModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ml-1 ${ratingBadgeClasses}`}
                title="Inspect execution performance score & 6 core dimensions"
              >
                <Gauge size={13} className={ratingIconColor} />
                <span className="font-extrabold text-xs">{totalPercentage}%</span>
                <span className="text-[9px] opacity-75 font-normal ml-0.5">▼</span>
              </button>

              {/* Multi-Account Selector Pill */}
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  title="Active Account · Click to switch between Personal, FTMO, Topstep, or custom plans"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="max-w-[100px] sm:max-w-[140px] truncate">{activeAccount?.name || 'Account'}</span>
                  <ChevronDown size={11} className="opacity-70" />
                </button>

                {/* Account Dropdown */}
                {isAccountDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsAccountDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-bold px-2 py-1 flex items-center justify-between">
                        <span>Switch Active Account</span>
                        <span>{accounts.length} Total</span>
                      </div>

                      <div className="space-y-1 mt-1 max-h-60 overflow-y-auto">
                        {accounts.map(acc => {
                          const isAccActive = acc.id === activeAccount?.id;
                          return (
                            <button
                              key={acc.id}
                              type="button"
                              onClick={() => {
                                switchAccount(acc.id);
                                setIsAccountDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                                isAccActive
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-700/60'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isAccActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                  <span className="font-bold truncate">{acc.name}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 pl-3">
                                  ${acc.startingBalance.toLocaleString()} · {acc.category.replace('_', ' ')}
                                </div>
                              </div>
                              {isAccActive && <Check size={13} className="text-emerald-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNavTab('planner');
                            setIsAccountDropdownOpen(false);
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles size={11} />
                          <span>Open 1-Year Planner</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Zone 2: Fast Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Cloud & SQLite Offline Sync Status Pill */}
            <button
              type="button"
              onClick={triggerManualSync}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-mono font-bold border cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xs ${
                syncState?.status === 'syncing'
                  ? 'bg-blue-950/80 text-blue-300 border-blue-600/60'
                  : syncState?.status === 'pending'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/60'
                  : syncState?.status === 'offline'
                  ? 'bg-slate-800 text-slate-300 border-slate-600'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
              }`}
              title={
                syncState?.status === 'syncing'
                  ? 'Syncing with live website server (transformer19.vercel.app)...'
                  : syncState?.status === 'pending'
                  ? `${syncState.pendingCount} edits saved locally in SQLite. Click to force upload to website server.`
                  : syncState?.status === 'offline'
                  ? 'Offline: Safely saving locally to SQLite (cockpit.db). Will auto-upload when reconnected.'
                  : 'Cloud Synced: Desktop SQLite & Website server are in lockstep. Click to refresh.'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  syncState?.status === 'syncing'
                    ? 'bg-blue-400 animate-ping'
                    : syncState?.status === 'pending'
                    ? 'bg-amber-400 animate-pulse'
                    : syncState?.status === 'offline'
                    ? 'bg-slate-400'
                    : 'bg-emerald-400'
                }`}
              />
              <Cloud size={12} className={syncState?.status === 'syncing' ? 'animate-spin text-blue-400' : ''} />
              <span>
                {syncState?.status === 'syncing'
                  ? 'SYNCING...'
                  : syncState?.status === 'pending'
                  ? `OFFLINE (${syncState.pendingCount})`
                  : syncState?.status === 'offline'
                  ? 'OFFLINE (LOCAL DB)'
                  : 'CLOUD SYNCED'}
              </span>
            </button>

            {/* Theme Switcher: Balanced Night Vision vs Daylight (Icon Only) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[#e8e6df] dark:border-[#27354a] bg-white dark:bg-[#162032] text-[#4a5568] dark:text-[#cbd5e0] hover:text-[#e07a5f] dark:hover:text-[#f4a261] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title={theme === 'dark' ? 'Night Vision Mode Active · Click to switch to Daylight' : 'Daylight Mode Active · Click for Night Vision'}
              aria-label={theme === 'dark' ? 'Switch to Daylight mode' : 'Switch to Night Vision mode'}
            >
              {theme === 'dark' ? (
                <Moon size={15} className="text-amber-400" />
              ) : (
                <Sun size={15} className="text-amber-500" />
              )}
            </button>

            {/* Export as PDF (Icon Only) */}
            <button
              type="button"
              onClick={handlePrintReport}
              className="p-2 rounded-full border border-[#e8e6df] dark:border-[#27354a] bg-white dark:bg-[#162032] text-slate-700 dark:text-slate-300 hover:text-[#0082ff] dark:hover:text-[#0082ff] hover:border-[#0082ff]/40 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 group"
              title="Export as PDF · Save 48-Week Execution Blueprint"
              aria-label="Export as PDF"
            >
              <FileDown size={15} className="text-[#0082ff] group-hover:translate-y-0.5 transition-transform" />
            </button>

            {/* Anytime Schedule Plan CSV Modal Toggle (Icon Only) */}
            {onOpenPlanCsvModal && (
              <button
                type="button"
                onClick={onOpenPlanCsvModal}
                className="hidden sm:inline-flex p-2 rounded-full border border-[#e8e6df] dark:border-[#27354a] bg-white dark:bg-[#162032] text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 group"
                title="Schedule Plan CSV · Import or download trading schedule anytime"
                aria-label="Schedule Plan CSV"
              >
                <FileSpreadsheet size={15} className="text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full border border-[#e8e6df] dark:border-[#27354a] bg-white dark:bg-[#162032] text-[#4a5568] dark:text-[#cbd5e0] hover:text-[#e07a5f] dark:hover:text-[#f4a261] transition-colors cursor-pointer flex items-center justify-center"
              title={isMobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
              aria-label="Toggle Mobile Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu & Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[calc(53px+env(safe-area-inset-top))] z-50 md:hidden flex flex-col">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 top-[calc(53px+env(safe-area-inset-top))] bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative bg-[#faf9f6] dark:bg-[#0c101a] border-b border-[#e8e6df] dark:border-[#1e293b] p-4 sm:p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-fadeIn">
            {/* Operator Mobile Profile Card */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e07a5f]/10 border border-[#e07a5f]/30 flex items-center justify-center text-[#e07a5f] font-mono font-bold text-sm">
                  YS
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Trading Operator</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{traderName}</div>
                </div>
              </div>

              {/* Devotion Gate Quick Toggle in Mobile Menu */}
              <button
                type="button"
                onClick={toggleDevotionGate}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  devotionGatePassedToday
                    ? 'bg-[#e07a5f]/10 text-[#e07a5f] border-[#e07a5f]/30'
                    : 'bg-rose-50 text-rose-600 border-rose-300'
                }`}
              >
                {devotionGatePassedToday ? '✓ Devoted' : '! Gate Open'}
              </button>
            </div>

            {/* Navigation Section */}
            <div className="mb-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2 px-1">
                Navigation Sections
              </div>
              <div className="space-y-1.5">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeNavTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveNavTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left font-bold text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-[#e07a5f] dark:text-white shadow-xs'
                          : 'bg-white dark:bg-[#121927] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Status & Mobile Quick Actions */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Cloud Database:</span>
                <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {firestoreConnected ? 'SQLite Connected' : 'SQLite Local Active'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {onOpenPlanCsvModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenPlanCsvModal();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 border border-cyan-500/20"
                  >
                    <FileSpreadsheet size={13} />
                    <span>Plan CSV</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenBackupModal();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Backup Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handlePrintReport();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl btn-terracotta text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <FileDown size={14} />
                  <span>Export as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Performance Details Modal (Opens when touching the performance badge on top) */}
      <PerformanceDetailsModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
      />
    </>
  );
};

