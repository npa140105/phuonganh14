import React, { useState } from 'react';
import {
  InventoryItem,
  POSOrder,
  POSMenuItem,
  POSCartItem,
  DrinkSize
} from '../../types/posBom';
import { POS_MENU_ITEMS, calculateDrinkBOM } from '../../data/posBomData';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import {
  QrCode,
  Smartphone,
  CreditCard,
  Boxes,
  Receipt,
  Printer,
  Copy,
  Check,
  Plus,
  Minus,
  Sparkles,
  Coffee,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface QRCodeHubViewProps {
  inventory: Record<string, InventoryItem>;
  orders: POSOrder[];
  onCompleteSale: (order: POSOrder) => void;
  onRestockItem: (ingredientId: string, amount: number) => void;
  onNavigateToPOS?: () => void;
  onNavigateToInventory?: () => void;
}

export const QRCodeHubView: React.FC<QRCodeHubViewProps> = ({
  inventory,
  orders,
  onCompleteSale,
  onRestockItem,
  onNavigateToPOS,
  onNavigateToInventory
}) => {
  const [activeModule, setActiveModule] = useState<'mobile_order' | 'payment' | 'material_tags' | 'invoice'>('mobile_order');

  // --- 1. Mobile Ordering States ---
  const [selectedTable, setSelectedTable] = useState<string>('01');
  const [isTakeaway, setIsTakeaway] = useState<boolean>(false);
  const [isMobileSimOpen, setIsMobileSimOpen] = useState<boolean>(false);
  const [simCart, setSimCart] = useState<POSCartItem[]>([]);
  const [simCustomerName, setSimCustomerName] = useState<string>('陳先生');
  const [simOrderSuccess, setSimOrderSuccess] = useState<POSOrder | null>(null);

  // --- 2. Payment QR States ---
  const [paymentAmount, setPaymentAmount] = useState<number>(130);
  const [paymentChannel, setPaymentChannel] = useState<'line_pay' | 'jko_pay' | 'taiwan_pay' | 'apple_pay'>('line_pay');
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<string | null>(null);

  // --- 3. Material Tags States ---
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState<string>('all');
  const [scannedMaterialId, setScannedMaterialId] = useState<string>('tea_assam');
  const [scannedQty, setScannedQty] = useState<number>(2000);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // URL for mobile QR
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://bobaflow12.tw';
  const tableParam = isTakeaway ? 'takeaway' : selectedTable;
  const mobileOrderUrl = `${currentOrigin}?mode=mobile_order&table=${tableParam}&t=${Date.now()}`;

  // Payment QR Data payload
  const paymentQrPayload = `tw.gov.fisc.taiwanpay://qr?ver=02&type=01&mch=BOBAFLOW12&amt=${paymentAmount}&cur=901&chn=${paymentChannel}&ref=PAY-${Date.now().toString(36).toUpperCase()}`;

  // Invoice QR Data payload (Taiwan MoF standard format)
  const invoiceSampleQr = `AB123456781151013778800000082000000880000000012345678z9x8c7v6b5n4m3l2k1:**********:1:1:1:黑糖珍珠鮮奶:2:130`;

  // Print table placard
  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  // Add item to Mobile Simulator cart
  const handleSimQuickAdd = (item: POSMenuItem) => {
    sounds.playAddCart();
    const bomResult = calculateDrinkBOM(
      item.defaultTea,
      item.defaultMilk,
      item.defaultSweetener,
      item.defaultSweetness,
      item.defaultToppings,
      'regular',
      !!item.requiresCheeseFoam,
      inventory
    );

    const newItem: POSCartItem = {
      cartItemId: `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: item.id,
      name: item.name,
      chineseName: item.chineseName,
      size: 'regular',
      tea: item.defaultTea,
      milk: item.defaultMilk,
      sweetener: item.defaultSweetener,
      sweetness: item.defaultSweetness,
      iceLevel: item.defaultIce,
      toppings: [...item.defaultToppings],
      requiresCheeseFoam: !!item.requiresCheeseFoam,
      requiresTorch: !!item.requiresTorch,
      unitPrice: item.basePrice,
      quantity: 1,
      itemCogs: bomResult.cogs,
      bomBreakdown: bomResult.breakdown
    };

    setSimCart((prev) => [...prev, newItem]);
  };

  // Update simulator cart quantity
  const handleSimUpdateQty = (cartItemId: string, delta: number) => {
    sounds.playClick();
    setSimCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  // Submit Mobile Simulator Order
  const handleSimSubmitOrder = () => {
    if (simCart.length === 0) return;
    sounds.playCashDrawer();

    const subtotal = simCart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const totalCogs = simCart.reduce((s, i) => s + i.itemCogs * i.quantity, 0);
    const tax = Number((subtotal * 0.0825).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    const grossProfit = Number((subtotal - totalCogs).toFixed(2));
    const margin = subtotal > 0 ? Number(((grossProfit / subtotal) * 100).toFixed(1)) : 0;

    const orderNumber = `#M-${100 + orders.length + 1}`;
    const newOrder: POSOrder = {
      id: `ord_mobile_${Date.now()}`,
      orderNumber,
      timestamp: Date.now(),
      items: [...simCart],
      itemCount: simCart.reduce((s, i) => s + i.quantity, 0),
      subtotal,
      discountType: 'none',
      discountAmount: 0,
      tax,
      total,
      totalCogs,
      grossProfit,
      profitMarginPct: margin,
      paymentMethod: 'qr_pay',
      status: 'pending',
      customerNote: `手機掃碼點餐 (桌號: ${isTakeaway ? '外帶' : selectedTable}) - ${simCustomerName}`
    };

    onCompleteSale(newOrder);
    setSimOrderSuccess(newOrder);
    setSimCart([]);
  };

  // Simulate Payment Received
  const handleSimulatePaymentSuccess = () => {
    sounds.playCardBeep();
    setTimeout(() => {
      sounds.playCashDrawer();
      const channelName =
        paymentChannel === 'line_pay'
          ? 'LINE Pay'
          : paymentChannel === 'jko_pay'
          ? '街口支付'
          : paymentChannel === 'taiwan_pay'
          ? '台灣 Pay'
          : 'Apple Pay';
      setPaymentSuccessNotice(`✓ 已成功接收 ${channelName} 行動支付 NT$ ${paymentAmount}！款項已完成核對入帳。`);
      setTimeout(() => setPaymentSuccessNotice(null), 5000);
    }, 400);
  };

  // Execute Material Inbound Scan
  const handleExecuteMaterialScan = () => {
    const item = inventory[scannedMaterialId];
    if (!item) return;
    sounds.playCardBeep();
    setTimeout(() => {
      sounds.playCashDrawer();
      onRestockItem(item.id, scannedQty);
      setScanMessage(`✓ 掃碼入庫成功！已補入 ${item.name} +${scannedQty} ${item.unit}，最新在庫: ${(item.currentStock + scannedQty).toLocaleString()} ${item.unit}`);
      setTimeout(() => setScanMessage(null), 4500);
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d251f] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#f5ebd9] tracking-tight font-display">
              QR Code 應用與行動點餐中心
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#2a221b] text-[#fbbf24] border border-[#d97706]/20">
              Smart QR Suite
            </span>
          </div>
          <p className="text-xs text-[#8c7e70] mt-1">
            顧客手機掃碼點餐立牌 · 多元行動支付收款碼 · 原物料料架 QR 標籤與掃碼入庫 · 電子發票載具
          </p>
        </div>

        {/* Global Print all tags button */}
        <button
          onClick={handlePrint}
          className="px-3.5 py-2 rounded-xl bg-[#241e19] hover:bg-[#322820] text-[#f4efe8] border border-[#382f27] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>列印當前立牌 / QR 標籤</span>
        </button>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2d251f] overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
        {[
          { id: 'mobile_order', label: '1. 顧客手機掃碼點餐立牌', icon: Smartphone },
          { id: 'payment', label: '2. 多元行動支付收款 QR', icon: CreditCard },
          { id: 'material_tags', label: '3. 原物料料架 QR 標籤與入庫掃碼', icon: Boxes },
          { id: 'invoice', label: '4. 電子發票與載具條碼', icon: Receipt }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setActiveModule(tab.id as typeof activeModule);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeModule === tab.id
                  ? 'bg-[#2a2119] text-[#fbbf24] border border-[#d97706]/40 shadow-sm font-bold'
                  : 'text-[#a89f91] hover:text-[#f4efe8] hover:bg-[#1c1815]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-amber-400" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* Module 1: Mobile Customer Self-Ordering QR */}
      {/* ============================================================== */}
      {activeModule === 'mobile_order' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Placard Configuration & Actions (5 Cols) */}
          <div className="lg:col-span-5 bg-[#1a1715] p-5 rounded-2xl border border-[#2d251f] space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                桌上點餐立牌設定 (Table Placard)
              </h2>
              <p className="text-xs text-[#8c7e70] mt-0.5">
                顧客入座後使用手機相機掃描，即可免排隊自由點餐。送單後將即時同步匯入前台 POS、廚房出單並自動扣減庫存！
              </p>
            </div>

            {/* Table / Order Type Toggle */}
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-[#a89f91] block">用餐模式 / 桌號選擇：</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsTakeaway(false);
                  }}
                  className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                    !isTakeaway
                      ? 'bg-[#2a2119] text-[#fbbf24] border-amber-500 font-bold'
                      : 'bg-[#141210] text-[#a89f91] border-[#2b241e]'
                  }`}
                >
                  內用桌號立牌
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsTakeaway(true);
                  }}
                  className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                    isTakeaway
                      ? 'bg-[#2a2119] text-[#fbbf24] border-amber-500 font-bold'
                      : 'bg-[#141210] text-[#a89f91] border-[#2b241e]'
                  }`}
                >
                  外帶排隊立牌
                </button>
              </div>

              {!isTakeaway && (
                <div className="pt-2">
                  <label className="text-[11px] text-[#8c7e70] block mb-1">選擇指定桌位號碼：</label>
                  <div className="grid grid-cols-5 gap-1.5 font-mono">
                    {['01', '02', '03', '04', '05', '06', '07', '08', '吧台A', '吧台B'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setSelectedTable(t);
                        }}
                        className={`p-1.5 text-center rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                          selectedTable === t
                            ? 'bg-amber-500 text-stone-950 border-amber-400'
                            : 'bg-[#181513] text-[#c7bdb0] border-[#2b241e] hover:border-amber-500/50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Test simulator button */}
            <div className="pt-2 border-t border-[#26201b] space-y-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsMobileSimOpen(true);
                  setSimOrderSuccess(null);
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>立即開啟「顧客手機點餐模擬介面」</span>
              </button>

              <p className="text-[11px] text-[#8c7e70] text-center">
                無需第二台手機，即可直接在電腦端模擬手機送單與後台即時扣庫存流程！
              </p>
            </div>
          </div>

          {/* Right Column: Physical Placard Visual Preview (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            {/* The Placard Card */}
            <div className="w-full max-w-md bg-white text-stone-900 rounded-3xl p-7 shadow-2xl border-4 border-[#2d251f] flex flex-col items-center text-center space-y-4 select-none animate-fade-in">
              <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs tracking-widest uppercase">
                <Coffee className="w-4 h-4" />
                <span>BOBAFLOW 12 ARTISAN TEA</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-stone-950 tracking-tight">
                  手機掃描 · 立即點餐
                </h3>
                <p className="text-xs text-stone-600">
                  免至櫃台排隊 · 自由客製甜度冰塊與配料
                </p>
              </div>

              {/* The QR Code Image */}
              <div className="p-3 bg-stone-50 rounded-2xl border-2 border-stone-200 shadow-inner">
                <QRCodeDisplay
                  value={mobileOrderUrl}
                  size={210}
                  showDownload={false}
                  showCopy={false}
                  darkColor="#1c1917"
                  lightColor="#f8fafc"
                  className="border-none shadow-none p-0"
                />
              </div>

              {/* Table Pill */}
              <div className="font-mono font-black text-sm px-4 py-1.5 rounded-full bg-stone-900 text-[#fbbf24] shadow-md tracking-wider">
                {isTakeaway ? 'TAKEAWAY · 外帶候位專用' : `TABLE ${selectedTable} · 內用桌位`}
              </div>

              <div className="text-[11px] text-stone-400 font-mono">
                連動 POS 終端 · 自動扣減原物料庫存
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-[#241e19] hover:bg-[#322820] text-[#fbbf24] border border-[#d97706]/40 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>列印此桌牌</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Mobile Ordering Simulator Modal (when opened) */}
      {/* ============================================================== */}
      {isMobileSimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#161412] text-[#f4efe8] rounded-3xl shadow-2xl border-2 border-[#382f27] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Phone Top Notch / Status Bar */}
            <div className="bg-[#201a16] px-4 py-3 border-b border-[#2d251f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#fbbf24]" />
                <span className="font-bold text-xs text-[#f5ebd9]">
                  顧客手機點餐模擬器 ({isTakeaway ? '外帶' : `桌號 ${selectedTable}`})
                </span>
              </div>
              <button
                onClick={() => setIsMobileSimOpen(false)}
                className="p-1 rounded text-[#a89f91] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Mobile Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {simOrderSuccess ? (
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#f5ebd9]">手機點餐送單成功！</h3>
                    <p className="text-xs text-[#8c7e70] font-mono">
                      訂單號碼: <strong className="text-[#fbbf24]">{simOrderSuccess.orderNumber}</strong>
                    </p>
                    <p className="text-xs text-emerald-400 mt-1">
                      已即時送往門市 POS 收銀機與廚房出單，後台原料庫存已即時核銷完成！
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#201a16] border border-[#2d251f] text-left text-xs space-y-1 font-mono">
                    <div className="text-[#8c7e70]">品項明細 (共 {simOrderSuccess.itemCount} 杯):</div>
                    {simOrderSuccess.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-[#f5ebd9]">
                        <span>{i.quantity}x {i.chineseName || i.name}</span>
                        <span className="text-[#fbbf24]">${(i.unitPrice * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-[#332b24] flex justify-between font-bold">
                      <span>應付總額:</span>
                      <span className="text-amber-400 text-sm">${simOrderSuccess.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSimOrderSuccess(null);
                      setSimCart([]);
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    再點一單
                  </button>
                </div>
              ) : (
                <>
                  {/* Customer info */}
                  <div className="p-3 rounded-xl bg-[#201a16] border border-[#2d251f] flex items-center justify-between text-xs">
                    <span className="text-[#8c7e70]">取餐人姓名：</span>
                    <input
                      type="text"
                      value={simCustomerName}
                      onChange={(e) => setSimCustomerName(e.target.value)}
                      className="px-2 py-1 bg-[#141210] border border-[#332b24] rounded text-right text-xs text-[#f5ebd9] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Drink selection list */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#fbbf24] flex items-center justify-between">
                      <span>熱門手搖飲選單</span>
                      <span className="text-[10px] text-[#8c7e70] font-normal">點擊快速加入</span>
                    </div>

                    <div className="space-y-2">
                      {POS_MENU_ITEMS.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-[#201a16] border border-[#2d251f] flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#f5ebd9]">{item.chineseName}</div>
                            <div className="text-[10px] text-[#8c7e70]">{item.name}</div>
                            <div className="font-mono text-amber-400 font-bold mt-0.5">
                              ${item.basePrice.toFixed(2)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSimQuickAdd(item)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>點一杯</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Shopping Cart in Simulator */}
                  {simCart.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#201a16] border border-[#d97706]/40 space-y-3 animate-fade-in text-xs">
                      <div className="flex justify-between items-center font-bold text-[#fbbf24]">
                        <span>手機點餐購物車 ({simCart.reduce((s, i) => s + i.quantity, 0)} 杯)</span>
                        <span className="font-mono text-sm">
                          ${simCart.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-2 divide-y divide-[#2d251f]">
                        {simCart.map((i) => (
                          <div key={i.cartItemId} className="pt-2 first:pt-0 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-[#f5ebd9]">{i.chineseName || i.name}</div>
                              <div className="text-[10px] text-[#8c7e70] font-mono">
                                ${i.unitPrice} × {i.quantity}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 border border-[#382f27] rounded-lg bg-[#141210] px-1 py-0.5">
                              <button
                                onClick={() => handleSimUpdateQty(i.cartItemId, -1)}
                                className="px-1.5 text-[#a89f91] hover:text-white"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-amber-400">{i.quantity}</span>
                              <button
                                onClick={() => handleSimUpdateQty(i.cartItemId, 1)}
                                className="px-1.5 text-[#a89f91] hover:text-white"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleSimSubmitOrder}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>確認送出手機點單 (連動後台扣庫存)</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Module 2: Mobile Payment QR Codes */}
      {/* ============================================================== */}
      {activeModule === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Payment Configuration (5 Cols) */}
          <div className="lg:col-span-5 bg-[#1a1715] p-5 rounded-2xl border border-[#2d251f] space-y-5 text-xs">
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                行動支付收款立牌 (Payment QR Terminal)
              </h2>
              <p className="text-xs text-[#8c7e70] mt-0.5">
                提供櫃台顧客掃描手機條碼結帳，支援 LINE Pay、街口支付、台灣 Pay 與 Apple Pay 等主流管道。
              </p>
            </div>

            {/* Quick Amount presets */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#a89f91]">收款金額 (NTD / USD)：</label>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-amber-400">$</span>
                <input
                  type="number"
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full p-2.5 bg-[#141210] border border-[#332b24] rounded-xl text-[#f4efe8] font-mono text-base font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-1.5 pt-1">
                {[65, 130, 200, 350, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setPaymentAmount(amt);
                    }}
                    className={`px-2.5 py-1 rounded-lg border font-mono text-xs cursor-pointer ${
                      paymentAmount === amt
                        ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                        : 'bg-[#201a16] text-[#a89f91] border-[#2b241e]'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Channel Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#a89f91]">收款支付管道：</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'line_pay', label: 'LINE Pay', color: 'text-emerald-400' },
                  { id: 'jko_pay', label: '街口支付 (JKOPAY)', color: 'text-rose-400' },
                  { id: 'taiwan_pay', label: '台灣 Pay (TWQR)', color: 'text-sky-400' },
                  { id: 'apple_pay', label: 'Apple Pay / 感應', color: 'text-[#f5ebd9]' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setPaymentChannel(c.id as typeof paymentChannel);
                    }}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-colors cursor-pointer ${
                      paymentChannel === c.id
                        ? 'bg-[#2a2119] text-[#fbbf24] border-amber-500 font-bold'
                        : 'bg-[#141210] text-[#a89f91] border-[#2b241e]'
                    }`}
                  >
                    <span className={c.color}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulate Customer Payment Action */}
            <div className="pt-2 border-t border-[#26201b] space-y-2">
              <button
                type="button"
                onClick={handleSimulatePaymentSuccess}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>模擬顧客掃碼付款成功 (${paymentAmount})</span>
              </button>

              {paymentSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs text-center animate-fade-in font-medium">
                  {paymentSuccessNotice}
                </div>
              )}
            </div>
          </div>

          {/* Payment QR Placard Visual (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-white text-stone-900 rounded-3xl p-6 shadow-2xl border-4 border-[#2d251f] flex flex-col items-center text-center space-y-4 select-none animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-black tracking-wider text-stone-900 uppercase">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>BOBAFLOW 12 行動支付立牌</span>
              </div>

              <div className="text-xl font-black text-stone-950 tracking-tight">
                掃描 QR 碼完成結帳
              </div>

              <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                NT$ {paymentAmount}
              </div>

              {/* QR Code */}
              <div className="p-3 bg-stone-50 rounded-2xl border-2 border-stone-200 shadow-inner">
                <QRCodeDisplay
                  value={paymentQrPayload}
                  size={190}
                  showDownload={false}
                  showCopy={false}
                  darkColor="#1c1917"
                  lightColor="#f8fafc"
                  className="border-none shadow-none p-0"
                />
              </div>

              <div className="font-mono font-bold text-xs px-3 py-1 rounded-full bg-stone-900 text-[#fbbf24]">
                {paymentChannel === 'line_pay'
                  ? 'LINE Pay 專用收款碼'
                  : paymentChannel === 'jko_pay'
                  ? '街口支付 專用碼'
                  : paymentChannel === 'taiwan_pay'
                  ? '台灣 Pay (TWQR) 整合碼'
                  : 'Apple Pay 感應收款'}
              </div>

              <div className="text-[10px] text-stone-400">
                本 QR 碼符合台灣行動支付 EMVCo / TWQR 共通標準
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Module 3: Warehouse Material QR Labels & Barcode Scanner */}
      {/* ============================================================== */}
      {activeModule === 'material_tags' && (
        <div className="space-y-6">
          {/* Top Bar for Inbound Scan & Filter */}
          <div className="bg-[#1a1715] p-5 rounded-2xl border border-[#2d251f] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                原物料料架 QR 標籤與快速進貨核銷 (Material Rack QR Tags &amp; Inbound Scan)
              </h2>
              <p className="text-xs text-[#8c7e70] mt-0.5">
                每個料架配有專屬 QR Code，調茶師或倉管可直接掃碼查詢原料規格、廠商窗口並一鍵入庫驗收
              </p>
            </div>

            {/* Quick Inbound Scanner Action Bar */}
            <div className="flex flex-wrap items-center gap-2 bg-[#141210] p-2.5 rounded-xl border border-[#2d251f] text-xs">
              <span className="text-[#8c7e70] font-semibold">掃碼快速進貨：</span>
              <select
                value={scannedMaterialId}
                onChange={(e) => setScannedMaterialId(e.target.value)}
                className="p-1.5 bg-[#201a16] border border-[#332b24] rounded-lg text-[#fbbf24] font-medium"
              >
                {Object.values(inventory).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.currentStock}{item.unit})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="100"
                step="100"
                value={scannedQty}
                onChange={(e) => setScannedQty(Math.max(10, parseInt(e.target.value, 10) || 100))}
                className="w-24 p-1.5 bg-[#201a16] border border-[#332b24] rounded-lg text-[#f4efe8] font-mono"
              />

              <button
                type="button"
                onClick={handleExecuteMaterialScan}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-colors cursor-pointer"
              >
                嗶！掃碼入庫
              </button>
            </div>
          </div>

          {/* Success banner if scanned */}
          {scanMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-semibold animate-fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{scanMessage}</span>
            </div>
          )}

          {/* Material Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: '全部原料料架' },
              { id: 'tea', label: '茶湯原葉' },
              { id: 'milk', label: '乳品植物奶' },
              { id: 'sweetener', label: '糖漿果糖' },
              { id: 'topping', label: '粉圓配料' },
              { id: 'packaging', label: '耗材包材' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setMaterialCategoryFilter(c.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                  materialCategoryFilter === c.id
                    ? 'bg-[#2a2119] text-[#fbbf24] border-amber-500 font-bold'
                    : 'bg-[#141210] text-[#a89f91] border-[#2b241e]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Material Rack QR Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.values(inventory)
              .filter(
                (item) =>
                  materialCategoryFilter === 'all' || item.category === materialCategoryFilter
              )
              .map((item) => {
                const itemQrData = `BOBAFLOW://WAREHOUSE/ITEM/${item.id}?unit=${item.unit}&supplier=${encodeURIComponent(item.supplier)}`;
                const isLow = item.currentStock <= item.minStockThreshold;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#1a1715] border border-[#2d251f] flex flex-col justify-between space-y-3 shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <h4 className="font-bold text-sm text-[#f5ebd9]">{item.name}</h4>
                          <span className="text-[10px] text-[#8c7e70] font-mono">{item.id}</span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isLow
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-700'
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          }`}
                        >
                          {isLow ? '低於安全水位' : '在量正常'}
                        </span>
                      </div>

                      {/* White QR Code Tile for printing */}
                      <div className="p-3 bg-white rounded-xl flex flex-col items-center justify-center text-stone-900 border border-stone-200">
                        <QRCodeDisplay
                          value={itemQrData}
                          size={110}
                          showDownload={false}
                          showCopy={false}
                          darkColor="#1c1917"
                          lightColor="#ffffff"
                          className="border-none shadow-none p-0"
                        />
                        <div className="font-mono text-[9px] text-stone-600 mt-1">
                          料架位置: {item.storageLocation || 'A-01'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] font-mono bg-[#141210] p-2 rounded-lg border border-[#2b241e]">
                        <div>
                          <div className="text-[#8c7e70] text-[9px]">實體在庫</div>
                          <div className="font-bold text-[#f5ebd9]">
                            {item.currentStock.toLocaleString()} {item.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#8c7e70] text-[9px]">建議叫貨</div>
                          <div className="font-bold text-amber-400">
                            +{item.reorderAmount} {item.unit}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playCashDrawer();
                        onRestockItem(item.id, item.reorderAmount);
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#2a221b] hover:bg-[#382d23] text-[#fbbf24] border border-[#d97706]/30 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      補貨入庫 (+{item.reorderAmount})
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Module 4: E-Invoice & Carrier Barcode */}
      {/* ============================================================== */}
      {activeModule === 'invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-[#1a1715] p-5 rounded-2xl border border-[#2d251f] space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-sky-400" />
                財政部電子發票與載具條碼 (Taiwan E-Invoice)
              </h2>
              <p className="text-xs text-[#8c7e70] mt-0.5">
                符合台灣財政部電子發票整合服務平台規範之雙 QR Code 格式，支援手機條碼載具儲存。
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#201a16] border border-[#2d251f] space-y-2 font-mono">
              <div className="flex justify-between text-[#8c7e70]">
                <span>營業人統一編號:</span>
                <span className="text-[#f5ebd9] font-bold">12345678</span>
              </div>
              <div className="flex justify-between text-[#8c7e70]">
                <span>門市代號:</span>
                <span className="text-[#f5ebd9]">BOBAFLOW-001 (台北旗艦店)</span>
              </div>
              <div className="flex justify-between text-[#8c7e70]">
                <span>發票字軌號碼:</span>
                <span className="text-amber-400 font-bold">AB-12345678</span>
              </div>
              <div className="flex justify-between text-[#8c7e70]">
                <span>手機條碼載具:</span>
                <span className="text-emerald-400 font-bold">/AB12CD3</span>
              </div>
            </div>

            <div className="text-[11px] text-[#8c7e70] space-y-1">
              <div>• 左側 QR Code：記錄發票字軌、開立時間、隨機碼、未稅與總額。</div>
              <div>• 右側 QR Code：記錄詳細品項單價與數量明細。</div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            {/* E-invoice thermal receipt paper replica */}
            <div className="w-full max-w-sm bg-white text-stone-900 rounded-2xl p-6 shadow-2xl border-4 border-[#2d251f] flex flex-col items-center text-center space-y-3 select-none font-mono text-xs">
              <div className="text-sm font-black text-stone-950">
                電子發票證明聯
              </div>
              <div className="text-base font-black text-stone-950 tracking-wider">
                115年 09-10月
              </div>
              <div className="text-lg font-black text-stone-950 tracking-widest">
                AB-12345678
              </div>

              <div className="text-[11px] text-stone-600 text-left w-full border-t border-b border-stone-300 py-1 space-y-0.5">
                <div>時間: 2026-10-13 15:30:22</div>
                <div>隨機碼: 7788 · 總計: $130</div>
                <div>賣方: 12345678 · 買方: /AB12CD3</div>
              </div>

              {/* Dual QR Code on Taiwanese Invoices */}
              <div className="grid grid-cols-2 gap-3 w-full py-2">
                <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center">
                  <QRCodeDisplay
                    value={invoiceSampleQr}
                    size={110}
                    showDownload={false}
                    showCopy={false}
                    darkColor="#1c1917"
                    lightColor="#ffffff"
                    className="border-none shadow-none p-0"
                  />
                  <span className="text-[9px] text-stone-500 mt-1">發票主要資訊</span>
                </div>

                <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center">
                  <QRCodeDisplay
                    value={invoiceSampleQr}
                    size={110}
                    showDownload={false}
                    showCopy={false}
                    darkColor="#1c1917"
                    lightColor="#ffffff"
                    className="border-none shadow-none p-0"
                  />
                  <span className="text-[9px] text-stone-500 mt-1">品項明細資訊</span>
                </div>
              </div>

              <div className="text-[10px] text-stone-400">
                退換貨請攜帶本發票與電子收據憑單
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
