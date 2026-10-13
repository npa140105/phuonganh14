import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryCategory, UnitType } from '../../types/posBom';
import { X, Save, AlertCircle, Phone, Package, DollarSign, ShieldAlert, MapPin, User, Trash2, Sparkles } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface InventoryItemModalProps {
  isOpen: boolean;
  item: InventoryItem | null; // null if creating a new item
  onSave: (item: InventoryItem) => void;
  onDelete?: (itemId: string) => void;
  onClose: () => void;
}

const MATERIAL_TEMPLATES: Array<Partial<InventoryItem> & { label: string }> = [
  {
    label: '四季春青茶茶湯',
    name: '四季春青茶茶湯 (Four Seasons Oolong)',
    category: 'tea',
    unit: 'ml',
    capacity: 10000,
    minStockThreshold: 1500,
    reorderAmount: 5000,
    unitCost: 0.0028,
    supplier: '南投名間茶區農會 (產銷合作)',
    supplierPhone: '+886-49-273-2111',
    supplierContactPerson: '張班長',
    storageLocation: '萃茶吧台 A-06'
  },
  {
    label: '百香果天然原汁',
    name: '特級埔里百香果原汁 (Passionfruit Juice)',
    category: 'sweetener',
    unit: 'ml',
    capacity: 6000,
    minStockThreshold: 1200,
    reorderAmount: 3000,
    unitCost: 0.0055,
    supplier: '埔里大坪頂百香果產銷班',
    supplierPhone: '+886-49-293-8899',
    supplierContactPerson: '李副理',
    storageLocation: '配料冷藏吧 C-03'
  },
  {
    label: '鮮乳坊特選生乳',
    name: '鮮乳坊特選生乳 (Pure Fresh Milk)',
    category: 'milk',
    unit: 'ml',
    capacity: 16000,
    minStockThreshold: 3500,
    reorderAmount: 8000,
    unitCost: 0.0026,
    supplier: '鮮乳坊直送物流部',
    supplierPhone: '+886-2-2908-2980',
    supplierContactPerson: '陳主任',
    storageLocation: 'Walk-in Chiller R-01'
  },
  {
    label: '700ml 晶透胖胖杯',
    name: '700ml 晶透PP胖胖杯 (BPA Free)',
    category: 'packaging',
    unit: 'units',
    capacity: 600,
    minStockThreshold: 80,
    reorderAmount: 300,
    unitCost: 0.15,
    supplier: '宏發環保容器廠 (大宗批發)',
    supplierPhone: '+886-4-768-9900',
    supplierContactPerson: '林廠長',
    storageLocation: '包材倉儲區 P-04'
  }
];

export const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
  isOpen,
  item,
  onSave,
  onDelete,
  onClose
}) => {
  const isEditing = !!item;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('tea');
  const [unit, setUnit] = useState<UnitType>('ml');
  const [currentStock, setCurrentStock] = useState<number>(5000);
  const [capacity, setCapacity] = useState<number>(10000);
  const [minStockThreshold, setMinStockThreshold] = useState<number>(1500);
  const [reorderAmount, setReorderAmount] = useState<number>(5000);
  const [unitCost, setUnitCost] = useState<number>(0.003);
  const [supplier, setSupplier] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierContactPerson, setSupplierContactPerson] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleApplyTemplate = (tmpl: (typeof MATERIAL_TEMPLATES)[0]) => {
    sounds.playClick();
    if (tmpl.name) setName(tmpl.name);
    if (tmpl.category) setCategory(tmpl.category);
    if (tmpl.unit) setUnit(tmpl.unit);
    if (tmpl.capacity) setCapacity(tmpl.capacity);
    if (tmpl.minStockThreshold) setMinStockThreshold(tmpl.minStockThreshold);
    if (tmpl.reorderAmount) setReorderAmount(tmpl.reorderAmount);
    if (tmpl.unitCost) setUnitCost(tmpl.unitCost);
    if (tmpl.supplier) setSupplier(tmpl.supplier);
    if (tmpl.supplierPhone) setSupplierPhone(tmpl.supplierPhone);
    if (tmpl.supplierContactPerson) setSupplierContactPerson(tmpl.supplierContactPerson);
    if (tmpl.storageLocation) setStorageLocation(tmpl.storageLocation);
  };

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || 'tea');
      setUnit(item.unit || 'ml');
      setCurrentStock(item.currentStock || 0);
      setCapacity(item.capacity || 10000);
      setMinStockThreshold(item.minStockThreshold || 1000);
      setReorderAmount(item.reorderAmount || 3000);
      setUnitCost(item.unitCost || 0.001);
      setSupplier(item.supplier || '');
      setSupplierPhone(item.supplierPhone || '');
      setSupplierContactPerson(item.supplierContactPerson || '');
      setStorageLocation(item.storageLocation || '');
    } else {
      // Default creation template
      setName('');
      setCategory('tea');
      setUnit('ml');
      setCurrentStock(3000);
      setCapacity(8000);
      setMinStockThreshold(1200);
      setReorderAmount(4000);
      setUnitCost(0.003);
      setSupplier('');
      setSupplierPhone('');
      setSupplierContactPerson('');
      setStorageLocation('');
    }
    setErrorMsg('');
  }, [item, isOpen]);

  // Adjust default unit when category changes on creation
  const handleCategoryChange = (newCat: InventoryCategory) => {
    setCategory(newCat);
    if (!isEditing) {
      if (newCat === 'tea' || newCat === 'milk' || newCat === 'sweetener') {
        setUnit('ml');
      } else if (newCat === 'topping') {
        setUnit('g');
      } else if (newCat === 'packaging') {
        setUnit('units');
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('請輸入品項名稱 (Item Name is required)');
      return;
    }
    if (unitCost <= 0) {
      setErrorMsg('採購單價費用必須大於 0 (Unit cost must be > 0)');
      return;
    }
    if (minStockThreshold < 0) {
      setErrorMsg('安全存量水位不能為負數 (Safe stock threshold cannot be negative)');
      return;
    }

    const savedItem: InventoryItem = {
      id: item ? item.id : `custom_raw_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      category,
      unit,
      currentStock: Math.max(0, Number(currentStock)),
      capacity: Math.max(Number(currentStock), Number(capacity)),
      minStockThreshold: Math.max(0, Number(minStockThreshold)),
      reorderAmount: Math.max(1, Number(reorderAmount)),
      unitCost: Number(unitCost),
      supplier: supplier.trim() || '自選供應商 (In-house / Local Supplier)',
      supplierPhone: supplierPhone.trim() || undefined,
      supplierContactPerson: supplierContactPerson.trim() || undefined,
      storageLocation: storageLocation.trim() || undefined,
      isCustom: true,
      lastRestocked: item?.lastRestocked || new Date().toISOString()
    };

    sounds.playClick();
    onSave(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1a1715] text-[#f4efe8] rounded-2xl shadow-2xl border border-[#382f27] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#2d251f] bg-[#211c18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2a2119] border border-[#d97706]/40 text-[#fbbf24]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f5ebd9]">
                {isEditing ? '編輯原物料品項與採購參數' : '自建全新原物料品項'}
              </h2>
              <p className="text-xs text-[#8c7e70]">
                {isEditing
                  ? `調整「${item.name}」之安全水位、採購單價費用及供應商聯絡資訊`
                  : '設定原料規格、安全庫存水位、叫貨批次、單位進貨成本與供應商電話'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick templates when creating new item */}
          {!isEditing && (
            <div className="p-3.5 rounded-xl bg-[#231d17] border border-[#382f27] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-[#fbbf24] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  快速帶入常見原物料範本 (One-Tap Templates)
                </span>
                <span className="text-[10px] text-[#8c7e70]">點擊立即填妥規格</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MATERIAL_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-2.5 py-1 rounded-lg bg-[#1a1715] hover:bg-[#2c221a] text-[#f4efe8] hover:text-[#fbbf24] border border-[#382f27] text-[11px] transition-colors cursor-pointer"
                  >
                    + {tmpl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Item Basic Info */}
          <div className="space-y-4 bg-[#141210] p-4 rounded-xl border border-[#2b241e]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#fbbf24] flex items-center gap-2">
              <Package className="w-3.5 h-3.5" />
              <span>原物料基本規格 (Material Specifications)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#a89f91]">
                  品項名稱 <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例如：特級紅玉紅茶 (台茶18號) / 鮮乳坊特選生乳 / 700ml 霧面PP杯"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1715] text-[#f4efe8] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#a89f91]">原物料分類類別</label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as InventoryCategory)}
                  className="w-full px-3 py-2 bg-[#1a1715] text-[#f4efe8] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500"
                >
                  <option value="tea">茶湯茶葉類 (Brewed Teas &amp; Leaves)</option>
                  <option value="milk">乳品及植物奶 (Dairy &amp; Plant Milks)</option>
                  <option value="sweetener">糖品與糖漿類 (Syrups &amp; Sweeteners)</option>
                  <option value="topping">手工粉圓配料 (Tapioca &amp; Toppings)</option>
                  <option value="packaging">杯膜吸管包材 (Packaging &amp; Disposables)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#a89f91]">庫存計量單位</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                  className="w-full px-3 py-2 bg-[#1a1715] text-[#f4efe8] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="ml">毫升 (ml) - 液體/茶湯/牛奶/糖漿</option>
                  <option value="g">公克 (g) - 珍珠/茶葉/粉類配料</option>
                  <option value="units">個/入 (units) - 杯子/吸管/封口膜/提袋</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Water Levels & Costing */}
          <div className="space-y-4 bg-[#141210] p-4 rounded-xl border border-[#2b241e]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#fbbf24] flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5" />
              <span>安全存量水位與採購費用 (Water Levels &amp; Unit Costing)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Purchase Unit Cost */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-[#a89f91]">
                    採購單價費用 (Unit Cost) <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[10px] text-[#fbbf24] font-mono">
                    ${unitCost} / {unit}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[#8c7e70]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0.003"
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 bg-[#1a1715] text-[#fbbf24] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
                <div className="text-[10px] text-[#8c7e70]">
                  {unit === 'ml'
                    ? '1000ml (1公升) 成本約 $' + (unitCost * 1000).toFixed(2)
                    : unit === 'g'
                    ? '1000g (1公斤) 成本約 $' + (unitCost * 1000).toFixed(2)
                    : '每個包材成本 $' + unitCost.toFixed(2)}
                </div>
              </div>

              {/* Safe Stock Level (minStockThreshold) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-[#a89f91] flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>安全存量水位 (Safe Stock Alert)</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">
                    低於此值觸發預警
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="1500"
                    value={minStockThreshold}
                    onChange={(e) => setMinStockThreshold(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-[#1a1715] text-[#f4efe8] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[#8c7e70] text-[11px]">
                    {unit}
                  </span>
                </div>
                <div className="text-[10px] text-[#8c7e70]">
                  庫存低於此水位時，系統自動標記「低庫存警告」並提示致電供應商。
                </div>
              </div>

              {/* Current Physical Stock */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#a89f91]">目前在庫實體存量</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-[#1a1715] text-[#fbbf24] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[#8c7e70] text-[11px]">
                    {unit}
                  </span>
                </div>
              </div>

              {/* Reorder Batch & Max Capacity */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#a89f91]">建議採購叫貨量 (Reorder Batch)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={reorderAmount}
                    onChange={(e) => setReorderAmount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-[#1a1715] text-[#f4efe8] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[#8c7e70] text-[11px]">
                    {unit}
                  </span>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#a89f91]">倉儲容納上限 (Max Storage Capacity)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-[#1a1715] text-[#f4efe8] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[#8c7e70] text-[11px]">
                    {unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Supplier Contact & Location */}
          <div className="space-y-4 bg-[#141210] p-4 rounded-xl border border-[#2b241e]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#fbbf24] flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span>供應商聯絡與庫存擺放 (Supplier Information)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#a89f91]">供應商 / 廠商行號</label>
                <input
                  type="text"
                  placeholder="例如：日月潭茶業股份有限公司"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1715] text-[#f4efe8] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#a89f91] flex items-center gap-1 text-emerald-400">
                  <Phone className="w-3 h-3" />
                  <span>供應商電話 / 叫貨專線</span>
                </label>
                <input
                  type="text"
                  placeholder="例如：+886-2-2345-6789 或 0912-345-678"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1715] text-[#fbbf24] rounded-lg border border-[#382f27] focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#a89f91] flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>業務窗口 / 負責窗口</span>
                </label>
                <input
                  type="text"
                  placeholder="例如：林經理 / 陳襄理"
                  value={supplierContactPerson}
                  onChange={(e) => setSupplierContactPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1715] text-[#f4efe8] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#a89f91] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>倉儲擺放位置</span>
                </label>
                <input
                  type="text"
                  placeholder="例如：吧台小冷藏庫 R-01 / 常溫貨架 S-03"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1715] text-[#f4efe8] rounded-lg border border-[#382f27] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2d251f] bg-[#211c18] flex items-center justify-between gap-3">
          <div>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  if (window.confirm(`確定要刪除品項「${item?.name}」嗎？`)) {
                    if (item) onDelete(item.id);
                    onClose();
                  }
                }}
                className="py-2 px-3 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 border border-rose-800/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>刪除此原料品項</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl bg-[#261f1a] hover:bg-[#322a23] text-[#a89f91] text-xs font-semibold transition-colors cursor-pointer"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? '儲存修改' : '建立原物料品項'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
