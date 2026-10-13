export type TeaType = 
  | 'assam_black' 
  | 'jasmine_green' 
  | 'roasted_oolong' 
  | 'thai_ceylon' 
  | 'ceremonial_matcha' 
  | 'white_peach_oolong';

export type MilkType = 
  | 'whole_milk' 
  | 'oat_milk' 
  | 'coconut_milk' 
  | 'condensed_milk' 
  | 'soy_milk' 
  | 'none';

export type SweetenerType = 
  | 'brown_sugar' 
  | 'cane_sugar' 
  | 'golden_honey' 
  | 'wintermelon' 
  | 'none';

export type ToppingType = 
  | 'black_pearls' 
  | 'popping_boba' 
  | 'lychee_jelly' 
  | 'egg_pudding' 
  | 'grass_jelly' 
  | 'cheese_foam';

export type IceLevel = 0 | 30 | 70 | 100;
export type SweetnessLevel = 0 | 30 | 50 | 70 | 100;
export type CupType = 'classic' | 'slender' | 'chubby' | 'frosted_can';
export type StrawType = 'classic_black' | 'rose_gold' | 'pastel_stripe' | 'bamboo' | 'golden_amber';
export type SealDesign = 'tiger_stripe' | 'sakura_blossom' | 'bobaflow_crest' | 'golden_lotus' | 'minimal_clear';

export interface IngredientDefinition {
  id: string;
  name: string;
  category: 'tea' | 'milk' | 'sweetener' | 'topping';
  color: string;
  secondaryColor?: string;
  description: string;
  iconBg: string;
  origin?: string;
}

export interface CurrentCupState {
  tea: TeaType | null;
  teaVolume: number; // 0 to 100
  milk: MilkType;
  milkVolume: number; // 0 to 100
  sweetener: SweetenerType;
  sweetness: SweetnessLevel;
  iceLevel: IceLevel;
  iceCubesCount: number;
  toppings: ToppingType[];
  toppingCounts: Record<ToppingType, number>;
  hasCheeseFoam: boolean;
  isTorched: boolean;
  isSealed: boolean;
  isStrawPunctured: boolean;
  cupType: CupType;
  strawType: StrawType;
  sealDesign: SealDesign;
  shakenProgress: number; // 0 to 100
}

export interface BobaRecipe {
  id: string;
  codeNumber: number; // 1 to 12
  name: string;
  chineseName?: string;
  tagline: string;
  description: string;
  tea: TeaType;
  teaRatio: number; // e.g. 60
  milk: MilkType;
  milkRatio: number; // e.g. 40
  sweetener: SweetenerType;
  recommendedSweetness: SweetnessLevel;
  recommendedIce: IceLevel;
  requiredToppings: ToppingType[];
  requiresCheeseFoam?: boolean;
  requiresTorch?: boolean;
  accentColor: string;
  difficulty: 'Easy' | 'Medium' | 'Master';
  flavorProfile: {
    teaStrength: number; // 1-5
    sweetness: number;   // 1-5
    creaminess: number;  // 1-5
    chewiness: number;   // 1-5
    aroma: number;       // 1-5
  };
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  customerAvatar: string;
  customerRole: string;
  recipeId?: string;
  tea: TeaType;
  milk: MilkType;
  sweetness: SweetnessLevel;
  iceLevel: IceLevel;
  toppings: ToppingType[];
  requiresCheeseFoam?: boolean;
  requiresTorch?: boolean;
  dialogue: string;
  patienceTotalSeconds: number;
  patienceRemainingSeconds: number;
  tipMultiplier: number;
}

export interface ShiftDay {
  dayNumber: number; // 1 to 12
  title: string;
  targetEarnings: number;
  timeLimitSeconds: number;
  unlockedRecipes: string[];
  ordersPool: CustomerOrder[];
  storyDialogue: string;
}

export interface UserShopProgress {
  coins: number;
  starsEarned: Record<number, number>; // dayNumber -> stars (1-3)
  highestDayUnlocked: number; // 1 to 12
  recipesMastered: string[];
  unlockedCups: CupType[];
  unlockedStraws: StrawType[];
  unlockedSeals: SealDesign[];
  activeCup: CupType;
  activeStraw: StrawType;
  activeSeal: SealDesign;
  customRecipes: BobaRecipe[];
}
