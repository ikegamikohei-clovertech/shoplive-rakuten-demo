"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StoreHeader from "@/components/StoreHeader";
import ProductPicker from "@/components/ProductPicker";
import { useCurrentSeller } from "@/lib/useCurrentSeller";
import { shopliveApi } from "@/lib/apiClient";
import { addLiveApplication } from "@/lib/mockStore";
import { toIsoFromLocalInput } from "@/lib/format";
import { ImageIcon, CheckIcon } from "@/components/icons";

const THUMBS = [
  "linear-gradient(135deg,#dcefe4,#a9cfb8)",
  "linear-gradient(135deg,#f0e3d6,#cf9f75)",
  "linear-gradient(135deg,#e9e4d8,#b7ac8f)",
  "linear-gradient(135deg,#e2d8ce,#a3806a)",
];

export default function NewLivePage() {
  const seller = useCurrentSeller();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledStartAt: "",
    scheduledEndAt: "",
    rehearsalPasscode: String(Math.floor(1000 + Math.random() * 9000)),
    serveReplay: true,
    thumbnailColor: THUMBS[0],
  });
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (seller === undefined) return <StoreHeader active="new" />;
  if (!seller) {
    return (
      <div>
        <StoreHeader active="new" />
        <div className="page">
          <div className="empty-state panel">
            <p>ライブを作成するには、先に店舗アカウントの承認が必要です。</p>
            <Link href="/store/signup" className="btn btn-primary">アカウントを申請する</Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.scheduledStartAt) {
      setError("タイトルと配信開始予定は必須です");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await shopliveApi.createCampaign({
        campaignMeta: {
          title: form.title,
          description: form.description || undefined,
          rehearsalPasscode: form.rehearsalPasscode,
          serveReplay: form.serveReplay,
          scheduledStartAt: toIsoFromLocalInput(form.scheduledStartAt),
          scheduledEndAt: form.scheduledEndAt ? toIsoFromLocalInput(form.scheduledEndAt) : undefined,
        },
      });
      const campaignKey = created.campaignMeta.campaignKey;

      if (products.length > 0) {
        await shopliveApi.addProducts(
          campaignKey,
          products.map((p) => ({ productId: p.productId }))
        );
      }

      addLiveApplication({
        storeApplicationId: seller.storeApplicationId,
        sellerId: seller.sellerId,
        title: form.title,
        description: form.description,
        scheduledStartAt: form.scheduledStartAt,
        scheduledEndAt: form.scheduledEndAt,
        productIds: products.map((p) => p.productId),
        thumbnailColor: form.thumbnailColor,
        campaignKey,
      });

      router.push("/store/live");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <StoreHeader active="new" />
      <div className="page" style={{ maxWidth: 1300 }}>
        <h1 className="page-title">ライブの新規作成</h1>
        <p className="page-sub" style={{ marginBottom: 24 }}>
          Create a campaignが受け付ける項目（タイトル・説明・配信開始/終了予定・リハーサルパスコード・リプレイ公開可否）と登録商品を確定させて申請します。
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="layout-2col">
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div className="panel">
              <h2><ImageIcon />基本情報</h2>
              <div className="field">
                <label>タイトル</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：新茶入荷記念！おうちで楽しむ本格煎茶の淹れ方" required />
              </div>
              <div className="row-3">
                <div className="field">
                  <label>配信開始予定</label>
                  <input className="input" type="datetime-local" value={form.scheduledStartAt} onChange={(e) => setForm({ ...form, scheduledStartAt: e.target.value })} required />
                </div>
                <div className="field">
                  <label>配信終了予定 <span className="hint">任意</span></label>
                  <input className="input" type="datetime-local" value={form.scheduledEndAt} onChange={(e) => setForm({ ...form, scheduledEndAt: e.target.value })} />
                </div>
                <div className="field">
                  <label>リハーサルパスコード</label>
                  <input className="input" value={form.rehearsalPasscode} onChange={(e) => setForm({ ...form, rehearsalPasscode: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>サムネイル画像</label>
                <div className="swatch-row">
                  {THUMBS.map((t) => (
                    <button type="button" key={t} className={`swatch ${form.thumbnailColor === t ? "selected" : ""}`} style={{ background: t }} onClick={() => setForm({ ...form, thumbnailColor: t })} />
                  ))}
                </div>
                <div className="hint-text">楽天のライブ一覧表示専用の項目です（Shopliveには送信されません）</div>
              </div>
              <div className="field">
                <label>配信概要</label>
                <textarea className="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="field">
                <button type="button" className={`toggle-row`} style={{ width: "100%", border: "none", textAlign: "left" }} onClick={() => setForm({ ...form, serveReplay: !form.serveReplay })}>
                  <div>
                    <div className="t-label">配信終了後にリプレイを公開する</div>
                    <div className="t-hint">視聴者はアーカイブとして見逃し視聴できます</div>
                  </div>
                  <div className={`toggle ${form.serveReplay ? "on" : ""}`}><i /></div>
                </button>
              </div>
            </div>

            <ProductPicker sellerId={seller.sellerId} selected={products} onChange={setProducts} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? <span className="spinner" /> : <CheckIcon className="icon-sm" />}
                審査に申請する
              </button>
            </div>
          </div>

          <div>
            <div className="panel" style={{ background: "#1c1e24", color: "#fff", position: "sticky", top: 24 }}>
              <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#a9a5e8", marginBottom: 12 }}>
                ライブ一覧での見え方
              </div>
              <div style={{ height: 150, borderRadius: 10, background: form.thumbnailColor, marginBottom: 12, position: "relative" }}>
                <span style={{ position: "absolute", top: 10, left: 10, background: "#fff", color: "var(--accent-strong)", fontFamily: "Archivo, sans-serif", fontSize: 10.5, fontWeight: 800, padding: "4px 9px", borderRadius: 100 }}>
                  審査中
                </span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>{form.title || "（タイトル未入力）"}</p>
              <div style={{ fontSize: 11.5, color: "#b9bac2", fontFamily: "IBM Plex Mono, monospace" }}>
                {form.scheduledStartAt || "配信日時未設定"}
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: "#c8c9d2", lineHeight: 2 }}>
                登録商品 <b style={{ color: "#fff" }}>{products.length}点</b><br />
                申請先 <b style={{ color: "#fff" }}>楽天市場運営事務局</b>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
