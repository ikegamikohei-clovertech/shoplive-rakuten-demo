"use client";

import { useEffect, useState } from "react";
import { shopliveApi } from "@/lib/apiClient";
import { SearchIcon, CheckIcon, PlusIcon } from "@/components/icons";

const SWATCHES = [
  "linear-gradient(135deg,#dcefe4,#a9cfb8)",
  "linear-gradient(135deg,#f0e3d6,#cf9f75)",
  "linear-gradient(135deg,#e9e4d8,#b7ac8f)",
  "linear-gradient(135deg,#e2d8ce,#a3806a)",
];

export default function ProductPicker({ sellerId, selected, onChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [creating, setCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", url: "", originalPrice: "" });

  function load() {
    setLoading(true);
    shopliveApi
      .searchProducts({ sellerId, name: keyword, count: 50 })
      .then((data) => setProducts(data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [sellerId]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(product) {
    const exists = selected.some((p) => p.productId === product.productId);
    if (exists) {
      onChange(selected.filter((p) => p.productId !== product.productId));
    } else {
      onChange([...selected, product]);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newProduct.name || !newProduct.url) return;
    setCreating(true);
    setError(null);
    try {
      const res = await shopliveApi.createProducts([
        {
          name: newProduct.name,
          url: newProduct.url,
          originalPrice: Number(newProduct.originalPrice) || undefined,
          showPrice: true,
          currency: "JPY",
          seller: { sellerId: Number(sellerId) },
        },
      ]);
      const created = res.results?.[0];
      if (created && created.status !== "FAIL") {
        setProducts((prev) => [created, ...prev]);
        onChange([...selected, created]);
        setNewProduct({ name: "", url: "", originalPrice: "" });
      } else {
        setError(created?.message || "商品の作成に失敗しました");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="panel">
      <h2>登録商品（{selected.length}点）</h2>
      {error && <div className="error-banner">{error}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input
          className="input"
          placeholder="商品名で検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), load())}
        />
        <button type="button" className="btn btn-ghost" onClick={load}>
          <SearchIcon className="icon-sm" />
          検索
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "16px 0" }}><div className="spinner dark" /></div>
      ) : products.length === 0 ? (
        <p className="hint-text">この店舗にはまだ商品が登録されていません。下のフォームから新規登録できます。</p>
      ) : (
        <div style={{ maxHeight: 280, overflowY: "auto" }}>
          {products.map((p, i) => {
            const isOn = selected.some((s) => s.productId === p.productId);
            return (
              <div className="prow" key={p.productId}>
                <div className="thumb-sm" style={{ background: SWATCHES[i % SWATCHES.length] }} />
                <span className="name">{p.name}</span>
                <span className="price">¥{Number(p.originalPrice || 0).toLocaleString()}</span>
                <button type="button" className={`check ${isOn ? "on" : ""}`} onClick={() => toggle(p)}>
                  {isOn && <CheckIcon className="icon-sm" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleCreate} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>新しい商品を登録して追加</label>
        </div>
        <div className="row-3" style={{ marginBottom: 10 }}>
          <input className="input" placeholder="商品名" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input className="input" placeholder="価格（円）" type="number" value={newProduct.originalPrice} onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })} />
          <input className="input" placeholder="商品ページURL" value={newProduct.url} onChange={(e) => setNewProduct({ ...newProduct, url: e.target.value })} />
        </div>
        <button className="btn btn-ghost" type="submit" disabled={creating}>
          {creating ? <span className="spinner dark" /> : <PlusIcon className="icon-sm" />}
          商品を作成して追加
        </button>
      </form>
    </div>
  );
}
