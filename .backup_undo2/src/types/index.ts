export type DayStatus = 'pending' | 'completed' | 'skipped';

export interface DailySession {
  day: string;
  proto: string;
  pnl: string;
  end: string;
  isLoss: boolean;
  isExtractRow?: boolean;
  actualPnl?: number;
  status?: DayStatus;
  notes?: string;
  completedAt?: string;
  date?: string;
}

export interface TradingWeek {
  id: string;
  num: string;
  lot: string;
  net: string;
  bal: string;
  isExtract: boolean;
  drill: string;
  days: DailySession[];
  userNotes?: string;
}

export interface TradingMonth {
  id: string;
  monthNum: string;
  name: string;
  opening: string;
  bankOut: string;
  endTarget: string;
  weeks: TradingWeek[];
}

export interface TradingQuarter {
  id: string;
  name: string;
  subtitle: string;
  months: TradingMonth[];
}

export interface DisciplineRule {
  id: string;
  tag: string;
  title: string;
  description: string;
  type: 'devotion' | 'session' | 'reset' | 'terminal' | 'demotion' | 'lotsize';
}

export interface AuditItem {
  id: string;
  category: 'strengths' | 'weaknesses' | 'mechanics';
  title: string;
  points: { bold: string; text: string }[];
}

export interface CockpitData {
  traderName: string;
  seedCapital: number;
  targetBanked: number;
  targetRetained: number;
  targetTotal: number;
  devotionGatePassedToday: boolean;
  lastDevotionTimestamp?: string;
  quarters: TradingQuarter[];
}

export interface TradeVarianceItem {
  weekId: string;
  weekNum: string;
  dayIndex: number;
  dayName: string;
  protocol: string;
  plannedPnlNum: number;
  actualPnlNum: number;
  delta: number;
  deltaPercent: number;
  status: DayStatus;
  notes?: string;
  updatedAt?: string;
}

export type JournalColor = 'yellow' | 'amber' | 'rose' | 'emerald' | 'sky' | 'purple';
export type JournalOutcome = 'win' | 'loss' | 'scratch' | 'observation' | 'devotion';

export type MentalStateKey = 'flow' | 'calm' | 'confident' | 'guarded' | 'hesitant' | 'fomo' | 'tilted' | 'fatigued';

export interface MentalStateLog {
  id: string;
  dayId: string;
  dayLabel: string;
  sessionTag: string;
  date: string;
  stateKey: MentalStateKey;
  emoji: string;
  label: string;
  rating: number; // 1 to 5
  tags: string[];
  notes?: string;
  loggedAt: string;
}

export interface DailyJournalNote {
  id: string;
  dayId: string;
  dayLabel?: string;
  date?: string;
  sessionTag?: string;
  title?: string;
  content: string;
  color?: JournalColor;
  outcome?: JournalOutcome;
  pnl?: number;
  rotation?: number;
  mentalState?: MentalStateKey;
  mentalRating?: number; // 1 to 5
  mentalEmoji?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PerformanceMetricItem {
  key: 'ruleRespecting' | 'riskManagement' | 'discipline' | 'profitMaximizing' | 'patience' | 'tradeManagement';
  name: string;
  score: number; // 0 to 10
  maxScore: number; // 10
  assessment: string;
  evidence: string;
  actionableAdvice: string;
}

export interface PerformanceRatingData {
  totalPercentage: number; // 0 to 100
  summaryDiagnosis: string;
  metrics: PerformanceMetricItem[];
  assessedAt: string;
  isAiGenerated?: boolean;
}

export type ObjectiveStatus = 'upcoming' | 'in_progress' | 'achieved' | 'partially_met' | 'missed';

export interface WeeklyChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WeeklyObjective {
  weekId: string;
  weekNum: string;
  quarterId: string;
  quarterName: string;
  monthNum: string;
  plannedTargetPnl: number;
  customTargetPnl?: number;
  lotSize: string;
  drillFocus: string;
  primaryObjective: string;
  tacticalNotes: string;
  status: ObjectiveStatus;
  checklist: WeeklyChecklistItem[];
  debriefNotes?: string;
  achievedAt?: string;
  updatedAt?: string;
}

// 1. Multi-Account Portfolio Types
export type AccountCategory = 'personal_compounding' | 'prop_evaluation' | 'prop_funded' | 'algorithmic';

export interface PortfolioAccount {
  id: string;
  name: string;
  broker: string;
  accountNumber: string;
  category: AccountCategory;
  currency: string;
  startingBalance: number;
  currentEquity: number;
  highWaterMark: number;
  dailyLossLimit: number;
  maxTrailingDrawdownLimit: number;
  profitTarget?: number;
  isActive: boolean;
  status: 'active' | 'passed' | 'breached' | 'cooling_down';
  notes?: string;
  createdAt: string;
  csvSource?: string;
  planQuarters?: TradingQuarter[];
  planObjectives?: WeeklyObjective[];
  planBanked?: number;
  planRetained?: number;
  planTotal?: number;

  // Custom Editable Hero Dossier Callouts
  heroSubtitle?: string;
  heroWeeksLabel?: string;
  heroWeeksSub?: string;
  heroDaysLabel?: string;
  heroDaysSub?: string;
  heroWinRateLabel?: string;
  heroWinRateSub?: string;
  heroSweepsLabel?: string;
  heroSweepsSub?: string;
}

// 2. Broker Webhook Ingestion Types
export interface BrokerWebhookEvent {
  id: string;
  receivedAt: string;
  ticket: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  closePrice: number;
  netProfit: number;
  commission?: number;
  swap?: number;
  source: 'tradingview' | 'mt5' | 'mt4' | 'ctrader' | 'simulator';
  status: 'processed' | 'matched_session' | 'rejected';
  matchedWeekId?: string;
  matchedDayIndex?: number;
  latencyMs: number;
}

// 3. Hard Risk Circuit Breaker Types
export interface RiskGuardState {
  dailyLossLimit: number;
  consecutiveLossLimit: number;
  currentConsecutiveLosses: number;
  todayRealizedPnl: number;
  isCircuitBreakerTripped: boolean;
  trippedAt?: string;
  lockoutExpiresAt?: string;
  tripReason?: string;
  accountHighWaterMark: number;
  currentDrawdown: number;
  maxDrawdownLimit: number;
  currentLotCeiling: number;
  breachIncidentsCount: number;
}

// 4. Institutional Quant Analytics Types
export interface InstitutionalQuantMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  profitFactor: number;
  tradeExpectancy: number;
  rMultipleExpectancy: number;
  winRate: number;
  winLossRatio: number;
  maxDrawdownPercent: number;
  avgAdverseExcursionPips: number;
  avgFavorableExcursionPips: number;
  monteCarloProbabilityOfTarget: number;
  monteCarloProbabilityOfRuin: number;
}


