import Link from "next/link";
import { getArticleById } from "@/lib/notion";
import type {
  PageObjectResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { notFound } from "next/navigation";

export const revalidate = 60;

function renderBlock(block: BlockObjectResponse) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={block.id} className="mb-4 text-gray-700 leading-relaxed">
          {block.paragraph.rich_text.map((t) => t.plain_text).join("")}
        </p>
      );
    case "heading_1":
      return (
        <h1 key={block.id} className="text-2xl font-bold mt-8 mb-4">
          {block.heading_1.rich_text.map((t) => t.plain_text).join("")}
        </h1>
      );
    case "heading_2":
      return (
        <h2 key={block.id} className="text-xl font-semibold mt-6 mb-3">
          {block.heading_2.rich_text.map((t) => t.plain_text).join("")}
        </h2>
      );
    case "heading_3":
      return (
        <h3 key={block.id} className="text-lg font-medium mt-4 mb-2">
          {block.heading_3.rich_text.map((t) => t.plain_text).join("")}
        </h3>
      );
    case "bulleted_list_item":
      return (
        <li key={block.id} className="ml-4 list-disc text-gray-700">
          {block.bulleted_list_item.rich_text
            .map((t) => t.plain_text)
            .join("")}
        </li>
      );
    case "numbered_list_item":
      return (
        <li key={block.id} className="ml-4 list-decimal text-gray-700">
          {block.numbered_list_item.rich_text
            .map((t) => t.plain_text)
            .join("")}
        </li>
      );
    case "divider":
      return <hr key={block.id} className="my-6 border-gray-200" />;
    default:
      return null;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const { page, blocks } = await getArticleById(params.id);
    const pageData = page as PageObjectResponse;
    const titleProp = Object.values(pageData.properties).find(
      (p) => p.type === "title"
    );
    const title =
      titleProp?.type === "title"
        ? titleProp.title.map((t) => t.plain_text).join("")
        : "無題";

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              &larr; 一覧に戻る
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-400">
              最終更新:{" "}
              {new Date(pageData.last_edited_time).toLocaleDateString("ja-JP")}
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-lg border border-gray-200 p-8">
            {(blocks as BlockObjectResponse[]).map(renderBlock)}
          </article>
        </main>
      </div>
    );
  } catch {
    notFound();
  }
}
