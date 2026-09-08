"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StoreHeader from "@/components/StoreHeader";
import { shopliveApi } from "@/lib/apiClient";
import { getLiveApplication } from "@/lib/mockStore";
import { toIsoFromLocalInput, toLocalInputFromIso, CAMPAIGN_STATUS_LABEL } from "@/lib/format";
import { GripIcon, XIcon, PlusIcon, SearchIcon, CheckIcon } from "@/components/icons";

function resolveCampaignKey(id) {
  if (id.startsWith("live_")) {
    const app = getLiveApplication(id);
    return { campaignKey: app?.campaignKey, localApp: app };
  }
  return { campaignKey: id, localApp: null };
}

export default function LiveSettingsPage({ params }) {
  const [campaignKey, setCampaignKey] = useState(null);
  const [localApp, setLocalApp] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [productSearch, setProductSearch] = useState({ open: false, keyword: "", results: [] });

  useEffect(() => {
    const { campaignKey: ck, localApp: la } = resolveCampaignKey(params.id);
    setLocalApp(la);
    if (!ck) {
      setError("このライブはまだShoplive上のキャンペーンに紐づいていません");
      setLoading(false);
      return;
    }
    setCampaignKey(ck);
    load(ck);
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function load(ck) {
    setLoading(true);
    shopliveApi
      .getCampaign(ck)
      .then((data) => {
        setCampaign(data);
        setForm({
          title: data.campaignMeta.title,
          description: data.campaignMeta.description || "",
          scheduledStartAt: toLocalInputFromIso(data.campaignMeta.scheduledStartAt),
          scheduledEndAt: toLocalInputFromIso(data.campaignMeta.scheduledEndAt),
          rehearsalPasscode: data.campaignMeta.rehearsalPasscode || "",
          serveReplay: !!data.campaignMeta.serveReplay,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleSaveBasic(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await shopliveApi.updateCampaign(campaignKey, {
        campaignMeta: {
          title: form.title,
          description: form.description,
          rehearsalPasscode: form.rehearsalPasscode,
          serveReplay: form.serveReplay,
          scheduledStartAt: toIsoFromLocalInput(form.scheduledStartAt),
          scheduledEndAt: form.scheduledEndAt ? toIsoFromLocalInput(form.scheduledEndAt) : undefined,
        },
      });
      load(campaignKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(productId) {
    setError(null);
    try {
      await shopliveApi.removeProducts(campaignKey, [{ productId }]);
      load(campaignKey);
    } catch (err) {
      setError(err.message);
    }
  }

  async function commitOrder(list) {
    try {
      await shopliveApi.reorderProducts(
        campaignKey,
        list.map((p) => ({ productId: p.productId }))
      );
    } catch (err) {
      setError(err.message);
      load(campaignKey);
    }
  }

  function handleDrop(targetIndex) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const list = [...campaign.campaignProductList];
    const [moved] = list.splice(dragIndex, 1);
    list.splice(targetIndex, 0, moved);
    setCampaign({ ...campaign, campaignProductList: list });
    setDragIndex(null);
    commitOrder(list);
  }

  function searchProducts() {
    shopliveApi
      .searchProducts({ name: productSearch.keyword, sellerId: campaign?.seller?.sellerId, count: 30 })
      .then((data) => setProductSearch((s) => ({ ...s, results: data.results || [] })))
      .catch((err) => setError(err.message));
  }

  async function handleAddProduct(productId) {
    try {
      await shopliveApi.addProducts(campaignKey, [{ productId }]);
      setProductSearch({ open: false, keyword: "", results: [] });
      load(campaignKey);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div>
        <StoreHeader active="live" />
        <div className="page"><div className="spinner dark" /></div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div>
        <StoreHeader active="live" />
        <div className="page"><div className="error-banner">{error}</div></div>
      </div>
    );
  }

  return (
    <div>
      <StoreHeader active="live" />
      <div className="page page-narrow">
        <div className="crumb"><Link href="/store/live">ライブ一覧</Link> ／ {campaign.campaignMeta.title} ／ 設定</div>
        <div className="page-head">
          <h1 className="page-title">ライブの設定</h1>
          <span className="chip chip-scheduled">{CAMPAIGN_STATUS_LABEL[campaign.campaignMeta.campaignStatus]}</span>
        </div>

        {localApp && localApp.status === "審査中" && (
          <div className="info-banner">このライブは審査中です。承認されるまで店舗一覧には表示されません。</div>
        )}
        {error && <div className="error-banner">{error}</div>}

        <div className="tabs">
          <button className={`tab ${tab === "basic" ? "active" : ""}`} onClick={() => setTab("basic")}>基本情報</button>
          <button className={`tab ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>
            商品構成 <span className="tab-count">{campaign.campaignProductList.length}</span>
          </button>
        </div>

        {tab === "basic" && (
          <form className="panel" onSubmit={handleSaveBasic}>
            <div className="field">
              <label>タイトル</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="row-3">
              <div className="field">
                <label>配信開始予定</label>
                <input className="input" type="datetime-local" value={form.scheduledStartAt} onChange={(e) => setForm({ ...form, scheduledStartAt: e.target.value })} />
              </div>
              <div className="field">
                <label>配信終了予定</label>
                <input className="input" type="datetime-local" value={form.scheduledEndAt} onChange={(e) => setForm({ ...form, scheduledEndAt: e.target.value })} />
              </div>
              <div className="field">
                <label>リハーサルパスコード</label>
                <input className="input" value={form.rehearsalPasscode} onChange={(e) => setForm({ ...form, rehearsalPasscode: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>配信概要</label>
              <textarea className="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="field">
              <button type="button" className="toggle-row" style={{ width: "100%", border: "none", textAlign: "left" }} onClick={() => setForm({ ...form, serveReplay: !form.serveReplay })}>
                <div>
                  <div className="t-label">配信終了後にリプレイを公開する</div>
                </div>
                <div className={`toggle ${form.serveReplay ? "on" : ""}`}><i /></div>
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? <span className="spinner" /> : <CheckIcon className="icon-sm" />}
                変更を保存
              </button>
            </div>
          </form>
        )}

        {tab === "products" && (
          <div className="panel">
            {campaign.campaignProductList.length === 0 ? (
              <p className="hint-text">商品が登録されていません。</p>
            ) : (
              campaign.campaignProductList.map((p, i) => (
                <div
                  key={p.productId}
                  className={`prow ${dragIndex === i ? "dragging" : ""}`}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                >
                  <GripIcon className="icon grip" />
                  <span className="hint-text" style={{ fontFamily: "IBM Plex Mono, monospace", width: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                  <div className="thumb-sm" style={{ background: "linear-gradient(135deg,#e2d8ce,#a3806a)" }} />
                  <span className="name">{p.name}</span>
                  <span className="price">¥{Number(p.originalPrice || 0).toLocaleString()}</span>
                  <button className="btn-ghost btn-sm" style={{ border: "none", padding: 4 }} onClick={() => handleRemove(p.productId)}>
                    <XIcon className="icon-sm" />
                  </button>
                </div>
              ))
            )}

            {productSearch.open ? (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input className="input" placeholder="商品名で検索" value={productSearch.keyword} onChange={(e) => setProductSearch((s) => ({ ...s, keyword: e.target.value }))} />
                  <button className="btn btn-ghost" onClick={searchProducts} type="button"><SearchIcon className="icon-sm" />検索</button>
                </div>
                {productSearch.results.map((p) => (
                  <div className="prow" key={p.productId}>
                    <span className="name">{p.name}</span>
                    <span className="price">¥{Number(p.originalPrice || 0).toLocaleString()}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleAddProduct(p.productId)} type="button">追加</button>
                  </div>
                ))}
              </div>
            ) : (
              <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => setProductSearch((s) => ({ ...s, open: true }))}>
                <PlusIcon className="icon-sm" />
                商品を追加
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
