import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  sublabel?: string;
  showDownload?: boolean;
  showCopy?: boolean;
  darkColor?: string;
  lightColor?: string;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 180,
  label,
  sublabel,
  showDownload = true,
  showCopy = true,
  darkColor = '#121110',
  lightColor = '#ffffff',
  className = ''
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1.5,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });
  }, [value, size, darkColor, lightColor]);

  const handleDownload = () => {
    sounds.playClick();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl bg-white text-stone-900 shadow-md border border-stone-200 ${className}`}>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={label || 'QR Code'}
          style={{ width: size, height: size }}
          className="rounded-lg select-none"
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center bg-stone-100 rounded-lg text-stone-400"
        >
          <QrIcon className="w-8 h-8 animate-pulse" />
        </div>
      )}

      {(label || sublabel) && (
        <div className="text-center mt-2 space-y-0.5">
          {label && <div className="font-bold text-xs text-stone-900 tracking-tight">{label}</div>}
          {sublabel && <div className="text-[10px] text-stone-500 font-mono">{sublabel}</div>}
        </div>
      )}

      {(showDownload || showCopy) && (
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-stone-100 w-full justify-center">
          {showDownload && (
            <button
              type="button"
              onClick={handleDownload}
              className="py-1 px-2.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="下載 QR Code 圖片 (PNG)"
            >
              <Download className="w-3 h-3" />
              <span>下載</span>
            </button>
          )}

          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className="py-1 px-2.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="複製 QR Code 原始內容"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? '已複製' : '複製'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
