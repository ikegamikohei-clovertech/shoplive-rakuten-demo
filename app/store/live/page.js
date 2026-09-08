"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StoreHeader from "@/components/StoreHeader";
import { useCurrentSeller } from "@/lib/useCurrentSeller";
import { shopliveApi } from "@/lib/apiClient";
import { listLiveApplications } from "@/lib/mockStore";
import { CAMPAIGN_STATUS_LABEL, CAMPAIGN_STATUS_CHIP, formatDateTime } from "@/lib/format";
import { PlusIcon, ImageIcon, EyeIcon, HeartIcon } from "@/components/icons";

const FILTERS = [
  { key: "all", label: "すべて" },
  { key: "審査中", label: "審査中" },
  { key: "READY", label: "配信前" },
  { key: "ONAIR", label: "配信中" },
  { key: "ENDED", label: "終了" },
];

export default function StoreLivePage() {
  const seller = useCurrentSeller();
  const [campaigns, setCampaigns] = useState([]);
  const [localItems, setLocalItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (seller === undefined) return;
    if (!seller) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    shopliveApi
      .searchCampaigns({ sellerId: seller.sellerId, count: 20, sortAscending: false })
      .then((data) => setCampaigns(data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    setLocalItems(
      listLiveApplications().filter(
        (item) => item.storeApplicationId === seller.storeApplicationId && item.status !== "承認"
      )
    );
  }, [seller]);

  if (seller === undefined) return <StoreHeader active="live" />;

  if (!seller) {
    return (
      <div>
        <StoreHeader active="live" />
        <div className="page">
          <div className="empty-state panel">
            <p>まだ承認済みの店舗がありません。まずはアカウント開設を申請してください。</p>
            <Link href="/store/signup" className="btn btn-primary">アカウントを申請する</Link>
          </div>
        </div>
      </div>
    );
  }

  const items = [
    ...localItems.map((l) => ({ kind: "local", data: l })),
    ...campaigns.map((c) => ({ kind: "remote", data: c })),
  ];

  const filtered = items.filter(({ kind, data }) => {
    if (filter === "all") return true;
    if (kind === "local") return data.status === filter;
    return data.campaignMeta.campaignStatus === filter;
  });

  const counts = {
    all: items.length,
    審査中: localItems.filter((l) => l.status === "審査中").length,
    READY: campaigns.filter((c) => c.campaignMeta.campaignStatus === "READY").length,
    ONAIR: campaigns.filter((c) => c.campaignMeta.campaignStatus === "ONAIR").length,
    ENDED: campaigns.filter((c) => c.campaignMeta.campaignStatus === "ENDED").length,
  };

  return (
    <div>
      <StoreHeader active="live" />
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">ライブ一覧</h1>
            <p className="page-sub">{seller.storeName}が配信するライブの申請状況・配信状況をまとめて確認できます。</p>
          </div>
          <Link href="/store/live/new" className="btn btn-primary">
            <PlusIcon className="icon-sm" />
            新規ライブを作成
          </Link>
        </div>

        {error && <div className="error-banner">Shoplive APIエラー: {error}</div>}

        <div className="tabs">
          {FILTERS.map((f) => (
            <button key={f.key} className={`tab ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label} <span className="tab-count">{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner dark" style={{ margin: "0 auto" }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state panel">
            <p>該当するライブがありません。</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map(({ kind, data }) =>
              kind === "local" ? (
                <LocalCard key={data.id} item={data} />
              ) : (
                <RemoteCard key={data.campaignMeta.campaignKey} campaign={data} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LocalCard({ item }) {
  const chip = item.status === "審査中" ? "chip-pending" : "chip-rejected";
  return (
    <div className="card">
      <div className="thumb" style={{ background: item.thumbnailColor || "linear-gradient(135deg,#e7dfc9,#c9b98c)" }}>
        <span className={`chip ${chip}`}>{item.status} ・ 申請日 {new Date(item.createdAt).toLocaleDateString("ja-JP")}</span>
      </div>
      <div className="card-body">
        <p className="card-title">{item.title}</p>
        <div className="card-meta">
          <ImageIcon className="icon-sm" />
          商品 {item.productIds?.length ?? 0}点掲載予定
        </div>
        <div className="card-stats">
          <span>{item.status === "審査中" ? "楽天市場管理者の承認待ちです" : "審査で却下されました"}</span>
        </div>
        <div className="card-actions">
          <Link href={`/store/live/${item.id}/settings`}>申請内容を確認</Link>
        </div>
      </div>
    </div>
  );
}

function RemoteCard({ campaign }) {
  const { campaignMeta, campaignProductCount } = campaign;
  const status = campaignMeta.campaignStatus;
  return (
    <div className="card">
      <div className="thumb" style={{ background: "linear-gradient(135deg,#d9e3df,#8fada4)" }}>
        <span className={`chip ${CAMPAIGN_STATUS_CHIP[status]}`}>
          {status === "ONAIR" && <span className="chip-dot" />}
          {CAMPAIGN_STATUS_LABEL[status] || status} ・ {formatDateTime(campaignMeta.scheduledStartAt)}
        </span>
      </div>
      <div className="card-body">
        <p className="card-title">{campaignMeta.title}</p>
        <div className="card-meta">
          <ImageIcon className="icon-sm" />
          商品 {campaignProductCount ?? 0}点掲載中
        </div>
        <div className="card-stats">
          <span><EyeIcon className="icon-sm" />{campaignMeta.userCount ?? 0}</span>
          <span><HeartIcon className="icon-sm" />{campaignMeta.likeCount ?? 0}</span>
          <span style={{ marginLeft: "auto", fontFamily: "IBM Plex Mono, monospace" }}>{campaignMeta.campaignKey}</span>
        </div>
        <div className="card-actions">
          <Link href={`/store/live/${campaignMeta.campaignKey}/settings`}>設定</Link>
          <Link className="primary" href={`/store/live/${campaignMeta.campaignKey}/console`}>
            {status === "ONAIR" ? "配信コンソールを開く" : "リハーサル・配信"}
          </Link>
        </div>
      </div>
    </div>
  );
}
