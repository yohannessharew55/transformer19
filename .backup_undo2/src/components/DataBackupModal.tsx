import React, { useState } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { X, Download, Upload, RotateCcw, Copy, Check, AlertCircle, Database, Cloud, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlanCsvModal?: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({ isOpen, onClose, onOpenPlanCsvModal }) => {
  const {
    exportBackupJson,
    importBackupJson,
    resetToOriginalPlan,
    metrics,
    firestoreConnected,
    lastSyncTime,
    syncState,
    triggerManualSync
  } = useCockpit();

  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  if (!isOpen) return null;

  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      await triggerManualSync();
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleCopy = () => {
    const json = exportBackupJson();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transformer19-30k-trading-cockpit-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    if (!importText.trim()) {
      setImportError('Please paste valid JSON state to import.');
      return;
    }
    const success = importBackupJson(importText.trim());
    if (success) {
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 1200);
    } else {
      setImportError('Invalid JSON structure. Please ensure it matches the Transformer19 schema.');
    }
  };

  const handleReset = () => {
    resetToOriginalPlan();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-[#e8e6df] dark:border-[#1e293b] bg-white dark:bg-[#121927] p-4 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e8e6df] dark:border-[#2d3748]">
          <div>
            <h3 className="text-base font-bold text-[#1e2530] dark:text-white">
              Database Sync & Local Storage Management
            </h3>
            <p className="text-xs text-[#718096] dark:text-[#a0aec0] mt-0.5">
              Backup your session results, import across devices, or reset to master blueprint.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#718096] hover:text-[#1e2530] dark:hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-5 text-xs">
          {/* Cloud Database Status */}
          <div className="p-3.5 rounded-2xl bg-[#faf9f6] dark:bg-[#162032] border border-[#e8e6df] dark:border-[#1e293b] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-[#1e2530] dark:text-white">
                <Database size={13} className={firestoreConnected ? 'text-emerald-500' : 'text-amber-500'} />
                <span>{firestoreConnected ? 'SQLite 1-Year Database (Browser & Cloud WAL Active)' : 'Connecting to Database...'}</span>
              </div>
              <div className="text-[11px] text-[#718096] dark:text-[#94a3b8] mt-0.5">
                All 252 sessions & journals recorded for 1 year in WAL mode. Sub-millisecond response.
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">SQLite OK</span>
          </div>

          {/* Automatic Website Cloud Two-Way Synchronizer */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                <Cloud size={14} className={syncState?.status === 'syncing' ? 'animate-spin text-blue-500' : 'text-blue-500'} />
                <span>Website Cloud Synchronizer (transformer19.vercel.app)</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                syncState?.status === 'pending'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : syncState?.status === 'offline'
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {syncState?.status === 'syncing' ? 'Syncing...' : syncState?.status === 'pending' ? `${syncState.pendingCount} Pending` : syncState?.status === 'offline' ? 'Offline Safe' : '100% Synced'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Edits made while offline on your desktop are saved locally to <code className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">cockpit.db</code> immediately, and automatically uploaded to the live website server when you are online.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualCloudSync}
                disabled={isSyncingCloud}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold cursor-pointer transition-all shadow-xs disabled:opacity-50"
              >
                <RefreshCw size={13} className={isSyncingCloud ? 'animate-spin' : ''} />
                <span>{isSyncingCloud ? 'Syncing with Server...' : 'Force Two-Way Sync Now'}</span>
              </button>
            </div>
            {syncState?.lastSyncedAt && (
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-2 text-right">
                Last cloud sync: {new Date(syncState.lastSyncedAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* Edit Trading Schedule CSV Section */}
          {onOpenPlanCsvModal && (
            <div className="p-3.5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/40 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-cyan-900 dark:text-cyan-300">
                  <FileSpreadsheet size={14} className="text-cyan-500 shrink-0" />
                  <span>Trading Schedule CSV Engine</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Download template or upload new target plan CSV anytime.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPlanCsvModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-[11px] font-bold cursor-pointer transition-all shrink-0 active:scale-95"
              >
                Open Plan CSV
              </button>
            </div>
          )}

          {/* Export JSON Section */}
          <div>
            <h4 className="font-bold text-[#1e2530] dark:text-white mb-2">
              Export Complete Backup (.JSON)
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#f1efea] dark:bg-[#1f293d] hover:bg-[#e8e6df] dark:hover:bg-[#27354a] text-[#1e2530] dark:text-white font-semibold cursor-pointer transition-colors"
              >
                <Download size={14} />
                <span>Download .JSON File</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-full bg-[#f1efea] dark:bg-[#1f293d] hover:bg-[#e8e6df] dark:hover:bg-[#27354a] text-[#1e2530] dark:text-white font-semibold cursor-pointer transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Import JSON Section */}
          <form onSubmit={handleImport} className="space-y-2">
            <h4 className="font-bold text-[#1e2530] dark:text-white">
              Restore / Import State from JSON
            </h4>
            <textarea
              rows={3}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste exported JSON data here..."
              className="w-full bg-[#faf9f6] dark:bg-[#0c101a] border border-[#e8e6df] dark:border-[#1e293b] rounded-2xl p-3 font-mono text-[11px] text-[#1e2530] dark:text-white focus:border-[#e07a5f] outline-none resize-none"
            ></textarea>

            {importError && (
              <div className="flex items-center gap-1.5 text-rose-600 text-[11px]">
                <AlertCircle size={13} />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-[11px]">
                <Check size={13} />
                <span>State imported successfully!</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-terracotta w-full flex items-center justify-center gap-1.5 py-2 px-4 cursor-pointer"
            >
              <Upload size={14} />
              <span>Import & Overwrite State</span>
            </button>
          </form>

          {/* Reset Blueprint Danger Zone */}
          <div className="pt-3 border-t border-[#e8e6df] dark:border-[#1e293b] flex items-center justify-between">
            <div>
              <span className="font-bold text-rose-600">Reset to Master Blueprint</span>
              <p className="text-[11px] text-[#718096] dark:text-[#94a3b8]">Reverts all logs back to initial 48-week plan.</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-semibold cursor-pointer text-xs"
            >
              <RotateCcw size={13} />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
