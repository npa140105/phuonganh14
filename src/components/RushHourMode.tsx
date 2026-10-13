import React, { useState, useEffect, useRef } from 'react';
import {
  CurrentCupState,
  CustomerOrder,
  ShiftDay,
  TeaType,
  MilkType,
  SweetenerType,
  SweetnessLevel,
  IceLevel,
  ToppingType
} from '../types/boba';
import { SHIFT_DAYS, TEA_CATALOG, MILK_CATALOG, TOPPING_CATALOG } from '../data/bobaData';
import { BobaPhysicsCanvas } from './BobaPhysicsCanvas';
import { sounds } from '../services/soundEffects';
import {
  Flame,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Trophy,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface RushHourModeProps {
  highestDayUnlocked: number;
  starsEarned: Record<number, number>;
  onCompleteDay: (day: number, stars: number, coinsEarned: number) => void;
  cupState: CurrentCupState;
  onUpdateCup: (updater: (prev: CurrentCupState) => CurrentCupState) => void;
  onResetCup: () => void;
}

export const RushHourMode: React.FC<RushHourModeProps> = ({
  highestDayUnlocked,
  starsEarned,
  onCompleteDay,
  cupState,
  onUpdateCup,
  onResetCup
}) => {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [shiftState, setShiftState] = useState<'BRIEFING' | 'SERVING' | 'SUMMARY'>('BRIEFING');
  const [shiftSecondsRemaining, setShiftSecondsRemaining] = useState<number>(60);
  const [earningsThisShift, setEarningsThisShift] = useState<number>(0);
  const [customersServed, setCustomersServed] = useState<number>(0);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>(0);
  const [customerPatience, setCustomerPatience] = useState<number>(30);
  const [lastFeedback, setLastFeedback] = useState<{ text: string; score: number; tip: number } | null>(null);

  const activeShift = SHIFT_DAYS.find((s) => s.dayNumber === selectedDayNum) || SHIFT_DAYS[0];
  const activeOrder: CustomerOrder | undefined = activeShift.ordersPool[currentOrderIndex % activeShift.ordersPool.length];

  // Shift timer tick
  useEffect(() => {
    if (shiftState !== 'SERVING') return;

    const timer = setInterval(() => {
      setShiftSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Shift over!
          clearInterval(timer);
          finishShift();
          return 0;
        }
        return prev - 1;
      });

      // Customer patience tick
      setCustomerPatience((prev) => {
        if (prev <= 1) {
          // Customer stormed off!
          handleCustomerLeavesAngry();
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shiftState, currentOrderIndex]);

  // Start shift
  const startShift = () => {
    sounds.playClick();
    onResetCup();
    setShiftSecondsRemaining(activeShift.timeLimitSeconds);
    setEarningsThisShift(0);
    setCustomersServed(0);
    setCurrentOrderIndex(0);
    setCustomerPatience(activeShift.ordersPool[0]?.patienceTotalSeconds || 28);
    setLastFeedback(null);
    setShiftState('SERVING');
  };

  const handleCustomerLeavesAngry = () => {
    sounds.playBobaDrop(0.5);
    setLastFeedback({
      text: 'Customer waited too long and left unhappy! 💔',
      score: 0,
      tip: 0
    });
    nextCustomer();
  };

  const nextCustomer = () => {
    onResetCup();
    setCurrentOrderIndex((prev) => prev + 1);
    const nextOrder = activeShift.ordersPool[(currentOrderIndex + 1) % activeShift.ordersPool.length];
    setCustomerPatience(nextOrder ? nextOrder.patienceTotalSeconds : 25);
  };

  // Serve active cup to customer and evaluate accuracy
  const handleServeOrder = () => {
    if (!activeOrder) return;

    let score = 100;
    const deductions: string[] = [];

    // 1. Tea match
    if (cupState.tea !== activeOrder.tea) {
      score -= 25;
      deductions.push('Wrong tea base');
    }

    // 2. Milk match
    if (cupState.milk !== activeOrder.milk) {
      score -= 20;
      deductions.push('Incorrect milk');
    }

    // 3. Sweetness match
    const sweetDelta = Math.abs(cupState.sweetness - activeOrder.sweetness);
    if (sweetDelta > 0) {
      score -= Math.min(20, sweetDelta * 0.4);
      deductions.push('Sugar level off');
    }

    // 4. Ice match
    const iceDelta = Math.abs(cupState.iceLevel - activeOrder.iceLevel);
    if (iceDelta > 0) {
      score -= Math.min(15, iceDelta * 0.3);
      deductions.push('Ice level off');
    }

    // 5. Toppings check
    const missingToppings = activeOrder.toppings.filter(
      (t) => (cupState.toppingCounts[t] || 0) <= 0
    );
    if (missingToppings.length > 0) {
      score -= missingToppings.length * 15;
      deductions.push('Missing toppings');
    }

    // 6. Cheese Foam
    if (activeOrder.requiresCheeseFoam && !cupState.hasCheeseFoam) {
      score -= 15;
      deductions.push('Missing cheese foam');
    }

    // 7. Torch
    if (activeOrder.requiresTorch && !cupState.isTorched) {
      score -= 15;
      deductions.push('Not flame torched');
    }

    // 8. Seal and puncture
    if (!cupState.isSealed) {
      score -= 15;
      deductions.push('Unsealed cup');
    }
    if (!cupState.isStrawPunctured) {
      score -= 10;
      deductions.push('No straw punctured');
    }

    score = Math.max(0, Math.round(score));

    // Calculate tip
    const baseTip = Math.round(score * 0.35 * activeOrder.tipMultiplier);
    const finalTip = score >= 50 ? baseTip : 5;

    sounds.playTipChime();
    setEarningsThisShift((prev) => prev + finalTip);
    setCustomersServed((prev) => prev + 1);

    const feedbackMsg =
      score >= 90
        ? '“Absolute perfection! The flavors are sublime!” ★★★★★'
        : score >= 70
        ? '“Delicious! Hits the boba spot perfectly.” ★★★★☆'
        : score >= 50
        ? '“Decent, but slightly off the requested ratios.” ★★★☆☆'
        : `“Disappointing: ${deductions.join(', ')}” ★★☆☆☆`;

    setLastFeedback({
      text: feedbackMsg,
      score,
      tip: finalTip
    });

    nextCustomer();
  };

  const finishShift = () => {
    sounds.playTipChime();
    setShiftState('SUMMARY');

    // Calculate stars (1-3)
    let stars = 1;
    if (earningsThisShift >= activeShift.targetEarnings * 1.3) {
      stars = 3;
    } else if (earningsThisShift >= activeShift.targetEarnings) {
      stars = 2;
    }

    onCompleteDay(selectedDayNum, stars, earningsThisShift);
  };

  // Fast Barista Helper Actions
  const handleQuickAddTea = (tea: TeaType) => {
    sounds.playPourSound();
    onUpdateCup((prev) => ({
      ...prev,
      tea,
      teaVolume: Math.min(100 - prev.milkVolume, prev.teaVolume + 35)
    }));
  };

  const handleQuickAddMilk = (milk: MilkType) => {
    sounds.playPourSound();
    onUpdateCup((prev) => ({
      ...prev,
      milk,
      milkVolume: Math.min(100 - prev.teaVolume, prev.milkVolume + 35)
    }));
  };

  const handleQuickTopping = (topping: ToppingType) => {
    sounds.playBobaDrop();
    onUpdateCup((prev) => ({
      ...prev,
      toppings: prev.toppings.includes(topping) ? prev.toppings : [...prev.toppings, topping],
      toppingCounts: {
        ...prev.toppingCounts,
        [topping]: (prev.toppingCounts[topping] || 0) + 4
      }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* 12-Day Progressive Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {SHIFT_DAYS.map((day) => {
          const isUnlocked = day.dayNumber <= highestDayUnlocked;
          const isCurrent = day.dayNumber === selectedDayNum;
          const dayStars = starsEarned[day.dayNumber] || 0;

          return (
            <button
              key={day.dayNumber}
              disabled={!isUnlocked}
              onClick={() => {
                sounds.playClick();
                setSelectedDayNum(day.dayNumber);
                setShiftState('BRIEFING');
              }}
              className={`px-3 py-2 rounded-xl text-left border shrink-0 transition-all ${
                isCurrent
                  ? 'border-[#f59e0b] bg-[#27201a] text-[#fbbf24]'
                  : isUnlocked
                  ? 'border-[#2d251f] bg-[#1a1715] text-[#d6cec3] hover:border-[#42362c]'
                  : 'border-[#201d1b] bg-[#141211] text-[#615951] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#a89f91]">
                Day {day.dayNumber}
              </div>
              <div className="text-xs font-bold truncate max-w-[110px] text-[#f5ebd9]">
                {day.title.replace(`Day ${day.dayNumber}: `, '')}
              </div>
              <div className="text-[11px] mt-0.5 font-mono">
                {isUnlocked ? (
                  <span className="text-[#fbbf24]">
                    {'★'.repeat(dayStars)}
                    {'☆'.repeat(3 - dayStars)}
                  </span>
                ) : (
                  <span>🔒 Locked</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: SHIFT BRIEFING */}
      {shiftState === 'BRIEFING' && (
        <div className="max-w-2xl mx-auto bg-[#1a1715] border border-[#2d251f] rounded-2xl p-8 space-y-6 text-center shadow-xl">
          <div className="inline-flex p-3 rounded-full bg-[#27201a] border border-[#d97706]/30 text-[#f59e0b]">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono uppercase text-[#fbbf24] tracking-widest">
              Shift Dispatch · Day {activeShift.dayNumber}/12
            </span>
            <h2 className="text-2xl font-bold text-[#f5ebd9] mt-1 font-display">
              {activeShift.title}
            </h2>
            <p className="text-sm text-[#a89f91] max-w-lg mx-auto mt-2 leading-relaxed">
              {activeShift.storyDialogue}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
            <div className="bg-[#141211] border border-[#26201b] rounded-xl p-3">
              <span className="text-[11px] text-[#8c7e70] block uppercase tracking-wider">
                Shift Duration
              </span>
              <span className="text-lg font-bold text-[#f4efe8] font-mono">
                {activeShift.timeLimitSeconds}s
              </span>
            </div>
            <div className="bg-[#141211] border border-[#26201b] rounded-xl p-3">
              <span className="text-[11px] text-[#8c7e70] block uppercase tracking-wider">
                Target Tips Goal
              </span>
              <span className="text-lg font-bold text-[#fbbf24] font-mono">
                {activeShift.targetEarnings} pts
              </span>
            </div>
          </div>

          <button
            onClick={startShift}
            className="w-full max-w-sm mx-auto py-3.5 px-6 rounded-xl font-bold text-sm bg-[#f59e0b] hover:bg-[#d97706] text-[#121110] transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Clock In & Open Counter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 2: ACTIVE SHIFT SERVING */}
      {shiftState === 'SERVING' && activeOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Active Order Ticket (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Shift HUD Header */}
            <div className="bg-[#181513] border border-[#2d251f] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#fbbf24]" />
                <span className="text-xs text-[#a89f91]">Time Left:</span>
                <span className={`text-base font-bold font-mono tabular-nums ${shiftSecondsRemaining <= 10 ? 'text-rose-400 animate-pulse' : 'text-[#f5ebd9]'}`}>
                  {shiftSecondsRemaining}s
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-[#fbbf24]">
                <span>Tips:</span>
                <span>{earningsThisShift}</span>
                <span className="text-xs text-[#8c7e70]">/ {activeShift.targetEarnings}</span>
              </div>
            </div>

            {/* Customer Order Ticket Card */}
            <div className="bg-[#1c1815] border-2 border-[#d97706]/40 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#2d251f] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeOrder.customerAvatar}</span>
                  <div>
                    <h3 className="text-sm font-bold text-[#f5ebd9]">{activeOrder.customerName}</h3>
                    <span className="text-[11px] text-[#a89f91]">{activeOrder.customerRole}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#2b221a] text-[#fbbf24]">
                  Order #{customersServed + 1}
                </span>
              </div>

              {/* Patience Meter */}
              <div>
                <div className="flex justify-between text-[11px] text-[#8c7e70] mb-1">
                  <span>Customer Patience</span>
                  <span className="font-mono">{customerPatience}s</span>
                </div>
                <div className="h-1.5 w-full bg-[#241e19] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      customerPatience <= 8 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${(customerPatience / activeOrder.patienceTotalSeconds) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Customer Dialogue */}
              <div className="p-3 rounded-xl bg-[#141211] border border-[#2a221b] text-xs text-[#f5ebd9] italic leading-relaxed">
                “{activeOrder.dialogue}”
              </div>

              {/* Exact Specs Checklist */}
              <div className="space-y-1.5 text-xs">
                <div className="text-[11px] font-semibold uppercase text-[#d4af37] tracking-wider mb-1">
                  Order Blueprint
                </div>
                <div className="flex justify-between py-1 border-b border-[#26201b]">
                  <span className="text-[#a89f91]">Tea Base:</span>
                  <span className="font-semibold text-[#f5ebd9]">
                    {TEA_CATALOG[activeOrder.tea]?.name}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#26201b]">
                  <span className="text-[#a89f91]">Milk Option:</span>
                  <span className="font-semibold text-[#f5ebd9]">
                    {MILK_CATALOG[activeOrder.milk]?.name}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#26201b]">
                  <span className="text-[#a89f91]">Sugar %:</span>
                  <span className="font-semibold text-[#fbbf24] font-mono">
                    {activeOrder.sweetness}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#26201b]">
                  <span className="text-[#a89f91]">Ice %:</span>
                  <span className="font-semibold text-[#38bdf8] font-mono">
                    {activeOrder.iceLevel}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#26201b]">
                  <span className="text-[#a89f91]">Toppings:</span>
                  <span className="font-semibold text-[#f5ebd9] text-right">
                    {activeOrder.toppings
                      .map((t) => TOPPING_CATALOG[t]?.name.replace(/ \(.*\)/, ''))
                      .join(' + ') || 'None'}
                  </span>
                </div>
                {activeOrder.requiresCheeseFoam && (
                  <div className="flex justify-between py-1 text-amber-300 font-semibold">
                    <span>Foam:</span>
                    <span>Salted Cheese Cap Required</span>
                  </div>
                )}
                {activeOrder.requiresTorch && (
                  <div className="flex justify-between py-1 text-rose-400 font-semibold">
                    <span>Finish:</span>
                    <span>Flame Torched Brûlée</span>
                  </div>
                )}
              </div>

              {/* Feedback toast if served recently */}
              {lastFeedback && (
                <div className="p-2.5 rounded-xl bg-[#241e19] border border-[#d97706]/40 text-xs text-[#fbbf24]">
                  <div className="font-bold flex items-center justify-between">
                    <span>Review: {lastFeedback.score}% Accuracy</span>
                    <span>+{lastFeedback.tip} pts</span>
                  </div>
                  <p className="text-[11px] text-[#d6cec3] mt-0.5">{lastFeedback.text}</p>
                </div>
              )}
            </div>
          </div>

          {/* Center Column: Live Boba Physics Cup (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-full flex flex-col items-center bg-[#171412] border border-[#2d251f] rounded-2xl p-4 shadow-xl">
              <div className="text-xs text-[#8c7e70] font-mono mb-2">
                ACTIVE CUP ASSEMBLY
              </div>

              <BobaPhysicsCanvas
                cupState={cupState}
                isPouring={false}
                onPunctureStraw={() => {
                  sounds.playStrawPop();
                  onUpdateCup((prev) => ({ ...prev, isStrawPunctured: true }));
                }}
              />

              {/* Finish Actions */}
              <div className="w-full space-y-2 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sounds.playSealSound();
                      onUpdateCup((prev) => ({ ...prev, isSealed: true }));
                    }}
                    disabled={cupState.isSealed}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#f59e0b] hover:bg-[#d97706] text-[#121110] transition-colors disabled:opacity-50"
                  >
                    {cupState.isSealed ? '✓ Sealed' : '1. Seal Film'}
                  </button>

                  <button
                    onClick={() => {
                      sounds.playStrawPop();
                      onUpdateCup((prev) => ({ ...prev, isStrawPunctured: true }));
                    }}
                    disabled={!cupState.isSealed || cupState.isStrawPunctured}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-[#091a13] transition-colors disabled:opacity-50"
                  >
                    {cupState.isStrawPunctured ? '✓ Punctured' : '2. Puncture Straw'}
                  </button>
                </div>

                <button
                  onClick={handleServeOrder}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-[#121110] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SERVE TO CUSTOMER</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Speed Barista Dispenser Station (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Teas */}
            <div className="bg-[#191614] border border-[#2d251f] rounded-xl p-3 space-y-2">
              <span className="text-[11px] font-semibold uppercase text-[#d4af37] tracking-wider block">
                1. Pour Tea Base
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(TEA_CATALOG) as TeaType[]).map((teaKey) => {
                  const tea = TEA_CATALOG[teaKey];
                  const isSelected = cupState.tea === teaKey;
                  return (
                    <button
                      key={tea.id}
                      onClick={() => handleQuickAddTea(teaKey)}
                      disabled={cupState.isSealed}
                      className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                        isSelected
                          ? 'border-[#f59e0b] bg-[#27201b] text-[#fbbf24]'
                          : 'border-[#2d251f] bg-[#1d1917] text-[#d6cec3] hover:border-[#42372d]'
                      } disabled:opacity-50`}
                    >
                      <span className="font-semibold block truncate">{tea.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Milks */}
            <div className="bg-[#191614] border border-[#2d251f] rounded-xl p-3 space-y-2">
              <span className="text-[11px] font-semibold uppercase text-[#d4af37] tracking-wider block">
                2. Pour Milk
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(MILK_CATALOG) as MilkType[]).map((milkKey) => {
                  const milk = MILK_CATALOG[milkKey];
                  const isSelected = cupState.milk === milkKey;
                  return (
                    <button
                      key={milk.id}
                      onClick={() => handleQuickAddMilk(milkKey)}
                      disabled={cupState.isSealed}
                      className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                        isSelected
                          ? 'border-[#f59e0b] bg-[#27201b] text-[#fbbf24]'
                          : 'border-[#2d251f] bg-[#1d1917] text-[#d6cec3] hover:border-[#42372d]'
                      } disabled:opacity-50`}
                    >
                      <span className="font-semibold block truncate">{milk.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Sweetness & Ice */}
            <div className="bg-[#191614] border border-[#2d251f] rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold uppercase text-[#d4af37] tracking-wider">
                  3. Sugar ({cupState.sweetness}%) & Ice ({cupState.iceLevel}%)
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {([0, 30, 50, 70, 100] as SweetnessLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => onUpdateCup((p) => ({ ...p, sweetness: lvl }))}
                    disabled={cupState.isSealed}
                    className={`py-1 text-xs font-mono rounded ${
                      cupState.sweetness === lvl
                        ? 'bg-[#f59e0b] text-[#121110] font-bold'
                        : 'bg-[#241e19] text-[#a89f91]'
                    }`}
                  >
                    {lvl}%S
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {([0, 30, 70, 100] as IceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      sounds.playIceClink();
                      const countMap: Record<IceLevel, number> = { 0: 0, 30: 3, 70: 6, 100: 9 };
                      onUpdateCup((p) => ({ ...p, iceLevel: lvl, iceCubesCount: countMap[lvl] }));
                    }}
                    disabled={cupState.isSealed}
                    className={`py-1 text-xs font-mono rounded ${
                      cupState.iceLevel === lvl
                        ? 'bg-[#38bdf8] text-[#0c2331] font-bold'
                        : 'bg-[#241e19] text-[#a89f91]'
                    }`}
                  >
                    {lvl}%I
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Toppings */}
            <div className="bg-[#191614] border border-[#2d251f] rounded-xl p-3 space-y-2">
              <span className="text-[11px] font-semibold uppercase text-[#d4af37] tracking-wider block">
                4. Toppings & Finishing
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(TOPPING_CATALOG) as ToppingType[])
                  .filter((t) => t !== 'cheese_foam')
                  .map((tKey) => {
                    const top = TOPPING_CATALOG[tKey];
                    const count = cupState.toppingCounts[tKey] || 0;
                    return (
                      <button
                        key={top.id}
                        onClick={() => handleQuickTopping(tKey)}
                        disabled={cupState.isSealed}
                        className="p-1.5 rounded-lg text-left text-xs bg-[#1e1a17] border border-[#2d251f] hover:border-[#42372d] text-[#d6cec3] flex items-center justify-between"
                      >
                        <span className="truncate">{top.name.replace(/ \(.*\)/, '')}</span>
                        <span className="text-[10px] font-mono text-[#fbbf24]">+{count}</span>
                      </button>
                    );
                  })}
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => onUpdateCup((p) => ({ ...p, hasCheeseFoam: !p.hasCheeseFoam }))}
                  disabled={cupState.isSealed}
                  className={`py-1.5 text-xs font-semibold rounded-lg border ${
                    cupState.hasCheeseFoam
                      ? 'bg-[#fef3c7] text-[#78350f] border-[#fde68a]'
                      : 'bg-[#241e19] text-[#d6cec3] border-[#382f27]'
                  }`}
                >
                  ☁️ Salted Foam
                </button>
                <button
                  onClick={() => {
                    sounds.playTorchFlame();
                    onUpdateCup((p) => ({ ...p, isTorched: true }));
                  }}
                  disabled={!cupState.hasCheeseFoam || cupState.isTorched || cupState.isSealed}
                  className={`py-1.5 text-xs font-semibold rounded-lg border ${
                    cupState.isTorched
                      ? 'bg-[#451a03] text-[#fde047] border-[#78350f]'
                      : 'bg-[#241e19] text-rose-300 border-[#382f27]'
                  } disabled:opacity-40`}
                >
                  🔥 Torch Brûlée
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SHIFT SUMMARY MODAL */}
      {shiftState === 'SUMMARY' && (
        <div className="max-w-md mx-auto bg-[#1a1715] border border-[#382e26] rounded-2xl p-6 text-center space-y-5 shadow-2xl">
          <div className="inline-flex p-3 rounded-full bg-[#27201a] border border-[#d97706]/40 text-[#f59e0b]">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono uppercase text-[#fbbf24] tracking-widest">
              Shift Complete · Day {activeShift.dayNumber}/12
            </span>
            <h3 className="text-xl font-bold text-[#f5ebd9] mt-1 font-display">
              {earningsThisShift >= activeShift.targetEarnings
                ? 'Target Achieved!'
                : 'Shift Closed'}
            </h3>
            <p className="text-xs text-[#a89f91] mt-1">
              You served {customersServed} customers during the rush.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141211] border border-[#27201a] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#a89f91]">Total Tips Earned:</span>
              <span className="font-bold text-[#fbbf24] font-mono">{earningsThisShift} pts</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#a89f91]">Target Goal:</span>
              <span className="font-medium text-[#d6cec3] font-mono">{activeShift.targetEarnings} pts</span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-[#26201b]">
              <span className="text-[#a89f91]">Shift Rating:</span>
              <span className="text-base text-[#fbbf24]">
                {'★'.repeat(starsEarned[activeShift.dayNumber] || 1)}
                {'☆'.repeat(3 - (starsEarned[activeShift.dayNumber] || 1))}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startShift}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#241e19] hover:bg-[#332a23] text-[#d6cec3] border border-[#382f27]"
            >
              Replay Day
            </button>

            {selectedDayNum < 12 && highestDayUnlocked > selectedDayNum && (
              <button
                onClick={() => {
                  setSelectedDayNum((prev) => prev + 1);
                  setShiftState('BRIEFING');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#f59e0b] hover:bg-[#d97706] text-[#121110]"
              >
                Next Day (Day {selectedDayNum + 1}) →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
