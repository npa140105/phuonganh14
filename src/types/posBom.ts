import { TeaType, MilkType, SweetenerType, ToppingType, SweetnessLevel, IceLevel } from './boba';

export type InventoryCategory = 'tea' | 'milk' | 'sweetener' | 'topping' | 'packaging';
export type UnitType = 'g' | 'ml' | 'units';
export type DrinkSize = 'regular' | 'large';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: UnitType;
  currentStock: number;
  capacity: number;
  minStockThreshold: number; // 安全存量水位
  reorderAmount: number; // 建議叫貨批次量
  unitCost: number; // 採購單價費用 (cost per g, ml, or unit in USD)
  supplier: string; // 供應商名稱
  supplierPhone?: string; // 供應商電話
  supplierContactPerson?: string; // 業務聯絡窗口
  storageLocation?: string; // 存放位置
  color?: string;
  lastRestocked?: string;
  isCustom?: boolean;
}

export interface BOMIngredient {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: UnitType;
  unitCost: number;
}

export interface RecipeBOMDefinition {
  recipeId: string;
  name: string;
  chineseName: string;
  category: 'milk_tea' | 'fruit_tea' | 'cheese_foam' | 'specialty' | 'custom';
  sellingPrice: number;
  regularIngredients: BOMIngredient[];
  largeIngredients: BOMIngredient[];
}

export interface POSMenuItem {
  id: string;
  recipeId: string;
  name: string;
  chineseName: string;
  category: 'milk_tea' | 'fruit_tea' | 'cheese_foam' | 'specialty' | 'custom';
  description: string;
  basePrice: number; // Regular size price
  accentColor: string;
  defaultTea: TeaType;
  defaultMilk: MilkType;
  defaultSweetener: SweetenerType;
  defaultSweetness: SweetnessLevel;
  defaultIce: IceLevel;
  defaultToppings: ToppingType[];
  requiresCheeseFoam?: boolean;
  requiresTorch?: boolean;
  popular?: boolean;
}

export interface POSCartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  chineseName: string;
  size: DrinkSize;
  tea: TeaType;
  milk: MilkType;
  sweetener: SweetenerType;
  sweetness: SweetnessLevel;
  iceLevel: IceLevel;
  toppings: ToppingType[];
  requiresCheeseFoam: boolean;
  requiresTorch: boolean;
  unitPrice: number;
  quantity: number;
  itemCogs: number; // Single cup COGS based on BOM
  bomBreakdown: Array<{
    ingredientId: string;
    name: string;
    quantity: number;
    unit: UnitType;
    cost: number;
  }>;
}

export type PaymentMethod = 'cash' | 'card' | 'qr_pay';
export type DiscountType = 'none' | 'student' | 'vip' | 'happy_hour' | 'staff';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

export interface POSOrder {
  id: string;
  orderNumber: string; // e.g. #A-101
  timestamp: number;
  items: POSCartItem[];
  itemCount: number;
  subtotal: number;
  discountType: DiscountType;
  discountAmount: number;
  tax: number;
  total: number;
  totalCogs: number;
  grossProfit: number;
  profitMarginPct: number;
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  changeGiven?: number;
  status: OrderStatus;
  customerNote?: string;
  memberId?: string;
  memberPhone?: string;
  memberName?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
}

export interface WasteRecord {
  id: string;
  timestamp: number;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: UnitType;
  costLoss: number;
  reason: 'expired' | 'spilled' | 'over_brewed' | 'damaged' | 'quality_check';
}

export type MovementType =
  | 'pos_deduction'
  | 'restock'
  | 'stocktake_adjustment'
  | 'waste_loss'
  | 'manual_adjustment';

export interface StockMovementLog {
  id: string;
  timestamp: number;
  ingredientId: string;
  ingredientName: string;
  type: MovementType;
  deltaQuantity: number; // e.g. -200 or +5000
  unit: UnitType;
  balanceAfter: number;
  referenceId?: string; // e.g. Order #A-101 or PO #PO-2026
  notes?: string;
}
