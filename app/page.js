import Link from "next/link";
import { BroadcastIcon, StoreIcon, AdminIcon } from "@/components/icons";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: 24,
      }}
    >
      <div className="brand" style={{ fontSize: 24 }}>
        <BroadcastIcon style={{ width: 28, height: 28 }} />
        OnAir<span className="brand-accent">Console</span>
      </div>
      <p style={{ color: "var(--ink-soft)", marginTop: -24, fontSize: 13.5 }}>
        楽天市場 × Shoplive ライブコマース連携ダッシュボード（デモ）
      </p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/store/live" className="panel" style={{ width: 280, textAlign: "center", display: "block" }}>
          <StoreIcon style={{ width: 28, height: 28, color: "var(--accent)", margin: "0 auto 14px" }} />
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
            店舗コンソール
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
            ライブの作成・設定・配信を行う店舗向け画面
          </div>
        </Link>
        <Link href="/admin/accounts" className="panel" style={{ width: 280, textAlign: "center", display: "block" }}>
          <AdminIcon style={{ width: 28, height: 28, color: "var(--accent)", margin: "0 auto 14px" }} />
          <div style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
            管理者コンソール
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
            出店申請・ライブ申請を審査する楽天市場運営者向け画面
          </div>
        </Link>
      </div>
    </div>
  );
}
