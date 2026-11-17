import React, { useState, useRef, useEffect } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { PerformanceDetailsModal } from './PerformanceDetailsModal';
import { scrollToElement } from '../utils/scrollHelper';
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
  Calendar,
  Sparkles,
  Target,
  Gauge,
  AppWindow,
  Cloud,
  CloudOff,
  Database,
  RefreshCw,
  FileSpreadsheet,
  GitCompare,
  Building2,
  Brain,
  ShieldAlert,
  Radio,
  FileText,
  ChevronDown,
  ChevronRight,
  Wallet,
  Check,
  BookOpen,
  Clock,
  Power,
  Smartphone
} from 'lucide-react';

const SIX_MASTER_RULES_MINIMAL = [
  {
    num: '01',
    title: '1-Hour Devotion Gate',
    rule: 'Platform stays shut until spirit is centered',
    icon: BookOpen,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50/80 dark:bg-purple-950/40',
    border: 'border-purple-200/80 dark:border-purple-800/50'
  },
  {
    num: '02',
    title: 'London & NY Open Only',
    rule: 'Strict session expansion · Zero Asian chop',
    icon: Clock,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50/80 dark:bg-sky-950/40',
    border: 'border-sky-200/80 dark:border-sky-800/50'
  },
  {
    num: '03',
    title: 'Daily Mental Reset',
    rule: 'Reset mind to zero daily · Win or loss',
    icon: RefreshCw,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50/80 dark:bg-amber-950/40',
    border: 'border-amber-200/80 dark:border-amber-800/50'
  },
  {
    num: '04',
    title: 'Exit on Target or Loss',
    rule: 'Immediate MT5 shutdown · Zero screen staring',
    icon: Power,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50/80 dark:bg-rose-950/40',
    border: 'border-rose-200/80 dark:border-rose-800/50'
  },
  {
    num: '05',
    title: '50% Cut on 2 Losses',
    rule: 'Halve lot size after 2 consecutive stop-outs',
    icon: ShieldAlert,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50/80 dark:bg-orange-950/40',
    border: 'border-orange-200/80 dark:border-orange-800/50'
  },
  {
    num: '06',
    title: 'Absolute Lot Cap',
    rule: 'Strict tier ceiling · Zero oversize tickets',
    icon: Layers,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    border: 'border-emerald-200/80 dark:border-emerald-800/50'
  }
];

interface TopActionBarProps {
  onOpenBackupModal: () => void;
  onOpenPlanCsvModal?: () => void;
  onToggleMobileMode?: () => void;
}

export const TopActionBar: React.FC<TopActionBarProps> = ({
  onOpenBackupModal,
  onOpenPlanCsvModal,
  onToggleMobileMode
}) => {
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
    isSyncing,
    lastSyncTime,
    activeAccount,
    accounts,
    switchAccount,
    workspaceMode,
    setWorkspaceMode,
    navigateToTab,
    journalNotes,
    setJournalSubView
  } = useCockpit();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(traderName);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isRulesDropdownOpen, setIsRulesDropdownOpen] = useState(false);
  const rulesDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rulesDropdownRef.current && !rulesDropdownRef.current.contains(event.target as Node)) {
        setIsRulesDropdownOpen(false);
      }
    };
    if (isRulesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRulesDropdownOpen]);

  // Close popovers on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsRulesDropdownOpen(false);
        setIsAccountDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenMasterRules = () => {
    setWorkspaceMode('journalRisk');
    setActiveNavTab('riskGuard');
    scrollToElement('disciplines-section');
  };

  const handleOpenStickyNotesGallery = () => {
    setWorkspaceMode('journalRisk');
    setActiveNavTab('journal');
    setJournalSubView('notes');
    scrollToElement('daily-journal-section');
  };

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
      id: 'journal' as const,
      label: 'Daily Trading Journal',
      badge: 'Notes & Log',
      icon: Calendar
    },
    {
      id: 'riskGuard' as const,
      label: '6 Master Rules',
      badge: 'Disciplines & Devotion',
      icon: ShieldCheck
    },
    {
      id: 'portfolio' as const,
      label: 'Personal Portfolios',
      badge: 'Active Desks',
      icon: Building2
    },
    {
      id: 'analytics' as const,
      label: 'Growth Curve & Stats',
      badge: 'Win/Loss & Curve',
      icon: TrendingUp
    },
    {
      id: 'planVsActual' as const,
      label: 'Manual Plan Editor',
      badge: 'Custom Plans',
      icon: GitCompare
    }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#faf9f6]/95 dark:bg-[#0c101a]/95 backdrop-blur-md border-b border-[#e8e6df] dark:border-[#1e293b] transition-colors pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3">
          {/* Zone 1: Minimalist Circular Monogram Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full border border-[#1e2530] dark:border-[#f4a261] flex items-center justify-center font-bold text-xs tracking-tighter text-[#1e2530] dark:text-[#f4a261] shrink-0">
                T19
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#1e2530] dark:text-white uppercase font-sans truncate block">
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
            </div>

            {/* Multi-Account Selector (Icon Only - Clean & Compact on Desktop, Under Menu on Mobile) */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setIsAccountDropdownOpen(prev => {
                    if (!prev) setIsRulesDropdownOpen(false);
                    return !prev;
                  });
                }}
                className="relative p-2 rounded-full border border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:border-indigo-500/60 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xs flex items-center justify-center group"
                title={`Active Account: ${activeAccount?.name || 'Personal Compounding'} · Click to switch`}
                aria-label="Active Account Selector"
              >
                <Wallet size={15} className="group-hover:scale-110 transition-transform text-indigo-600 dark:text-indigo-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c101a] animate-pulse" />
              </button>

              {/* Account Dropdown */}
              {isAccountDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity"
                    onClick={() => setIsAccountDropdownOpen(false)}
                  />
                  <div className="fixed inset-x-3.5 top-[calc(56px+env(safe-area-inset-top))] sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 w-auto sm:w-80 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-2xl z-50 animate-fadeIn max-w-sm sm:max-w-none mx-auto sm:mx-0">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-bold px-1 py-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2 mb-2">
                      <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-extrabold">
                        <Wallet size={13} />
                        <span>Switch Active Account</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[10px]">{accounts.length} Plans</span>
                        <button
                          type="button"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors sm:hidden cursor-pointer"
                          aria-label="Close"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-1 max-h-72 overflow-y-auto">
                      {accounts.map(acc => {
                        const isAccActive = acc.id === activeAccount?.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => {
                              switchAccount(acc.id);
                              setIsAccountDropdownOpen(false);
                              navigateToTab('portfolio', 'portfolio-section');
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center justify-between ${
                              isAccActive
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-700/60 shadow-xs'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isAccActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                <span className="font-bold truncate">{acc.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-3.5 mt-0.5">
                                ${acc.startingBalance.toLocaleString()} seed · ${(acc.profitTarget || 37150).toLocaleString()} target
                              </div>
                            </div>
                            {isAccActive && <Check size={14} className="text-emerald-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountDropdownOpen(false);
                          navigateToTab('planner', 'planner-section');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles size={13} />
                        <span>Open 1-Year Planner</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>

          {/* Zone 1.5: Desktop Navigation Pills (Visible on Wide Screens) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200/80 dark:border-slate-800/80 text-xs font-mono font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => navigateToTab('cockpit', 'quarter-matrix-section')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                workspaceMode === 'hierarchy'
                  ? 'bg-white dark:bg-[#121927] text-[#0082ff] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers size={13} className={workspaceMode === 'hierarchy' ? 'text-[#0082ff]' : 'text-slate-400'} />
              <span>Hierarchy</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToTab('portfolio', 'accounts-portfolio-section')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                workspaceMode === 'accounts' || activeNavTab === 'portfolio'
                  ? 'bg-white dark:bg-[#121927] text-indigo-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 size={13} className={workspaceMode === 'accounts' || activeNavTab === 'portfolio' ? 'text-indigo-500' : 'text-slate-400'} />
              <span>Accounts</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToTab('journal', 'daily-journal-section')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                workspaceMode === 'journalRisk' || workspaceMode === 'performance'
                  ? 'bg-white dark:bg-[#121927] text-emerald-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar size={13} className={workspaceMode === 'journalRisk' || workspaceMode === 'performance' ? 'text-emerald-500' : 'text-slate-400'} />
              <span>Journal & Risk</span>
            </button>
          </nav>

          {/* Zone 2: Fast Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Minimal Execution Performance Score Pill: Only Icon and Percentile */}
            <button
              type="button"
              onClick={() => setIsPerformanceModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 text-xs font-mono font-black group shrink-0 ${ratingBadgeClasses}`}
              title={`Execution Performance Score: ${totalPercentage}% (${performanceRating?.statusLabel || 'Optimal'}) · Click to inspect details`}
              aria-label="Execution Performance Score"
            >
              <div className="w-4.5 h-4.5 rounded-full bg-white/80 dark:bg-black/30 border border-current/20 flex items-center justify-center shrink-0">
                <Gauge size={12} className={ratingIconColor} />
              </div>
              <span className="font-mono font-black text-xs sm:text-sm tracking-tight whitespace-nowrap">{totalPercentage}%</span>
            </button>

            {/* Minimized Realtime Cloud Sync Icon (Desktop/Tablet, under menu on mobile) */}
            <button
              type="button"
              onClick={triggerManualSync}
              className="relative p-2 rounded-full border border-[#e8e6df] dark:border-[#27354a] bg-white dark:bg-[#162032] text-[#4a5568] dark:text-[#cbd5e0] hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 hidden sm:flex items-center justify-center shrink-0"
              title={`Real-time Cloud Synced (${lastSyncTime || 'Live'}) · Click to force instant two-way sync`}
              aria-label="Force instant cloud sync"
            >
              <Cloud
                size={16}
                className={syncState?.status === 'syncing' || isSyncing ? 'animate-spin text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}
              />
              {/* Mini Status Indicator Dot */}
              <span
                className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#162032] ${
                  syncState?.status === 'syncing' || isSyncing
                    ? 'bg-blue-400 animate-ping'
                    : syncState?.status === 'pending'
                    ? 'bg-amber-400 animate-pulse'
                    : !firestoreConnected
                    ? 'bg-slate-400'
                    : 'bg-emerald-400 animate-pulse'
                }`}
              />
            </button>

            {/* 6 Master Rules (Icon Only with Dropdown directly under icon) */}
            <div className="relative" ref={rulesDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsRulesDropdownOpen(prev => {
                    if (!prev) setIsAccountDropdownOpen(false);
                    return !prev;
                  });
                }}
                className={`relative p-2 rounded-full border transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 ${
                  isRulesDropdownOpen || activeNavTab === 'riskGuard' || activeNavTab === 'disciplines'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-400 ring-2 ring-emerald-400/30'
                    : 'border-[#e8e6df] dark:border-[#27354a] bg-white dark:bg-[#162032] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-400/60'
                }`}
                title="Master Rules · Click to view operating disciplines"
                aria-label="Master Rules"
                aria-expanded={isRulesDropdownOpen}
              >
                <ShieldCheck size={16} className="text-emerald-500 dark:text-emerald-400" />
              </button>

              {/* 6 Master Rules Dropdown Popover (Directly Under Icon) */}
              {isRulesDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity"
                    onClick={() => setIsRulesDropdownOpen(false)}
                  />
                  <div className="fixed inset-x-3.5 top-[calc(56px+env(safe-area-inset-top))] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-[380px] bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-2xl z-50 animate-fadeIn max-w-sm sm:max-w-none mx-auto sm:mx-0">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck size={15} />
                        </div>
                        <div>
                          <h3 className="text-xs font-black font-mono tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                            <span>6 Master Rules</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                              Disciplines
                            </span>
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Devotion Gate Quick Toggle */}
                        <button
                          type="button"
                          onClick={toggleDevotionGate}
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border transition-all cursor-pointer ${
                            devotionGatePassedToday
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
                          }`}
                          title="Click to toggle devotion prayer gate"
                        >
                          {devotionGatePassedToday ? '✓ Devoted' : '! Gate Open'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRulesDropdownOpen(false)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          aria-label="Close"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 6 Minimal Rules List */}
                    <div className="space-y-1.5">
                      {SIX_MASTER_RULES_MINIMAL.map(rule => {
                        const IconComponent = rule.icon;
                        return (
                          <div
                            key={rule.num}
                            className={`p-2 rounded-xl border ${rule.border} ${rule.bg} flex items-start gap-2.5 transition-all hover:scale-[1.01]`}
                          >
                            <div className={`p-1.5 rounded-lg bg-white/90 dark:bg-black/50 ${rule.color} shrink-0 mt-0.5 shadow-2xs`}>
                              <IconComponent size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                  Rule {rule.num}
                                </span>
                                <span className="text-slate-300 dark:text-slate-700 font-mono text-[9px]">·</span>
                                <span className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                                  {rule.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-600 dark:text-slate-300 font-sans leading-tight mt-0.5">
                                {rule.rule}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer View Link */}
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-400">Governing Constitution</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRulesDropdownOpen(false);
                          handleOpenMasterRules();
                        }}
                        className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Full Disciplines Section</span>
                        <ChevronRight size={11} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Switcher: Balanced Night Vision vs Daylight (Icon Only) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[#e8e6df] dark:border-[#27354a] bg-white dark:bg-[#162032] text-[#4a5568] dark:text-[#cbd5e0] hover:text-[#e07a5f] dark:hover:text-[#f4a261] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
              title={theme === 'dark' ? 'Night Vision Mode Active · Click to switch to Daylight' : 'Daylight Mode Active · Click for Night Vision'}
              aria-label={theme === 'dark' ? 'Switch to Daylight mode' : 'Switch to Night Vision mode'}
            >
              {theme === 'dark' ? (
                <Moon size={15} className="text-amber-400" />
              ) : (
                <Sun size={15} className="text-amber-500" />
              )}
            </button>

            {/* iPhone iOS 16 Mobile Mode Preview Switcher */}
            {onToggleMobileMode && (
              <button
                type="button"
                onClick={onToggleMobileMode}
                className="p-2 rounded-full border border-[#e8e6df] dark:border-[#27354a] bg-white dark:bg-[#162032] text-[#4a5568] dark:text-[#cbd5e0] hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500/50 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0 hidden sm:flex items-center justify-center"
                title="Switch to iPhone iOS 16 Mobile View"
                aria-label="Switch to iPhone iOS 16 Mobile View"
              >
                <Smartphone size={15} className="text-blue-500" />
              </button>
            )}

            {/* Hamburger Navigation & Command Drawer Button - Always Accessible */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="shrink-0 p-2 sm:p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:text-[#0082ff] dark:hover:text-[#0082ff] hover:border-[#0082ff]/50 transition-all cursor-pointer flex items-center justify-center shadow-xs active:scale-95"
              title={isMobileMenuOpen ? 'Close Menu' : 'Open Navigation & Command Menu'}
              aria-label="Toggle Navigation Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation & Command Drawer Menu & Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[calc(53px+env(safe-area-inset-top))] z-50 flex flex-col">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 top-[calc(53px+env(safe-area-inset-top))] bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative bg-[#faf9f6] dark:bg-[#0c101a] border-b border-[#e8e6df] dark:border-[#1e293b] p-4 sm:p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-fadeIn w-full sm:max-w-xl sm:ml-auto sm:border-l sm:rounded-bl-3xl">
            {/* Operator Mobile Profile Card */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e07a5f]/10 border border-[#e07a5f]/30 flex items-center justify-center text-[#e07a5f] font-mono font-bold text-sm">
                  YS
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Trading Operator</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{traderName}</div>
                </div>
              </div>

              {/* Devotion Gate Quick Toggle in Menu */}
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

            {/* Minimal Execution Performance Score: Only Icon and Percentile */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsPerformanceModalOpen(true);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:scale-[1.01] active:scale-[0.99] mb-3 text-left group ${ratingBadgeClasses}`}
              title={`Execution Performance Score: ${totalPercentage}% · Click to inspect 6 core dimensions`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/80 dark:bg-black/30 border border-current/20 flex items-center justify-center shrink-0">
                  <Gauge size={16} className={ratingIconColor} />
                </div>
                <span className="text-base font-black font-mono tracking-tight">{totalPercentage}%</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#0082ff] shrink-0 pl-2 group-hover:translate-x-0.5 transition-transform">
                <span>Details</span>
                <ChevronRight size={14} />
              </div>
            </button>

            {/* Mobile Fast-Access Tile Grid for Moved Header Controls (6 Master Rules + Cloud Sync) */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* 6 Master Rules Card */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsRulesDropdownOpen(true);
                }}
                className="flex items-center justify-between p-3 rounded-2xl border border-emerald-200/90 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 hover:border-emerald-400 transition-all cursor-pointer shadow-xs text-left group"
                title="View 6 Master Rules & Spiritual Foundation"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      Disciplines
                    </div>
                    <div className="text-xs font-black font-mono">
                      <span className="truncate">6 Rules</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Real-time Cloud Sync Card */}
              <button
                type="button"
                onClick={() => {
                  triggerManualSync();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-2xl border border-emerald-200/90 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 hover:border-emerald-400 transition-all cursor-pointer shadow-xs text-left group"
                title="Force Instant Cloud Sync"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Cloud size={16} className={syncState?.status === 'syncing' || isSyncing ? 'animate-spin text-blue-500' : 'text-emerald-600 dark:text-emerald-400'} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      Cloud Sync
                    </div>
                    <div className="text-xs font-black font-mono flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="truncate">{syncState?.status === 'syncing' || isSyncing ? 'Syncing...' : lastSyncTime || 'Live Synced'}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Active Account Switcher in Drawer (Wallet) */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 mb-4">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2 px-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Wallet size={13} />
                  <span>Active Account Plan</span>
                </span>
                <span className="text-indigo-500 font-bold text-[10px]">{accounts.length} Plans</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {accounts.map(acc => {
                  const isAccActive = acc.id === activeAccount?.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        switchAccount(acc.id);
                        setIsMobileMenuOpen(false);
                        navigateToTab('portfolio', 'portfolio-section');
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isAccActive
                          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isAccActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <div className="truncate">
                          <span className="text-xs font-bold block truncate">{acc.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 block">${acc.startingBalance.toLocaleString()} seed</span>
                        </div>
                      </div>
                      {isAccActive && (
                        <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 shrink-0">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
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
                        setIsMobileMenuOpen(false);
                        navigateToTab(item.id);
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
                  <span className={`w-2 h-2 rounded-full ${firestoreConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  {firestoreConnected ? 'Cloud Real-time Synced' : 'Connecting to Cloud...'}
                </span>
              </div>

              {/* Mobile Fast Sync Button */}
              <button
                type="button"
                onClick={() => {
                  triggerManualSync();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Cloud size={14} className={isSyncing ? 'animate-spin' : ''} />
                <span>Sync Across Devices Now ({lastSyncTime || 'Live'})</span>
              </button>

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
                  className="flex-1 py-2 px-3 rounded-xl bg-[#0082ff] hover:bg-[#0070df] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  title="Export official 48-Week Execution Blueprint as PDF"
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

