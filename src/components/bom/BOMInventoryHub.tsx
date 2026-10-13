import React, { useState, useMemo } from 'react';
import {
  InventoryItem,
  POSOrder,
  WasteRecord,
  InventoryCategory,
  UnitType
} from '../../types/posBom';
import { POS_MENU_ITEMS, generateMasterBOMMatrix, calculateDrinkBOM } from '../../data/posBomData';
import { InventoryItemModal } from './InventoryItemModal';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { StocktakeAudit } from './StocktakeAudit';
import { StockMovementsLogView } from './StockMovementsLogView';
import { MaterialQRModal } from './MaterialQRModal';
import { MaterialQRHubModal } from './MaterialQRHubModal';
import {
  Layers,
  Boxes,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Calculator,
  Plus,
  Phone,
  Edit3,
  MapPin,
  User,
  Search,
  Copy,
  Check,
  PackagePlus,
  PhoneCall,
  ClipboardCheck,
  History,
  FileSpreadsheet,
  ShoppingBag,
  QrCode,
  Scan
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { TeaType, MilkType, SweetenerType, ToppingType } from '../../types/boba';
import { StockMovementLog } from '../../types/posBom';

interface BOMInventoryHubProps {
  inventory: Record<string, InventoryItem>;
  orders: POSOrder[];
  wasteLogs: WasteRecord[];
  movementLogs: StockMovementLog[];
  onUpdateInventoryStock: (ingredientId: string, newStock: number) => void;
  onRestockItem: (ingredientId: string, amount: number) => void;
  onBulkRestockCategory: (category: InventoryCategory) => void;
  onUpdateUnitCost: (ingredientId: string, newUnitCost: number) => void;
  onLogWaste: (waste: WasteRecord) => void;
  onSaveInventoryItem: (item: InventoryItem) => void;
  onDeleteInventoryItem?: (itemId: string) => void;
  onApplyStocktake: (adjustments: Array<{ ingredientId: string; newStock: number; variance: number; costVariance: number }>) => void;
  onReceivePurchaseOrder: (itemsToRestock: Array<{ ingredientId: string; amount: number; supplier: string }>) => void;
  initialTab?: 'warehouse' | 'stocktake' | 'movements' | 'matrix' | 'analytics' | 'calculator' | 'waste';
}

export const BOMInventoryHub: React.FC<BOMInventoryHubProps> = ({
  inventory,
  orders,
  wasteLogs,
  movementLogs,
  onRestockItem,
  onBulkRestockCategory,
  onUpdateUnitCost,
  onLogWaste,
  onSaveInventoryItem,
  onDeleteInventoryItem,
  onApplyStocktake,
  onReceivePurchaseOrder,
  initialTab = 'warehouse'
}) => {
  // Default to 'warehouse' or passed initialTab
  const [activeTab, setActiveTab] = useState<'warehouse' | 'stocktake' | 'movements' | 'matrix' | 'analytics' | 'calculator' | 'waste'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');
  const [warehouseSearch, setWarehouseSearch] = useState<string>('');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Item Creation / Edit Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<InventoryItem | null>(null);

  // Purchase Order Modal State
  const [isPOModalOpen, setIsPOModalOpen] = useState<boolean>(false);

  // QR Modal States
  const [isQRHubOpen, setIsQRHubOpen] = useState<boolean>(false);
  const [selectedItemForQR, setSelectedItemForQR] = useState<InventoryItem | null>(null);

  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [tempCostInput, setTempCostInput] = useState<string>('');

  // Sandbox Calculator State
  const [calcTea, setCalcTea] = useState<TeaType>('assam_black');
  const [calcMilk, setCalcMilk] = useState<MilkType>('whole_milk');
  const [calcSweetener, setCalcSweetener] = useState<SweetenerType>('brown_sugar');
  const [calcSweetness, setCalcSweetness] = useState<number>(70);
  const [calcToppings, setCalcToppings] = useState<ToppingType[]>(['black_pearls']);
  const [calcSize, setCalcSize] = useState<'regular' | 'large'>('regular');
  const [calcTargetMargin, setCalcTargetMargin] = useState<number>(75);

  // Waste Log modal state
  const [wasteIngredientId, setWasteIngredientId] = useState<string>('tea_assam');
  const [wasteQuantity, setWasteQuantity] = useState<number>(500);
  const [wasteReason, setWasteReason] = useState<WasteRecord['reason']>('expired');

  // Master BOM calculation for all 12 menu items
  const masterMatrix = generateMasterBOMMatrix(POS_MENU_ITEMS, inventory);

  // Financial KPIs from actual POS orders
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCogs = orders.reduce((sum, o) => sum + o.totalCogs, 0);
  const totalGrossProfit = totalRevenue - totalCogs;
  const avgMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  const totalCupsSold = orders.reduce((sum, o) => sum + o.itemCount, 0);
  const totalWasteLoss = wasteLogs.reduce((sum, w) => sum + w.costLoss, 0);

  // Items count below threshold
  const lowStockCount = Object.values(inventory).filter(
    (i) => i.currentStock <= i.minStockThreshold
  ).length;

  // Sandbox BOM Calculation
  const sandboxBOM = calculateDrinkBOM(
    calcTea,
    calcMilk,
    calcSweetener,
    calcSweetness,
    calcToppings,
    calcSize,
    calcToppings.includes('cheese_foam'),
    inventory
  );
  const suggestedPrice =
    calcTargetMargin < 100
      ? sandboxBOM.cogs / (1 - calcTargetMargin / 100)
      : sandboxBOM.cogs;

  const handleStartEditCost = (id: string, currentCost: number) => {
    sounds.playClick();
    setEditingCostId(id);
    setTempCostInput(currentCost.toString());
  };

  const handleSaveCost = (id: string) => {
    sounds.playClick();
    const parsed = parseFloat(tempCostInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateUnitCost(id, parsed);
    }
    setEditingCostId(null);
  };

  const handleAddWasteRecord = () => {
    sounds.playClick();
    const item = inventory[wasteIngredientId];
    if (!item) return;

    const costLoss = Number((wasteQuantity * item.unitCost).toFixed(2));
    const newRecord: WasteRecord = {
      id: `waste_${Date.now()}`,
      timestamp: Date.now(),
      ingredientId: item.id,
      ingredientName: item.name,
      quantity: wasteQuantity,
      unit: item.unit,
      costLoss,
      reason: wasteReason
    };

    onLogWaste(newRecord);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* BOM Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d251f] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#f5ebd9] tracking-tight font-display flex items-center gap-2.5">
            <span>Bill of Materials (BOM) &amp; Inventory Hub</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#2a221b] text-[#fbbf24] border border-[#d97706]/20">
              Operations Control
            </span>
          </h1>
          <p className="text-xs text-[#8c7e70]">
            Ingredient unit costing, COGS margin matrix, warehouse stock replenishment, and profitability analytics
          </p>
        </div>

        {/* Low Stock Alert Pill */}
        {lowStockCount > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-700/50 text-amber-300 text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{lowStockCount} Items Below Reorder Threshold</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Inventory Levels Healthy</span>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-[#8c7e70] font-semibold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Gross Revenue
          </div>
          <div className="text-xl font-black text-[#f5ebd9] font-mono">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#8c7e70]">{totalCupsSold} cups sold today</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-[#8c7e70] font-semibold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Total BOM COGS
          </div>
          <div className="text-xl font-black text-amber-400 font-mono">
            ${totalCogs.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#8c7e70]">Raw ingredient usage cost</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-[#8c7e70] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Net Gross Profit
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            ${totalGrossProfit.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400/80">Revenue minus COGS</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-[#8c7e70] font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
            Average Margin
          </div>
          <div className="text-xl font-black text-[#fbbf24] font-mono">
            {avgMargin.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#8c7e70]">Target: &gt; 70%</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-[#8c7e70] font-semibold flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            Waste / Spoilage
          </div>
          <div className="text-xl font-black text-rose-400 font-mono">
            -${totalWasteLoss.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#8c7e70]">{wasteLogs.length} logged incidents</div>
        </div>
      </div>

      {/* BOM Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2d251f] overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
        {[
          { id: 'warehouse', label: '倉庫在庫與叫貨 (Warehouse Stock)', icon: Boxes },
          { id: 'stocktake', label: '實體盤點與校正 (Stocktake Audit)', icon: ClipboardCheck },
          { id: 'movements', label: '進出異動流水帳 (Stock Movements)', icon: History },
          { id: 'matrix', label: '配方物料與毛利 (Recipe BOM Matrix)', icon: Layers },
          { id: 'analytics', label: '門市銷售與耗用 (Sales & Burn Rate)', icon: TrendingUp },
          { id: 'calculator', label: '新飲品成本試算 (BOM Cost Lab)', icon: Calculator },
          { id: 'waste', label: '損耗報廢紀錄 (Waste Log)', icon: RotateCcw }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#2a2119] text-[#fbbf24] border border-[#d97706]/40 shadow-sm'
                  : 'text-[#a89f91] hover:text-[#f4efe8] hover:bg-[#1c1815]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Recipe BOM Cost Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1a1715] p-4 rounded-xl border border-[#2d251f]">
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9]">
                Menu Bill of Materials Costing Matrix (COGS &amp; Margins)
              </h2>
              <p className="text-xs text-[#8c7e70]">
                Shows raw ingredient proportions, packaging consumables, single-cup COGS, and profit margin for every recipe
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                &ge; 75% High Margin
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                &lt; 75% Standard
              </span>
            </div>
          </div>

          <div className="bg-[#1a1715] rounded-xl border border-[#2d251f] overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#211c18] border-b border-[#2d251f] text-[#8c7e70] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Recipe &amp; Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 font-mono">Retail Price</th>
                    <th className="py-3 px-3 font-mono">Reg COGS</th>
                    <th className="py-3 px-3 font-mono">Gross Profit</th>
                    <th className="py-3 px-3 font-mono">Margin %</th>
                    <th className="py-3 px-3 font-mono">Large (700ml)</th>
                    <th className="py-3 px-4 text-right">BOM Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26201a]">
                  {masterMatrix.map((row) => {
                    const isExpanded = expandedRecipeId === row.item.id;
                    const isHighMargin = row.regularMarginPct >= 75;

                    return (
                      <React.Fragment key={row.item.id}>
                        <tr className="hover:bg-[#201a16] transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-[#f5ebd9]">
                            <div>{row.item.name}</div>
                            <div className="text-[10px] text-[#8c7e70] font-normal">
                              {row.item.chineseName}
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-[#251f1a] text-[#c7bdb0] border border-[#332b24] text-[10px] uppercase">
                              {row.item.category.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-mono font-bold text-[#f5ebd9]">
                            ${row.regularPrice.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-3 font-mono font-semibold text-amber-400">
                            ${row.regularCogs.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-3 font-mono font-semibold text-emerald-400">
                            ${row.regularProfit.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-3 font-mono font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] ${
                                isHighMargin
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                              }`}
                            >
                              {row.regularMarginPct}%
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-[11px] text-[#8c7e70]">
                            ${row.largePrice.toFixed(2)} (COGS: ${row.largeCogs.toFixed(2)}, {row.largeMarginPct}%)
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                sounds.playClick();
                                setExpandedRecipeId(isExpanded ? null : row.item.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#251f1a] hover:bg-[#322a23] text-[#fbbf24] border border-[#382f27] text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>{isExpanded ? 'Hide BOM' : 'Inspect BOM'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded BOM Breakdown Sub-table */}
                        {isExpanded && (
                          <tr className="bg-[#151210]">
                            <td colSpan={8} className="p-4 border-t border-b border-[#2d251f]">
                              <div className="space-y-3">
                                <div className="text-xs font-bold text-[#fbbf24] flex items-center gap-2">
                                  <span>Bill of Materials Specification for: {row.item.name} (Regular 500ml)</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* BOM ingredients table */}
                                  <div className="rounded-lg border border-[#2b241e] bg-[#1a1715] overflow-hidden">
                                    <table className="w-full text-left text-[11px] font-mono">
                                      <thead className="bg-[#201a16] border-b border-[#2b241e] text-[#8c7e70] uppercase">
                                        <tr>
                                          <th className="py-2 px-3">Raw Component</th>
                                          <th className="py-2 px-2 text-right">Serving Qty</th>
                                          <th className="py-2 px-2 text-right">Portion Cost</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[#26201a]">
                                        {row.breakdownRegular.map((comp, idx) => (
                                          <tr key={idx} className="hover:bg-[#201a16]">
                                            <td className="py-1.5 px-3 text-[#f4efe8]">
                                              {comp.name}
                                            </td>
                                            <td className="py-1.5 px-2 text-right text-[#fbbf24]">
                                              {comp.quantity} {comp.unit}
                                            </td>
                                            <td className="py-1.5 px-2 text-right text-amber-400">
                                              ${comp.cost.toFixed(3)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot className="border-t border-[#2b241e] bg-[#201a16] font-bold">
                                        <tr>
                                          <td className="py-2 px-3 text-[#f5ebd9]">
                                            Total Calculated COGS
                                          </td>
                                          <td className="py-2 px-2 text-right text-[#8c7e70]">
                                            1 Cup
                                          </td>
                                          <td className="py-2 px-2 text-right text-amber-400 text-xs">
                                            ${row.regularCogs.toFixed(2)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>

                                  {/* Economics summary */}
                                  <div className="p-4 rounded-lg border border-[#2b241e] bg-[#1a1715] flex flex-col justify-between text-xs space-y-3 font-sans">
                                    <div>
                                      <h4 className="font-bold text-[#f5ebd9] mb-1">
                                        Portion Economics &amp; Margin Strategy
                                      </h4>
                                      <p className="text-xs text-[#8c7e70] leading-relaxed">
                                        To maintain healthy profitability, boba beverage COGS should stay beneath 25% of menu retail price. This recipe yields a healthy <strong>{row.regularMarginPct}%</strong> gross margin.
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                                      <div className="p-2 rounded bg-[#201a16] border border-[#2d251f]">
                                        <div className="text-[#8c7e70]">Per 100 Cups Revenue</div>
                                        <div className="text-sm font-bold text-[#f5ebd9]">
                                          ${(row.regularPrice * 100).toFixed(2)}
                                        </div>
                                      </div>
                                      <div className="p-2 rounded bg-[#201a16] border border-[#2d251f]">
                                        <div className="text-[#8c7e70]">Per 100 Cups Profit</div>
                                        <div className="text-sm font-bold text-emerald-400">
                                          ${(row.regularProfit * 100).toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Warehouse Stock & Restock Control */}
      {activeTab === 'warehouse' && (
        <div className="space-y-5">
          {/* Warehouse Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1a1715] p-4.5 rounded-xl border border-[#2d251f]">
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <span>後台實體庫存與供應商叫貨中心 (Warehouse Inventory &amp; Procurement)</span>
                <span className="text-[10px] font-mono text-[#fbbf24] px-2 py-0.5 rounded-full bg-[#2a221b] border border-[#d97706]/20">
                  {Object.keys(inventory).length} 總品項
                </span>
              </h2>
              <p className="text-xs text-[#8c7e70]">
                支援自建原物料品項、設定安全水位預警、修改採購單價成本與一鍵撥打供應商電話
              </p>
            </div>

            {/* Actions: Create Material, QR Hub, Purchase Order, & Bulk Restock */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedItemForModal(null);
                  setIsItemModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>自建原物料品項</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsQRHubOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-[#261f1a] hover:bg-[#322a23] text-[#fbbf24] border border-[#d97706]/40 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                title="批次列印原物料料架 QR 標籤與手機掃碼進貨核銷"
              >
                <QrCode className="w-4 h-4" />
                <span>料架 QR 碼中心 / 掃碼進貨</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsPOModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-[#261f1a] hover:bg-[#322a23] text-[#f4efe8] border border-[#382f27] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                title="產生物料採購叫貨單與進貨驗收"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>採購叫貨單</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playCashDrawer();
                  onBulkRestockCategory('tea');
                  onBulkRestockCategory('milk');
                  onBulkRestockCategory('sweetener');
                  onBulkRestockCategory('topping');
                  onBulkRestockCategory('packaging');
                }}
                className="px-3 py-2 rounded-xl bg-[#201a16] hover:bg-[#2c241f] text-[#a89f91] hover:text-[#f4efe8] border border-[#332b24] text-xs font-medium transition-colors cursor-pointer"
              >
                全品項進貨補滿
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8c7e70] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋原物料名稱、供應商、電話或存放位置..."
                value={warehouseSearch}
                onChange={(e) => setWarehouseSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#1a1715] text-[#f4efe8] placeholder-[#78716c] text-xs rounded-xl border border-[#332b24] focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs scrollbar-none">
              {[
                { id: 'all', label: '全部原料' },
                { id: 'tea', label: '茶湯茶葉' },
                { id: 'milk', label: '乳品植物奶' },
                { id: 'sweetener', label: '糖漿糖品' },
                { id: 'topping', label: '手工粉圓配料' },
                { id: 'packaging', label: '包材耗材' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    sounds.playClick();
                    setInventoryCategoryFilter(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    inventoryCategoryFilter === cat.id
                      ? 'bg-[#2a2119] text-[#fbbf24] border-[#d97706]/40 shadow-sm'
                      : 'bg-[#181513] text-[#a89f91] border-[#2b241e] hover:text-[#f4efe8]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.values(inventory)
              .filter((item) => {
                const matchCat =
                  inventoryCategoryFilter === 'all' || item.category === inventoryCategoryFilter;
                if (!matchCat) return false;
                if (!warehouseSearch.trim()) return true;
                const q = warehouseSearch.toLowerCase();
                return (
                  item.name.toLowerCase().includes(q) ||
                  (item.supplier && item.supplier.toLowerCase().includes(q)) ||
                  (item.supplierPhone && item.supplierPhone.includes(q)) ||
                  (item.storageLocation && item.storageLocation.toLowerCase().includes(q))
                );
              })
              .map((item) => {
                const isLow = item.currentStock <= item.minStockThreshold;
                const isDepleted = item.currentStock <= 0;
                const pct = Math.min(100, Math.round((item.currentStock / item.capacity) * 100));

                return (
                  <div
                    key={item.id}
                    className={`p-4.5 rounded-xl border transition-all bg-[#1a1715] flex flex-col justify-between space-y-3.5 shadow-sm ${
                      isDepleted
                        ? 'border-rose-600/70 ring-1 ring-rose-500/30'
                        : isLow
                        ? 'border-amber-600/70 ring-1 ring-amber-500/30'
                        : 'border-[#2e2620] hover:border-[#4d4036]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Card Title & Category */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-sm text-[#f5ebd9]">{item.name}</h3>
                            {item.isCustom && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/50">
                                自建品項
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8c7e70] flex items-center gap-1 mt-0.5">
                            <span>廠商: {item.supplier}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                            isDepleted
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : isLow
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse'
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          }`}
                        >
                          {isDepleted ? '庫存耗盡' : isLow ? '低於安全水位' : '存量正常'}
                        </span>
                      </div>

                      {/* Location & Contact Person info */}
                      {(item.storageLocation || item.supplierContactPerson) && (
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8c7e70]">
                          {item.storageLocation && (
                            <span className="flex items-center gap-1 bg-[#201a16] px-1.5 py-0.5 rounded border border-[#2b241e]">
                              <MapPin className="w-3 h-3 text-[#fbbf24]" />
                              {item.storageLocation}
                            </span>
                          )}
                          {item.supplierContactPerson && (
                            <span className="flex items-center gap-1 bg-[#201a16] px-1.5 py-0.5 rounded border border-[#2b241e]">
                              <User className="w-3 h-3 text-[#fbbf24]" />
                              窗口: {item.supplierContactPerson}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Supplier Phone Number with Click-to-Call */}
                      {item.supplierPhone ? (
                        <div className="p-2 rounded-lg bg-[#201a16] border border-[#2d251f] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-[#8c7e70]">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>叫貨電話:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${item.supplierPhone}`}
                              className="font-mono font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                              title="點擊直接撥打電話"
                            >
                              {item.supplierPhone}
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playClick();
                                navigator.clipboard.writeText(item.supplierPhone || '');
                                setCopiedPhoneId(item.id);
                                setTimeout(() => setCopiedPhoneId(null), 1500);
                              }}
                              className="p-1 rounded bg-[#2a221b] hover:bg-[#362c23] text-[#a89f91] hover:text-[#f4efe8] transition-colors cursor-pointer"
                              title="複製電話號碼"
                            >
                              {copiedPhoneId === item.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#78716c] italic flex items-center gap-1">
                          <Phone className="w-3 h-3 opacity-50" />
                          <span>未設定供應商電話 (點擊編輯可新增)</span>
                        </div>
                      )}

                      {/* 2x2 Key Operational Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#141210] p-2.5 rounded-lg border border-[#2b241e]">
                        <div>
                          <div className="text-[10px] text-[#8c7e70] flex items-center gap-1">
                            <span>安全存量水位</span>
                          </div>
                          <div className="font-bold text-[#fbbf24]">
                            {item.minStockThreshold.toLocaleString()} {item.unit}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-[#8c7e70]">採購單價費用</div>
                          <div className="font-bold text-amber-400">
                            ${item.unitCost} / {item.unit}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-[#8c7e70]">實體在庫存量</div>
                          <div className="font-bold text-[#f5ebd9]">
                            {item.currentStock.toLocaleString()} {item.unit}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-[#8c7e70]">建議叫貨批次</div>
                          <div className="text-[#a89f91]">
                            +{item.reorderAmount.toLocaleString()} {item.unit}
                          </div>
                        </div>
                      </div>

                      {/* Stock Level Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px] font-mono">
                          <span className="text-[#8c7e70]">倉庫容量佔比:</span>
                          <span className="text-[#c7bdb0]">
                            {pct}% ({item.currentStock.toLocaleString()} / {item.capacity.toLocaleString()} {item.unit})
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#26201a] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDepleted
                                ? 'bg-rose-500'
                                : isLow
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-[#26201a] space-y-2">
                      {/* Call Supplier Button if Low */}
                      {isLow && item.supplierPhone && (
                        <a
                          href={`tel:${item.supplierPhone}`}
                          className="w-full py-2 px-3 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-[#fbbf24] border border-amber-500/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-[#fbbf24]" />
                          <span>即時致電叫貨 ({item.supplierPhone})</span>
                        </a>
                      )}

                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setSelectedItemForModal(item);
                            setIsItemModalOpen(true);
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-[#251f1a] hover:bg-[#322a23] text-[#fbbf24] border border-[#d97706]/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                          title="修改安全水位、採購單價、電話等"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>修改規格</span>
                        </button>

                        {/* QR Code Shelf Label Button */}
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setSelectedItemForQR(item);
                          }}
                          className="py-1.5 px-2 rounded-lg bg-[#251f1a] hover:bg-[#322a23] text-stone-300 hover:text-[#fbbf24] border border-[#382f27] hover:border-[#d97706]/40 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                          title="查看並列印此料架 QR Code 標籤"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#fbbf24]" />
                          <span>QR 標籤</span>
                        </button>

                        {/* Quick Restock Buttons */}
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playPourSound();
                            onRestockItem(item.id, item.unit === 'units' ? 50 : 500);
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-[#251f1a] hover:bg-[#322a23] text-[#f4efe8] border border-[#382f27] text-xs font-mono font-semibold transition-colors cursor-pointer"
                          title="快速入庫少量"
                        >
                          +{item.unit === 'units' ? '50' : '500'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sounds.playCashDrawer();
                            onRestockItem(item.id, item.reorderAmount);
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-[#2a221b] hover:bg-[#362b22] text-[#fbbf24] border border-[#d97706]/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
                          title="整批補滿至採購量"
                        >
                          叫貨入庫
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 3: Sales & Inventory Burn Rate Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Order Sales History */}
          <div className="bg-[#1a1715] rounded-xl border border-[#2d251f] p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-[#f5ebd9]">
                  Today&apos;s POS Orders &amp; Actual BOM Deductions Log
                </h3>
                <p className="text-xs text-[#8c7e70]">
                  Itemized register transaction records with exact COGS cost breakdown and gross margin
                </p>
              </div>
              <span className="text-xs font-mono text-[#fbbf24] px-2.5 py-1 rounded-lg bg-[#241e19] border border-[#382f27]">
                {orders.length} Rung Up Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#8c7e70]">
                No orders rung up at the POS yet today. Head over to the &quot;POS Cashier&quot; tab to ring up your first drinks!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#201a16] text-[#8c7e70] uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Ticket</th>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Items Ordered</th>
                      <th className="py-2.5 px-3 font-mono">Total Revenue</th>
                      <th className="py-2.5 px-3 font-mono">BOM COGS</th>
                      <th className="py-2.5 px-3 font-mono">Gross Profit</th>
                      <th className="py-2.5 px-3 font-mono">Margin</th>
                      <th className="py-2.5 px-3">Tender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26201a]">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#201a16] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#fbbf24]">
                          {ord.orderNumber}
                        </td>
                        <td className="py-2.5 px-3 text-[#8c7e70]">
                          {new Date(ord.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-[#c7bdb0] max-w-xs truncate">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#f5ebd9]">
                          ${ord.total.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-amber-400">
                          ${ord.totalCogs.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">
                          ${ord.grossProfit.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                          {ord.profitMarginPct}%
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] text-[#8c7e70]">
                          {ord.paymentMethod}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: BOM Recipe Lab / Cost Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls (7 Cols) */}
          <div className="lg:col-span-7 bg-[#1a1715] p-5 rounded-xl border border-[#2d251f] space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#fbbf24]" />
                Drink R&amp;D Sandbox &amp; Margin Simulator
              </h3>
              <p className="text-xs text-[#8c7e70]">
                Experiment with new tea, milk, and topping combinations. Instantly compute exact raw material cost and recommended retail price.
              </p>
            </div>

            {/* Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-[#a89f91]">Cup Size</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['regular', 'large'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setCalcSize(s);
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-medium capitalize transition-colors ${
                      calcSize === s
                        ? 'bg-[#2a2119] text-[#fbbf24] border-[#d97706]/40 font-bold'
                        : 'bg-[#181513] text-[#8c7e70] border-[#2b241e]'
                    }`}
                  >
                    {s} (500ml / 700ml)
                  </button>
                ))}
              </div>
            </div>

            {/* Tea Base */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-[#a89f91]">Tea Base (Brewed)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {(
                  [
                    'assam_black',
                    'jasmine_green',
                    'roasted_oolong',
                    'thai_ceylon',
                    'ceremonial_matcha',
                    'white_peach_oolong'
                  ] as TeaType[]
                ).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setCalcTea(t);
                    }}
                    className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                      calcTea === t
                        ? 'bg-[#2a2119] text-[#fbbf24] border-[#d97706]/40 font-bold'
                        : 'bg-[#181513] text-[#8c7e70] border-[#2b241e]'
                    }`}
                  >
                    {t.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Milk */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-[#a89f91]">Milk / Creamer</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {(
                  ['whole_milk', 'oat_milk', 'coconut_milk', 'condensed_milk', 'none'] as MilkType[]
                ).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setCalcMilk(m);
                    }}
                    className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                      calcMilk === m
                        ? 'bg-[#2a2119] text-[#fbbf24] border-[#d97706]/40 font-bold'
                        : 'bg-[#181513] text-[#8c7e70] border-[#2b241e]'
                    }`}
                  >
                    {m.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Sweetener */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-[#a89f91]">Sweetener Syrup</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {(
                  ['brown_sugar', 'cane_sugar', 'golden_honey', 'wintermelon', 'none'] as SweetenerType[]
                ).map((sw) => (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setCalcSweetener(sw);
                    }}
                    className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                      calcSweetener === sw
                        ? 'bg-[#2a2119] text-[#fbbf24] border-[#d97706]/40 font-bold'
                        : 'bg-[#181513] text-[#8c7e70] border-[#2b241e]'
                    }`}
                  >
                    {sw.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Profit Margin Slider */}
            <div className="space-y-2 pt-2 border-t border-[#26201a]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase text-[#a89f91]">
                  Desired Target Margin: {calcTargetMargin}%
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  Target COGS &le; {100 - calcTargetMargin}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                step="1"
                value={calcTargetMargin}
                onChange={(e) => setCalcTargetMargin(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Card (5 Cols) */}
          <div className="lg:col-span-5 bg-[#1a1715] p-5 rounded-xl border border-[#2d251f] space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-[#fbbf24] tracking-wider">
                Simulated Bill of Materials
              </h4>

              {/* Items Breakdown list */}
              <div className="space-y-2 divide-y divide-[#26201a] text-xs font-mono">
                {sandboxBOM.breakdown.map((b, idx) => (
                  <div key={idx} className="flex justify-between items-center pt-2 first:pt-0">
                    <span className="text-[#a89f91]">{b.name}</span>
                    <span className="text-[#f5ebd9]">
                      {b.quantity}{b.unit} (${b.cost.toFixed(3)})
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Box */}
              <div className="p-4 rounded-xl bg-[#211c18] border border-[#382f27] space-y-2.5 font-mono">
                <div className="flex justify-between items-center text-xs text-[#8c7e70]">
                  <span>Total Single-Cup COGS:</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    ${sandboxBOM.cogs.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-[#8c7e70]">
                  <span>Target Gross Margin:</span>
                  <span className="text-emerald-400 font-bold">{calcTargetMargin}%</span>
                </div>

                <div className="pt-2 border-t border-[#332b24] flex justify-between items-center">
                  <span className="text-xs text-[#f5ebd9] font-bold">Recommended Menu Price:</span>
                  <span className="text-xl font-black text-[#fbbf24]">
                    ${suggestedPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-[#8c7e70]">
                  <span>Estimated Profit / Cup:</span>
                  <span className="text-emerald-400 font-bold">
                    ${(suggestedPrice - sandboxBOM.cogs).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-[11px] text-[#8c7e70]">
              Formula: Price = COGS &divide; (1 &minus; Target Margin %)
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Waste & Spoilage Log */}
      {activeTab === 'waste' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Log New Waste (5 Cols) */}
          <div className="lg:col-span-5 bg-[#1a1715] p-5 rounded-xl border border-[#2d251f] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Record Waste &amp; Write-Off
              </h3>
              <p className="text-xs text-[#8c7e70]">
                Log over-brewed expired tea batches, dropped cups, or spoiled tapioca pearls to write off inventory stock and track dollar loss.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#a89f91]">
                  Damaged / Wasted Item
                </label>
                <select
                  value={wasteIngredientId}
                  onChange={(e) => setWasteIngredientId(e.target.value)}
                  className="w-full p-2.5 bg-[#141210] border border-[#332b24] rounded-lg text-[#f4efe8] focus:outline-none"
                >
                  {Object.values(inventory).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#a89f91]">
                  Quantity Wasted
                </label>
                <input
                  type="number"
                  min="1"
                  value={wasteQuantity}
                  onChange={(e) => setWasteQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full p-2.5 bg-[#141210] border border-[#332b24] rounded-lg text-[#f4efe8] font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#a89f91]">
                  Reason for Disposal
                </label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value as WasteRecord['reason'])}
                  className="w-full p-2.5 bg-[#141210] border border-[#332b24] rounded-lg text-[#f4efe8] focus:outline-none"
                >
                  <option value="expired">4-Hour Freshness Window Expired</option>
                  <option value="spilled">Barista Accidental Spill</option>
                  <option value="over_brewed">Over-brewed (Astringent)</option>
                  <option value="damaged">Damaged in Transit</option>
                  <option value="quality_check">Sensory Quality Check</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-[#201a16] border border-[#2d251f] flex justify-between items-center text-xs">
                <span className="text-[#8c7e70]">Estimated Financial Loss:</span>
                <span className="font-mono font-bold text-rose-400">
                  -${((inventory[wasteIngredientId]?.unitCost || 0) * wasteQuantity).toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddWasteRecord}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log Incident &amp; Deduct Stock</span>
              </button>
            </div>
          </div>

          {/* Waste History (7 Cols) */}
          <div className="lg:col-span-7 bg-[#1a1715] p-5 rounded-xl border border-[#2d251f] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#f5ebd9]">Waste Incidents Log</h3>
              <span className="text-xs font-mono text-rose-400 font-bold">
                Total Loss: -${totalWasteLoss.toFixed(2)}
              </span>
            </div>

            {wasteLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#8c7e70]">
                Zero waste incidents recorded today. High kitchen efficiency!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#201a16] text-[#8c7e70] uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3 font-mono">Qty</th>
                      <th className="py-2.5 px-3 font-mono">Cost Loss</th>
                      <th className="py-2.5 px-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26201a]">
                    {wasteLogs.map((w) => (
                      <tr key={w.id} className="hover:bg-[#201a16]">
                        <td className="py-2.5 px-3 text-[#8c7e70]">
                          {new Date(w.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-[#f5ebd9] font-medium">
                          {w.ingredientName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#fbbf24]">
                          {w.quantity} {w.unit}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-400">
                          -${w.costLoss.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 capitalize text-[#a89f91] text-[10px]">
                          {w.reason.replace('_', ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Inventory Material Modal */}
      <InventoryItemModal
        isOpen={isItemModalOpen}
        item={selectedItemForModal}
        onSave={(item) => {
          onSaveInventoryItem(item);
          setIsItemModalOpen(false);
          setSelectedItemForModal(null);
        }}
        onDelete={(itemId) => {
          if (onDeleteInventoryItem) {
            onDeleteInventoryItem(itemId);
          }
          setIsItemModalOpen(false);
          setSelectedItemForModal(null);
        }}
        onClose={() => {
          setIsItemModalOpen(false);
          setSelectedItemForModal(null);
        }}
      />

      {/* Purchase Order & Receiving Modal */}
      <PurchaseOrderModal
        isOpen={isPOModalOpen}
        inventory={inventory}
        onReceiveItems={(items) => {
          onReceivePurchaseOrder(items);
          setIsPOModalOpen(false);
        }}
        onClose={() => setIsPOModalOpen(false)}
      />

      {/* Individual Shelf QR Tag Modal */}
      {selectedItemForQR && (
        <MaterialQRModal
          item={selectedItemForQR}
          onClose={() => setSelectedItemForQR(null)}
          onQuickRestock={(amount) => {
            onRestockItem(selectedItemForQR.id, amount);
          }}
        />
      )}

      {/* Material QR Labels Hub & Barcode Scanner Simulator Modal */}
      <MaterialQRHubModal
        isOpen={isQRHubOpen}
        inventory={inventory}
        onClose={() => setIsQRHubOpen(false)}
        onRestockItem={onRestockItem}
      />
    </div>
  );
};
