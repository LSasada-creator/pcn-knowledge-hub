import Image from "next/image";
import Link from "next/link";
import { queryDatabase, getWeeklyNumbers, type DatabaseKey } from "@/lib/notion";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import NewsSection from "@/components/NewsSection";
import CountUp from "@/components/CountUp";

export const revalidate = 60;

// ---- カード定義（9枚） ----

interface MenuCard {
  key: DatabaseKey | "workflows";
  label: string;
  description: string;
  icon: string;
  color: string;
  href: string;
}

const menuCards: MenuCard[] = [
  {
    key: "talkScript",
    label: "トークスクリプト",
    description: "商談で使えるトーク例と応酬話法",
    icon: "🎤",
    color: "from-blue-500 to-blue-600",
    href: "/category/talkScript",
  },
  {
    key: "deals",
    label: "商談記録",
    description: "過去の商談履歴と結果の記録",
    icon: "📋",
    color: "from-emerald-500 to-emerald-600",
    href: "/category/deals",
  },
  {
    key: "industry",
    label: "業界知識",
    description: "業界動向・市場トレンド情報",
    icon: "🏢",
    color: "from-purple-500 to-purple-600",
    href: "/category/industry",
  },
  {
    key: "products",
    label: "商材情報",
    description: "取扱商材の特徴と提案ポイント",
    icon: "📦",
    color: "from-orange-500 to-orange-600",
    href: "/category/products",
  },
  {
    key: "bestPractice",
    label: "ベストプラクティス",
    description: "成功事例とそのノウハウ共有",
    icon: "⭐",
    color: "from-yellow-500 to-yellow-600",
    href: "/category/bestPractice",
  },
  {
    key: "ng",
    label: "NG例",
    description: "失敗事例と改善ポイント",
    icon: "⚠️",
    color: "from-red-500 to-red-600",
    href: "/category/ng",
  },
  {
    key: "qa",
    label: "Q&A",
    description: "よくある質問と回答集",
    icon: "❓",
    color: "from-cyan-500 to-cyan-600",
    href: "/category/qa",
  },
  {
    key: "insights",
    label: "気づき投稿",
    description: "日々の気づきやナレッジを共有",
    icon: "💡",
    color: "from-amber-500 to-amber-600",
    href: "/insights",
  },
  {
    key: "workflows",
    label: "業務フロー図",
    description: "架電オペレーションの全体フロー",
    icon: "📊",
    color: "from-slate-700 to-slate-800",
    href: "/workflows",
  },
];

// ---- ヘルパー ----

function getTitle(article: PageObjectResponse): string {
  const titleProp = Object.values(article.properties).find(
    (p) => p.type === "title"
  );
  return titleProp?.type === "title"
    ? titleProp.title.map((t) => t.plain_text).join("")
    : "無題";
}

function getRichTextValue(
  article: PageObjectResponse,
  propName: string
): string {
  const prop = article.properties[propName];
  if (prop?.type === "rich_text") {
    return prop.rich_text.map((t) => t.plain_text).join("");
  }
  return "";
}

function DiffArrow({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0) return null;
  const diff = current - previous;
  if (diff === 0)
    return <span className="text-xs text-gray-400 ml-1">→</span>;
  const isUp = diff > 0;
  return (
    <span
      className={`text-xs ml-1 font-semibold ${isUp ? "text-emerald-500" : "text-red-500"}`}
    >
      {isUp ? "↑" : "↓"}
    </span>
  );
}

// ---- メインコンポーネント ----

export default async function Home() {
  const [weeklyResult, insightsResult] = await Promise.allSettled([
    getWeeklyNumbers(),
    queryDatabase("insights"),
  ]);

  const weekly =
    weeklyResult.status === "fulfilled"
      ? weeklyResult.value
      : { current: null, previous: null };
  const insights =
    insightsResult.status === "fulfilled"
      ? (insightsResult.value as PageObjectResponse[])
      : [];

  const latestInsight = insights[0] ?? null;
  const insightTitle = latestInsight ? getTitle(latestInsight) : null;
  const insightBody = latestInsight
    ? getRichTextValue(latestInsight, "内容") ||
      getRichTextValue(latestInsight, "Content") ||
      getRichTextValue(latestInsight, "content")
    : null;

  const cur = weekly.current;
  const prev = weekly.previous;

  const dashboardItems = cur
    ? [
        { label: "架電数", value: cur.calls, prev: prev?.calls ?? 0, unit: "件", decimals: 0 },
        { label: "接続数", value: cur.connections, prev: prev?.connections ?? 0, unit: "件", decimals: 0 },
        { label: "アポ数", value: cur.appointments, prev: prev?.appointments ?? 0, unit: "件", decimals: 0 },
        { label: "接続率", value: cur.connectionRate, prev: prev?.connectionRate ?? 0, unit: "%", decimals: 1 },
        { label: "アポ率", value: cur.appointmentRate, prev: prev?.appointmentRate ?? 0, unit: "%", decimals: 1 },
      ]
    : null;

  return (
    <div className="min-h-screen">
      {/* ===== ヘッダー ===== */}
      <header className="gradient-header text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="PCN Logo"
                width={50}
                height={50}
                className="rounded-xl bg-white p-1 shadow-lg shadow-black/10"
              />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight drop-shadow-sm">
                  PCN Knowledge Hub
                </h1>
                <p className="mt-1 text-blue-200/80 text-base sm:text-lg">
                  営業ナレッジを管理・共有するプラットフォーム
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/insights/new"
                className="btn-glow bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/25"
              >
                + 気づきを投稿
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ===== 1. 週次数値ダッシュボード ===== */}
        <section className="animate-fade-in-up stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📈</span>
            <h2 className="text-lg font-bold text-gray-900">
              週次数値ダッシュボード
            </h2>
            {cur && (
              <span className="text-xs text-gray-400 ml-2 bg-gray-100 px-2 py-0.5 rounded-full">
                {cur.week}
              </span>
            )}
          </div>
          {dashboardItems ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {dashboardItems.map((item) => (
                <div
                  key={item.label}
                  className="glass rounded-2xl p-5 text-center shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <p className="text-xs font-semibold text-blue-600/80 uppercase tracking-wide mb-2">
                    {item.label}
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold gradient-text">
                    <CountUp
                      end={item.value}
                      decimals={item.decimals}
                      suffix={item.unit}
                    />
                    <DiffArrow current={item.value} previous={item.prev} />
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 text-center shadow-md">
              <p className="text-sm text-blue-400">
                週次数値DBが未設定です。
                <code className="bg-blue-100/50 px-1.5 py-0.5 rounded-lg text-xs">
                  .env.local
                </code>
                の
                <code className="bg-blue-100/50 px-1.5 py-0.5 rounded-lg text-xs">
                  NOTION_DB_WEEKLY_NUMBERS
                </code>
                を設定してください。
              </p>
            </div>
          )}
        </section>

        {/* ===== 2. PC業界ニュース ===== */}
        <NewsSection />

        {/* ===== 3. 最新の気づき ===== */}
        {latestInsight && (
          <div className="insight-banner rounded-2xl p-5 shadow-md animate-fade-in-up stagger-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💡</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-800/80 mb-1">
                  最新の気づき
                </p>
                <p className="font-bold text-gray-900">{insightTitle}</p>
                {insightBody && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {insightBody}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(latestInsight.last_edited_time).toLocaleDateString(
                    "ja-JP"
                  )}
                </p>
              </div>
              <Link
                href={`/articles/${latestInsight.id}`}
                className="flex-shrink-0 text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors duration-300"
              >
                詳しく見る →
              </Link>
            </div>
          </div>
        )}

        {/* ===== 4. メニューカード（9枚） ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5 sm:gap-6 animate-fade-in-up stagger-4">
          {menuCards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="card-hover block glass rounded-2xl overflow-hidden border-white/20"
            >
              <div
                className={`bg-gradient-to-br ${card.color} px-5 py-7 text-center`}
              >
                <span className="text-5xl drop-shadow-sm">{card.icon}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900">{card.label}</h3>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* モバイル用気づき投稿ボタン */}
        <div className="sm:hidden fixed bottom-6 right-6 z-50">
          <Link
            href="/insights/new"
            className="btn-glow flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full shadow-xl shadow-purple-500/30 text-2xl"
          >
            +
          </Link>
        </div>
      </main>

      {/* ===== フッター ===== */}
      <footer className="mt-16 border-t border-white/20 glass-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-400">
          PCN Knowledge Hub &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
