import {
  InventoryItem,
  POSMenuItem,
  RecipeBOMDefinition,
  DrinkSize,
  BOMIngredient,
  UnitType,
  POSCartItem
} from '../types/posBom';
import { TeaType, MilkType, SweetenerType, ToppingType } from '../types/boba';

// Standard inventory catalog with unit costs based on commercial boba suppliers
export const INITIAL_INVENTORY: Record<string, InventoryItem> = {
  // Teas (ml of brewed tea concentrate)
  tea_assam: {
    id: 'tea_assam',
    name: 'Assam Black Tea (Brewed)',
    category: 'tea',
    unit: 'ml',
    currentStock: 7500,
    capacity: 10000,
    minStockThreshold: 1500,
    reorderAmount: 5000,
    unitCost: 0.0025, // $2.50 per liter
    supplier: 'Sun Moon Lake Tea Co. (日月潭茶業)',
    supplierPhone: '+886-49-285-1234',
    supplierContactPerson: 'Mr. Lin (林經理)',
    storageLocation: 'Tea Station A-01 (萃茶吧台)',
    color: '#8b3a1a'
  },
  tea_jasmine: {
    id: 'tea_jasmine',
    name: 'Jasmine Jade Green (Brewed)',
    category: 'tea',
    unit: 'ml',
    currentStock: 6200,
    capacity: 10000,
    minStockThreshold: 1500,
    reorderAmount: 5000,
    unitCost: 0.0028,
    supplier: 'Fujian Artisan Teas (閩南茶業)',
    supplierPhone: '+886-2-2555-8899',
    supplierContactPerson: 'Ms. Chen (陳襄理)',
    storageLocation: 'Tea Station A-02 (萃茶吧台)',
    color: '#c5a359'
  },
  tea_oolong: {
    id: 'tea_oolong',
    name: 'Iron Goddess Oolong (Brewed)',
    category: 'tea',
    unit: 'ml',
    currentStock: 5400,
    capacity: 10000,
    minStockThreshold: 1200,
    reorderAmount: 5000,
    unitCost: 0.0032,
    supplier: 'Alishan Mountain Estates (阿里山茶莊)',
    supplierPhone: '+886-5-256-7890',
    supplierContactPerson: 'Master Wang (王製茶師)',
    storageLocation: 'Tea Station A-03 (萃茶吧台)',
    color: '#a8652d'
  },
  tea_thai: {
    id: 'tea_thai',
    name: 'Thai Spiced Ceylon (Brewed)',
    category: 'tea',
    unit: 'ml',
    currentStock: 4800,
    capacity: 8000,
    minStockThreshold: 1200,
    reorderAmount: 4000,
    unitCost: 0.003,
    supplier: 'Cha Tra Mue Direct (手標牌直營)',
    supplierPhone: '+66-2-123-4567',
    supplierContactPerson: 'Somchai (泰國進口專員)',
    storageLocation: 'Tea Station A-04 (常溫調飲區)',
    color: '#dd5a19'
  },
  tea_matcha: {
    id: 'tea_matcha',
    name: 'Ceremonial Uji Matcha (Concentrate)',
    category: 'tea',
    unit: 'ml',
    currentStock: 3200,
    capacity: 6000,
    minStockThreshold: 1000,
    reorderAmount: 3000,
    unitCost: 0.0065,
    supplier: 'Kyoto Marukyu Koyamaen (丸久小山園)',
    supplierPhone: '+81-774-22-1234',
    supplierContactPerson: 'Tanaka-san (田中業務代表)',
    storageLocation: 'Cold Vault 4°C (低溫保鮮庫)',
    color: '#4e7e37'
  },
  tea_peach: {
    id: 'tea_peach',
    name: 'White Peach Oolong (Brewed)',
    category: 'tea',
    unit: 'ml',
    currentStock: 4500,
    capacity: 8000,
    minStockThreshold: 1200,
    reorderAmount: 4000,
    unitCost: 0.0035,
    supplier: 'Nantou Tea Growers (南投茶農產銷)',
    supplierPhone: '+886-49-276-5544',
    supplierContactPerson: 'Mr. Huang (黃店長)',
    storageLocation: 'Tea Station A-05 (冷萃區)',
    color: '#d48b6c'
  },

  // Milks & Creamers (ml)
  milk_whole: {
    id: 'milk_whole',
    name: 'Local Organic Whole Milk',
    category: 'milk',
    unit: 'ml',
    currentStock: 12000,
    capacity: 16000,
    minStockThreshold: 3000,
    reorderAmount: 8000,
    unitCost: 0.0022, // $2.20 per liter
    supplier: 'Clover Dairy / 鮮乳直送中心',
    supplierPhone: '+886-3-456-7890',
    supplierContactPerson: 'Dispatch Dept (每日配送課)',
    storageLocation: 'Walk-in Chiller R-01 (冷藏大庫)',
    color: '#fffbf2'
  },
  milk_oat: {
    id: 'milk_oat',
    name: 'Barista Oat Milk',
    category: 'milk',
    unit: 'ml',
    currentStock: 8500,
    capacity: 12000,
    minStockThreshold: 2500,
    reorderAmount: 6000,
    unitCost: 0.0038, // $3.80 per liter
    supplier: 'Oatly Barista Edition (燕麥奶大中華總代)',
    supplierPhone: '+886-2-8765-4321',
    supplierContactPerson: 'Barista Hotline (燕麥奶客服組)',
    storageLocation: 'Dry Storage Shelf 1 (常溫未開封)',
    color: '#f5edd6'
  },
  milk_coconut: {
    id: 'milk_coconut',
    name: 'Pressed Coconut Milk',
    category: 'milk',
    unit: 'ml',
    currentStock: 5200,
    capacity: 8000,
    minStockThreshold: 1500,
    reorderAmount: 4000,
    unitCost: 0.0032,
    supplier: 'Chaokoh Pure (南洋椰品貿易)',
    supplierPhone: '+886-2-2233-4455',
    supplierContactPerson: 'Mr. Wu (吳經理)',
    storageLocation: 'Dry Storage Shelf 2',
    color: '#f8fafc'
  },
  milk_condensed: {
    id: 'milk_condensed',
    name: 'Sweet Condensed Milk',
    category: 'milk',
    unit: 'ml',
    currentStock: 4100,
    capacity: 6000,
    minStockThreshold: 1200,
    reorderAmount: 3000,
    unitCost: 0.004,
    supplier: 'Longevity Brand (壽星牌煉乳)',
    supplierPhone: '+886-4-2350-9988',
    supplierContactPerson: 'Dairy Supplies Co.',
    storageLocation: 'Dry Storage Shelf 2',
    color: '#fef08a'
  },

  // Sweeteners & Syrups (ml)
  syrup_brown_sugar: {
    id: 'syrup_brown_sugar',
    name: 'Okinawa Roasted Brown Sugar Syrup',
    category: 'sweetener',
    unit: 'ml',
    currentStock: 6800,
    capacity: 10000,
    minStockThreshold: 1500,
    reorderAmount: 5000,
    unitCost: 0.0045, // $4.50 per liter
    supplier: 'Ryukyu Sugar Mills (沖繩黑糖工房)',
    supplierPhone: '+886-6-299-1122',
    supplierContactPerson: 'Mr. Kuo (郭課長)',
    storageLocation: 'Syrup Rack S-01 (糖漿專區)',
    color: '#78350f'
  },
  syrup_cane: {
    id: 'syrup_cane',
    name: 'Pure Liquid Cane Sugar',
    category: 'sweetener',
    unit: 'ml',
    currentStock: 7200,
    capacity: 10000,
    minStockThreshold: 1500,
    reorderAmount: 5000,
    unitCost: 0.0028,
    supplier: 'Taiwan Sugar Corp (台糖直銷處)',
    supplierPhone: '+886-6-632-4466',
    supplierContactPerson: 'Bulk Sales Office (大宗砂糖組)',
    storageLocation: 'Syrup Rack S-02 (糖漿專區)',
    color: '#d97706'
  },
  syrup_honey: {
    id: 'syrup_honey',
    name: 'Longan Blossom Golden Honey',
    category: 'sweetener',
    unit: 'ml',
    currentStock: 3800,
    capacity: 6000,
    minStockThreshold: 1000,
    reorderAmount: 3000,
    unitCost: 0.0075,
    supplier: 'Sun Moon Lake Apiary (南投養蜂產銷班)',
    supplierPhone: '+886-49-289-5678',
    supplierContactPerson: 'Master Chang (張班長)',
    storageLocation: 'Pantry Shelf H-01',
    color: '#f59e0b'
  },
  syrup_wintermelon: {
    id: 'syrup_wintermelon',
    name: 'Caramelized Wintermelon Brick Syrup',
    category: 'sweetener',
    unit: 'ml',
    currentStock: 3600,
    capacity: 6000,
    minStockThreshold: 1000,
    reorderAmount: 3000,
    unitCost: 0.0035,
    supplier: 'Tainan Old Market Syrups (台南冬瓜行)',
    supplierPhone: '+886-6-222-3344',
    supplierContactPerson: 'Master Zhou (周師傅)',
    storageLocation: 'Syrup Rack S-03',
    color: '#b45309'
  },

  // Toppings (grams or portions)
  top_black_pearls: {
    id: 'top_black_pearls',
    name: 'Slow-Simmered Tapioca Pearls (QQ)',
    category: 'topping',
    unit: 'g',
    currentStock: 4200, // in grams
    capacity: 8000,
    minStockThreshold: 1200,
    reorderAmount: 5000,
    unitCost: 0.0035, // ~$0.23 per 65g scoop
    supplier: 'Taichung Cassava Works (台中小吃木薯廠)',
    supplierPhone: '+886-4-2339-7788',
    supplierContactPerson: 'Factory Director Liao (廖廠長)',
    storageLocation: 'Boba Station B-01 (現煮粉圓台)',
    color: '#1c1917'
  },
  top_popping_boba: {
    id: 'top_popping_boba',
    name: 'Mango Burst Popping Boba',
    category: 'topping',
    unit: 'g',
    currentStock: 2800,
    capacity: 5000,
    minStockThreshold: 800,
    reorderAmount: 3000,
    unitCost: 0.0055, // ~$0.33 per 60g scoop
    supplier: 'Possmei International (博思美食品)',
    supplierPhone: '+886-2-8228-6688',
    supplierContactPerson: 'VP Liu (劉協理)',
    storageLocation: 'Topping Chiller C-01 (配料冷藏吧)',
    color: '#f59e0b'
  },
  top_lychee_jelly: {
    id: 'top_lychee_jelly',
    name: 'Crystal Lychee Coconut Jelly',
    category: 'topping',
    unit: 'g',
    currentStock: 3100,
    capacity: 5000,
    minStockThreshold: 800,
    reorderAmount: 3000,
    unitCost: 0.0048,
    supplier: 'Sunnysyrup Food Co. (生合食品)',
    supplierPhone: '+886-3-322-1133',
    supplierContactPerson: 'Sales Specialist Lee (李專員)',
    storageLocation: 'Topping Chiller C-02',
    color: '#db2777'
  },
  top_egg_pudding: {
    id: 'top_egg_pudding',
    name: 'Silken Custard Egg Pudding',
    category: 'topping',
    unit: 'g',
    currentStock: 2600,
    capacity: 4500,
    minStockThreshold: 700,
    reorderAmount: 2500,
    unitCost: 0.0052,
    supplier: 'Uni-President Fresh Foods (統一冷藏甜品)',
    supplierPhone: '+886-6-253-2121',
    supplierContactPerson: 'Cold Logistics Team (冷藏專線)',
    storageLocation: 'Walk-in Chiller R-02',
    color: '#ca8a04'
  },
  top_grass_jelly: {
    id: 'top_grass_jelly',
    name: 'Herbal Mesona Grass Jelly',
    category: 'topping',
    unit: 'g',
    currentStock: 3300,
    capacity: 5000,
    minStockThreshold: 800,
    reorderAmount: 3000,
    unitCost: 0.0038,
    supplier: 'Guanxi Mesona Farmers (關西仙草產銷班)',
    supplierPhone: '+886-3-587-2010',
    supplierContactPerson: 'Farmers Co-op Staff (農會業務課)',
    storageLocation: 'Walk-in Chiller R-03',
    color: '#27272a'
  },
  top_cheese_foam: {
    id: 'top_cheese_foam',
    name: 'Salted Velvet Cheese Foam (Fresh)',
    category: 'topping',
    unit: 'g',
    currentStock: 2100,
    capacity: 4000,
    minStockThreshold: 600,
    reorderAmount: 2000,
    unitCost: 0.0085, // New Zealand cream cheese whip
    supplier: 'Anchor Dairy / In-house whip (安佳乳品)',
    supplierPhone: '+886-2-2658-0011',
    supplierContactPerson: 'Chef Team (吧台奶蓋研發組)',
    storageLocation: 'Bar Fridge Prep 01 (吧台小冰箱)',
    color: '#fef3c7'
  },

  // Packaging & Disposables (units)
  pack_cup_reg: {
    id: 'pack_cup_reg',
    name: '500ml Regular PP Cup (BPA Free)',
    category: 'packaging',
    unit: 'units',
    currentStock: 340,
    capacity: 600,
    minStockThreshold: 80,
    reorderAmount: 300,
    unitCost: 0.12,
    supplier: 'EcoPack Solutions (宏發環保容器廠)',
    supplierPhone: '+886-4-768-9900',
    supplierContactPerson: 'Plant Manager Lin (林廠長)',
    storageLocation: 'Carton Depot P-01 (包材庫存A區)',
    color: '#a8a29e'
  },
  pack_cup_large: {
    id: 'pack_cup_large',
    name: '700ml Large PP Cup (BPA Free)',
    category: 'packaging',
    unit: 'units',
    currentStock: 280,
    capacity: 500,
    minStockThreshold: 70,
    reorderAmount: 250,
    unitCost: 0.16,
    supplier: 'EcoPack Solutions (宏發環保容器廠)',
    supplierPhone: '+886-4-768-9900',
    supplierContactPerson: 'Plant Manager Lin (林廠長)',
    storageLocation: 'Carton Depot P-02 (包材庫存A區)',
    color: '#78716c'
  },
  pack_sealing_film: {
    id: 'pack_sealing_film',
    name: 'BobaFlow Sealing Film (Per Seal)',
    category: 'packaging',
    unit: 'units',
    currentStock: 1450,
    capacity: 2500,
    minStockThreshold: 300,
    reorderAmount: 1000,
    unitCost: 0.025,
    supplier: 'SealMaster Taiwan (封王精密封口膜)',
    supplierPhone: '+886-2-2995-8800',
    supplierContactPerson: 'Tech Service Hotline (客服工務部)',
    storageLocation: 'Carton Depot P-03',
    color: '#d97706'
  },
  pack_straw_jumbo: {
    id: 'pack_straw_jumbo',
    name: '12mm Slanted Jumbo Straw',
    category: 'packaging',
    unit: 'units',
    currentStock: 620,
    capacity: 1000,
    minStockThreshold: 150,
    reorderAmount: 500,
    unitCost: 0.02,
    supplier: 'EcoStraw PLA (源峰生質吸管)',
    supplierPhone: '+886-3-485-6677',
    supplierContactPerson: 'Order Desk (訂單處理課)',
    storageLocation: 'Bar Counter Drawer 01 (吧台抽屜)',
    color: '#52525b'
  },
  pack_takeaway_bag: {
    id: 'pack_takeaway_bag',
    name: 'Biodegradable Single/Double Cup Carrier',
    category: 'packaging',
    unit: 'units',
    currentStock: 410,
    capacity: 800,
    minStockThreshold: 100,
    reorderAmount: 400,
    unitCost: 0.035,
    supplier: 'GreenEarth Bags (綠意包裝材料行)',
    supplierPhone: '+886-4-2567-3311',
    supplierContactPerson: 'Sales Team B (業務二課)',
    storageLocation: 'Storage Bay B-04',
    color: '#84cc16'
  }
};

// Map boba types to inventory IDs
export const TEA_TO_INVENTORY_MAP: Record<TeaType, string> = {
  assam_black: 'tea_assam',
  jasmine_green: 'tea_jasmine',
  roasted_oolong: 'tea_oolong',
  thai_ceylon: 'tea_thai',
  ceremonial_matcha: 'tea_matcha',
  white_peach_oolong: 'tea_peach'
};

export const MILK_TO_INVENTORY_MAP: Record<MilkType, string | null> = {
  whole_milk: 'milk_whole',
  oat_milk: 'milk_oat',
  coconut_milk: 'milk_coconut',
  condensed_milk: 'milk_condensed',
  soy_milk: 'milk_whole', // fallback
  none: null
};

export const SWEETENER_TO_INVENTORY_MAP: Record<SweetenerType, string | null> = {
  brown_sugar: 'syrup_brown_sugar',
  cane_sugar: 'syrup_cane',
  golden_honey: 'syrup_honey',
  wintermelon: 'syrup_wintermelon',
  none: null
};

export const TOPPING_TO_INVENTORY_MAP: Record<ToppingType, string> = {
  black_pearls: 'top_black_pearls',
  popping_boba: 'top_popping_boba',
  lychee_jelly: 'top_lychee_jelly',
  egg_pudding: 'top_egg_pudding',
  grass_jelly: 'top_grass_jelly',
  cheese_foam: 'top_cheese_foam'
};

// POS Menu Items Catalog
export const POS_MENU_ITEMS: POSMenuItem[] = [
  {
    id: 'pos_tiger_brown_sugar',
    recipeId: 'tiger_brown_sugar',
    name: 'Tiger Brown Sugar Deerioca',
    chineseName: '黑糖珍珠鮮奶',
    category: 'milk_tea',
    description: 'Slow-simmered Okinawa brown sugar boba swirls with fresh whole milk & malted Assam.',
    basePrice: 5.75,
    accentColor: '#92400e',
    defaultTea: 'assam_black',
    defaultMilk: 'whole_milk',
    defaultSweetener: 'brown_sugar',
    defaultSweetness: 70,
    defaultIce: 70,
    defaultToppings: ['black_pearls'],
    requiresCheeseFoam: true,
    requiresTorch: true,
    popular: true
  },
  {
    id: 'pos_cloud_jasmine_foam',
    recipeId: 'cloud_jasmine_foam',
    name: 'Cloud Jasmine Cheese Cap',
    chineseName: '芝士茉莉綠茶',
    category: 'cheese_foam',
    description: 'Floral seven-scented jade green tea crowned with thick Himalayan pink salted velvet foam.',
    basePrice: 5.95,
    accentColor: '#ca8a04',
    defaultTea: 'jasmine_green',
    defaultMilk: 'none',
    defaultSweetener: 'cane_sugar',
    defaultSweetness: 50,
    defaultIce: 70,
    defaultToppings: ['lychee_jelly', 'cheese_foam'],
    requiresCheeseFoam: true,
    popular: true
  },
  {
    id: 'pos_uji_matcha_float',
    recipeId: 'uji_matcha_float',
    name: 'Uji Matcha Velvet Float',
    chineseName: '宇治抹茶歐蕾',
    category: 'specialty',
    description: 'Ceremonial first-harvest Kyoto matcha layered atop barista oat milk, honey, and warm pearls.',
    basePrice: 6.50,
    accentColor: '#4d7c0f',
    defaultTea: 'ceremonial_matcha',
    defaultMilk: 'oat_milk',
    defaultSweetener: 'golden_honey',
    defaultSweetness: 50,
    defaultIce: 30,
    defaultToppings: ['black_pearls'],
    popular: true
  },
  {
    id: 'pos_bangkok_golden_spice',
    recipeId: 'bangkok_golden_spice',
    name: 'Bangkok Golden Spice Thai Tea',
    chineseName: '泰式手標鮮奶茶',
    category: 'milk_tea',
    description: 'Vivid orange spiced Ceylon with star anise, sweet condensed milk, and chewy black pearls.',
    basePrice: 5.50,
    accentColor: '#ea580c',
    defaultTea: 'thai_ceylon',
    defaultMilk: 'condensed_milk',
    defaultSweetener: 'brown_sugar',
    defaultSweetness: 70,
    defaultIce: 100,
    defaultToppings: ['black_pearls'],
    popular: true
  },
  {
    id: 'pos_peach_oolong_cloud',
    recipeId: 'peach_oolong_cloud',
    name: 'White Peach Oolong Cheese Tea',
    chineseName: '白桃烏龍芝士奶蓋',
    category: 'cheese_foam',
    description: 'Fragrant high-mountain white peach oolong topped with rich cheese cap and crystal lychee jelly.',
    basePrice: 6.25,
    accentColor: '#d48b6c',
    defaultTea: 'white_peach_oolong',
    defaultMilk: 'none',
    defaultSweetener: 'cane_sugar',
    defaultSweetness: 50,
    defaultIce: 70,
    defaultToppings: ['lychee_jelly', 'cheese_foam'],
    requiresCheeseFoam: true,
    popular: false
  },
  {
    id: 'pos_roasted_iron_goddess',
    recipeId: 'roasted_iron_goddess',
    name: 'Iron Goddess Roasted Milk Tea',
    chineseName: '鐵觀音烤奶',
    category: 'milk_tea',
    description: 'Slow charcoal-roasted Tie Guan Yin tea paired with rich whole milk and dual boba & pudding.',
    basePrice: 5.65,
    accentColor: '#78350f',
    defaultTea: 'roasted_oolong',
    defaultMilk: 'whole_milk',
    defaultSweetener: 'cane_sugar',
    defaultSweetness: 50,
    defaultIce: 70,
    defaultToppings: ['black_pearls', 'egg_pudding'],
    popular: true
  },
  {
    id: 'pos_taro_moon_mist',
    recipeId: 'taro_moon_mist',
    name: 'Taro Moon Mist Coconut Milk',
    chineseName: '香芋椰香奶茶',
    category: 'specialty',
    description: 'Silky steamed purple taro blended with pressed coconut milk, tapioca pearls, and herbal grass jelly.',
    basePrice: 6.15,
    accentColor: '#9333ea',
    defaultTea: 'assam_black',
    defaultMilk: 'coconut_milk',
    defaultSweetener: 'cane_sugar',
    defaultSweetness: 50,
    defaultIce: 30,
    defaultToppings: ['black_pearls', 'grass_jelly'],
    popular: false
  },
  {
    id: 'pos_mango_pomelo_nectar',
    recipeId: 'mango_pomelo_nectar',
    name: 'Mango Pomelo Sparkle Tea',
    chineseName: '楊枝甘露晶球',
    category: 'fruit_tea',
    description: 'Tropical jasmine green tea with sweet Alphonso mango juice, coconut cream swirl, and popping boba.',
    basePrice: 6.45,
    accentColor: '#d97706',
    defaultTea: 'jasmine_green',
    defaultMilk: 'coconut_milk',
    defaultSweetener: 'golden_honey',
    defaultSweetness: 70,
    defaultIce: 70,
    defaultToppings: ['popping_boba'],
    popular: true
  },
  {
    id: 'pos_taipei_classic_heritage',
    recipeId: 'taipei_classic_heritage',
    name: 'Taipei 1986 Heritage Milk Tea',
    chineseName: '經典台式原味珍珠奶茶',
    category: 'milk_tea',
    description: 'The golden original: bold Assam black tea, silky whole milk, brown sugar, and warm tapioca.',
    basePrice: 5.25,
    accentColor: '#854d0e',
    defaultTea: 'assam_black',
    defaultMilk: 'whole_milk',
    defaultSweetener: 'brown_sugar',
    defaultSweetness: 70,
    defaultIce: 70,
    defaultToppings: ['black_pearls'],
    popular: true
  },
  {
    id: 'pos_lychee_jade_refresher',
    recipeId: 'lychee_jade_refresher',
    name: 'Lychee Jade Green Refresher',
    chineseName: '荔枝玉露翡翠綠茶',
    category: 'fruit_tea',
    description: 'Crisp cold-brewed jasmine green tea with natural lychee puree and coconut jelly bits.',
    basePrice: 5.15,
    accentColor: '#10b981',
    defaultTea: 'jasmine_green',
    defaultMilk: 'none',
    defaultSweetener: 'cane_sugar',
    defaultSweetness: 50,
    defaultIce: 70,
    defaultToppings: ['lychee_jelly'],
    popular: false
  },
  {
    id: 'pos_wintermelon_creamer',
    recipeId: 'wintermelon_creamer',
    name: 'Wintermelon Dew Oolong Latte',
    chineseName: '冬瓜鮮奶烏龍',
    category: 'milk_tea',
    description: 'Caramelized Taiwanese wintermelon tea fused with roasted oolong and oat milk.',
    basePrice: 5.75,
    accentColor: '#b45309',
    defaultTea: 'roasted_oolong',
    defaultMilk: 'oat_milk',
    defaultSweetener: 'wintermelon',
    defaultSweetness: 70,
    defaultIce: 70,
    defaultToppings: ['grass_jelly'],
    popular: false
  },
  {
    id: 'pos_matcha_cheese_brulee',
    recipeId: 'matcha_cheese_brulee',
    name: 'Matcha Crème Brûlée Cloud',
    chineseName: '烤布蕾宇治抹茶',
    category: 'specialty',
    description: 'Kyoto matcha with organic milk, chewy boba, and torched caramelized brown sugar cheese foam.',
    basePrice: 6.95,
    accentColor: '#65a30d',
    defaultTea: 'ceremonial_matcha',
    defaultMilk: 'whole_milk',
    defaultSweetener: 'brown_sugar',
    defaultSweetness: 50,
    defaultIce: 30,
    defaultToppings: ['black_pearls', 'cheese_foam'],
    requiresCheeseFoam: true,
    requiresTorch: true,
    popular: true
  }
];

// Helper to compute precise BOM for any drink configuration
export function calculateDrinkBOM(
  tea: TeaType,
  milk: MilkType,
  sweetener: SweetenerType,
  sweetness: number,
  toppings: ToppingType[],
  size: DrinkSize,
  hasCheeseFoam: boolean,
  inventory: Record<string, InventoryItem>
): {
  cogs: number;
  breakdown: Array<{ ingredientId: string; name: string; quantity: number; unit: UnitType; cost: number }>;
} {
  const sizeMultiplier = size === 'large' ? 1.4 : 1.0;
  const breakdown: Array<{ ingredientId: string; name: string; quantity: number; unit: UnitType; cost: number }> = [];

  // 1. Tea Base
  const teaInvId = TEA_TO_INVENTORY_MAP[tea];
  if (teaInvId && inventory[teaInvId]) {
    const item = inventory[teaInvId];
    const ml = Math.round((milk === 'none' ? 320 : 200) * sizeMultiplier);
    const cost = ml * item.unitCost;
    breakdown.push({
      ingredientId: teaInvId,
      name: item.name,
      quantity: ml,
      unit: 'ml',
      cost: Number(cost.toFixed(3))
    });
  }

  // 2. Milk / Dairy
  const milkInvId = MILK_TO_INVENTORY_MAP[milk];
  if (milkInvId && inventory[milkInvId]) {
    const item = inventory[milkInvId];
    const ml = Math.round(120 * sizeMultiplier);
    const cost = ml * item.unitCost;
    breakdown.push({
      ingredientId: milkInvId,
      name: item.name,
      quantity: ml,
      unit: 'ml',
      cost: Number(cost.toFixed(3))
    });
  }

  // 3. Sweetener Syrup
  const syrupInvId = SWEETENER_TO_INVENTORY_MAP[sweetener];
  if (syrupInvId && inventory[syrupInvId] && sweetness > 0) {
    const item = inventory[syrupInvId];
    // standard 30ml at 100%, 22ml at 70%, 15ml at 50%, 10ml at 30%
    const baseMl = (sweetness / 100) * 30;
    const ml = Math.round(baseMl * sizeMultiplier);
    const cost = ml * item.unitCost;
    breakdown.push({
      ingredientId: syrupInvId,
      name: item.name,
      quantity: ml,
      unit: 'ml',
      cost: Number(cost.toFixed(3))
    });
  }

  // 4. Toppings
  toppings.forEach((topping) => {
    const topInvId = TOPPING_TO_INVENTORY_MAP[topping];
    if (topInvId && inventory[topInvId]) {
      const item = inventory[topInvId];
      // 65g regular boba scoop, 85g large
      const grams = Math.round((topping === 'cheese_foam' ? 50 : 65) * sizeMultiplier);
      const cost = grams * item.unitCost;
      breakdown.push({
        ingredientId: topInvId,
        name: item.name,
        quantity: grams,
        unit: 'g',
        cost: Number(cost.toFixed(3))
      });
    }
  });

  // Extra cheese foam if flagged and not in toppings already
  if (hasCheeseFoam && !toppings.includes('cheese_foam')) {
    const cfItem = inventory['top_cheese_foam'];
    if (cfItem) {
      const grams = Math.round(50 * sizeMultiplier);
      const cost = grams * cfItem.unitCost;
      breakdown.push({
        ingredientId: 'top_cheese_foam',
        name: cfItem.name,
        quantity: grams,
        unit: 'g',
        cost: Number(cost.toFixed(3))
      });
    }
  }

  // 5. Packaging (Cup, Seal, Straw)
  const cupId = size === 'large' ? 'pack_cup_large' : 'pack_cup_reg';
  if (inventory[cupId]) {
    const cup = inventory[cupId];
    breakdown.push({
      ingredientId: cupId,
      name: cup.name,
      quantity: 1,
      unit: 'units',
      cost: cup.unitCost
    });
  }

  if (inventory['pack_sealing_film']) {
    const film = inventory['pack_sealing_film'];
    breakdown.push({
      ingredientId: 'pack_sealing_film',
      name: film.name,
      quantity: 1,
      unit: 'units',
      cost: film.unitCost
    });
  }

  if (inventory['pack_straw_jumbo']) {
    const straw = inventory['pack_straw_jumbo'];
    breakdown.push({
      ingredientId: 'pack_straw_jumbo',
      name: straw.name,
      quantity: 1,
      unit: 'units',
      cost: straw.unitCost
    });
  }

  const cogs = breakdown.reduce((sum, item) => sum + item.cost, 0);
  return {
    cogs: Number(cogs.toFixed(2)),
    breakdown
  };
}

// Master BOM Matrix generator for all menu items
export function generateMasterBOMMatrix(
  menuItems: POSMenuItem[],
  inventory: Record<string, InventoryItem>
): Array<{
  item: POSMenuItem;
  regularCogs: number;
  regularPrice: number;
  regularProfit: number;
  regularMarginPct: number;
  largeCogs: number;
  largePrice: number;
  largeProfit: number;
  largeMarginPct: number;
  breakdownRegular: Array<{ name: string; quantity: number; unit: UnitType; cost: number }>;
}> {
  return menuItems.map((item) => {
    const regularCalc = calculateDrinkBOM(
      item.defaultTea,
      item.defaultMilk,
      item.defaultSweetener,
      item.defaultSweetness,
      item.defaultToppings,
      'regular',
      !!item.requiresCheeseFoam,
      inventory
    );

    const largeCalc = calculateDrinkBOM(
      item.defaultTea,
      item.defaultMilk,
      item.defaultSweetener,
      item.defaultSweetness,
      item.defaultToppings,
      'large',
      !!item.requiresCheeseFoam,
      inventory
    );

    const regularPrice = item.basePrice;
    const largePrice = item.basePrice + 0.85;

    const regularProfit = regularPrice - regularCalc.cogs;
    const regularMarginPct = (regularProfit / regularPrice) * 100;

    const largeProfit = largePrice - largeCalc.cogs;
    const largeMarginPct = (largeProfit / largePrice) * 100;

    return {
      item,
      regularCogs: regularCalc.cogs,
      regularPrice,
      regularProfit: Number(regularProfit.toFixed(2)),
      regularMarginPct: Number(regularMarginPct.toFixed(1)),
      largeCogs: largeCalc.cogs,
      largePrice,
      largeProfit: Number(largeProfit.toFixed(2)),
      largeMarginPct: Number(largeMarginPct.toFixed(1)),
      breakdownRegular: regularCalc.breakdown
    };
  });
}
