import Link from "next/link";
import ExcalidrawEditor from "@/components/ExcalidrawEditor";

export const metadata = {
  title: "業務フロー図 - PCN Knowledge Hub",
};

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            &larr; トップに戻る
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📊</span> 業務フロー図
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            架電オペレーションの全体フローを作成・編集できます
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ExcalidrawEditor />
      </main>
    </div>
  );
}
