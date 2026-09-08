"use client";

import { useEffect, useState } from "react";
import { BroadcastIcon, CheckIcon } from "@/components/icons";
import { addStoreApplication, listStoreApplications } from "@/lib/mockStore";

const STATUS_CHIP = {
  審査中: "chip-pending",
  承認: "chip-approved",
  却下: "chip-rejected",
};

export default function StoreSignupPage() {
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({
    storeName: "",
    storeUrl: "",
    liveOverview: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setApplications(listStoreApplications());
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.storeName || !form.storeUrl) return;
    const application = addStoreApplication(form);
    setApplications((prev) => [application, ...prev]);
    setForm({ storeName: "", storeUrl: "", liveOverview: "" });
    setSubmitted(true);
  }

  return (
    <div>
      <div className="app-header">
        <div className="brand">
          <BroadcastIcon />
          OnAir<span className="brand-accent">Console</span>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--ink-soft)" }}>
          楽天市場 出店店舗様向け ライブ配信アカウント開設
        </div>
      </div>

      <div className="page page-narrow" style={{ maxWidth: 640 }}>
        <h1 className="page-title">ライブ配信アカウントを開設する</h1>
        <p className="page-sub" style={{ marginBottom: 24 }}>
          店舗情報とライブ配信の概要をご入力ください。楽天市場担当者が内容を確認し、審査結果をこの画面でお知らせします。
        </p>

        <form className="panel" onSubmit={handleSubmit}>
          {submitted && (
            <div className="info-banner">
              <CheckIcon className="icon-sm" style={{ marginRight: 6 }} />
              申請を受け付けました。審査状況は下の一覧で確認できます。
            </div>
          )}
          <div className="field">
            <label>店舗名</label>
            <input
              className="input"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              placeholder="例：宮崎茶房 みやざき本店"
              required
            />
          </div>
          <div className="field">
            <label>店舗URL <span className="hint">楽天市場の店舗ページ</span></label>
            <input
              className="input"
              value={form.storeUrl}
              onChange={(e) => setForm({ ...form, storeUrl: e.target.value })}
              placeholder="https://www.rakuten.co.jp/your-store/"
              required
            />
          </div>
          <div className="field">
            <label>ライブ配信の概要 <span className="hint">配信内容・頻度・担当者などをご記入ください</span></label>
            <textarea
              className="textarea"
              rows={5}
              value={form.liveOverview}
              onChange={(e) => setForm({ ...form, liveOverview: e.target.value })}
              placeholder="例：国産和紅茶・煎茶の実演販売と淹れ方講座を中心に、週2回の定期配信を予定しています。"
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit">
            審査に申請する
          </button>
        </form>

        {applications.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: "Archivo, sans-serif", fontSize: 12.5, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".04em" }}>
              申請状況
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {applications.map((app) => (
                <div key={app.id} className="panel" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, flex: 1 }}>{app.storeName}</span>
                  <span className="hint-text" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                    申請日 {new Date(app.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                  <span className={`chip ${STATUS_CHIP[app.status]}`}>
                    <span className="chip-dot" />
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
