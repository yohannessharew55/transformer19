import React, { useState, useRef, useEffect } from 'react';
import { useCockpit } from '../context/CockpitContext';
import { TriRobotAvatar } from './TriRobotAvatar';
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  Clock,
  BookOpen,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronDown,
  Layers,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Code2,
  MessageSquare
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const CHAT_STORAGE_KEY = 'transformer19_tri_chat_history_30k_v1';

const QUICK_PROMPTS = [
  {
    category: '💬 Free Chat',
    icon: MessageSquare,
    text: 'Let us chat freely like ChatGPT. Tell me an inspiring perspective on discipline and mastery.'
  },
  {
    category: '🥇 Gold (XAU/USD)',
    icon: Sparkles,
    text: 'What are the highest probability displacement scalp triggers during London Open?'
  },
  {
    category: '🛡️ Lot Ladder',
    icon: Shield,
    text: 'Audit my authorized lot size and risk parameters for my current working equity.'
  },
  {
    category: '💻 PineScript / Code',
    icon: Code2,
    text: 'Write a TradingView PineScript indicator to highlight London Open (07:00 UTC) displacement.'
  },
  {
    category: '🧠 Mindset Reset',
    icon: AlertTriangle,
    text: 'Help me reset my psychology to baseline zero so I do not force emotional trades.'
  }
];

export const TriChatbot: React.FC = () => {
  const {
    traderName,
    metrics,
    devotionGatePassedToday,
    journalNotes,
    quarters
  } = useCockpit();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed loading chat history:', e);
    }
    return [
      {
        id: 'tri_welcome_msg',
        role: 'assistant',
        content: `Greetings, Operator **${traderName || 'Yohannes'}**! I am **Tri**, your Elite Pre-Launch Command Officer & AI Trading Partner powered by Gemini.

**SYSTEM STATUS: PRE-LAUNCH EXECUTION PLAN**
• **Starting Seed Capital**: $50.00 (Ready to deploy for Day 1)
• **Live Realized P&L**: **None** (The journey has not started yet; 0 sessions executed)
• **Simulated Goal to Achieve**: Grow $50 into **$30,000** working equity with **$7,150** offline bank sweeps over 48 weeks ($37,150 total value).
• **Rule 01 Devotion Gate**: ${devotionGatePassedToday ? '✓ Cleared' : '⚠️ Pending'}

I am fully interceded with your simulated plan. Ask me anything about preparing for Day 1, auditing the lot ladder, Gold (XAU/USD) price action, coding, or chat freely like ChatGPT/Gemini!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Save conversation history locally
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed saving chat history locally:', e);
    }
  }, [messages]);

  // Context bundle passed to Tri endpoint
  const getContextPayload = () => {
    return {
      traderName,
      isSimulationPlan: true,
      journeyStarted: metrics.completedSessions > 0,
      workingEquity: metrics.currentWorkingEquity,
      realizedPnl: metrics.actualTotalPnL > 0 ? `$${metrics.actualTotalPnL.toFixed(2)}` : 'None ($0.00 - Not Started)',
      bankedCash: metrics.currentBankedCash,
      netWorth: metrics.currentTotalNetWorth,
      targetRetained: metrics.targetRetained,
      targetBanked: metrics.targetBanked,
      completedSessions: metrics.completedSessions,
      totalSessions: metrics.totalSessions,
      progressPercent: metrics.progressPercent.toFixed(1),
      winRate: metrics.completedSessions > 0 ? metrics.completedWinRate.toFixed(1) : '66.2 (Planned Edge)',
      wins: metrics.completedWins,
      losses: metrics.completedLosses,
      devotionPassed: devotionGatePassedToday,
      totalNotes: journalNotes.length,
      recentNotes: journalNotes.slice(0, 5).map(n => ({
        dayLabel: n.dayLabel,
        sessionTag: n.sessionTag,
        title: n.title,
        content: n.content,
        outcome: n.outcome,
        pnl: n.pnl
      }))
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          contextData: getContextPayload()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: data.reply || 'Order received, Operator. Stay disciplined.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newHistory, assistantMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const fallbackMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `⚠️ **Communication Link Advisory**: Tri could not connect to Gemini reasoning engine (${error?.message || 'Check connection'}).\n\n**Immediate Risk Command**: Ensure Rule 01 spiritual devotion is completed and keep position sizing strictly at authorized lot level.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newHistory, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear conversation history with Tri?')) {
      const initial: ChatMessage[] = [
        {
          id: `tri_reset_${Date.now()}`,
          role: 'assistant',
          content: `History cleared, Operator **${traderName}**. Ready to analyze your trading sessions, risk boundaries, and execution roadmap.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(initial);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(initial));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format markdown in responses (bold, bullets, line breaks)
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold rendering
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Dock (Totally hidden until hovering in right bottom corner - Icon Only) */}
      {!isOpen && (
        <div
          className="fixed bottom-0 right-0 z-40 print:hidden w-28 h-28 sm:w-36 sm:h-36 flex items-end justify-end p-4 sm:p-5 pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(prev => !prev)}
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={`group relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-950/95 dark:bg-[#070d18]/95 border-2 border-[#0082ff] shadow-[0_0_25px_rgba(0,130,255,0.45),0_8px_24px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 cursor-pointer select-none ${
              isHovered
                ? 'opacity-100 translate-x-0 translate-y-0 scale-100 pointer-events-auto shadow-[0_0_35px_rgba(0,240,255,0.7),0_12px_28px_rgba(0,0,0,0.85)] hover:scale-110 active:scale-95'
                : 'opacity-0 translate-x-8 translate-y-8 scale-50 pointer-events-none'
            }`}
            style={{
              transitionTimingFunction: isHovered ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            title="Tri AI - Risk & Execution Officer"
            aria-label="Open Tri AI Risk Intelligence Officer"
          >
            {/* Ambient cybernetic glow ring */}
            <div className="absolute inset-0 rounded-full bg-radial from-[#00f0ff]/20 via-transparent to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />

            {/* The Animated Bot Avatar (Icon only) */}
            <TriRobotAvatar size={38} animated={true} />

            {/* Active Online Beacon */}
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </button>
        </div>
      )}

      {/* Tri Chat Drawer / Modal Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 transition-all duration-300 flex flex-col bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden ${
            isExpanded
              ? 'w-[95vw] sm:w-[680px] h-[88vh] max-h-[850px]'
              : 'w-[95vw] sm:w-[460px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-[#121927] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <TriRobotAvatar size={42} animated={true} isThinking={isLoading} />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                    TRI COMMAND
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#0082ff]/15 text-[#0082ff]">
                    AI Officer
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <span>Seed: $50 · Realized: None</span>
                  <span>·</span>
                  <span className={devotionGatePassedToday ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                    {devotionGatePassedToday ? 'Devotion OK' : 'Devotion Gated'}
                  </span>
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Clear chat history"
              >
                <Trash2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Restore window size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Minimize Tri Chatbot"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3.5 py-2 bg-slate-100/60 dark:bg-[#162032]/60 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {QUICK_PROMPTS.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(qp.text)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:border-[#e07a5f] hover:text-[#e07a5f] whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  <Icon size={11} className="text-[#e07a5f]" />
                  <span>{qp.category}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Scrollable Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map(msg => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {isAssistant && <TriRobotAvatar size={18} animated={false} className="mr-0.5" />}
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {isAssistant ? 'TRI' : (traderName || 'YOU')}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 opacity-60">
                      {msg.timestamp}
                    </span>
                  </div>

                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed text-xs shadow-2xs group relative ${
                      isAssistant
                        ? 'bg-slate-50 dark:bg-[#121927] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800'
                        : 'bg-slate-900 text-white dark:bg-[#0082ff] dark:text-white rounded-br-xs'
                    }`}
                  >
                    {renderMessageContent(msg.content)}

                    {/* Copy action for assistant messages */}
                    {isAssistant && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={11} className="text-emerald-500" />
                              <span className="text-emerald-500 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing / Reasoning Beacon */}
            {isLoading && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800 text-slate-500 w-fit">
                <TriRobotAvatar size={24} animated={true} isThinking={true} />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  Tri is analyzing and generating response...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar (Versatile Multiline Textarea) */}
          <div className="p-3 bg-white dark:bg-[#0c101a] border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask Tri freely about trading, Gold, code, mindset, or general questions (Enter to send, Shift+Enter for new line)..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0082ff] transition-colors resize-none max-h-32 min-h-[42px] leading-relaxed"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-2xl bg-[#0082ff] hover:bg-[#0070df] text-white disabled:opacity-40 disabled:pointer-events-none cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xs shrink-0 mb-0.5"
                title="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
