import Link from "next/link";
import { BroadcastIcon, AdminIcon } from "@/components/icons";

export default function AdminHeader({ active }) {
  return (
    <header className="app-header">
      <Link href="/admin/accounts" className="brand">
        <BroadcastIcon />
        OnAir<span className="brand-accent">Console</span>
      </Link>
      <nav className="main-nav">
        <Link href="/admin/accounts" className={`nav-link ${active === "accounts" ? "active" : ""}`}>
          アカウント申請
        </Link>
        <Link href="/admin/onair" className={`nav-link ${active === "onair" ? "active" : ""}`}>
          オンエア中のライブ
        </Link>
        <Link href="/admin/live-requests" className={`nav-link ${active === "live-requests" ? "active" : ""}`}>
          ライブ申請
        </Link>
      </nav>
      <div className="header-right">
        <div className="role-badge">
          <AdminIcon />
          楽天市場 運営事務局
        </div>
        <Link href="/store/live" className="btn btn-ghost btn-sm">
          店舗コンソールへ
        </Link>
        <div className="avatar">運</div>
      </div>
    </header>
  );
}
