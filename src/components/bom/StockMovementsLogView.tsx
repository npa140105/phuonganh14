import React, { useState } from 'react';
import { StockMovementLog, MovementType } from '../../types/posBom';
import { History, ArrowDownRight, ArrowUpRight, Search, FileText, ShoppingCart, Truck, ClipboardCheck, AlertTriangle } from 'lucide-react';

interface StockMovementsLogViewProps {
  logs: StockMovementLog[];
}

export const StockMovementsLogView: React.FC<StockMovementsLogViewProps> = ({ logs }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.ingredientName.toLowerCase().includes(q) ||
      (log.referenceId && log.referenceId.toLowerCase().includes(q)) ||
      (log.notes && log.notes.toLowerCase().includes(q))
    );
  });

  const getBadge = (type: MovementType) => {
    switch (type) {
      case 'pos_deduction':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/50 flex items-center gap-1">
            <ShoppingCart className="w-2.5 h-2.5" />
            <span>POS門市核銷</span>
          </span>
        );
      case 'restock':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-700/50 flex items-center gap-1">
            <Truck className="w-2.5 h-2.5" />
            <span>進貨驗收入庫</span>
          </span>
        );
      case 'stocktake_adjustment':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700/50 flex items-center gap-1">
            <ClipboardCheck className="w-2.5 h-2.5" />
            <span>實體盤點校正</span>
          </span>
        );
      case 'waste_loss':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/50 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>過期破損報廢</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#26201b] text-[#a89f91]">
            手動調整
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1a1715] p-4.5 rounded-xl border border-[#2d251f]">
        <div>
          <h2 className="text-sm font-bold text-[#f5ebd9] flex items-center gap-2">
            <History className="w-4 h-4 text-[#fbbf24]" />
            <span>原物料進出異動流水帳 (Stock Movement Audit Trail)</span>
            <span className="text-[10px] font-mono text-[#fbbf24] px-2 py-0.5 rounded-full bg-[#2a221b] border border-[#d97706]/20">
              {logs.length} 筆流水紀錄
            </span>
          </h2>
          <p className="text-xs text-[#8c7e70]">
            精準記錄每一筆門市點單 BOM 自動扣料、供應商進貨、實體盤點校正與損耗報廢軌跡
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8c7e70] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋物料名稱、單號或備註..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#1a1715] text-[#f4efe8] placeholder-[#78716c] rounded-xl border border-[#332b24] focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: '全部流水' },
            { id: 'pos_deduction', label: 'POS核銷' },
            { id: 'restock', label: '進貨入庫' },
            { id: 'stocktake_adjustment', label: '盤點校正' },
            { id: 'waste_loss', label: '報廢損耗' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterType === cat.id
                  ? 'bg-[#2a221b] text-[#fbbf24] border-[#d97706]/40 font-bold'
                  : 'bg-[#181513] text-[#a89f91] border-[#2b241e]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#1a1715] rounded-xl border border-[#2d251f] overflow-hidden shadow-md">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-xs text-[#8c7e70]">
            <FileText className="w-10 h-10 mx-auto text-[#4d4237]" />
            <p>目前尚無符合篩選條件的庫存異動紀錄。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#211c18] border-b border-[#2d251f] text-[#8c7e70] uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">異動時間</th>
                  <th className="py-3 px-3">異動類型</th>
                  <th className="py-3 px-3">原物料品項</th>
                  <th className="py-3 px-3 font-mono text-right">異動數量</th>
                  <th className="py-3 px-3 font-mono text-right">異動後在庫</th>
                  <th className="py-3 px-4">單號 / 關聯備註</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26201a]">
                {filteredLogs.map((log) => {
                  const isNegative = log.deltaQuantity < 0;

                  return (
                    <tr key={log.id} className="hover:bg-[#201a16] transition-colors">
                      <td className="py-2.5 px-4 text-[#8c7e70] font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false
                        })}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getBadge(log.type)}
                      </td>

                      <td className="py-2.5 px-3 font-semibold text-[#f5ebd9]">
                        {log.ingredientName}
                      </td>

                      <td className={`py-2.5 px-3 font-mono font-bold text-right whitespace-nowrap ${
                        isNegative ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        <span className="inline-flex items-center gap-0.5">
                          {isNegative ? (
                            <ArrowDownRight className="w-3 h-3 text-amber-400" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>
                            {log.deltaQuantity > 0 ? `+${log.deltaQuantity.toLocaleString()}` : log.deltaQuantity.toLocaleString()} {log.unit}
                          </span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-right text-[#f4efe8] font-medium whitespace-nowrap">
                        {log.balanceAfter.toLocaleString()} {log.unit}
                      </td>

                      <td className="py-2.5 px-4 text-[#a89f91] text-[11px] max-w-xs truncate">
                        {log.referenceId && (
                          <span className="font-mono text-[#fbbf24] font-semibold mr-1.5">
                            {log.referenceId}
                          </span>
                        )}
                        <span>{log.notes || '-'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
