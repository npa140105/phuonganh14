import React, { useState, useMemo } from 'react';
import {
  POSMenuItem,
  POSCartItem,
  POSOrder,
  InventoryItem,
  DiscountType,
  PaymentMethod,
  OrderStatus
} from '../../types/posBom';
import { POS_MENU_ITEMS, calculateDrinkBOM } from '../../data/posBomData';
import { POSCustomizerModal } from './POSCustomizerModal';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { KitchenDisplay } from './KitchenDisplay';
import { CustomerMobileQRModal } from './CustomerMobileQRModal';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ChefHat,
  SlidersHorizontal,
  Flame,
  CheckCircle,
  Percent,
  Sparkles,
  QrCode
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface POSTerminalProps {
  inventory: Record<string, InventoryItem>;
  orders: POSOrder[];
  onCompleteSale: (order: POSOrder) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onClearCompletedOrders: () => void;
}

export const POSTerminal: React.FC<POSTerminalProps> = ({
  inventory,
  orders,
  onCompleteSale,
  onUpdateOrderStatus,
  onClearCompletedOrders
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'kds'>('register');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart state
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('none');
  const [customerNote, setCustomerNote] = useState<string>('');

  // Modals state
  const [customizingItem, setCustomizingItem] = useState<POSMenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<POSOrder | null>(null);
  const [isMobileQROpen, setIsMobileQROpen] = useState<boolean>(false);

  // Filter menu items
  const filteredMenuItems = useMemo(() => {
    return POS_MENU_ITEMS.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.chineseName.includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'popular') return !!item.popular;
      return item.category === selectedCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Quick 1-tap add with default recipe
  const handleQuickAdd = (item: POSMenuItem) => {
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

    const cartItem: POSCartItem = {
      cartItemId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
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

    setCart((prev) => [...prev, cartItem]);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    sounds.playClick();
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    sounds.playClick();
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    sounds.playClick();
    setCart([]);
    setDiscountType('none');
    setCustomerNote('');
  };

  // Cart Financials
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartTotalCogs = cart.reduce((sum, item) => sum + item.itemCogs * item.quantity, 0);

  let discountAmount = 0;
  if (discountType === 'student') discountAmount = cartSubtotal * 0.1;
  else if (discountType === 'vip') discountAmount = cartSubtotal * 0.15;
  else if (discountType === 'happy_hour') discountAmount = Math.min(cartSubtotal, 1.0);
  else if (discountType === 'staff') discountAmount = cartSubtotal * 0.2;

  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const tax = Number((discountedSubtotal * 0.0825).toFixed(2));
  const orderTotal = Number((discountedSubtotal + tax).toFixed(2));
  const grossProfit = Number((discountedSubtotal - cartTotalCogs).toFixed(2));
  const overallMarginPct =
    discountedSubtotal > 0
      ? Number(((grossProfit / discountedSubtotal) * 100).toFixed(1))
      : 0;

  // Checkout process
  const handleConfirmPayment = (
    paymentMethod: PaymentMethod,
    cashTendered?: number,
    change?: number
  ) => {
    const orderNumber = `#A-${100 + orders.length + 1}`;
    const newOrder: POSOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      timestamp: Date.now(),
      items: [...cart],
      itemCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: Number(cartSubtotal.toFixed(2)),
      discountType,
      discountAmount: Number(discountAmount.toFixed(2)),
      tax,
      total: orderTotal,
      totalCogs: Number(cartTotalCogs.toFixed(2)),
      grossProfit,
      profitMarginPct: overallMarginPct,
      paymentMethod,
      cashTendered,
      changeGiven: change,
      status: 'pending',
      customerNote: customerNote.trim() || undefined
    };

    onCompleteSale(newOrder);
    setLastCompletedOrder(newOrder);
    setIsCheckoutOpen(false);
    setCart([]);
    setDiscountType('none');
    setCustomerNote('');
  };

  const activeKdsCount = orders.filter((o) => o.status !== 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Sub navigation between Cashier and KDS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d251f] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#f5ebd9] tracking-tight font-display flex items-center gap-2.5">
            <span>門市收銀前台銷售系統 (POS Register)</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#2a221b] text-[#fbbf24] border border-[#d97706]/20">
              Terminal 01 · 實時庫存連動
            </span>
          </h1>
          <p className="text-xs text-[#8c7e70]">
            前台點餐收銀 · 自動計算銷售金額與數量 · 結帳後即時匯入後台扣減原物料庫存
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1a1715] p-1 rounded-xl border border-[#2d251f]">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('register');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'register'
                ? 'bg-amber-500 text-stone-950 font-bold shadow'
                : 'text-[#a89f91] hover:text-[#f4efe8]'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>點餐收銀櫃台</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('kds');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 relative ${
              activeSubTab === 'kds'
                ? 'bg-amber-500 text-stone-950 font-bold shadow'
                : 'text-[#a89f91] hover:text-[#f4efe8]'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>廚房製作看板</span>
            {activeKdsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                {activeKdsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsMobileQROpen(true);
            }}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#fbbf24] hover:bg-[#28211b] border border-[#d97706]/30 transition-all cursor-pointer flex items-center gap-1.5"
            title="開啟顧客手機掃碼點餐立牌 QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>掃碼點餐立牌</span>
          </button>
        </div>
      </div>

      {/* Main View Display */}
      {activeSubTab === 'kds' ? (
        <KitchenDisplay
          orders={orders}
          onUpdateOrderStatus={onUpdateOrderStatus}
          onClearCompletedOrders={onClearCompletedOrders}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Menu & Items (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Quick Demo Batch Bar */}
            <div className="p-3 rounded-xl bg-[#201a16] border border-[#332a22] flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-[#fbbf24] font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>快速模擬點餐：</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const tiger = POS_MENU_ITEMS.find((m) => m.id === 'pos_tiger_brown_sugar');
                    if (tiger) {
                      handleQuickAdd(tiger);
                      setTimeout(() => handleQuickAdd(tiger), 50);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#2a221b] hover:bg-[#382d23] text-[#f5ebd9] border border-[#3d3126] text-xs transition-colors cursor-pointer"
                >
                  + 黑糖珍珠鮮奶 ×2
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const matcha = POS_MENU_ITEMS.find((m) => m.id === 'pos_uji_matcha_float');
                    if (matcha) handleQuickAdd(matcha);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#2a221b] hover:bg-[#382d23] text-[#f5ebd9] border border-[#3d3126] text-xs transition-colors cursor-pointer"
                >
                  + 宇治抹茶歐蕾 ×1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const mango = POS_MENU_ITEMS.find((m) => m.id === 'pos_mango_pomelo_sago');
                    if (mango) handleQuickAdd(mango);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#2a221b] hover:bg-[#382d23] text-[#f5ebd9] border border-[#3d3126] text-xs transition-colors cursor-pointer"
                >
                  + 楊枝甘露特調 ×1
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8c7e70] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜尋飲品名稱、中文品名、茶底或配料..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1a1715] text-[#f4efe8] placeholder-[#78716c] text-xs rounded-xl border border-[#332b24] focus:outline-none focus:border-[#d97706] transition-colors"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: '全部飲品' },
                  { id: 'popular', label: '🔥 熱銷爆款' },
                  { id: 'milk_tea', label: '鮮奶茶系列' },
                  { id: 'cheese_foam', label: '芝士奶蓋' },
                  { id: 'fruit_tea', label: '特調鮮果茶' },
                  { id: 'specialty', label: '職人特調' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#2a2119] text-[#fbbf24] border border-[#d97706]/40 shadow-sm'
                        : 'bg-[#181513] text-[#a89f91] border border-[#2b241e] hover:text-[#f4efe8]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMenuItems.map((item) => {
                // Calculate quick BOM for badge
                const bom = calculateDrinkBOM(
                  item.defaultTea,
                  item.defaultMilk,
                  item.defaultSweetener,
                  item.defaultSweetness,
                  item.defaultToppings,
                  'regular',
                  !!item.requiresCheeseFoam,
                  inventory
                );

                const cogsMargin = (
                  ((item.basePrice - bom.cogs) / item.basePrice) *
                  100
                ).toFixed(0);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#1a1715] border border-[#2e2620] hover:border-[#4d4036] transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-[#f5ebd9] group-hover:text-[#fbbf24] transition-colors">
                            {item.name}
                          </h3>
                          <div className="text-xs text-[#8c7e70]">{item.chineseName}</div>
                        </div>

                        <span className="font-mono font-extrabold text-sm text-[#fbbf24] bg-[#241e19] px-2 py-0.5 rounded border border-[#382f27]">
                          ${item.basePrice.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-[#a89f91] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Specs badges */}
                      <div className="flex flex-wrap gap-1 text-[10px] text-[#8c7e70]">
                        <span className="px-1.5 py-0.5 rounded bg-[#201a16] border border-[#2b241e]">
                          {item.defaultTea.replace('_', ' ')}
                        </span>
                        {item.defaultMilk !== 'none' && (
                          <span className="px-1.5 py-0.5 rounded bg-[#201a16] border border-[#2b241e]">
                            {item.defaultMilk.replace('_', ' ')}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-[#201a16] border border-[#2b241e] text-emerald-400">
                          {cogsMargin}% margin
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-[#26201a]">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        className="py-2 px-3 rounded-lg bg-[#251f1a] hover:bg-[#322a23] text-[#f4efe8] text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="1-tap add with default recipe"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#fbbf24]" />
                        <span>Quick Add</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setCustomizingItem(item);
                        }}
                        className="py-2 px-3 rounded-lg bg-[#2a221b] hover:bg-[#362b22] text-[#fbbf24] border border-[#d97706]/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Customize size, ice, sugar, toppings"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Customize</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Cart / Order Ticket (4 Cols) */}
          <div className="lg:col-span-4 bg-[#1a1715] rounded-2xl border border-[#2e2620] overflow-hidden flex flex-col sticky top-20 shadow-xl">
            {/* Ticket Header */}
            <div className="p-4 border-b border-[#2d251f] bg-[#211c18] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#2a2119] text-[#fbbf24]">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#f5ebd9]">前台點餐購物車</h2>
                  <div className="text-[11px] text-[#8c7e70]">
                    已選擇共 {cart.reduce((s, i) => s + i.quantity, 0)} 杯飲品
                  </div>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="p-1.5 rounded text-[#a89f91] hover:text-rose-400 hover:bg-[#2c231f] transition-colors cursor-pointer"
                  title="清空購物車"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="p-4 overflow-y-auto max-h-[380px] space-y-3 divide-y divide-[#26201b]">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-[#8c7e70] space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#201a16] flex items-center justify-center text-[#575047]">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-[#a89f91]">購物車目前為空</div>
                  <p className="text-[11px] max-w-[200px] mx-auto text-[#786e63]">
                    點擊飲品「快速加入」或「客製規格」，即可開始建立點單並計算金額數量。
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-xs text-[#f5ebd9]">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[#8c7e70]">
                          {item.size.toUpperCase()} · Ice {item.iceLevel}% · Sweet {item.sweetness}%
                        </div>
                        {item.toppings.length > 0 && (
                          <div className="text-[10px] text-[#fbbf24]">
                            + {item.toppings.map((t) => t.replace('_', ' ')).join(', ')}
                          </div>
                        )}
                        {item.requiresTorch && (
                          <div className="text-[10px] text-rose-400 flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> Torched Cap
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-[#fbbf24]">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-[9px] text-[#8c7e70] font-mono">
                          COGS: ${(item.itemCogs * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-[#332b24] rounded-lg bg-[#141210]">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.cartItemId, -1)}
                          className="px-2 py-0.5 text-[#a89f91] hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-mono text-xs font-bold text-[#fbbf24]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.cartItemId, 1)}
                          className="px-2 py-0.5 text-[#a89f91] hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.cartItemId)}
                        className="text-[11px] text-[#8c7e70] hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount Selectors */}
            {cart.length > 0 && (
              <div className="px-4 py-3 border-t border-[#26201a] bg-[#1d1815] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[#a89f91] flex items-center gap-1">
                    <Percent className="w-3 h-3 text-[#fbbf24]" />
                    Promotions &amp; Discounts
                  </span>
                  {discountType !== 'none' && (
                    <span className="text-emerald-400 font-bold font-mono">
                      -${discountAmount.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'student', label: '10% Stud.' },
                    { id: 'vip', label: '15% VIP' },
                    { id: 'staff', label: '20% Staff' }
                  ].map((disc) => (
                    <button
                      key={disc.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setDiscountType(disc.id as DiscountType);
                      }}
                      className={`py-1 px-1 rounded-lg border text-center transition-colors cursor-pointer ${
                        discountType === disc.id
                          ? 'bg-amber-600/30 text-[#fbbf24] border-amber-500 font-bold'
                          : 'bg-[#181412] text-[#8c7e70] border-[#332b24] hover:text-[#f4efe8]'
                      }`}
                    >
                      {disc.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Optional customer note / buzzer #..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[11px] bg-[#141210] border border-[#2d251f] rounded-lg text-[#f4efe8] placeholder-[#78716c] focus:outline-none focus:border-[#d97706]"
                />
              </div>
            )}

            {/* Order Totals & Live BOM Margins */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-[#2d251f] bg-[#171412] space-y-3">
                {/* Live Order BOM Margin Meter */}
                <div className="p-2.5 rounded-lg bg-[#1f1a16] border border-[#2d251f] text-[11px] font-mono space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8c7e70] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#fbbf24]" />
                      Cart COGS: ${cartTotalCogs.toFixed(2)}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      Margin: {overallMarginPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#141210] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, overallMarginPct)}%` }}
                    />
                  </div>
                </div>

                {/* Subtotal, tax, total */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#8c7e70]">
                    <span>品項小計 (共 {cart.reduce((s, i) => s + i.quantity, 0)} 杯)</span>
                    <span className="font-mono text-[#f4efe8] font-bold">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>優惠折扣折抵</span>
                      <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#8c7e70]">
                    <span>營業稅 (8.25%)</span>
                    <span className="font-mono text-[#f4efe8]">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-[#2d251f]">
                    <span className="text-[#f5ebd9]">結帳應付總額</span>
                    <span className="text-[#fbbf24] font-mono text-base">
                      ${orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Tender Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>立即結帳出單 (共 {cart.reduce((s, i) => s + i.quantity, 0)} 杯 · 應收 ${orderTotal.toFixed(2)})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drink Customizer Modal */}
      {customizingItem && (
        <POSCustomizerModal
          item={customizingItem}
          inventory={inventory}
          onAddToCart={(cartItem) => {
            setCart((prev) => [...prev, cartItem]);
          }}
          onClose={() => setCustomizingItem(null)}
        />
      )}

      {/* Checkout Tender Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          total={orderTotal}
          subtotal={cartSubtotal}
          tax={tax}
          discountAmount={discountAmount}
          onConfirmPayment={handleConfirmPayment}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}

      {/* Thermal Receipt Modal */}
      {lastCompletedOrder && (
        <ReceiptModal
          order={lastCompletedOrder}
          onClose={() => setLastCompletedOrder(null)}
        />
      )}

      {/* Customer Mobile Ordering QR Modal */}
      <CustomerMobileQRModal
        isOpen={isMobileQROpen}
        onClose={() => setIsMobileQROpen(false)}
      />
    </div>
  );
};
