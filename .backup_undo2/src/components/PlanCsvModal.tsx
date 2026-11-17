import React, { useState, useRef, useMemo } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { parsePlanCsv, PlanParseResult } from '../utils/planCsvParser';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  RefreshCw,
  Scale
} from 'lucide-react';

interface PlanCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanCsvModal: React.FC<PlanCsvModalProps> = ({ isOpen, onClose }) => {
  const {
    importPlanFromCsv,
    exportPlanToCsv,
    metrics,
    firestoreConnected
  } = useCockpit();

  const [activeTab, setActiveTab] = useState<'upload' | 'export'>('upload');
  const [csvText, setCsvText] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applySuccess, setApplySuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live parsing preview whenever csvText changes
  const parsedPreview: PlanParseResult | null = useMemo(() => {
    if (!csvText.trim()) return null;
    return parsePlanCsv(csvText);
  }, [csvText]);

  if (!isOpen) return null;

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrorMessage('Please select a valid .csv file.');
      return;
    }
    setErrorMessage(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text || '');
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Download Current Plan CSV Template
  const handleDownloadCurrentTemplate = () => {
    const csvContent = exportPlanToCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transformer19_Schedule_Plan_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Apply new plan
  const handleApplyPlan = async () => {
    if (!csvText.trim()) {
      setErrorMessage('Please upload or paste a CSV trading plan first.');
      return;
    }

    setIsApplying(true);
    setErrorMessage(null);

    try {
      const result = await importPlanFromCsv(csvText);
      if (result.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setApplySuccess(false);
          onClose();
        }, 1500);
      } else {
        setErrorMessage(result.error || 'Failed to apply plan.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error applying new schedule plan.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121927] shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <FileSpreadsheet size={16} />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
                Schedule Adaptation Engine
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Anytime Schedule Plan CSV Importer
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Modify your target schedule anytime in Excel / CSV. The system dynamically recalibrates all 48 weeks, 252 sessions, objectives, charts, and database.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-4 sm:px-6 pt-2.5 sm:pt-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud size={14} />
            <span>Upload & Adapt Plan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-3 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download size={14} />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs flex-1">
          {activeTab === 'upload' ? (
            <>
              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  dragActive
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-300 dark:border-slate-700 hover:border-cyan-500/60 bg-slate-50 dark:bg-slate-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {fileName ? (
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono">{fileName}</span>
                  ) : (
                    <span>Click to browse or drop your Plan CSV file here</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  Accepts Terminal_30K_Realistic_Plan.csv or any custom 48-week schedule
                </div>
              </div>

              {/* Or Paste CSV text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase text-slate-500 font-bold">
                    Or Paste CSV Data Directly:
                  </span>
                  {csvText && (
                    <button
                      type="button"
                      onClick={() => { setCsvText(''); setFileName(null); }}
                      className="text-[10px] font-mono text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder="Quarter,Month,Week,Lot_Size,Start_Balance,Weekly_Net_Gain,Bank_Sweep_20pct,Ending_Balance,Max_Risk_20Pips,Target_Pips,Phase_Focus&#10;Q1,M01,Week 01,0.01,50.0,25.0,0.0,75.0,2.0,40-50,Seed Capital Calibration"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Validation Warning</span>
                    <span className="text-[11px]">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Parsed Preview Card */}
              {parsedPreview && parsedPreview.success && parsedPreview.summary && (
                <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>Valid Plan Detected // Inspection Telemetry</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                      {parsedPreview.validationErrors.length === 0 ? '✓ Math Verified' : '⚠️ Has Math Warnings'}
                    </span>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                      <div className="text-[9px] uppercase text-slate-400 font-bold">Seed Tranche</div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ${parsedPreview.summary.startingCapital.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                      <div className="text-[9px] uppercase text-slate-400 font-bold">Gross Gains</div>
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        +${parsedPreview.summary.totalGrossGains.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                      <div className="text-[9px] uppercase text-slate-400 font-bold">Bank Sweeps</div>
                      <div className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
                        ${parsedPreview.summary.totalBankSweeps.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                      <div className="text-[9px] uppercase text-slate-400 font-bold">Terminal Equity</div>
                      <div className="text-sm font-extrabold text-amber-500">
                        ${parsedPreview.summary.terminalRetained.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
                    <span>Weeks: {parsedPreview.summary.totalWeeks} ({parsedPreview.summary.totalSessions} Sessions)</span>
                    <span>Lots: {parsedPreview.summary.lotSizeRange}</span>
                    <span>Total Net Worth: ${parsedPreview.summary.terminalTotal.toLocaleString()}</span>
                  </div>

                  {parsedPreview.validationErrors.length > 0 && (
                    <div className="mt-2 text-[10px] font-mono text-amber-500 space-y-1">
                      {parsedPreview.validationErrors.slice(0, 3).map((err, i) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Export / Template Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  How Schedule Adaptation Works
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  1. Click below to download your currently active 48-week trading schedule as a CSV spreadsheet.<br />
                  2. Open it in Microsoft Excel, Google Sheets, or Apple Numbers.<br />
                  3. Adjust any week's Starting Balance, Weekly Gain, Lot Size, or Month-End Bank Sweep.<br />
                  4. Save as CSV and upload it back on the <strong>"Upload & Adapt Plan"</strong> tab.<br />
                  5. The Cockpit instantly adapts all charts, 252 daily sessions, and SQLite database records to your new target blueprint!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Download size={20} />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Download Active Schedule CSV
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Export contains all 48 weeks with lot sizes, balances, and harvest formulas.
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCurrentTemplate}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2 active:scale-95"
                >
                  <Download size={14} />
                  <span>Download CSV Template</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 text-center sm:text-left">
            {firestoreConnected ? '✓ SQLite WAL Active' : 'Offline Storage Ready'}
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-center"
            >
              Cancel
            </button>

            {activeTab === 'upload' && (
              <button
                type="button"
                onClick={handleApplyPlan}
                disabled={isApplying || !parsedPreview?.success}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-xl text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                  applySuccess
                    ? 'bg-emerald-600'
                    : parsedPreview?.success
                    ? 'bg-cyan-600 hover:bg-cyan-700'
                    : 'bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed'
                }`}
              >
                {isApplying ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Adapting...</span>
                  </>
                ) : applySuccess ? (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Plan Adapted!</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span className="sm:hidden">Adapt Plan</span>
                    <span className="hidden sm:inline">Adapt Entire System to This Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
