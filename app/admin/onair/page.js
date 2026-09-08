"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import { shopliveApi } from "@/lib/apiClient";
import { EyeIcon, HeartIcon, ChatIcon, ExternalLinkIcon, StoreIcon } from "@/components/icons";

export default function AdminOnAirPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    shopliveApi
      .searchCampaigns({ campaignStatus: "ONAIR", count: 20 })
      .then((data) => setCampaigns(data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const poll = setInterval(load, 10000);
    return () => clearInterval(poll);
  }, []);

  return (
    <div>
      <AdminHeader active="onair" />
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">オンエア中のライブ</h1>
            <p className="page-sub">現在配信中の全ライブを一覧できます。プレイヤーで内容を確認できます。</p>
          </div>
          <span className="chip chip-live"><span className="chip-dot" />現在 {campaigns.length}件配信中</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="empty-state"><div className="spinner dark" /></div>
        ) : campaigns.length === 0 ? (
          <div className="empty-state panel"><p>現在配信中のライブはありません。</p></div>
        ) : (
          <div className="grid">
            {campaigns.map((c) => (
              <div className="card" key={c.campaignMeta.campaignKey}>
                <div className="thumb" style={{ height: 120, background: "#111", alignItems: "center", justifyContent: "space-between", display: "flex" }}>
                  <span className="chip chip-live" style={{ margin: 12 }}><span className="chip-dot" />LIVE</span>
                  <span style={{ margin: 12, color: "#e6e6ea", fontSize: 11.5, fontFamily: "IBM Plex Mono, monospace", display: "flex", alignItems: "center", gap: 4 }}>
                    <EyeIcon className="icon-sm" />{c.campaignMeta.userCount ?? 0}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-meta"><StoreIcon className="icon-sm" />{c.seller?.name || "セラー情報なし"}</div>
                  <p className="card-title">{c.campaignMeta.title}</p>
                  <div className="card-stats">
                    <span><HeartIcon className="icon-sm" />{c.campaignMeta.likeCount ?? 0}</span>
                    <span style={{ marginLeft: "auto", fontFamily: "IBM Plex Mono, monospace" }}>{c.campaignMeta.campaignKey}</span>
                  </div>
                  <div className="card-actions">
                    <a className="primary" href={c.stream?.previewLiveUrl || c.campaignMeta.shoplivePlayerUrl} target="_blank" rel="noreferrer">
                      <ExternalLinkIcon className="icon-sm" style={{ marginRight: 6 }} />
                      プレビューを開く
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
