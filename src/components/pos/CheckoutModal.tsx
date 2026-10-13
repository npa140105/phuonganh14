import React, { useState, useMemo } from 'react';
import { PaymentMethod } from '../../types/posBom';
import { MemberProfile } from '../../types/member';
import {
  Banknote,
  CreditCard,
  QrCode,
  X,
  Check,
  Smartphone,
  Sparkles,
  Phone,
  UserCheck,
  ShieldCheck,
  Clock,
  Gift,
  Plus
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import { INITIAL_MEMBERS } from '../../data/initialMembers';

interface CheckoutModalProps {
  total: number;
  subtotal: number;
  tax: number;
  discountAmount: number;
  members?: MemberProfile[];
  onConfirmPayment: (
    method: PaymentMethod,
    cashTendered?: number,
    change?: number,
    memberData?: {
      memberId: string;
      memberPhone: string;
      memberName: string;
      pointsEarned: number;
      pointsRedeemed: number;
      pointsDiscount: number;
    }
  ) => void;
  onQuickVerifyMember?: (memberId: string) => void;
  onQuickRegisterMember?: (newMember: MemberProfile) => void;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  total,
  subtotal,
  tax,
  discountAmount,
  members = INITIAL_MEMBERS,
  onConfirmPayment,
  onQuickVerifyMember,
  onQuickRegisterMember,
  onClose
}) => {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [qrChannel, setQrChannel] = useState<'line_pay' | 'jko_pay' | 'taiwan_pay' | 'apple_pay'>('line_pay');
  const [isProcessing, setIsProcessing] = useState(false);

  // Member phone lookup state
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [pointsRedeemed, setPointsRedeemed] = useState<number>(0);
  const [pointsDiscount, setPointsDiscount] = useState<number>(0);

  // Quick register inline state
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [quickRegName, setQuickRegName] = useState('');
  const [quickRegEmail, setQuickRegEmail] = useState('');

  // Handle phone lookup
  const handlePhoneChange = (val: string) => {
    setPhoneInput(val);
    const clean = val.trim().replace(/[-\s]/g, '');
    if (clean.length >= 8) {
      const found = members.find((m) => m.phone ? m.phone.replace(/[-\s]/g, '') === clean : false);
      if (found) {
        setSelectedMember(found);
        setPointsRedeemed(0);
        setPointsDiscount(0);
      } else {
        setSelectedMember(null);
      }
    } else {
      setSelectedMember(null);
      setPointsRedeemed(0);
      setPointsDiscount(0);
    }
  };

  const handleSelectMemberDirect = (m: MemberProfile) => {
    sounds.playClick();
    setPhoneInput(m.phone || '');
    setSelectedMember(m);
    setPointsRedeemed(0);
    setPointsDiscount(0);
    setShowQuickRegister(false);
  };

  const handleClearMember = () => {
    sounds.playClick();
    setPhoneInput('');
    setSelectedMember(null);
    setPointsRedeemed(0);
    setPointsDiscount(0);
    setShowQuickRegister(false);
  };

  // Points redemption selection
  const handleToggleRedeemPoints = (pts: number, discountVal: number) => {
    sounds.playClick();
    if (pointsRedeemed === pts) {
      setPointsRedeemed(0);
      setPointsDiscount(0);
    } else {
      setPointsRedeemed(pts);
      setPointsDiscount(discountVal);
    }
  };

  // Calculate final amount due after points discount
  const finalTotal = Math.max(0, Number((total - pointsDiscount).toFixed(2)));
  const pointsEarned = Math.max(1, Math.floor(finalTotal)); // 1 pt per $1 spent

  const [cashTendered, setCashTendered] = useState<number>(Math.ceil(finalTotal / 5) * 5 || 10);
  const changeDue = Math.max(0, cashTendered - finalTotal);

  const quickBills = [
    Math.ceil(finalTotal),
    10,
    20,
    50,
    100
  ].filter((amt, idx, arr) => amt >= finalTotal && arr.indexOf(amt) === idx);

  const dynamicQrPayload = `https://pay.bobaflow12.tw/qr?channel=${qrChannel}&amount=${finalTotal.toFixed(2)}&currency=USD&ref=BF-${Date.now().toString(36).toUpperCase()}&store=BOBAFLOW_TAIPEI_01`;

  // Inline quick create member
  const handleQuickCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.trim().replace(/[-\s]/g, '');
    if (!cleanPhone || !quickRegName.trim()) return;

    sounds.playCashDrawer();

    const newProfile: MemberProfile = {
      id: `mem_${cleanPhone}`,
      displayName: quickRegName.trim(),
      phone: cleanPhone,
      email: quickRegEmail.trim() || `${cleanPhone}@guest.bobaflow.tw`,
      points: 50, // Welcome gift
      tier: '銅牌會員',
      emailVerified: true, // Cashier direct in-person creation is verified immediately
      verifiedBy: '收銀台現場開通',
      barcode: `BFMEM-${cleanPhone}`,
      totalSpent: 0,
      orderCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onQuickRegisterMember) {
      onQuickRegisterMember(newProfile);
    }
    setSelectedMember(newProfile);
    setShowQuickRegister(false);
  };

  const handlePay = () => {
    setIsProcessing(true);

    if (method === 'cash') {
      sounds.playCashDrawer();
    } else {
      sounds.playCardBeep();
    }

    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment(
        method,
        method === 'cash' ? cashTendered : undefined,
        method === 'cash' ? changeDue : undefined,
        selectedMember
          ? {
              memberId: selectedMember.id,
              memberPhone: selectedMember.phone || '',
              memberName: selectedMember.displayName || selectedMember.name || 'VIP 會員',
              pointsEarned,
              pointsRedeemed,
              pointsDiscount
            }
          : undefined
      );
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-[#f4efe8]">
      <div className="relative w-full max-w-lg bg-[#1a1715] rounded-2xl shadow-2xl border border-[#382f27] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#2d251f] bg-[#211c18] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#f5ebd9]">Point of Sale Tender</h2>
            <p className="text-xs text-[#8c7e70]">輸入手機號碼確認會員、集點折抵與完成結帳</p>
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

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Total Amount Due Banner */}
          <div className="p-4 rounded-xl bg-[#231d17] border border-[#382f27] flex items-center justify-between">
            <div>
              <div className="text-xs text-[#a89f91] uppercase tracking-wider font-semibold">
                Amount Due
              </div>
              <div className="text-2xl font-black text-[#fbbf24] font-mono">
                ${finalTotal.toFixed(2)}
              </div>
            </div>
            <div className="text-right text-xs text-[#8c7e70] space-y-0.5 font-mono">
              <div>Subtotal: ${subtotal.toFixed(2)}</div>
              {discountAmount > 0 && (
                <div className="text-emerald-400">Discount: -${discountAmount.toFixed(2)}</div>
              )}
              {pointsDiscount > 0 && (
                <div className="text-amber-400 font-bold">點數折抵: -${pointsDiscount.toFixed(2)}</div>
              )}
              <div>Tax (8.25%): ${tax.toFixed(2)}</div>
            </div>
          </div>

          {/* Member Phone Lookup & Loyalty Section */}
          <div className="p-3.5 rounded-xl bg-[#211b16] border border-[#382d22] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#fbbf24] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>會員電話確認與集點 (Loyalty Lookup)</span>
              </label>

              {selectedMember && (
                <button
                  type="button"
                  onClick={handleClearMember}
                  className="text-[11px] text-[#a89f91] hover:text-white"
                >
                  清除會員
                </button>
              )}
            </div>

            {/* Input field */}
            <div className="relative">
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="輸入顧客手機號碼 (例如 0912345678)..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#171310] border border-[#3b2f24] text-white placeholder-[#786d61] focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
            </div>

            {/* Quick member chips for easy testing */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-[#8c7e70]">快捷選擇：</span>
              {members.slice(0, 3).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMemberDirect(m)}
                  className={`px-2 py-0.5 rounded border font-mono transition-colors cursor-pointer ${
                    selectedMember?.id === m.id
                      ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                      : 'bg-[#2a221b] text-[#cfc5b8] border-[#3d3126] hover:text-white'
                  }`}
                >
                  {m.displayName || m.name || '會員'} ({m.phone ? m.phone.slice(-4) : '****'})
                </button>
              ))}
            </div>

            {/* Display Found Member Card */}
            {selectedMember ? (
              <div className="p-3 rounded-xl bg-[#181310] border border-amber-500/40 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-sm">{selectedMember.displayName || selectedMember.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {selectedMember.tier}
                    </span>
                  </div>

                  <div className="font-mono text-right">
                    <span className="text-[#8c7e70] text-[10px]">目前累積點數：</span>
                    <span className="font-bold text-[#fbbf24] ml-1">{selectedMember.points} pts</span>
                  </div>
                </div>

                {/* Verification Status check & in-person manual approval */}
                <div className="flex items-center justify-between pt-1 border-t border-[#292019] text-[11px]">
                  <div>
                    {selectedMember.emailVerified ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>會員帳號已手動確認開通</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>待管理者手動確認中</span>
                      </span>
                    )}
                  </div>

                  {!selectedMember.emailVerified && onQuickVerifyMember && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playCardBeep();
                        onQuickVerifyMember(selectedMember.id);
                        setSelectedMember((prev) =>
                          prev ? { ...prev, emailVerified: true, verifiedBy: '收銀台現場手動確認' } : null
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>門市現場手動確認開通</span>
                    </button>
                  )}
                </div>

                {/* Points Earned Preview & Redemption Options */}
                <div className="pt-2 border-t border-[#292019] flex flex-wrap items-center justify-between gap-2">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3 h-3" />
                    <span>本單消費完成將累積：+{pointsEarned} pts</span>
                  </div>

                  {selectedMember.points >= 20 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#8c7e70] text-[10px]">點數折抵：</span>
                      <button
                        type="button"
                        onClick={() => handleToggleRedeemPoints(20, 20)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                          pointsRedeemed === 20
                            ? 'bg-amber-500 text-stone-950 border-amber-500'
                            : 'bg-[#28201a] text-amber-300 border-[#3d3126]'
                        }`}
                      >
                        用20點折$20
                      </button>

                      {selectedMember.points >= 50 && (
                        <button
                          type="button"
                          onClick={() => handleToggleRedeemPoints(50, 50)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            pointsRedeemed === 50
                              ? 'bg-amber-500 text-stone-950 border-amber-500'
                              : 'bg-[#28201a] text-amber-300 border-[#3d3126]'
                          }`}
                        >
                          用50點折$50
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : phoneInput.trim().length >= 8 && !showQuickRegister ? (
              <div className="p-3 rounded-xl bg-[#191411] border border-dashed border-[#3d3126] flex items-center justify-between text-xs animate-fade-in">
                <span className="text-[#a89f91]">查無「{phoneInput}」會員資料</span>
                <button
                  type="button"
                  onClick={() => setShowQuickRegister(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>現場快速開卡申請</span>
                </button>
              </div>
            ) : null}

            {/* Quick register form if phone not found */}
            {showQuickRegister && (
              <form onSubmit={handleQuickCreateMember} className="p-3 rounded-xl bg-[#191411] border border-amber-500/40 text-xs space-y-2.5 animate-scale-up">
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>現場快速為顧客開卡（贈 50 點並立即確認）</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#8c7e70] block mb-0.5">顧客姓名 *</label>
                    <input
                      type="text"
                      required
                      value={quickRegName}
                      onChange={(e) => setQuickRegName(e.target.value)}
                      placeholder="例如：張小姐"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#241c16] border border-[#382b20] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8c7e70] block mb-0.5">電子郵件 (選填)</label>
                    <input
                      type="email"
                      value={quickRegEmail}
                      onChange={(e) => setQuickRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#241c16] border border-[#382b20] text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowQuickRegister(false)}
                    className="px-3 py-1 rounded-lg text-[#8c7e70] hover:text-white"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow"
                  >
                    確認開卡
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#a89f91]">
              Payment Tender
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMethod('card');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'card'
                    ? 'border-[#f59e0b] bg-[#2a2119] text-[#fbbf24] shadow-sm ring-1 ring-[#f59e0b]'
                    : 'border-[#332b24] bg-[#1d1916] text-[#a89f91] hover:text-[#f4efe8]'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-semibold">Credit / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMethod('cash');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'cash'
                    ? 'border-[#f59e0b] bg-[#2a2119] text-[#fbbf24] shadow-sm ring-1 ring-[#f59e0b]'
                    : 'border-[#332b24] bg-[#1d1916] text-[#a89f91] hover:text-[#f4efe8]'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs font-semibold">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMethod('qr_pay');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'qr_pay'
                    ? 'border-[#f59e0b] bg-[#2a2119] text-[#fbbf24] shadow-sm ring-1 ring-[#f59e0b]'
                    : 'border-[#332b24] bg-[#1d1916] text-[#a89f91] hover:text-[#f4efe8]'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-semibold">QR / Mobile Pay</span>
              </button>
            </div>
          </div>

          {/* Conditional Method Screens */}
          {method === 'cash' && (
            <div className="p-4 rounded-xl bg-[#1d1916] border border-[#332b24] space-y-3 animate-fade-in text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase text-[#a89f91]">Quick Cash Tender</span>
                <span className="font-mono text-[#fbbf24]">
                  Tendered: ${cashTendered.toFixed(2)}
                </span>
              </div>

              {/* Quick bill buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setCashTendered(finalTotal);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-mono font-bold border transition-colors cursor-pointer ${
                    cashTendered === finalTotal
                      ? 'bg-amber-600 text-stone-950 border-amber-500'
                      : 'bg-[#261f1a] text-[#f4efe8] border-[#382f27]'
                  }`}
                >
                  Exact (${finalTotal.toFixed(2)})
                </button>
                {quickBills.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setCashTendered(amt);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-mono font-bold border transition-colors cursor-pointer ${
                      cashTendered === amt
                        ? 'bg-amber-600 text-stone-950 border-amber-500'
                        : 'bg-[#261f1a] text-[#f4efe8] border-[#382f27]'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Change calculation */}
              <div className="pt-2 border-t border-[#2e2620] flex justify-between items-center">
                <span className="text-[#a89f91]">Change to Give:</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  ${changeDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="p-4 rounded-xl bg-[#1d1916] border border-[#332b24] text-center space-y-2 animate-fade-in text-xs">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#2a221a] border border-[#d97706]/40 flex items-center justify-center text-[#fbbf24]">
                <CreditCard className="w-5 h-5 animate-pulse" />
              </div>
              <div className="font-semibold text-white">
                Ready for Contactless Tap / EMV Chip Insert
              </div>
              <p className="text-[11px] text-[#8c7e70]">
                Supports Visa, Mastercard, AMEX, and Apple Wallet
              </p>
            </div>
          )}

          {method === 'qr_pay' && (
            <div className="p-4 rounded-xl bg-[#1d1916] border border-[#332b24] space-y-3 animate-fade-in text-xs">
              {/* Payment Channel Tabs */}
              <div className="flex items-center justify-center gap-1.5 p-1 bg-[#141210] rounded-xl border border-[#2b241e] text-[11px] font-semibold">
                {[
                  { id: 'line_pay', label: 'LINE Pay' },
                  { id: 'jko_pay', label: '街口支付' },
                  { id: 'taiwan_pay', label: '台灣 Pay' },
                  { id: 'apple_pay', label: 'Apple Pay' }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setQrChannel(ch.id as typeof qrChannel);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      qrChannel === ch.id
                        ? 'bg-amber-500 text-stone-950 font-bold shadow'
                        : 'text-[#8c7e70] hover:text-[#f4efe8]'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>

              {/* Dynamic QR Code Display */}
              <div className="flex flex-col items-center justify-center space-y-2 py-1">
                <QRCodeDisplay
                  value={dynamicQrPayload}
                  size={150}
                  label={`掃碼支付 $${finalTotal.toFixed(2)}`}
                  sublabel={`${qrChannel.toUpperCase()} · 條碼有效時間 300 秒`}
                  darkColor="#121110"
                  lightColor="#ffffff"
                  showDownload={false}
                  showCopy={false}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-[#2d251f] bg-[#211c18] flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl bg-[#261f1a] hover:bg-[#302721] text-[#c7bdb0] text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing || (method === 'cash' && cashTendered < finalTotal)}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <span>Authorizing Tender...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>
                  Confirm Sale {selectedMember ? `(+${pointsEarned}pts)` : ''}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
