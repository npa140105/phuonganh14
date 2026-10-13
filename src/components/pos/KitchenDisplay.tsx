import React from 'react';
import { POSOrder, OrderStatus } from '../../types/posBom';
import { Clock, CheckCircle2, Flame, AlertCircle, ChefHat, Sparkles } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface KitchenDisplayProps {
  orders: POSOrder[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onClearCompletedOrders: () => void;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
  orders,
  onUpdateOrderStatus,
  onClearCompletedOrders
}) => {
  const activeOrders = orders.filter((o) => o.status !== 'completed');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const formatElapsed = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleAdvanceStatus = (order: POSOrder) => {
    sounds.playClick();
    if (order.status === 'pending') {
      onUpdateOrderStatus(order.id, 'preparing');
    } else if (order.status === 'preparing') {
      sounds.playOrderReady();
      onUpdateOrderStatus(order.id, 'ready');
    } else if (order.status === 'ready') {
      sounds.playTipChime();
      onUpdateOrderStatus(order.id, 'completed');
    }
  };

  return (
    <div className="space-y-6">
      {/* KDS Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1a1715] p-4 rounded-xl border border-[#2d251f]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#2a2119] border border-[#d97706]/30 text-[#f59e0b]">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#f5ebd9] flex items-center gap-2">
              Kitchen Barista Display (KDS)
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#29221b] text-[#fbbf24] border border-[#d97706]/20">
                {activeOrders.length} Active Tickets
              </span>
            </h2>
            <p className="text-xs text-[#a89f91]">
              Live order queue with precise Bill of Materials prep ratios & measurements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#a89f91]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Live Kitchen Sync</span>
          </div>
          {completedOrders.length > 0 && (
            <button
              onClick={() => {
                sounds.playClick();
                onClearCompletedOrders();
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#241e1a] hover:bg-[#2e2621] text-[#a89f91] hover:text-[#f4efe8] border border-[#382f27] transition-colors"
            >
              Clear Completed ({completedOrders.length})
            </button>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      {activeOrders.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-[#2d251f] bg-[#161413]">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#231d18] border border-[#382f27] flex items-center justify-center text-[#d97706]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[#f5ebd9]">Kitchen Queue Is All Caught Up!</h3>
          <p className="text-xs text-[#8c7e70] max-w-md mx-auto mt-1">
            New drink orders rung up at the POS Cashier Terminal will instantly appear here with exact step-by-step preparation measurements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {activeOrders.map((order) => {
            const isPending = order.status === 'pending';
            const isPreparing = order.status === 'preparing';
            const isReady = order.status === 'ready';

            return (
              <div
                key={order.id}
                className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-lg ${
                  isReady
                    ? 'border-emerald-500/60 bg-[#141b16] ring-1 ring-emerald-500/30'
                    : isPreparing
                    ? 'border-amber-500/60 bg-[#1c1713] ring-1 ring-amber-500/30'
                    : 'border-[#382e26] bg-[#171412]'
                }`}
              >
                {/* Ticket Header */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between ${
                    isReady
                      ? 'border-emerald-900/60 bg-emerald-950/40 text-emerald-200'
                      : isPreparing
                      ? 'border-amber-900/60 bg-amber-950/40 text-amber-200'
                      : 'border-[#2d251f] bg-[#201a16] text-[#f4efe8]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base tracking-wider text-[#fbbf24]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isReady
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isPreparing
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-[#2e2620] text-[#a89f91]'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#a89f91] font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatElapsed(order.timestamp)}</span>
                  </div>
                </div>

                {/* Items & BOM Prep steps */}
                <div className="p-4 space-y-4 flex-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={item.cartItemId || idx}
                      className="p-3 rounded-lg bg-[#201a16] border border-[#2d251f] space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm text-[#f5ebd9] flex items-center gap-1.5">
                            <span>{item.quantity}×</span>
                            <span>{item.name}</span>
                            <span className="text-[11px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#2e2620] text-[#fbbf24]">
                              {item.size} (500ml)
                            </span>
                          </div>
                          <div className="text-xs text-[#9c8e80] italic">{item.chineseName}</div>
                        </div>
                      </div>

                      {/* Specifications Badges */}
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-[#2b221a] text-[#fbbf24] border border-[#d97706]/20">
                          🧊 {item.iceLevel}% Ice
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#2b221a] text-[#fbbf24] border border-[#d97706]/20">
                          🍯 {item.sweetness}% Sweet
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#2b221a] text-[#f4efe8] border border-[#382f27]">
                          🥛 {item.milk.replace('_', ' ')}
                        </span>
                        {item.toppings.map((top) => (
                          <span
                            key={top}
                            className="px-2 py-0.5 rounded bg-[#36271c] text-[#f59e0b] border border-[#d97706]/30 font-medium"
                          >
                            + {top.replace('_', ' ')}
                          </span>
                        ))}
                        {item.requiresTorch && (
                          <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 flex items-center gap-1 font-medium">
                            <Flame className="w-3 h-3 text-rose-400" />
                            Torch Crème Brûlée
                          </span>
                        )}
                      </div>

                      {/* Precise Barista BOM Step-by-Step Directions */}
                      <div className="pt-2 border-t border-[#2a221c] text-[11px] font-mono text-[#a89f91] space-y-1">
                        <div className="text-[10px] uppercase font-bold text-[#8c7e70] tracking-wider mb-1">
                          Barista BOM Measures:
                        </div>
                        {item.bomBreakdown.map((b, bIdx) => (
                          <div key={bIdx} className="flex justify-between items-center py-0.5">
                            <span className="text-[#c7bdb0]">
                              • {b.name.replace(/\(.*\)/, '').trim()}
                            </span>
                            <span className="text-[#fbbf24] font-semibold">
                              {b.quantity} {b.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {order.customerNote && (
                    <div className="p-2 rounded bg-[#251f1a] text-xs text-[#d97706] italic border border-[#382d24]">
                      Note: &quot;{order.customerNote}&quot;
                    </div>
                  )}
                </div>

                {/* Status Action Footer */}
                <div className="p-3.5 border-t border-[#2d251f] bg-[#1c1815]">
                  <button
                    onClick={() => handleAdvanceStatus(order)}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isPending
                        ? 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                        : isPreparing
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold'
                        : 'bg-[#2a231d] hover:bg-[#362d25] text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {isPending && (
                      <>
                        <ChefHat className="w-4 h-4" />
                        <span>Start Brewing Ticket</span>
                      </>
                    )}
                    {isPreparing && (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Mark Order Ready for Pickup</span>
                      </>
                    )}
                    {isReady && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Hand Out to Customer (Complete)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
