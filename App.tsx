import React, { useMemo, useState } from "react";
import { TING_TO_M2, PRODUCTS } from './constants';
import { formatCurrency } from './utils';
import type { Product } from './types';

export default function App() {
  const [productId, setProductId] = useState<string>(PRODUCTS[0].id);
  const [ting, setTing] = useState<number>(0.6);
  const [showCopyToast, setShowCopyToast] = useState<boolean>(false);

  const selected = useMemo(() => PRODUCTS.find(p => p.id === productId)!, [productId]);
  const total = useMemo(() => (ting > 0 ? ting * selected.pricePerTing : 0), [ting, selected]);

  const [lengthM, setLengthM] = useState<string>('5');
  const [heightM, setHeightM] = useState<string>('2.8');

  const wallM2 = useMemo(() => Math.max(0, (Number(lengthM) || 0) * (Number(heightM) || 0)), [lengthM, heightM]);
  const wallTing = useMemo(() => wallM2 / TING_TO_M2, [wallM2]);

  const handleShare = async () => {
    const shareData = {
      title: "Pickme 塗料試算器",
      text: "快來試算你的塗料費用！",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        alert("無法複製連結");
      }
    }
  };


  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#2E2E2E] p-6 md:p-10 font-['Noto_Sans_TC']">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="relative text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Pickme 塗料試算器</h1>
          <p className="text-sm text-gray-600 mt-3">快速估算塗料費用與牆面坪數</p>
          <p className="text-xs text-gray-400 mt-1">1 坪 ≈ 3.305785 平方公尺</p>

          <button
            onClick={handleShare}
            className="absolute top-0 right-0 p-2 rounded-full bg-white hover:bg-gray-100 transition-colors border border-[#D9D6CF] shadow-sm"
            aria-label="分享或複製連結"
            title="分享或複製連結"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2E2E2E]">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </header>

        {/* Price Calculator */}
        <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 md:p-8 shadow-sm mb-8">
          <h2 className="text-lg font-medium mb-3">價格試算</h2>
          <p className="text-sm text-gray-500 mb-4">依塗料款式與坪數估算總價</p>

          <div className="grid md:grid-cols-3 gap-6 items-end">
            <div>
              <label htmlFor="product-select" className="text-sm text-gray-600">塗料款式</label>
              <select
                id="product-select"
                className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 bg-white text-[#2E2E2E] focus:outline-none focus:ring-2 focus:ring-[#2E2E2E]/50 transition-shadow appearance-none"
                value={productId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProductId(e.target.value)}
              >
                {PRODUCTS.map((p: Product) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-2">{formatCurrency(selected.pricePerTing)} / 坪</div>
            </div>

            <div>
              <label htmlFor="ting-input" className="text-sm text-gray-600">施工坪數</label>
              <div className="flex items-center gap-1 mt-1">
                <input
                  id="ting-input"
                  type="number"
                  min={0}
                  step={0.1}
                  className="w-full border border-[#D9D6CF] rounded-xl p-3 text-right bg-white text-[#2E2E2E] focus:outline-none focus:ring-2 focus:ring-[#2E2E2E]/50 transition-shadow"
                  value={ting}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTing(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
                />
                <span className="text-sm text-gray-500 ml-1">坪</span>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-[#2E2E2E] text-white flex flex-col justify-center items-center h-full min-h-[98px]">
              <div className="text-xs text-white/80 mb-1">預估總價</div>
              <div className="text-2xl font-semibold tracking-tight">{formatCurrency(total)}</div>
            </div>
          </div>
        </section>

        {/* Wall Area Converter */}
        <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-medium mb-3">牆面坪數換算</h2>
          <p className="text-sm text-gray-500 mb-4">輸入牆面長寬（公尺）自動換算為坪數</p>

          <div className="grid md:grid-cols-4 gap-6 items-end">
            <div>
              <label htmlFor="length-input" className="text-sm text-gray-600">長度（公尺）</label>
              <input
                id="length-input"
                type="number"
                min={0}
                step={0.01}
                className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 bg-white text-[#2E2E2E] text-right focus:outline-none focus:ring-2 focus:ring-[#2E2E2E]/50 transition-shadow"
                value={lengthM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLengthM(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="height-input" className="text-sm text-gray-600">高度（公尺）</label>
              <input
                id="height-input"
                type="number"
                min={0}
                step={0.01}
                className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 bg-white text-[#2E2E2E] text-right focus:outline-none focus:ring-2 focus:ring-[#2E2E2E]/50 transition-shadow"
                value={heightM}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeightM(e.target.value)}
              />
            </div>

            <div className="rounded-2xl p-4 bg-[#F2F2F2] text-center h-full flex flex-col justify-center min-h-[98px]">
              <div className="text-xs text-gray-500 mb-1">面積（平方公尺）</div>
              <div className="text-xl font-semibold tracking-tight">{wallM2.toFixed(2)} m²</div>
            </div>

            <div className="rounded-2xl p-4 bg-[#2E2E2E] text-white text-center h-full flex flex-col justify-center min-h-[98px]">
              <div className="text-xs text-white/80 mb-1">換算坪數</div>
              <div className="text-xl font-semibold tracking-tight">{wallTing.toFixed(3)} 坪</div>
            </div>
          </div>
        </section>

        <footer className="text-xs text-gray-400 text-center mt-10">© {new Date().getFullYear()} Pickme. 本試算僅供參考。</footer>
      </div>
      
      {showCopyToast && (
        <div className="fixed bottom-10 left-1/2 bg-[#2E2E2E] text-white text-sm py-2 px-4 rounded-full shadow-lg animate-toast">
          連結已複製！
        </div>
      )}
    </div>
  );
}