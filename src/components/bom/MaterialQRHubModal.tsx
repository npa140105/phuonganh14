import React, { useState } from 'react';
import { InventoryItem, InventoryCategory } from '../../types/posBom';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import {
  X,
  Printer,
  QrCode,
  Scan,
  Check,
  Search,
  Phone,
  MapPin,
  ShieldAlert,
  DollarSign,
  Package,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface MaterialQRHubModalProps {
  isOpen: boolean;
  inventory: Record<string, InventoryItem>;
  onClose: () => void;
  onRestockItem: (ingredientId: string, amount: number) => void;
}

export const MaterialQRHubModal: React.FC<MaterialQRHubModalProps> = ({
  isOpen,
  inventory,
  onClose,
  onRestockItem
}) => {
  const [activeTab, setActiveTab] = useState<'labels' | 'scanner'>('labels');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scanner simulator state
  const [selectedScannedId, setSelectedScannedId] = useState<string>('tea_assam');
  const [scanQty, setScanQty] = useState<number>(1000);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const inventoryList = Object.values(inventory);

  const filteredItems = inventoryList.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.supplier && item.supplier.toLowerCase().includes(q)) ||
      (item.supplierPhone && item.supplierPhone.includes(q)) ||
      (item.storageLocation && item.storageLocation.toLowerCase().includes(q))
    );
  });

  const handlePrintAll = () => {
    sounds.playClick();
    window.print();
  };

  const currentScannedItem = inventory[selectedScannedId] || inventoryList[0];

  const handleExecuteScanRestock = () => {
    if (!currentScannedItem) return;
    setIsScanning(true);
    sounds.playCardBeep();

    setTimeout(() => {
      setIsScanning(false);
      sounds.playPourSound();
      onRestockItem(currentScannedItem.id, scanQty);
      setScanSuccessMessage(
        `✓ 掃描成功！已完成 ${currentScannedItem.name} 入庫核銷 +${scanQty} ${currentScannedItem.unit}，目前最新在庫: ${(currentScannedItem.currentStock + scanQty).toLocaleString()} ${currentScannedItem.unit}`
      );
      setTimeout(() => setScanSuccessMessage(null), 4000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#1a1715] text-[#f4efe8] rounded-2xl shadow-2xl border border-[#382f27] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2d251f] bg-[#211c18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#fbbf24]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#f5ebd9] flex items-center gap-2">
                <span>原物料料架 QR Code 標籤與掃碼核銷中心</span>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-[#2a221b] text-[#fbbf24] border border-[#d97706]/30">
                  Smart Shelf & Barcode
                </span>
              </h2>
              <p className="text-xs text-[#8c7e70]">
                提供門市料架 QR 標籤批量預覽列印、手機掃描即時進貨驗收核銷與庫存安全水位預警
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-lg text-[#a89f91] hover:text-white hover:bg-[#2d251f] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="px-5 pt-3 pb-2 border-b border-[#2d251f] bg-[#171412] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('labels');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'labels'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'text-[#a89f91] hover:text-[#f4efe8]'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>料架 QR 標籤批次列印 ({filteredItems.length} 個標籤)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('scanner');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'text-[#a89f91] hover:text-[#f4efe8]'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>手機 / 掃描槍進貨即時核銷</span>
            </button>
          </div>

          {activeTab === 'labels' && (
            <button
              type="button"
              onClick={handlePrintAll}
              className="px-3.5 py-1.5 rounded-lg bg-[#28211b] hover:bg-[#342b22] text-[#fbbf24] border border-[#d97706]/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印目前標籤頁面 (Print Shelf Labels)</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'labels' ? (
            <div className="space-y-4">
              {/* Category & Search Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#151210] p-3 rounded-xl border border-[#2b241e]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#8c7e70] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="篩選料號、原物料名稱、供應商..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#1f1a17] text-[#f4efe8] placeholder-[#78716c] text-xs rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
                  {[
                    { id: 'all', label: '全部' },
                    { id: 'tea', label: '茶湯茶葉' },
                    { id: 'milk', label: '乳品植物奶' },
                    { id: 'sweetener', label: '糖漿' },
                    { id: 'topping', label: '手工配料' },
                    { id: 'packaging', label: '杯袋包材' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        sounds.playClick();
                        setCategoryFilter(cat.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                        categoryFilter === cat.id
                          ? 'bg-[#2a2119] text-[#fbbf24] border-[#d97706]/40'
                          : 'bg-[#1a1715] text-[#8c7e70] border-[#2d251f] hover:text-[#f4efe8]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Labels Grid for Shelves */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
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

                  const isLow = item.currentStock <= item.minStockThreshold;

                  return (
                    <div
                      key={item.id}
                      className="bg-white text-stone-900 rounded-xl p-4 shadow-md border-2 border-stone-800 flex flex-col justify-between space-y-3 font-sans"
                    >
                      {/* Brand Header */}
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <div className="flex items-center gap-1 text-[11px] font-extrabold tracking-wider text-stone-900">
                          <span>BOBAFLOW 12 · 智能料架</span>
                        </div>
                        <span className="font-mono text-[10px] font-bold bg-stone-900 text-[#fbbf24] px-1.5 py-0.5 rounded">
                          {item.id}
                        </span>
                      </div>

                      {/* Item Name & Category */}
                      <div>
                        <div className="font-black text-sm text-stone-950 leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          類別: {item.category} · 計量單位: {item.unit}
                        </div>
                      </div>

                      {/* QR Code Center */}
                      <div className="flex justify-center py-0.5">
                        <QRCodeDisplay
                          value={qrPayload}
                          size={130}
                          showDownload={false}
                          showCopy={false}
                          darkColor="#1c1917"
                          lightColor="#ffffff"
                          className="border-none shadow-none p-0"
                        />
                      </div>

                      {/* Shelf Spec Details */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] border-t border-stone-200 pt-2 font-mono">
                        <div>
                          <span className="text-stone-500">存放位置:</span>
                          <div className="font-bold text-stone-900 truncate">
                            {item.storageLocation || '吧台物料區'}
                          </div>
                        </div>

                        <div>
                          <span className="text-stone-500">安全水位:</span>
                          <div className="font-bold text-amber-700">
                            {item.minStockThreshold.toLocaleString()} {item.unit}
                          </div>
                        </div>

                        <div>
                          <span className="text-stone-500">採購單價:</span>
                          <div className="font-bold text-stone-900">
                            ${item.unitCost} / {item.unit}
                          </div>
                        </div>

                        <div>
                          <span className="text-stone-500">供應商電話:</span>
                          <div className="font-bold text-stone-900 truncate">
                            {item.supplierPhone || item.supplier}
                          </div>
                        </div>
                      </div>

                      {/* Quick Restock Scan Simulation trigger */}
                      <div className="pt-1 flex items-center justify-between gap-1 border-t border-stone-100">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isLow
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          目前庫存: {item.currentStock.toLocaleString()} {item.unit}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setSelectedScannedId(item.id);
                            setScanQty(item.reorderAmount || 1000);
                            setActiveTab('scanner');
                          }}
                          className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Scan className="w-3 h-3 text-stone-600" />
                          <span>前往掃碼</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Scanner Subtab */
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Camera / Laser Viewfinder Simulation */}
              <div className="relative rounded-2xl bg-[#0d0c0b] border-2 border-[#382f27] p-6 overflow-hidden flex flex-col items-center justify-center text-center space-y-4">
                {/* Scanning laser line */}
                <div className="absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-pulse" />

                <div className="relative z-10 w-44 h-44 rounded-2xl border-2 border-dashed border-[#fbbf24]/60 flex items-center justify-center p-3 bg-[#171412]/80 backdrop-blur-xs">
                  {currentScannedItem && (
                    <QRCodeDisplay
                      value={JSON.stringify({
                        app: 'BobaFlow12',
                        id: currentScannedItem.id,
                        name: currentScannedItem.name,
                        unit: currentScannedItem.unit,
                        min: currentScannedItem.minStockThreshold,
                        cost: currentScannedItem.unitCost,
                        supplier: currentScannedItem.supplier,
                        phone: currentScannedItem.supplierPhone
                      })}
                      size={130}
                      showDownload={false}
                      showCopy={false}
                      darkColor="#fbbf24"
                      lightColor="#171412"
                      className="border-none shadow-none bg-transparent p-0"
                    />
                  )}
                </div>

                <div className="space-y-1 relative z-10">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#fbbf24] flex items-center justify-center gap-1.5">
                    <Scan className="w-4 h-4 animate-spin text-[#fbbf24]" />
                    <span>即時光學條碼掃描鏡頭對焦中</span>
                  </div>
                  <p className="text-[11px] text-[#8c7e70]">
                    對準料架上的 QR Code 標籤，即可瞬間解析品項、安全存量水位與供應商採購單價
                  </p>
                </div>
              </div>

              {/* Target Material Selector for testing */}
              <div className="bg-[#1a1715] p-4 rounded-xl border border-[#2d251f] space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#f5ebd9]">
                    模擬掃碼選取原物料 (Simulate Scanned Item)：
                  </label>
                  <span className="text-[10px] text-[#8c7e70]">可切換測試各項物料標籤</span>
                </div>

                <select
                  value={selectedScannedId}
                  onChange={(e) => {
                    sounds.playClick();
                    setSelectedScannedId(e.target.value);
                    const itm = inventory[e.target.value];
                    if (itm) {
                      setScanQty(itm.reorderAmount || 1000);
                    }
                  }}
                  className="w-full py-2 px-3 bg-[#241e19] text-[#fbbf24] font-bold text-xs rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500"
                >
                  {inventoryList.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.category.toUpperCase()}] {item.name} · 在庫: {item.currentStock}{item.unit} · 安全水位: {item.minStockThreshold}{item.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scanned Material Detail & Action Card */}
              {currentScannedItem && (
                <div className="bg-[#1e1915] p-5 rounded-2xl border border-[#3a3026] space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] text-[#fbbf24] font-mono uppercase font-bold tracking-wider">
                        料號: {currentScannedItem.id}
                      </div>
                      <h3 className="text-lg font-black text-[#f5ebd9] mt-0.5">
                        {currentScannedItem.name}
                      </h3>
                      <div className="text-xs text-[#8c7e70] flex items-center gap-2 mt-1">
                        <span>供應商: {currentScannedItem.supplier}</span>
                        {currentScannedItem.storageLocation && (
                          <span className="flex items-center gap-1 text-[#a89f91]">
                            <MapPin className="w-3 h-3 text-[#fbbf24]" />
                            {currentScannedItem.storageLocation}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs text-[#8c7e70]">採購單價</span>
                      <div className="text-base font-bold text-amber-400">
                        ${currentScannedItem.unitCost} / {currentScannedItem.unit}
                      </div>
                    </div>
                  </div>

                  {/* Stock Level vs Safe Stock Gauge */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#141210] border border-[#2b241e] text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-[#8c7e70]">實體在庫現量</div>
                      <div className="text-base font-bold text-[#f5ebd9]">
                        {currentScannedItem.currentStock.toLocaleString()} {currentScannedItem.unit}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#8c7e70]">安全存量水位</div>
                      <div
                        className={`text-base font-bold ${
                          currentScannedItem.currentStock <= currentScannedItem.minStockThreshold
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {currentScannedItem.minStockThreshold.toLocaleString()} {currentScannedItem.unit}
                      </div>
                    </div>
                  </div>

                  {/* Stock Alert Warning if Low */}
                  {currentScannedItem.currentStock <= currentScannedItem.minStockThreshold && (
                    <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-700/60 text-amber-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>警告: 目前實體存量已低於安全水位，請立即進貨！</span>
                      </div>
                      {currentScannedItem.supplierPhone && (
                        <a
                          href={`tel:${currentScannedItem.supplierPhone}`}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold text-[11px] flex items-center gap-1 hover:bg-amber-400 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>撥打 {currentScannedItem.supplierPhone}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Restock Input & Confirm Button */}
                  <div className="pt-2 border-t border-[#2e2620] space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs font-semibold text-[#c7bdb0]">
                        本次掃碼進貨入庫數量 ({currentScannedItem.unit})：
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="50000"
                          value={scanQty}
                          onChange={(e) => setScanQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-28 py-1.5 px-3 bg-[#151210] text-[#fbbf24] font-mono font-bold text-sm rounded-lg border border-[#382f27] text-right focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-xs font-mono text-[#8c7e70]">
                          {currentScannedItem.unit}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={handleExecuteScanRestock}
                      className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {isScanning
                          ? '正在驗證 QR Code 核銷中...'
                          : `確認掃碼進貨入庫 (+${scanQty} ${currentScannedItem.unit})`}
                      </span>
                    </button>

                    {scanSuccessMessage && (
                      <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold text-center animate-fade-in">
                        {scanSuccessMessage}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
