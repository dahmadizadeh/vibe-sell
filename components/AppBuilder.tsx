"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/Card";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AppBuilderProps {
  projectId: string;
  appCode: string | undefined;
  description: string;
  appName: string;
  features?: string[];
  targetUser?: string;
  industry?: string;
  projectGoal?: string;
  appEditHistory?: string[];
  onUpdate: (fields: { appCode?: string; appEditHistory?: string[] }) => void;
}

interface UploadedImage {
  file: File;
  preview: string;
  base64: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TEMPLATES = [
  { emoji: "\u{1F4CB}", label: "Task Manager", prompt: "A task management app with categories, due dates, priority levels, and a kanban board view" },
  { emoji: "\u{1F4CA}", label: "Dashboard", prompt: "An analytics dashboard with charts, stats cards, recent activity feed, and date range filters" },
  { emoji: "\u{1F6D2}", label: "Store", prompt: "An e-commerce product gallery with filters, shopping cart, and product detail modals" },
  { emoji: "\u{1F4AC}", label: "Chat App", prompt: "A messaging app with conversation list, chat view, message bubbles, and online status" },
  { emoji: "\u{1F4DD}", label: "Blog", prompt: "A blog with article cards, categories, search, and a reading view" },
  { emoji: "\u{1F3B5}", label: "Music Player", prompt: "A music player with playlist, album art, play controls, and a progress bar" },
  { emoji: "\u{1F354}", label: "Food Delivery", prompt: "A food delivery app with restaurant listings, menu items, cart, and order tracking" },
  { emoji: "\u{2708}\uFE0F", label: "Travel Planner", prompt: "A travel planning app with destination cards, itinerary builder, and a map view" },
];

const EDIT_CHIPS = [
  "Add dark mode toggle",
  "Improve the visual design",
  "Add search and filtering",
  "Add more realistic data",
  "Make it mobile responsive",
  "Add animations",
  "Add a settings page",
  "Add user avatars and photos",
];

// ─── Utilities ──────────────────────────────────────────────────────────────

function cleanCodeForBrowser(code: string): string {
  return code
    .replace(/['"]use client['"]\s*;?\n?/g, "")
    .replace(/import\s+React\s*,?\s*\{[^}]*\}\s+from\s+['"]react['"]\s*;?\n?/g, "")
    .replace(/import\s+\{[^}]*\}\s+from\s+['"]react['"]\s*;?\n?/g, "")
    .replace(/import\s+React\s+from\s+['"]react['"]\s*;?\n?/g, "")
    .replace(/import\s+.*?\s+from\s+['"]lucide-react['"]\s*;?\n?/g, "")
    .replace(/import\s+.*?\s+from\s+['"].*?['"]\s*;?\n?/g, "")
    .replace(/export\s+default\s+function/g, "function")
    .replace(/export\s+default\s+/g, "")
    .replace(/^export\s+/gm, "");
}

function buildIframeHtml(code: string): string {
  const cleaned = cleanCodeForBrowser(code);
  // Encode as JSON string, escape </ to prevent HTML parser from
  // prematurely closing the <script> tag
  const encodedCode = JSON.stringify(cleaned).replace(/<\//g, "<\\/");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    var useState = React.useState;
    var useEffect = React.useEffect;
    var useMemo = React.useMemo;
    var useCallback = React.useCallback;
    var useRef = React.useRef;
    var useReducer = React.useReducer;
    var createContext = React.createContext;
    var useContext = React.useContext;
    var Fragment = React.Fragment;

    try {
      var code = ${encodedCode};
      var transformed = Babel.transform(code, { presets: ['react', 'typescript'], filename: 'app.tsx' }).code;
      var result = new Function(
        'React', 'ReactDOM',
        'useState', 'useEffect', 'useMemo', 'useCallback',
        'useRef', 'useReducer', 'createContext', 'useContext', 'Fragment',
        transformed + ';\\nreturn typeof App !== "undefined" ? App : (typeof default_1 !== "undefined" ? default_1 : null);'
      );
      var App = result(
        React, ReactDOM,
        useState, useEffect, useMemo, useCallback,
        useRef, useReducer, createContext, useContext, React.Fragment
      );

      if (App) {
        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
      } else {
        document.getElementById('root').innerHTML = '<div style="padding:20px;color:#c00;font-family:monospace;">No App component found. The code must declare a function called App.</div>';
      }
    } catch (e) {
      document.getElementById('root').innerHTML =
        '<div style="padding:20px;font-family:monospace;">' +
        '<div style="color:#c00;font-weight:bold;margin-bottom:8px;">Render Error</div>' +
        '<pre style="color:#c00;white-space:pre-wrap;font-size:13px;">' +
        e.message + '\\n\\n' + (e.stack || '') +
        '</pre></div>';
      try { window.parent.postMessage({ type: 'app-render-error', error: e.message }, '*'); } catch(_) {}
    }
  <\/script>
</body>
</html>`;
}

async function readV0Stream(
  response: Response,
  onChunk: (accumulated: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let fullCode = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || "";
        if (content) {
          fullCode += content;
          onChunk(fullCode);
        }
      } catch {
        // skip malformed SSE lines
      }
    }
  }

  if (buffer.trim().startsWith("data: ")) {
    const data = buffer.trim().slice(6);
    if (data !== "[DONE]") {
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || "";
        if (content) fullCode += content;
      } catch {
        // skip
      }
    }
  }

  return fullCode;
}

function extractCode(text: string): string {
  const match = text.match(/```(?:tsx|jsx|javascript|js|react)?\s*\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

async function processImage(file: File): Promise<UploadedImage> {
  const preview = URL.createObjectURL(file);
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  return { file, preview, base64 };
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AppBuilder({
  appCode,
  description,
  appName,
  features,
  targetUser,
  industry,
  projectGoal,
  appEditHistory,
  onUpdate,
}: AppBuilderProps) {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [streamingCode, setStreamingCode] = useState("");
  const [undoStack, setUndoStack] = useState<string[]>(appEditHistory || []);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [genError, setGenError] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isWorking = generating || editing;

  // Listen for iframe error messages
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "app-render-error") {
        setRenderError(event.data.error);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Build blob URL whenever appCode changes
  useEffect(() => {
    if (!appCode) {
      setIframeUrl("");
      return;
    }
    setRenderError(null);
    const html = buildIframeHtml(appCode);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setIframeUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [appCode]);

  // ─── Image handlers ─────────────────────────────────────────────────────

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const images = await Promise.all(files.map(processImage));
    setUploadedImages((prev) => [...prev, ...images]);
    e.target.value = "";
  }, []);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));
    if (imageItems.length > 0) {
      e.preventDefault();
      const images = await Promise.all(
        imageItems.map((item) => processImage(item.getAsFile()!))
      );
      setUploadedImages((prev) => [...prev, ...images]);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length > 0) {
      const images = await Promise.all(files.map(processImage));
      setUploadedImages((prev) => [...prev, ...images]);
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ─── Build / Edit handlers ──────────────────────────────────────────────

  const buildPrompt = useCallback(() => {
    const parts: string[] = [`Build this app: ${description}`];
    if (features && features.length > 0)
      parts.push(`Key features to include: ${features.join(", ")}`);
    if (targetUser) parts.push(`Target users are: ${targetUser}`);
    if (industry) parts.push(`Industry: ${industry}`);
    if (projectGoal) parts.push(`Project goal: ${projectGoal}`);
    parts.push(
      "This should be a FUNCTIONAL application with real interactions, not a marketing/landing page.",
      "Include realistic sample/mock data.",
      "Make all buttons and interactions work."
    );
    return parts.join("\n");
  }, [description, features, targetUser, industry, projectGoal]);

  const generateApp = useCallback(
    async (prompt?: string) => {
      if (appCode) {
        setUndoStack((prev) => [...prev.slice(-19), appCode]);
      }
      setGenerating(true);
      setStreamingCode("");
      setGenError(null);
      setRenderError(null);
      try {
        const body: Record<string, unknown> = { prompt: prompt || buildPrompt() };
        if (uploadedImages.length > 0) {
          body.images = uploadedImages.map((img) => img.base64);
        }

        const res = await fetch("/api/v0/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          throw new Error(data.error || `v0 error (${res.status})`);
        }

        const fullCode = await readV0Stream(res, setStreamingCode);
        const cleanedCode = extractCode(fullCode);
        if (!cleanedCode) throw new Error("v0 returned empty code");
        onUpdate({ appCode: cleanedCode, appEditHistory: undoStack });
        setStreamingCode("");
        setUploadedImages([]);
      } catch (err) {
        console.error("App generation failed:", err);
        setGenError(err instanceof Error ? err.message : "Generation failed");
        setStreamingCode("");
      } finally {
        setGenerating(false);
      }
    },
    [appCode, buildPrompt, onUpdate, undoStack, uploadedImages]
  );

  const editApp = useCallback(
    async (instruction: string) => {
      if (!appCode || !instruction.trim()) return;
      setEditing(true);
      setStreamingCode("");
      setGenError(null);
      setRenderError(null);
      const newUndoStack = [...undoStack.slice(-19), appCode];
      setUndoStack(newUndoStack);
      try {
        const body: Record<string, unknown> = {
          prompt: instruction,
          existingCode: appCode,
        };
        if (uploadedImages.length > 0) {
          body.images = uploadedImages.map((img) => img.base64);
        }

        const res = await fetch("/api/v0/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          throw new Error(data.error || `v0 error (${res.status})`);
        }

        const fullCode = await readV0Stream(res, setStreamingCode);
        const cleanedCode = extractCode(fullCode);
        if (!cleanedCode) throw new Error("v0 returned empty code");
        onUpdate({ appCode: cleanedCode, appEditHistory: newUndoStack });
        setEditPrompt("");
        setStreamingCode("");
        setUploadedImages([]);
      } catch (err) {
        console.error("App edit failed:", err);
        setGenError(err instanceof Error ? err.message : "Edit failed");
        setUndoStack((prev) => prev.slice(0, -1));
        setStreamingCode("");
      } finally {
        setEditing(false);
      }
    },
    [appCode, onUpdate, undoStack, uploadedImages]
  );

  const handleSubmit = useCallback(
    (prompt: string) => {
      if (isWorking) return;
      const text = prompt.trim();
      if (!text && uploadedImages.length === 0) return;
      if (appCode) {
        editApp(text || "Apply the changes shown in the attached image(s)");
      } else {
        generateApp(text || undefined);
      }
    },
    [isWorking, appCode, editApp, generateApp, uploadedImages]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const newStack = [...undoStack];
    const previousCode = newStack.pop()!;
    setUndoStack(newStack);
    onUpdate({ appCode: previousCode, appEditHistory: newStack });
  }, [undoStack, onUpdate]);

  const restoreVersion = useCallback(
    (index: number) => {
      const restored = undoStack[index];
      if (!restored || !appCode) return;
      const newStack = [...undoStack];
      newStack.splice(index, 1);
      newStack.push(appCode);
      setUndoStack(newStack);
      onUpdate({ appCode: restored, appEditHistory: newStack });
    },
    [undoStack, appCode, onUpdate]
  );

  const handleOpenNewTab = useCallback(() => {
    if (iframeUrl) window.open(iframeUrl, "_blank");
  }, [iframeUrl]);

  const handleAutoFix = useCallback(() => {
    if (!renderError || !appCode) return;
    editApp(`Fix this error in the code: "${renderError}". Return the complete fixed code.`);
    setRenderError(null);
  }, [renderError, appCode, editApp]);

  // ─── Shared prompt input ─────────────────────────────────────────────────

  const PromptInput = (
    <div
      className="relative border-2 border-gray-200 rounded-xl focus-within:border-blue-500 transition-colors bg-white"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {uploadedImages.length > 0 && (
        <div className="flex gap-2 p-3 pb-0">
          {uploadedImages.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.preview} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
              >
                {"\u00D7"}
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={editPrompt}
        onChange={(e) => setEditPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !isWorking) {
            e.preventDefault();
            handleSubmit(editPrompt);
          }
        }}
        onPaste={handlePaste}
        placeholder={
          appCode
            ? "Describe changes... 'Add dark mode' or 'Make the cards bigger'"
            : "Describe your app... 'A task manager with categories and due dates'"
        }
        rows={2}
        className="w-full px-4 py-3 text-sm resize-none focus:outline-none bg-transparent"
        disabled={isWorking}
      />

      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
          <span className="text-xs text-gray-400">Paste screenshots or drag images</span>
        </div>

        <button
          onClick={() => handleSubmit(editPrompt)}
          disabled={isWorking || (!editPrompt.trim() && uploadedImages.length === 0)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {isWorking ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {appCode ? "Editing..." : "Building..."}
            </>
          ) : appCode ? (
            "Edit"
          ) : (
            "Build"
          )}
        </button>
      </div>
    </div>
  );

  // ─── Device size icons ────────────────────────────────────────────────────

  const DeviceSizeToggle = (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => setPreviewSize("desktop")}
        className={`p-1.5 rounded transition-colors ${previewSize === "desktop" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
        title="Desktop"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
      <button
        onClick={() => setPreviewSize("tablet")}
        className={`p-1.5 rounded transition-colors ${previewSize === "tablet" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
        title="Tablet"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>
      <button
        onClick={() => setPreviewSize("mobile")}
        className={`p-1.5 rounded transition-colors ${previewSize === "mobile" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
        title="Mobile"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  // Initial generation — full streaming view
  if (generating && !appCode) {
    return (
      <Card className="p-0 mb-6 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">Building your app with v0...</span>
        </div>
        <div className="bg-gray-900 p-4 overflow-auto" style={{ height: "500px" }}>
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
            <code>{streamingCode || "Waiting for v0 response..."}</code>
            <span className="animate-pulse">{"\u2588"}</span>
          </pre>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 mb-6 overflow-hidden">
      {/* ── Empty state with templates ─────────────────────────────────── */}
      {!appCode && !generating && (
        <div className="text-center py-12 px-6">
          <div className="text-5xl mb-4">{"\u{1F680}"}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Your App</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Describe what you want to build, paste a screenshot, or pick a template below.
          </p>

          {genError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm mb-6 max-w-md mx-auto">
              {genError}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setEditPrompt(t.prompt);
                  textareaRef.current?.focus();
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-sm font-medium text-gray-700">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Toolbar (when app exists) ──────────────────────────────────── */}
      {appCode && (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900 truncate max-w-[200px]">{appName}</span>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode("code")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === "code" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Code
                </button>
              </div>
              {viewMode === "preview" && DeviceSizeToggle}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenNewTab}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Open in New Tab
              </button>
              {undoStack.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Undo
                </button>
              )}
              <button
                onClick={() => generateApp()}
                disabled={isWorking}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* Version history */}
          {undoStack.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 overflow-x-auto">
              <span className="text-xs text-gray-500 whitespace-nowrap">History:</span>
              {undoStack.map((_, index) => (
                <button
                  key={index}
                  onClick={() => restoreVersion(index)}
                  className="px-3 py-1 text-xs bg-white border rounded-md hover:bg-blue-50 hover:border-blue-300 whitespace-nowrap transition-colors"
                >
                  v{index + 1}
                </button>
              ))}
              <div className="px-3 py-1 text-xs bg-blue-100 text-blue-700 border border-blue-300 rounded-md font-medium whitespace-nowrap">
                v{undoStack.length + 1} (current)
              </div>
            </div>
          )}

          {/* Render error banner */}
          {renderError && (
            <div className="flex items-center justify-between px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs">
              <span className="flex-1 truncate mr-3">
                {"\u26A0\uFE0F"} Render error: {renderError.slice(0, 200)}
              </span>
              <button
                onClick={handleAutoFix}
                disabled={isWorking}
                className="px-3 py-1 text-xs font-medium text-amber-700 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                Fix Automatically
              </button>
            </div>
          )}

          {/* Gen/edit error */}
          {genError && (
            <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs">
              {genError}
            </div>
          )}

          {/* Preview / Code view */}
          <div className="relative">
            {viewMode === "preview" ? (
              <div
                className={`mx-auto transition-all duration-300 bg-white ${
                  previewSize === "tablet"
                    ? "max-w-[768px] border-x border-gray-200 shadow-lg"
                    : previewSize === "mobile"
                    ? "max-w-[375px] border-x border-gray-200 shadow-lg rounded-b-lg"
                    : "w-full"
                }`}
              >
                {iframeUrl ? (
                  <iframe
                    ref={iframeRef}
                    src={iframeUrl}
                    className="w-full border-0 bg-white"
                    style={{ height: "600px" }}
                    sandbox="allow-scripts"
                    title="App Preview"
                  />
                ) : (
                  <div className="w-full flex items-center justify-center text-gray-400 text-sm" style={{ height: "600px" }}>
                    No preview available
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-900 p-4 overflow-auto" style={{ height: "600px" }}>
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
                  <code>{appCode}</code>
                </pre>
              </div>
            )}

            {/* Editing overlay */}
            {editing && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col">
                <div className="px-4 py-2 bg-gray-900 text-gray-400 text-xs font-mono flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Applying changes...
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 text-xs font-mono overflow-auto flex-1">
                  <code>{streamingCode || "Waiting for v0..."}</code>
                  <span className="animate-pulse">{"\u2588"}</span>
                </pre>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Prompt input area ──────────────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-gray-100">
        {/* Quick chips (only when app exists) */}
        {appCode && (
          <div className="flex flex-wrap gap-2 mb-3">
            {EDIT_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setEditPrompt(chip);
                  textareaRef.current?.focus();
                }}
                disabled={isWorking}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {PromptInput}
      </div>
    </Card>
  );
}
