import React, { useState, useRef } from 'react';
import {
  BobaRecipe,
  CurrentCupState,
  CupType,
  IceLevel,
  MilkType,
  SealDesign,
  StrawType,
  SweetenerType,
  SweetnessLevel,
  TeaType,
  ToppingType
} from '../types/boba';
import { BobaPhysicsCanvas } from './BobaPhysicsCanvas';
import { TasteRadar } from './TasteRadar';
import {
  TEA_CATALOG,
  MILK_CATALOG,
  SWEETENER_CATALOG,
  TOPPING_CATALOG
} from '../data/bobaData';
import { sounds } from '../services/soundEffects';
import {
  Flame,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  BookmarkPlus,
  Play
} from 'lucide-react';

interface CraftingStudioProps {
  cupState: CurrentCupState;
  onUpdateCup: (updater: (prev: CurrentCupState) => CurrentCupState) => void;
  onResetCup: () => void;
  onSaveCustomRecipe?: (name: string, description: string) => void;
  customRecipes?: BobaRecipe[];
  onBrewCustomRecipe?: (recipe: BobaRecipe) => void;
  onDeleteCustomRecipe?: (id: string) => void;
}

export const CraftingStudio: React.FC<CraftingStudioProps> = ({
  cupState,
  onUpdateCup,
  onResetCup,
  onSaveCustomRecipe,
  customRecipes = [],
  onBrewCustomRecipe,
  onDeleteCustomRecipe
}) => {
  const [activeCategory, setActiveCategory] = useState<'tea' | 'milk' | 'sweet' | 'my_menu'>('tea');
  const [isPouring, setIsPouring] = useState(false);
  const [pouringColor, setPouringColor] = useState('#8b3a1a');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [tastingNote, setTastingNote] = useState<string | null>(null);

  const pourIntervalRef = useRef<number | null>(null);

  // Helper: Pour tea or milk continuously
  const startPouring = (type: 'tea' | 'milk', id: string, color: string) => {
    sounds.playPourSound();
    setIsPouring(true);
    setPouringColor(color);

    if (type === 'tea') {
      onUpdateCup((prev) => ({
        ...prev,
        tea: id as TeaType,
        teaVolume: Math.min(100 - prev.milkVolume, prev.teaVolume + 15)
      }));
    } else {
      onUpdateCup((prev) => ({
        ...prev,
        milk: id as MilkType,
        milkVolume: Math.min(100 - prev.teaVolume, prev.milkVolume + 15)
      }));
    }

    pourIntervalRef.current = window.setInterval(() => {
      sounds.playPourSound();
      if (type === 'tea') {
        onUpdateCup((prev) => ({
          ...prev,
          tea: id as TeaType,
          teaVolume: Math.min(100 - prev.milkVolume, prev.teaVolume + 6)
        }));
      } else {
        onUpdateCup((prev) => ({
          ...prev,
          milk: id as MilkType,
          milkVolume: Math.min(100 - prev.teaVolume, prev.milkVolume + 6)
        }));
      }
    }, 150);
  };

  const stopPouring = () => {
    setIsPouring(false);
    if (pourIntervalRef.current) {
      clearInterval(pourIntervalRef.current);
      pourIntervalRef.current = null;
    }
  };

  // Add a topping
  const handleAddTopping = (topping: ToppingType) => {
    if (cupState.isSealed) return;
    sounds.playBobaDrop();
    onUpdateCup((prev) => {
      const current = prev.toppingCounts[topping] || 0;
      if (current >= 18) return prev;
      return {
        ...prev,
        toppings: prev.toppings.includes(topping) ? prev.toppings : [...prev.toppings, topping],
        toppingCounts: {
          ...prev.toppingCounts,
          [topping]: current + 3
        }
      };
    });
  };

  // Add ice
  const handleSetIce = (level: IceLevel) => {
    sounds.playIceClink();
    const countMap: Record<IceLevel, number> = {
      0: 0,
      30: 3,
      70: 6,
      100: 9
    };
    onUpdateCup((prev) => ({
      ...prev,
      iceLevel: level,
      iceCubesCount: countMap[level]
    }));
  };

  // Set sweetness & sweetener
  const handleSetSweetness = (level: SweetnessLevel, syrup: SweetenerType) => {
    sounds.playClick();
    onUpdateCup((prev) => ({
      ...prev,
      sweetness: level,
      sweetener: syrup
    }));
  };

  // Shake cup
  const handleShake = () => {
    sounds.playShake();
    onUpdateCup((prev) => ({
      ...prev,
      shakenProgress: Math.min(100, prev.shakenProgress + 35)
    }));
  };

  // Add Cheese Foam
  const handleToggleCheeseFoam = () => {
    sounds.playClick();
    onUpdateCup((prev) => ({
      ...prev,
      hasCheeseFoam: !prev.hasCheeseFoam
    }));
  };

  // Torch the cheese foam
  const handleTorch = () => {
    if (!cupState.hasCheeseFoam) return;
    sounds.playTorchFlame();
    onUpdateCup((prev) => ({
      ...prev,
      isTorched: true
    }));
  };

  // Heat seal cup
  const handleSealCup = () => {
    sounds.playSealSound();
    onUpdateCup((prev) => ({
      ...prev,
      isSealed: true
    }));
  };

  // Puncture straw
  const handlePunctureStraw = () => {
    sounds.playStrawPop();
    onUpdateCup((prev) => ({
      ...prev,
      isStrawPunctured: true
    }));
  };

  // Slurp drink
  const handleSlurp = () => {
    sounds.playSlurp();
    const critiques = [
      'Exceptional silky mouthfeel with prominent roasted notes!',
      'Chewy QQ pearls with decadent brown sugar sweetness!',
      'Refreshing floral jasmine undertones and balanced creaminess.',
      'A masterpiece blend worthy of the BobaFlow 12 codex!'
    ];
    setTastingNote(critiques[Math.floor(Math.random() * critiques.length)]);
  };

  // Save recipe
  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    sounds.playTipChime();
    onSaveCustomRecipe?.(customName, customDesc || 'Handcrafted signature drink');
    setSaveModalOpen(false);
    setCustomName('');
    setCustomDesc('');
  };

  const totalVolume = Math.min(100, cupState.teaVolume + cupState.milkVolume);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2d251f] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f5ebd9] font-display">
            Artisan Crafting Studio
          </h1>
          <p className="text-xs text-[#a89f91] mt-0.5">
            Pour fresh loose-leaf tea, blend velvety milks, and drop warm chewy toppings with real-time physics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onResetCup();
              setTastingNote(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#d6cec3] bg-[#241e19] hover:bg-[#332a23] border border-[#382f27] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>New Cup</span>
          </button>

          <button
            onClick={() => setSaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-[#161413] bg-[#f59e0b] hover:bg-[#d97706] transition-colors shadow-sm"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Save Custom Recipe</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Liquid & Tea Stations (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Station category tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#1a1715] border border-[#2d251f] rounded-lg">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveCategory('tea');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeCategory === 'tea'
                  ? 'bg-[#2b221a] text-[#fbbf24] shadow-sm'
                  : 'text-[#a89f91] hover:text-[#f4efe8]'
              }`}
            >
              Fresh Teas
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveCategory('milk');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeCategory === 'milk'
                  ? 'bg-[#2b221a] text-[#fbbf24] shadow-sm'
                  : 'text-[#a89f91] hover:text-[#f4efe8]'
              }`}
            >
              Milks
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveCategory('sweet');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeCategory === 'sweet'
                  ? 'bg-[#2b221a] text-[#fbbf24] shadow-sm'
                  : 'text-[#a89f91] hover:text-[#f4efe8]'
              }`}
            >
              Syrups & Ice
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveCategory('my_menu');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeCategory === 'my_menu'
                  ? 'bg-[#2b221a] text-[#fbbf24] shadow-sm'
                  : 'text-[#a89f91] hover:text-[#f4efe8]'
              }`}
            >
              My Menu ({customRecipes.length})
            </button>
          </div>

          {/* Tab 1: Fresh Teas */}
          {activeCategory === 'tea' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#a89f91]">
                <span>Hold button to stream tea</span>
                <span className="font-mono tabular-nums">Tea: {cupState.teaVolume}%</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(TEA_CATALOG) as TeaType[]).map((teaKey) => {
                  const tea = TEA_CATALOG[teaKey];
                  const isSelected = cupState.tea === teaKey;
                  return (
                    <button
                      key={tea.id}
                      onMouseDown={() => startPouring('tea', tea.id, tea.color)}
                      onMouseUp={stopPouring}
                      onMouseLeave={stopPouring}
                      onTouchStart={() => startPouring('tea', tea.id, tea.color)}
                      onTouchEnd={stopPouring}
                      disabled={cupState.isSealed || totalVolume >= 100}
                      className={`w-full p-3 rounded-xl border text-left transition-all relative overflow-hidden group select-none ${
                        isSelected
                          ? 'border-[#f59e0b] bg-[#221c17]'
                          : 'border-[#2d251f] bg-[#1a1715] hover:border-[#453930]'
                      } ${cupState.isSealed || totalVolume >= 100 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-sm"
                            style={{ backgroundColor: tea.color }}
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#f5ebd9] block">
                              {tea.name}
                            </span>
                            <span className="text-[11px] text-[#a89f91] block">
                              {tea.origin}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-[#fbbf24] px-2 py-0.5 rounded bg-[#2a221b]">
                          POUR ▾
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Milks */}
          {activeCategory === 'milk' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#a89f91]">
                <span>Hold button to steam & stream milk</span>
                <span className="font-mono tabular-nums">Milk: {cupState.milkVolume}%</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(MILK_CATALOG) as MilkType[])
                  .filter((m) => m !== 'none')
                  .map((milkKey) => {
                    const milk = MILK_CATALOG[milkKey];
                    const isSelected = cupState.milk === milkKey;
                    return (
                      <button
                        key={milk.id}
                        onMouseDown={() => startPouring('milk', milk.id, milk.color)}
                        onMouseUp={stopPouring}
                        onMouseLeave={stopPouring}
                        onTouchStart={() => startPouring('milk', milk.id, milk.color)}
                        onTouchEnd={stopPouring}
                        disabled={cupState.isSealed || totalVolume >= 100}
                        className={`w-full p-3 rounded-xl border text-left transition-all relative overflow-hidden select-none ${
                          isSelected
                            ? 'border-[#f59e0b] bg-[#221c17]'
                            : 'border-[#2d251f] bg-[#1a1715] hover:border-[#453930]'
                        } ${cupState.isSealed || totalVolume >= 100 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20"
                              style={{ backgroundColor: milk.color }}
                            />
                            <div>
                              <span className="text-xs font-semibold text-[#f5ebd9] block">
                                {milk.name}
                              </span>
                              <span className="text-[11px] text-[#a89f91] block line-clamp-1">
                                {milk.description}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-[#fbbf24] px-2 py-0.5 rounded bg-[#2a221b]">
                            POUR ▾
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Tab 3: Syrups & Ice */}
          {activeCategory === 'sweet' && (
            <div className="space-y-4">
              {/* Sweetener choice */}
              <div>
                <label className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider block mb-2">
                  Artisan Syrup
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(SWEETENER_CATALOG) as SweetenerType[])
                    .filter((s) => s !== 'none')
                    .map((syrupKey) => {
                      const syrup = SWEETENER_CATALOG[syrupKey];
                      const isSelected = cupState.sweetener === syrupKey;
                      return (
                        <button
                          key={syrup.id}
                          onClick={() => handleSetSweetness(cupState.sweetness || 70, syrupKey)}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                            isSelected
                              ? 'border-[#f59e0b] bg-[#241c16] text-[#fbbf24]'
                              : 'border-[#2d251f] bg-[#1a1715] text-[#d6cec3] hover:border-[#453930]'
                          }`}
                        >
                          <span className="font-semibold block truncate">{syrup.name}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Sweetness Percentage Slider / Buttons */}
              <div>
                <div className="flex justify-between text-xs text-[#a89f91] mb-2">
                  <span className="font-semibold text-[#d4af37] uppercase tracking-wider">Sugar Level</span>
                  <span className="font-mono font-semibold text-[#f5ebd9]">{cupState.sweetness}%</span>
                </div>
                <div className="grid grid-cols-5 gap-1 p-1 bg-[#1a1715] border border-[#2d251f] rounded-lg">
                  {([0, 30, 50, 70, 100] as SweetnessLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleSetSweetness(lvl, cupState.sweetener || 'cane_sugar')}
                      className={`py-1.5 text-xs font-mono font-medium rounded transition-colors ${
                        cupState.sweetness === lvl
                          ? 'bg-[#f59e0b] text-[#121110] font-bold'
                          : 'text-[#a89f91] hover:text-[#f4efe8]'
                      }`}
                    >
                      {lvl}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Ice Level */}
              <div>
                <div className="flex justify-between text-xs text-[#a89f91] mb-2">
                  <span className="font-semibold text-[#d4af37] uppercase tracking-wider">Ice Cubes</span>
                  <span className="font-mono font-semibold text-[#f5ebd9]">{cupState.iceLevel}% Ice</span>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#1a1715] border border-[#2d251f] rounded-lg">
                  {([
                    { lvl: 0, label: '0% None' },
                    { lvl: 30, label: '30% Light' },
                    { lvl: 70, label: '70% Reg' },
                    { lvl: 100, label: '100% Full' }
                  ] as { lvl: IceLevel; label: string }[]).map((item) => (
                    <button
                      key={item.lvl}
                      onClick={() => handleSetIce(item.lvl)}
                      className={`py-1.5 text-xs font-mono font-medium rounded transition-colors ${
                        cupState.iceLevel === item.lvl
                          ? 'bg-[#38bdf8] text-[#0c2331] font-bold'
                          : 'text-[#a89f91] hover:text-[#f4efe8]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: My Custom Menu */}
          {activeCategory === 'my_menu' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#a89f91]">
                <span>Saved Signature Recipes</span>
                <span className="font-mono tabular-nums">{customRecipes.length} Drinks</span>
              </div>

              {customRecipes.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#1a1715] border border-[#2d251f] text-center space-y-2">
                  <BookmarkPlus className="w-8 h-8 text-[#d97706]/60 mx-auto" />
                  <h4 className="text-xs font-bold text-[#f5ebd9]">No Custom Drinks Yet</h4>
                  <p className="text-[11px] text-[#8c7e70] leading-relaxed">
                    Craft your unique tea ratios, toppings, and sweetness, then tap "Save Custom Recipe" above to store your creations!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {customRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="p-3 rounded-xl border border-[#2d251f] bg-[#1a1715] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-[#f5ebd9]">{recipe.name}</h4>
                          <p className="text-[11px] text-[#8c7e70] line-clamp-1">{recipe.tagline}</p>
                        </div>
                        {onDeleteCustomRecipe && (
                          <button
                            onClick={() => {
                              sounds.playClick();
                              onDeleteCustomRecipe(recipe.id);
                            }}
                            className="text-[10px] text-rose-400 hover:text-rose-300 px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-900/30"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-[#a89f91] flex items-center justify-between pt-1 border-t border-[#241e19]">
                        <span>{recipe.tea.replace('_', ' ')} · {recipe.recommendedSweetness}% S</span>
                        <button
                          onClick={() => {
                            sounds.playClick();
                            onBrewCustomRecipe?.(recipe);
                          }}
                          className="px-2 py-0.5 rounded text-[#161413] bg-[#f59e0b] hover:bg-[#d97706] font-bold"
                        >
                          Brew
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Flavor signature card */}
          <TasteRadar cupState={cupState} />
        </div>

        {/* Center Column: Physics Canvas Cup & Shaker Stage (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="relative w-full flex flex-col items-center bg-gradient-to-b from-[#1a1715] via-[#141211] to-[#100e0d] border border-[#2e2620] rounded-2xl p-4 shadow-xl">
            {/* Top Bar status indicators */}
            <div className="w-full flex items-center justify-between text-xs text-[#8c7e70] px-2 mb-2 font-mono">
              <span>CUP CAPACITY</span>
              <span className={totalVolume >= 100 ? 'text-rose-400 font-bold' : 'text-[#fbbf24]'}>
                {totalVolume}% / 100%
              </span>
            </div>

            {/* Canvas */}
            <BobaPhysicsCanvas
              cupState={cupState}
              isPouring={isPouring}
              pouringColor={pouringColor}
              onPunctureStraw={handlePunctureStraw}
              onSlurp={handleSlurp}
            />

            {/* Interaction controls under the cup */}
            <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#29221b]">
              <button
                onClick={handleShake}
                disabled={cupState.isSealed}
                className="py-2 px-3 rounded-lg text-xs font-semibold bg-[#26201b] hover:bg-[#362d26] text-[#f4efe8] border border-[#3d3229] transition-all active:scale-95 disabled:opacity-50"
              >
                🌪️ Shake Cup ({cupState.shakenProgress}%)
              </button>

              <button
                onClick={handleToggleCheeseFoam}
                disabled={cupState.isSealed}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                  cupState.hasCheeseFoam
                    ? 'bg-[#fef3c7] text-[#78350f] border-[#fde68a]'
                    : 'bg-[#26201b] hover:bg-[#362d26] text-[#f4efe8] border-[#3d3229]'
                }`}
              >
                ☁️ Salted Foam {cupState.hasCheeseFoam ? 'ON' : 'OFF'}
              </button>
            </div>

            {cupState.hasCheeseFoam && !cupState.isSealed && (
              <button
                onClick={handleTorch}
                disabled={cupState.isTorched}
                className={`w-full mt-2 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  cupState.isTorched
                    ? 'bg-[#451a03] text-[#fde047] border-[#78350f]'
                    : 'bg-gradient-to-r from-amber-600 to-rose-600 text-white border-transparent hover:brightness-110 active:scale-95'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{cupState.isTorched ? 'Torched Crème Brûlée (Crisp)' : 'Torch Foam (Culinary Flame)'}</span>
              </button>
            )}

            {/* Tasting Note Banner if sampled */}
            {tastingNote && (
              <div className="w-full mt-3 p-2.5 rounded-lg bg-[#27201a] border border-[#d97706]/30 text-xs text-[#fbbf24] text-center italic">
                “{tastingNote}”
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chewy Toppings & Finishing Bar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Toppings Station */}
          <div className="bg-[#191614] border border-[#2d251f] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#d4af37] uppercase tracking-wider">
                Toppings Bar (Click to Drop)
              </span>
              <span className="text-[#a89f91] font-mono">
                {Object.values(cupState.toppingCounts).reduce((a, b) => a + b, 0)} items
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(TOPPING_CATALOG) as ToppingType[])
                .filter((t) => t !== 'cheese_foam')
                .map((toppingKey) => {
                  const topping = TOPPING_CATALOG[toppingKey];
                  const count = cupState.toppingCounts[toppingKey] || 0;
                  return (
                    <button
                      key={topping.id}
                      onClick={() => handleAddTopping(toppingKey)}
                      disabled={cupState.isSealed}
                      className="p-2.5 rounded-lg border border-[#2d251f] bg-[#1e1a17] hover:border-[#4b3e34] text-left transition-all flex items-center justify-between group active:scale-[0.98] disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-4 h-4 rounded-full border border-black/40 shadow-inner"
                          style={{ backgroundColor: topping.color }}
                        />
                        <div>
                          <span className="text-xs font-medium text-[#f5ebd9] block">
                            {topping.name}
                          </span>
                          <span className="text-[10px] text-[#a89f91] block line-clamp-1">
                            {topping.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-bold text-[#fbbf24] px-2 py-0.5 rounded bg-[#2a221b]">
                          +{count}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Sealing & Straw Station */}
          <div className="bg-[#191614] border border-[#2d251f] rounded-xl p-4 space-y-3">
            <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider block">
              Sealing & Finishing Station
            </span>

            {!cupState.isSealed ? (
              <button
                onClick={handleSealCup}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#f59e0b] hover:bg-[#d97706] text-[#121110] transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>🔥 Heat Seal Cup Lid</span>
              </button>
            ) : !cupState.isStrawPunctured ? (
              <button
                onClick={handlePunctureStraw}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-[#091a13] transition-colors flex items-center justify-center gap-2 animate-pulse shadow-md"
              >
                <span>⚡ Puncture Boba Straw (POP!)</span>
              </button>
            ) : (
              <button
                onClick={handleSlurp}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#29221b] hover:bg-[#382f26] text-[#fbbf24] border border-[#d97706]/40 transition-colors flex items-center justify-center gap-2"
              >
                <span>🥤 Slurp & Taste Profile</span>
              </button>
            )}

            <p className="text-[11px] text-[#8c7e70] leading-relaxed">
              {!cupState.isSealed
                ? 'Finish adding teas, milks, and pearls before sealing with the pneumatic heat sealer.'
                : !cupState.isStrawPunctured
                ? 'The cup is sealed tight! Puncture the plastic film with the wide angled straw to begin slurping.'
                : 'Cup is pierced and ready to serve or enjoy. Click the straw to test flavor balance!'}
            </p>
          </div>
        </div>
      </div>

      {/* Save Custom Recipe Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1815] border border-[#382e26] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-[#f5ebd9] font-display">
                Name Your Signature Creation
              </h3>
              <p className="text-xs text-[#a89f91] mt-1">
                Save this exact tea ratio, milk, sweetness, and toppings to your personal BobaFlow menu.
              </p>
            </div>

            <form onSubmit={handleConfirmSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#d6cec3] block mb-1">
                  Drink Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Lavender Boba Cloud"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#121110] border border-[#332a22] rounded-lg text-[#f4efe8] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#d6cec3] block mb-1">
                  Flavor Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Tasting notes and recommended time of day..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#121110] border border-[#332a22] rounded-lg text-[#f4efe8] focus:outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#a89f91] hover:text-[#f4efe8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-[#161413] bg-[#f59e0b] hover:bg-[#d97706] rounded-lg"
                >
                  Save to My Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
