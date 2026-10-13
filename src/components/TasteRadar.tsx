import React from 'react';
import { CurrentCupState } from '../types/boba';

interface TasteRadarProps {
  cupState: CurrentCupState;
}

export const TasteRadar: React.FC<TasteRadarProps> = ({ cupState }) => {
  // Compute flavor scores based on active ingredients
  let teaStrength = 0;
  if (cupState.teaVolume > 0) {
    teaStrength = Math.min(5, Math.round((cupState.teaVolume / 20)));
    if (cupState.tea === 'ceremonial_matcha' || cupState.tea === 'roasted_oolong') teaStrength = Math.min(5, teaStrength + 1);
  }

  const sweetness = Math.min(5, Math.max(0, Math.round(cupState.sweetness / 20)));
  
  let creaminess = 0;
  if (cupState.milkVolume > 0 && cupState.milk !== 'none') {
    creaminess = Math.min(5, Math.round((cupState.milkVolume / 20)));
  }
  if (cupState.hasCheeseFoam) creaminess = Math.min(5, creaminess + 2);

  let chewiness = 0;
  const totalToppings = Object.values(cupState.toppingCounts).reduce((a, b) => a + b, 0);
  chewiness = Math.min(5, Math.round(totalToppings / 3));

  const totalVolume = Math.min(100, cupState.teaVolume + cupState.milkVolume);

  return (
    <div className="bg-[#1c1815] border border-[#2d251f] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs text-[#a89f91]">
        <span className="font-semibold uppercase tracking-wider text-[#d4af37]">Flavor Signature</span>
        <span className="font-mono tabular-nums">{totalVolume}% Filled</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <div className="flex justify-between text-[#d6cec3] mb-1">
            <span>Tea Aroma</span>
            <span className="font-mono font-medium">{teaStrength}/5</span>
          </div>
          <div className="h-1.5 w-full bg-[#29221b] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(teaStrength / 5) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#d6cec3] mb-1">
            <span>Sweetness</span>
            <span className="font-mono font-medium">{sweetness}/5</span>
          </div>
          <div className="h-1.5 w-full bg-[#29221b] rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${(sweetness / 5) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#d6cec3] mb-1">
            <span>Creaminess</span>
            <span className="font-mono font-medium">{creaminess}/5</span>
          </div>
          <div className="h-1.5 w-full bg-[#29221b] rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-300 rounded-full transition-all duration-300"
              style={{ width: `${(creaminess / 5) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#d6cec3] mb-1">
            <span>Chewiness (QQ)</span>
            <span className="font-mono font-medium">{chewiness}/5</span>
          </div>
          <div className="h-1.5 w-full bg-[#29221b] rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-400 rounded-full transition-all duration-300"
              style={{ width: `${(chewiness / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
