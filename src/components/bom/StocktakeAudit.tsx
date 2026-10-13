import React, { useState } from 'react';
import { InventoryItem } from '../../types/posBom';
import { ClipboardCheck, RotateCcw, Save, AlertCircle, TrendingDown, TrendingUp, CheckCircle2, Search } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface StocktakeAuditProps {
  inventory: Record<string, InventoryItem>;
  onApplyStocktake: (adjustments: Array<{ ingredientId: string; newStock: number; variance: number; costVariance: number }>) => void;
}

export const StocktakeAudit: React.FC<StocktakeAuditProps> = ({
  inventory,
  onApplyStocktake
}) => {
  const [actualCounts, setActualCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    Object.values(inventory).forEach((item) => {
      initial[item.id] = item.currentStock;
    });
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'variance_only'>('all');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCountChange = (itemId: string, val: string) => {
    const num = parseInt(val, 10);
    setActualCounts((prev) => ({
      ...prev,
      [itemId]: isNaN(num) || num < 0 ? 0 : num
    }));
  };

  const handleResetToBook = () => {
    sounds.playClick();
    const reset: Record<string, number> = {};
    Object.values(inventory).forEach((item) => {
      reset[item.id] = item.currentStock;
    });
    setActualCounts(reset);
    setSavedSuccess(false);
  };

  // Compute variances
  const itemsWithVariance = Object.values(inventory).map((item) => {
    const actual = actualCounts[item.id] !== undefined ? actualCounts[item.id] : item.currentStock;
    const variance = actual - item.currentStock;
    const costVariance = Number((variance * item.unitCost).toFixed(2));
    return {
      item,
      actual,
      variance,
      costVariance
    };
  });

  const filteredItems = itemsWithVariance.filter(({ item, variance }) => {
    if (filterType === 'variance_only' && variance === 0) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.includes(q) ||
      (item.storageLocation && item.storageLocation.toLowerCase().includes(q))
    );
  });

  const totalGain = itemsWithVariance
    .filter((i) => i.costVariance > 0)
    .reduce((sum, i) => sum + i.costVariance, 0);

  const totalLoss = itemsWithVariance
    .filter((i) => i.costVariance < 0)
    .reduce((sum, i) => sum + Math.abs(i.costVariance), 0);

  const netVariance = totalGain - totalLoss;
  const varianceCount = itemsWithVariance.filter((i) => i.variance !== 0).length;

  const handleSaveAudit = () => {
    sounds.playCashDrawer();
    const adjustments = itemsWithVariance
      .filter((i) => i.variance !== 0)
      .map((i) => ({
        ingredientId: i.item.id,
        newStock: i.actual,
        variance: i.variance,
        costVariance: i.costVariance
      }));

    onApplyStocktake(adjustments);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Stocktake Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1a1715] p-4.5 rounded-xl border border-[#2d251f]">
        <div>
          <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-[#fbbf24]" />
            <span>實體庫存盤點與損益校正 (Physical Stocktake Audit)</span>
          </h2>
          <p className="text-xs text-[#8c7e70]">
            輸入吧台/倉庫實盤數量，系統自動計算盤差數量與盤損益金額，確認後一鍵校正實體庫存
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToBook}
            className="px-3 py-1.5 rounded-lg bg-[#251f1a] hover:bg-[#322a23] text-[#a89f91] hover:text-[#f4efe8] border border-[#382f27] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置為帳面庫存</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAudit}
            disabled={varianceCount === 0}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>確認盤點校正 ({varianceCount} 筆異動)</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>庫存盤點已成功入帳！系統在庫存量已同步校正為實盤數，並記錄至庫存異動日誌。</span>
        </div>
      )}

      {/* Variance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1a1715] border border-[#2e2620]">
          <div className="text-[11px] text-[#8c7e70] font-semibold">盤差品項數</div>
          <div className="text-xl font-bold font-mono text-[#fbbf24] mt-0.5">
            {varianceCount} <span className="text-xs text-[#8c7e70] font-normal">/ {Object.keys(inventory).length} 項</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a1715] border border-[#2e2620]">
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>盤盈金額 (Gain)</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            +${totalGain.toFixed(2)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a1715] border border-[#2e2620]">
          <div className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>盤虧損失 (Loss)</span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
            -${totalLoss.toFixed(2)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a1715] border border-[#2e2620]">
          <div className="text-[11px] text-[#f5ebd9] font-semibold">淨盤差損益 (Net)</div>
          <div className={`text-xl font-bold font-mono mt-0.5 ${netVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netVariance >= 0 ? `+$${netVariance.toFixed(2)}` : `-$${Math.abs(netVariance).toFixed(2)}`}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8c7e70] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋盤點原物料名稱、類別或擺放位置..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#1a1715] text-[#f4efe8] placeholder-[#78716c] rounded-xl border border-[#332b24] focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#2a221b] text-[#fbbf24] border-[#d97706]/40 font-bold'
                : 'bg-[#181513] text-[#a89f91] border-[#2b241e]'
            }`}
          >
            全部品項 ({itemsWithVariance.length})
          </button>
          <button
            onClick={() => setFilterType('variance_only')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filterType === 'variance_only'
                ? 'bg-[#2a221b] text-[#fbbf24] border-[#d97706]/40 font-bold'
                : 'bg-[#181513] text-[#a89f91] border-[#2b241e]'
            }`}
          >
            僅顯示有盤差 ({varianceCount})
          </button>
        </div>
      </div>

      {/* Stocktake Table */}
      <div className="bg-[#1a1715] rounded-xl border border-[#2d251f] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#211c18] border-b border-[#2d251f] text-[#8c7e70] uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-4 font-sans">原物料品項</th>
                <th className="py-3 px-3">擺放位置</th>
                <th className="py-3 px-3 font-mono text-right">帳面庫存量</th>
                <th className="py-3 px-4 font-mono text-center">實體盤點輸入</th>
                <th className="py-3 px-3 font-mono text-right">盤差數量</th>
                <th className="py-3 px-3 font-mono text-right">採購單價</th>
                <th className="py-3 px-4 font-mono text-right">盤損益金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26201a]">
              {filteredItems.map(({ item, actual, variance, costVariance }) => {
                const isLoss = variance < 0;
                const isGain = variance > 0;

                return (
                  <tr key={item.id} className="hover:bg-[#201a16] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#f5ebd9]">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-[#8c7e70] font-normal uppercase">
                        {item.category} · {item.supplier}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-[#a89f91] text-[11px]">
                      {item.storageLocation || '一般庫房'}
                    </td>

                    <td className="py-3 px-3 font-mono text-right text-[#c7bdb0] font-medium">
                      {item.currentStock.toLocaleString()} {item.unit}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          min="0"
                          value={actual}
                          onChange={(e) => handleCountChange(item.id, e.target.value)}
                          className="w-24 px-2 py-1 bg-[#141210] border border-[#382f27] focus:border-amber-500 rounded text-center text-[#fbbf24] font-bold text-xs focus:outline-none"
                        />
                        <span className="text-[10px] text-[#8c7e70]">{item.unit}</span>
                      </div>
                    </td>

                    <td className={`py-3 px-3 font-mono text-right font-bold ${
                      isLoss ? 'text-rose-400' : isGain ? 'text-emerald-400' : 'text-[#8c7e70]'
                    }`}>
                      {variance > 0 ? `+${variance.toLocaleString()}` : variance.toLocaleString()} {item.unit}
                    </td>

                    <td className="py-3 px-3 font-mono text-right text-[#8c7e70]">
                      ${item.unitCost}
                    </td>

                    <td className={`py-3 px-4 font-mono text-right font-bold ${
                      isLoss ? 'text-rose-400' : isGain ? 'text-emerald-400' : 'text-[#8c7e70]'
                    }`}>
                      {costVariance > 0 ? `+$${costVariance.toFixed(2)}` : costVariance < 0 ? `-$${Math.abs(costVariance).toFixed(2)}` : '$0.00'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
