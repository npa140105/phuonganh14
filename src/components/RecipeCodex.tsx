import React, { useState } from 'react';
import { BOBAFLOW_12_RECIPES, TEA_CATALOG, MILK_CATALOG, TOPPING_CATALOG } from '../data/bobaData';
import { BobaRecipe, CurrentCupState, ToppingType } from '../types/boba';
import { sounds } from '../services/soundEffects';
import { CheckCircle, Sparkles, BookOpen, Coffee, Flame } from 'lucide-react';

interface RecipeCodexProps {
  onBrewRecipe: (recipe: BobaRecipe) => void;
  masteredRecipes: string[];
}

export const RecipeCodex: React.FC<RecipeCodexProps> = ({
  onBrewRecipe,
  masteredRecipes
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<BobaRecipe>(BOBAFLOW_12_RECIPES[0]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2d251f] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#d4af37]">
              The BobaFlow 12 Codex
            </span>
            <span className="text-xs text-[#a89f91]">·</span>
            <span className="text-xs text-[#a89f91]">
              Mastered {masteredRecipes.length} of 12
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f5ebd9] font-display mt-0.5">
            The 12 Master Bubble Tea Blueprints
          </h1>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onBrewRecipe(selectedRecipe);
          }}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-[#f59e0b] hover:bg-[#d97706] text-[#121110] transition-colors shadow-md cursor-pointer"
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Brew #{String(selectedRecipe.codeNumber).padStart(2, '0')} in Studio</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recipe Catalog Grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BOBAFLOW_12_RECIPES.map((recipe) => {
            const isSelected = selectedRecipe.id === recipe.id;
            const isMastered = masteredRecipes.includes(recipe.id);

            return (
              <button
                key={recipe.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedRecipe(recipe);
                }}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'border-[#f59e0b] bg-[#241c16] shadow-lg'
                    : 'border-[#2d251f] bg-[#1a1715] hover:border-[#473b30]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#fbbf24] px-1.5 py-0.5 rounded bg-[#2e2319]">
                      #{String(recipe.codeNumber).padStart(2, '0')}
                    </span>
                    {recipe.chineseName && (
                      <span className="text-xs text-[#8c7e70] font-medium">
                        {recipe.chineseName}
                      </span>
                    )}
                  </div>
                  {isMastered && (
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Mastered</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#f5ebd9] group-hover:text-[#f59e0b] transition-colors leading-snug">
                  {recipe.name}
                </h3>
                <p className="text-xs text-[#a89f91] mt-1 line-clamp-2 leading-relaxed">
                  {recipe.tagline}
                </p>

                <div className="mt-3 pt-2.5 border-t border-[#29221b] flex items-center justify-between text-[11px] text-[#8c7e70]">
                  <span>{TEA_CATALOG[recipe.tea]?.name.split(' ')[0]} Tea</span>
                  <span className="font-mono text-[#fbbf24]">{recipe.difficulty}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Dossier of Selected Recipe (5 cols) */}
        <div className="lg:col-span-5 bg-[#1a1715] border border-[#2d251f] rounded-2xl p-6 space-y-5 sticky top-20 shadow-xl">
          <div className="border-b border-[#2d251f] pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#fbbf24]">
                RECIPE #{String(selectedRecipe.codeNumber).padStart(2, '0')}
              </span>
              <span className="text-xs text-[#a89f91] font-mono">
                {selectedRecipe.chineseName}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#f5ebd9] mt-1 font-display">
              {selectedRecipe.name}
            </h2>
            <p className="text-xs text-[#d6cec3] mt-2 leading-relaxed">
              {selectedRecipe.description}
            </p>
          </div>

          {/* Golden Specifications */}
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-semibold uppercase text-[#d4af37] tracking-wider block">
              Golden Specifications
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[#141211] border border-[#241e19]">
                <span className="text-[11px] text-[#8c7e70] block">Tea Base</span>
                <span className="font-semibold text-[#f5ebd9]">
                  {TEA_CATALOG[selectedRecipe.tea]?.name} ({selectedRecipe.teaRatio}%)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141211] border border-[#241e19]">
                <span className="text-[11px] text-[#8c7e70] block">Milk Component</span>
                <span className="font-semibold text-[#f5ebd9]">
                  {MILK_CATALOG[selectedRecipe.milk]?.name} ({selectedRecipe.milkRatio}%)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141211] border border-[#241e19]">
                <span className="text-[11px] text-[#8c7e70] block">Sugar Balance</span>
                <span className="font-semibold text-[#fbbf24]">
                  {selectedRecipe.recommendedSweetness}% Sweetness
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141211] border border-[#241e19]">
                <span className="text-[11px] text-[#8c7e70] block">Ice Level</span>
                <span className="font-semibold text-[#38bdf8]">
                  {selectedRecipe.recommendedIce}% Ice
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#141211] border border-[#241e19]">
              <span className="text-[11px] text-[#8c7e70] block mb-1">Required Toppings</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedRecipe.requiredToppings.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded bg-[#27201a] text-[#fbbf24] border border-[#d97706]/20"
                  >
                    {TOPPING_CATALOG[t]?.name.replace(/ \(.*\)/, '')}
                  </span>
                ))}
                {selectedRecipe.requiresCheeseFoam && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[#fef3c7] text-[#78350f]">
                    Salted Cheese Cap
                  </span>
                )}
                {selectedRecipe.requiresTorch && (
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    🔥 Brûlée Torched
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Flavor Profile breakdown */}
          <div className="space-y-2 text-xs pt-1">
            <span className="text-[11px] font-semibold uppercase text-[#d4af37] tracking-wider block">
              Tasting Profile
            </span>
            <div className="space-y-1.5">
              {Object.entries(selectedRecipe.flavorProfile).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize text-[#a89f91]">{key.replace(/([A-Z])/, ' $1')}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <span
                        key={dot}
                        className={`w-2 h-2 rounded-full ${
                          dot <= val ? 'bg-[#f59e0b]' : 'bg-[#29221b]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onBrewRecipe(selectedRecipe);
            }}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#f59e0b] hover:bg-[#d97706] text-[#121110] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Load Blueprint into Barista Cup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
