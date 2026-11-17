export type SetupCategory =
  | 'DALE 4H Expansion'
  | 'DALE Retest'
  | 'Chop Scalp'
  | 'Impulsive Entry'
  | 'London Breakout'
  | 'NY Session Sweep'
  | 'Asian Range Fade'
  | 'Other';

export type MistakeTag =
  | 'None (Clean)'
  | 'Order Stacking'
  | 'Moved Stop Loss'
  | 'Traded During News'
  | 'Low-Liquidity Asian Entry'
  | 'Revenge Trade'
  | 'Exceeded Max Lot'
  | 'Chased Entry'
  | 'Early Exit Panic';

export type SessionWindow = 'London' | 'New York' | 'Asian' | 'Overlap / Other';

export interface MT5Trade {
  ticket: string; // Ticket ID (e.g. "84920194")
  openTime: string; // ISO string '2026-10-01 07:15:00'
  closeTime: string; // ISO string '2026-10-01 08:45:00'
  symbol: string; // e.g. 'XAUUSDm', 'XAUUSD', 'EURUSD'
  type: 'buy' | 'sell';
  volume: number; // Lots (e.g. 0.05)
  openPrice: number;
  closePrice: number;
  commission: number;
  swap: number;
  netProfit: number; // Realized net profit/loss ($)
  
  // TradeZella-Grade Forensic Enrichment
  setupCategory?: SetupCategory;
  mistakeTag?: MistakeTag;
  notes?: string;
  sessionWindow?: SessionWindow;
  isOrderStacked?: boolean; // True if opened while another position was concurrently active
  durationMinutes?: number;
  source?: 'upload' | 'supabase' | 'sample';
}

export interface MT5AnalyticsKPIs {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number; // Percentage (e.g. 68.5)
  grossProfits: number;
  grossLosses: number;
  profitFactor: number;
  netProfit: number;
  tradeExpectancy: number; // Expectancy in $ per trade
  avgWin: number;
  avgLoss: number;
  riskRewardRatio: number; // Realized avgWin / avgLoss
  maxConsecutiveLosses: number;
  rule05Breached: boolean; // True if maxConsecutiveLosses >= 2 (breaches the 2-loss wall)
  largestWin: number;
  largestLoss: number;
  orderStackingCount: number; // Count of trades executed concurrently
  totalVolume: number;
  totalCommissions: number;
  totalSwap: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  autoSync: boolean;
}
