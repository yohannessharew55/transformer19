import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Transformer19 Cockpit:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleSafeRecovery = () => {
    try {
      // Safely purge corrupted state while keeping accounts & journals
      localStorage.removeItem('transformer19_cockpit_30k_v1');
      localStorage.removeItem('t19_active_acc_id');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleFullReset = () => {
    if (window.confirm('Reset cockpit cache to default clean state? Your custom accounts and journal notes will be restored.')) {
      try {
        localStorage.clear();
      } catch {
        // ignore
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-xl w-full bg-[#121927] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert size={26} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                  Cockpit Safeguard Engaged
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Execution Terminal Recovered
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              The cockpit encountered an unexpected runtime exception while rendering. All trading telemetry, portfolio accounts, and journal notes have been safeguarded.
            </p>

            {this.state.error && (
              <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl p-4 mb-6 font-mono text-xs text-rose-300 overflow-x-auto max-h-40">
                <div className="font-bold text-slate-400 mb-1 text-[10px] uppercase">Exception Diagnostic:</div>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#0082ff] hover:bg-[#0070df] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <RefreshCw size={15} />
                <span>Reload Cockpit</span>
              </button>

              <button
                type="button"
                onClick={this.handleSafeRecovery}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw size={15} />
                <span>Safe Self-Healing</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={this.handleFullReset}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors underline cursor-pointer"
              >
                Advanced: Reset All Local Storage Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
