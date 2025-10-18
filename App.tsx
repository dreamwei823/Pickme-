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
  // 產品（每坪單價）——不標示「官方售價」，僅提供產品選擇與含稅單價資訊
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const selected = useMemo(() => PRODUCTS.find(p => p.id === productId)!, [productId]);

  // ====== A. 多面牆換算：支援動態新增/刪除，合計坪數 ======
  type Wall = { id: string; length: string; height: string };
  const mkWall = (): Wall => ({ id: Math.random().toString(36).slice(2), length: "", height: "" });
  const [walls, setWalls] = useState<Wall[]>([mkWall()]);
  const MAX_WALLS = 10;

  const updateWall = (id: string, field: 'length' | 'height', val: string) => {
    setWalls(prev => prev.map(w => w.id === id ? { ...w, [field]: val } : w));
  };
  const addWall = () => setWalls(prev => (prev.length < MAX_WALLS ? [...prev, mkWall()] : prev));
  const removeWall = (id: string) => setWalls(prev => (prev.length > 1 ? prev.filter(w => w.id !== id) : prev));
  const clearWalls = () => setWalls([mkWall()]);

  // 計算各牆面面積與合計
  const wallAreas = useMemo(() => walls.map(w => {
    const L = parseFloat(w.length); const H = parseFloat(w.height);
    const okL = Number.isFinite(L) && L >= 0; const okH = Number.isFinite(H) && H >= 0;
    const m2 = okL && okH ? L * H : null;
    const ting = m2 === null ? null : m2 / TING_TO_M2;
    return { id: w.id, m2, ting };
  }), [walls]);

  const totalM2 = useMemo(() => wallAreas.reduce((s, a) => s + (a.m2 ?? 0), 0), [wallAreas]);
  const totalTing = useMemo(() => wallAreas.reduce((s, a) => s + (a.ting ?? 0), 0), [wallAreas]);

  // ====== B1. 產品單價計算（不標示「官方售價」）：坪數↔總價雙向；可綁定「上方合計坪數」
  const [bindOfficialToTotal, setBindOfficialToTotal] = useState(true);
  const [tingInput, setTingInput] = useState("");
  const [totalInput, setTotalInput] = useState("");
  const [lastChanged, setLastChanged] = useState<null | 'ting' | 'total'>(null);

  const tingNum = useMemo(() => { const n = parseFloat(String(tingInput)); return Number.isFinite(n)&&n>=0?n:null; }, [tingInput]);
  const totalNum = useMemo(() => { const n = parseFloat(String(totalInput)); return Number.isFinite(n)&&n>=0?n:null; }, [totalInput]);
  const approxEqual = (a:number | null, b:number | null) => a !== null && b !== null && Math.abs(a - b) < 1e-9;

  React.useEffect(() => {
    if (bindOfficialToTotal) {
      const currentTing = totalTing > 0 ? totalTing : null;
      if (!approxEqual(tingNum, currentTing)) {
        setTingInput(currentTing ? String(currentTing) : "");
      }
      const nextTotal = (currentTing || 0) * selected.pricePerTing;
      if (!approxEqual(totalNum, nextTotal)) {
        setTotalInput(String(nextTotal));
      }
      return;
    }
    
    if (lastChanged === 'ting') {
      if (tingNum === null) { setTotalInput(""); return; }
      const next = tingNum * selected.pricePerTing;
      if (!approxEqual(totalNum, next)) setTotalInput(String(next));
    } else if (lastChanged === 'total') {
      if (totalNum === null) { setTingInput(""); return; }
      const next = totalNum / selected.pricePerTing;
      if (!approxEqual(tingNum, next)) setTingInput(String(next));
    }
  }, [bindOfficialToTotal, totalTing, tingNum, totalNum, selected.pricePerTing, lastChanged]);

  // ====== B2. 設計師專用（自訂單價）：同樣可綁定合計坪數 ======
  const [bindDesignerToTotal, setBindDesignerToTotal] = useState(true);
  const [designerPrice, setDesignerPrice] = useState("");
  const [designerTing, setDesignerTing] = useState("");
  const [designerTotal, setDesignerTotal] = useState("");
  const [designerLast, setDesignerLast] = useState<null | 'ting' | 'total'>(null);

  const dPriceNum = useMemo(() => { const n = parseFloat(String(designerPrice)); return Number.isFinite(n)&&n>0?n:null; }, [designerPrice]);
  const dTingNum = useMemo(() => { const n = parseFloat(String(designerTing)); return Number.isFinite(n)&&n>=0?n:null; }, [designerTing]);
  const dTotalNum = useMemo(() => { const n = parseFloat(String(designerTotal)); return Number.isFinite(n)&&n>=0?n:null; }, [designerTotal]);

  React.useEffect(() => {
    if (!dPriceNum) return;
    
    if (bindDesignerToTotal) {
      const currentTing = totalTing > 0 ? totalTing : null;
       if (!approxEqual(dTingNum, currentTing)) {
        setDesignerTing(currentTing ? String(currentTing) : "");
      }
      const nextTotal = (currentTing || 0) * dPriceNum;
      if (!approxEqual(dTotalNum, nextTotal)) {
        setDesignerTotal(String(nextTotal));
      }
      return;
    }

    if (designerLast === 'ting') {
      if (dTingNum === null) { setDesignerTotal(""); return; }
      const next = dTingNum * dPriceNum;
      if (!approxEqual(dTotalNum, next)) setDesignerTotal(String(next));
    } else if (designerLast === 'total') {
      if (dTotalNum === null) { setDesignerTing(""); return; }
      const next = dTotalNum / dPriceNum;
      if (!approxEqual(dTingNum, next)) setDesignerTing(String(next));
    }
  }, [bindDesignerToTotal, totalTing, dPriceNum, dTingNum, dTotalNum, designerLast]);

  const fmtNT = (n:number|null) => (n===null ? '—' : `NT$${Math.round(n).toLocaleString()}`);
  const officialTotalNum = useMemo(() => { const n = parseFloat(totalInput); return Number.isFinite(n)? n : null; }, [totalInput]);
  const designerTotalNum = useMemo(() => { const n = parseFloat(designerTotal); return Number.isFinite(n)? n : null; }, [designerTotal]);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#2E2E2E] p-6 md:p-10 font-[Noto Sans TC]">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Pickme 塗料試算器</h1>
          <p className="text-sm text-gray-600 mt-3">支援多面牆輸入與合計坪數，並可連動兩種報價計算</p>
          <p className="text-xs text-gray-400 mt-1">1 坪 ≈ 3.305785 平方公尺</p>
        </header>

        {/* ① 多面牆坪數換算 */}
        <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-medium mb-3">牆面坪數換算（多面）</h2>
          <p className="text-sm text-gray-500 mb-4">可新增最多 {MAX_WALLS} 面牆，系統將自動合計坪數</p>

          <div className="space-y-3">
            {walls.map((w, idx) => {
              const area = wallAreas.find(a => a.id === w.id);
              return (
                <div key={w.id} className="grid md:grid-cols-6 gap-3 items-end border border-[#EFEDE8] rounded-xl p-3 bg-[#FBFAF8]">
                  <div className="md:col-span-1 flex items-center">
                    <span className="text-sm text-gray-500 font-medium">牆面 {idx+1}</span>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">長（公尺）</label>
                      <input type="number" min={0} step={0.01} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 text-right bg-white focus:outline-none" value={w.length} onChange={(e)=>updateWall(w.id,'length',e.target.value)} placeholder="請輸入" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">高（公尺）</label>
                      <input type="number" min={0} step={0.01} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 text-right bg-white focus:outline-none" value={w.height} onChange={(e)=>updateWall(w.id,'height',e.target.value)} placeholder="請輸入" />
                    </div>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3 bg-[#F2F2F2] text-center">
                      <div className="text-xs text-gray-500">面積（m²）</div>
                      <div className="text-base font-semibold">{area?.m2==null? '—' : area.m2.toFixed(2)}</div>
                    </div>
                    <div className="rounded-xl p-3 bg-[#2E2E2E] text-white text-center">
                      <div className="text-xs text-white/80">坪數</div>
                      <div className="text-base font-semibold">{area?.ting==null? '—' : area.ting.toFixed(3)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <button onClick={()=>removeWall(w.id)} disabled={walls.length===1} className="px-3 py-2 rounded-lg border border-red-300 text-red-600 text-sm disabled:opacity-40 disabled:border-[#D9D6CF] disabled:text-gray-500">刪除</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={addWall} disabled={walls.length>=MAX_WALLS} className="px-4 py-2 rounded-xl bg-[#2E2E2E] text-white text-sm disabled:opacity-50">新增一面牆</button>
            <button onClick={clearWalls} className="px-4 py-2 rounded-xl border border-[#D9D6CF] text-sm">全部清除</button>
          </div>

          <div className="border-t border-[#D9D6CF] my-6"></div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 bg-[#F2F2F2] text-center">
              <div className="text-xs text-gray-500">合計面積（m²）</div>
              <div className="text-xl font-semibold">{totalM2 ? totalM2.toFixed(2) : '—'}</div>
            </div>
            <div className="rounded-2xl p-4 bg-[#2E2E2E] text-white text-center">
              <div className="text-xs text-white/80">合計坪數</div>
              <div className="text-xl font-semibold">{totalTing ? totalTing.toFixed(3) : '—'}</div>
            </div>
            <div className="flex items-center justify-center p-4">
              <div className="text-sm text-gray-600 text-center">下方報價預設使用此合計坪數，可手動取消連動</div>
            </div>
          </div>
        </section>

        {/* ② 產品單價計算 */}
        <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
            <h2 className="text-lg font-medium">產品單價計算</h2>
            <label className="text-sm flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bindOfficialToTotal} onChange={(e)=>setBindOfficialToTotal(e.target.checked)} className="h-4 w-4 rounded" />
              使用上方合計坪數
            </label>
          </div>
          <p className="text-sm text-gray-500 mb-4">選擇塗料款式，以其每坪單價進行估算</p>

          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600">塗料款式</label>
              <select className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 bg-white focus:outline-none" value={productId} onChange={(e)=>setProductId(e.target.value)}>
                {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="text-xs text-gray-500 mt-2">NT${selected.pricePerTing.toLocaleString()} / 坪</div>
            </div>

            <div>
              <label className="text-sm text-gray-600">施工坪數</label>
              <div className="flex items-center gap-1">
                <input type="number" min={0} step={0.001} disabled={bindOfficialToTotal} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 text-right bg-white focus:outline-none disabled:bg-[#F6F6F4] disabled:text-gray-500"
                  value={tingInput} onChange={(e)=>{ setTingInput(e.target.value); setLastChanged('ting'); }} placeholder={bindOfficialToTotal? "自動帶入" : "請輸入"} />
                <span className="text-sm text-gray-500 ml-1">坪</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">預估總價（NT$）</label>
              <input type="number" min={0} step={1} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 text-right bg-white focus:outline-none disabled:bg-white"
                value={totalInput} onChange={(e)=>{ setTotalInput(e.target.value); setLastChanged('total'); }} placeholder={bindOfficialToTotal? "自動計算" : "請輸入"} />
            </div>

            <div className="rounded-2xl p-4 bg-[#2E2E2E] text-white flex flex-col justify-center items-center">
              <div className="text-xs text-white/80 mb-1">預估總價</div>
              <div className="text-2xl font-semibold">{fmtNT(officialTotalNum)}</div>
            </div>
          </div>
        </section>

        {/* ③ 設計師專用（自訂單價） */}
        <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-sm mb-2">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
            <h2 className="text-lg font-medium">設計師專用（自訂單價）</h2>
            <label className="text-sm flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bindDesignerToTotal} onChange={(e)=>setBindDesignerToTotal(e.target.checked)} className="h-4 w-4 rounded" />
              使用上方合計坪數
            </label>
          </div>
          <p className="text-sm text-gray-500 mb-4">輸入每坪單價，系統將依坪數估算或反推</p>

          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600">每坪單價（NT$）</label>
              <input type="number" min={0} step={1} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 text-right bg-white focus:outline-none"
                value={designerPrice} onChange={(e)=>setDesignerPrice(e.target.value)} placeholder="請輸入單價" />
            </div>

            <div>
              <label className="text-sm text-gray-600">施工坪數</label>
              <div className="flex items-center gap-1">
                <input type="number" min={0} step={0.001} disabled={bindDesignerToTotal} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 text-right bg-white focus:outline-none disabled:bg-[#F6F6F4] disabled:text-gray-500"
                  value={designerTing} onChange={(e)=>{ setDesignerTing(e.target.value); setDesignerLast('ting'); }} placeholder={bindDesignerToTotal? "自動帶入" : "請輸入"} />
                <span className="text-sm text-gray-500 ml-1">坪</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">總價（NT$）</label>
                <input type="number" min={0} step={1} className="mt-1 w-full border border-[#D9D6CF] rounded-xl p-3 text-right bg-white focus:outline-none"
                  value={designerTotal} onChange={(e)=>{ setDesignerTotal(e.target.value); setDesignerLast('total'); }} placeholder="請輸入" />
              </div>
              <div className="rounded-2xl p-4 bg-[#2E2E2E] text-white flex flex-col justify-center items-center">
                <div className="text-xs text-white/80 mb-1">預估總價</div>
                <div className="text-2xl font-semibold">{fmtNT(designerTotalNum)}</div>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-xs text-gray-400 text-center mt-10">© {new Date().getFullYear()} Pickme. 本試算僅供參考。</footer>
      </div>
    </div>
  );
}
