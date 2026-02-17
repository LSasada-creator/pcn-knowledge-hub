"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-400">Excalidrawを読み込み中...</p>
      </div>
    ),
  }
);

const TABS = [
  { id: "call-operation", label: "架電オペレーションフロー" },
  { id: "follow-call", label: "フォロー架電フロー" },
  { id: "talk-script-select", label: "トークスクリプト選択フロー" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function getStorageKey(tabId: string) {
  return `pcn-workflow-${tabId}`;
}

export default function ExcalidrawEditor() {
  const [activeTab, setActiveTab] = useState<TabId>("call-operation");
  const [viewMode, setViewMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiRef = useRef<any>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tabKey, setTabKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const key = getStorageKey(activeTab);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setInitialData(JSON.parse(saved));
      } catch {
        setInitialData(null);
      }
    } else {
      setInitialData(null);
    }
    setTabKey((k) => k + 1);
  }, [activeTab, mounted]);

  const handleSave = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    const elements = api.getSceneElements();
    const appState = api.getAppState();
    const data = {
      elements,
      appState: { viewBackgroundColor: appState.viewBackgroundColor },
    };
    localStorage.setItem(getStorageKey(activeTab), JSON.stringify(data));
    setSavedMessage("保存しました");
    setTimeout(() => setSavedMessage(""), 2000);
  }, [activeTab]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-xl">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ツールバー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(false)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              !viewMode
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            編集モード
          </button>
          <button
            onClick={() => setViewMode(true)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              viewMode
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            閲覧モード
          </button>
        </div>
        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className="text-sm text-green-600">{savedMessage}</span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            LocalStorageに保存
          </button>
        </div>
      </div>

      {/* Excalidraw キャンバス */}
      <div
        className="border border-gray-200 rounded-xl overflow-hidden"
        style={{ height: 600 }}
      >
        <Excalidraw
          key={tabKey}
          excalidrawAPI={(instance: unknown) => {
            apiRef.current = instance;
          }}
          viewModeEnabled={viewMode}
          zenModeEnabled={false}
          gridModeEnabled={false}
          langCode="ja-JP"
          initialData={
            initialData
              ? {
                  elements: initialData.elements as never[],
                  appState: initialData.appState as Record<string, unknown>,
                }
              : undefined
          }
          theme="light"
          UIOptions={{
            canvasActions: {
              export: { saveFileToDisk: true },
              loadScene: true,
              saveToActiveFile: false,
              toggleTheme: true,
            },
          }}
        />
      </div>
    </div>
  );
}
