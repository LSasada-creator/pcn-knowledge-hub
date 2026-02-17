import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const databases = {
  talkScript: process.env.NOTION_DB_TALK_SCRIPT!,
  deals: process.env.NOTION_DB_DEALS!,
  industry: process.env.NOTION_DB_INDUSTRY!,
  products: process.env.NOTION_DB_PRODUCTS!,
  bestPractice: process.env.NOTION_DB_BEST_PRACTICE!,
  ng: process.env.NOTION_DB_NG!,
  qa: process.env.NOTION_DB_QA!,
  insights: process.env.NOTION_DB_INSIGHTS!,
} as const;

export type DatabaseKey = keyof typeof databases;

export async function queryDatabase(key: DatabaseKey) {
  const response = await notion.databases.query({
    database_id: databases[key],
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  });
  return response.results;
}

export async function getArticleById(pageId: string) {
  const [page, blocks] = await Promise.all([
    notion.pages.retrieve({ page_id: pageId }),
    notion.blocks.children.list({ block_id: pageId }),
  ]);
  return { page, blocks: blocks.results };
}

// ---- 週次数値ダッシュボード ----

export interface WeeklyNumbers {
  week: string;
  calls: number;
  connections: number;
  appointments: number;
  connectionRate: number;
  appointmentRate: number;
}

function getNumberProp(page: PageObjectResponse, name: string): number {
  const prop = page.properties[name];
  if (prop?.type === "number" && prop.number !== null) return prop.number;
  return 0;
}

function getTitleText(page: PageObjectResponse): string {
  const prop = Object.values(page.properties).find((p) => p.type === "title");
  if (prop?.type === "title") return prop.title.map((t) => t.plain_text).join("");
  return "";
}

export async function getWeeklyNumbers(): Promise<{
  current: WeeklyNumbers | null;
  previous: WeeklyNumbers | null;
}> {
  const dbId = process.env.NOTION_DB_WEEKLY_NUMBERS;
  if (!dbId) return { current: null, previous: null };

  const response = await notion.databases.query({
    database_id: dbId,
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    page_size: 2,
  });

  const pages = response.results as PageObjectResponse[];

  function parseRow(page: PageObjectResponse): WeeklyNumbers {
    const calls = getNumberProp(page, "架電数");
    const connections = getNumberProp(page, "接続数");
    const appointments = getNumberProp(page, "アポ数");
    return {
      week: getTitleText(page),
      calls,
      connections,
      appointments,
      connectionRate: calls > 0 ? Math.round((connections / calls) * 1000) / 10 : 0,
      appointmentRate: connections > 0 ? Math.round((appointments / connections) * 1000) / 10 : 0,
    };
  }

  return {
    current: pages[0] ? parseRow(pages[0]) : null,
    previous: pages[1] ? parseRow(pages[1]) : null,
  };
}
