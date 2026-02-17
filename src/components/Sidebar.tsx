"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { icon: "🎤", label: "トークスクリプト", href: "/category/talkScript" },
  { icon: "📋", label: "商談記録", href: "/category/deals" },
  { icon: "🏢", label: "業界知識", href: "/category/industry" },
  { icon: "📦", label: "商材情報", href: "/category/products" },
  { icon: "⭐", label: "ベストプラクティス", href: "/category/bestPractice" },
  { icon: "⚠️", label: "NG例", href: "/category/ng" },
  { icon: "❓", label: "Q&A", href: "/category/qa" },
  { icon: "📊", label: "業務フロー図", href: "/workflows" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar hidden md:flex">
      <div className="sidebar-inner">
        {/* ロゴ / ホーム */}
        <Link href="/" className="sidebar-logo">
          <span className="sidebar-icon text-lg">🏠</span>
          <span className="sidebar-label font-bold text-gray-800">ホーム</span>
        </Link>

        {/* 検索 */}
        <div className="sidebar-search">
          <span className="sidebar-icon text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="検索..."
            className="sidebar-label sidebar-search-input"
          />
        </div>

        {/* 区切り線 */}
        <div className="sidebar-divider" />

        {/* メニュー */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 区切り線 */}
        <div className="sidebar-divider" />

        {/* 今週の実績 */}
        <div className="sidebar-stats">
          <div className="sidebar-stats-header">
            <span className="sidebar-icon text-sm">📈</span>
            <span className="sidebar-label text-xs font-semibold text-gray-500 uppercase tracking-wider">
              今週の実績
            </span>
          </div>
          <div className="sidebar-stats-grid">
            <div className="sidebar-stat">
              <span className="sidebar-stat-value">--</span>
              <span className="sidebar-stat-label">架電</span>
            </div>
            <div className="sidebar-stat">
              <span className="sidebar-stat-value">--</span>
              <span className="sidebar-stat-label">接続</span>
            </div>
            <div className="sidebar-stat">
              <span className="sidebar-stat-value">--</span>
              <span className="sidebar-stat-label">アポ</span>
            </div>
          </div>
        </div>

        {/* スペーサー */}
        <div className="flex-1" />

        {/* 気づき投稿 */}
        <Link href="/insights/new" className="sidebar-cta">
          <span className="sidebar-icon">💡</span>
          <span className="sidebar-label font-medium">気づきを投稿</span>
        </Link>
      </div>
    </aside>
  );
}
