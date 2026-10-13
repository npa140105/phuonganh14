import React, { useState } from 'react';
import { InventoryItem } from '../../types/posBom';
import { X, Phone, Copy, Check, ShoppingBag, Truck, CheckCircle2, ChevronRight } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  inventory: Record<string, InventoryItem>;
  onReceiveItems: (itemsToRestock: Array<{ ingredientId: string; amount: number; supplier: string }>) => void;
  onClose: () => void;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  inventory,
  onReceiveItems,
  onClose
}) => {
  const [copiedSupplier, setCopiedSupplier] = useState<string | null>(null);
  const [receivedSupplier, setReceivedSupplier] = useState<string | null>(null);

  // Find all items below or equal to safe stock threshold (or low)
  const lowItems = Object.values(inventory).filter(
    (item) => item.currentStock <= item.minStockThreshold
  );

  // Also include items if user wants to see all suppliers
  const [showAllItems, setShowAllItems] = useState(false);
  const targetItems = showAllItems ? Object.values(inventory) : lowItems;

  // Group items by supplier
  const supplierGroups = targetItems.reduce<Record<string, {
    supplier: string;
    phone?: string;
    contact?: string;
    items: Array<InventoryItem & { orderQty: number; estimatedCost: number }>;
  }>>((acc, item) => {
    const sName = item.supplier || '自選在地供應商';
    if (!acc[sName]) {
      acc[sName] = {
        supplier: sName,
        phone: item.supplierPhone,
        contact: item.supplierContactPerson,
        items: []
      };
    }
    const orderQty = item.reorderAmount || (item.capacity - item.currentStock) || 1000;
    const estimatedCost = Number((orderQty * item.unitCost).toFixed(2));
    acc[sName].items.push({
      ...item,
      orderQty,
      estimatedCost
    });
    return acc;
  }, {});

  if (!isOpen) return null;

  const totalProcurementCost = Object.values(supplierGroups).reduce(
    (sum, group) => sum + group.items.reduce((iSum, i) => iSum + i.estimatedCost, 0),
    0
  );

  const totalLinesCount = Object.values(supplierGroups).reduce(
    (sum, group) => sum + group.items.length,
    0
  );

  const handleCopySupplierPO = (sName: string, group: (typeof supplierGroups)[string]) => {
    sounds.playClick();
    const poText = `
【BobaFlow 12 門市採購叫貨單】
供應廠商：${sName}
叫貨電話：${group.phone || '無'}
負責窗口：${group.contact || '門市部'}
------------------------------------
叫貨項目與規格：
${group.items
  .map(
    (i) =>
      `• ${i.name}: ${i.orderQty.toLocaleString()} ${i.unit} (預估 $${i.estimatedCost.toFixed(2)})`
  )
  .join('\n')}
------------------------------------
合計預估費用：$${group.items
      .reduce((sum, i) => sum + i.estimatedCost, 0)
      .toFixed(2)}
請協助安排最近車次配送，送達請洽吧台點收，謝謝！
    `.trim();

    navigator.clipboard.writeText(poText).then(() => {
      setCopiedSupplier(sName);
      setTimeout(() => setCopiedSupplier(null), 2000);
    });
  };

  const handleReceiveSingleSupplier = (group: (typeof supplierGroups)[string]) => {
    sounds.playCashDrawer();
    const toRestock = group.items.map((i) => ({
      ingredientId: i.id,
      amount: i.orderQty,
      supplier: group.supplier
    }));
    onReceiveItems(toRestock);
    setReceivedSupplier(group.supplier);
    setTimeout(() => setReceivedSupplier(null), 2500);
  };

  const handleReceiveAll = () => {
    sounds.playCashDrawer();
    const allToRestock: Array<{ ingredientId: string; amount: number; supplier: string }> = [];
    Object.values(supplierGroups).forEach((group) => {
      group.items.forEach((i) => {
        allToRestock.push({
          ingredientId: i.id,
          amount: i.orderQty,
          supplier: group.supplier
        });
      });
    });
    onReceiveItems(allToRestock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#1a1715] text-[#f4efe8] rounded-2xl shadow-2xl border border-[#382f27] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#2d251f] bg-[#211c18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[#fbbf24]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f5ebd9] flex items-center gap-2">
                <span>自動生成採購叫貨單 (Purchase Orders)</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#2a221b] text-amber-300 border border-amber-500/30">
                  {totalLinesCount} 項待叫貨
                </span>
              </h2>
              <p className="text-xs text-[#8c7e70]">
                根據各原料安全存量水位與建議叫貨量，按供應商分類生成採購清單，支援一鍵複製與驗收入庫
              </p>
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

        {/* Filter Toggle Banner */}
        <div className="px-6 py-3 bg-[#161311] border-b border-[#26201a] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#a89f91]">篩選範圍：</span>
            <button
              onClick={() => {
                sounds.playClick();
                setShowAllItems(false);
              }}
              className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                !showAllItems
                  ? 'bg-[#2a221b] text-[#fbbf24] border-[#d97706]/40 font-bold'
                  : 'bg-[#1a1715] text-[#8c7e70] border-[#332b24]'
              }`}
            >
              僅低於安全水位 ({lowItems.length} 項)
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setShowAllItems(true);
              }}
              className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                showAllItems
                  ? 'bg-[#2a221b] text-[#fbbf24] border-[#d97706]/40 font-bold'
                  : 'bg-[#1a1715] text-[#8c7e70] border-[#332b24]'
              }`}
            >
              全部物料品項 ({Object.keys(inventory).length} 項)
            </button>
          </div>

          <div className="font-mono text-xs text-[#fbbf24]">
            總預估採購金額：<span className="font-bold text-sm">${totalProcurementCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Body Supplier Groups */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {Object.keys(supplierGroups).length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#f5ebd9]">全品項庫存充裕，無急需叫貨之原料！</h3>
              <p className="text-xs text-[#8c7e70] max-w-sm mx-auto">
                目前所有原物料在庫量均高於安全存量水位。若欲提前備貨，可點選上方「全部物料品項」檢視。
              </p>
            </div>
          ) : (
            Object.entries(supplierGroups).map(([sName, group]) => {
              const groupCost = group.items.reduce((s, i) => s + i.estimatedCost, 0);
              const isCopied = copiedSupplier === sName;
              const isReceived = receivedSupplier === sName;

              return (
                <div
                  key={sName}
                  className="rounded-xl border border-[#2e2620] bg-[#141210] overflow-hidden shadow-sm"
                >
                  {/* Supplier Box Header */}
                  <div className="p-4 bg-[#201a16] border-b border-[#2d251f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#fbbf24]" />
                        <h3 className="font-bold text-sm text-[#f5ebd9]">{sName}</h3>
                        {group.contact && (
                          <span className="text-[11px] text-[#8c7e70]">
                            (窗口: {group.contact})
                          </span>
                        )}
                      </div>

                      {group.phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-[#8c7e70] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            叫貨專線:
                          </span>
                          <a
                            href={`tel:${group.phone}`}
                            className="font-mono text-emerald-400 font-bold hover:underline"
                          >
                            {group.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions for this supplier */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopySupplierPO(sName, group)}
                        className="py-1.5 px-3 rounded-lg bg-[#2a221b] hover:bg-[#362c23] text-[#fbbf24] border border-[#d97706]/30 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="複製為文字訊息，直接貼到 LINE / 簡訊叫貨"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>已複製叫貨單</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>複製叫貨訊息</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReceiveSingleSupplier(group)}
                        disabled={isReceived}
                        className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isReceived ? '已驗收入庫 ✓' : '驗收此單入庫'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Items List Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-[#1a1715] text-[#8c7e70] uppercase font-bold text-[10px] border-b border-[#241e19]">
                        <tr>
                          <th className="py-2.5 px-4 font-sans">原物料品項</th>
                          <th className="py-2.5 px-3 text-right">目前庫存</th>
                          <th className="py-2.5 px-3 text-right">安全水位</th>
                          <th className="py-2.5 px-3 text-right text-[#fbbf24]">建議叫貨量</th>
                          <th className="py-2.5 px-3 text-right">採購單價</th>
                          <th className="py-2.5 px-4 text-right">小計金額</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#201a16]">
                        {group.items.map((i) => (
                          <tr key={i.id} className="hover:bg-[#1a1715]">
                            <td className="py-2 px-4 font-sans font-medium text-[#f4efe8]">
                              {i.name}
                            </td>
                            <td className="py-2 px-3 text-right text-rose-400">
                              {i.currentStock.toLocaleString()} {i.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-[#8c7e70]">
                              {i.minStockThreshold.toLocaleString()} {i.unit}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-[#fbbf24]">
                              +{i.orderQty.toLocaleString()} {i.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-[#a89f91]">
                              ${i.unitCost} / {i.unit}
                            </td>
                            <td className="py-2 px-4 text-right font-bold text-amber-400">
                              ${i.estimatedCost.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-[#1a1715] border-t border-[#241e19] font-bold">
                        <tr>
                          <td colSpan={5} className="py-2.5 px-4 text-right text-[#8c7e70] font-sans">
                            該廠商叫貨小計：
                          </td>
                          <td className="py-2.5 px-4 text-right text-sm text-[#fbbf24]">
                            ${groupCost.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2d251f] bg-[#211c18] flex items-center justify-between gap-4">
          <div className="text-xs font-mono">
            <span className="text-[#8c7e70]">合計共 </span>
            <span className="font-bold text-[#fbbf24]">{Object.keys(supplierGroups).length}</span>
            <span className="text-[#8c7e70]"> 家廠商 · </span>
            <span className="font-bold text-[#fbbf24]">{totalLinesCount}</span>
            <span className="text-[#8c7e70]"> 項原物料</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl bg-[#261f1a] hover:bg-[#322a23] text-[#a89f91] text-xs font-semibold transition-colors cursor-pointer"
            >
              關閉
            </button>

            {totalLinesCount > 0 && (
              <button
                type="button"
                onClick={handleReceiveAll}
                className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>全部採購驗收入庫 (${totalProcurementCost.toFixed(2)})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
