"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BroadcastIcon, StoreIcon, ChevronDownIcon } from "@/components/icons";
import { listApprovedSellers, getCurrentSellerId, setCurrentSellerId } from "@/lib/mockStore";

export default function StoreHeader({ active }) {
  const [sellers, setSellers] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const list = listApprovedSellers();
    setSellers(list);
    const stored = getCurrentSellerId();
    const valid = list.find((s) => String(s.sellerId) === String(stored));
    setCurrentId(valid ? stored : list[0]?.sellerId ?? null);
    if (!valid && list[0]) setCurrentSellerId(list[0].sellerId);
  }, []);

  const current = sellers.find((s) => String(s.sellerId) === String(currentId));

  function pick(sellerId) {
    setCurrentSellerId(sellerId);
    setOpen(false);
    window.location.reload();
  }

  return (
    <header className="app-header">
      <Link href="/store/live" className="brand">
        <BroadcastIcon />
        OnAir<span className="brand-accent">Console</span>
      </Link>
      <nav className="main-nav">
        <Link href="/store/live" className={`nav-link ${active === "live" ? "active" : ""}`}>
          ライブ一覧
        </Link>
        <Link href="/store/live/new" className={`nav-link ${active === "new" ? "active" : ""}`}>
          新規作成
        </Link>
        <Link href="/store/signup" className={`nav-link ${active === "signup" ? "active" : ""}`}>
          アカウント設定
        </Link>
      </nav>
      <div className="header-right">
        <div style={{ position: "relative" }}>
          <button className="seller-switch" onClick={() => setOpen((v) => !v)}>
            <StoreIcon />
            {current ? current.storeName : "店舗未選択"}
            <ChevronDownIcon className="icon-sm" />
          </button>
          {open && (
            <div
              className="panel"
              style={{
                position: "absolute", right: 0, top: 46, zIndex: 20,
                padding: 8, minWidth: 220, boxShadow: "0 12px 28px rgba(28,30,36,.18)",
              }}
            >
              {sellers.length === 0 && (
                <div style={{ fontSize: 12.5, color: "var(--ink-faint)", padding: "8px 10px" }}>
                  承認済みの店舗がありません
                </div>
              )}
              {sellers.map((s) => (
                <button
                  key={s.sellerId}
                  onClick={() => pick(s.sellerId)}
                  className="btn btn-ghost btn-block"
                  style={{
                    justifyContent: "flex-start", border: "none",
                    background: String(s.sellerId) === String(currentId) ? "var(--accent-soft)" : "transparent",
                    marginBottom: 2,
                  }}
                >
                  {s.storeName}
                  <span className="hint-text" style={{ marginLeft: "auto" }}>#{s.sellerId}</span>
                </button>
              ))}
              <Link href="/admin/accounts" className="btn btn-ghost btn-block" style={{ marginTop: 6, borderTop: "1px solid var(--border)", borderRadius: 0, paddingTop: 10 }}>
                管理者コンソールへ
              </Link>
            </div>
          )}
        </div>
        <div className="avatar">{current ? current.storeName.slice(0, 1) : "?"}</div>
      </div>
    </header>
  );
}
