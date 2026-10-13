import React, { useState } from 'react';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import { X, Smartphone, Printer, Sparkles, Coffee } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface CustomerMobileQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerMobileQRModal: React.FC<CustomerMobileQRModalProps> = ({
  isOpen,
  onClose
}) => {
  const [tableNumber, setTableNumber] = useState('01');
  const [isTakeaway, setIsTakeaway] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://bobaflow12.tw';
  const orderUrl = `${currentOrigin}?mode=mobile_order&table=${isTakeaway ? 'takeaway' : tableNumber}&timestamp=${Date.now()}`;

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1a1715] text-[#f4efe8] rounded-2xl shadow-2xl border border-[#382f27] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2d251f] bg-[#211c18] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#fbbf24]" />
            <h2 className="text-sm font-bold text-[#f5ebd9]">顧客手機掃碼點餐 (Mobile QR Ordering)</h2>
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Table / Order Type selection */}
          <div className="flex items-center justify-between bg-[#141210] p-2.5 rounded-xl border border-[#2b241e]">
            <span className="text-[#a89f91] font-semibold">點餐模式 / 桌號：</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsTakeaway(!isTakeaway);
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  isTakeaway
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                    : 'bg-[#251f1a] text-[#c7bdb0] border-[#382f27]'
                }`}
              >
                {isTakeaway ? '外帶候位點餐' : '內用桌號'}
              </button>

              {!isTakeaway && (
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="px-2 py-1 bg-[#251f1a] text-[#fbbf24] font-mono font-bold rounded-lg border border-[#382f27] focus:outline-none"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '吧台 A', '吧台 B'].map((t) => (
                    <option key={t} value={t}>
                      桌號 {t}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Table Tent Placard Preview */}
          <div className="p-6 rounded-2xl bg-white text-stone-900 shadow-xl border-4 border-[#241e19] flex flex-col items-center justify-center text-center space-y-3 font-sans select-none">
            <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-widest text-amber-700 uppercase">
              <Coffee className="w-4 h-4" />
              <span>BOBAFLOW 12 職人手作</span>
            </div>

            <div className="text-lg font-black tracking-tight text-stone-950">
              手機掃描 · 立即點餐
            </div>
            <div className="text-[11px] text-stone-500">
              免排隊 · 自由客製甜度冰塊與配料
            </div>

            {/* QR Code */}
            <div className="p-2 bg-stone-50 rounded-2xl border border-stone-200 shadow-inner">
              <QRCodeDisplay
                value={orderUrl}
                size={180}
                showDownload={false}
                showCopy={false}
                darkColor="#1c1917"
                lightColor="#f8fafc"
                className="border-none shadow-none p-0"
              />
            </div>

            <div className="font-mono font-black text-xs px-3 py-1 rounded-full bg-stone-900 text-[#fbbf24]">
              {isTakeaway ? '外帶排隊快速碼' : `TABLE ${tableNumber}`}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>列印桌上立牌 / 貼紙 (Print Table Placard)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
