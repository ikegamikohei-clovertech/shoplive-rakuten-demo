"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import { shopliveApi } from "@/lib/apiClient";
import { listLiveApplications, updateLiveApplication, listStoreApplications } from "@/lib/mockStore";
import { formatDateTime } from "@/lib/format";
import { CheckIcon, XIcon } from "@/components/icons";

const STATUS_CHIP = { 審査中: "chip-pending", 承認: "chip-approved", 却下: "chip-rejected" };

export default function AdminLiveRequestsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function refresh() {
    const list = listLiveApplications();
    setApplications(list);
    if (!selectedId && list.length) setSelectedId(list[0].id);
  }

  useEffect(refresh, []);

  const selected = applications.find((a) => a.id === selectedId);
  const storeName = (id) => listStoreApplications().find((s) => s.id === id)?.storeName || "不明な店舗";

  useEffect(() => {
    if (!selected?.campaignKey) { setDetail(null); return; }
    shopliveApi.getCampaign(selected.campaignKey).then(setDetail).catch(() => setDetail(null));
  }, [selected?.campaignKey]);

  async function handleApprove(app) {
    setBusy(true);
    setError(null);
    try {
      await shopliveApi.transferToSeller(app.campaignKey, app.sellerId, true);
      updateLiveApplication(app.id, { status: "承認" });
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleReject(app) {
    updateLiveApplication(app.id, { status: "却下" });
    refresh();
  }

  return (
    <div>
      <AdminHeader active="live-requests" />
      <div className="page">
        <h1 className="page-title">新規ライブ申請</h1>
        <p className="page-sub" style={{ marginBottom: 24 }}>
          店舗が申請したライブ内容を確認し、承認・却下します。承認するとShoplive上のキャンペーンが該当店舗へ引き渡されます。
        </p>

        {error && <div className="error-banner">{error}</div>}

        {applications.length === 0 ? (
          <div className="empty-state panel"><p>まだ申請がありません。</p></div>
        ) : (
          <div className="layout-2col-wide">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th></th><th>ライブタイトル</th><th>配信予定日時</th><th>商品数</th><th>ステータス</th></tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className={app.id === selectedId ? "selected" : ""} onClick={() => setSelectedId(app.id)} style={{ cursor: "pointer" }}>
                      <td><div className="thumb-sm" style={{ background: app.thumbnailColor || "linear-gradient(135deg,#e7dfc9,#c9b98c)", width: 44, height: 44 }} /></td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{app.title}</div>
                        <div className="hint-text">{storeName(app.storeApplicationId)}</div>
                      </td>
                      <td style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}>{formatDateTime(app.scheduledStartAt)}</td>
                      <td style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}>{app.productIds?.length ?? 0}点</td>
                      <td><span className={`chip ${STATUS_CHIP[app.status]}`}><span className="chip-dot" />{app.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected && (
              <div className="drawer">
                <div className="drawer-eyebrow">{selected.status === "審査中" ? "審査中の申請" : selected.status}</div>
                <div style={{ height: 150, borderRadius: 10, background: selected.thumbnailColor || "linear-gradient(135deg,#e7dfc9,#c9b98c)", marginBottom: 14 }} />
                <h2>{selected.title}</h2>
                <div className="hint-text" style={{ marginBottom: 12 }}>{storeName(selected.storeApplicationId)}</div>
                <dl>
                  <dt>配信予定日時</dt><dd>{formatDateTime(selected.scheduledStartAt)}</dd>
                  <dt>申請日</dt><dd>{new Date(selected.createdAt).toLocaleDateString("ja-JP")}</dd>
                  <dt>campaignKey</dt><dd style={{ fontFamily: "IBM Plex Mono, monospace" }}>{selected.campaignKey || "—"}</dd>
                </dl>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 18 }}>
                  <div className="hint-text" style={{ marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>
                    登録商品（{detail?.campaignProductList?.length ?? "…"}点）
                  </div>
                  {detail?.campaignProductList?.map((p) => (
                    <div className="prow" key={p.productId} style={{ padding: "6px 0" }}>
                      <span className="name" style={{ fontSize: 12.5 }}>{p.name}</span>
                      <span className="price">¥{Number(p.originalPrice || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {selected.status === "審査中" && (
                  <div className="drawer-actions">
                    <button className="btn btn-ghost" onClick={() => handleReject(selected)} disabled={busy}>
                      <XIcon className="icon-sm" />
                      却下する
                    </button>
                    <button className="btn btn-approve" onClick={() => handleApprove(selected)} disabled={busy || !selected.campaignKey}>
                      {busy ? <span className="spinner" /> : <CheckIcon className="icon-sm" />}
                      承認する
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
