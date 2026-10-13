import React, { useState } from 'react';
import { POSOrder } from '../../types/posBom';
import { Printer, Check, Copy, X, QrCode } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { QRCodeDisplay } from '../common/QRCodeDisplay';

interface ReceiptModalProps {
  order: POSOrder;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const formattedDate = new Date(order.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const handlePrint = () => {
    sounds.playClick();
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
    }, 1500);
  };

  const handleCopy = () => {
    sounds.playClick();
    const receiptText = `
=== BOBAFLOW 12 ARTISAN TEA ===
Order: ${order.orderNumber}
Date: ${formattedDate}
--------------------------------
${order.items
  .map(
    (item) =>
      `${item.quantity}x ${item.name} (${item.size}) - $${(item.unitPrice * item.quantity).toFixed(2)}\n  [Ice: ${item.iceLevel}% | Sweet: ${item.sweetness}% | ${item.toppings.join(', ')}]`
  )
  .join('\n')}
--------------------------------
Subtotal: $${order.subtotal.toFixed(2)}
Discount: -$${order.discountAmount.toFixed(2)}
Tax (8.25%): $${order.tax.toFixed(2)}
TOTAL: $${order.total.toFixed(2)}
Payment: ${order.paymentMethod.toUpperCase()}
================================
Thank you for supporting artisan boba!
    `.trim();

    navigator.clipboard.writeText(receiptText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#faf8f5] text-[#1c1917] rounded-xl shadow-2xl overflow-hidden border border-[#d6cec3]">
        {/* Receipt Header Banner */}
        <div className="bg-[#1c1917] text-[#f5ebd9] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#fbbf24]">
              Receipt #{order.orderNumber}
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded text-[#a89f91] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Paper Receipt Body */}
        <div className="p-6 font-mono text-xs space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Brand header */}
          <div className="text-center space-y-1 border-b border-dashed border-[#a8a29e] pb-4">
            <div className="font-extrabold text-base tracking-widest text-[#1c1917]">
              BOBAFLOW 12
            </div>
            <div className="text-[10px] text-[#78716c] uppercase tracking-wide">
              Artisan Taiwanese Tea Craft & Bar
            </div>
            <div className="text-[10px] text-[#78716c]">
              Terminal #01 · Cashier Staff
            </div>
            <div className="text-[10px] text-[#78716c] pt-1">{formattedDate}</div>
          </div>

          {/* Ticket ID */}
          <div className="flex justify-between items-center py-1 border-b border-dashed border-[#a8a29e] text-xs font-bold">
            <span>ORDER NUMBER</span>
            <span className="text-sm bg-black text-white px-2 py-0.5 rounded font-black tracking-wider">
              {order.orderNumber}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-3 py-2 border-b border-dashed border-[#a8a29e]">
            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-semibold">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-[#57534e] pl-4">
                  {item.size.toUpperCase()} · Ice {item.iceLevel}% · Sweet {item.sweetness}%
                </div>
                {item.toppings.length > 0 && (
                  <div className="text-[10px] text-[#78716c] pl-4">
                    + {item.toppings.map((t) => t.replace('_', ' ')).join(', ')}
                  </div>
                )}
                {item.requiresTorch && (
                  <div className="text-[10px] text-amber-800 pl-4 font-semibold">
                    + Crème Brûlée Torched Cap
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Subtotal, Tax, Total */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between text-[#57534e]">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.discountType.toUpperCase()})</span>
                <span>-${order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#57534e]">
              <span>Sales Tax (8.25%)</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-2 border-t border-[#1c1917]">
              <span>TOTAL DUE</span>
              <span className="text-base">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="py-2.5 px-3 rounded bg-[#f0eae1] border border-[#d6cec3] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#78716c]">Payment Method:</span>
              <span className="font-bold uppercase">{order.paymentMethod.replace('_', ' ')}</span>
            </div>
            {order.paymentMethod === 'cash' && order.cashTendered && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#78716c]">Cash Tendered:</span>
                  <span>${order.cashTendered.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-800">
                  <span>Change Due:</span>
                  <span>${(order.changeGiven || 0).toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-[10px] text-[#78716c] pt-1 border-t border-[#dfd6c8]">
              <span>BOM COGS Deduction:</span>
              <span>${order.totalCogs.toFixed(2)} ({order.profitMarginPct}% margin)</span>
            </div>

            {order.memberName && (
              <div className="pt-1.5 mt-1 border-t border-dashed border-[#c2b8a7] space-y-0.5 text-[#44403c]">
                <div className="flex justify-between font-bold">
                  <span>會員集點卡 (手機)：</span>
                  <span className="font-mono text-amber-900">{order.memberPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>會員姓名：</span>
                  <span>{order.memberName}</span>
                </div>
                {order.pointsEarned !== undefined && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>本次消費獲得點數：</span>
                    <span className="font-mono">+{order.pointsEarned} pts</span>
                  </div>
                )}
                {order.pointsRedeemed && order.pointsRedeemed > 0 ? (
                  <div className="flex justify-between text-rose-800 font-semibold">
                    <span>本次折抵扣除點數：</span>
                    <span className="font-mono">-{order.pointsRedeemed} pts</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Electronic Invoice Dual QR Codes */}
          <div className="pt-2 pb-1 border-t border-dashed border-[#a8a29e] space-y-1">
            <div className="text-[10px] text-center text-[#78716c] uppercase font-bold tracking-wider">
              電子發票證明聯 / 交易明細 QR CODE
            </div>
            <div className="flex justify-center items-center gap-3">
              <QRCodeDisplay
                value={`**發票字軌:BF-${Math.floor(10000000 + Math.random() * 90000000)}:金額:${order.total}:稅額:${order.tax}:買受人:消費者**`}
                size={85}
                showDownload={false}
                showCopy={false}
                darkColor="#1c1917"
                lightColor="#faf8f5"
                className="p-1 border border-[#d6cec3] shadow-none bg-transparent"
              />
              <QRCodeDisplay
                value={`**明細:${order.items.map((i) => `${i.name}*${i.quantity}`).join(';')}:時戳:${order.timestamp}**`}
                size={85}
                showDownload={false}
                showCopy={false}
                darkColor="#1c1917"
                lightColor="#faf8f5"
                className="p-1 border border-[#d6cec3] shadow-none bg-transparent"
              />
            </div>
          </div>

          {/* Simulated Barcode */}
          <div className="text-center pt-1 space-y-1">
            <div className="tracking-[0.25em] text-[13px] font-mono select-none overflow-hidden text-center opacity-80">
              ||| | |||| | ||| || |||| | ||||| || |
            </div>
            <div className="text-[9px] text-[#78716c]">
              AUTH: {order.id.slice(-8).toUpperCase()} · 感謝您的光臨！
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-[#ede6dc] border-t border-[#d6cec3] flex gap-2">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 py-2 px-3 rounded-lg bg-[#1c1917] hover:bg-[#2e2a27] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isPrinting ? 'Printing Receipt...' : 'Print Thermal Ticket'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="py-2 px-3 rounded-lg bg-white hover:bg-[#f5f1eb] text-[#1c1917] border border-[#d6cec3] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Copy plain text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
