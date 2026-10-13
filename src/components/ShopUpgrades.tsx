import React, { useState } from 'react';
import { CupType, SealDesign, StrawType, UserShopProgress } from '../types/boba';
import { CUP_CATALOG, STRAW_CATALOG, SEAL_CATALOG } from '../data/bobaData';
import { sounds } from '../services/soundEffects';
import { ShoppingBag, Check, Sparkles } from 'lucide-react';

interface ShopUpgradesProps {
  progress: UserShopProgress;
  onPurchaseOrEquipCup: (cup: CupType, price: number) => void;
  onPurchaseOrEquipStraw: (straw: StrawType, price: number) => void;
  onPurchaseOrEquipSeal: (seal: SealDesign, price: number) => void;
}

export const ShopUpgrades: React.FC<ShopUpgradesProps> = ({
  progress,
  onPurchaseOrEquipCup,
  onPurchaseOrEquipStraw,
  onPurchaseOrEquipSeal
}) => {
  const [activeTab, setActiveTab] = useState<'cups' | 'straws' | 'seals'>('cups');

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header Banner with Cafe Counter Showcase */}
      <div className="relative rounded-2xl overflow-hidden border border-[#2d251f] bg-[#1a1715] shadow-xl">
        <div className="h-44 w-full relative overflow-hidden">
          <img
            src="/src/assets/images/boba_shop_counter_1790659795093.jpg"
            alt="BobaFlow Counter Interior"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141211] via-[#141211]/50 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#fbbf24]">
                Equipment & Atelier
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#f5ebd9] font-display">
                Shop Upgrades & Aesthetic Gear
              </h1>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1e1915]/90 border border-[#d97706]/30 text-[#fbbf24] font-mono text-sm font-semibold backdrop-blur-sm">
              <span>🪙</span>
              <span>{progress.coins} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex items-center gap-2 border-b border-[#2d251f] pb-3">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('cups');
          }}
          className={`py-2 px-4 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'cups'
              ? 'bg-[#2b221a] text-[#fbbf24] border border-[#d97706]/30'
              : 'text-[#a89f91] hover:text-[#f4efe8]'
          }`}
        >
          Glassware & Cups
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('straws');
          }}
          className={`py-2 px-4 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'straws'
              ? 'bg-[#2b221a] text-[#fbbf24] border border-[#d97706]/30'
              : 'text-[#a89f91] hover:text-[#f4efe8]'
          }`}
        >
          Boba Straws
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('seals');
          }}
          className={`py-2 px-4 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'seals'
              ? 'bg-[#2b221a] text-[#fbbf24] border border-[#d97706]/30'
              : 'text-[#a89f91] hover:text-[#f4efe8]'
          }`}
        >
          Heat Sealing Films
        </button>
      </div>

      {/* Cups Catalog */}
      {activeTab === 'cups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CUP_CATALOG.map((item) => {
            const isUnlocked = progress.unlockedCups.includes(item.id);
            const isEquipped = progress.activeCup === item.id;
            const canAfford = progress.coins >= item.price;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'border-[#f59e0b] bg-[#241c16]'
                    : isUnlocked
                    ? 'border-[#2d251f] bg-[#1a1715]'
                    : 'border-[#201d1b] bg-[#141211] opacity-80'
                }`}
              >
                <div>
                  <div className="h-28 rounded-xl bg-[#121110] border border-[#26201b] flex items-center justify-center text-4xl mb-3">
                    {item.id === 'classic' && '🥛'}
                    {item.id === 'slender' && '🧋'}
                    {item.id === 'chubby' && '🍯'}
                    {item.id === 'frosted_can' && '🧊'}
                  </div>
                  <h3 className="text-sm font-bold text-[#f5ebd9]">{item.name}</h3>
                  <p className="text-xs text-[#a89f91] mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#26201b] flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#fbbf24]">
                    {item.price === 0 ? 'Default' : `${item.price} pts`}
                  </span>

                  {isEquipped ? (
                    <span className="text-xs font-bold text-[#f59e0b] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Equipped</span>
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onPurchaseOrEquipCup(item.id, 0);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#27201a] text-[#fbbf24] hover:bg-[#382d23] border border-[#d97706]/30 cursor-pointer"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playTipChime();
                        onPurchaseOrEquipCup(item.id, item.price);
                      }}
                      disabled={!canAfford}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-[#121110] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Straws Catalog */}
      {activeTab === 'straws' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {STRAW_CATALOG.map((item) => {
            const isUnlocked = progress.unlockedStraws.includes(item.id);
            const isEquipped = progress.activeStraw === item.id;
            const canAfford = progress.coins >= item.price;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'border-[#f59e0b] bg-[#241c16]'
                    : isUnlocked
                    ? 'border-[#2d251f] bg-[#1a1715]'
                    : 'border-[#201d1b] bg-[#141211] opacity-80'
                }`}
              >
                <div>
                  <div className="h-24 rounded-xl bg-[#121110] border border-[#26201b] flex items-center justify-center mb-3">
                    <span
                      className="w-3 h-16 rounded-full shadow-lg"
                      style={{ backgroundColor: item.hex }}
                    />
                  </div>
                  <h3 className="text-xs font-bold text-[#f5ebd9]">{item.name}</h3>
                  <span className="text-[11px] text-[#a89f91] block mt-0.5">{item.color}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#26201b] flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#fbbf24]">
                    {item.price === 0 ? 'Free' : `${item.price} pts`}
                  </span>

                  {isEquipped ? (
                    <span className="text-xs font-bold text-[#f59e0b] flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Equipped</span>
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onPurchaseOrEquipStraw(item.id, 0);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-[#27201a] text-[#fbbf24] hover:bg-[#382d23] border border-[#d97706]/30 cursor-pointer"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playTipChime();
                        onPurchaseOrEquipStraw(item.id, item.price);
                      }}
                      disabled={!canAfford}
                      className="px-2.5 py-1 text-xs font-bold rounded bg-[#f59e0b] hover:bg-[#d97706] text-[#121110] disabled:opacity-40 cursor-pointer"
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Seals Catalog */}
      {activeTab === 'seals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {SEAL_CATALOG.map((item) => {
            const isUnlocked = progress.unlockedSeals.includes(item.id);
            const isEquipped = progress.activeSeal === item.id;
            const canAfford = progress.coins >= item.price;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'border-[#f59e0b] bg-[#241c16]'
                    : isUnlocked
                    ? 'border-[#2d251f] bg-[#1a1715]'
                    : 'border-[#201d1b] bg-[#141211] opacity-80'
                }`}
              >
                <div>
                  <div className="h-24 rounded-xl bg-[#121110] border border-[#26201b] flex items-center justify-center text-3xl mb-3">
                    {item.symbol}
                  </div>
                  <h3 className="text-xs font-bold text-[#f5ebd9]">{item.name}</h3>
                </div>

                <div className="mt-4 pt-3 border-t border-[#26201b] flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#fbbf24]">
                    {item.price === 0 ? 'Free' : `${item.price} pts`}
                  </span>

                  {isEquipped ? (
                    <span className="text-xs font-bold text-[#f59e0b] flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Equipped</span>
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onPurchaseOrEquipSeal(item.id, 0);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-[#27201a] text-[#fbbf24] hover:bg-[#382d23] border border-[#d97706]/30 cursor-pointer"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playTipChime();
                        onPurchaseOrEquipSeal(item.id, item.price);
                      }}
                      disabled={!canAfford}
                      className="px-2.5 py-1 text-xs font-bold rounded bg-[#f59e0b] hover:bg-[#d97706] text-[#121110] disabled:opacity-40 cursor-pointer"
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
