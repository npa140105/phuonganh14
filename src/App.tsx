/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CurrentCupState,
  CupType,
  SealDesign,
  StrawType,
  UserShopProgress,
  BobaRecipe
} from './types/boba';
import { TopBar, AppTabType } from './components/TopBar';
import { CraftingStudio } from './components/CraftingStudio';
import { RushHourMode } from './components/RushHourMode';
import { RecipeCodex } from './components/RecipeCodex';
import { ShopUpgrades } from './components/ShopUpgrades';
import { POSTerminal } from './components/pos/POSTerminal';
import { KitchenDisplay } from './components/pos/KitchenDisplay';
import { BOMInventoryHub } from './components/bom/BOMInventoryHub';
import { AnalyticsReportsView } from './components/analytics/AnalyticsReportsView';
import { QRCodeHubView } from './components/qrcode/QRCodeHubView';
import { INITIAL_INVENTORY } from './data/posBomData';
import {
  InventoryItem,
  POSOrder,
  WasteRecord,
  OrderStatus,
  InventoryCategory,
  StockMovementLog,
  MovementType,
  UnitType
} from './types/posBom';
import { sounds } from './services/soundEffects';
import {
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Boxes,
  TrendingUp,
  Receipt
} from 'lucide-react';

const DEFAULT_CUP_STATE: CurrentCupState = {
  tea: 'assam_black',
  teaVolume: 40,
  milk: 'whole_milk',
  milkVolume: 40,
  sweetener: 'brown_sugar',
  sweetness: 70,
  iceLevel: 70,
  iceCubesCount: 6,
  toppings: ['black_pearls'],
  toppingCounts: {
    black_pearls: 6,
    popping_boba: 0,
    lychee_jelly: 0,
    egg_pudding: 0,
    grass_jelly: 0,
    cheese_foam: 0
  },
  hasCheeseFoam: false,
  isTorched: false,
  isSealed: false,
  isStrawPunctured: false,
  cupType: 'classic',
  strawType: 'classic_black',
  sealDesign: 'tiger_stripe',
  shakenProgress: 0
};

const DEFAULT_SHOP_PROGRESS: UserShopProgress = {
  coins: 180,
  starsEarned: { 1: 3 },
  highestDayUnlocked: 1,
  recipesMastered: ['taipei_classic_heritage'],
  unlockedCups: ['classic'],
  unlockedStraws: ['classic_black'],
  unlockedSeals: ['tiger_stripe'],
  activeCup: 'classic',
  activeStraw: 'classic_black',
  activeSeal: 'tiger_stripe',
  customRecipes: []
};

export interface SaleToastNotification {
  id: string;
  orderNumber: string;
  totalCups: number;
  totalAmount: number;
  deductedItems: Array<{ name: string; quantity: number; unit: string; cost: number }>;
  lowStockWarnings: Array<{ name: string; currentStock: number; unit: string; minStockThreshold: number }>;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTabType>('pos');
  const [isMuted, setIsMuted] = useState(false);
  const [saleToast, setSaleToast] = useState<SaleToastNotification | null>(null);

  // Load progress from localStorage
  const [progress, setProgress] = useState<UserShopProgress>(() => {
    try {
      const saved = localStorage.getItem('bobaflow_user_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SHOP_PROGRESS;
  });

  // Physical Warehouse Inventory Stock state (persisted)
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>(() => {
    try {
      const saved = localStorage.getItem('bobaflow_inventory_stock');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with initial in case of new items
        return { ...INITIAL_INVENTORY, ...parsed };
      }
    } catch {
      // fallback
    }
    return INITIAL_INVENTORY;
  });

  // POS Orders state (persisted)
  const [posOrders, setPosOrders] = useState<POSOrder[]>(() => {
    try {
      const saved = localStorage.getItem('bobaflow_pos_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'ord_sample_1',
        orderNumber: '#A-101',
        timestamp: Date.now() - 1000 * 60 * 18,
        items: [
          {
            cartItemId: 'item_s1',
            menuItemId: 'pos_tiger_brown_sugar',
            name: 'Tiger Brown Sugar Deerioca',
            chineseName: '黑糖珍珠鮮奶',
            size: 'regular',
            tea: 'assam_black',
            milk: 'whole_milk',
            sweetener: 'brown_sugar',
            sweetness: 70,
            iceLevel: 70,
            toppings: ['black_pearls'],
            requiresCheeseFoam: true,
            requiresTorch: true,
            unitPrice: 5.75,
            quantity: 2,
            itemCogs: 1.15,
            bomBreakdown: [
              { ingredientId: 'tea_assam', name: 'Assam Black Tea (Brewed)', quantity: 200, unit: 'ml', cost: 0.5 },
              { ingredientId: 'milk_whole', name: 'Local Organic Whole Milk', quantity: 120, unit: 'ml', cost: 0.264 },
              { ingredientId: 'syrup_brown_sugar', name: 'Okinawa Roasted Brown Sugar Syrup', quantity: 22, unit: 'ml', cost: 0.099 },
              { ingredientId: 'top_black_pearls', name: 'Slow-Simmered Tapioca Pearls', quantity: 65, unit: 'g', cost: 0.228 },
              { ingredientId: 'pack_cup_reg', name: '500ml Regular PP Cup', quantity: 1, unit: 'units', cost: 0.12 },
              { ingredientId: 'pack_sealing_film', name: 'BobaFlow Sealing Film', quantity: 1, unit: 'units', cost: 0.025 },
              { ingredientId: 'pack_straw_jumbo', name: '12mm Slanted Jumbo Straw', quantity: 1, unit: 'units', cost: 0.02 }
            ]
          }
        ],
        itemCount: 2,
        subtotal: 11.5,
        discountType: 'none',
        discountAmount: 0,
        tax: 0.95,
        total: 12.45,
        totalCogs: 2.3,
        grossProfit: 9.2,
        profitMarginPct: 80.0,
        paymentMethod: 'card',
        status: 'completed'
      },
      {
        id: 'ord_sample_2',
        orderNumber: '#A-102',
        timestamp: Date.now() - 1000 * 60 * 7,
        items: [
          {
            cartItemId: 'item_s2',
            menuItemId: 'pos_uji_matcha_float',
            name: 'Uji Matcha Velvet Float',
            chineseName: '宇治抹茶歐蕾',
            size: 'large',
            tea: 'ceremonial_matcha',
            milk: 'oat_milk',
            sweetener: 'golden_honey',
            sweetness: 50,
            iceLevel: 30,
            toppings: ['black_pearls'],
            requiresCheeseFoam: false,
            requiresTorch: false,
            unitPrice: 7.35,
            quantity: 1,
            itemCogs: 1.58,
            bomBreakdown: [
              { ingredientId: 'tea_matcha', name: 'Ceremonial Uji Matcha', quantity: 280, unit: 'ml', cost: 0.91 },
              { ingredientId: 'milk_oat', name: 'Barista Oat Milk', quantity: 168, unit: 'ml', cost: 0.638 },
              { ingredientId: 'top_black_pearls', name: 'Tapioca Pearls', quantity: 85, unit: 'g', cost: 0.298 },
              { ingredientId: 'pack_cup_large', name: '700ml Large PP Cup', quantity: 1, unit: 'units', cost: 0.16 },
              { ingredientId: 'pack_sealing_film', name: 'Sealing Film', quantity: 1, unit: 'units', cost: 0.025 },
              { ingredientId: 'pack_straw_jumbo', name: 'Jumbo Straw', quantity: 1, unit: 'units', cost: 0.02 }
            ]
          }
        ],
        itemCount: 1,
        subtotal: 7.35,
        discountType: 'student',
        discountAmount: 0.74,
        tax: 0.55,
        total: 7.16,
        totalCogs: 1.58,
        grossProfit: 5.03,
        profitMarginPct: 76.1,
        paymentMethod: 'qr_pay',
        status: 'ready'
      }
    ];
  });

  // Waste logs state (persisted)
  const [wasteLogs, setWasteLogs] = useState<WasteRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bobaflow_waste_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'waste_initial',
        timestamp: Date.now() - 1000 * 60 * 120,
        ingredientId: 'tea_jasmine',
        ingredientName: 'Jasmine Jade Green (Brewed)',
        quantity: 800,
        unit: 'ml',
        costLoss: 2.24,
        reason: 'expired'
      }
    ];
  });

  // Stock movements log (persisted)
  const [movementLogs, setMovementLogs] = useState<StockMovementLog[]>(() => {
    try {
      const saved = localStorage.getItem('bobaflow_movement_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'mov_init_1',
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
        ingredientId: 'tea_assam',
        ingredientName: 'Assam Black Tea (Brewed)',
        type: 'restock',
        deltaQuantity: 5000,
        unit: 'ml',
        balanceAfter: 7500,
        referenceId: 'PO-20260901',
        notes: '晨間大桶茶湯煮製入庫'
      },
      {
        id: 'mov_init_2',
        timestamp: Date.now() - 1000 * 60 * 18,
        ingredientId: 'tea_assam',
        ingredientName: 'Assam Black Tea (Brewed)',
        type: 'pos_deduction',
        deltaQuantity: -400,
        unit: 'ml',
        balanceAfter: 7100,
        referenceId: 'Order #A-101',
        notes: '門市 POS 即時核銷扣除'
      }
    ];
  });

  // Save inventory & pos data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bobaflow_inventory_stock', JSON.stringify(inventory));
    } catch {
      // ignore
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('bobaflow_pos_orders', JSON.stringify(posOrders));
    } catch {
      // ignore
    }
  }, [posOrders]);

  useEffect(() => {
    try {
      localStorage.setItem('bobaflow_waste_logs', JSON.stringify(wasteLogs));
    } catch {
      // ignore
    }
  }, [wasteLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('bobaflow_movement_logs', JSON.stringify(movementLogs));
    } catch {
      // ignore
    }
  }, [movementLogs]);

  // Helper to log stock movements
  const logStockMovement = (
    ingredientId: string,
    ingredientName: string,
    type: MovementType,
    deltaQuantity: number,
    unit: UnitType,
    balanceAfter: number,
    referenceId?: string,
    notes?: string
  ) => {
    const newLog: StockMovementLog = {
      id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      ingredientId,
      ingredientName,
      type,
      deltaQuantity,
      unit,
      balanceAfter,
      referenceId,
      notes
    };
    setMovementLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  // Active cup state
  const [cupState, setCupState] = useState<CurrentCupState>(() => ({
    ...DEFAULT_CUP_STATE,
    cupType: progress.activeCup,
    strawType: progress.activeStraw,
    sealDesign: progress.activeSeal
  }));

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem('bobaflow_user_progress', JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // Keep cup aesthetics in sync with shop equipment
  useEffect(() => {
    setCupState((prev) => ({
      ...prev,
      cupType: progress.activeCup,
      strawType: progress.activeStraw,
      sealDesign: progress.activeSeal
    }));
  }, [progress.activeCup, progress.activeStraw, progress.activeSeal]);

  // Audio mute toggle
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.isMuted = next;
  };

  // Reset current cup
  const handleResetCup = () => {
    setCupState({
      tea: null,
      teaVolume: 0,
      milk: 'none',
      milkVolume: 0,
      sweetener: 'none',
      sweetness: 50,
      iceLevel: 0,
      iceCubesCount: 0,
      toppings: [],
      toppingCounts: {
        black_pearls: 0,
        popping_boba: 0,
        lychee_jelly: 0,
        egg_pudding: 0,
        grass_jelly: 0,
        cheese_foam: 0
      },
      hasCheeseFoam: false,
      isTorched: false,
      isSealed: false,
      isStrawPunctured: false,
      cupType: progress.activeCup,
      strawType: progress.activeStraw,
      sealDesign: progress.activeSeal,
      shakenProgress: 0
    });
  };

  // Save custom recipe
  const handleSaveCustomRecipe = (name: string, description: string) => {
    const newRecipe: BobaRecipe = {
      id: `custom_${Date.now()}`,
      codeNumber: progress.customRecipes.length + 13,
      name,
      tagline: description,
      description,
      tea: cupState.tea || 'assam_black',
      teaRatio: cupState.teaVolume,
      milk: cupState.milk,
      milkRatio: cupState.milkVolume,
      sweetener: cupState.sweetener,
      recommendedSweetness: cupState.sweetness,
      recommendedIce: cupState.iceLevel,
      requiredToppings: [...cupState.toppings],
      requiresCheeseFoam: cupState.hasCheeseFoam,
      requiresTorch: cupState.isTorched,
      accentColor: '#f59e0b',
      difficulty: 'Medium',
      flavorProfile: {
        teaStrength: 4,
        sweetness: 3,
        creaminess: 4,
        chewiness: 4,
        aroma: 4
      }
    };

    setProgress((prev) => ({
      ...prev,
      customRecipes: [...prev.customRecipes, newRecipe]
    }));
  };

  // Brew a recipe from the Codex
  const handleBrewRecipe = (recipe: BobaRecipe) => {
    sounds.playClick();
    const toppingCounts = {
      black_pearls: 0,
      popping_boba: 0,
      lychee_jelly: 0,
      egg_pudding: 0,
      grass_jelly: 0,
      cheese_foam: 0
    };
    recipe.requiredToppings.forEach((t) => {
      toppingCounts[t] = 6;
    });

    const iceMap: Record<number, number> = { 0: 0, 30: 3, 70: 6, 100: 9 };

    setCupState({
      tea: recipe.tea,
      teaVolume: recipe.teaRatio,
      milk: recipe.milk,
      milkVolume: recipe.milkRatio,
      sweetener: recipe.sweetener,
      sweetness: recipe.recommendedSweetness,
      iceLevel: recipe.recommendedIce,
      iceCubesCount: iceMap[recipe.recommendedIce] || 4,
      toppings: [...recipe.requiredToppings],
      toppingCounts,
      hasCheeseFoam: !!recipe.requiresCheeseFoam,
      isTorched: !!recipe.requiresTorch,
      isSealed: false,
      isStrawPunctured: false,
      cupType: progress.activeCup,
      strawType: progress.activeStraw,
      sealDesign: progress.activeSeal,
      shakenProgress: 50
    });

    setCurrentTab('studio');
  };

  // Complete a Day in Rush Hour
  const handleCompleteDay = (day: number, stars: number, coinsEarned: number) => {
    setProgress((prev) => {
      const prevStars = prev.starsEarned[day] || 0;
      const updatedStars = { ...prev.starsEarned, [day]: Math.max(prevStars, stars) };
      const nextUnlocked = day >= prev.highestDayUnlocked && day < 12 ? day + 1 : prev.highestDayUnlocked;

      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        starsEarned: updatedStars,
        highestDayUnlocked: nextUnlocked
      };
    });
  };

  // Shop equip handlers
  const handlePurchaseOrEquipCup = (cup: CupType, price: number) => {
    setProgress((prev) => {
      const isUnlocked = prev.unlockedCups.includes(cup);
      if (isUnlocked) {
        return { ...prev, activeCup: cup };
      }
      if (prev.coins >= price) {
        return {
          ...prev,
          coins: prev.coins - price,
          unlockedCups: [...prev.unlockedCups, cup],
          activeCup: cup
        };
      }
      return prev;
    });
  };

  const handlePurchaseOrEquipStraw = (straw: StrawType, price: number) => {
    setProgress((prev) => {
      const isUnlocked = prev.unlockedStraws.includes(straw);
      if (isUnlocked) {
        return { ...prev, activeStraw: straw };
      }
      if (prev.coins >= price) {
        return {
          ...prev,
          coins: prev.coins - price,
          unlockedStraws: [...prev.unlockedStraws, straw],
          activeStraw: straw
        };
      }
      return prev;
    });
  };

  const handlePurchaseOrEquipSeal = (seal: SealDesign, price: number) => {
    setProgress((prev) => {
      const isUnlocked = prev.unlockedSeals.includes(seal);
      if (isUnlocked) {
        return { ...prev, activeSeal: seal };
      }
      if (prev.coins >= price) {
        return {
          ...prev,
          coins: prev.coins - price,
          unlockedSeals: [...prev.unlockedSeals, seal],
          activeSeal: seal
        };
      }
      return prev;
    });
  };

  // POS & BOM Operations Handlers
  const handleCompleteSale = (newOrder: POSOrder) => {
    // 1. Add to orders
    setPosOrders((prev) => [newOrder, ...prev]);

    // Track deductions and warnings for toast
    const deductedMap: Record<string, { name: string; quantity: number; unit: string; cost: number }> = {};
    const lowWarnings: Array<{ name: string; currentStock: number; unit: string; minStockThreshold: number }> = [];

    // 2. Automatically deduct materials based on BOM and log movements
    setInventory((prev) => {
      const updated = { ...prev };
      newOrder.items.forEach((item) => {
        item.bomBreakdown.forEach((bomItem) => {
          if (updated[bomItem.ingredientId]) {
            const current = updated[bomItem.ingredientId].currentStock;
            const deduction = bomItem.quantity * item.quantity;
            const newStock = Math.max(0, current - deduction);
            updated[bomItem.ingredientId] = {
              ...updated[bomItem.ingredientId],
              currentStock: newStock
            };

            // Accumulate deduction summary
            if (!deductedMap[bomItem.ingredientId]) {
              deductedMap[bomItem.ingredientId] = {
                name: bomItem.name,
                quantity: 0,
                unit: bomItem.unit,
                cost: 0
              };
            }
            deductedMap[bomItem.ingredientId].quantity += deduction;
            deductedMap[bomItem.ingredientId].cost += bomItem.cost * item.quantity;

            // Check if dropped below safety threshold
            if (newStock <= updated[bomItem.ingredientId].minStockThreshold) {
              const alreadyWarned = lowWarnings.some((w) => w.name === bomItem.name);
              if (!alreadyWarned) {
                lowWarnings.push({
                  name: bomItem.name,
                  currentStock: newStock,
                  minStockThreshold: updated[bomItem.ingredientId].minStockThreshold,
                  unit: bomItem.unit
                });
              }
            }

            logStockMovement(
              bomItem.ingredientId,
              bomItem.name,
              'pos_deduction',
              -deduction,
              bomItem.unit,
              newStock,
              newOrder.orderNumber,
              `門市收銀 POS 即時核銷 - ${item.name} (${item.quantity}杯)`
            );
          }
        });
      });

      return updated;
    });

    // 3. Trigger Real-time Sale & Inventory Deduction Toast
    setSaleToast({
      id: `toast_${Date.now()}`,
      orderNumber: newOrder.orderNumber,
      totalCups: newOrder.itemCount,
      totalAmount: newOrder.total,
      deductedItems: Object.values(deductedMap),
      lowStockWarnings: lowWarnings
    });

    // 4. Award points to player
    const earnedCoins = Math.max(5, Math.round(newOrder.total * 3));
    setProgress((prev) => ({
      ...prev,
      coins: prev.coins + earnedCoins
    }));
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setPosOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleClearCompletedOrders = () => {
    setPosOrders((prev) => prev.filter((o) => o.status !== 'completed'));
  };

  const handleUpdateInventoryStock = (ingredientId: string, newStock: number) => {
    setInventory((prev) => {
      const item = prev[ingredientId];
      if (!item) return prev;
      const delta = newStock - item.currentStock;
      logStockMovement(
        item.id,
        item.name,
        'manual_adjustment',
        delta,
        item.unit,
        Math.max(0, newStock),
        '手動校正',
        `手動設定在庫為 ${newStock} ${item.unit}`
      );
      return {
        ...prev,
        [ingredientId]: {
          ...item,
          currentStock: Math.max(0, newStock)
        }
      };
    });
  };

  const handleRestockItem = (ingredientId: string, amount: number) => {
    setInventory((prev) => {
      const item = prev[ingredientId];
      if (!item) return prev;
      const nextStock = Math.min(item.capacity, item.currentStock + amount);
      logStockMovement(
        item.id,
        item.name,
        'restock',
        amount,
        item.unit,
        nextStock,
        '補貨入庫',
        `快速進貨入庫 +${amount} ${item.unit}`
      );
      return {
        ...prev,
        [ingredientId]: {
          ...item,
          currentStock: nextStock,
          lastRestocked: new Date().toISOString()
        }
      };
    });
  };

  const handleBulkRestockCategory = (category: InventoryCategory) => {
    setInventory((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        if (updated[id].category === category) {
          const item = updated[id];
          const added = item.capacity - item.currentStock;
          if (added > 0) {
            logStockMovement(
              item.id,
              item.name,
              'restock',
              added,
              item.unit,
              item.capacity,
              '全品項進貨',
              `整批補滿至倉庫容量 (+${added} ${item.unit})`
            );
          }
          updated[id] = {
            ...item,
            currentStock: item.capacity,
            lastRestocked: new Date().toISOString()
          };
        }
      });
      return updated;
    });
  };

  const handleUpdateUnitCost = (ingredientId: string, newUnitCost: number) => {
    setInventory((prev) => {
      if (!prev[ingredientId]) return prev;
      return {
        ...prev,
        [ingredientId]: {
          ...prev[ingredientId],
          unitCost: newUnitCost
        }
      };
    });
  };

  const handleLogWaste = (waste: WasteRecord) => {
    setWasteLogs((prev) => [waste, ...prev]);
    // Deduct wasted amount from stock
    setInventory((prev) => {
      const item = prev[waste.ingredientId];
      if (!item) return prev;
      const newStock = Math.max(0, item.currentStock - waste.quantity);
      logStockMovement(
        item.id,
        item.name,
        'waste_loss',
        -waste.quantity,
        item.unit,
        newStock,
        '報廢損耗',
        `報廢原因: ${waste.reason} (-${waste.quantity} ${item.unit}, 損失 $${waste.costLoss.toFixed(2)})`
      );
      return {
        ...prev,
        [waste.ingredientId]: {
          ...item,
          currentStock: newStock
        }
      };
    });
  };

  const handleSaveInventoryItem = (item: InventoryItem) => {
    setInventory((prev) => ({
      ...prev,
      [item.id]: item
    }));
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    setInventory((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const handleApplyStocktake = (
    adjustments: Array<{ ingredientId: string; newStock: number; variance: number; costVariance: number }>
  ) => {
    setInventory((prev) => {
      const updated = { ...prev };
      adjustments.forEach((adj) => {
        const item = updated[adj.ingredientId];
        if (item) {
          updated[adj.ingredientId] = {
            ...item,
            currentStock: adj.newStock,
            lastRestocked: new Date().toISOString()
          };
          logStockMovement(
            item.id,
            item.name,
            'stocktake_adjustment',
            adj.variance,
            item.unit,
            adj.newStock,
            '實體盤點',
            adj.variance >= 0
              ? `實體盤盈 +${adj.variance} ${item.unit} (帳差金額: +$${adj.costVariance.toFixed(2)})`
              : `盤虧差異 ${adj.variance} ${item.unit} (帳差金額: -$${Math.abs(adj.costVariance).toFixed(2)})`
          );
        }
      });
      return updated;
    });
  };

  const handleReceivePurchaseOrder = (
    itemsToRestock: Array<{ ingredientId: string; amount: number; supplier: string }>
  ) => {
    setInventory((prev) => {
      const updated = { ...prev };
      itemsToRestock.forEach((entry) => {
        const item = updated[entry.ingredientId];
        if (item) {
          const nextStock = Math.min(item.capacity, item.currentStock + entry.amount);
          updated[entry.ingredientId] = {
            ...item,
            currentStock: nextStock,
            lastRestocked: new Date().toISOString()
          };
          logStockMovement(
            item.id,
            item.name,
            'restock',
            entry.amount,
            item.unit,
            nextStock,
            '採購單進貨',
            `廠商 [${entry.supplier}] 驗收入庫 (+${entry.amount} ${item.unit})`
          );
        }
      });
      return updated;
    });
  };

  const lowStockCount = Object.values(inventory).filter(
    (i) => i.currentStock <= i.minStockThreshold
  ).length;

  const todayCupsCount = posOrders.reduce((sum, o) => sum + o.itemCount, 0);
  const todayRevenue = posOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-[#121110] text-[#f4efe8] flex flex-col font-sans relative">
      {/* Real-time Inventory Deduction Toast */}
      {saleToast && (
        <aside
          role="status"
          aria-live="polite"
          aria-label="前台銷售與後台存貨扣減通知"
          className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#1b1714] border border-[#d97706]/50 rounded-2xl p-4.5 shadow-2xl space-y-3 animate-fade-in backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
                  <span>前台完成銷售！</span>
                  <span className="font-mono text-amber-400 font-bold">{saleToast.orderNumber}</span>
                </div>
                <div className="text-xs text-[#8c7e70] font-mono">
                  共 {saleToast.totalCups} 杯飲品 · 實收 ${saleToast.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSaleToast(null)}
              className="p-1 rounded-lg text-[#a89f91] hover:text-white hover:bg-[#28221c] transition-colors cursor-pointer"
              title="關閉通知"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Deducted raw materials pills */}
          <div className="space-y-1.5 text-xs">
            <div className="text-[11px] text-[#fbbf24] font-semibold flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>後台庫存即時核銷完成 (自動扣減)：</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-none font-mono text-[10px]">
              {saleToast.deductedItems.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[#251f1a] border border-[#382f27] text-[#c7bdb0]"
                >
                  {item.name}: <strong className="text-amber-400">-{item.quantity}{item.unit}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Low Stock Urgent Alert inside toast */}
          {saleToast.lowStockWarnings.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/70 text-xs space-y-1 text-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>【自動補貨預警】庫存已低於安全水位：</span>
              </div>
              <ul className="text-[11px] text-amber-200/90 list-disc list-inside space-y-0.5 font-mono">
                {saleToast.lowStockWarnings.map((warn, idx) => (
                  <li key={idx}>
                    {warn.name}: 剩餘 {warn.currentStock} {warn.unit} (水位線: {warn.minStockThreshold} {warn.unit})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-[#2d251f] text-xs">
            <button
              onClick={() => {
                setSaleToast(null);
                setCurrentTab('bom');
              }}
              className="text-[#a89f91] hover:text-[#f4efe8] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>檢視後台在庫</span>
            </button>

            <button
              onClick={() => {
                setSaleToast(null);
                setCurrentTab('analytics');
              }}
              className="text-[#fbbf24] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>前往補貨分析報表</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Universal Top Bar */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        coins={progress.coins}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeDay={progress.highestDayUnlocked}
        lowStockCount={lowStockCount}
        todayCupsCount={todayCupsCount}
        todayRevenue={todayRevenue}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'pos' && (
          <POSTerminal
            inventory={inventory}
            orders={posOrders}
            onCompleteSale={handleCompleteSale}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onClearCompletedOrders={handleClearCompletedOrders}
          />
        )}

        {currentTab === 'bom' && (
          <BOMInventoryHub
            inventory={inventory}
            orders={posOrders}
            wasteLogs={wasteLogs}
            movementLogs={movementLogs}
            onUpdateInventoryStock={handleUpdateInventoryStock}
            onRestockItem={handleRestockItem}
            onBulkRestockCategory={handleBulkRestockCategory}
            onUpdateUnitCost={handleUpdateUnitCost}
            onLogWaste={handleLogWaste}
            onSaveInventoryItem={handleSaveInventoryItem}
            onDeleteInventoryItem={handleDeleteInventoryItem}
            onApplyStocktake={handleApplyStocktake}
            onReceivePurchaseOrder={handleReceivePurchaseOrder}
            initialTab="warehouse"
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsReportsView
            orders={posOrders}
            inventory={inventory}
            wasteLogs={wasteLogs}
            movementLogs={movementLogs}
            onRestockItem={handleRestockItem}
            onNavigateToPOS={() => setCurrentTab('pos')}
            onNavigateToWarehouse={() => setCurrentTab('bom')}
          />
        )}

        {currentTab === 'qrcode' && (
          <QRCodeHubView
            inventory={inventory}
            orders={posOrders}
            onCompleteSale={handleCompleteSale}
            onRestockItem={handleRestockItem}
            onNavigateToPOS={() => setCurrentTab('pos')}
            onNavigateToInventory={() => setCurrentTab('bom')}
          />
        )}

        {currentTab === 'kds' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <KitchenDisplay
              orders={posOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onClearCompletedOrders={handleClearCompletedOrders}
            />
          </div>
        )}

        {currentTab === 'matrix' && (
          <BOMInventoryHub
            inventory={inventory}
            orders={posOrders}
            wasteLogs={wasteLogs}
            movementLogs={movementLogs}
            onUpdateInventoryStock={handleUpdateInventoryStock}
            onRestockItem={handleRestockItem}
            onBulkRestockCategory={handleBulkRestockCategory}
            onUpdateUnitCost={handleUpdateUnitCost}
            onLogWaste={handleLogWaste}
            onSaveInventoryItem={handleSaveInventoryItem}
            onDeleteInventoryItem={handleDeleteInventoryItem}
            onApplyStocktake={handleApplyStocktake}
            onReceivePurchaseOrder={handleReceivePurchaseOrder}
            initialTab="matrix"
          />
        )}

        {currentTab === 'studio' && (
          <CraftingStudio
            cupState={cupState}
            onUpdateCup={setCupState}
            onResetCup={handleResetCup}
            onSaveCustomRecipe={handleSaveCustomRecipe}
            customRecipes={progress.customRecipes}
            onBrewCustomRecipe={handleBrewRecipe}
            onDeleteCustomRecipe={(id) =>
              setProgress((p) => ({
                ...p,
                customRecipes: p.customRecipes.filter((r) => r.id !== id)
              }))
            }
          />
        )}
      </main>

      {/* Clean Unobtrusive Editorial Footer */}
      <footer className="w-full border-t border-[#26201b] bg-[#141210] py-6 px-6 mt-12 text-xs text-[#8c7e70]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#d6cec3]">BobaFlow 12</span>
            <span>·</span>
            <span>飲料店前台銷售收銀與後台存貨管理系統</span>
          </div>

          <div className="flex items-center gap-6">
            <span>前台點餐即時計價</span>
            <span>·</span>
            <span>銷售即時核銷扣庫</span>
            <span>·</span>
            <span>銷售數據智能補貨預警</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
