"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import { shopliveApi } from "@/lib/apiClient";
import { listStoreApplications, updateStoreApplication } from "@/lib/mockStore";
import { CheckIcon, XIcon } from "@/components/icons";

const STATUS_CHIP = { 審査中: "chip-pending", 承認: "chip-approved", 却下: "chip-rejected" };

export default function AdminAccountsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(refresh, []);

  function refresh() {
    const list = listStoreApplications();
    setApplications(list);
    if (!selectedId && list.length) setSelectedId(list[0].id);
  }

  const selected = applications.find((a) => a.id === selectedId);

  async function handleApprove(app) {
    setBusy(true);
    setError(null);
    try {
      let sellerId;
      let fallback = false;
      try {
        const created = await shopliveApi.createSeller({
          name: app.storeName,
          storeUrl: app.storeUrl,
          description: app.liveOverview,
        });
        sellerId = created.sellerId;
      } catch (err) {
        // Create-a-seller can fail on plans that don't allow API-driven seller
        // creation. Fall back to an existing, not-yet-mapped seller so the
        // demo still runs end to end. See design doc constraints section.
        fallback = true;
        const used = new Set(
          listStoreApplications().filter((a) => a.sellerId).map((a) => String(a.sellerId))
        );
        const { results } = await shopliveApi.searchSellers({ count: 20 });
        const candidate = (results || []).find((s) => !used.has(String(s.sellerId)));
        if (!candidate) throw new Error("割り当て可能な既存Sellerが見つかりませんでした");
        sellerId = candidate.sellerId;
      }
      updateStoreApplication(app.id, { status: "承認", sellerId, sellerFallback: fallback });
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleReject(app) {
    updateStoreApplication(app.id, { status: "却下" });
    refresh();
  }

  return (
    <div>
      <AdminHeader active="accounts" />
      <div className="page">
        <h1 className="page-title">アカウント申請</h1>
        <p className="page-sub" style={{ marginBottom: 24 }}>
          店舗からのライブ配信アカウント開設申請を確認し、承認・却下します。
        </p>

        {error && <div className="error-banner">{error}</div>}

        {applications.length === 0 ? (
          <div className="empty-state panel"><p>まだ申請がありません。</p></div>
        ) : (
          <div className="layout-2col">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>店舗名</th><th>店舗URL</th><th>配信概要</th><th>申請日</th><th>ステータス</th></tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className={app.id === selectedId ? "selected" : ""} onClick={() => setSelectedId(app.id)} style={{ cursor: "pointer" }}>
                      <td style={{ fontWeight: 700 }}>{app.storeName}</td>
                      <td style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11.5, color: "var(--ink-soft)" }}>{app.storeUrl}</td>
                      <td style={{ color: "var(--ink-soft)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.liveOverview}</td>
                      <td style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}>{new Date(app.createdAt).toLocaleDateString("ja-JP")}</td>
                      <td><span className={`chip ${STATUS_CHIP[app.status]}`}><span className="chip-dot" />{app.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected && (
              <div className="drawer">
                <div className="drawer-eyebrow">{selected.status === "審査中" ? "審査中の申請" : selected.status}</div>
                <h2>{selected.storeName}</h2>
                <dl>
                  <dt>店舗URL</dt><dd><a href={selected.storeUrl} target="_blank" rel="noreferrer">{selected.storeUrl}</a></dd>
                  <dt>申請日</dt><dd>{new Date(selected.createdAt).toLocaleDateString("ja-JP")}</dd>
                  {selected.sellerId && <><dt>sellerId</dt><dd style={{ fontFamily: "IBM Plex Mono, monospace" }}>{selected.sellerId}{selected.sellerFallback && <span className="hint-text"> （既存Seller割当）</span>}</dd></>}
                </dl>
                <div style={{ background: "var(--surface-alt)", borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.8, color: "var(--ink-soft)", marginBottom: 20 }}>
                  {selected.liveOverview || "（概要の記入なし）"}
                </div>
                {selected.status === "審査中" && (
                  <div className="drawer-actions">
                    <button className="btn btn-ghost" onClick={() => handleReject(selected)} disabled={busy}>
                      <XIcon className="icon-sm" />
                      却下する
                    </button>
                    <button className="btn btn-approve" onClick={() => handleApprove(selected)} disabled={busy}>
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
