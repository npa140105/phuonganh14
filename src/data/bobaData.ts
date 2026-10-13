import {
  BobaRecipe,
  CupType,
  IngredientDefinition,
  MilkType,
  SealDesign,
  ShiftDay,
  StrawType,
  SweetenerType,
  TeaType,
  ToppingType
} from '../types/boba';

// Teas
export const TEA_CATALOG: Record<TeaType, IngredientDefinition> = {
  assam_black: {
    id: 'assam_black',
    name: 'Assam Black Tea',
    category: 'tea',
    color: '#8b3a1a',
    secondaryColor: '#5c220c',
    description: 'Deep, malted, full-bodied black tea from the misty foothills of Assam.',
    iconBg: '#78350f',
    origin: 'Assam, India'
  },
  jasmine_green: {
    id: 'jasmine_green',
    name: 'Jasmine Jade Green',
    category: 'tea',
    color: '#c5a359',
    secondaryColor: '#8a6e2e',
    description: 'Delicate high-mountain green tea infused seven times with fresh jasmine petals.',
    iconBg: '#854d0e',
    origin: 'Fujian, China'
  },
  roasted_oolong: {
    id: 'roasted_oolong',
    name: 'Iron Goddess Oolong',
    category: 'tea',
    color: '#a8652d',
    secondaryColor: '#6d3c13',
    description: 'Slow-charcoal roasted Tie Guan Yin with smoky amber undertones and honey finish.',
    iconBg: '#92400e',
    origin: 'Nantou, Taiwan'
  },
  thai_ceylon: {
    id: 'thai_ceylon',
    name: 'Thai Spiced Ceylon',
    category: 'tea',
    color: '#dd5a19',
    secondaryColor: '#aa3d07',
    description: 'Aromatic star anise, crushed cardamom, and crushed tamarind seed in rich Ceylon.',
    iconBg: '#c2410c',
    origin: 'Bangkok, Thailand'
  },
  ceremonial_matcha: {
    id: 'ceremonial_matcha',
    name: 'Ceremonial Uji Matcha',
    category: 'tea',
    color: '#4e7e37',
    secondaryColor: '#2b501a',
    description: 'Stone-ground first harvest shaded tencha tea leaves from Kyoto with vivid umami.',
    iconBg: '#3f6212',
    origin: 'Uji, Kyoto'
  },
  white_peach_oolong: {
    id: 'white_peach_oolong',
    name: 'White Peach Oolong',
    category: 'tea',
    color: '#d48b6c',
    secondaryColor: '#a1583d',
    description: 'Crisp high-mountain oolong subtly scented with sweet Japanese white peach skin.',
    iconBg: '#9a3412',
    origin: 'Alishan, Taiwan'
  }
};

// Milks
export const MILK_CATALOG: Record<MilkType, IngredientDefinition> = {
  whole_milk: {
    id: 'whole_milk',
    name: 'Organic Whole Milk',
    category: 'milk',
    color: '#fffbf2',
    secondaryColor: '#f3eedf',
    description: 'Rich local dairy whole milk that provides a silky, velvety body.',
    iconBg: '#d6d3d1'
  },
  oat_milk: {
    id: 'oat_milk',
    name: 'Barista Oat Milk',
    category: 'milk',
    color: '#f5edd6',
    secondaryColor: '#e0d5b7',
    description: 'Nutty, dairy-free oat milk crafted specifically to complement roasted teas.',
    iconBg: '#b45309'
  },
  coconut_milk: {
    id: 'coconut_milk',
    name: 'Pressed Coconut Milk',
    category: 'milk',
    color: '#faf7f2',
    secondaryColor: '#ece3d5',
    description: 'Fragrant tropical coconut cream that pairs deliciously with taro and fruits.',
    iconBg: '#78716c'
  },
  condensed_milk: {
    id: 'condensed_milk',
    name: 'Sweet Condensed Milk',
    category: 'milk',
    color: '#fef08a',
    secondaryColor: '#eab308',
    description: 'Thick caramelized milk standard for classic Southeast Asian and Thai milk teas.',
    iconBg: '#ca8a04'
  },
  soy_milk: {
    id: 'soy_milk',
    name: 'Fresh Soy Milk',
    category: 'milk',
    color: '#fdf4dc',
    secondaryColor: '#e8dbb8',
    description: 'Traditional Taiwanese ground organic soy bean milk with clean nutty notes.',
    iconBg: '#a16207'
  },
  none: {
    id: 'none',
    name: 'No Milk (Pure Tea)',
    category: 'milk',
    color: 'transparent',
    description: 'Crisp clear brew without dairy or milk additions.',
    iconBg: '#44403c'
  }
};

// Sweeteners
export const SWEETENER_CATALOG: Record<SweetenerType, IngredientDefinition> = {
  brown_sugar: {
    id: 'brown_sugar',
    name: 'Okinawa Brown Sugar Syrup',
    category: 'sweetener',
    color: '#451a03',
    description: 'Slow-simmered dark muscovado syrup that creates stunning tiger lava streaks.',
    iconBg: '#78350f'
  },
  cane_sugar: {
    id: 'cane_sugar',
    name: 'Golden Cane Syrup',
    category: 'sweetener',
    color: '#d97706',
    description: 'Pure unrefined cane sugar for a crisp, transparent sweetness.',
    iconBg: '#b45309'
  },
  golden_honey: {
    id: 'golden_honey',
    name: 'Wildflower Blossom Honey',
    category: 'sweetener',
    color: '#f59e0b',
    description: 'Fragrant natural floral honey that deepens green and oolong tea aromatics.',
    iconBg: '#d97706'
  },
  wintermelon: {
    id: 'wintermelon',
    name: 'Slow Wintermelon Nectar',
    category: 'sweetener',
    color: '#713f12',
    description: 'Caramelized wintermelon gourd syrup offering nostalgic herbal brown sweetness.',
    iconBg: '#854d0e'
  },
  none: {
    id: 'none',
    name: 'Unsweetened (0%)',
    category: 'sweetener',
    color: 'transparent',
    description: 'Zero added syrups for pure tea connoisseurs.',
    iconBg: '#292524'
  }
};

// Toppings
export const TOPPING_CATALOG: Record<ToppingType, IngredientDefinition> = {
  black_pearls: {
    id: 'black_pearls',
    name: 'Brown Sugar Tapioca Pearls',
    category: 'topping',
    color: '#1a1412',
    secondaryColor: '#422006',
    description: 'Handmade cassava tapioca simmered for 90 minutes in warm brown sugar syrup. Chewy "QQ" perfection.',
    iconBg: '#1c1917'
  },
  popping_boba: {
    id: 'popping_boba',
    name: 'Mango Burst Popping Boba',
    category: 'topping',
    color: '#fbbf24',
    secondaryColor: '#f59e0b',
    description: 'Translucent calcium alginate pearls filled with real Alphonso mango fruit juice.',
    iconBg: '#f59e0b'
  },
  lychee_jelly: {
    id: 'lychee_jelly',
    name: 'Crystal Lychee Jelly',
    category: 'topping',
    color: '#fdf2f8',
    secondaryColor: '#fbcfe8',
    description: 'Cool coconut nata-de-coco cubes infused with fragrant tropical lychee juice.',
    iconBg: '#db2777'
  },
  egg_pudding: {
    id: 'egg_pudding',
    name: 'Silken Egg Custard Pudding',
    category: 'topping',
    color: '#fef08a',
    secondaryColor: '#eab308',
    description: 'Ultra-creamy custard flan that melts luxuriously through every sip.',
    iconBg: '#ca8a04'
  },
  grass_jelly: {
    id: 'grass_jelly',
    name: 'Herbal Grass Jelly (Mesona)',
    category: 'topping',
    color: '#18181b',
    secondaryColor: '#27272a',
    description: 'Refreshing cooling herbal mint-family jelly traditionally crafted for hot afternoons.',
    iconBg: '#27272a'
  },
  cheese_foam: {
    id: 'cheese_foam',
    name: 'Salted Velvet Cheese Foam',
    category: 'topping',
    color: '#fffbeb',
    secondaryColor: '#fef3c7',
    description: 'Whip of New Zealand cream cheese, fresh whipping cream, and Himalayan pink salt.',
    iconBg: '#fef3c7'
  }
};

// THE 12 LEGENDARY RECIPES ("BOBAFLOW 12 CODEX")
export const BOBAFLOW_12_RECIPES: BobaRecipe[] = [
  {
    id: 'tiger_brown_sugar',
    codeNumber: 1,
    name: 'Tiger Brown Sugar Deerioca',
    chineseName: '黑糖珍珠鮮奶',
    tagline: 'Warm brown sugar stripes cascading down chilled organic milk',
    description: 'The global phenomenon: slow-simmered tapioca pearls coated in Okinawa brown sugar syrup, layered against chilled whole milk and malted Assam tea, finished with torched cream.',
    tea: 'assam_black',
    teaRatio: 40,
    milk: 'whole_milk',
    milkRatio: 60,
    sweetener: 'brown_sugar',
    recommendedSweetness: 70,
    recommendedIce: 70,
    requiredToppings: ['black_pearls'],
    requiresCheeseFoam: true,
    requiresTorch: true,
    accentColor: '#92400e',
    difficulty: 'Easy',
    flavorProfile: {
      teaStrength: 3,
      sweetness: 5,
      creaminess: 5,
      chewiness: 5,
      aroma: 4
    }
  },
  {
    id: 'cloud_jasmine_foam',
    codeNumber: 2,
    name: 'Cloud Jasmine Cheese Cap',
    chineseName: '芝士茉莉綠茶',
    tagline: 'Floral jade green tea crowned with thick salted velvet cream',
    description: 'High-mountain green tea infused seven times with fresh jasmine blossoms, poured over ice and crowned with a thick layer of salted cheese cream.',
    tea: 'jasmine_green',
    teaRatio: 85,
    milk: 'none',
    milkRatio: 0,
    sweetener: 'cane_sugar',
    recommendedSweetness: 50,
    recommendedIce: 70,
    requiredToppings: ['lychee_jelly', 'cheese_foam'],
    requiresCheeseFoam: true,
    accentColor: '#ca8a04',
    difficulty: 'Easy',
    flavorProfile: {
      teaStrength: 4,
      sweetness: 3,
      creaminess: 4,
      chewiness: 2,
      aroma: 5
    }
  },
  {
    id: 'uji_matcha_float',
    codeNumber: 3,
    name: 'Uji Matcha Velvet Float',
    chineseName: '宇治抹茶歐蕾',
    tagline: 'Ceremonial Japanese matcha whisked over sweet oat milk',
    description: 'Vibrant emerald green ceremonial matcha freshly whisked, resting on a layer of oat milk, honey, and warm tapioca pearls.',
    tea: 'ceremonial_matcha',
    teaRatio: 45,
    milk: 'oat_milk',
    milkRatio: 55,
    sweetener: 'golden_honey',
    recommendedSweetness: 50,
    recommendedIce: 30,
    requiredToppings: ['black_pearls'],
    accentColor: '#4d7c0f',
    difficulty: 'Medium',
    flavorProfile: {
      teaStrength: 5,
      sweetness: 3,
      creaminess: 4,
      chewiness: 4,
      aroma: 5
    }
  },
  {
    id: 'taro_moon_mist',
    codeNumber: 4,
    name: 'Taro Moon Mist',
    chineseName: '香芋椰香奶茶',
    tagline: 'Silky purple taro puree blended with pressed coconut milk',
    description: 'Comforting, nutty steamed purple taro combined with velvety coconut milk, fresh black pearls, and herbal grass jelly for cooling balance.',
    tea: 'assam_black',
    teaRatio: 30,
    milk: 'coconut_milk',
    milkRatio: 70,
    sweetener: 'cane_sugar',
    recommendedSweetness: 50,
    recommendedIce: 30,
    requiredToppings: ['black_pearls', 'grass_jelly'],
    accentColor: '#9333ea',
    difficulty: 'Medium',
    flavorProfile: {
      teaStrength: 2,
      sweetness: 4,
      creaminess: 5,
      chewiness: 4,
      aroma: 4
    }
  },
  {
    id: 'bangkok_golden_spice',
    codeNumber: 5,
    name: 'Bangkok Golden Spice',
    chineseName: '泰式手標奶茶',
    tagline: 'Spiced Ceylon tea poured over sweet condensed cream',
    description: 'Vivid orange Thai tea brewed with star anise and crushed cardamom, blended with sweet condensed milk, evaporated milk, and glossy boba.',
    tea: 'thai_ceylon',
    teaRatio: 60,
    milk: 'condensed_milk',
    milkRatio: 40,
    sweetener: 'brown_sugar',
    recommendedSweetness: 70,
    recommendedIce: 100,
    requiredToppings: ['black_pearls'],
    accentColor: '#ea580c',
    difficulty: 'Medium',
    flavorProfile: {
      teaStrength: 5,
      sweetness: 5,
      creaminess: 4,
      chewiness: 4,
      aroma: 5
    }
  },
  {
    id: 'mango_pomelo_nectar',
    codeNumber: 6,
    name: 'Mango Pomelo Sparkle',
    chineseName: '楊枝甘露晶球',
    tagline: 'Golden mango nectar, coconut cream, and bursting citrus pearls',
    description: 'Inspired by Hong Kong dessert craftsmanship: refreshing jasmine tea, mango juice, coconut cream swirl, and bursting mango popping boba.',
    tea: 'jasmine_green',
    teaRatio: 50,
    milk: 'coconut_milk',
    milkRatio: 30,
    sweetener: 'golden_honey',
    recommendedSweetness: 70,
    recommendedIce: 70,
    requiredToppings: ['popping_boba', 'lychee_jelly'],
    accentColor: '#f59e0b',
    difficulty: 'Medium',
    flavorProfile: {
      teaStrength: 2,
      sweetness: 5,
      creaminess: 3,
      chewiness: 4,
      aroma: 5
    }
  },
  {
    id: 'smoked_oolong_macchiato',
    codeNumber: 7,
    name: 'Smoked Oolong Macchiato',
    chineseName: '碳焙烏龍瑪奇朵',
    tagline: 'Charcoal-roasted Tie Guan Yin with salted pink cream foam',
    description: 'Deep amber roasted oolong tea with subtle peat and roasted grain notes, crowned with a thick Himalayan pink salt cream cap.',
    tea: 'roasted_oolong',
    teaRatio: 80,
    milk: 'none',
    milkRatio: 0,
    sweetener: 'cane_sugar',
    recommendedSweetness: 30,
    recommendedIce: 30,
    requiredToppings: ['black_pearls', 'cheese_foam'],
    requiresCheeseFoam: true,
    accentColor: '#78350f',
    difficulty: 'Medium',
    flavorProfile: {
      teaStrength: 5,
      sweetness: 2,
      creaminess: 3,
      chewiness: 4,
      aroma: 5
    }
  },
  {
    id: 'wintermelon_dew_dew',
    codeNumber: 8,
    name: 'Wintermelon Custard Dew',
    chineseName: '冬瓜布丁鮮奶',
    tagline: 'Caramelized wintermelon nectar and silken egg pudding',
    description: 'Slow-simmered traditional wintermelon gourd tea paired with whole milk and large scoops of velvety egg custard pudding. No added sugar required.',
    tea: 'assam_black',
    teaRatio: 40,
    milk: 'whole_milk',
    milkRatio: 60,
    sweetener: 'wintermelon',
    recommendedSweetness: 0, // wintermelon tea is naturally sweetened
    recommendedIce: 30,
    requiredToppings: ['egg_pudding'],
    accentColor: '#b45309',
    difficulty: 'Easy',
    flavorProfile: {
      teaStrength: 2,
      sweetness: 4,
      creaminess: 5,
      chewiness: 3,
      aroma: 4
    }
  },
  {
    id: 'peach_blossom_breeze',
    codeNumber: 9,
    name: 'Peach Blossom Lychee Dew',
    chineseName: '白桃烏龍荔枝凍',
    tagline: 'Fragrant white peach oolong with translucent crystal lychee',
    description: 'Delicate high-elevation oolong naturally perfumed with Japanese white peach, poured over shaved ice with bouncy lychee coconut jelly.',
    tea: 'white_peach_oolong',
    teaRatio: 85,
    milk: 'none',
    milkRatio: 0,
    sweetener: 'golden_honey',
    recommendedSweetness: 50,
    recommendedIce: 70,
    requiredToppings: ['lychee_jelly', 'popping_boba'],
    accentColor: '#f43f5e',
    difficulty: 'Medium',
    flavorProfile: {
      teaStrength: 3,
      sweetness: 3,
      creaminess: 1,
      chewiness: 4,
      aroma: 5
    }
  },
  {
    id: 'kyoto_hojicha_latte',
    codeNumber: 10,
    name: 'Kyoto Golden Hojicha',
    chineseName: '京都焙茶拿鐵',
    tagline: 'Toasted green tea leaves blended with creamy barista oat milk',
    description: 'Earthy, nutty Japanese roasted green tea with minimal caffeine, layered with creamy oat milk and golden honeyed boba.',
    tea: 'roasted_oolong',
    teaRatio: 50,
    milk: 'oat_milk',
    milkRatio: 50,
    sweetener: 'golden_honey',
    recommendedSweetness: 50,
    recommendedIce: 30,
    requiredToppings: ['black_pearls', 'grass_jelly'],
    accentColor: '#854d0e',
    difficulty: 'Master',
    flavorProfile: {
      teaStrength: 4,
      sweetness: 3,
      creaminess: 4,
      chewiness: 4,
      aroma: 5
    }
  },
  {
    id: 'taipei_classic_heritage',
    codeNumber: 11,
    name: '1988 Heritage Milk Tea',
    chineseName: '經典波霸奶茶',
    tagline: 'The original Taiwanese bubble tea standard that started it all',
    description: 'Robust Assam black tea, non-dairy creamer / whole milk blend, golden cane syrup, and double scoops of warm chewy black tapioca pearls.',
    tea: 'assam_black',
    teaRatio: 50,
    milk: 'whole_milk',
    milkRatio: 50,
    sweetener: 'cane_sugar',
    recommendedSweetness: 70,
    recommendedIce: 70,
    requiredToppings: ['black_pearls'],
    accentColor: '#a16207',
    difficulty: 'Easy',
    flavorProfile: {
      teaStrength: 4,
      sweetness: 4,
      creaminess: 4,
      chewiness: 5,
      aroma: 4
    }
  },
  {
    id: 'brûlée_royal_supreme',
    codeNumber: 12,
    name: 'Brûlée Royal Supreme 12',
    chineseName: '烤布蕾皇家至尊',
    tagline: 'The apex of bubble tea: torched brown sugar custard over royal milk tea',
    description: 'Our master flagship: Assam black tea & oat milk, egg pudding layer, brown sugar pearls, capped with rich salted cheese cream and torched with a culinary flame.',
    tea: 'assam_black',
    teaRatio: 45,
    milk: 'oat_milk',
    milkRatio: 55,
    sweetener: 'brown_sugar',
    recommendedSweetness: 70,
    recommendedIce: 30,
    requiredToppings: ['black_pearls', 'egg_pudding', 'cheese_foam'],
    requiresCheeseFoam: true,
    requiresTorch: true,
    accentColor: '#b45309',
    difficulty: 'Master',
    flavorProfile: {
      teaStrength: 4,
      sweetness: 5,
      creaminess: 5,
      chewiness: 5,
      aroma: 5
    }
  }
];

// 12 PROGRESSIVE SHIFTS / DAYS (CAMPAIGN MODE)
export const SHIFT_DAYS: ShiftDay[] = [
  {
    dayNumber: 1,
    title: 'Day 1: The Soft Opening',
    targetEarnings: 80,
    timeLimitSeconds: 75,
    unlockedRecipes: ['taipei_classic_heritage', 'cloud_jasmine_foam'],
    storyDialogue: 'Welcome to your first morning at BobaFlow 12! Neighborhood locals are trickling in for their morning classic milk tea fix.',
    ordersPool: [
      {
        id: 'c1_1',
        customerName: 'Mei-Ling (Student)',
        customerAvatar: '🎒',
        customerRole: 'High School Senior',
        tea: 'assam_black',
        milk: 'whole_milk',
        sweetness: 70,
        iceLevel: 70,
        toppings: ['black_pearls'],
        dialogue: 'Hi! Can I get a classic heritage milk tea with boba? Long exam day ahead!',
        patienceTotalSeconds: 30,
        patienceRemainingSeconds: 30,
        tipMultiplier: 1.2
      },
      {
        id: 'c1_2',
        customerName: 'Mr. Chen',
        customerAvatar: '👔',
        customerRole: 'Bank Manager',
        tea: 'jasmine_green',
        milk: 'none',
        sweetness: 50,
        iceLevel: 70,
        toppings: ['lychee_jelly', 'cheese_foam'],
        requiresCheeseFoam: true,
        dialogue: 'Good morning. Just a fragrant jasmine green with salted cheese cap and crystal jelly, please.',
        patienceTotalSeconds: 32,
        patienceRemainingSeconds: 32,
        tipMultiplier: 1.3
      },
      {
        id: 'c1_3',
        customerName: 'Chloe (Barista Friend)',
        customerAvatar: '☕',
        customerRole: 'Coffee Specialist',
        tea: 'assam_black',
        milk: 'whole_milk',
        sweetness: 30,
        iceLevel: 30,
        toppings: ['black_pearls'],
        dialogue: 'Congrats on opening! Let me try your Assam black with whole milk, light ice, and pearls.',
        patienceTotalSeconds: 28,
        patienceRemainingSeconds: 28,
        tipMultiplier: 1.5
      }
    ]
  },
  {
    dayNumber: 2,
    title: 'Day 2: The Brown Sugar Rush',
    targetEarnings: 120,
    timeLimitSeconds: 70,
    unlockedRecipes: ['tiger_brown_sugar', 'taipei_classic_heritage'],
    storyDialogue: 'Word spread on Instagram about our warm brown sugar tapioca! Expect sweet tooth connoisseurs.',
    ordersPool: [
      {
        id: 'c2_1',
        customerName: 'Yuki (Food Blogger)',
        customerAvatar: '📸',
        customerRole: 'Boba Reviewer',
        tea: 'assam_black',
        milk: 'whole_milk',
        sweetness: 70,
        iceLevel: 70,
        toppings: ['black_pearls', 'cheese_foam'],
        requiresCheeseFoam: true,
        requiresTorch: true,
        dialogue: 'I need the signature Tiger Brown Sugar with torched brûlée! Make those tiger stripes pop for the camera!',
        patienceTotalSeconds: 28,
        patienceRemainingSeconds: 28,
        tipMultiplier: 1.6
      },
      {
        id: 'c2_2',
        customerName: 'David (Programmer)',
        customerAvatar: '💻',
        customerRole: 'Senior Engineer',
        tea: 'assam_black',
        milk: 'whole_milk',
        sweetness: 100,
        iceLevel: 30,
        toppings: ['black_pearls'],
        dialogue: 'Refactoring bug sprint today. 100% sweetness, warm pearls, extra energy please.',
        patienceTotalSeconds: 25,
        patienceRemainingSeconds: 25,
        tipMultiplier: 1.2
      },
      {
        id: 'c2_3',
        customerName: 'Auntie Lin',
        customerAvatar: '👒',
        customerRole: 'Neighborhood Regular',
        tea: 'jasmine_green',
        milk: 'none',
        sweetness: 30,
        iceLevel: 0,
        toppings: ['lychee_jelly'],
        dialogue: 'Warm day! Just jasmine tea with no ice and little sugar, keep it refreshing for Auntie.',
        patienceTotalSeconds: 30,
        patienceRemainingSeconds: 30,
        tipMultiplier: 1.3
      }
    ]
  },
  {
    dayNumber: 3,
    title: 'Day 3: Uji Green Harmony',
    targetEarnings: 150,
    timeLimitSeconds: 70,
    unlockedRecipes: ['uji_matcha_float', 'cloud_jasmine_foam'],
    storyDialogue: 'Fresh shipment of ceremonial Uji matcha has arrived from Kyoto. Whisk with precision!',
    ordersPool: [
      {
        id: 'c3_1',
        customerName: 'Kenji (Tea Sommelier)',
        customerAvatar: '🍵',
        customerRole: 'Ceremony Master',
        tea: 'ceremonial_matcha',
        milk: 'oat_milk',
        sweetness: 50,
        iceLevel: 30,
        toppings: ['black_pearls'],
        dialogue: 'Show me your Uji Matcha Velvet Float. Keep the matcha layer vivid over the oat milk.',
        patienceTotalSeconds: 26,
        patienceRemainingSeconds: 26,
        tipMultiplier: 1.8
      },
      {
        id: 'c3_2',
        customerName: 'Sara (Graphic Designer)',
        customerAvatar: '🎨',
        customerRole: 'Art Director',
        tea: 'ceremonial_matcha',
        milk: 'oat_milk',
        sweetness: 30,
        iceLevel: 70,
        toppings: ['black_pearls', 'cheese_foam'],
        requiresCheeseFoam: true,
        dialogue: 'Matcha with cheese foam cap! The green and white contrast gives me life today.',
        patienceTotalSeconds: 26,
        patienceRemainingSeconds: 26,
        tipMultiplier: 1.4
      },
      {
        id: 'c3_3',
        customerName: 'Leo (Runner)',
        customerAvatar: '🏃',
        customerRole: 'Marathoner',
        tea: 'jasmine_green',
        milk: 'none',
        sweetness: 50,
        iceLevel: 100,
        toppings: ['popping_boba'],
        dialogue: 'Post-run quench! Cold jasmine with popping boba and extra ice, stat!',
        patienceTotalSeconds: 24,
        patienceRemainingSeconds: 24,
        tipMultiplier: 1.3
      }
    ]
  },
  {
    dayNumber: 4,
    title: 'Day 4: Tropical Heatwave',
    targetEarnings: 180,
    timeLimitSeconds: 65,
    unlockedRecipes: ['mango_pomelo_nectar', 'bangkok_golden_spice'],
    storyDialogue: 'It is 34°C outside! Everyone wants crushed ice, bright mango, and refreshing citrus.',
    ordersPool: [
      {
        id: 'c4_1',
        customerName: 'Maya (Surfer)',
        customerAvatar: '🏄‍♀️',
        customerRole: 'Beach Instructor',
        tea: 'jasmine_green',
        milk: 'coconut_milk',
        sweetness: 70,
        iceLevel: 70,
        toppings: ['popping_boba', 'lychee_jelly'],
        dialogue: 'Mango Pomelo Sparkle please! Double tropical toppings, ready for the waves.',
        patienceTotalSeconds: 24,
        patienceRemainingSeconds: 24,
        tipMultiplier: 1.5
      },
      {
        id: 'c4_2',
        customerName: 'Niran (Chef)',
        customerAvatar: '👨‍🍳',
        customerRole: 'Street Food Cook',
        tea: 'thai_ceylon',
        milk: 'condensed_milk',
        sweetness: 70,
        iceLevel: 100,
        toppings: ['black_pearls'],
        dialogue: 'Authentic Thai Spiced Ceylon, full condensed milk and full ice like in Bangkok!',
        patienceTotalSeconds: 25,
        patienceRemainingSeconds: 25,
        tipMultiplier: 1.5
      },
      {
        id: 'c4_3',
        customerName: 'Olivia (Pediatrician)',
        customerAvatar: '🩺',
        customerRole: 'Doctor on Shift',
        tea: 'white_peach_oolong',
        milk: 'none',
        sweetness: 50,
        iceLevel: 70,
        toppings: ['lychee_jelly'],
        dialogue: 'Peach blossom oolong with lychee jelly! Smooth and rejuvenating.',
        patienceTotalSeconds: 22,
        patienceRemainingSeconds: 22,
        tipMultiplier: 1.4
      }
    ]
  },
  {
    dayNumber: 5,
    title: 'Day 5: Velvet Taro Craze',
    targetEarnings: 210,
    timeLimitSeconds: 65,
    unlockedRecipes: ['taro_moon_mist', 'wintermelon_dew_dew'],
    storyDialogue: 'Locals are in love with our fresh purple taro and slow caramelized wintermelon!',
    ordersPool: [
      {
        id: 'c5_1',
        customerName: 'Jasmine (Baker)',
        customerAvatar: '🧁',
        customerRole: 'Pastry Chef',
        tea: 'assam_black',
        milk: 'coconut_milk',
        sweetness: 50,
        iceLevel: 30,
        toppings: ['black_pearls', 'grass_jelly'],
        dialogue: 'Taro Moon Mist! Coconut milk, chewy pearls, and cooling grass jelly please.',
        patienceTotalSeconds: 24,
        patienceRemainingSeconds: 24,
        tipMultiplier: 1.4
      },
      {
        id: 'c5_2',
        customerName: 'Grandpa Wu',
        customerAvatar: '👴',
        customerRole: 'Tea Elder',
        tea: 'assam_black',
        milk: 'whole_milk',
        sweetness: 0,
        iceLevel: 30,
        toppings: ['egg_pudding'],
        dialogue: 'Wintermelon Custard Dew. Smooth egg pudding, no added sugar, pure nostalgic comfort.',
        patienceTotalSeconds: 28,
        patienceRemainingSeconds: 28,
        tipMultiplier: 1.6
      },
      {
        id: 'c5_3',
        customerName: 'Grace (College RA)',
        customerAvatar: '🎧',
        customerRole: 'Student Leader',
        tea: 'assam_black',
        milk: 'whole_milk',
        sweetness: 70,
        iceLevel: 70,
        toppings: ['black_pearls', 'egg_pudding'],
        dialogue: 'Classic milk tea with double toppings: boba AND egg custard! Today was huge.',
        patienceTotalSeconds: 22,
        patienceRemainingSeconds: 22,
        tipMultiplier: 1.3
      }
    ]
  },
  {
    dayNumber: 6,
    title: 'Day 6: Roasted Smoke & Silk',
    targetEarnings: 240,
    timeLimitSeconds: 60,
    unlockedRecipes: ['smoked_oolong_macchiato', 'peach_blossom_breeze'],
    storyDialogue: 'Charcoal roast mastery: Iron Goddess Oolong steeped to golden precision.',
    ordersPool: [
      {
        id: 'c6_1',
        customerName: 'Victor (Architect)',
        customerAvatar: '📐',
        customerRole: 'Lead Designer',
        tea: 'roasted_oolong',
        milk: 'none',
        sweetness: 30,
        iceLevel: 30,
        toppings: ['black_pearls', 'cheese_foam'],
        requiresCheeseFoam: true,
        dialogue: 'Smoked Oolong Macchiato, light sweetness, with that thick salted foam.',
        patienceTotalSeconds: 22,
        patienceRemainingSeconds: 22,
        tipMultiplier: 1.5
      },
      {
        id: 'c6_2',
        customerName: 'Bella (Fashion Stylist)',
        customerAvatar: '🕶️',
        customerRole: 'Boutique Stylist',
        tea: 'white_peach_oolong',
        milk: 'none',
        sweetness: 50,
        iceLevel: 70,
        toppings: ['lychee_jelly', 'popping_boba'],
        dialogue: 'Peach Blossom Lychee Dew! Make it as gorgeous as high fashion.',
        patienceTotalSeconds: 22,
        patienceRemainingSeconds: 22,
        tipMultiplier: 1.6
      },
      {
        id: 'c6_3',
        customerName: 'Sam (Delivery Hero)',
        customerAvatar: '🛵',
        customerRole: 'Courier',
        tea: 'thai_ceylon',
        milk: 'condensed_milk',
        sweetness: 70,
        iceLevel: 100,
        toppings: ['black_pearls'],
        dialogue: 'Quick Thai tea with ice! Need that caffeine kick for the next delivery route!',
        patienceTotalSeconds: 20,
        patienceRemainingSeconds: 20,
        tipMultiplier: 1.4
      }
    ]
  },
  {
    dayNumber: 7,
    title: 'Day 7: Weekend Afternoon Rush',
    targetEarnings: 280,
    timeLimitSeconds: 60,
    unlockedRecipes: ['kyoto_hojicha_latte'],
    storyDialogue: 'The line wraps around the corner! Move fast, seal cleanly, and keep your composure.',
    ordersPool: [
      {
        id: 'c7_1',
        customerName: 'Hannah (Librarian)',
        customerAvatar: '📚',
        customerRole: 'Book Curator',
        tea: 'roasted_oolong',
        milk: 'oat_milk',
        sweetness: 50,
        iceLevel: 30,
        toppings: ['black_pearls', 'grass_jelly'],
        dialogue: 'Kyoto Golden Hojicha with oat milk and grass jelly. Cozy reading fuel.',
        patienceTotalSeconds: 22,
        patienceRemainingSeconds: 22,
        tipMultiplier: 1.5
      },
      {
        id: 'c7_2',
        customerName: 'Liam (Esports Pro)',
        customerAvatar: '🎮',
        customerRole: 'Tournament Finalist',
        tea: 'ceremonial_matcha',
        milk: 'oat_milk',
        sweetness: 50,
        iceLevel: 30,
        toppings: ['black_pearls'],
        dialogue: 'Uji Matcha float! Game starts in 10 minutes, let’s win this!',
        patienceTotalSeconds: 20,
        patienceRemainingSeconds: 20,
        tipMultiplier: 1.7
      },
      {
        id: 'c7_3',
        customerName: 'Aria (Violinist)',
        customerAvatar: '🎻',
        customerRole: 'Orchestra Soloist',
        tea: 'jasmine_green',
        milk: 'none',
        sweetness: 50,
        iceLevel: 70,
        toppings: ['lychee_jelly', 'cheese_foam'],
        requiresCheeseFoam: true,
        dialogue: 'Jasmine cheese cap with lychee jelly! Smooth harmony in every note.',
        patienceTotalSeconds: 22,
        patienceRemainingSeconds: 22,
        tipMultiplier: 1.6
      }
    ]
  },
  {
    dayNumber: 8,
    title: 'Day 8: Secret Menu Craving',
    targetEarnings: 310,
    timeLimitSeconds: 58,
    unlockedRecipes: ['brûlée_royal_supreme'],
    storyDialogue: 'VIP customers are requesting customized creations. Precision is paramount.',
    ordersPool: [
      {
        id: 'c8_1',
        customerName: 'Marcus (Venture Capitalist)',
        customerAvatar: '💼',
        customerRole: 'Tech Investor',
        tea: 'assam_black',
        milk: 'oat_milk',
        sweetness: 70,
        iceLevel: 30,
        toppings: ['black_pearls', 'egg_pudding', 'cheese_foam'],
        requiresCheeseFoam: true,
        requiresTorch: true,
        dialogue: 'The legendary Brûlée Royal Supreme 12! Torch that sugar crust to golden perfection.',
        patienceTotalSeconds: 23,
        patienceRemainingSeconds: 23,
        tipMultiplier: 2.0
      },
      {
        id: 'c8_2',
        customerName: 'Zara (Choreographer)',
        customerAvatar: '💃',
        customerRole: 'Dance Director',
        tea: 'white_peach_oolong',
        milk: 'none',
        sweetness: 50,
        iceLevel: 70,
        toppings: ['popping_boba'],
        dialogue: 'White peach oolong with popping boba! Light on calories, explosive on flavor.',
        patienceTotalSeconds: 20,
        patienceRemainingSeconds: 20,
        tipMultiplier: 1.5
      },
      {
        id: 'c8_3',
        customerName: 'Tatsuya (Photographer)',
        customerAvatar: '📷',
        customerRole: 'Editorial Shooter',
        tea: 'assam_black',
        milk: 'whole_milk',
        sweetness: 70,
        iceLevel: 70,
        toppings: ['black_pearls', 'cheese_foam'],
        requiresCheeseFoam: true,
        requiresTorch: true,
        dialogue: 'Tiger brown sugar with flame torching. I am photographing this for City Magazine!',
        patienceTotalSeconds: 22,
        patienceRemainingSeconds: 22,
        tipMultiplier: 1.8
      }
    ]
  },
  {
    dayNumber: 9,
    title: 'Day 9: Double Topping Frenzy',
    targetEarnings: 340,
    timeLimitSeconds: 55,
    unlockedRecipes: ['tiger_brown_sugar', 'uji_matcha_float', 'taro_moon_mist'],
    storyDialogue: 'Customers want multi-layered concoctions! Balance your pour weights accurately.',
    ordersPool: [
      {
        id: 'c9_1',
        customerName: 'Felix (Botanist)',
        customerAvatar: '🌿',
        customerRole: 'Plant Scientist',
        tea: 'ceremonial_matcha',
        milk: 'oat_milk',
        sweetness: 30,
        iceLevel: 30,
        toppings: ['black_pearls', 'grass_jelly'],
        dialogue: 'Ceremonial matcha with oat milk, boba, and herbal grass jelly. Earthy and clean.',
        patienceTotalSeconds: 20,
        patienceRemainingSeconds: 20,
        tipMultiplier: 1.7
      },
      {
        id: 'c9_2',
        customerName: 'Serena (Yoga Master)',
        customerAvatar: '🧘‍♀️',
        customerRole: 'Mindfulness Coach',
        tea: 'jasmine_green',
        milk: 'none',
        sweetness: 30,
        iceLevel: 0,
        toppings: ['lychee_jelly'],
        dialogue: 'Zero ice jasmine green, gentle sweetness with lychee jelly. Peaceful hydration.',
        patienceTotalSeconds: 22,
        patienceRemainingSeconds: 22,
        tipMultiplier: 1.4
      },
      {
        id: 'c9_3',
        customerName: 'Chef Antoine',
        customerAvatar: '🧑‍🍳',
        customerRole: 'Michelin Star Chef',
        tea: 'roasted_oolong',
        milk: 'none',
        sweetness: 30,
        iceLevel: 30,
        toppings: ['black_pearls', 'cheese_foam'],
        requiresCheeseFoam: true,
        dialogue: 'I heard of your Tie Guan Yin roast profile. Show me your cheese foam integration.',
        patienceTotalSeconds: 21,
        patienceRemainingSeconds: 21,
        tipMultiplier: 2.2
      }
    ]
  },
  {
    dayNumber: 10,
    title: 'Day 10: Night Market Carnival',
    targetEarnings: 380,
    timeLimitSeconds: 52,
    unlockedRecipes: ['bangkok_golden_spice', 'mango_pomelo_nectar', 'wintermelon_dew_dew'],
    storyDialogue: 'The lanterns are lit! The famous Shilin-inspired street market has opened outside.',
    ordersPool: [
      {
        id: 'c10_1',
        customerName: 'Kai (Skater)',
        customerAvatar: '🛹',
        customerRole: 'Street Skater',
        tea: 'thai_ceylon',
        milk: 'condensed_milk',
        sweetness: 100,
        iceLevel: 100,
        toppings: ['black_pearls'],
        dialogue: 'Thai iced tea, maximum sweet, maximum ice, big straw! Let’s roll!',
        patienceTotalSeconds: 19,
        patienceRemainingSeconds: 19,
        tipMultiplier: 1.5
      },
      {
        id: 'c10_2',
        customerName: 'Min-Ji (Idol Trainee)',
        customerAvatar: '🎤',
        customerRole: 'Vocalist',
        tea: 'white_peach_oolong',
        milk: 'none',
        sweetness: 50,
        iceLevel: 30,
        toppings: ['lychee_jelly', 'popping_boba'],
        dialogue: 'White peach oolong with double fruit toppings. Protecting my vocal cords with flavor!',
        patienceTotalSeconds: 19,
        patienceRemainingSeconds: 19,
        tipMultiplier: 1.8
      },
      {
        id: 'c10_3',
        customerName: 'Officer Raymond',
        customerAvatar: '👮‍♂️',
        customerRole: 'Night Patrol',
        tea: 'assam_black',
        milk: 'whole_milk',
        sweetness: 70,
        iceLevel: 70,
        toppings: ['black_pearls', 'egg_pudding'],
        dialogue: 'Classic Assam milk tea with boba and egg custard. Fuel for the late night beat.',
        patienceTotalSeconds: 21,
        patienceRemainingSeconds: 21,
        tipMultiplier: 1.6
      }
    ]
  },
  {
    dayNumber: 11,
    title: 'Day 11: Tea Master Infiltration',
    targetEarnings: 420,
    timeLimitSeconds: 50,
    unlockedRecipes: ['kyoto_hojicha_latte', 'brûlée_royal_supreme'],
    storyDialogue: 'Judges from the International Boba Association have entered disguised as regular patrons!',
    ordersPool: [
      {
        id: 'c11_1',
        customerName: 'Grandmaster Lin',
        customerAvatar: '🥷',
        customerRole: 'Boba Guild Judge',
        tea: 'roasted_oolong',
        milk: 'oat_milk',
        sweetness: 50,
        iceLevel: 30,
        toppings: ['black_pearls', 'grass_jelly'],
        dialogue: 'Hojicha with oat milk and grass jelly. Let me judge your chewiness and temperature curve.',
        patienceTotalSeconds: 18,
        patienceRemainingSeconds: 18,
        tipMultiplier: 2.5
      },
      {
        id: 'c11_2',
        customerName: 'Critic Evelyn',
        customerAvatar: '🧐',
        customerRole: 'Beverage Critic',
        tea: 'assam_black',
        milk: 'oat_milk',
        sweetness: 70,
        iceLevel: 30,
        toppings: ['black_pearls', 'egg_pudding', 'cheese_foam'],
        requiresCheeseFoam: true,
        requiresTorch: true,
        dialogue: 'Brûlée Royal Supreme 12. If the foam flame isn’t caramelized crisp, you fail my column.',
        patienceTotalSeconds: 20,
        patienceRemainingSeconds: 20,
        tipMultiplier: 2.5
      },
      {
        id: 'c11_3',
        customerName: 'Mayor Tanaka',
        customerAvatar: '🎖️',
        customerRole: 'City Mayor',
        tea: 'ceremonial_matcha',
        milk: 'oat_milk',
        sweetness: 50,
        iceLevel: 30,
        toppings: ['black_pearls'],
        dialogue: 'Welcome to our district! Make me your finest Uji Matcha velvet float.',
        patienceTotalSeconds: 20,
        patienceRemainingSeconds: 20,
        tipMultiplier: 2.0
      }
    ]
  },
  {
    dayNumber: 12,
    title: 'Day 12: The Grand Championship',
    targetEarnings: 500,
    timeLimitSeconds: 48,
    unlockedRecipes: BOBAFLOW_12_RECIPES.map((r) => r.id),
    storyDialogue: 'The ultimate final shift! All 12 signature drinks are in play. Deliver flawless BobaFlow mastery!',
    ordersPool: [
      {
        id: 'c12_1',
        customerName: 'World Champion Barista Sora',
        customerAvatar: '👑',
        customerRole: 'Reigning Champion',
        tea: 'assam_black',
        milk: 'oat_milk',
        sweetness: 70,
        iceLevel: 30,
        toppings: ['black_pearls', 'egg_pudding', 'cheese_foam'],
        requiresCheeseFoam: true,
        requiresTorch: true,
        dialogue: 'Let us see if BobaFlow 12 can surpass my championship standard! Royal Brûlée Supreme!',
        patienceTotalSeconds: 18,
        patienceRemainingSeconds: 18,
        tipMultiplier: 3.0
      },
      {
        id: 'c12_2',
        customerName: 'Taiwan Tea Heritage Guild',
        customerAvatar: '📜',
        customerRole: 'Heritage Inspector',
        tea: 'assam_black',
        milk: 'whole_milk',
        sweetness: 70,
        iceLevel: 70,
        toppings: ['black_pearls'],
        dialogue: 'Pure 1988 Heritage Milk Tea. The golden standard of our ancestors.',
        patienceTotalSeconds: 17,
        patienceRemainingSeconds: 17,
        tipMultiplier: 2.5
      },
      {
        id: 'c12_3',
        customerName: 'Global Food Network Host',
        customerAvatar: '🎥',
        customerRole: 'TV Host',
        tea: 'jasmine_green',
        milk: 'coconut_milk',
        sweetness: 70,
        iceLevel: 70,
        toppings: ['popping_boba', 'lychee_jelly'],
        dialogue: 'We are LIVE to 10 million viewers! Mango Pomelo Sparkle, make it sensational!',
        patienceTotalSeconds: 18,
        patienceRemainingSeconds: 18,
        tipMultiplier: 3.0
      }
    ]
  }
];

// SHOP CUSTOMIZATION CATALOG
export const CUP_CATALOG: { id: CupType; name: string; price: number; description: string }[] = [
  { id: 'classic', name: 'Artisan Glass Tumbler', price: 0, description: 'Classic Taiwanese bubble tea cup with curved ergonomic base.' },
  { id: 'slender', name: 'Tokyo Slender Cylinder', price: 150, description: 'Tall, minimalist aesthetic tumbler highlighting vivid multi-layer gradients.' },
  { id: 'chubby', name: 'Kawaii Chubby Jar', price: 280, description: 'Adorable rounded bulb cup for maximum pearl bounce and comfort.' },
  { id: 'frosted_can', name: 'Barista Frosted Canister', price: 420, description: 'Frosted matte rim with sleek metallic accents.' }
];

export const STRAW_CATALOG: { id: StrawType; name: string; price: number; color: string; hex: string }[] = [
  { id: 'classic_black', name: 'Classic Matte Black', price: 0, color: 'Black', hex: '#18181b' },
  { id: 'rose_gold', name: 'Rose Gold Metallic', price: 100, color: 'Rose Gold', hex: '#fb7185' },
  { id: 'pastel_stripe', name: 'Candy Barber Stripe', price: 180, color: 'Pastel Peach', hex: '#fda4af' },
  { id: 'bamboo', name: 'Organic Polished Bamboo', price: 250, color: 'Bamboo Green', hex: '#84cc16' },
  { id: 'golden_amber', name: '24K Golden Amber', price: 380, color: 'Amber Gold', hex: '#f59e0b' }
];

export const SEAL_CATALOG: { id: SealDesign; name: string; price: number; symbol: string }[] = [
  { id: 'tiger_stripe', name: 'Tiger Flame Seal', price: 0, symbol: '🐅' },
  { id: 'sakura_blossom', name: 'Kyoto Sakura Blossom', price: 120, symbol: '🌸' },
  { id: 'bobaflow_crest', name: 'BobaFlow Artisan Crest', price: 200, symbol: '✦' },
  { id: 'golden_lotus', name: 'Golden Alishan Lotus', price: 320, symbol: '🪷' },
  { id: 'minimal_clear', name: 'Crystal Ultra Clear', price: 400, symbol: '◇' }
];
