import React, { useMemo, useState } from "react";

/**
 * Pickme 塗料計算器 v2 — 官網風格版
 * ------------------------------------------------------
 * 視覺改版：依 Pickme 官網自然礦物色調（灰、米、白）
 * 無紫色、無 logo，風格柔和、留白多。
 */

const TING_TO_M2 = 3.305785;
const PRODUCTS = [
  { id: "stellar", name: "白辰微光", pricePerTing: 7500 },
  { id: "stardust", name: "星雲紗", pricePerTing: 8000 },
  { id: "velmist", name: "雲紋漆", pricePerTing: 7500 },
  { id: "hazy", name: "織雲紗", pricePerTing: 7500 },
  { id: "floor", name: "地坪", pricePerTing: 16000 },
  { id: "marmo", name: "馬莫", pricePerTing: 7000 },
  { id: "bobo", name: "波波石", pricePerTing: 7000 },
  { id: "tino", name: "蒂諾", pricePerTing: 9000 },
];

export default function App() {
  // 產品（每坪單價）
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const selected = useMemo(() => PRODUCTS.find(p => p.id === productId)!, [productId]);

  // ====== 雙向連動：坪數 ↔ 總價 ======
  // 用字串做受控輸入；null 代表尚未輸入或無效
  const [tingInput, setTingInput] = useState("");
  const [totalInput, setTotalInput] = useState("");
  const [lastChanged, setLastChanged] = useState(null as null | 'ting' | 'total');

  const tingNum = useMemo(() => {
    const n = parseFloat(String(tingInput));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [tingInput]);

  const totalNum = useMemo(() => {
    const n = parseFloat(String(totalInput));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [totalInput]);

  // 避免小數誤差的比較
  const approxEqual = (a:number, b:number) => Math.abs(a - b) < 1e-9;

  // 依最後修改的欄位進行反推
  React.useEffect(() => {
    if (!selected) return;
    if (lastChanged === 'ting') {
      if (tingNum === null) { setTotalInput(""); return; }
      const next = tingNum * selected.pricePerTing;
      if (totalNum === null || !approxEqual(totalNum, next)) setTotalInput(String(Math.round(next)));
    } else if (lastChanged === 'total') {
      if (totalNum === null) { setTingInput(""); return; }
      const next = totalNum / selected.pricePerTing;
      if (tingNum === null || !approxEqual(tingNum, next)) setTingInput(String(next));
    }
  // 監聽單價改變：保持最後修改邏輯
  }, [tingNum, totalNum, selected, lastChanged]);

  React.useEffect(() => {
    if (lastChanged === 'ting') {
      if (tingNum !== null && selected) {
        const next = tingNum * selected.pricePerTing;
        if (totalNum === null || !approxEqual(totalNum, next)) setTotalInput(String(Math.round(next)));
      }
    } else if (lastChanged === 'total') {
       if (totalNum !== null && selected) {
        const next = totalNum / selected.pricePerTing;
        if (tingNum === null || !approxEqual(tingNum, next)) setTingInput(String(next));
      }
    }
  }, [selected]);


  // ====== 牆面換算（先計算區，無預設值） ======
  const [lengthInput, setLengthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const lengthNum = useMemo(() => { const n = parseFloat(String(lengthInput)); return Number.isFinite(n)&&n>=0?n:null; }, [lengthInput]);
  const heightNum = useMemo(() => { const n = parseFloat(String(heightInput)); return Number.isFinite(n)&&n>=0?n:null; }, [heightInput]);
  const wallM2 = useMemo(() => (lengthNum===null||heightNum===null) ? null : lengthNum*heightNum, [lengthNum, heightNum]);
  const wallTing = useMemo(() => wallM2===null ? null : wallM2 / TING_TO_M2, [wallM2]);

  const applyWallTingToPrice = () => {
    if (wallTing !== null) { setTingInput(Number(wallTing.toFixed(3)).toString()); setLastChanged('ting'); }
  };

  const formattedTotal = totalNum === null ? '—' : `NT$${Math.round(totalNum).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#2E2E2E] p-6 md:p-10 font-['Noto_Sans_TC']">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Pickme 塗料試算器</h1>
          <p className="text-sm text-gray-600 mt-3">快速估算牆面坪數與塗料費用</p>
          <p className="text-xs text-gray-400 mt-1">1 坪 ≈ 3.305785 平方公尺</p>
        </header>

        {/* ① 牆面坪數換算（置頂） */}
        <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-medium mb-3">牆面坪數換算</h2>
          <p className="text-sm text-gray-500 mb-4">輸入牆面長高（公尺）自動換算為坪數，可一鍵帶入價格試算</p>

          <div className="grid md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600">長度（公尺）</label>
              <input type="number" min={0} step={0.01} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 bg-white text-right focus:outline-none"
                value={lengthInput} onChange={(e)=>setLengthInput(e.target.value)} placeholder="請輸入" />
            </div>
            <div>
              <label className="text-sm text-gray-600">高度（公尺）</label>
              <input type="number" min={0} step={0.01} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 bg-white text-right focus:outline-none"
                value={heightInput} onChange={(e)=>setHeightInput(e.target.value)} placeholder="請輸入" />
            </div>
            <div className="rounded-2xl p-4 bg-[#F2F2F2] text-center">
              <div className="text-xs text-gray-500 mb-1">面積（平方公尺）</div>
              <div className="text-xl font-semibold">{wallM2===null? '—' : `${wallM2.toFixed(2)} m²`}</div>
            </div>
            <div className="rounded-2xl p-4 bg-[#2E2E2E] text-white text-center">
              <div className="text-xs text-white/80 mb-1">換算坪數</div>
              <div className="text-xl font-semibold">{wallTing===null? '—' : `${wallTing.toFixed(3)} 坪`}</div>
            </div>
            <div className="flex items-center justify-center">
              <button onClick={applyWallTingToPrice} disabled={wallTing===null} className="px-4 py-3 rounded-xl border border-[#D9D6CF] text-sm disabled:opacity-50" title="將換算坪數帶入下方價格試算">帶入到價格</button>
            </div>
          </div>
        </section>

        {/* ② 價格試算（置底） */}
        <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-sm mb-2">
          <h2 className="text-lg font-medium mb-3">價格試算</h2>
          <p className="text-sm text-gray-500 mb-4">坪數與總價雙向連動：修改其中一個欄位，另一個會即時更新</p>

          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600">塗料款式</label>
              <select className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 bg-white focus:outline-none" value={productId} onChange={(e)=>setProductId(e.target.value)}>
                {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="text-xs text-gray-500 mt-2">NT${selected?.pricePerTing.toLocaleString()} / 坪</div>
            </div>

            <div>
              <label className="text-sm text-gray-600">施工坪數</label>
              <div className="flex items-center gap-1">
                <input type="number" min={0} step={0.001} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 text-right bg-white focus:outline-none"
                  value={tingInput} onChange={(e)=>{ setTingInput(e.target.value); setLastChanged('ting'); }} placeholder="請輸入坪數" />
                <span className="text-sm text-gray-500 ml-1">坪</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">預估總價（NT$）</label>
              <input type="number" min={0} step={1} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 text-right bg-white focus:outline-none"
                value={totalInput} onChange={(e)=>{ setTotalInput(e.target.value); setLastChanged('total'); }} placeholder="請輸入金額" />
            </div>

            <div className="rounded-2xl p-4 bg-[#2E2E2E] text-white flex flex-col justify-center items-center">
              <div className="text-xs text-white/80 mb-1">結果</div>
              <div className="text-2xl font-semibold">{formattedTotal}</div>
            </div>
          </div>
        </section>

        <footer className="text-xs text-gray-400 text-center mt-10">© {new Date().getFullYear()} Pickme. 本試算僅供參考。</footer>
      </div>
    </div>
  );
}