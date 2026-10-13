import React, { useState, useMemo } from 'react';
import {
  InventoryItem,
  POSOrder,
  WasteRecord,
  StockMovementLog
} from '../../types/posBom';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Download,
  Calendar,
  CheckCircle2,
  PackageCheck,
  Phone,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Coffee,
  Sparkles,
  PieChart,
  BarChart3,
  Clock,
  RotateCcw
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface AnalyticsReportsViewProps {
  orders: POSOrder[];
  inventory: Record<string, InventoryItem>;
  wasteLogs: WasteRecord[];
  movementLogs: StockMovementLog[];
  onRestockItem: (ingredientId: string, amount: number) => void;
  onNavigateToPOS?: () => void;
  onNavigateToWarehouse?: () => void;
}

export const AnalyticsReportsView: React.FC<AnalyticsReportsViewProps> = ({
  orders,
  inventory,
  wasteLogs,
  movementLogs,
  onRestockItem,
  onNavigateToPOS,
  onNavigateToWarehouse
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'all'>('today');
  const [reportTab, setReportTab] = useState<'overview' | 'restock_forecast' | 'top_drinks' | 'material_burn' | 'hourly'>('overview');

  // Filter orders based on time selection
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    if (timeFilter === 'today') {
      const startOfDay = new Date().setHours(0, 0, 0, 0);
      return orders.filter((o) => o.timestamp >= startOfDay);
    }
    if (timeFilter === '7days') {
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      return orders.filter((o) => o.timestamp >= sevenDaysAgo);
    }
    return orders;
  }, [orders, timeFilter]);

  // Core Financial & Sales KPIs
  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.total, 0),
    [filteredOrders]
  );
  const totalCupsSold = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.itemCount, 0),
    [filteredOrders]
  );
  const totalCogs = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.totalCogs, 0),
    [filteredOrders]
  );
  const totalGrossProfit = totalRevenue - totalCogs;
  const avgMarginPct = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
  const totalWasteLoss = wasteLogs.reduce((sum, w) => sum + w.costLoss, 0);

  // Top Selling Drinks Ranking
  const topDrinks = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        chineseName: string;
        quantity: number;
        revenue: number;
        cogs: number;
        grossProfit: number;
      }
    > = {};

    filteredOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        const key = item.menuItemId || item.name;
        if (!map[key]) {
          map[key] = {
            name: item.name,
            chineseName: item.chineseName,
            quantity: 0,
            revenue: 0,
            cogs: 0,
            grossProfit: 0
          };
        }
        const itemRev = item.unitPrice * item.quantity;
        const itemCost = item.itemCogs * item.quantity;
        map[key].quantity += item.quantity;
        map[key].revenue += itemRev;
        map[key].cogs += itemCost;
        map[key].grossProfit += itemRev - itemCost;
      });
    });

    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
  }, [filteredOrders]);

  // Raw Material Consumption (Burn Rate) derived from sales orders
  const materialConsumption = useMemo(() => {
    const burnMap: Record<
      string,
      {
        ingredientId: string;
        name: string;
        unit: string;
        totalBurnQuantity: number;
        totalCost: number;
      }
    > = {};

    filteredOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        item.bomBreakdown.forEach((bom) => {
          if (!burnMap[bom.ingredientId]) {
            burnMap[bom.ingredientId] = {
              ingredientId: bom.ingredientId,
              name: bom.name,
              unit: bom.unit,
              totalBurnQuantity: 0,
              totalCost: 0
            };
          }
          const consumed = bom.quantity * item.quantity;
          const cost = bom.cost * item.quantity;
          burnMap[bom.ingredientId].totalBurnQuantity += consumed;
          burnMap[bom.ingredientId].totalCost += cost;
        });
      });
    });

    return Object.values(burnMap).sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredOrders]);

  // Automated Restock Forecast & Depletion Alert based on sales data
  const restockAlerts = useMemo(() => {
    const list = Object.values(inventory).map((item) => {
      // Find consumption in filtered orders
      const consumptionRecord = materialConsumption.find(
        (m) => m.ingredientId === item.id
      );
      const consumedAmount = consumptionRecord ? consumptionRecord.totalBurnQuantity : 0;

      // Average burn per cup across all sold cups
      const avgBurnPerCup = totalCupsSold > 0 ? consumedAmount / totalCupsSold : 0;

      // Estimated cups remaining that this ingredient can support
      const estCupsRemaining =
        avgBurnPerCup > 0 ? Math.floor(item.currentStock / avgBurnPerCup) : 999;

      const isDepleted = item.currentStock <= 0;
      const isBelowMin = item.currentStock <= item.minStockThreshold;
      // High urgency if depleted or below threshold or can support fewer than 20 cups
      const urgency = isDepleted
        ? 'critical'
        : isBelowMin
        ? 'warning'
        : estCupsRemaining < 25 && totalCupsSold > 5
        ? 'attention'
        : 'healthy';

      // Suggested restock quantity: either reorderAmount or capacity - currentStock
      const suggestedReorder = Math.max(
        item.reorderAmount,
        item.capacity - item.currentStock
      );
      const estPurchaseCost = Number((suggestedReorder * item.unitCost).toFixed(2));

      return {
        item,
        consumedAmount,
        avgBurnPerCup,
        estCupsRemaining,
        urgency,
        suggestedReorder,
        estPurchaseCost
      };
    });

    // Sort by urgency: critical first, then warning, attention, healthy
    const urgencyOrder: Record<string, number> = { critical: 0, warning: 1, attention: 2, healthy: 3 };
    return list.sort((a, b) => (urgencyOrder[a.urgency] ?? 9) - (urgencyOrder[b.urgency] ?? 9));
  }, [inventory, materialConsumption, totalCupsSold]);

  const urgentRestockCount = restockAlerts.filter(
    (a) => a.urgency === 'critical' || a.urgency === 'warning'
  ).length;

  // Hourly Sales Distribution
  const hourlySales = useMemo(() => {
    const hours: Record<number, { hour: number; cups: number; revenue: number }> = {};
    for (let i = 9; i <= 21; i++) {
      hours[i] = { hour: i, cups: 0, revenue: 0 };
    }

    filteredOrders.forEach((o) => {
      const h = new Date(o.timestamp).getHours();
      if (hours[h]) {
        hours[h].cups += o.itemCount;
        hours[h].revenue += o.total;
      }
    });

    return Object.values(hours);
  }, [filteredOrders]);

  const maxHourRevenue = Math.max(...hourlySales.map((h) => h.revenue), 1);

  // Payment Tender breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {
      card: { count: 0, total: 0 },
      cash: { count: 0, total: 0 },
      qr_pay: { count: 0, total: 0 }
    };

    filteredOrders.forEach((o) => {
      if (map[o.paymentMethod]) {
        map[o.paymentMethod].count += 1;
        map[o.paymentMethod].total += o.total;
      }
    });

    return map;
  }, [filteredOrders]);

  // Export Sales Report to CSV
  const handleExportSalesCSV = () => {
    sounds.playClick();
    const headers = [
      '訂單編號',
      '銷售時間',
      '飲品明細',
      '總杯數',
      '小計金額',
      '折扣減免',
      '實收總額',
      'BOM原料成本',
      '毛利金額',
      '毛利率(%)',
      '支付方式'
    ];

    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.timestamp).toLocaleString('zh-TW'),
      `"${o.items.map((i) => `${i.quantity}x ${i.chineseName || i.name}`).join('; ')}"`,
      o.itemCount,
      o.subtotal.toFixed(2),
      o.discountAmount.toFixed(2),
      o.total.toFixed(2),
      o.totalCogs.toFixed(2),
      o.grossProfit.toFixed(2),
      o.profitMarginPct,
      o.paymentMethod
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `飲料店銷售明細報表_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Restock & Inventory Report to CSV
  const handleExportRestockCSV = () => {
    sounds.playClick();
    const headers = [
      '原物料名稱',
      '類別',
      '單位',
      '現有在庫量',
      '安全存量水位',
      '累計銷售消耗量',
      '預估剩餘杯數',
      '庫存警報狀態',
      '建議補貨數量',
      '預估採購費用',
      '主要供應商',
      '叫貨電話'
    ];

    const rows = restockAlerts.map((r) => [
      `"${r.item.name}"`,
      r.item.category,
      r.item.unit,
      r.item.currentStock,
      r.item.minStockThreshold,
      r.consumedAmount,
      r.estCupsRemaining === 999 ? '充足' : r.estCupsRemaining,
      r.urgency === 'critical'
        ? '庫存耗盡'
        : r.urgency === 'warning'
        ? '低於安全水位'
        : r.urgency === 'attention'
        ? '即將不足'
        : '正常',
      r.suggestedReorder,
      r.estPurchaseCost,
      `"${r.item.supplier}"`,
      r.item.supplierPhone || ''
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `原物料庫存與補貨提醒建議表_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#2d251f] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#f5ebd9] tracking-tight font-display">
              營業銷售分析與智能補貨報表
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#2a221b] text-[#fbbf24] border border-[#d97706]/20">
              Live BI &amp; Operations
            </span>
          </div>
          <p className="text-xs text-[#8c7e70] mt-1">
            前台銷售即時連動扣減庫存 · 依銷售數據自動產生補貨預警 · 飲品排行與原物料耗用分析
          </p>
        </div>

        {/* Filter controls & Export buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Filter Segmented Control */}
          <div className="flex items-center p-1 bg-[#1a1715] rounded-xl border border-[#2d251f] text-xs">
            <button
              onClick={() => {
                sounds.playClick();
                setTimeFilter('today');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-[#a89f91] hover:text-[#f4efe8]'
              }`}
            >
              今日即時
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setTimeFilter('7days');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeFilter === '7days'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-[#a89f91] hover:text-[#f4efe8]'
              }`}
            >
              近 7 日
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setTimeFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeFilter === 'all'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-[#a89f91] hover:text-[#f4efe8]'
              }`}
            >
              全期累計
            </button>
          </div>

          {/* Export CSV Buttons */}
          <button
            onClick={handleExportSalesCSV}
            className="px-3 py-2 rounded-xl bg-[#201a16] hover:bg-[#2d241e] text-[#f4efe8] border border-[#382f27] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            title="下載今日銷售明細 CSV 檔案"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>匯出銷售報表 CSV</span>
          </button>

          <button
            onClick={handleExportRestockCSV}
            className="px-3 py-2 rounded-xl bg-[#201a16] hover:bg-[#2d241e] text-[#f4efe8] border border-[#382f27] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            title="下載原物料庫存與補貨提醒 CSV 檔案"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>匯出補貨建議 CSV</span>
          </button>
        </div>
      </div>

      {/* Low Stock Urgent Alert Banner */}
      {urgentRestockCount > 0 ? (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-200">
                自動補貨提醒：目前共有 {urgentRestockCount} 項原物料低於安全存量水位！
              </div>
              <div className="text-xs text-amber-300/80">
                系統已依據目前銷售速率自動推算出建議補貨量，請盡早向供應商發起採購避免影響營運。
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setReportTab('restock_forecast');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs whitespace-nowrap transition-colors cursor-pointer shadow-md"
          >
            查看補貨建議清單
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>全店各原物料存量健康充足，所有品項皆高於安全存量水位。</span>
          </div>
          <span className="text-[11px] text-emerald-400/80">即時連動核銷正常</span>
        </div>
      )}

      {/* 6 Key Financial Metrics KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] text-[#8c7e70] font-semibold flex items-center gap-1 uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            總銷售金額
          </div>
          <div className="text-xl font-black text-[#f5ebd9] font-mono tabular-nums">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#8c7e70]">實收營業總額</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] text-[#8c7e70] font-semibold flex items-center gap-1 uppercase tracking-wider">
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            總銷售杯數
          </div>
          <div className="text-xl font-black text-[#fbbf24] font-mono tabular-nums">
            {totalCupsSold} <span className="text-xs font-normal text-[#8c7e70]">杯</span>
          </div>
          <div className="text-[10px] text-[#8c7e70]">{filteredOrders.length} 筆結帳訂單</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] text-[#8c7e70] font-semibold flex items-center gap-1 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-[#fbbf24]" />
            平均客單價 (AOV)
          </div>
          <div className="text-xl font-black text-[#f5ebd9] font-mono tabular-nums">
            ${avgOrderValue.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#8c7e70]">每單平均消費額</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] text-[#8c7e70] font-semibold flex items-center gap-1 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            原物料成本 (COGS)
          </div>
          <div className="text-xl font-black text-amber-400 font-mono tabular-nums">
            ${totalCogs.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#8c7e70]">茶葉/鮮奶/配料/包材</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] text-[#8c7e70] font-semibold flex items-center gap-1 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            營業淨毛利
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono tabular-nums">
            ${totalGrossProfit.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400/80">營收扣減物料成本</div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] space-y-1">
          <div className="text-[11px] text-[#8c7e70] font-semibold flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            平均毛利率
          </div>
          <div className="text-xl font-black text-[#fbbf24] font-mono tabular-nums">
            {avgMarginPct.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#8c7e70]">目標維持 &gt; 70%</div>
        </div>
      </div>

      {/* Report Section Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2d251f] overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
        {[
          { id: 'overview', label: '銷售與存貨總覽 (Overview)', icon: BarChart3 },
          { id: 'restock_forecast', label: `智能補貨預警 (${urgentRestockCount}項待補)`, icon: AlertTriangle },
          { id: 'top_drinks', label: '熱銷飲品排行榜 (Top Drinks)', icon: Coffee },
          { id: 'material_burn', label: '原物料累積消耗報表 (Burn Rate)', icon: Layers },
          { id: 'hourly', label: '時段銷售趨勢 (Hourly Velocity)', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setReportTab(tab.id as typeof reportTab);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                reportTab === tab.id
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

      {/* Tab 1: Overview Dashboard */}
      {reportTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Top 5 Best Sellers & Restock Highlights (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top 5 Best Sellers Quick Widget */}
            <div className="bg-[#1a1715] p-5 rounded-xl border border-[#2d251f] space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#fbbf24]" />
                  <h3 className="text-sm font-bold text-[#f5ebd9]">熱銷飲品排行前 5 名</h3>
                </div>
                <button
                  onClick={() => setReportTab('top_drinks')}
                  className="text-xs text-[#fbbf24] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>查看全部排行榜</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {topDrinks.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8c7e70]">
                  尚無銷售數據。請至前台銷售系統結帳出杯！
                </div>
              ) : (
                <div className="space-y-3">
                  {topDrinks.slice(0, 5).map((drink, idx) => {
                    const pctOfTotal =
                      totalCupsSold > 0 ? (drink.quantity / totalCupsSold) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#241e19] text-[#fbbf24] font-mono font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-[#f5ebd9]">
                              {drink.chineseName || drink.name}
                            </span>
                            <span className="text-[10px] text-[#8c7e70] hidden sm:inline">
                              ({drink.name})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-[#fbbf24] font-bold">
                              {drink.quantity} 杯
                            </span>
                            <span className="text-[#8c7e70]">
                              ${drink.revenue.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-[#251f1a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, pctOfTotal * 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Urgent Restock List */}
            <div className="bg-[#1a1715] p-5 rounded-xl border border-[#2d251f] space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-[#f5ebd9]">
                    根據銷售速度之優先補貨物料
                  </h3>
                </div>
                <button
                  onClick={() => setReportTab('restock_forecast')}
                  className="text-xs text-[#fbbf24] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>開啟完整預警表</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {restockAlerts.slice(0, 4).map((r) => {
                  const isLow = r.urgency === 'critical' || r.urgency === 'warning';
                  return (
                    <div
                      key={r.item.id}
                      className="p-3 rounded-lg bg-[#201a16] border border-[#2d251f] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#f5ebd9] flex items-center gap-2">
                          <span>{r.item.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              isLow
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                                : 'bg-[#2a221b] text-[#8c7e70]'
                            }`}
                          >
                            {isLow ? '低於安全水位' : '存量正常'}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8c7e70] font-mono mt-0.5">
                          在庫: {r.item.currentStock.toLocaleString()} {r.item.unit} · 安全線: {r.item.minStockThreshold.toLocaleString()} {r.item.unit}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right font-mono text-[11px] hidden sm:block">
                          <div className="text-[#fbbf24]">建議叫貨: +{r.suggestedReorder} {r.item.unit}</div>
                          <div className="text-[#8c7e70]">預估: ${r.estPurchaseCost}</div>
                        </div>
                        <button
                          onClick={() => {
                            sounds.playCashDrawer();
                            onRestockItem(r.item.id, r.suggestedReorder);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#2a221b] hover:bg-[#382d23] text-[#fbbf24] border border-[#d97706]/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          一鍵補貨
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Payment Methods & Material Depletion Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tender breakdown */}
            <div className="bg-[#1a1715] p-5 rounded-xl border border-[#2d251f] space-y-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-[#f5ebd9]">多元支付結帳佔比</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#201a16] border border-[#2b241e] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[#f5ebd9] font-sans">行動支付 (LINE Pay / 街口)</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#fbbf24]">
                      ${paymentBreakdown.qr_pay.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#8c7e70] ml-1.5">
                      ({paymentBreakdown.qr_pay.count} 筆)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#201a16] border border-[#2b241e] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    <span className="text-[#f5ebd9] font-sans">信用卡 / Apple Pay</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#fbbf24]">
                      ${paymentBreakdown.card.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#8c7e70] ml-1.5">
                      ({paymentBreakdown.card.count} 筆)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#201a16] border border-[#2b241e] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="text-[#f5ebd9] font-sans">現金收銀 (Cash)</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#fbbf24]">
                      ${paymentBreakdown.cash.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#8c7e70] ml-1.5">
                      ({paymentBreakdown.cash.count} 筆)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Raw Material Burn highlights */}
            <div className="bg-[#1a1715] p-5 rounded-xl border border-[#2d251f] space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-[#f5ebd9]">前台銷售扣減物料排行</h3>
                </div>
                <button
                  onClick={() => setReportTab('material_burn')}
                  className="text-xs text-[#fbbf24] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>完整耗用</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {materialConsumption.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8c7e70]">
                  尚無扣庫存紀錄。點餐時將自動從後台扣減。
                </div>
              ) : (
                <div className="space-y-2.5 text-xs font-mono">
                  {materialConsumption.slice(0, 5).map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#201a16] border border-[#2b241e] flex justify-between items-center"
                    >
                      <div className="font-sans font-medium text-[#f4efe8]">
                        {m.name}
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 font-bold">
                          {m.totalBurnQuantity.toLocaleString()} {m.unit}
                        </div>
                        <div className="text-[10px] text-[#8c7e70]">
                          消耗成本: ${m.totalCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Automated Restock Forecast & Low Stock Warning Report */}
      {reportTab === 'restock_forecast' && (
        <div className="space-y-5 bg-[#1a1715] p-5 rounded-xl border border-[#2d251f]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <span>根據銷售數據自動產生之補貨建議與預警報表</span>
                <span className="text-xs font-mono text-amber-400 font-bold px-2 py-0.5 rounded-full bg-[#2a221b] border border-amber-600/30">
                  {urgentRestockCount} 項目需優先採購
                </span>
              </h2>
              <p className="text-xs text-[#8c7e70] mt-0.5">
                依據目前前台每杯消耗速度 (Burn Rate) 與在庫存量，智能估算預計可售杯數與建議補貨量
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playCashDrawer();
                  restockAlerts
                    .filter((r) => r.urgency === 'critical' || r.urgency === 'warning')
                    .forEach((r) => onRestockItem(r.item.id, r.suggestedReorder));
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                一鍵批次補滿告警品項
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#201a16] border-b border-[#2d251f] text-[#8c7e70] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">原物料名稱</th>
                  <th className="py-3 px-2 font-mono">實體在庫</th>
                  <th className="py-3 px-2 font-mono">安全水位</th>
                  <th className="py-3 px-2 font-mono">已售消耗</th>
                  <th className="py-3 px-2 font-mono">預估剩餘杯數</th>
                  <th className="py-3 px-2">警報狀態</th>
                  <th className="py-3 px-2 font-mono">建議叫貨量</th>
                  <th className="py-3 px-2 font-mono">預估進貨費</th>
                  <th className="py-3 px-3">主要供應商</th>
                  <th className="py-3 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26201a]">
                {restockAlerts.map((r) => {
                  const isDepleted = r.urgency === 'critical';
                  const isLow = r.urgency === 'warning';
                  const isAttention = r.urgency === 'attention';

                  return (
                    <tr
                      key={r.item.id}
                      className={`hover:bg-[#201a16] transition-colors ${
                        isDepleted
                          ? 'bg-rose-950/20'
                          : isLow
                          ? 'bg-amber-950/20'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-[#f5ebd9]">
                        <div>{r.item.name}</div>
                        <div className="text-[10px] text-[#8c7e70]">
                          類別: {r.item.category}
                        </div>
                      </td>

                      <td className="py-3 px-2 font-mono font-bold text-[#f5ebd9] tabular-nums">
                        {r.item.currentStock.toLocaleString()} {r.item.unit}
                      </td>

                      <td className="py-3 px-2 font-mono text-[#fbbf24] tabular-nums">
                        {r.item.minStockThreshold.toLocaleString()} {r.item.unit}
                      </td>

                      <td className="py-3 px-2 font-mono text-amber-400 tabular-nums">
                        {r.consumedAmount.toLocaleString()} {r.item.unit}
                      </td>

                      <td className="py-3 px-2 font-mono font-bold tabular-nums">
                        {r.estCupsRemaining === 999 ? (
                          <span className="text-emerald-400">&gt; 100 杯</span>
                        ) : (
                          <span
                            className={
                              r.estCupsRemaining < 15
                                ? 'text-rose-400 font-extrabold'
                                : r.estCupsRemaining < 30
                                ? 'text-amber-400'
                                : 'text-[#f5ebd9]'
                            }
                          >
                            約 {r.estCupsRemaining} 杯
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isDepleted
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : isLow
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse'
                              : isAttention
                              ? 'bg-yellow-950/60 text-yellow-300 border border-yellow-800'
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          }`}
                        >
                          {isDepleted
                            ? '庫存耗盡'
                            : isLow
                            ? '低於安全水位'
                            : isAttention
                            ? '即將不足'
                            : '正常'}
                        </span>
                      </td>

                      <td className="py-3 px-2 font-mono font-bold text-[#fbbf24] tabular-nums">
                        +{r.suggestedReorder.toLocaleString()} {r.item.unit}
                      </td>

                      <td className="py-3 px-2 font-mono text-emerald-400 tabular-nums">
                        ${r.estPurchaseCost.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-[#c7bdb0]">
                        <div>{r.item.supplier}</div>
                        {r.item.supplierPhone && (
                          <a
                            href={`tel:${r.item.supplierPhone}`}
                            className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-mono mt-0.5"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            {r.item.supplierPhone}
                          </a>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            sounds.playCashDrawer();
                            onRestockItem(r.item.id, r.suggestedReorder);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#2a221b] hover:bg-[#382d23] text-[#fbbf24] border border-[#d97706]/40 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          補貨入庫
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Top Selling Drinks Ranking */}
      {reportTab === 'top_drinks' && (
        <div className="space-y-4 bg-[#1a1715] p-5 rounded-xl border border-[#2d251f]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <Coffee className="w-4 h-4 text-[#fbbf24]" />
                飲品銷售排行榜與利潤貢獻度 (Top Selling Drinks Ranking)
              </h2>
              <p className="text-xs text-[#8c7e70]">
                依前台實際點餐出杯數量排序，包含單品營收、物料成本與毛利金額
              </p>
            </div>
            <span className="text-xs font-mono text-[#fbbf24] px-2.5 py-1 rounded-lg bg-[#241e19] border border-[#382f27]">
              共 {topDrinks.length} 款飲品銷售
            </span>
          </div>

          {topDrinks.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8c7e70]">
              尚無銷售數據。前往前台銷售系統點餐出杯後，將自動生成排行榜！
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#201a16] border-b border-[#2d251f] text-[#8c7e70] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">排名</th>
                    <th className="py-3 px-4">飲品品名</th>
                    <th className="py-3 px-3 font-mono">售出杯數</th>
                    <th className="py-3 px-3 font-mono">銷售總額</th>
                    <th className="py-3 px-3 font-mono">物料成本 (COGS)</th>
                    <th className="py-3 px-3 font-mono">營業毛利</th>
                    <th className="py-3 px-3 font-mono">毛利率</th>
                    <th className="py-3 px-4">杯數佔比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26201a]">
                  {topDrinks.map((drink, idx) => {
                    const margin =
                      drink.revenue > 0
                        ? ((drink.grossProfit / drink.revenue) * 100).toFixed(1)
                        : '0';
                    const cupShare =
                      totalCupsSold > 0
                        ? ((drink.quantity / totalCupsSold) * 100).toFixed(1)
                        : '0';

                    return (
                      <tr key={idx} className="hover:bg-[#201a16] transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                              idx === 0
                                ? 'bg-amber-500 text-stone-950 font-black'
                                : idx === 1
                                ? 'bg-stone-300 text-stone-900 font-bold'
                                : idx === 2
                                ? 'bg-amber-700 text-amber-100 font-bold'
                                : 'bg-[#241e19] text-[#8c7e70]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-[#f5ebd9]">
                          <div>{drink.chineseName || drink.name}</div>
                          <div className="text-[10px] text-[#8c7e70]">{drink.name}</div>
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold text-[#fbbf24] tabular-nums">
                          {drink.quantity} 杯
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold text-[#f5ebd9] tabular-nums">
                          ${drink.revenue.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-3 font-mono text-amber-400 tabular-nums">
                          ${drink.cogs.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-3 font-mono font-semibold text-emerald-400 tabular-nums">
                          ${drink.grossProfit.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold text-emerald-400 tabular-nums">
                          {margin}%
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-[#251f1a] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${Math.min(100, parseFloat(cupShare) * 2)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-[#8c7e70]">
                              {cupShare}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Raw Material Burn Rate & Depletion Report */}
      {reportTab === 'material_burn' && (
        <div className="space-y-4 bg-[#1a1715] p-5 rounded-xl border border-[#2d251f]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                前台銷售匯入之原物料累計耗用分析 (Raw Material Consumption Burn)
              </h2>
              <p className="text-xs text-[#8c7e70]">
                詳列因前台點餐出杯而透過配方 (BOM) 即時扣減的茶湯、鮮奶、糖品、珍珠與包材總量
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 px-2.5 py-1 rounded-lg bg-[#241e19] border border-[#382f27]">
              總耗用成本: ${totalCogs.toFixed(2)}
            </span>
          </div>

          {materialConsumption.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8c7e70]">
              尚無原物料耗用記錄。前台完成結帳後將自動累計統計。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#201a16] border-b border-[#2d251f] text-[#8c7e70] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">原物料名稱</th>
                    <th className="py-3 px-2 font-mono">前台扣減總量</th>
                    <th className="py-3 px-2 font-mono">累積耗用金額</th>
                    <th className="py-3 px-2 font-mono">現存在庫量</th>
                    <th className="py-3 px-2 font-mono">安全水位</th>
                    <th className="py-3 px-3">主要供應商</th>
                    <th className="py-3 px-3">狀態評級</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26201a]">
                  {materialConsumption.map((m, idx) => {
                    const currentItem = inventory[m.ingredientId];
                    const stock = currentItem ? currentItem.currentStock : 0;
                    const minThresh = currentItem ? currentItem.minStockThreshold : 0;
                    const isLow = stock <= minThresh;

                    return (
                      <tr key={idx} className="hover:bg-[#201a16] transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#f5ebd9]">
                          {m.name}
                        </td>

                        <td className="py-3 px-2 font-mono font-bold text-amber-400 tabular-nums">
                          {m.totalBurnQuantity.toLocaleString()} {m.unit}
                        </td>

                        <td className="py-3 px-2 font-mono font-bold text-emerald-400 tabular-nums">
                          ${m.totalCost.toFixed(2)}
                        </td>

                        <td className="py-3 px-2 font-mono text-[#f5ebd9] tabular-nums">
                          {stock.toLocaleString()} {m.unit}
                        </td>

                        <td className="py-3 px-2 font-mono text-[#8c7e70] tabular-nums">
                          {minThresh.toLocaleString()} {m.unit}
                        </td>

                        <td className="py-3 px-3 text-[#c7bdb0]">
                          {currentItem?.supplier || '配合茶廠'}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLow
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            }`}
                          >
                            {isLow ? '低於安全水位' : '存量安全'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Hourly Sales Velocity */}
      {reportTab === 'hourly' && (
        <div className="space-y-4 bg-[#1a1715] p-5 rounded-xl border border-[#2d251f]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#fbbf24]" />
                營業時段銷售動態分佈 (Hourly Sales Velocity)
              </h2>
              <p className="text-xs text-[#8c7e70]">
                掌握全日各時段出單尖峰與離峰時間，提供備料與人力調度決策
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-13 gap-1.5 items-end h-44 bg-[#141210] p-4 rounded-xl border border-[#26201a]">
              {hourlySales.map((h) => {
                const heightPct =
                  maxHourRevenue > 0 ? (h.revenue / maxHourRevenue) * 100 : 0;
                return (
                  <div
                    key={h.hour}
                    className="flex flex-col items-center justify-end h-full gap-1 group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-[#241e19] text-[#f4efe8] border border-[#382f27] px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap z-10 pointer-events-none shadow-lg">
                      {h.hour}:00 · {h.cups}杯 · ${h.revenue.toFixed(1)}
                    </div>

                    <div
                      className="w-full bg-amber-500/80 hover:bg-amber-400 rounded-t transition-all"
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                    />
                    <span className="text-[10px] font-mono text-[#8c7e70]">
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-right text-[11px] text-[#8c7e70] font-mono">
              橫軸: 營業時段 (09:00 - 21:00) · 縱軸: 實收金額
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
