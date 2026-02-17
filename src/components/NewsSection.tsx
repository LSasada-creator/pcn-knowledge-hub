"use client";

import { useState, useEffect, useCallback } from "react";

interface NewsItem {
  title: string;
  url: string;
  date: string;
  source: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data.news);
      setUpdatedAt(
        new Date(data.updatedAt).toLocaleString("ja-JP", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      // エラー時は空のまま
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <section className="glass rounded-2xl overflow-hidden shadow-md animate-fade-in-up stagger-2">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗞️</span>
          <h2 className="text-lg font-bold text-gray-900">PC業界ニュース</h2>
        </div>
        <div className="flex items-center gap-3">
          {updatedAt && (
            <span className="text-xs text-gray-400">{updatedAt} 更新</span>
          )}
          <button
            onClick={fetchNews}
            disabled={loading}
            className="text-sm bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 px-4 py-1.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "取得中..." : "ニュースを更新"}
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-100/50">
        {loading && news.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            ニュースを取得中...
          </div>
        ) : news.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            ニュースが見つかりませんでした
          </div>
        ) : (
          news.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-6 py-3.5 hover:bg-white/40 transition-all duration-300"
            >
              <span className="text-blue-400 mt-0.5 text-sm flex-shrink-0">
                ●
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {item.source && <span>{item.source}</span>}
                  {item.source && item.date && <span> · </span>}
                  {item.date && <span>{item.date}</span>}
                </p>
              </div>
            </a>
          ))
        )}
      </div>
    </section>
  );
}
