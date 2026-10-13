import React, { useState } from 'react';
import {
  POSMenuItem,
  POSCartItem,
  DrinkSize,
  InventoryItem
} from '../../types/posBom';
import {
  TeaType,
  MilkType,
  SweetenerType,
  SweetnessLevel,
  IceLevel,
  ToppingType
} from '../../types/boba';
import { calculateDrinkBOM } from '../../data/posBomData';
import { X, Plus, Minus, Flame, Sparkles } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface POSCustomizerModalProps {
  item: POSMenuItem;
  inventory: Record<string, InventoryItem>;
  onAddToCart: (cartItem: POSCartItem) => void;
  onClose: () => void;
}

const MILK_OPTIONS: Array<{ id: MilkType; label: string; extraPrice: number }> = [
  { id: 'whole_milk', label: 'Organic Whole Milk', extraPrice: 0 },
  { id: 'oat_milk', label: 'Barista Oat Milk', extraPrice: 0.75 },
  { id: 'coconut_milk', label: 'Pressed Coconut', extraPrice: 0.5 },
  { id: 'condensed_milk', label: 'Condensed Milk', extraPrice: 0.5 },
  { id: 'none', label: 'No Milk (Pure Tea)', extraPrice: 0 }
];

const TOPPING_OPTIONS: Array<{ id: ToppingType; label: string; price: number; invKey: string }> = [
  { id: 'black_pearls', label: 'Brown Sugar Tapioca Pearls', price: 0.75, invKey: 'top_black_pearls' },
  { id: 'popping_boba', label: 'Mango Burst Popping Boba', price: 0.85, invKey: 'top_popping_boba' },
  { id: 'lychee_jelly', label: 'Crystal Lychee Jelly', price: 0.75, invKey: 'top_lychee_jelly' },
  { id: 'egg_pudding', label: 'Silken Egg Pudding', price: 0.9, invKey: 'top_egg_pudding' },
  { id: 'grass_jelly', label: 'Herbal Grass Jelly', price: 0.75, invKey: 'top_grass_jelly' },
  { id: 'cheese_foam', label: 'Salted Velvet Cheese Foam', price: 1.25, invKey: 'top_cheese_foam' }
];

export const POSCustomizerModal: React.FC<POSCustomizerModalProps> = ({
  item,
  inventory,
  onAddToCart,
  onClose
}) => {
  const [size, setSize] = useState<DrinkSize>('regular');
  const [sweetness, setSweetness] = useState<SweetnessLevel>(item.defaultSweetness);
  const [iceLevel, setIceLevel] = useState<IceLevel>(item.defaultIce);
  const [milk, setMilk] = useState<MilkType>(item.defaultMilk);
  const [selectedToppings, setSelectedToppings] = useState<ToppingType[]>([...item.defaultToppings]);
  const [requiresTorch, setRequiresTorch] = useState<boolean>(!!item.requiresTorch);
  const [quantity, setQuantity] = useState<number>(1);

  // Calculate pricing
  const sizeCost = size === 'large' ? 0.85 : 0;
  const milkCost = MILK_OPTIONS.find((m) => m.id === milk)?.extraPrice || 0;
  
  // Extra toppings cost (only toppings that weren't in default recipe count as surcharge)
  const extraToppingsCost = selectedToppings.reduce((sum, top) => {
    const isDefault = item.defaultToppings.includes(top);
    if (!isDefault) {
      const opt = TOPPING_OPTIONS.find((t) => t.id === top);
      return sum + (opt?.price || 0.75);
    }
    return sum;
  }, 0);

  const torchCost = requiresTorch && !item.requiresTorch ? 0.5 : 0;
  const singleUnitPrice = item.basePrice + sizeCost + milkCost + extraToppingsCost + torchCost;

  // Real-time BOM calculation for this exact custom drink
  const bomResult = calculateDrinkBOM(
    item.defaultTea,
    milk,
    item.defaultSweetener,
    sweetness,
    selectedToppings,
    size,
    selectedToppings.includes('cheese_foam') || !!item.requiresCheeseFoam,
    inventory
  );

  const singleCogs = bomResult.cogs;
  const marginPct = Number((((singleUnitPrice - singleCogs) / singleUnitPrice) * 100).toFixed(1));

  const toggleTopping = (top: ToppingType) => {
    sounds.playClick();
    setSelectedToppings((prev) =>
      prev.includes(top) ? prev.filter((t) => t !== top) : [...prev, top]
    );
  };

  const handleAdd = () => {
    sounds.playAddCart();
    const cartItem: POSCartItem = {
      cartItemId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: item.id,
      name: item.name,
      chineseName: item.chineseName,
      size,
      tea: item.defaultTea,
      milk,
      sweetener: item.defaultSweetener,
      sweetness,
      iceLevel,
      toppings: selectedToppings,
      requiresCheeseFoam: selectedToppings.includes('cheese_foam') || !!item.requiresCheeseFoam,
      requiresTorch,
      unitPrice: Number(singleUnitPrice.toFixed(2)),
      quantity,
      itemCogs: singleCogs,
      bomBreakdown: bomResult.breakdown
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1a1715] text-[#f4efe8] rounded-2xl shadow-2xl border border-[#382f27] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#2d251f] bg-[#211c18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner"
              style={{ backgroundColor: `${item.accentColor}30`, color: item.accentColor }}
            >
              🥤
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f5ebd9] flex items-center gap-2">
                {item.name}
                <span className="text-xs font-normal text-[#a89f91]">{item.chineseName}</span>
              </h2>
              <p className="text-xs text-[#8c7e70] line-clamp-1">{item.description}</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-[#a89f91] hover:text-white hover:bg-[#2d251f] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Size Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#a89f91]">
              Cup Size
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSize('regular');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  size === 'regular'
                    ? 'border-[#f59e0b] bg-[#2a2119] text-[#fbbf24] shadow-sm ring-1 ring-[#f59e0b]'
                    : 'border-[#332b24] bg-[#1d1916] text-[#c7bdb0] hover:border-[#4d4036]'
                }`}
              >
                <div className="font-semibold text-sm">Regular (500ml)</div>
                <div className="text-xs text-[#8c7e70]">Standard artisanal portion</div>
                <div className="text-xs font-mono font-bold mt-1 text-[#fbbf24]">
                  ${item.basePrice.toFixed(2)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSize('large');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  size === 'large'
                    ? 'border-[#f59e0b] bg-[#2a2119] text-[#fbbf24] shadow-sm ring-1 ring-[#f59e0b]'
                    : 'border-[#332b24] bg-[#1d1916] text-[#c7bdb0] hover:border-[#4d4036]'
                }`}
              >
                <div className="font-semibold text-sm">Large (700ml)</div>
                <div className="text-xs text-[#8c7e70]">+1.4x liquid & boba volume</div>
                <div className="text-xs font-mono font-bold mt-1 text-[#fbbf24]">
                  +${0.85.toFixed(2)} (${(item.basePrice + 0.85).toFixed(2)})
                </div>
              </button>
            </div>
          </div>

          {/* Ice Level */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-[#a89f91]">
                Ice Level
              </label>
              <span className="text-xs text-[#fbbf24] font-medium">{iceLevel}% Ice</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([100, 70, 30, 0] as IceLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIceLevel(lvl);
                  }}
                  className={`py-2 px-2 rounded-lg border text-center text-xs font-medium transition-all cursor-pointer ${
                    iceLevel === lvl
                      ? 'border-[#f59e0b] bg-[#2a2119] text-[#fbbf24]'
                      : 'border-[#332b24] bg-[#1d1916] text-[#a89f91] hover:text-[#f4efe8]'
                  }`}
                >
                  {lvl === 100 ? '100% (Regular)' : lvl === 70 ? '70% (Less)' : lvl === 30 ? '30% (Light)' : '0% (No Ice)'}
                </button>
              ))}
            </div>
          </div>

          {/* Sweetness Level */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-[#a89f91]">
                Sweetness Level
              </label>
              <span className="text-xs text-[#fbbf24] font-medium">{sweetness}% Sugar</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {([100, 70, 50, 30, 0] as SweetnessLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSweetness(lvl);
                  }}
                  className={`py-2 px-1 rounded-lg border text-center text-xs font-medium transition-all cursor-pointer ${
                    sweetness === lvl
                      ? 'border-[#f59e0b] bg-[#2a2119] text-[#fbbf24]'
                      : 'border-[#332b24] bg-[#1d1916] text-[#a89f91] hover:text-[#f4efe8]'
                  }`}
                >
                  {lvl}%
                </button>
              ))}
            </div>
          </div>

          {/* Dairy / Milk Alternative */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#a89f91]">
              Milk / Dairy Selection
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MILK_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setMilk(opt.id);
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    milk === opt.id
                      ? 'border-[#f59e0b] bg-[#2a2119] text-[#fbbf24]'
                      : 'border-[#332b24] bg-[#1d1916] text-[#a89f91] hover:text-[#f4efe8]'
                  }`}
                >
                  <div className="font-semibold text-xs">{opt.label}</div>
                  <div className="text-[10px] text-[#8c7e70]">
                    {opt.extraPrice > 0 ? `+$${opt.extraPrice.toFixed(2)}` : 'Standard'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Toppings Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#a89f91]">
              Artisanal Toppings
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TOPPING_OPTIONS.map((opt) => {
                const isSelected = selectedToppings.includes(opt.id);
                const isDefault = item.defaultToppings.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleTopping(opt.id)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#f59e0b] bg-[#2a2119] text-[#fbbf24]'
                        : 'border-[#332b24] bg-[#1d1916] text-[#a89f91] hover:text-[#f4efe8]'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-[#8c7e70] flex justify-between items-center mt-1">
                      <span>{isDefault ? 'Included' : `+$${opt.price.toFixed(2)}`}</span>
                      {isSelected && <span className="text-[#fbbf24]">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Torch Finish Option */}
          <div className="p-3 rounded-xl bg-[#231c17] border border-[#382f27] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-[#f5ebd9]">
                  Torched Crème Brûlée Caramelized Top
                </div>
                <div className="text-[11px] text-[#8c7e70]">
                  Adds crunchy blowtorched brown sugar crust
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playTorchFlame();
                setRequiresTorch(!requiresTorch);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                requiresTorch
                  ? 'bg-rose-900/60 text-rose-300 border-rose-600'
                  : 'bg-[#1b1715] text-[#8c7e70] border-[#382f27]'
              }`}
            >
              {requiresTorch ? 'Included ✓' : '+ $0.50'}
            </button>
          </div>

          {/* Real-Time BOM COGS & Margin Inspector */}
          <div className="p-3.5 rounded-xl bg-[#141210] border border-[#2b241e] text-xs font-mono space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#a89f91] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                Live BOM COGS Breakdown
              </span>
              <span className="text-emerald-400 font-bold">
                Margin: {marginPct}%
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#a89f91] pt-1">
              <div>
                <span className="text-[#8c7e70]">Retail: </span>
                <span className="text-[#f4efe8] font-bold">${singleUnitPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#8c7e70]">COGS Cost: </span>
                <span className="text-amber-400 font-bold">${singleCogs.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#8c7e70]">Gross Profit: </span>
                <span className="text-emerald-400 font-bold">
                  ${(singleUnitPrice - singleCogs).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#8c7e70]">BOM Items: </span>
                <span className="text-[#f4efe8]">{bomResult.breakdown.length} ingredients</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Quantity and Add Button */}
        <div className="p-4 border-t border-[#2d251f] bg-[#211c18] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a89f91]">Qty:</span>
            <div className="flex items-center border border-[#382f27] rounded-lg bg-[#191512]">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                className="p-2 text-[#a89f91] hover:text-[#f4efe8] transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-sm text-[#fbbf24]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setQuantity((q) => q + 1);
                }}
                className="p-2 text-[#a89f91] hover:text-[#f4efe8] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-[#8c7e70]">Order Line Total</div>
              <div className="text-base font-extrabold text-[#fbbf24] font-mono">
                ${(singleUnitPrice * quantity).toFixed(2)}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Add to Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
