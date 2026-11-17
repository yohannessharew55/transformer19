import React, { useState, useRef, useMemo } from 'react';
import { MT5Trade } from '../types/mt5';
import { parseMT5File, parseMT5CSV, parseTradeDate, formatTradeDateKey } from '../utils/mt5Parser';
import { getStoredMT5Trades, saveStoredMT5Trades } from '../services/supabaseMT5';
import { useCockpit } from '../context/CockpitContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Download,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Database,
  Calendar,
  Sparkles,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface TradeImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (importedCount: number, totalTrades: MT5Trade[]) => void;
}

export const TradeImporterModal: React.FC<TradeImporterModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const { addJournalNote } = useCockpit();

  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedTrades, setParsedTrades] = useState<MT5Trade[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [autoCreateNotes, setAutoCreateNotes] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Process file
  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setImportSuccess(false);

    try {
      const lowerName = file.name.toLowerCase();
      if (!lowerName.endsWith('.csv') && !lowerName.endsWith('.txt') && !lowerName.endsWith('.html') && !lowerName.endsWith('.htm')) {
        throw new Error('Unsupported format. Please upload an MT4/MT5 HTML statement or a standard broker CSV file (.csv, .html, .txt).');
      }

      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');

      const trades = await parseMT5File(file);

      if (!trades || trades.length === 0) {
        throw new Error('No closed trades detected in file. Ensure the file contains closed orders/deals with timestamp and profit columns.');
      }

      setParsedTrades(trades);
    } catch (err: any) {
      console.error('File parse error:', err);
      setErrorMessage(err?.message || 'Failed to parse file. Please verify file format.');
      setParsedTrades([]);
    } finally {
      setIsProcessing(false);
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  // Telemetry computation of parsed batch
  const previewStats = useMemo(() => {
    if (parsedTrades.length === 0) return null;

    let netProfit = 0;
    let wins = 0;
    let losses = 0;
    let totalVolume = 0;
    const uniqueDates = new Set<string>();

    parsedTrades.forEach(t => {
      netProfit += t.netProfit;
      totalVolume += t.volume;
      if (t.netProfit > 0) wins++;
      else if (t.netProfit < 0) losses++;

      const dateKey = formatTradeDateKey(t.closeTime || t.openTime);
      uniqueDates.add(dateKey);
    });

    const winRate = parsedTrades.length > 0 ? (wins / parsedTrades.length) * 100 : 0;

    return {
      count: parsedTrades.length,
      netProfit: Number(netProfit.toFixed(2)),
      winRate: Math.round(winRate),
      wins,
      losses,
      totalVolume: Number(totalVolume.toFixed(2)),
      activeDaysCount: uniqueDates.size
    };
  }, [parsedTrades]);

  // Filtered preview trades
  const filteredPreview = useMemo(() => {
    if (!filterQuery.trim()) return parsedTrades.slice(0, 50);
    const q = filterQuery.toLowerCase();
    return parsedTrades.filter(
      t =>
        t.ticket.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.openTime.includes(q)
    );
  }, [parsedTrades, filterQuery]);

  // Execute Import
  const handleExecuteImport = async () => {
    if (parsedTrades.length === 0) return;

    setIsProcessing(true);
    try {
      const existingTrades = getStoredMT5Trades();
      let finalTrades: MT5Trade[] = [];

      if (importMode === 'replace') {
        finalTrades = [...parsedTrades];
      } else {
        // Merge: keep existing, update or append unique tickets
        const existingMap = new Map<string, MT5Trade>();
        existingTrades.forEach(t => existingMap.set(t.ticket, t));
        parsedTrades.forEach(t => existingMap.set(t.ticket, t));
        finalTrades = Array.from(existingMap.values());
      }

      // Sort chronologically
      finalTrades.sort((a, b) => {
        const tA = parseTradeDate(a.closeTime || a.openTime)?.getTime() ?? 0;
        const tB = parseTradeDate(b.closeTime || b.openTime)?.getTime() ?? 0;
        return tA - tB;
      });

      // Commit to persistent local storage
      saveStoredMT5Trades(finalTrades);

      // Auto-create summary sticky notes for newly imported active days if toggled
      if (autoCreateNotes) {
        const daysMap = new Map<string, { trades: MT5Trade[]; netPnl: number }>();
        parsedTrades.forEach(t => {
          const key = formatTradeDateKey(t.closeTime || t.openTime);
          if (!daysMap.has(key)) {
            daysMap.set(key, { trades: [], netPnl: 0 });
          }
          const item = daysMap.get(key)!;
          item.trades.push(t);
          item.netPnl += t.netProfit;
        });

        for (const [dateStr, info] of daysMap.entries()) {
          const formattedPnl = (info.netPnl >= 0 ? '+$' : '-$') + Math.abs(info.netPnl).toFixed(2);
          const outcome = info.netPnl > 0 ? 'win' : info.netPnl < 0 ? 'loss' : 'scratch';
          const color = info.netPnl > 0 ? 'emerald' : info.netPnl < 0 ? 'rose' : 'sky';

          try {
            await addJournalNote({
              dayId: `imported_${dateStr}`,
              dayLabel: `Broker Import · ${dateStr}`,
              date: dateStr,
              sessionTag: 'Imported Broker Statement',
              title: `${info.trades.length} Executed Trades (${formattedPnl})`,
              content: `Imported statement record from ${fileName || 'Broker Export'}. Total Volume: ${info.trades.reduce((sum, t) => sum + t.volume, 0).toFixed(2)} lots across ${info.trades.map(t => t.symbol).filter((v, i, a) => a.indexOf(v) === i).join(', ')}. Realized Session P/L: ${formattedPnl}.`,
              color,
              outcome,
              pnl: Number(info.netPnl.toFixed(2))
            });
          } catch (e) {
            console.warn('Note creation warning:', e);
          }
        }
      }

      setImportSuccess(true);
      setTimeout(() => {
        onImportComplete(parsedTrades.length, finalTrades);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Import execution error:', err);
      setErrorMessage(err?.message || 'Failed to commit imported trades.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Sample Template CSV
  const handleDownloadSampleCSV = () => {
    const csvContent =
      'Ticket,Open Time,Close Time,Symbol,Type,Lots,Open Price,Close Price,Commission,Swap,Profit\n' +
      '84920194,2026-10-01 07:15:00,2026-10-01 08:30:00,XAUUSD,buy,0.02,2648.50,2654.80,-0.14,0.00,12.60\n' +
      '84920210,2026-10-02 13:45:00,2026-10-02 14:20:00,XAUUSD,sell,0.02,2658.20,2651.10,-0.14,0.00,14.20\n' +
      '84920288,2026-10-05 07:30:00,2026-10-05 07:55:00,XAUUSD,buy,0.02,2642.00,2638.00,-0.14,0.00,-8.00\n' +
      '84920340,2026-10-06 14:10:00,2026-10-06 15:30:00,XAUUSD,buy,0.03,2645.10,2655.30,-0.21,0.00,30.60\n' +
      '84920412,2026-10-07 08:00:00,2026-10-07 09:15:00,XAUUSD,sell,0.03,2662.00,2653.50,-0.21,0.00,25.50\n' +
      '84920490,2026-10-08 13:30:00,2026-10-08 14:10:00,XAUUSD,buy,0.03,2650.00,2661.20,-0.21,0.00,33.60\n' +
      '84920555,2026-10-09 07:15:00,2026-10-09 08:00:00,XAUUSD,buy,0.04,2660.00,2670.00,-0.28,0.00,40.00\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'transformer19_sample_trades.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0c101a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0082ff]/10 text-[#0082ff] flex items-center justify-center border border-[#0082ff]/20">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  One-Click CSV & Broker Statement Importer
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Universal Format
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly import MT4/MT5 statements, cTrader, TradeLocker, or custom CSV logs directly into your Cockpit & Trade Calendar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Dropzone Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer select-none relative ${
              dragActive
                ? 'border-[#0082ff] bg-[#0082ff]/10 ring-4 ring-[#0082ff]/20 scale-[1.01]'
                : parsedTrades.length > 0
                ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10'
                : 'border-slate-300 dark:border-slate-700/80 hover:border-[#0082ff]/60 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.html,.htm"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
                  parsedTrades.length > 0
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-[#0082ff]/10 text-[#0082ff]'
                }`}
              >
                {parsedTrades.length > 0 ? <CheckCircle2 size={30} /> : <UploadCloud size={30} />}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {parsedTrades.length > 0 ? (
                    <span className="text-emerald-500 flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={16} /> File Loaded: {fileName} ({fileSize})
                    </span>
                  ) : (
                    'Drag & drop your Broker Statement or click to browse'
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports MT4/MT5 Detailed Statement HTML, standard CSV exports, and cTrader / TradeLocker logs
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                >
                  {parsedTrades.length > 0 ? 'Choose Different File' : 'Browse Files'}
                </button>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleDownloadSampleCSV();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162032] text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:border-[#0082ff]/50 transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download Sample CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {importSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>Import completed successfully! Updating Cockpit & Trade Calendar heatmaps...</span>
            </div>
          )}

          {/* Parsed Telemetry & Preview Section */}
          {previewStats && (
            <div className="space-y-4 animate-fadeIn">
              {/* Batch Telemetry Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Trades Detected</span>
                  <span className="font-black text-base text-slate-900 dark:text-white">
                    {previewStats.count} orders
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Batch Realized P/L</span>
                  <span
                    className={`font-black text-base flex items-center gap-1 ${
                      previewStats.netProfit >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {previewStats.netProfit >= 0 ? '+' : ''}${previewStats.netProfit.toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Win Rate</span>
                  <span className="font-black text-base text-slate-900 dark:text-white">
                    {previewStats.winRate}% ({previewStats.wins}W / {previewStats.losses}L)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Volume</span>
                  <span className="font-black text-base text-slate-900 dark:text-white">
                    {previewStats.totalVolume} lots
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Calendar Days</span>
                  <span className="font-black text-base text-[#0082ff]">
                    {previewStats.activeDaysCount} active days
                  </span>
                </div>
              </div>

              {/* Import Configuration Options */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Import Configuration
                </h4>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Mode Selector */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Merge Strategy:</span>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setImportMode('merge')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          importMode === 'merge'
                            ? 'bg-white dark:bg-[#0082ff] text-slate-900 dark:text-white shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Append & Merge (Safe)
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          importMode === 'replace'
                            ? 'bg-rose-500 text-white shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Overwrite All
                      </button>
                    </div>
                  </div>

                  {/* Auto Note Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={autoCreateNotes}
                      onChange={e => setAutoCreateNotes(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0082ff] focus:ring-[#0082ff]"
                    />
                    <span>Auto-create Daily Sticky Notes on Calendar</span>
                  </label>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0c101a]">
                <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#121927]">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Trade Records Preview ({parsedTrades.length} total)
                  </span>
                  <input
                    type="text"
                    placeholder="Search ticket, symbol, type..."
                    value={filterQuery}
                    onChange={e => setFilterQuery(e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none w-48"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-500 uppercase sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Ticket</th>
                        <th className="px-3 py-2">Time</th>
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Lots</th>
                        <th className="px-3 py-2">Entry</th>
                        <th className="px-3 py-2">Exit</th>
                        <th className="px-3 py-2 text-right">Realized P/L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredPreview.map(t => (
                        <tr key={t.ticket} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400 font-bold">{t.ticket}</td>
                          <td className="px-3 py-1.5 text-slate-500">{t.closeTime || t.openTime}</td>
                          <td className="px-3 py-1.5 font-bold text-slate-800 dark:text-slate-200">{t.symbol}</td>
                          <td className="px-3 py-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                                t.type === 'buy'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              }`}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td className="px-3 py-1.5">{t.volume}</td>
                          <td className="px-3 py-1.5 text-slate-500">{t.openPrice}</td>
                          <td className="px-3 py-1.5 text-slate-500">{t.closePrice}</td>
                          <td
                            className={`px-3 py-1.5 text-right font-black ${
                              t.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {t.netProfit >= 0 ? '+' : ''}${t.netProfit.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0c101a]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162032] text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {parsedTrades.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setParsedTrades([]);
                  setFileName(null);
                  setFileSize(null);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                Clear File
              </button>
            )}

            <button
              type="button"
              disabled={parsedTrades.length === 0 || isProcessing}
              onClick={handleExecuteImport}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                parsedTrades.length > 0 && !isProcessing
                  ? 'bg-[#0082ff] hover:bg-[#0070df] text-white hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Importing Trades...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Import {parsedTrades.length > 0 ? `${parsedTrades.length} Trades` : 'Statements'} to Cockpit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
