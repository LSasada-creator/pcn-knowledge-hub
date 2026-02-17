import { NextResponse } from "next/server";

interface NewsItem {
  title: string;
  url: string;
  date: string;
  source: string;
}

async function searchNews(query: string): Promise<NewsItem[]> {
  try {
    // Google News RSS feed を利用
    const encodedQuery = encodeURIComponent(query);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=ja&gl=JP&ceid=JP:ja`;
    const res = await fetch(rssUrl, { next: { revalidate: 0 } });
    const xml = await res.text();

    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 2) {
      const itemXml = match[1];
      const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") || "";
      const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
      const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
      const source = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") || "";

      if (title) {
        items.push({
          title: title.trim(),
          url: link.trim(),
          date: pubDate ? new Date(pubDate).toLocaleDateString("ja-JP") : "",
          source: source.trim(),
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  const queries = [
    "PC業界 ニュース",
    "パシフィックネット",
    "IT業界 DX セキュリティ",
  ];

  const results = await Promise.all(queries.map(searchNews));
  const news = results.flat();

  return NextResponse.json({ news, updatedAt: new Date().toISOString() });
}
