import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  TradingQuarter,
  DailySession,
  CockpitData,
  DayStatus,
  DailyJournalNote,
  PerformanceRatingData,
  WeeklyObjective,
  WeeklyChecklistItem,
  ObjectiveStatus,
  MentalStateLog,
  MentalStateKey,
  PortfolioAccount
} from '../types';
import { INITIAL_QUARTERS } from '../data/roadmapData';
import { generateDefaultWeeklyObjectives } from '../data/defaultObjectives';
import { calculateRoadmapBalances, RoadmapBalanceReport, WeekBalanceBreakdown } from '../utils/balanceCalculator';
import { parsePlanCsv, exportCurrentPlanToCsv } from '../utils/planCsvParser';
import { generateTradePlan, GeneratedPlanResult } from '../utils/planGenerator';
import { scrollToElement } from '../utils/scrollHelper';
import { cloudSync, SyncState } from '../services/cloudSync';
import { sqliteStorage } from '../services/sqliteStorage';
import { firestoreCloudSync } from '../services/firestoreCloudSync';
import { calculateMathematicalPerformanceRating } from '../utils/performanceRatingCalculator';

const LOCAL_STORAGE_KEY = 'transformer19_cockpit_30k_v1';
const THEME_KEY = 'transformer19_theme_v2';
const JOURNAL_STORAGE_KEY = 'transformer19_journal_notes_30k_v1';
const MENTAL_STATE_STORAGE_KEY = 'transformer19_mental_state_logs_30k_v1';
const OBJECTIVES_STORAGE_KEY = 'transformer19_weekly_objectives_30k_v1';

const DEFAULT_MENTAL_STATE_LOGS: MentalStateLog[] = [
  {
    id: 'ms_preflight',
    dayId: 'prep_day',
    dayLabel: 'Pre-Flight Launch Calibration',
    sessionTag: 'Baseline Zero Grounded',
    date: new Date().toISOString().split('T')[0],
    stateKey: 'calm',
    emoji: '🧘',
    label: 'Calm & Grounded',
    rating: 5,
    tags: ['Rule 01 Devotion Cleared', '0.01 Lot Ladder Armed', '20-Pip Stop Calibrated', 'Baseline Zero Ready'],
    notes: 'Pre-flight calibration complete. Devotion foundation locked in. Starting seed capital $50.00 intact. System is calibrated for Day 1 London Open displacement.',
    loggedAt: new Date().toISOString()
  }
];

const DEFAULT_JOURNAL_NOTES: DailyJournalNote[] = [
  {
    id: 'jn_prep_1',
    dayId: 'prep_day',
    dayLabel: 'Pre-Flight Briefing',
    date: new Date().toISOString().split('T')[0],
    sessionTag: 'Pre-Launch Readiness',
    title: 'Baseline Zero Ready: $50 Seed Tranche Grounded',
    content: 'All 48-week targets verified. Starting with untouched $50 seed capital. Strict 0.01 lot ceiling (<$150 equity) and 20-pip stop on Gold XAU/USD. Rule 01 spiritual devotion foundation is locked in before opening charts on Day 1.',
    color: 'amber',
    outcome: 'devotion',
    rotation: -1.2,
    createdAt: new Date().toISOString()
  }
];

const RATING_STORAGE_KEY = 'transformer19_ai_performance_rating_v1';

const DEFAULT_PERFORMANCE_RATING: PerformanceRatingData = {
  totalPercentage: 88,
  summaryDiagnosis: 'Operator demonstrates elite discipline adhering to Rule 01 spiritual devotion and the 0.01 lot ladder limit. Patience during London displacement setups remains high with zero recorded revenge trades.',
  assessedAt: new Date().toISOString(),
  isAiGenerated: true,
  metrics: [
    {
      key: 'ruleRespecting',
      name: 'Rule Respecting',
      score: 9.5,
      maxScore: 10,
      assessment: '100% adherence to Rule 01 spiritual devotion gate and physical 20% harvest sweep parameters.',
      evidence: 'Devotion gate verified; zero unauthorized entries during off-protocol hours.',
      actionableAdvice: 'Continue locking the devotion gate daily before opening market charts.'
    },
    {
      key: 'riskManagement',
      name: 'Risk Management',
      score: 9.0,
      maxScore: 10,
      assessment: 'Rigorous stop loss enforcement (20 pips max on Gold) and strictly laddered position sizing.',
      evidence: 'Zero drawdowns exceeding authorized risk ceiling per session.',
      actionableAdvice: 'Maintain fixed dollar risk per trade as equity steps into tranche 2.'
    },
    {
      key: 'discipline',
      name: 'Discipline',
      score: 8.5,
      maxScore: 10,
      assessment: 'Resisted emotional FOMO and avoided revenge trading after scratch sessions.',
      evidence: 'All completed trades align with the 48-week master blueprint quotas.',
      actionableAdvice: 'Accept minor breakeven scratches without feeling the need to re-engage immediately.'
    },
    {
      key: 'profitMaximizing',
      name: 'Profit Maximizing',
      score: 8.2,
      maxScore: 10,
      assessment: 'Session harvest targets reached systematically with 20% offline profit sweeps scheduled.',
      evidence: 'Captured target pips during London Open displacement expansions.',
      actionableAdvice: 'Allow runners to hit the final take-profit boundary without premature manual intervention.'
    },
    {
      key: 'patience',
      name: 'Patience',
      score: 9.0,
      maxScore: 10,
      assessment: 'Excellent discipline waiting for 07:00 UTC London and 13:30 UTC NY killzone expansion triggers.',
      evidence: 'Refrained from taking low-probability trades in the choppy Asian range.',
      actionableAdvice: 'Keep alarms set for 15 minutes before killzone opens to mentally prepare.'
    },
    {
      key: 'tradeManagement',
      name: 'Trade Management',
      score: 8.8,
      maxScore: 10,
      assessment: 'Trailing stops applied effectively and positions closed cleanly at planned milestones.',
      evidence: 'Documented executions with clean entries and exits logged in journal notes.',
      actionableAdvice: 'Record bid/ask spread variations during news spikes in session notes.'
    }
  ]
};

export const DEFAULT_PORTFOLIO_ACCOUNTS: PortfolioAccount[] = [
  {
    id: 'acc_personal_50',
    name: 'Personal $50 Seed Compounding',
    broker: 'IC Markets (MetaTrader 5)',
    accountNumber: 'MT5-948201',
    category: 'personal_compounding',
    currency: 'USD',
    startingBalance: 50.0,
    currentEquity: 50.0,
    highWaterMark: 50.0,
    dailyLossLimit: 20.0,
    maxTrailingDrawdownLimit: 25.0,
    profitTarget: 37150.0,
    isActive: true,
    status: 'active',
    notes: '48-Week Master Execution Roadmap ($50 -> $30K working + $7,150 banked sweeps)',
    createdAt: '2026-10-01',
    heroSubtitle: 'A serene, mathematically disciplined 48–week compounding framework. Growing $50 seed capital into $30,000 working equity with $7,150 physical banked sweeps ($37,150 total value), backed by high-performance LibSQL / SQLite.',
    heroWeeksLabel: '48+',
    heroWeeksSub: 'Quarters 1 through 4 roadmap',
    heroDaysLabel: '252',
    heroDaysSub: 'sessions completed in DB',
    heroWinRateLabel: '66.2%',
    heroWinRateSub: 'Over 1,000 statistical wins',
    heroSweepsLabel: '$7.1k',
    heroSweepsSub: '20% monthly profit extraction ($7,150 total)'
  }
];

export type ChartViewMode = 'growth' | 'monthly' | 'lotsize' | 'performance';
export type ScaleMode = 'linear' | 'logarithmic';
export type WorkspaceMode = 'hierarchy' | 'planner' | 'journalRisk' | 'performance' | 'accounts' | 'classic';
export type ActiveTab =
  | 'cockpit'
  | 'planner'
  | 'portfolio'
  | 'planVsActual'
  | 'quant'
  | 'riskGuard'
  | 'brokerSync'
  | 'tearsheet'
  | 'objectives'
  | 'mt5journal'
  | 'analytics'
  | 'journal'
  | 'calculator'
  | 'rating'
  | 'disciplines'
  | 'audit';

// Real-Feed Dynamic Performance Rating Calculator (Evaluated from Day 1)
export const computeRealFeedPerformanceRating = (
  quarters: TradingQuarter[],
  devotionPassed: boolean,
  notes: DailyJournalNote[],
  mentalLogs?: MentalStateLog[],
  account?: PortfolioAccount,
  traderName?: string,
  workingEquity?: number,
  bankedCash?: number
): PerformanceRatingData => {
  return calculateMathematicalPerformanceRating({
    quarters,
    devotionGatePassedToday: devotionPassed,
    journalNotes: notes,
    mentalStateLogs: mentalLogs,
    activeAccount: account,
    traderName,
    workingEquity,
    bankedCash
  });
};

interface CockpitContextType {
  quarters: TradingQuarter[];
  theme: 'dark' | 'light';
  traderName: string;
  devotionGatePassedToday: boolean;
  selectedQuarter: string;
  expandedMonths: Set<string>;
  expandedWeeks: Set<string>;
  searchQuery: string;
  filterStatus: 'all' | 'completed' | 'pending' | 'harvest';
  chartViewMode: ChartViewMode;
  scaleMode: ScaleMode;
  activeNavTab: ActiveTab;
  workspaceMode: WorkspaceMode;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  journalSubView: 'calendar' | 'comparison' | 'notes' | 'weekly_recap';
  setJournalSubView: (view: 'calendar' | 'comparison' | 'notes' | 'weekly_recap') => void;
  firestoreConnected: boolean;
  sqliteConnected: boolean;
  postgresConnected: boolean;
  syncState: SyncState;
  triggerManualSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string | null;
  journalNotes: DailyJournalNote[];
  mentalStateLogs: MentalStateLog[];
  addMentalStateLog: (log: Omit<MentalStateLog, 'id' | 'loggedAt'>) => Promise<void>;
  updateMentalStateLog: (id: string, updates: Partial<MentalStateLog>) => Promise<void>;
  deleteMentalStateLog: (id: string) => Promise<void>;
  performanceRating: PerformanceRatingData;
  isRatingLoading: boolean;
  refreshPerformanceRating: () => Promise<void>;
  
  // Dynamic 48-Week Balance & Harvest Reconciliation Report
  balanceReport: RoadmapBalanceReport;
  getWeekBalance: (weekId: string) => WeekBalanceBreakdown | undefined;

  // Computed metrics
  metrics: {
    totalSessions: number;
    completedSessions: number;
    progressPercent: number;
    completedWins: number;
    completedLosses: number;
    completedWinRate: number;
    winRate: number;
    actualTotalPnL: number;
    currentWorkingEquity: number;
    currentBankedCash: number;
    currentTotalNetWorth: number;
    targetRetained: number;
    targetBanked: number;
    targetTotal: number;
  };

  // Actions
  toggleTheme: () => void;
  setTraderName: (name: string) => void;
  toggleDevotionGate: () => void;
  setSelectedQuarter: (qId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: 'all' | 'completed' | 'pending' | 'harvest') => void;
  setChartViewMode: (mode: ChartViewMode) => void;
  setScaleMode: (scale: ScaleMode) => void;
  setActiveNavTab: (tab: ActiveTab) => void;
  navigateToTab: (tab: ActiveTab, targetElementId?: string) => void;
  
  toggleMonth: (monthId: string) => void;
  toggleWeek: (weekId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  
  toggleDayCompletion: (weekId: string, dayIndex: number) => void;
  updateDaySession: (weekId: string, dayIndex: number, updates: Partial<DailySession>) => void;
  batchMarkWeek: (weekId: string, markCompleted: boolean) => void;
  
  addJournalNote: (note: Omit<DailyJournalNote, 'id' | 'createdAt'>) => Promise<void>;
  updateJournalNote: (id: string, updates: Partial<DailyJournalNote>) => Promise<void>;
  deleteJournalNote: (id: string) => Promise<void>;

  weeklyObjectives: WeeklyObjective[];
  updateWeeklyObjective: (weekId: string, updates: Partial<WeeklyObjective>) => void;
  toggleObjectiveChecklist: (weekId: string, checklistId: string) => void;
  addChecklistItem: (weekId: string, text: string) => void;
  removeChecklistItem: (weekId: string, checklistId: string) => void;
  resetWeeklyObjective: (weekId: string) => void;

  resetToOriginalPlan: () => void;
  exportBackupJson: () => string;
  importBackupJson: (json: string) => boolean;
  importPlanFromCsv: (csvContent: string) => Promise<{ success: boolean; error?: string; summary?: any; validationErrors?: string[] }>;
  exportPlanToCsv: () => string;

  // Multi-Account Portfolio Management
  accounts: PortfolioAccount[];
  activeAccountId: string;
  activeAccount: PortfolioAccount;
  switchAccount: (id: string) => Promise<void>;
  saveAccount: (account: PortfolioAccount) => void;
  deleteAccount: (id: string) => void;
  removeDemoAccounts: () => void;
  updateAccountPlan: (accountId: string, planResult: GeneratedPlanResult) => Promise<void>;
}

const CockpitContext = createContext<CockpitContextType | undefined>(undefined);

export const CockpitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state: defaults to 'light' to showcase the Scandinavian aesthetic from Image 3
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light'; // Clean light Scandinavian luxury default
    } catch {
      return 'light';
    }
  });

  // Firestore & PostgreSQL status
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(false);
  const [postgresConnected, setPostgresConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>(cloudSync.getState());

  useEffect(() => {
    return cloudSync.subscribe(newState => {
      setSyncState(newState);
      if (newState.status === 'syncing') {
        setIsSyncing(true);
      } else {
        setIsSyncing(false);
      }
      if (newState.lastSyncedAt) {
        setLastSyncTime(new Date(newState.lastSyncedAt).toLocaleTimeString());
      }
    });
  }, []);

  // Cockpit Core Data State
  const [cockpitData, setCockpitData] = useState<CockpitData>(() => {
    // Purge all legacy 100K localStorage keys on startup
    try {
      localStorage.removeItem('terminal_100k_cockpit_scandi_v4_zero');
      localStorage.removeItem('terminal_100k_cockpit_scandi_v3');
      localStorage.removeItem('terminal_100k_cockpit_scandi_v2');
      localStorage.removeItem('transformer19_weekly_objectives_v4_zero');
      localStorage.removeItem('transformer19_weekly_objectives_v2');
      localStorage.removeItem('transformer19_weekly_objectives_v1');
      localStorage.removeItem('tri_chat_messages_v4_zero');
    } catch {
      // ignore
    }

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.quarters && Array.isArray(parsed.quarters) && parsed.quarters.length > 0) {
          return {
            traderName: parsed.traderName || 'Yohannes Sharew',
            seedCapital: parsed.seedCapital || 50,
            targetBanked: parsed.targetBanked !== undefined ? parsed.targetBanked : 7150,
            targetRetained: parsed.targetRetained !== undefined ? parsed.targetRetained : 30000,
            targetTotal: parsed.targetTotal !== undefined ? parsed.targetTotal : 37150,
            devotionGatePassedToday: parsed.devotionGatePassedToday ?? true,
            lastDevotionTimestamp: parsed.lastDevotionTimestamp,
            quarters: parsed.quarters
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse saved cockpit state:', e);
    }
    return {
      traderName: 'Yohannes Sharew',
      seedCapital: 50,
      targetBanked: 7150,
      targetRetained: 30000,
      targetTotal: 37150,
      devotionGatePassedToday: true,
      quarters: INITIAL_QUARTERS
    };
  });

  // Helper to detect any prop firm accounts
  const isPropFirmAccount = (a: any) => {
    const name = (a.name || '').toLowerCase();
    const cat = (a.category || '').toLowerCase();
    const broker = (a.broker || '').toLowerCase();
    const id = (a.id || '').toLowerCase();
    const notes = (a.notes || '').toLowerCase();
    return (
      name.includes('ftmo') ||
      name.includes('topstep') ||
      name.includes('prop') ||
      cat.includes('prop') ||
      broker.includes('ftmo') ||
      broker.includes('topstep') ||
      broker.includes('prop') ||
      id.includes('ftmo') ||
      id.includes('topstep') ||
      notes.includes('prop')
    );
  };

  // Multi-Account Portfolio Management State
  const [accounts, setAccounts] = useState<PortfolioAccount[]>(() => {
    try {
      const saved = localStorage.getItem('t19_portfolio_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Purge any legacy prop firm accounts from previous sessions
          const cleaned = parsed.filter(a => !isPropFirmAccount(a));
          if (cleaned.length > 0) {
            try {
              localStorage.setItem('t19_portfolio_accounts', JSON.stringify(cleaned));
            } catch (e) {}
            return cleaned;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading portfolio accounts:', e);
    }
    return DEFAULT_PORTFOLIO_ACCOUNTS;
  });

  const [activeAccountId, setActiveAccountId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('t19_active_acc_id');
      if (saved) {
        const lower = saved.toLowerCase();
        if (!lower.includes('ftmo') && !lower.includes('topstep') && !lower.includes('prop')) {
          return saved;
        }
      }
      return 'acc_personal_50';
    } catch {
      return 'acc_personal_50';
    }
  });

  // Auto-clean any legacy accounts if loaded in state
  useEffect(() => {
    const hasProp = accounts.some(a => isPropFirmAccount(a));
    if (hasProp) {
      const sanitized = accounts.filter(a => !isPropFirmAccount(a));
      const finalAccounts = sanitized.length > 0 ? sanitized : DEFAULT_PORTFOLIO_ACCOUNTS;
      setAccounts(finalAccounts);
      try {
        localStorage.setItem('t19_portfolio_accounts', JSON.stringify(finalAccounts));
      } catch (e) {}
    }
  }, [accounts]);

  const activeAccount = useMemo(() => {
    return accounts.find(a => a.id === activeAccountId) || accounts[0] || DEFAULT_PORTFOLIO_ACCOUNTS[0];
  }, [accounts, activeAccountId]);

  // Dynamic 48-Week Balance & Harvest Reconciliation Report
  const balanceReport = useMemo(() => {
    return calculateRoadmapBalances(cockpitData.quarters, cockpitData.seedCapital);
  }, [cockpitData.quarters, cockpitData.seedCapital]);

  const getWeekBalance = (weekId: string): WeekBalanceBreakdown | undefined => {
    return balanceReport.weekMap.get(weekId);
  };

  const metrics = useMemo(() => {
    let totalSessions = 0;
    let completedSessions = 0;
    let completedWins = 0;
    let completedLosses = 0;
    let actualTotalPnL = 0;

    cockpitData.quarters.forEach(q => {
      q.months.forEach(m => {
        m.weeks.forEach(w => {
          w.days.forEach(d => {
            totalSessions++;
            if (d.status === 'completed') {
              completedSessions++;
              let dayVal = 0;
              if (d.actualPnl !== undefined) {
                dayVal = d.actualPnl;
              } else {
                const clean = d.pnl.replace(/[^0-9.-]/g, '');
                dayVal = parseFloat(clean) || 0;
              }

              if (!d.isExtractRow) {
                actualTotalPnL += dayVal;
                if (dayVal > 0) completedWins++;
                else if (dayVal < 0) completedLosses++;
              }
            }
          });
        });
      });
    });

    const progressPercent = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const completedDecided = completedWins + completedLosses;
    const completedWinRate = completedDecided > 0 ? (completedWins / completedDecided) * 100 : 0;

    // Actual live values: Retained equity strictly deducts all physical bank sweeps
    const currentWorkingEquity = completedSessions > 0 ? balanceReport.finalActualWorkingEquity : cockpitData.seedCapital;
    const currentBankedCash = balanceReport.totalActualHarvest;
    const currentTotalNetWorth = currentWorkingEquity + currentBankedCash;

    return {
      totalSessions,
      completedSessions,
      progressPercent,
      completedWins,
      completedLosses,
      completedWinRate,
      winRate: completedWinRate,
      actualTotalPnL,
      currentWorkingEquity,
      currentBankedCash,
      currentTotalNetWorth,
      targetRetained: cockpitData.targetRetained,
      targetBanked: cockpitData.targetBanked,
      targetTotal: cockpitData.targetTotal
    };
  }, [cockpitData, balanceReport]);

  // Import plan from CSV string (placed ahead of switchAccount to prevent TDZ)
  const importPlanFromCsv = async (csvContent: string): Promise<{ success: boolean; error?: string; summary?: any; validationErrors?: string[] }> => {
    try {
      const result = parsePlanCsv(csvContent);
      if (!result.success || !result.quarters || !result.objectives) {
        return {
          success: false,
          error: result.error || 'Failed to parse plan CSV',
          validationErrors: result.validationErrors
        };
      }

      const newCockpitData: CockpitData = {
        traderName: cockpitData.traderName || 'Yohannes Sharew',
        seedCapital: result.seedCapital || 50,
        targetBanked: result.targetBanked || 7150,
        targetRetained: result.targetRetained || 30000,
        targetTotal: result.targetTotal || 37150,
        devotionGatePassedToday: true,
        quarters: result.quarters
      };

      setCockpitData(newCockpitData);
      setWeeklyObjectives(result.objectives);

      // Save to local storage
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCockpitData));
        localStorage.setItem(OBJECTIVES_STORAGE_KEY, JSON.stringify(result.objectives));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      // Save to SQLite IndexedDB
      try {
        await sqliteStorage.saveState({
          traderName: newCockpitData.traderName,
          devotionGatePassedToday: true,
          workingEquity: newCockpitData.seedCapital,
          bankedCash: 0,
          netWorth: newCockpitData.seedCapital,
          winRate: 100,
          totalWins: 0,
          totalLosses: 0,
          completedSessions: 0
        });
      } catch (e) {
        console.warn('SQLite IndexedDB save error:', e);
      }

      // Sync to backend SQLite database (cockpit.db)
      try {
        await fetch('/api/plan/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quarters: result.quarters,
            objectives: result.objectives,
            seedCapital: result.seedCapital,
            targetBanked: result.targetBanked,
            targetRetained: result.targetRetained,
            targetTotal: result.targetTotal
          })
        });
      } catch (e) {
        console.warn('Backend SQLite sync error (running offline):', e);
      }

      return {
        success: true,
        summary: result.summary,
        validationErrors: result.validationErrors
      };
    } catch (e: any) {
      console.error('importPlanFromCsv error:', e);
      return { success: false, error: e?.message || 'Unexpected error while parsing CSV' };
    }
  };

  const switchAccount = async (id: string) => {
    try {
      const targetAcc = accounts.find(a => a.id === id);
      if (!targetAcc) return;

      setActiveAccountId(id);
      try {
        localStorage.setItem('t19_active_acc_id', id);
      } catch {}

      const updatedAccounts = accounts.map(a => ({
        ...a,
        isActive: a.id === id
      }));
      setAccounts(updatedAccounts);
      try {
        localStorage.setItem('t19_portfolio_accounts', JSON.stringify(updatedAccounts));
      } catch {}

      // Cross-device cloud sync active account
      firestoreCloudSync.syncActiveAccount(id);
      firestoreCloudSync.syncAccounts(updatedAccounts, id);

      // Load or generate plan for this account
      if (targetAcc.id === 'acc_personal_50' && !targetAcc.csvSource && !targetAcc.planQuarters) {
        // Reset to default INITIAL_QUARTERS roadmap
        const defaultObjs = generateDefaultWeeklyObjectives();
        const newCockpitData: CockpitData = {
          traderName: cockpitData.traderName || 'Yohannes Sharew',
          seedCapital: 50,
          targetBanked: 7150,
          targetRetained: 30000,
          targetTotal: 37150,
          devotionGatePassedToday: true,
          quarters: INITIAL_QUARTERS
        };
        setCockpitData(newCockpitData);
        setWeeklyObjectives(defaultObjs);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCockpitData));
          localStorage.setItem(OBJECTIVES_STORAGE_KEY, JSON.stringify(defaultObjs));
        } catch {}
      } else if (targetAcc.csvSource) {
        await importPlanFromCsv(targetAcc.csvSource);
      } else if (targetAcc.planQuarters && targetAcc.planObjectives) {
        const newCockpitData: CockpitData = {
          traderName: cockpitData.traderName || 'Yohannes Sharew',
          seedCapital: targetAcc.startingBalance,
          targetBanked: targetAcc.planBanked || 0,
          targetRetained: targetAcc.planRetained || targetAcc.startingBalance,
          targetTotal: targetAcc.profitTarget || targetAcc.startingBalance,
          devotionGatePassedToday: true,
          quarters: targetAcc.planQuarters
        };
        setCockpitData(newCockpitData);
        setWeeklyObjectives(targetAcc.planObjectives);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCockpitData));
          localStorage.setItem(OBJECTIVES_STORAGE_KEY, JSON.stringify(targetAcc.planObjectives));
        } catch {}
      } else {
        // Generate calibrated plan dynamically for this account!
        const plan = generateTradePlan({
          planName: targetAcc.name,
          initialCapital: targetAcc.startingBalance,
          annualTarget: targetAcc.profitTarget || (targetAcc.startingBalance * 1.2),
          harvestSweepPercent: targetAcc.category === 'personal_compounding' ? 20 : 0,
          instrument: 'Gold XAU/USD'
        });
        const newCockpitData: CockpitData = {
          traderName: cockpitData.traderName || 'Yohannes Sharew',
          seedCapital: plan.seedCapital,
          targetBanked: plan.targetBanked,
          targetRetained: plan.targetRetained,
          targetTotal: plan.targetTotal,
          devotionGatePassedToday: true,
          quarters: plan.quarters
        };
        setCockpitData(newCockpitData);
        setWeeklyObjectives(plan.objectives);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCockpitData));
          localStorage.setItem(OBJECTIVES_STORAGE_KEY, JSON.stringify(plan.objectives));
        } catch {}

        // Cache plan on account
        const accWithPlan: PortfolioAccount = {
          ...targetAcc,
          csvSource: plan.csvString,
          planQuarters: plan.quarters,
          planObjectives: plan.objectives,
          planBanked: plan.targetBanked,
          planRetained: plan.targetRetained,
          planTotal: plan.targetTotal
        };
        const updatedWithCached = updatedAccounts.map(a => a.id === id ? accWithPlan : a);
        setAccounts(updatedWithCached);
        try {
          localStorage.setItem('t19_portfolio_accounts', JSON.stringify(updatedWithCached));
        } catch {}
      }
    } catch (e) {
      console.error('Error switching account:', e);
    }
  };

  const saveAccount = (account: PortfolioAccount) => {
    try {
      setAccounts(prev => {
        const exists = prev.some(a => a.id === account.id);
        const updated = exists ? prev.map(a => a.id === account.id ? account : a) : [...prev, account];
        try {
          localStorage.setItem('t19_portfolio_accounts', JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage error saving accounts:', e);
        }
        // Seamless cross-device cloud synchronization
        firestoreCloudSync.syncAccounts(updated, activeAccountId);
        return updated;
      });
    } catch (e) {
      console.error('saveAccount error:', e);
    }
  };

  const deleteAccount = (id: string) => {
    let remaining = accounts.filter(a => a.id !== id);
    if (remaining.length === 0) {
      const freshAccount: PortfolioAccount = {
        id: `acc_desk_${Date.now()}`,
        name: 'Personal Compounding Desk',
        broker: 'MetaTrader 5',
        accountNumber: 'MT5-0001',
        category: 'personal_compounding',
        currency: 'USD',
        startingBalance: 50.0,
        currentEquity: 50.0,
        highWaterMark: 50.0,
        dailyLossLimit: 20.0,
        maxTrailingDrawdownLimit: 25.0,
        profitTarget: 37150.0,
        isActive: true,
        status: 'active',
        notes: '',
        createdAt: new Date().toISOString().split('T')[0]
      };
      remaining = [freshAccount];
    }
    setAccounts(remaining);
    try {
      localStorage.setItem('t19_portfolio_accounts', JSON.stringify(remaining));
    } catch {}
    const newActiveId = activeAccountId === id || !remaining.some(a => a.id === activeAccountId)
      ? remaining[0].id
      : activeAccountId;
    firestoreCloudSync.syncAccounts(remaining, newActiveId);
    if (activeAccountId === id || !remaining.some(a => a.id === activeAccountId)) {
      switchAccount(remaining[0].id);
    }
  };

  const removeDemoAccounts = () => {
    const demoIds = ['acc_personal_500', 'acc_personal_1000'];
    const nonDemo = accounts.filter(a => !demoIds.includes(a.id) && !a.name.toLowerCase().includes('challenge') && !a.name.toLowerCase().includes('express'));
    const finalAccs = nonDemo.length > 0 ? nonDemo : [DEFAULT_PORTFOLIO_ACCOUNTS[0]];
    setAccounts(finalAccs);
    try {
      localStorage.setItem('t19_portfolio_accounts', JSON.stringify(finalAccs));
    } catch {}
    const nextActiveId = finalAccs.some(a => a.id === activeAccountId) ? activeAccountId : finalAccs[0].id;
    firestoreCloudSync.syncAccounts(finalAccs, nextActiveId);
    if (!finalAccs.some(a => a.id === activeAccountId)) {
      switchAccount(finalAccs[0].id);
    }
  };

  const updateAccountPlan = async (accountId: string, planResult: GeneratedPlanResult) => {
    const targetAcc = accounts.find(a => a.id === accountId);
    if (!targetAcc) return;
    const updatedAcc: PortfolioAccount = {
      ...targetAcc,
      startingBalance: planResult.seedCapital,
      profitTarget: planResult.targetTotal,
      csvSource: planResult.csvString,
      planQuarters: planResult.quarters,
      planObjectives: planResult.objectives,
      planBanked: planResult.targetBanked,
      planRetained: planResult.targetRetained,
      planTotal: planResult.targetTotal
    };
    saveAccount(updatedAcc);
    if (activeAccountId === accountId) {
      await importPlanFromCsv(planResult.csvString);
    }
  };

  // UI state
  const [selectedQuarter, setSelectedQuarter] = useState<string>('quarter-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'harvest'>('all');
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('growth');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('linear');
  const [activeNavTab, setActiveNavTab] = useState<ActiveTab>('cockpit');
  const [journalSubView, setJournalSubView] = useState<'calendar' | 'comparison' | 'notes' | 'weekly_recap'>('calendar');

  const [workspaceMode, setWorkspaceModeState] = useState<WorkspaceMode>(() => {
    try {
      const saved = localStorage.getItem('transformer19_workspace_mode');
      if (saved && ['hierarchy', 'planner', 'journalRisk', 'performance', 'accounts', 'classic'].includes(saved)) {
        return saved as WorkspaceMode;
      }
    } catch (e) {}
    return 'hierarchy';
  });

  const setWorkspaceMode = useCallback((mode: WorkspaceMode) => {
    setWorkspaceModeState(mode);
    try {
      localStorage.setItem('transformer19_workspace_mode', mode);
    } catch (e) {}
  }, []);

  const navigateToTab = useCallback((tab: ActiveTab, targetElementId?: string) => {
    setActiveNavTab(tab);

    // Map ActiveTab to WorkspaceMode (3 Lean Workspaces: hierarchy, planner, journalRisk)
    let targetWorkspace: WorkspaceMode = 'hierarchy';
    let defaultTargetId = 'workspace-container';

    if (tab === 'cockpit') {
      targetWorkspace = 'hierarchy';
      defaultTargetId = 'quarter-matrix-section';
    } else if (tab === 'objectives') {
      targetWorkspace = 'hierarchy';
      defaultTargetId = 'quarter-matrix-section';
    } else if (tab === 'planVsActual') {
      targetWorkspace = 'hierarchy';
      defaultTargetId = 'manual-plan-editor-section';
    } else if (tab === 'planner') {
      targetWorkspace = 'accounts';
      defaultTargetId = 'accounts-portfolio-section';
    } else if (tab === 'portfolio') {
      targetWorkspace = 'accounts';
      defaultTargetId = 'accounts-portfolio-section';
    } else if (tab === 'riskGuard') {
      targetWorkspace = 'journalRisk';
      defaultTargetId = 'risk-circuit-breaker-section';
    } else if (tab === 'brokerSync') {
      targetWorkspace = 'journalRisk';
      defaultTargetId = 'portfolio-section';
    } else if (tab === 'disciplines' || tab === 'audit') {
      targetWorkspace = 'journalRisk';
      defaultTargetId = 'risk-circuit-breaker-section';
    } else if (tab === 'journal' || tab === 'calculator') {
      targetWorkspace = 'journalRisk';
      defaultTargetId = 'daily-journal-section';
    } else if (tab === 'analytics' || tab === 'rating' || tab === 'tearsheet' || tab === 'quant') {
      targetWorkspace = 'journalRisk';
      defaultTargetId = 'analytics-section';
    } else {
      targetWorkspace = 'journalRisk';
      defaultTargetId = 'daily-journal-section';
    }

    setWorkspaceModeState(prev => {
      if (prev === 'classic') return 'classic';
      try {
        localStorage.setItem('transformer19_workspace_mode', targetWorkspace);
      } catch (e) {}
      return targetWorkspace;
    });

    const finalTargetId = targetElementId || defaultTargetId;
    scrollToElement(finalTargetId);
  }, [setActiveNavTab]);

  // Gracefully fallback old saved mt5journal navigation to journal
  useEffect(() => {
    if ((activeNavTab as string) === 'mt5journal') {
      setActiveNavTab('journal');
    }
  }, [activeNavTab]);

  // Helper to ensure notes never carry null/invalid pnl into render cycles
  const sanitizeJournalNote = (note: any): DailyJournalNote => ({
    ...note,
    pnl: (note && note.pnl != null && typeof note.pnl === 'number' && !isNaN(note.pnl))
      ? note.pnl
      : (note && note.pnl != null && typeof note.pnl === 'string' && !isNaN(parseFloat(note.pnl)))
      ? parseFloat(note.pnl)
      : undefined
  });

  // Helper to extract map of modified sessions for cross-device cloud sync
  const extractSessionsMap = (quarters: TradingQuarter[]): Record<string, any> => {
    const map: Record<string, any> = {};
    if (!Array.isArray(quarters)) return map;
    quarters.forEach(q => {
      q.months?.forEach(m => {
        m.weeks?.forEach(w => {
          w.days?.forEach((d, idx) => {
            const sId = `${w.id}-d${idx + 1}`;
            if (
              d.status === 'completed' ||
              d.status === 'skipped' ||
              (d.actualPnl !== undefined && d.actualPnl !== null) ||
              (d.notes && d.notes.trim() !== '') ||
              (d.date && d.date.trim() !== '')
            ) {
              map[sId] = {
                status: d.status || 'pending',
                actualPnl: d.actualPnl !== undefined && d.actualPnl !== null ? Number(d.actualPnl) : null,
                notes: d.notes || '',
                isLoss: d.isLoss || false,
                date: d.date || null,
                proto: d.proto || null,
                completedAt: d.completedAt || null
              };
            }
          });
        });
      });
    });
    return map;
  };

  // Helper to apply remote sessions map to cockpit data
  const applySessionsToQuarters = (prev: CockpitData, sessionsMap: Record<string, any>): CockpitData => {
    if (!sessionsMap || typeof sessionsMap !== 'object') return prev;
    const nextQuarters = prev.quarters.map(q => ({
      ...q,
      months: q.months.map(m => ({
        ...m,
        weeks: m.weeks.map(w => ({
          ...w,
          days: w.days.map((d, dIdx) => {
            const sId = `${w.id}-d${dIdx + 1}`;
            const remote = sessionsMap[sId];
            if (remote) {
              return {
                ...d,
                status: remote.status || d.status,
                actualPnl: remote.actualPnl !== undefined && remote.actualPnl !== null ? Number(remote.actualPnl) : (remote.actualPnl === null ? undefined : d.actualPnl),
                notes: remote.notes !== undefined ? remote.notes : d.notes,
                isLoss: remote.isLoss !== undefined ? remote.isLoss : d.isLoss,
                date: remote.date || d.date,
                proto: remote.proto || d.proto,
                completedAt: remote.completedAt || d.completedAt
              };
            }
            return d;
          })
        }))
      }))
    }));
    return { ...prev, quarters: nextQuarters };
  };

  // Daily Trading Journal Sticky Notes state
  const [journalNotes, setJournalNotes] = useState<DailyJournalNote[]>(() => {
    try {
      const saved = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeJournalNote);
      }
    } catch (e) {
      console.warn('Failed loading journal notes from storage:', e);
    }
    return DEFAULT_JOURNAL_NOTES.map(sanitizeJournalNote);
  });

  // Save journal notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(journalNotes));
    } catch (e) {
      console.warn('Failed saving journal notes to local storage:', e);
    }
  }, [journalNotes]);

  const addJournalNote = async (noteData: Omit<DailyJournalNote, 'id' | 'createdAt'>) => {
    const newNote: DailyJournalNote = {
      ...noteData,
      id: `jn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rotation: noteData.rotation !== undefined ? noteData.rotation : Math.round((Math.random() * 4 - 2) * 10) / 10
    };

    const nextNotes = [newNote, ...journalNotes];
    setJournalNotes(nextNotes);
    firestoreCloudSync.syncJournalNotes(nextNotes);
    sqliteStorage.saveNote({
      noteId: newNote.id,
      dayId: newNote.dayId,
      dayLabel: newNote.dayLabel,
      date: newNote.date,
      sessionTag: newNote.sessionTag,
      title: newNote.title,
      content: newNote.content,
      color: newNote.color,
      outcome: newNote.outcome,
      pnl: newNote.pnl !== undefined ? newNote.pnl : null,
      rotation: newNote.rotation,
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt
    });
    setIsSyncing(true);
    cloudSync.enqueueMutation('journal', newNote);
    fetch('/api/sqlite/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: newNote })
    }).catch(() => {
      fetch('/api/postgres/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote })
      });
    }).finally(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    });
  };

  const updateJournalNote = async (id: string, updates: Partial<DailyJournalNote>) => {
    let updatedNote: DailyJournalNote | null = null;
    const nextNotes = journalNotes.map(note => {
      if (note.id === id) {
        updatedNote = {
          ...note,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        return updatedNote;
      }
      return note;
    });
    setJournalNotes(nextNotes);
    firestoreCloudSync.syncJournalNotes(nextNotes);

    if (updatedNote) {
      const noteToSave = updatedNote as DailyJournalNote;
      sqliteStorage.saveNote({
        noteId: noteToSave.id,
        dayId: noteToSave.dayId,
        dayLabel: noteToSave.dayLabel,
        date: noteToSave.date,
        sessionTag: noteToSave.sessionTag,
        title: noteToSave.title,
        content: noteToSave.content,
        color: noteToSave.color,
        outcome: noteToSave.outcome,
        pnl: noteToSave.pnl !== undefined ? noteToSave.pnl : null,
        rotation: noteToSave.rotation,
        createdAt: noteToSave.createdAt,
        updatedAt: noteToSave.updatedAt
      });
      setIsSyncing(true);
      cloudSync.enqueueMutation('journal', noteToSave);
      fetch('/api/sqlite/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteToSave })
      }).catch(() => {
        fetch('/api/postgres/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: noteToSave })
        });
      }).finally(() => {
        setIsSyncing(false);
        setLastSyncTime(new Date().toLocaleTimeString());
      });
    }
  };

  const deleteJournalNote = async (id: string) => {
    const remaining = journalNotes.filter(note => note.id !== id);
    setJournalNotes(remaining);
    firestoreCloudSync.deleteJournalNote(id, remaining);
    sqliteStorage.deleteNote(id);
    setIsSyncing(true);
    cloudSync.enqueueMutation('delete_journal', { id });
    fetch(`/api/sqlite/journal/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(() => {
      fetch(`/api/postgres/journal/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }).finally(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    });
  };

  // Daily Emotional & Psychological State Logs state
  const [mentalStateLogs, setMentalStateLogs] = useState<MentalStateLog[]>(() => {
    try {
      const saved = localStorage.getItem(MENTAL_STATE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed loading mental state logs from storage:', e);
    }
    return DEFAULT_MENTAL_STATE_LOGS;
  });

  // Save mental state logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MENTAL_STATE_STORAGE_KEY, JSON.stringify(mentalStateLogs));
    } catch (e) {
      console.warn('Failed saving mental state logs to storage:', e);
    }
  }, [mentalStateLogs]);

  const addMentalStateLog = async (logData: Omit<MentalStateLog, 'id' | 'loggedAt'>) => {
    const newLog: MentalStateLog = {
      ...logData,
      id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      loggedAt: new Date().toISOString()
    };

    setMentalStateLogs(prev => [newLog, ...prev]);
    sqliteStorage.saveMentalLog({
      logId: newLog.id,
      dayId: newLog.dayId,
      sessionTag: newLog.sessionTag,
      date: newLog.date,
      stateKey: newLog.stateKey,
      emoji: newLog.emoji,
      label: newLog.label,
      rating: newLog.rating,
      tagsJson: JSON.stringify(newLog.tags || []),
      notes: newLog.notes,
      loggedAt: newLog.loggedAt
    });
    setIsSyncing(true);
    cloudSync.enqueueMutation('mental', newLog);
    fetch('/api/sqlite/mental', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log: newLog })
    }).catch(() => {
      fetch('/api/postgres/mental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log: newLog })
      });
    }).finally(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    });
  };

  const updateMentalStateLog = async (id: string, updates: Partial<MentalStateLog>) => {
    let updatedLog: MentalStateLog | null = null;
    setMentalStateLogs(prev =>
      prev.map(item => {
        if (item.id === id) {
          updatedLog = {
            ...item,
            ...updates
          };
          return updatedLog;
        }
        return item;
      })
    );

    if (updatedLog) {
      const logToSave = updatedLog as MentalStateLog;
      sqliteStorage.saveMentalLog({
        logId: logToSave.id,
        dayId: logToSave.dayId,
        sessionTag: logToSave.sessionTag,
        date: logToSave.date,
        stateKey: logToSave.stateKey,
        emoji: logToSave.emoji,
        label: logToSave.label,
        rating: logToSave.rating,
        tagsJson: JSON.stringify(logToSave.tags || []),
        notes: logToSave.notes,
        loggedAt: logToSave.loggedAt
      });
      setIsSyncing(true);
      cloudSync.enqueueMutation('mental', logToSave);
      fetch('/api/sqlite/mental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log: logToSave })
      }).catch(() => {
        fetch('/api/postgres/mental', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ log: logToSave })
        });
      }).finally(() => {
        setIsSyncing(false);
        setLastSyncTime(new Date().toLocaleTimeString());
      });
    }
  };

  const deleteMentalStateLog = async (id: string) => {
    setMentalStateLogs(prev => prev.filter(l => l.id !== id));
    sqliteStorage.deleteMentalLog(id);
    setIsSyncing(true);
    cloudSync.enqueueMutation('delete_mental', { id });
    fetch(`/api/sqlite/mental/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(() => {
      fetch(`/api/postgres/mental/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }).finally(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    });
  };

  // AI Performance Rating State (Evaluated across the 6 Core Trading Areas)
  const [performanceRating, setPerformanceRating] = useState<PerformanceRatingData>(() => {
    try {
      const saved = localStorage.getItem(RATING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.metrics)) return parsed;
      }
    } catch (e) {
      console.warn('Failed loading cached performance rating:', e);
    }
    return computeRealFeedPerformanceRating(
      cockpitData.quarters,
      cockpitData.devotionGatePassedToday,
      journalNotes
    );
  });
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  // Dynamic Real Feed Evaluation starting from Day 1
  useEffect(() => {
    const realFeedData = calculateMathematicalPerformanceRating({
      quarters: cockpitData.quarters,
      devotionGatePassedToday: cockpitData.devotionGatePassedToday,
      journalNotes,
      mentalStateLogs,
      activeAccount,
      traderName: cockpitData.traderName,
      workingEquity: metrics.currentWorkingEquity,
      bankedCash: metrics.currentBankedCash
    });
    setPerformanceRating(realFeedData);
    try {
      localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(realFeedData));
    } catch {
      // ignore
    }
  }, [
    cockpitData.quarters,
    cockpitData.devotionGatePassedToday,
    journalNotes,
    mentalStateLogs,
    activeAccount,
    cockpitData.traderName,
    metrics.currentWorkingEquity,
    metrics.currentBankedCash
  ]);

  // Apply a full cockpit snapshot (from local SQLite or remote Cloud sync)
  const applyCockpitSnapshot = (data: any) => {
    if (!data) return;
    if (data.notes && data.notes.length > 0) {
      setJournalNotes(prev => {
        const map = new Map<string, DailyJournalNote>();
        prev.forEach(n => map.set(n.id, n));
        data.notes.forEach((n: any) => {
          map.set(n.noteId || n.id, {
            id: n.noteId || n.id,
            dayId: n.dayId,
            dayLabel: n.dayLabel,
            date: n.date,
            sessionTag: n.sessionTag,
            title: n.title,
            content: n.content,
            color: n.color,
            outcome: n.outcome,
            pnl: n.pnl,
            rotation: n.rotation,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt
          });
        });
        return Array.from(map.values());
      });
    }
    if (data.mentalLogs && data.mentalLogs.length > 0) {
      setMentalStateLogs(data.mentalLogs.map((l: any) => ({
        id: l.logId || l.id,
        dayId: l.dayId,
        sessionTag: l.sessionTag,
        date: l.date,
        stateKey: l.stateKey as MentalStateKey,
        emoji: l.emoji,
        label: l.label,
        rating: l.rating,
        tags: typeof l.tagsJson === 'string' ? JSON.parse(l.tagsJson || '[]') : (l.tags || []),
        notes: l.notes || undefined,
        loggedAt: l.loggedAt
      })));
    }
    if (data.sessions && data.sessions.length > 0) {
      const sessionMap = new Map<string, any>();
      data.sessions.forEach((s: any) => sessionMap.set(s.sessionId, s));
      setCockpitData(prev => {
        const nextQuarters = prev.quarters.map(q => ({
          ...q,
          months: q.months.map(m => ({
            ...m,
            weeks: m.weeks.map(w => ({
              ...w,
              days: w.days.map((d, dIdx) => {
                const sId = `${w.id}-d${dIdx + 1}`;
                const remote = sessionMap.get(sId);
                if (remote) {
                  const hasRemoteActual = remote.actualResult !== null && remote.actualResult !== undefined;
                  const isRemoteCompleted = remote.status === 'completed';

                  // CRITICAL PRESERVATION: If local already has actualPnl or is completed,
                  // and remote is unexecuted/null, retain local user edits
                  const finalActualPnl = hasRemoteActual
                    ? Number(remote.actualResult)
                    : d.actualPnl;
                  const finalStatus = (hasRemoteActual || isRemoteCompleted)
                    ? ((remote.status as DayStatus) || d.status)
                    : d.status;
                  const finalNotes = remote.notes !== null && remote.notes !== undefined && remote.notes !== ''
                    ? remote.notes
                    : d.notes;
                  const finalIsLoss = remote.isLoss !== undefined && remote.isLoss !== null 
                    ? Boolean(remote.isLoss) 
                    : d.isLoss;

                  return {
                    ...d,
                    status: finalStatus,
                    actualPnl: finalActualPnl,
                    notes: finalNotes,
                    proto: remote.proto || d.proto,
                    isLoss: finalIsLoss,
                    date: remote.date || d.date,
                  };
                }
                return d;
              })
            }))
          }))
        }));
        return { ...prev, quarters: nextQuarters };
      });
    }
    if (data.objectives && data.objectives.length > 0) {
      const objMap = new Map<string, any>();
      data.objectives.forEach((o: any) => objMap.set(o.weekId, o));
      setWeeklyObjectives(prev =>
        prev.map(o => {
          const remote = objMap.get(o.weekId);
          if (remote) {
            let parsedChecklist = o.checklist;
            try {
              if (remote.checklistJson) parsedChecklist = JSON.parse(remote.checklistJson);
            } catch {}
            return {
              ...o,
              status: remote.status || o.status,
              primaryObjective: remote.primaryObjective || o.primaryObjective,
              tacticalNotes: remote.tacticalNotes !== undefined ? remote.tacticalNotes : o.tacticalNotes,
              checklist: parsedChecklist,
              debriefNotes: remote.debriefNotes !== undefined ? remote.debriefNotes : o.debriefNotes,
              updatedAt: remote.updatedAt || o.updatedAt,
            };
          }
          return o;
        })
      );
    }
    if (data.state) {
      setCockpitData(prev => ({
        ...prev,
        traderName: data.state.traderName || prev.traderName,
        devotionGatePassedToday: data.state.devotionGatePassedToday ?? prev.devotionGatePassedToday,
      }));
    }
  };

  // Fast SQLite Database Hydration on startup + automatic cloud sync check
  useEffect(() => {
    const initDatabaseConnection = async () => {
      // 1. Instantly hydrate from browser-native SQLite engine (IndexedDB)
      try {
        const [savedSessions, savedNotes, savedMental, savedObjectives, savedState] = await Promise.all([
          sqliteStorage.getAllSessions(),
          sqliteStorage.getAllNotes(),
          sqliteStorage.getAllMentalLogs(),
          sqliteStorage.getAllObjectives(),
          sqliteStorage.getState()
        ]);

        if (savedSessions && savedSessions.length > 0) {
          const sessionMap = new Map<string, any>();
          savedSessions.forEach(s => sessionMap.set(s.sessionId, s));
          setCockpitData(prev => ({
            ...prev,
            quarters: prev.quarters.map(q => ({
              ...q,
              months: q.months.map(m => ({
                ...m,
                weeks: m.weeks.map(w => ({
                  ...w,
                  days: w.days.map((d, dIdx) => {
                    const sId = `${w.id}-d${dIdx + 1}`;
                    const local = sessionMap.get(sId);
                    if (local) {
                      return {
                        ...d,
                        status: (local.status as DayStatus) || d.status,
                        actualPnl: local.actualResult !== null && local.actualResult !== undefined ? Number(local.actualResult) : d.actualPnl,
                        notes: local.notes || d.notes,
                        proto: local.proto || d.proto,
                        isLoss: local.isLoss !== undefined ? Boolean(local.isLoss) : d.isLoss,
                        date: local.date || d.date,
                      };
                    }
                    return d;
                  })
                }))
              }))
            }))
          }));
        }

        if (savedNotes && savedNotes.length > 0) {
          setJournalNotes(prev => {
            const map = new Map<string, DailyJournalNote>();
            prev.forEach(n => map.set(n.id, n));
            savedNotes.forEach(n => {
              map.set(n.noteId, {
                id: n.noteId,
                dayId: n.dayId,
                dayLabel: n.dayLabel,
                date: n.date,
                sessionTag: n.sessionTag,
                title: n.title,
                content: n.content,
                color: n.color,
                outcome: n.outcome,
                pnl: n.pnl !== null && n.pnl !== undefined ? Number(n.pnl) : undefined,
                rotation: n.rotation,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt
              });
            });
            return Array.from(map.values());
          });
        }

        if (savedMental && savedMental.length > 0) {
          setMentalStateLogs(prev => {
            const map = new Map<string, MentalStateLog>();
            prev.forEach(m => map.set(m.id, m));
            savedMental.forEach(l => {
              map.set(l.logId, {
                id: l.logId,
                dayId: l.dayId,
                sessionTag: l.sessionTag,
                date: l.date,
                stateKey: l.stateKey as MentalStateKey,
                emoji: l.emoji,
                label: l.label,
                rating: l.rating,
                tags: typeof l.tagsJson === 'string' ? JSON.parse(l.tagsJson || '[]') : [],
                notes: l.notes,
                loggedAt: l.loggedAt
              });
            });
            return Array.from(map.values());
          });
        }

        if (savedState) {
          setCockpitData(prev => ({
            ...prev,
            traderName: savedState.traderName || prev.traderName,
            devotionGatePassedToday: savedState.devotionGatePassedToday ?? prev.devotionGatePassedToday
          }));
        }
      } catch (err) {
        console.warn('Browser SQLite hydration fallback:', err);
      }

      // 2. Fetch server database snapshot (/api/sqlite/cockpit or /api/postgres/cockpit)
      try {
        let res = await fetch('/api/sqlite/cockpit');
        if (!res.ok) {
          res = await fetch('/api/postgres/cockpit');
        }
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            setPostgresConnected(true);
            setFirestoreConnected(true);
            applyCockpitSnapshot(data);
          }
        }
      } catch (err) {
        console.warn('Server SQLite database fetch fallback:', err);
      }

      // 3. Initialize Real-Time Cross-Device Cloud Synchronization (Firestore)
      try {
        // Eagerly pull latest snapshot from Cloud Firestore to immediately hydrate devices (mobile/desktop)
        const snap = await firestoreCloudSync.pullLatestSnapshot();
        if (snap) {
          if (snap.accountsJson && typeof snap.accountsJson === 'string') {
            try {
              const remoteAccounts = JSON.parse(snap.accountsJson);
              if (Array.isArray(remoteAccounts) && remoteAccounts.length > 0) {
                setAccounts(remoteAccounts);
                try { localStorage.setItem('t19_portfolio_accounts', snap.accountsJson); } catch {}
              }
            } catch {}
          }
          if (snap.activeAccountId && typeof snap.activeAccountId === 'string') {
            setActiveAccountId(snap.activeAccountId);
            try { localStorage.setItem('t19_active_acc_id', snap.activeAccountId); } catch {}
          }
          if (snap.notesJson && typeof snap.notesJson === 'string') {
            try {
              const remoteNotes = JSON.parse(snap.notesJson);
              if (Array.isArray(remoteNotes) && remoteNotes.length > 0) {
                const sanitized = remoteNotes.map(sanitizeJournalNote);
                setJournalNotes(sanitized);
                try { localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(sanitized)); } catch {}
              }
            } catch {}
          }
          if (snap.sessionsJson && typeof snap.sessionsJson === 'string') {
            try {
              const remoteSessions = JSON.parse(snap.sessionsJson);
              if (remoteSessions && typeof remoteSessions === 'object') {
                setCockpitData(prev => applySessionsToQuarters(prev, remoteSessions));
              }
            } catch {}
          }
          if (snap.objectivesJson && typeof snap.objectivesJson === 'string') {
            try {
              const remoteObjs = JSON.parse(snap.objectivesJson);
              if (Array.isArray(remoteObjs) && remoteObjs.length > 0) {
                setWeeklyObjectives(remoteObjs);
              }
            } catch {}
          }
          if (snap.mentalLogsJson && typeof snap.mentalLogsJson === 'string') {
            try {
              const remoteMental = JSON.parse(snap.mentalLogsJson);
              if (Array.isArray(remoteMental) && remoteMental.length > 0) {
                setMentalStateLogs(remoteMental);
              }
            } catch {}
          }
          if (snap.traderName || snap.devotionGatePassedToday !== undefined) {
            setCockpitData(prev => ({
              ...prev,
              traderName: snap.traderName || prev.traderName,
              devotionGatePassedToday: snap.devotionGatePassedToday !== undefined ? snap.devotionGatePassedToday : prev.devotionGatePassedToday
            }));
          }
        }

        firestoreCloudSync.initRealtimeSync({
          onAccountsUpdated: (remoteAccounts, remoteActiveId) => {
            if (Array.isArray(remoteAccounts) && remoteAccounts.length > 0) {
              setAccounts(prev => {
                const remoteStr = JSON.stringify(remoteAccounts);
                const prevStr = JSON.stringify(prev);
                if (remoteStr !== prevStr) {
                  try {
                    localStorage.setItem('t19_portfolio_accounts', remoteStr);
                  } catch {}
                  return remoteAccounts;
                }
                return prev;
              });

              if (remoteActiveId) {
                setActiveAccountId(prev => {
                  if (prev !== remoteActiveId) {
                    try {
                      localStorage.setItem('t19_active_acc_id', remoteActiveId);
                    } catch {}
                    return remoteActiveId;
                  }
                  return prev;
                });
              }

              // Check if active account has custom plan to calibrate
              const active = remoteAccounts.find(a => a.id === (remoteActiveId || activeAccountId));
              if (active && (active.customPlan || active.planQuarters)) {
                const planQ = active.customPlan?.quarters || active.planQuarters;
                if (planQ && Array.isArray(planQ)) {
                  setCockpitData(prev => ({ ...prev, quarters: planQ }));
                }
              }
            }
          },
          onActiveAccountUpdated: (remoteActiveId) => {
            if (remoteActiveId) {
              setActiveAccountId(remoteActiveId);
              try {
                localStorage.setItem('t19_active_acc_id', remoteActiveId);
              } catch {}
              setAccounts(prev => prev.map(a => ({ ...a, isActive: a.id === remoteActiveId })));
            }
          },
          onProfileUpdated: ({ traderName, devotionGatePassedToday }) => {
            setCockpitData(prev => ({
              ...prev,
              traderName: traderName || prev.traderName,
              devotionGatePassedToday: devotionGatePassedToday !== undefined ? devotionGatePassedToday : prev.devotionGatePassedToday
            }));
          },
          onJournalNotesUpdated: (remoteNotes) => {
            if (Array.isArray(remoteNotes)) {
              const sanitized = remoteNotes.map(sanitizeJournalNote);
              setJournalNotes(sanitized);
              try {
                localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(sanitized));
              } catch {}
            }
          },
          onObjectivesUpdated: (remoteObjectives) => {
            if (Array.isArray(remoteObjectives) && remoteObjectives.length > 0) {
              setWeeklyObjectives(prev => {
                const objMap = new Map<string, any>();
                remoteObjectives.forEach(o => objMap.set(o.weekId, o));
                return prev.map(o => {
                  const remote = objMap.get(o.weekId);
                  return remote ? { ...o, ...remote } : o;
                });
              });
            }
          },
          onMentalLogsUpdated: (remoteMentalLogs) => {
            if (Array.isArray(remoteMentalLogs) && remoteMentalLogs.length > 0) {
              setMentalStateLogs(remoteMentalLogs);
            }
          },
          onSessionsUpdated: (sessionsMap) => {
            if (sessionsMap && typeof sessionsMap === 'object') {
              setCockpitData(prev => applySessionsToQuarters(prev, sessionsMap));
            }
          },
          onSyncStatusChanged: (status) => {
            setFirestoreConnected(status.isConnected);
            if (status.lastSyncedAt) {
              setLastSyncTime(status.lastSyncedAt);
            }
          }
        });

        // Seed check: If cloud currently has no custom accounts, seed it from local accounts
        setTimeout(async () => {
          try {
            const snap = await firestoreCloudSync.pullLatestSnapshot();
            const hasRemoteAccounts = snap?.accountsJson && JSON.parse(snap.accountsJson)?.length > 0;
            if (!hasRemoteAccounts && accounts.length > 0) {
              console.log('⚡ Initializing cloud database with local accounts...');
              await firestoreCloudSync.syncAccounts(accounts, activeAccountId);
            }
          } catch (e) {
            console.warn('Initial cloud seed check:', e);
          }
        }, 1200);
      } catch (err) {
        console.warn('Firestore realtime sync init warning:', err);
      }

      // 4. Check online status and flush any pending offline mutations
      setTimeout(() => {
        cloudSync.flushOfflineQueue();
      }, 1500);
    };

    initDatabaseConnection();
  }, []);

  // Trigger manual two-way sync across devices
  const triggerManualSync = async () => {
    setIsSyncing(true);
    try {
      // 1. Force push current local state to Cloud Firestore
      if (accounts.length > 0) {
        await firestoreCloudSync.syncAccounts(accounts, activeAccountId);
      }
      if (journalNotes.length > 0) {
        await firestoreCloudSync.syncJournalNotes(journalNotes);
      }
      if (weeklyObjectives.length > 0) {
        await firestoreCloudSync.syncWeeklyObjectives(weeklyObjectives);
      }
      if (cockpitData.quarters && cockpitData.quarters.length > 0) {
        const fullMap = extractSessionsMap(cockpitData.quarters);
        await firestoreCloudSync.syncSessionsMap(fullMap);
      }

      // 2. Pull latest snapshot from Cloud Firestore
      const snap = await firestoreCloudSync.pullLatestSnapshot();
      if (snap) {
        if (snap.accountsJson) {
          try {
            const parsed = JSON.parse(snap.accountsJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAccounts(parsed);
              localStorage.setItem('t19_portfolio_accounts', snap.accountsJson);
            }
          } catch {}
        }
        if (snap.activeAccountId) {
          setActiveAccountId(snap.activeAccountId);
          try {
            localStorage.setItem('t19_active_acc_id', snap.activeAccountId);
          } catch {}
        }
        if (snap.notesJson) {
          try {
            const parsedNotes = JSON.parse(snap.notesJson);
            if (Array.isArray(parsedNotes)) {
              setJournalNotes(parsedNotes.map(sanitizeJournalNote));
            }
          } catch {}
        }
        if (snap.sessionsJson) {
          try {
            const parsedSessions = JSON.parse(snap.sessionsJson);
            if (parsedSessions && typeof parsedSessions === 'object') {
              setCockpitData(prev => applySessionsToQuarters(prev, parsedSessions));
            }
          } catch {}
        }
        setFirestoreConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString());
      }

      // 3. Also pull from SQLite endpoint
      const res = await cloudSync.fullTwoWaySync();
      if (res.success && res.pulledData) {
        applyCockpitSnapshot(res.pulledData);
      }
    } catch (err) {
      console.error('Manual cloud sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Refresh Mathematical Performance Rating
  const refreshPerformanceRating = async () => {
    setIsRatingLoading(true);
    try {
      // Tactile audit response delay (200ms)
      await new Promise(resolve => setTimeout(resolve, 200));
      const calculated = calculateMathematicalPerformanceRating({
        quarters: cockpitData.quarters,
        devotionGatePassedToday: cockpitData.devotionGatePassedToday,
        journalNotes,
        mentalStateLogs,
        activeAccount,
        traderName: cockpitData.traderName,
        workingEquity: metrics.currentWorkingEquity,
        bankedCash: metrics.currentBankedCash
      });
      setPerformanceRating(calculated);
      try {
        localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(calculated));
      } catch (e) {}
    } catch (error) {
      console.error('Failed to recalculate performance rating:', error);
    } finally {
      setIsRatingLoading(false);
    }
  };

  // Accordion state: initialize all months and weeks as expanded by default so all quarters display data immediately
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => {
    const s = new Set<string>();
    INITIAL_QUARTERS.forEach(q => q.months.forEach(m => s.add(m.id)));
    return s;
  });
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(() => {
    const s = new Set<string>();
    INITIAL_QUARTERS.forEach(q => q.months.forEach(m => m.weeks.forEach(w => s.add(w.id))));
    return s;
  });

  const handleSelectQuarter = (qId: string) => {
    setSelectedQuarter(qId);
    setExpandedMonths(prev => {
      const next = new Set(prev);
      cockpitData.quarters.forEach(q => {
        if (qId === 'all' || q.id === qId) {
          q.months.forEach(m => next.add(m.id));
        }
      });
      return next;
    });
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      cockpitData.quarters.forEach(q => {
        if (qId === 'all' || q.id === qId) {
          q.months.forEach(m => m.weeks.forEach(w => next.add(w.id)));
        }
      });
      return next;
    });
  };

  // Weekly Execution Objectives State for all 48 weeks
  const [weeklyObjectives, setWeeklyObjectives] = useState<WeeklyObjective[]>(() => {
    try {
      const saved = localStorage.getItem(OBJECTIVES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed loading weekly objectives:', e);
    }
    return generateDefaultWeeklyObjectives();
  });

  // Save weekly objectives to local storage
  useEffect(() => {
    try {
      localStorage.setItem(OBJECTIVES_STORAGE_KEY, JSON.stringify(weeklyObjectives));
    } catch (e) {
      console.warn('Failed saving weekly objectives:', e);
    }
  }, [weeklyObjectives]);

  const syncObjectiveToDatabase = (objective: WeeklyObjective) => {
    setIsSyncing(true);
    sqliteStorage.saveObjective({
      weekId: objective.weekId,
      primaryObjective: objective.primaryObjective,
      tacticalNotes: objective.tacticalNotes,
      status: objective.status,
      checklistJson: JSON.stringify(objective.checklist || []),
      debriefNotes: objective.debriefNotes,
      updatedAt: new Date().toISOString()
    });
    cloudSync.enqueueMutation('objective', objective);
    fetch('/api/sqlite/objective', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective })
    }).catch(() => {
      fetch('/api/postgres/objective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective })
      });
    }).finally(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    });
  };

  const updateWeeklyObjective = (weekId: string, updates: Partial<WeeklyObjective>) => {
    let targetObj: WeeklyObjective | null = null;
    setWeeklyObjectives(prev =>
      prev.map(obj => {
        if (obj.weekId !== weekId) return obj;
        const updated = {
          ...obj,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        targetObj = updated;
        return updated;
      })
    );
    if (targetObj) {
      syncObjectiveToDatabase(targetObj);
    }
  };

  const toggleObjectiveChecklist = (weekId: string, checklistId: string) => {
    let targetObj: WeeklyObjective | null = null;
    setWeeklyObjectives(prev =>
      prev.map(obj => {
        if (obj.weekId !== weekId) return obj;
        const nextChecklist = obj.checklist.map(item =>
          item.id === checklistId ? { ...item, completed: !item.completed } : item
        );
        const updated = {
          ...obj,
          checklist: nextChecklist,
          updatedAt: new Date().toISOString()
        };
        targetObj = updated;
        return updated;
      })
    );
    if (targetObj) {
      syncObjectiveToDatabase(targetObj);
    }
  };

  const addChecklistItem = (weekId: string, text: string) => {
    if (!text.trim()) return;
    let targetObj: WeeklyObjective | null = null;
    setWeeklyObjectives(prev =>
      prev.map(obj => {
        if (obj.weekId !== weekId) return obj;
        const newItem: WeeklyChecklistItem = {
          id: `${weekId}_c_${Date.now()}`,
          text: text.trim(),
          completed: false
        };
        const updated = {
          ...obj,
          checklist: [...obj.checklist, newItem],
          updatedAt: new Date().toISOString()
        };
        targetObj = updated;
        return updated;
      })
    );
    if (targetObj) {
      syncObjectiveToDatabase(targetObj);
    }
  };

  const removeChecklistItem = (weekId: string, checklistId: string) => {
    let targetObj: WeeklyObjective | null = null;
    setWeeklyObjectives(prev =>
      prev.map(obj => {
        if (obj.weekId !== weekId) return obj;
        const updated = {
          ...obj,
          checklist: obj.checklist.filter(c => c.id !== checklistId),
          updatedAt: new Date().toISOString()
        };
        targetObj = updated;
        return updated;
      })
    );
    if (targetObj) {
      syncObjectiveToDatabase(targetObj);
    }
  };

  const resetWeeklyObjective = (weekId: string) => {
    const defaults = generateDefaultWeeklyObjectives();
    const matched = defaults.find(d => d.weekId === weekId);
    if (!matched) return;
    setWeeklyObjectives(prev =>
      prev.map(obj => (obj.weekId === weekId ? matched : obj))
    );
    syncObjectiveToDatabase(matched);
  };

  // Sync theme class
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark', 'dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark', 'dark-mode');
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark', 'dark-mode');
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark', 'dark-mode');
        document.body.setAttribute('data-theme', 'light');
      }
    } catch (e) {
      console.warn('Theme storage sync error:', e);
    }
  }, [theme]);

  // Persist locally
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cockpitData));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [cockpitData]);

  const syncStateToPostgres = (updates: any) => {
    sqliteStorage.saveState({
      userId: 'local-trader',
      traderName: updates.traderName || cockpitData.traderName,
      devotionGatePassedToday: updates.devotionGatePassedToday !== undefined ? updates.devotionGatePassedToday : cockpitData.devotionGatePassedToday,
      workingEquity: metrics.currentWorkingEquity,
      bankedCash: metrics.currentBankedCash,
      netWorth: metrics.currentTotalNetWorth,
      updatedAt: new Date().toISOString()
    });
    cloudSync.enqueueMutation('state', updates);
    fetch('/api/sqlite/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: updates
      })
    }).catch(() => {
      fetch('/api/postgres/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: updates
        })
      });
    });
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTraderName = (name: string) => {
    setCockpitData(prev => ({ ...prev, traderName: name }));
    syncStateToPostgres({ traderName: name });
  };

  const toggleDevotionGate = () => {
    const nextVal = !cockpitData.devotionGatePassedToday;
    setCockpitData(prev => ({
      ...prev,
      devotionGatePassedToday: nextVal,
      lastDevotionTimestamp: new Date().toISOString()
    }));
    syncStateToPostgres({ devotionGatePassedToday: nextVal });
  };

  const toggleMonth = (monthId: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(monthId)) next.delete(monthId);
      else next.add(monthId);
      return next;
    });
  };

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekId)) next.delete(weekId);
      else next.add(weekId);
      return next;
    });
  };

  const expandAll = () => {
    const allMonths = new Set<string>();
    const allWeeks = new Set<string>();
    cockpitData.quarters.forEach(q => {
      q.months.forEach(m => {
        allMonths.add(m.id);
        m.weeks.forEach(w => allWeeks.add(w.id));
      });
    });
    setExpandedMonths(allMonths);
    setExpandedWeeks(allWeeks);
  };

  const collapseAll = () => {
    setExpandedMonths(new Set());
    setExpandedWeeks(new Set());
  };

  // Toggle single day completion & sync to Database
  const toggleDayCompletion = (weekId: string, dayIndex: number) => {
    let targetSession: DailySession | null = null;
    setIsSyncing(true);

    const nextQuarters = cockpitData.quarters.map(q => ({
      ...q,
      months: q.months.map(m => ({
        ...m,
        weeks: m.weeks.map(w => {
          if (w.id !== weekId) return w;
          const nextDays = w.days.map((d, idx) => {
            if (idx !== dayIndex) return d;
            const currentStatus: DayStatus = d.status || 'pending';
            const nextStatus: DayStatus = currentStatus === 'completed' ? 'pending' : 'completed';
            const updatedSession = {
              ...d,
              status: nextStatus,
              completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined
            };
            targetSession = updatedSession;
            return updatedSession;
          });
          return { ...w, days: nextDays };
        })
      }))
    }));

    setCockpitData(prev => ({ ...prev, quarters: nextQuarters }));

    if (targetSession) {
      const s = targetSession as DailySession;
      const plannedNum = parseFloat((s.pnl || '0').replace(/[^0-9.-]/g, '')) || 25.0;
      const sessionPayload = {
        id: `${weekId}-d${dayIndex + 1}`,
        dayName: s.day,
        date: s.date || null,
        plannedTarget: plannedNum,
        actualResult: s.actualPnl !== undefined && s.actualPnl !== null ? s.actualPnl : null,
        actualPnl: s.actualPnl !== undefined && s.actualPnl !== null ? s.actualPnl : null,
        status: s.status,
        notes: s.notes ? s.notes : null,
        proto: s.proto || null,
        isLoss: s.isLoss || false
      };
      // Save directly to browser SQLite database (IndexedDB)
      sqliteStorage.saveSession({
        sessionId: `${weekId}-d${dayIndex + 1}`,
        weekId,
        dayNumber: dayIndex + 1,
        dayName: s.day,
        date: s.date || null,
        plannedTarget: plannedNum,
        actualResult: s.actualPnl !== undefined && s.actualPnl !== null ? s.actualPnl : null,
        deltaPercent: 0,
        status: s.status,
        notes: s.notes ? s.notes : null,
        proto: s.proto || null,
        isLoss: s.isLoss || false,
        updatedAt: new Date().toISOString()
      });
      const fullMap = extractSessionsMap(nextQuarters);
      firestoreCloudSync.syncSession(`${weekId}-d${dayIndex + 1}`, sessionPayload, fullMap);
      cloudSync.enqueueMutation('session', sessionPayload);
      fetch('/api/sqlite/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionPayload
        })
      }).catch(() => {
        fetch('/api/postgres/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: sessionPayload
          })
        });
      }).finally(() => {
        setIsSyncing(false);
        setLastSyncTime(new Date().toLocaleTimeString());
      });
    }
  };

  // Update specific day session details & sync to Database
  const updateDaySession = (weekId: string, dayIndex: number, updates: Partial<DailySession>) => {
    let targetSession: DailySession | null = null;
    setIsSyncing(true);

    const nextQuarters = cockpitData.quarters.map(q => ({
      ...q,
      months: q.months.map(m => ({
        ...m,
        weeks: m.weeks.map(w => {
          if (w.id !== weekId) return w;
          const nextDays = w.days.map((d, idx) => {
            if (idx !== dayIndex) return d;
            const updated = { ...d, ...updates };
            targetSession = updated;
            return updated;
          });
          return { ...w, days: nextDays };
        })
      }))
    }));

    setCockpitData(prev => ({ ...prev, quarters: nextQuarters }));

    if (targetSession) {
      const s = targetSession as DailySession;
      const plannedNum = parseFloat((s.pnl || '0').replace(/[^0-9.-]/g, '')) || 25.0;
      const sessionPayload = {
        id: `${weekId}-d${dayIndex + 1}`,
        dayName: s.day,
        date: s.date || null,
        plannedTarget: plannedNum,
        actualResult: s.actualPnl !== undefined && s.actualPnl !== null ? s.actualPnl : null,
        actualPnl: s.actualPnl !== undefined && s.actualPnl !== null ? s.actualPnl : null,
        status: s.status,
        notes: s.notes ? s.notes : null,
        proto: s.proto || null,
        isLoss: s.isLoss || false
      };
      // Save directly to browser SQLite database (IndexedDB)
      sqliteStorage.saveSession({
        sessionId: `${weekId}-d${dayIndex + 1}`,
        weekId,
        dayNumber: dayIndex + 1,
        dayName: s.day,
        date: s.date || null,
        plannedTarget: plannedNum,
        actualResult: s.actualPnl !== undefined && s.actualPnl !== null ? s.actualPnl : null,
        deltaPercent: 0,
        status: s.status,
        notes: s.notes ? s.notes : null,
        proto: s.proto || null,
        isLoss: s.isLoss || false,
        updatedAt: new Date().toISOString()
      });
      const fullMap = extractSessionsMap(nextQuarters);
      firestoreCloudSync.syncSession(`${weekId}-d${dayIndex + 1}`, sessionPayload, fullMap);
      cloudSync.enqueueMutation('session', sessionPayload);
      fetch('/api/sqlite/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionPayload
        })
      }).catch(() => {
        fetch('/api/postgres/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: sessionPayload
          })
        });
      }).finally(() => {
        setIsSyncing(false);
        setLastSyncTime(new Date().toLocaleTimeString());
      });
    }
  };

  // Batch mark all days in a week as completed or pending
  const batchMarkWeek = (weekId: string, markCompleted: boolean) => {
    const updatedSessions: { dayIndex: number; session: DailySession }[] = [];
    setIsSyncing(true);

    const nextQuarters = cockpitData.quarters.map(q => ({
      ...q,
      months: q.months.map(m => ({
        ...m,
        weeks: m.weeks.map(w => {
          if (w.id !== weekId) return w;
          const status: DayStatus = markCompleted ? 'completed' : 'pending';
          const nextDays = w.days.map((d, dIdx) => {
            const updated = {
              ...d,
              status,
              completedAt: markCompleted ? new Date().toISOString() : undefined
            };
            updatedSessions.push({ dayIndex: dIdx, session: updated });
            return updated;
          });
          return { ...w, days: nextDays };
        })
      }))
    }));

    setCockpitData(prev => ({ ...prev, quarters: nextQuarters }));

    const fullMap = extractSessionsMap(nextQuarters);
    firestoreCloudSync.syncSessionsMap(fullMap);

    Promise.all(
      updatedSessions.map(item => {
        const s = item.session;
        const plannedNum = parseFloat((s.pnl || '0').replace(/[^0-9.-]/g, '')) || 25.0;
        const sPayload = {
          id: `${weekId}-d${item.dayIndex + 1}`,
          dayName: s.day,
          date: s.date || null,
          plannedTarget: plannedNum,
          actualResult: s.actualPnl !== undefined && s.actualPnl !== null ? s.actualPnl : null,
          status: s.status,
          notes: s.notes ? s.notes : null,
          proto: s.proto || null,
          isLoss: s.isLoss || false
        };
        sqliteStorage.saveSession({
          sessionId: `${weekId}-d${item.dayIndex + 1}`,
          weekId,
          dayNumber: item.dayIndex + 1,
          dayName: s.day,
          date: s.date || null,
          plannedTarget: plannedNum,
          actualResult: s.actualPnl !== undefined && s.actualPnl !== null ? s.actualPnl : null,
          deltaPercent: 0,
          status: s.status,
          notes: s.notes ? s.notes : null,
          proto: s.proto || null,
          isLoss: s.isLoss || false,
          updatedAt: new Date().toISOString()
        });
        return fetch('/api/sqlite/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session: sPayload })
        }).catch(() => {
          return fetch('/api/postgres/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session: sPayload })
          });
        });
      })
    ).finally(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    });
  };

  const resetToOriginalPlan = () => {
    // Unconditionally reset SQLite database
    fetch('/api/sqlite/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {
      fetch('/api/postgres/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    // Unconditionally reset all session data back to pristine $0.00 baseline
    const resetQuarters = INITIAL_QUARTERS.map(q => ({
      ...q,
      months: q.months.map(m => ({
        ...m,
        weeks: m.weeks.map(w => ({
          ...w,
          days: w.days.map(d => ({
            ...d,
            status: 'pending' as const,
            actualPnl: undefined,
            notes: undefined,
            completedAt: undefined
          }))
        }))
      }))
    }));
    const freshData: CockpitData = {
      traderName: 'Yohannes Sharew',
      seedCapital: 50,
      targetBanked: 7150,
      targetRetained: 30000,
      targetTotal: 37150,
      devotionGatePassedToday: true,
      quarters: resetQuarters
    };
    setCockpitData(freshData);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freshData));
      // Purge any stale legacy data
      localStorage.removeItem('terminal_100k_cockpit_scandi_v4_zero');
      localStorage.removeItem('terminal_100k_cockpit_scandi_v3');
      localStorage.removeItem('terminal_100k_cockpit_scandi_v2');
      localStorage.removeItem('transformer19_weekly_objectives_v4_zero');
      localStorage.removeItem('transformer19_weekly_objectives_v1');
      localStorage.removeItem('transformer19_weekly_objectives_v2');
    } catch {
      // ignore
    }

    // Reset weekly objectives
    const defaultObjs = generateDefaultWeeklyObjectives(resetQuarters);
    setWeeklyObjectives(defaultObjs);
    setJournalNotes(DEFAULT_JOURNAL_NOTES);
    setMentalStateLogs(DEFAULT_MENTAL_STATE_LOGS);
    try {
      localStorage.setItem(OBJECTIVES_STORAGE_KEY, JSON.stringify(defaultObjs));
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(DEFAULT_JOURNAL_NOTES));
      localStorage.setItem(MENTAL_STATE_STORAGE_KEY, JSON.stringify(DEFAULT_MENTAL_STATE_LOGS));
    } catch {
      // ignore
    }

    // Reset cloud state
    firestoreCloudSync.syncSessionsMap({});
    firestoreCloudSync.syncJournalNotes(DEFAULT_JOURNAL_NOTES);

    // Auto-expand all months and weeks
    const allM = new Set<string>();
    INITIAL_QUARTERS.forEach(q => q.months.forEach(m => allM.add(m.id)));
    setExpandedMonths(allM);

    const allW = new Set<string>();
    INITIAL_QUARTERS.forEach(q => q.months.forEach(m => m.weeks.forEach(w => allW.add(w.id))));
    setExpandedWeeks(allW);
  };

  const exportBackupJson = () => {
    return JSON.stringify(cockpitData, null, 2);
  };

  const importBackupJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.quarters && Array.isArray(parsed.quarters)) {
        setCockpitData({
          traderName: parsed.traderName || 'Yohannes Sharew',
          seedCapital: parsed.seedCapital || 50,
          targetBanked: parsed.targetBanked || 7150,
          targetRetained: parsed.targetRetained || 30000,
          targetTotal: parsed.targetTotal || 37150,
          devotionGatePassedToday: parsed.devotionGatePassedToday ?? true,
          lastDevotionTimestamp: parsed.lastDevotionTimestamp,
          quarters: parsed.quarters
        });
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON import:', e);
    }
    return false;
  };

  const exportPlanToCsv = (): string => {
    return exportCurrentPlanToCsv(cockpitData.quarters);
  };

  // Expose global methods for native Electron Windows menu
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).triggerCloudSync = triggerManualSync;
      (window as any).exportBackupJson = exportBackupJson;
    }
  }, [triggerManualSync, exportBackupJson]);

  return (
    <CockpitContext.Provider
      value={{
        quarters: cockpitData.quarters,
        theme,
        traderName: cockpitData.traderName,
        devotionGatePassedToday: cockpitData.devotionGatePassedToday,
        selectedQuarter,
        expandedMonths,
        expandedWeeks,
        searchQuery,
        filterStatus,
        chartViewMode,
        scaleMode,
        activeNavTab,
        workspaceMode,
        setWorkspaceMode,
        journalSubView,
        setJournalSubView,
        firestoreConnected,
        sqliteConnected: postgresConnected,
        postgresConnected,
        syncState,
        triggerManualSync,
        isSyncing,
        lastSyncTime,
        metrics,
        balanceReport,
        getWeekBalance,
        journalNotes,
        addJournalNote,
        updateJournalNote,
        deleteJournalNote,
        mentalStateLogs,
        addMentalStateLog,
        updateMentalStateLog,
        deleteMentalStateLog,
        performanceRating,
        isRatingLoading,
        refreshPerformanceRating,
        toggleTheme,
        setTraderName,
        toggleDevotionGate,
        setSelectedQuarter: handleSelectQuarter,
        setSearchQuery,
        setFilterStatus,
        setChartViewMode,
        setScaleMode,
        setActiveNavTab,
        navigateToTab,
        toggleMonth,
        toggleWeek,
        expandAll,
        collapseAll,
        toggleDayCompletion,
        updateDaySession,
        batchMarkWeek,
        weeklyObjectives,
        updateWeeklyObjective,
        toggleObjectiveChecklist,
        addChecklistItem,
        removeChecklistItem,
        resetWeeklyObjective,
        resetToOriginalPlan,
        exportBackupJson,
        importBackupJson,
        importPlanFromCsv,
        exportPlanToCsv,
        accounts,
        activeAccountId,
        activeAccount,
        switchAccount,
        saveAccount,
        deleteAccount,
        removeDemoAccounts,
        updateAccountPlan
      }}
    >
      {children}
    </CockpitContext.Provider>
  );
};

export const useCockpit = () => {
  const context = useContext(CockpitContext);
  if (!context) {
    throw new Error('useCockpit must be used within a CockpitProvider');
  }
  return context;
};
