import { MT5Trade, MT5AnalyticsKPIs, SessionWindow, SetupCategory, MistakeTag } from '../types/mt5';

/**
 * Robust date parser for all broker formats:
 * - YYYY.MM.DD HH:mm:ss / YYYY-MM-DD HH:mm:ss / ISO
 * - DD.MM.YYYY HH:mm:ss / DD/MM/YYYY HH:mm:ss (Standard European/Exness/FTMO MT5)
 * - MM/DD/YYYY HH:mm:ss (US MT5)
 */
export function parseTradeDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  if (typeof dateStr === 'number') {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(dateStr).trim();
  if (!str) return null;

  // Try direct standard parse first
  const direct = new Date(str);
  if (!isNaN(direct.getTime()) && str.includes('-') && !str.includes('.')) {
    return direct;
  }

  // Pattern 1: YYYY.MM.DD or YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (isoMatch) {
    const [_, y, m, day, h, min, s] = isoMatch;
    const d = new Date(
      parseInt(y, 10),
      parseInt(m, 10) - 1,
      parseInt(day, 10),
      parseInt(h || '0', 10),
      parseInt(min || '0', 10),
      parseInt(s || '0', 10)
    );
    if (!isNaN(d.getTime())) return d;
  }

  // Pattern 2: DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
  const euMatch = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (euMatch) {
    const [_, p1, p2, y, h, min, s] = euMatch;
    const num1 = parseInt(p1, 10);
    const num2 = parseInt(p2, 10);

    // If first number > 12, it must be DD.MM.YYYY
    let day = num1;
    let month = num2;
    if (num1 <= 12 && num2 > 12) {
      // US format MM/DD/YYYY
      month = num1;
      day = num2;
    }

    const d = new Date(
      parseInt(y, 10),
      month - 1,
      day,
      parseInt(h || '0', 10),
      parseInt(min || '0', 10),
      parseInt(s || '0', 10)
    );
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback
  const fallback = new Date(str.replace(/\./g, '-'));
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Format a Date object into YYYY-MM-DD key for calendar and daily session lookups
 */
export function formatTradeDateKey(dateOrStr: Date | string): string {
  const d = parseTradeDate(dateOrStr);
  if (!d) return '1970-01-01';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Safe number parser for financial strings:
 * Handles currency symbols ($ € £), accounting negatives (15.50), unicode minus (−),
 * thousands separators, and European comma decimals.
 */
export function parseMT5Number(raw: any): number {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === 'number') return isNaN(raw) ? 0 : raw;
  let str = String(raw).trim();
  if (!str) return 0;

  // Accounting parentheses: (15.50) -> -15.50
  if (str.startsWith('(') && str.endsWith(')')) {
    str = '-' + str.slice(1, -1);
  }

  // Unicode minus signs
  str = str.replace(/[\u2212\u2013\u2014]/g, '-');

  // Strip currency symbols and whitespace
  str = str.replace(/[$€£¥\s]/g, '');

  // Handle European comma decimals vs thousand separators
  if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  } else if (str.includes(',') && str.includes('.')) {
    str = str.replace(/,/g, '');
  }

  // Clean any stray characters except digits, minus, and dot
  str = str.replace(/[^\d.-]/g, '');
  const val = parseFloat(str);
  return isNaN(val) ? 0 : val;
}

/**
 * Determine session window from openTime string (UTC hours)
 */
export function determineSessionWindow(timeStr: string): SessionWindow {
  const date = parseTradeDate(timeStr);
  if (!date) return 'London';
  const hours = date.getUTCHours();
  if (hours >= 7 && hours < 12) return 'London';
  if (hours >= 12 && hours < 20) return 'New York';
  if (hours >= 0 && hours < 7) return 'Asian';
  return 'Overlap / Other';
}

/**
 * Calculate duration in minutes between open and close times
 */
export function calculateDurationMinutes(openTimeStr: string, closeTimeStr: string): number {
  const open = parseTradeDate(openTimeStr);
  const close = parseTradeDate(closeTimeStr);
  if (!open || !close || close.getTime() <= open.getTime()) return 15;
  return Math.round((close.getTime() - open.getTime()) / 60000);
}

/**
 * Auto-detect and flag Order Stacking violations across all trades
 */
export function detectOrderStacking(trades: MT5Trade[]): { trades: MT5Trade[]; stackingCount: number } {
  if (!trades || trades.length === 0) {
    return { trades: [], stackingCount: 0 };
  }

  // Sort trades chronologically by openTime
  const sorted = [...trades].sort((a, b) => {
    const tA = parseTradeDate(a.openTime)?.getTime() ?? 0;
    const tB = parseTradeDate(b.openTime)?.getTime() ?? 0;
    return tA - tB;
  });

  let stackingCount = 0;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const curOpenDate = parseTradeDate(current.openTime);
    const curCloseDate = parseTradeDate(current.closeTime);

    if (!curOpenDate || !curCloseDate) {
      current.isOrderStacked = false;
      continue;
    }

    const curOpen = curOpenDate.getTime();
    const curClose = curCloseDate.getTime();

    let hasOverlap = false;

    for (let j = 0; j < sorted.length; j++) {
      if (i === j) continue;
      const other = sorted[j];
      const otherOpenDate = parseTradeDate(other.openTime);
      const otherCloseDate = parseTradeDate(other.closeTime);
      if (!otherOpenDate || !otherCloseDate) continue;

      const otherOpen = otherOpenDate.getTime();
      const otherClose = otherCloseDate.getTime();

      // Check if intervals overlap
      if (curOpen < otherClose && otherOpen < curClose) {
        hasOverlap = true;
        break;
      }
    }

    if (hasOverlap) {
      current.isOrderStacked = true;
      if (!current.mistakeTag || current.mistakeTag === 'None (Clean)') {
        current.mistakeTag = 'Order Stacking';
      }
      stackingCount++;
    } else {
      current.isOrderStacked = false;
    }
  }

  return { trades: sorted, stackingCount };
}

/**
 * Calculate comprehensive TradeZella-Grade KPIs from trades list
 */
export function calculateMT5KPIs(trades: MT5Trade[]): MT5AnalyticsKPIs {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      winRate: 0,
      grossProfits: 0,
      grossLosses: 0,
      profitFactor: 0,
      netProfit: 0,
      tradeExpectancy: 0,
      avgWin: 0,
      avgLoss: 0,
      riskRewardRatio: 0,
      maxConsecutiveLosses: 0,
      rule05Breached: false,
      largestWin: 0,
      largestLoss: 0,
      orderStackingCount: 0,
      totalVolume: 0,
      totalCommissions: 0,
      totalSwap: 0
    };
  }

  let grossProfits = 0;
  let grossLosses = 0;
  let winningCount = 0;
  let losingCount = 0;
  let breakEvenCount = 0;
  let largestWin = 0;
  let largestLoss = 0;
  let totalVolume = 0;
  let totalCommissions = 0;
  let totalSwap = 0;
  let orderStackingCount = 0;

  let currentLossStreak = 0;
  let maxConsecutiveLosses = 0;

  // Sort trades by closeTime for accurate streak calculation
  const sorted = [...trades].sort((a, b) => {
    const tA = parseTradeDate(a.closeTime)?.getTime() ?? 0;
    const tB = parseTradeDate(b.closeTime)?.getTime() ?? 0;
    return tA - tB;
  });

  sorted.forEach(trade => {
    const pnl = typeof trade.netProfit === 'number' && !isNaN(trade.netProfit) ? trade.netProfit : 0;
    const vol = typeof trade.volume === 'number' && !isNaN(trade.volume) ? trade.volume : 0;
    const comm = typeof trade.commission === 'number' && !isNaN(trade.commission) ? trade.commission : 0;
    const swp = typeof trade.swap === 'number' && !isNaN(trade.swap) ? trade.swap : 0;

    totalVolume += vol;
    totalCommissions += comm;
    totalSwap += swp;
    if (trade.isOrderStacked) orderStackingCount++;

    if (pnl > 0.001) {
      grossProfits += pnl;
      winningCount++;
      if (pnl > largestWin) largestWin = pnl;
      currentLossStreak = 0;
    } else if (pnl < -0.001) {
      grossLosses += Math.abs(pnl);
      losingCount++;
      if (pnl < largestLoss) largestLoss = pnl;
      currentLossStreak++;
      if (currentLossStreak > maxConsecutiveLosses) {
        maxConsecutiveLosses = currentLossStreak;
      }
    } else {
      breakEvenCount++;
      currentLossStreak = 0;
    }
  });

  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (winningCount / totalTrades) * 100 : 0;
  const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? 99.99 : 0;
  const netProfit = grossProfits - grossLosses;
  const avgWin = winningCount > 0 ? grossProfits / winningCount : 0;
  const avgLoss = losingCount > 0 ? grossLosses / losingCount : 0;
  const tradeExpectancy = totalTrades > 0 ? netProfit / totalTrades : 0;
  const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 99.9 : 0;

  return {
    totalTrades,
    winningTrades: winningCount,
    losingTrades: losingCount,
    breakEvenTrades: breakEvenCount,
    winRate: Number(winRate.toFixed(1)),
    grossProfits: Number(grossProfits.toFixed(2)),
    grossLosses: Number(grossLosses.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    tradeExpectancy: Number(tradeExpectancy.toFixed(2)),
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    riskRewardRatio: Number(riskRewardRatio.toFixed(2)),
    maxConsecutiveLosses,
    rule05Breached: maxConsecutiveLosses >= 2,
    largestWin: Number(largestWin.toFixed(2)),
    largestLoss: Number(largestLoss.toFixed(2)),
    orderStackingCount,
    totalVolume: Number(totalVolume.toFixed(2)),
    totalCommissions: Number(totalCommissions.toFixed(2)),
    totalSwap: Number(totalSwap.toFixed(2))
  };
}

/**
 * Robust MetaTrader 5 HTML Statement & CSV Parser
 */
export async function parseMT5File(file: File): Promise<MT5Trade[]> {
  const content = await file.text();
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.csv') || lowerName.endsWith('.txt')) {
    return parseMT5CSV(content);
  }

  return parseMT5HTML(content);
}

/**
 * Parse MT5 HTML Statement (supports Positions, Deals, and Detailed Statement tables)
 */
export function parseMT5HTML(htmlContent: string): MT5Trade[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const trades: MT5Trade[] = [];

  const tables = Array.from(doc.querySelectorAll('table'));

  tables.forEach(table => {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) return;

    let headerMap: { [key: string]: number } = {};
    let isHeaderFound = false;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const cellsText = Array.from(row.querySelectorAll('th, td')).map(c => (c.textContent || '').trim().toLowerCase());

      const hasTime = cellsText.some(t => t.includes('time'));
      const hasProfit = cellsText.some(t => t.includes('profit'));
      const hasType = cellsText.some(t => t.includes('type') || t.includes('direction') || t.includes('order'));

      if (hasTime && (hasProfit || hasType) && !isHeaderFound) {
        cellsText.forEach((text, colIdx) => {
          if (text.includes('open time') || (text === 'time' && headerMap['openTime'] === undefined)) {
            headerMap['openTime'] = colIdx;
          } else if (text.includes('close time') || (text === 'time' && headerMap['openTime'] !== undefined)) {
            headerMap['closeTime'] = colIdx;
          }

          if (text.includes('ticket') || text.includes('position') || text.includes('deal') || text.includes('order')) {
            if (headerMap['ticket'] === undefined) headerMap['ticket'] = colIdx;
          }
          if (text.includes('symbol') || text.includes('item')) {
            headerMap['symbol'] = colIdx;
          }
          if (text.includes('type') || text.includes('direction')) {
            if (headerMap['type'] === undefined) headerMap['type'] = colIdx;
          }
          if (text.includes('volume') || text.includes('lots') || text.includes('size')) {
            headerMap['volume'] = colIdx;
          }
          if (text.includes('open price') || (text === 'price' && headerMap['openPrice'] === undefined)) {
            headerMap['openPrice'] = colIdx;
          } else if (text.includes('close price') || (text === 'price' && headerMap['openPrice'] !== undefined)) {
            headerMap['closePrice'] = colIdx;
          }
          if (text.includes('commission') || text.includes('fee')) {
            headerMap['commission'] = colIdx;
          }
          if (text.includes('swap')) {
            headerMap['swap'] = colIdx;
          }
          if (text.includes('profit')) {
            headerMap['profit'] = colIdx;
          }
        });

        isHeaderFound = true;
        continue;
      }

      if (isHeaderFound) {
        const tdCells = Array.from(row.querySelectorAll('td'));
        if (tdCells.length < 4) continue;
        const cells = tdCells.map(c => (c.textContent || '').trim());

        const rowText = cells.join(' ').toLowerCase();
        // Skip non-trade summary or header rows
        if (
          rowText.includes('balance') ||
          rowText.includes('deposit') ||
          rowText.includes('withdrawal') ||
          rowText.includes('total') ||
          rowText.includes('summary') ||
          rowText.includes('closed p/l') ||
          rowText.includes('credit')
        ) {
          continue;
        }

        const typeRaw = (cells[headerMap['type'] ?? 2] || '').toLowerCase();
        if (!typeRaw.includes('buy') && !typeRaw.includes('sell')) continue;

        // If it's a deals table with direction 'in' and profit is 0, skip the opening leg
        const isDealsIn = rowText.includes(' in ') && !rowText.includes(' out ');
        const profitCol = headerMap['profit'] ?? (cells.length - 1);
        const netProfit = parseMT5Number(cells[profitCol]);

        if (isDealsIn && Math.abs(netProfit) < 0.001) {
          continue;
        }

        const ticketRaw = cells[headerMap['ticket'] ?? 1] || `T-${r}`;
        const ticket = ticketRaw.replace(/[^0-9a-zA-Z_-]/g, '') || `T-${Date.now()}-${r}`;
        const type: 'buy' | 'sell' = typeRaw.includes('buy') ? 'buy' : 'sell';
        const volume = parseMT5Number(cells[headerMap['volume'] ?? 3]) || 0.05;
        const symbol = cells[headerMap['symbol'] ?? 2] || 'XAUUSDm';

        const openTime = cells[headerMap['openTime'] ?? 0] || new Date().toISOString();
        const closeTime = cells[headerMap['closeTime'] ?? headerMap['openTime'] ?? 0] || openTime;
        const openPrice = parseMT5Number(cells[headerMap['openPrice'] ?? 5]);
        const closePrice = parseMT5Number(cells[headerMap['closePrice'] ?? headerMap['openPrice'] ?? 5]) || openPrice;

        const commission = parseMT5Number(cells[headerMap['commission'] ?? -1]);
        const swap = parseMT5Number(cells[headerMap['swap'] ?? -1]);

        trades.push({
          ticket,
          openTime,
          closeTime,
          symbol,
          type,
          volume: volume > 0 ? volume : 0.05,
          openPrice: openPrice > 0 ? openPrice : 2650.0,
          closePrice: closePrice > 0 ? closePrice : openPrice || 2650.0,
          commission,
          swap,
          netProfit,
          setupCategory: 'DALE 4H Expansion',
          mistakeTag: 'None (Clean)',
          sessionWindow: determineSessionWindow(openTime),
          durationMinutes: calculateDurationMinutes(openTime, closeTime),
          source: 'upload'
        });
      }
    }
  });

  return detectOrderStacking(trades).trades;
}

/**
 * Parse MT5 CSV Statement
 */
export function parseMT5CSV(csvContent: string): MT5Trade[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

  const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
  const headerMap: { [key: string]: number } = {};

  headers.forEach((h, idx) => {
    if (h.includes('ticket') || h.includes('position') || h.includes('deal') || h.includes('order')) {
      if (headerMap['ticket'] === undefined) headerMap['ticket'] = idx;
    }
    if (h.includes('open time') || (h.includes('time') && headerMap['openTime'] === undefined)) {
      headerMap['openTime'] = idx;
    }
    if (h.includes('close time') || (h.includes('time') && headerMap['openTime'] !== undefined)) {
      headerMap['closeTime'] = idx;
    }
    if (h.includes('symbol') || h.includes('item')) headerMap['symbol'] = idx;
    if (h.includes('type') || h.includes('action') || h.includes('direction')) {
      if (headerMap['type'] === undefined) headerMap['type'] = idx;
    }
    if (h.includes('volume') || h.includes('size') || h.includes('lots')) headerMap['volume'] = idx;
    if (h.includes('open price') || (h.includes('price') && headerMap['openPrice'] === undefined)) {
      headerMap['openPrice'] = idx;
    }
    if (h.includes('close price') || (h.includes('price') && headerMap['openPrice'] !== undefined)) {
      headerMap['closePrice'] = idx;
    }
    if (h.includes('commission') || h.includes('fee')) headerMap['commission'] = idx;
    if (h.includes('swap')) headerMap['swap'] = idx;
    if (h.includes('profit')) headerMap['profit'] = idx;
  });

  const trades: MT5Trade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cells.length < 4) continue;

    const rowText = cells.join(' ').toLowerCase();
    if (
      rowText.includes('balance') ||
      rowText.includes('deposit') ||
      rowText.includes('withdrawal') ||
      rowText.includes('total') ||
      rowText.includes('credit')
    ) {
      continue;
    }

    const typeStr = (cells[headerMap['type'] ?? 2] || '').toLowerCase();
    if (!typeStr.includes('buy') && !typeStr.includes('sell')) continue;

    const ticketRaw = cells[headerMap['ticket'] ?? 0] || `T-${i}`;
    const ticket = ticketRaw.replace(/[^0-9a-zA-Z_-]/g, '') || `T-${Date.now()}-${i}`;
    const type: 'buy' | 'sell' = typeStr.includes('buy') ? 'buy' : 'sell';
    const symbol = cells[headerMap['symbol'] ?? 3] || 'XAUUSDm';
    const volume = parseMT5Number(cells[headerMap['volume'] ?? 4]) || 0.05;

    const openTime = cells[headerMap['openTime'] ?? 1] || new Date().toISOString();
    const closeTime = cells[headerMap['closeTime'] ?? headerMap['openTime'] ?? 1] || openTime;

    const openPrice = parseMT5Number(cells[headerMap['openPrice'] ?? 5]);
    const closePrice = parseMT5Number(cells[headerMap['closePrice'] ?? headerMap['openPrice'] ?? 5]) || openPrice;

    const commission = parseMT5Number(cells[headerMap['commission'] ?? -1]);
    const swap = parseMT5Number(cells[headerMap['swap'] ?? -1]);
    const netProfit = parseMT5Number(cells[headerMap['profit'] ?? cells.length - 1]);

    trades.push({
      ticket,
      openTime,
      closeTime,
      symbol,
      type,
      volume: volume > 0 ? volume : 0.05,
      openPrice: openPrice > 0 ? openPrice : 2650.0,
      closePrice: closePrice > 0 ? closePrice : openPrice || 2650.0,
      commission,
      swap,
      netProfit,
      setupCategory: 'DALE 4H Expansion',
      mistakeTag: 'None (Clean)',
      sessionWindow: determineSessionWindow(openTime),
      durationMinutes: calculateDurationMinutes(openTime, closeTime),
      source: 'upload'
    });
  }

  return detectOrderStacking(trades).trades;
}

/**
 * Generate sample MT5 gold trading history
 */
export function generateSampleMT5Trades(): MT5Trade[] {
  const sampleData: Array<{
    ticket: string;
    openTime: string;
    closeTime: string;
    symbol: string;
    type: 'buy' | 'sell';
    volume: number;
    openPrice: number;
    closePrice: number;
    commission: number;
    swap: number;
    netProfit: number;
    setupCategory: SetupCategory;
    mistakeTag: MistakeTag;
    notes: string;
    sessionWindow: SessionWindow;
  }> = [
    {
      ticket: '91840211',
      openTime: '2026-10-02 07:14:22',
      closeTime: '2026-10-02 08:31:05',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.08,
      openPrice: 2654.40,
      closePrice: 2661.90,
      commission: -0.48,
      swap: 0.0,
      netProfit: 59.52,
      setupCategory: 'DALE 4H Expansion',
      mistakeTag: 'None (Clean)',
      notes: 'Clean London Open expansion off the 4H support shelf. Trailed stop loss to +15 pips before TP hit.',
      sessionWindow: 'London'
    },
    {
      ticket: '91839954',
      openTime: '2026-10-01 13:30:15',
      closeTime: '2026-10-01 14:45:00',
      symbol: 'XAUUSDm',
      type: 'sell',
      volume: 0.06,
      openPrice: 2665.20,
      closePrice: 2658.00,
      commission: -0.36,
      swap: 0.0,
      netProfit: 42.84,
      setupCategory: 'NY Session Sweep',
      mistakeTag: 'None (Clean)',
      notes: 'US Jobless Claims liquidity sweep of Asian highs. Quick rejection candle confirmation on M5.',
      sessionWindow: 'New York'
    },
    {
      ticket: '91837820',
      openTime: '2026-10-01 07:45:10',
      closeTime: '2026-10-01 08:05:12',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.05,
      openPrice: 2652.10,
      closePrice: 2656.80,
      commission: -0.30,
      swap: 0.0,
      netProfit: 23.20,
      setupCategory: 'DALE Retest',
      mistakeTag: 'None (Clean)',
      notes: 'London displacement retest. Respecting daily quota of 1-2 executions.',
      sessionWindow: 'London'
    },
    {
      ticket: '91832104',
      openTime: '2026-09-30 14:15:00',
      closeTime: '2026-09-30 15:20:45',
      symbol: 'XAUUSDm',
      type: 'sell',
      volume: 0.05,
      openPrice: 2648.50,
      closePrice: 2642.10,
      commission: -0.30,
      swap: 0.0,
      netProfit: 31.70,
      setupCategory: 'DALE 4H Expansion',
      mistakeTag: 'None (Clean)',
      notes: 'NY Continuation following 4H bearish engulfing pin bar.',
      sessionWindow: 'New York'
    },
    {
      ticket: '91829003',
      openTime: '2026-09-29 07:22:15',
      closeTime: '2026-09-29 07:44:30',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.04,
      openPrice: 2640.20,
      closePrice: 2636.50,
      commission: -0.24,
      swap: 0.0,
      netProfit: -15.04,
      setupCategory: 'Chop Scalp',
      mistakeTag: 'Moved Stop Loss',
      notes: 'Entered in the middle of a consolidating range without clear 4H bias. Stopped out cleanly.',
      sessionWindow: 'London'
    },
    {
      ticket: '91828550',
      openTime: '2026-09-29 13:45:00',
      closeTime: '2026-09-29 14:30:20',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.05,
      openPrice: 2638.00,
      closePrice: 2647.50,
      commission: -0.30,
      swap: 0.0,
      netProfit: 47.20,
      setupCategory: 'DALE 4H Expansion',
      mistakeTag: 'None (Clean)',
      notes: 'V-shaped recovery after NY Open sweep. Perfect disciplined execution.',
      sessionWindow: 'New York'
    },
    {
      ticket: '91824119',
      openTime: '2026-09-28 08:00:15',
      closeTime: '2026-09-28 08:52:10',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.04,
      openPrice: 2632.10,
      closePrice: 2639.40,
      commission: -0.24,
      swap: 0.0,
      netProfit: 28.96,
      setupCategory: 'London Breakout',
      mistakeTag: 'None (Clean)',
      notes: 'Monday opening range breakout towards previous week high.',
      sessionWindow: 'London'
    },
    {
      ticket: '91819922',
      openTime: '2026-09-25 14:02:18',
      closeTime: '2026-09-25 15:11:40',
      symbol: 'XAUUSDm',
      type: 'sell',
      volume: 0.05,
      openPrice: 2645.00,
      closePrice: 2637.20,
      commission: -0.30,
      swap: 0.0,
      netProfit: 38.70,
      setupCategory: 'DALE 4H Expansion',
      mistakeTag: 'None (Clean)',
      notes: 'Friday profit taking run downwards. Banked physical profit.',
      sessionWindow: 'New York'
    },
    {
      ticket: '91815401',
      openTime: '2026-09-24 07:10:00',
      closeTime: '2026-09-24 07:28:15',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.05,
      openPrice: 2635.80,
      closePrice: 2633.20,
      commission: -0.30,
      swap: 0.0,
      netProfit: -13.30,
      setupCategory: 'Impulsive Entry',
      mistakeTag: 'Chased Entry',
      notes: 'Jumped in before M15 candle closed. Paid market fee for impatience.',
      sessionWindow: 'London'
    },
    {
      ticket: '91814880',
      openTime: '2026-09-24 13:15:30',
      closeTime: '2026-09-24 14:10:15',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.05,
      openPrice: 2634.50,
      closePrice: 2642.00,
      commission: -0.30,
      swap: 0.0,
      netProfit: 37.20,
      setupCategory: 'DALE Retest',
      mistakeTag: 'None (Clean)',
      notes: 'Reset mindset after morning loss. Took valid NY Retest setup for solid gain.',
      sessionWindow: 'New York'
    },
    {
      ticket: '91810050',
      openTime: '2026-09-23 07:30:10',
      closeTime: '2026-09-23 08:45:00',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.06,
      openPrice: 2628.00,
      closePrice: 2638.50,
      commission: -0.36,
      swap: 0.0,
      netProfit: 62.64,
      setupCategory: 'DALE 4H Expansion',
      mistakeTag: 'None (Clean)',
      notes: '4H trend alignment. Massive expansion candle off London open.',
      sessionWindow: 'London'
    },
    {
      ticket: '91807210',
      openTime: '2026-09-22 14:20:00',
      closeTime: '2026-09-22 15:05:10',
      symbol: 'XAUUSDm',
      type: 'sell',
      volume: 0.04,
      openPrice: 2630.50,
      closePrice: 2625.00,
      commission: -0.24,
      swap: 0.0,
      netProfit: 21.76,
      setupCategory: 'NY Session Sweep',
      mistakeTag: 'None (Clean)',
      notes: 'Clean M15 rejection wick. Target hit without drawdown.',
      sessionWindow: 'New York'
    },
    {
      ticket: '91803120',
      openTime: '2026-09-21 07:18:22',
      closeTime: '2026-09-21 07:55:00',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.04,
      openPrice: 2622.00,
      closePrice: 2627.50,
      commission: -0.24,
      swap: 0.0,
      netProfit: 21.76,
      setupCategory: 'DALE Retest',
      mistakeTag: 'None (Clean)',
      notes: 'London retest of weekly pivot level.',
      sessionWindow: 'London'
    },
    {
      ticket: '91799015',
      openTime: '2026-09-18 13:45:00',
      closeTime: '2026-09-18 14:35:10',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.04,
      openPrice: 2618.50,
      closePrice: 2626.00,
      commission: -0.24,
      swap: 0.0,
      netProfit: 29.76,
      setupCategory: 'DALE 4H Expansion',
      mistakeTag: 'None (Clean)',
      notes: 'End of week expansion. Clean adherence to lot ladder.',
      sessionWindow: 'New York'
    },
    {
      ticket: '91794200',
      openTime: '2026-09-17 07:15:00',
      closeTime: '2026-09-17 07:38:20',
      symbol: 'XAUUSDm',
      type: 'sell',
      volume: 0.04,
      openPrice: 2620.00,
      closePrice: 2623.80,
      commission: -0.24,
      swap: 0.0,
      netProfit: -15.44,
      setupCategory: 'Chop Scalp',
      mistakeTag: 'None (Clean)',
      notes: 'Breakout failed to continue and reversed into stop loss. Loss strictly within 2% rule.',
      sessionWindow: 'London'
    },
    {
      ticket: '91790110',
      openTime: '2026-09-16 14:00:10',
      closeTime: '2026-09-16 15:10:00',
      symbol: 'XAUUSDm',
      type: 'buy',
      volume: 0.04,
      openPrice: 2612.00,
      closePrice: 2621.50,
      commission: -0.24,
      swap: 0.0,
      netProfit: 37.76,
      setupCategory: 'DALE 4H Expansion',
      mistakeTag: 'None (Clean)',
      notes: 'FOMC pre-positioning retest of key institutional level.',
      sessionWindow: 'New York'
    }
  ];

  return sampleData.map(item => ({
    ...item,
    durationMinutes: calculateDurationMinutes(item.openTime, item.closeTime),
    isOrderStacked: false,
    source: 'sample'
  }));
}
