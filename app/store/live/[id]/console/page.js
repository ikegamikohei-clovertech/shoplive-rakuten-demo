"use client";

import { useEffect, useState } from "react";
import styles from "./console.module.css";
import { shopliveApi } from "@/lib/apiClient";
import { getLiveApplication } from "@/lib/mockStore";
import {
  BroadcastIcon, EyeIcon, HeartIcon, ChatIcon, ClickIcon, PlayIcon, StopIcon,
} from "@/components/icons";

const STOCK_OPTIONS = [
  { value: "IN_STOCK", label: "在庫あり" },
  { value: "LOW_IN_STOCK", label: "残りわずか" },
  { value: "SOLD_OUT", label: "売り切れ" },
];

function resolveCampaignKey(id) {
  if (id.startsWith("live_")) return getLiveApplication(id)?.campaignKey;
  return id;
}

function elapsed(startedAt) {
  if (!startedAt) return "00:00:00";
  const ms = Date.now() - new Date(startedAt).getTime();
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function ConsolePage({ params }) {
  const campaignKey = resolveCampaignKey(params.id);
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [rehearsal, setRehearsal] = useState(true);
  const [, forceTick] = useState(0);

  function load() {
    if (!campaignKey) return;
    shopliveApi.getCampaign(campaignKey).then(setCampaign).catch((err) => setError(err.message));
  }

  function loadStats() {
    if (!campaignKey) return;
    shopliveApi
      .getStats(campaignKey)
      .then(setStats)
      .catch(() => setStats(null));
  }

  useEffect(() => {
    load();
    loadStats();
    const tick = setInterval(() => forceTick((n) => n + 1), 1000);
    const poll = setInterval(loadStats, 8000);
    return () => { clearInterval(tick); clearInterval(poll); };
  }, [campaignKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!campaignKey) {
    return <div className={styles.shell}><div className={styles.page}><div className="error-banner">このライブはまだShoplive上のキャンペーンに紐づいていません</div></div></div>;
  }
  if (!campaign) {
    return <div className={styles.shell}><div className={styles.page}><div className="spinner" /></div></div>;
  }

  const status = campaign.campaignMeta.campaignStatus;
  const isLive = status === "ONAIR" || status === "REHEARSAL";

  async function handleStart() {
    setBusy(true); setError(null);
    try {
      await shopliveApi.startBroadcast(campaignKey, rehearsal);
      load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function handleEnd() {
    setBusy(true); setError(null);
    try {
      await shopliveApi.endBroadcast(campaignKey);
      load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function handleStock(productId, stockStatus) {
    setError(null);
    try {
      await shopliveApi.setStockStatus(campaignKey, stockStatus, [{ productId }]);
      load();
    } catch (err) { setError(err.message); }
  }

  async function handleShowNow(productId, show) {
    setError(null);
    try {
      await shopliveApi.setShowNow(campaignKey, show, [{ productId }]);
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}><BroadcastIcon />OnAir<span style={{ color: "var(--accent)" }}>Console</span></div>
        <div className={styles.storeName}>{campaign.seller?.name || "セラー未割当"}</div>
        {isLive && (
          <div className={styles.liveTimer}>
            <span className={styles.liveDot} />
            <span className={styles.liveLabel}>{status === "REHEARSAL" ? "リハーサル中" : "配信中"}</span>
            <span className={styles.liveTime}>{elapsed(campaign.campaignMeta.campaignStartedAt)}</span>
          </div>
        )}
      </header>

      <div className={styles.page}>
        {error && <div className="error-banner">{error}</div>}
        <div className={styles.layout}>
          <div>
            <div className={styles.stage}>
              <div className={styles.stageTop}>
                {isLive ? (
                  <span className={styles.stageLive}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block" }} />{status === "REHEARSAL" ? "REHEARSAL" : "LIVE"}</span>
                ) : <span />}
                <span className={styles.stageMeta}><EyeIcon className="icon-sm" />{campaign.campaignMeta.userCount ?? 0}人視聴中</span>
              </div>
              <div className={styles.stageTitle}>
                <h2>{campaign.campaignMeta.title}</h2>
                <div className={styles.stageMeta} style={{ fontFamily: "IBM Plex Mono, monospace" }}>campaignKey: {campaignKey}</div>
              </div>
            </div>

            <div className={styles.actions}>
              {!isLive ? (
                <>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <input type="checkbox" checked={rehearsal} onChange={(e) => setRehearsal(e.target.checked)} />
                    リハーサルとして開始
                  </label>
                  <button className={`${styles.btn} ${styles.btnStart}`} onClick={handleStart} disabled={busy}>
                    <PlayIcon className="icon-sm" />
                    {rehearsal ? "リハーサルを開始" : "配信を開始する"}
                  </button>
                </>
              ) : (
                <button className={`${styles.btn} ${styles.btnEnd}`} onClick={handleEnd} disabled={busy}>
                  <StopIcon className="icon-sm" />
                  {status === "REHEARSAL" ? "リハーサルを終了" : "配信を終了する"}
                </button>
              )}
              <a className={`${styles.btn} ${styles.btnOutline}`} href={campaign.campaignMeta.shoplivePlayerUrl} target="_blank" rel="noreferrer">
                プレイヤーを開く
              </a>
            </div>

            <div className={styles.stats}>
              <StatTile icon={<EyeIcon className="icon-sm" />} label="視聴者数" value={stats?.totalViewers ?? campaign.campaignMeta.userCount ?? 0} />
              <StatTile icon={<HeartIcon className="icon-sm" />} label="いいね" value={stats?.likes ?? campaign.campaignMeta.likeCount ?? 0} />
              <StatTile icon={<ChatIcon className="icon-sm" />} label="チャット" value={stats?.chats ?? 0} />
              <StatTile icon={<ClickIcon className="icon-sm" />} label="商品クリック" value={stats?.productClicks ?? 0} />
            </div>
            {!stats && <p className="hint-text" style={{ marginTop: 8 }}>統計データはまだありません（配信が実際に開始され視聴者がつくと集計されます）</p>}
          </div>

          <div className={styles.sidePanel}>
            <div className={styles.sideHead}>
              <h3>商品管理</h3>
              <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{campaign.campaignProductList.length}点</span>
            </div>
            {campaign.campaignProductList.map((p) => (
              <div key={p.productId} className={`${styles.prow} ${p.showingNow ? styles.prowNow : ""}`}>
                <div className={styles.thumb} style={{ background: "linear-gradient(135deg,#dcefe4,#a9cfb8)" }} />
                <div className={styles.meta}>
                  <div className={styles.name}>{p.name}</div>
                  <select className={styles.select} value={p.stockStatus} onChange={(e) => handleStock(p.productId, e.target.value)}>
                    {STOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {p.showingNow && <div className={styles.nowLabel}>● NOW 表示中</div>}
                </div>
                <span className={styles.price}>¥{Number(p.originalPrice || 0).toLocaleString()}</span>
                <button className={`${styles.toggle} ${p.showingNow ? styles.toggleOn : ""}`} onClick={() => handleShowNow(p.productId, !p.showingNow)}>
                  <i />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value }) {
  return (
    <div className={styles.stat}>
      <div className={styles.k}>{icon}{label}</div>
      <div className={styles.v}>{Number(value ?? 0).toLocaleString()}</div>
    </div>
  );
}
