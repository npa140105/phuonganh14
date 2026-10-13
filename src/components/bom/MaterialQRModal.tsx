import React, { useState } from 'react';
import { InventoryItem } from '../../types/posBom';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import { X, Printer, Check, MapPin, Phone, ShieldAlert, DollarSign, Sparkles } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface MaterialQRModalProps {
  item: InventoryItem;
  onClose: () => void;
  onQuickRestock?: (amount: number) => void;
}

export const MaterialQRModal: React.FC<MaterialQRModalProps> = ({
  item,
  onClose,
  onQuickRestock
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [restockSuccess, setRestockSuccess] = useState(false);

  // Payload encoded in the QR code
  const qrPayload = JSON.stringify({
    app: 'BobaFlow12',
    type: 'raw_material',
    id: item.id,
    name: item.name,
    category: item.category,
    unit: item.unit,
    safeStock: item.minStockThreshold,
    unitCost: item.unitCost,
    supplier: item.supplier,
    phone: item.supplierPhone,
    loc: item.storageLocation
  });

  const handlePrint = () => {
    sounds.playClick();
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      window.print();
    }, 500);
  };

  const handleSimulateScanRestock = () => {
    sounds.playPourSound();
    if (onQuickRestock) {
      onQuickRestock(item.reorderAmount || 1000);
    }
    setRestockSuccess(true);
    setTimeout(() => setRestockSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1a1715] text-[#f4efe8] rounded-2xl shadow-2xl border border-[#382f27] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2d251f] bg-[#211c18] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#fbbf24]">
              物料料架 QR Code 標籤
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

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Printable Label Card */}
          <div className="p-5 rounded-2xl bg-white text-stone-900 shadow-xl border-2 border-stone-800 space-y-4 font-mono select-none">
            {/* Top brand & SKU */}
            <div className="flex justify-between items-center border-b border-stone-200 pb-2">
              <span className="font-extrabold text-[11px] tracking-wider text-stone-900">
                BOBAFLOW 12 · 智能料架
              </span>
              <span className="text-[10px] bg-stone-900 text-white px-2 py-0.5 rounded font-bold">
                {item.id.toUpperCase()}
              </span>
            </div>

            {/* Material Name & Category */}
            <div>
              <div className="font-black text-base text-stone-900 font-sans leading-tight">
                {item.name}
              </div>
              <div className="text-[10px] text-stone-500 uppercase mt-0.5">
                類別: {item.category} · 單位: {item.unit}
              </div>
            </div>

            {/* QR Code Center Display */}
            <div className="flex justify-center py-1">
              <QRCodeDisplay
                value={qrPayload}
                size={160}
                showDownload={false}
                showCopy={false}
                darkColor="#1c1917"
                lightColor="#ffffff"
                className="border-none shadow-none p-0"
              />
            </div>

            {/* Location & Safe Stock Details */}
            <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-stone-200 pt-2.5">
              <div>
                <span className="text-stone-500">存放位置:</span>
                <div className="font-bold text-stone-900">{item.storageLocation || '吧台庫存區'}</div>
              </div>
              <div>
                <span className="text-stone-500">安全水位:</span>
                <div className="font-bold text-amber-700">
                  {item.minStockThreshold.toLocaleString()} {item.unit}
                </div>
              </div>
              <div>
                <span className="text-stone-500">採購單價:</span>
                <div className="font-bold text-stone-900">${item.unitCost} / {item.unit}</div>
              </div>
              <div>
                <span className="text-stone-500">叫貨專線:</span>
                <div className="font-bold text-stone-900">{item.supplierPhone || item.supplier}</div>
              </div>
            </div>
          </div>

          {/* Scan Simulation Feedback */}
          {restockSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-center font-bold flex items-center justify-center gap-1.5 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>已模擬掃描 QR Code 成功進貨入庫 +{item.reorderAmount}{item.unit}！</span>
            </div>
          )}

          {/* Action options */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSimulateScanRestock}
              className="flex-1 py-2 px-3 rounded-xl bg-[#261f1a] hover:bg-[#322a23] text-[#fbbf24] border border-[#d97706]/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>模擬手機掃碼入庫 (+{item.reorderAmount}{item.unit})</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? '列印中...' : '列印標籤'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
