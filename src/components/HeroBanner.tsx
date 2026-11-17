import React, { useState, useEffect } from 'react';
import { useCockpit } from '../context/CockpitContext';
import {
  TrendingUp,
  Shield,
  BookOpen,
  Landmark,
  ShieldAlert,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  Compass,
  Edit3,
  X,
  Save,
  RotateCcw,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const {
    traderName,
    devotionGatePassedToday,
    toggleDevotionGate,
    metrics,
    setActiveNavTab,
    setWorkspaceMode,
    firestoreConnected,
    activeAccount,
    saveAccount,
    cockpitData,
    navigateToTab
  } = useCockpit();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);

  // Dynamic defaults based on activeAccount and plan
  const defaultSubtitle = activeAccount?.heroSubtitle || (
    `A serene, mathematically disciplined 48–week compounding framework. Growing $${(activeAccount?.startingBalance || 50).toLocaleString()} seed capital into $${(activeAccount?.planRetained || (activeAccount?.startingBalance ? Math.round(activeAccount.startingBalance * 600) : 30000)).toLocaleString()} working equity with $${(activeAccount?.planBanked || (activeAccount?.startingBalance ? Math.round(activeAccount.startingBalance * 143) : 7150)).toLocaleString()} physical banked sweeps ($${(activeAccount?.profitTarget || (activeAccount?.startingBalance ? Math.round(activeAccount.startingBalance * 743) : 37150)).toLocaleString()} total value), backed by high-performance LibSQL / SQLite.`
  );

  const defaultWeeksLabel = activeAccount?.heroWeeksLabel || '48+';
  const defaultWeeksSub = activeAccount?.heroWeeksSub || 'Quarters 1 through 4 roadmap';
  const defaultDaysLabel = activeAccount?.heroDaysLabel || '252';
  const defaultDaysSub = activeAccount?.heroDaysSub || `${metrics.completedSessions} sessions completed in DB`;
  const defaultWinRateLabel = activeAccount?.heroWinRateLabel || (
    metrics.completedSessions > 0 ? `${(metrics.completedWinRate ?? metrics.winRate ?? 66.2).toFixed(1)}%` : '66.2%'
  );
  const defaultWinRateSub = activeAccount?.heroWinRateSub || 'Over 1,000 statistical wins';
  const defaultSweepsLabel = activeAccount?.heroSweepsLabel || (
    activeAccount?.planBanked ? `$${(activeAccount.planBanked / 1000).toFixed(1)}k` : '$7.1k'
  );
  const defaultSweepsSub = activeAccount?.heroSweepsSub || (
    `20% monthly profit extraction ($${(activeAccount?.planBanked || 7150).toLocaleString()} total)`
  );

  // Form State for editing
  const [editSubtitle, setEditSubtitle] = useState(defaultSubtitle);
  const [editWeeksLabel, setEditWeeksLabel] = useState(defaultWeeksLabel);
  const [editWeeksSub, setEditWeeksSub] = useState(defaultWeeksSub);
  const [editDaysLabel, setEditDaysLabel] = useState(defaultDaysLabel);
  const [editDaysSub, setEditDaysSub] = useState(defaultDaysSub);
  const [editWinRateLabel, setEditWinRateLabel] = useState(defaultWinRateLabel);
  const [editWinRateSub, setEditWinRateSub] = useState(defaultWinRateSub);
  const [editSweepsLabel, setEditSweepsLabel] = useState(defaultSweepsLabel);
  const [editSweepsSub, setEditSweepsSub] = useState(defaultSweepsSub);

  // Keep state in sync when active account changes
  useEffect(() => {
    setEditSubtitle(defaultSubtitle);
    setEditWeeksLabel(defaultWeeksLabel);
    setEditWeeksSub(defaultWeeksSub);
    setEditDaysLabel(defaultDaysLabel);
    setEditDaysSub(defaultDaysSub);
    setEditWinRateLabel(defaultWinRateLabel);
    setEditWinRateSub(defaultWinRateSub);
    setEditSweepsLabel(defaultSweepsLabel);
    setEditSweepsSub(defaultSweepsSub);
  }, [activeAccount?.id]);

  const handleSaveDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount) return;

    saveAccount({
      ...activeAccount,
      heroSubtitle: editSubtitle.trim(),
      heroWeeksLabel: editWeeksLabel.trim(),
      heroWeeksSub: editWeeksSub.trim(),
      heroDaysLabel: editDaysLabel.trim(),
      heroDaysSub: editDaysSub.trim(),
      heroWinRateLabel: editWinRateLabel.trim(),
      heroWinRateSub: editWinRateSub.trim(),
      heroSweepsLabel: editSweepsLabel.trim(),
      heroSweepsSub: editSweepsSub.trim()
    });

    setIsEditModalOpen(false);
  };

  const handleResetToAuto = () => {
    if (!activeAccount) return;
    saveAccount({
      ...activeAccount,
      heroSubtitle: undefined,
      heroWeeksLabel: undefined,
      heroWeeksSub: undefined,
      heroDaysLabel: undefined,
      heroDaysSub: undefined,
      heroWinRateLabel: undefined,
      heroWinRateSub: undefined,
      heroSweepsLabel: undefined,
      heroSweepsSub: undefined
    });
    setIsEditModalOpen(false);
  };

  const handleExploreMatrix = () => {
    navigateToTab('cockpit', 'quarter-matrix-section');
  };

  // Capital Harvest Image View Toggle ('vault' | 'gold')
  const [harvestImageMode, setHarvestImageMode] = useState<'vault' | 'gold'>('vault');

  const servicesList = [
    {
      num: '01',
      title: 'Spiritual Devotion Gate',
      sub: '1-Hour Bible reading & prayer before opening MT5. Platform stays shut until spirit and mind are centered.',
      tag: devotionGatePassedToday ? 'Gate Cleared ✓' : 'Gate Required !',
      icon: BookOpen,
      image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
      action: toggleDevotionGate
    },
    {
      num: '02',
      title: `Statistical Edge (${defaultWinRateLabel})`,
      sub: 'Trade strictly during London & NY open expansion. Zero Asian chop, zero pre-market churn.',
      tag: 'Proven Edge',
      icon: TrendingUp,
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'
    },
    {
      num: '03',
      title: 'Physical Cash Sweeps',
      sub: `20% of net profits swept every month to offline cold bank accounts ($${(activeAccount?.planBanked || 7150).toLocaleString()} total).`,
      tag: 'Capital Harvest',
      icon: Landmark,
      image: harvestImageMode === 'vault' ? 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?auto=format&fit=crop&w=800&q=80' : 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
      action: () => setHarvestImageMode(prev => prev === 'vault' ? 'gold' : 'vault')
    },
    {
      num: '04',
      title: 'Risk Circuit Breakers',
      sub: `Mechanical 50% risk demotion immediately after 2 consecutive losses. Daily stop loss limit set at $${(activeAccount?.dailyLossLimit || 20).toLocaleString()}.`,
      tag: 'Capital Shield',
      icon: ShieldAlert,
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <section className="mb-10 text-slate-900 dark:text-white">
      {/* Clean Modern Hero Layout with Big Typography (Image 2 Style) */}
      <div className={`pt-2 sm:pt-4 border-b border-slate-200 dark:border-slate-800 transition-all ${isHeroCollapsed ? 'pb-3' : 'pb-8'}`}>
        {/* Active Account Context Pill & Collapse Toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {activeAccount && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{activeAccount.name}</span>
                <span className="text-slate-400 font-normal">·</span>
                <span className="text-slate-500 dark:text-slate-400">Target: ${(activeAccount.profitTarget || 37150).toLocaleString()}</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsHeroCollapsed(prev => !prev)}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#162032] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs hover:scale-105 active:scale-95"
            title={isHeroCollapsed ? 'Expand Blueprint Dossier' : 'Compact View'}
          >
            <span>{isHeroCollapsed ? 'Expand Overview' : 'Compact'}</span>
            {isHeroCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>

        {!isHeroCollapsed && (
          <div className="animate-fadeIn">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div className="max-w-3xl">
                {/* Editorial Big Title */}
                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08] mb-5">
                  Building Wealth That
                  <span className="block text-slate-500 dark:text-slate-400 font-light">
                    Inspires & Endures.
                  </span>
                </h1>

                {/* Dynamic & Editable Subtitle */}
                <p
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal hover:text-[#0082ff] dark:hover:text-[#0082ff] cursor-pointer transition-colors group"
                  title="Click to edit this mission text for the active account"
                >
                  {defaultSubtitle}
                  <span className="opacity-0 group-hover:opacity-100 text-xs text-[#0082ff] font-mono ml-2 font-bold transition-opacity">
                    ✎ Edit
                  </span>
                </p>
              </div>

              {/* Action CTA: Explore 48-Week Matrix */}
              <div className="flex items-center shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExploreMatrix}
                  className="w-full sm:w-auto justify-center px-7 py-3.5 rounded-full bg-slate-900 dark:bg-[#1a2333] text-white text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-[#253249] transition-all flex items-center gap-2.5 shadow-sm hover:shadow-md cursor-pointer border border-slate-900 dark:border-slate-700 active:scale-95"
                >
                  <span>Explore 48–Week Matrix</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

        {/* 4 Bold Big Metric Callouts - Dynamic & Clickable to Edit */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800">
          {/* 1. Execution Weeks */}
          <div
            onClick={() => setIsEditModalOpen(true)}
            className="group cursor-pointer p-2.5 -m-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            title="Click to edit Execution Weeks for this account"
          >
            <div className="font-mono text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-[#0082ff] transition-colors">
              {defaultWeeksLabel}
            </div>
            <div className="text-xs sm:text-base font-bold text-slate-900 dark:text-white mt-1.5 sm:mt-2 flex items-center gap-1">
              <span>Execution Weeks</span>
              <Edit3 size={11} className="opacity-0 group-hover:opacity-100 text-[#0082ff] transition-opacity" />
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {defaultWeeksSub}
            </div>
          </div>

          {/* 2. Disciplined Trading Days */}
          <div
            onClick={() => setIsEditModalOpen(true)}
            className="group cursor-pointer p-2.5 -m-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            title="Click to edit Trading Days for this account"
          >
            <div className="font-mono text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-[#0082ff] transition-colors">
              {defaultDaysLabel}
            </div>
            <div className="text-xs sm:text-base font-bold text-slate-900 dark:text-white mt-1.5 sm:mt-2 flex items-center gap-1">
              <span>Disciplined Trading Days</span>
              <Edit3 size={11} className="opacity-0 group-hover:opacity-100 text-[#0082ff] transition-opacity" />
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {defaultDaysSub}
            </div>
          </div>

          {/* 3. Verified Win Rate */}
          <div
            onClick={() => setIsEditModalOpen(true)}
            className="group cursor-pointer p-2.5 -m-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            title="Click to edit Target Win Rate for this account"
          >
            <div className="font-mono text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-500 transition-colors">
              {defaultWinRateLabel}
            </div>
            <div className="text-xs sm:text-base font-bold text-slate-900 dark:text-white mt-1.5 sm:mt-2 flex items-center gap-1">
              <span>Verified Win Rate</span>
              <Edit3 size={11} className="opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity" />
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {defaultWinRateSub}
            </div>
          </div>

          {/* 4. Offline Bank Sweeps / Profit Extraction */}
          <div
            onClick={() => setIsEditModalOpen(true)}
            className="group cursor-pointer p-2.5 -m-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            title="Click to edit Bank Sweeps / Target for this account"
          >
            <div className="font-mono text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-amber-500 transition-colors">
              {defaultSweepsLabel}
            </div>
            <div className="text-xs sm:text-base font-bold text-slate-900 dark:text-white mt-1.5 sm:mt-2 flex items-center gap-1">
              <span>{activeAccount?.category === 'personal_compounding' ? 'Offline Bank Sweeps' : 'Profit Target'}</span>
              <Edit3 size={11} className="opacity-0 group-hover:opacity-100 text-amber-500 transition-opacity" />
            </div>
            <div className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {defaultSweepsSub}
            </div>
          </div>
        </div>

      {/* 4 Clean Architectural Cards (Core Operating Disciplines) */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-mono">
            Core Operating Disciplines
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Rules 01 – 04 Focus
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {servicesList.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                onClick={item.action}
                className="group scandi-card overflow-hidden hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Visual Image Banner */}
                  <div className="h-36 relative overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        if (item.num === '03') {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?auto=format&fit=crop&w=800&q=80';
                        }
                      }}
                    />
                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

                    {/* Floating Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white border border-white/20">
                        {item.num}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white border border-white/20">
                        {item.tag}
                      </span>
                    </div>

                    {/* Icon Badge Floating on Bottom Left of Image */}
                    <div className="absolute bottom-2.5 left-3 w-8 h-8 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-slate-900 dark:text-white shadow-md">
                      <Icon size={16} />
                    </div>
                  </div>

                  {/* Card Body Text */}
                  <div className="p-4 sm:p-5 pt-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 group-hover:text-[#0082ff] dark:group-hover:text-[#e07a5f] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {item.sub}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )}
</div>

      {/* Hero Dossier & Big Callout Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-fadeIn space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0082ff]/10 border border-[#0082ff]/30 flex items-center justify-center text-[#0082ff]">
                  <Sliders size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                    Account: {activeAccount?.name}
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Edit Hero Targets & Dossier
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDossier} className="space-y-5">
              {/* 1. Mission / Subtitle Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Strategic Mission Statement & Subtitle</span>
                  <span className="text-[10px] font-normal text-slate-400">Displayed prominently under main title</span>
                </label>
                <textarea
                  rows={3}
                  value={editSubtitle}
                  onChange={e => setEditSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0082ff] font-sans"
                  placeholder="e.g. A serene, mathematically disciplined 48-week compounding framework..."
                />
              </div>

              {/* 2. Grid of 4 Big Callouts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Callout 1: Execution Weeks */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    1. Execution Weeks Callout
                  </span>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Big Value</label>
                    <input
                      type="text"
                      value={editWeeksLabel}
                      onChange={e => setEditWeeksLabel(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0082ff] outline-none"
                      placeholder="e.g. 48+"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Subtext</label>
                    <input
                      type="text"
                      value={editWeeksSub}
                      onChange={e => setEditWeeksSub(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-[#0082ff] outline-none"
                      placeholder="e.g. Quarters 1 through 4 roadmap"
                    />
                  </div>
                </div>

                {/* Callout 2: Disciplined Days */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    2. Trading Days Callout
                  </span>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Big Value</label>
                    <input
                      type="text"
                      value={editDaysLabel}
                      onChange={e => setEditDaysLabel(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0082ff] outline-none"
                      placeholder="e.g. 252"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Subtext</label>
                    <input
                      type="text"
                      value={editDaysSub}
                      onChange={e => setEditDaysSub(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-[#0082ff] outline-none"
                      placeholder="e.g. 0 sessions completed in DB"
                    />
                  </div>
                </div>

                {/* Callout 3: Win Rate */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    3. Win Rate Callout
                  </span>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Big Value</label>
                    <input
                      type="text"
                      value={editWinRateLabel}
                      onChange={e => setEditWinRateLabel(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 focus:ring-1 focus:ring-[#0082ff] outline-none"
                      placeholder="e.g. 66.2%"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Subtext</label>
                    <input
                      type="text"
                      value={editWinRateSub}
                      onChange={e => setEditWinRateSub(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-[#0082ff] outline-none"
                      placeholder="e.g. Over 1,000 statistical wins"
                    />
                  </div>
                </div>

                {/* Callout 4: Bank Sweeps / Target */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0b0f17] border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    4. Bank Sweeps / Target Callout
                  </span>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Big Value</label>
                    <input
                      type="text"
                      value={editSweepsLabel}
                      onChange={e => setEditSweepsLabel(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-amber-600 dark:text-amber-400 focus:ring-1 focus:ring-[#0082ff] outline-none"
                      placeholder="e.g. $7.1k"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Subtext</label>
                    <input
                      type="text"
                      value={editSweepsSub}
                      onChange={e => setEditSweepsSub(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-[#0082ff] outline-none"
                      placeholder="e.g. 20% monthly profit extraction"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResetToAuto}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset to Plan Auto-Values</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0082ff] hover:bg-[#0070df] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Check size={14} />
                    <span>Save to {activeAccount?.name || 'Account'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
