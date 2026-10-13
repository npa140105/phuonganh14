import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Receipt,
  Boxes,
  TrendingUp,
  ChefHat,
  Layers,
  Music,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Beaker
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export type AppTabType = 'pos' | 'bom' | 'analytics' | 'qrcode' | 'kds' | 'matrix' | 'studio';

interface TopBarProps {
  currentTab: AppTabType;
  onSelectTab: (tab: AppTabType) => void;
  coins: number;
  isMuted: boolean;
  onToggleMute: () => void;
  activeDay: number;
  lowStockCount?: number;
  todayCupsCount?: number;
  todayRevenue?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  coins,
  isMuted,
  onToggleMute,
  activeDay,
  lowStockCount = 0,
  todayCupsCount = 0,
  todayRevenue = 0
}) => {
  const [lofiActive, setLofiActive] = useState(false);

  const handleToggleLofi = () => {
    sounds.playClick();
    const active = sounds.toggleLofiMusic();
    setLofiActive(active);
  };

  return (
    <header className="w-full border-b border-[#2d2722] bg-[#161413]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('pos')}
            className="text-left group flex items-center gap-2 cursor-pointer"
          >
            <span className="text-xl font-extrabold tracking-tight text-[#f5ebd9] group-hover:text-[#f59e0b] transition-colors font-display">
              BobaFlow 12
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#2a221a] text-[#fbbf24] border border-[#d97706]/30 hidden sm:inline">
              茶飲進銷存系統
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links for POS & Inventory System */}
        <nav className="flex items-center gap-2 md:gap-4 text-xs sm:text-sm font-medium overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('pos');
            }}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap py-1 px-2 rounded-lg ${
              currentTab === 'pos'
                ? 'bg-[#2a2119] text-[#fbbf24] font-bold border border-[#d97706]/40'
                : 'text-[#a89f91] hover:text-[#f4efe8]'
            }`}
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>前台銷售</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('bom');
            }}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap py-1 px-2 rounded-lg ${
              currentTab === 'bom'
                ? 'bg-[#2a2119] text-[#fbbf24] font-bold border border-[#d97706]/40'
                : 'text-[#a89f91] hover:text-[#f4efe8]'
            }`}
          >
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>後台存貨</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('analytics');
            }}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap py-1 px-2 rounded-lg ${
              currentTab === 'analytics'
                ? 'bg-[#2a2119] text-[#fbbf24] font-bold border border-[#d97706]/40'
                : 'text-[#a89f91] hover:text-[#f4efe8]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>分析報表</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('qrcode');
            }}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap py-1 px-2 rounded-lg ${
              currentTab === 'qrcode'
                ? 'bg-[#2a2119] text-[#fbbf24] font-bold border border-[#d97706]/40'
                : 'text-[#a89f91] hover:text-[#f4efe8]'
            }`}
          >
            <Receipt className="w-4 h-4 text-[#fbbf24]" />
            <span>QR 應用中心</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('kds');
            }}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap py-1 px-2 rounded-lg ${
              currentTab === 'kds'
                ? 'bg-[#2a2119] text-[#fbbf24] font-bold border border-[#d97706]/40'
                : 'text-[#a89f91] hover:text-[#f4efe8]'
            }`}
          >
            <ChefHat className="w-4 h-4 text-[#fbbf24]" />
            <span>出餐 (KDS)</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('matrix');
            }}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap py-1 px-2 rounded-lg ${
              currentTab === 'matrix'
                ? 'bg-[#2a2119] text-[#fbbf24] font-bold border border-[#d97706]/40'
                : 'text-[#a89f91] hover:text-[#f4efe8]'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>配方 (BOM)</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('studio');
            }}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap py-1 px-2 rounded-lg ${
              currentTab === 'studio'
                ? 'bg-[#2a2119] text-[#fbbf24] font-bold border border-[#d97706]/40'
                : 'text-[#8c7e70] hover:text-[#f4efe8]'
            }`}
            title="飲品調製研發實驗室"
          >
            <Beaker className="w-3.5 h-3.5" />
            <span className="hidden md:inline">特調研發</span>
          </button>
        </nav>

        {/* Zone 3: Live Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Low stock alert badge button */}
          {lowStockCount > 0 ? (
            <button
              onClick={() => {
                sounds.playClick();
                onSelectTab('analytics');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-950/70 border border-amber-700/60 text-amber-300 hover:bg-amber-900/80 transition-colors cursor-pointer animate-pulse"
              title="點擊查看補貨預警報表"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{lowStockCount} 項待補貨</span>
            </button>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>存貨連動正常</span>
            </div>
          )}

          {/* Today's Sales Summary Pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-[#241e19] border border-[#382f27] text-[#fbbf24] tabular-nums">
            <span className="text-[#a89f91] font-sans font-normal">今日:</span>
            <span>{todayCupsCount}杯</span>
            <span className="text-[#786e63]">·</span>
            <span>${todayRevenue.toFixed(0)}</span>
          </div>

          {/* Lo-fi Cafe Music */}
          <button
            onClick={handleToggleLofi}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              lofiActive
                ? 'bg-[#2a2119] text-[#fbbf24] border-[#d97706]/40 animate-pulse'
                : 'bg-[#1e1a17] text-[#a89f91] border-[#2e2620] hover:text-[#f4efe8]'
            }`}
            title="開關門市放鬆背景音樂"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">音樂</span>
          </button>

          {/* Sound audio toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className="p-1.5 rounded-lg text-[#a89f91] hover:text-[#f4efe8] hover:bg-[#25201c] transition-colors cursor-pointer"
            title={isMuted ? '開啟操作音效' : '靜音操作音效'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};

