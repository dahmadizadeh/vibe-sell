"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/Card";

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

const QUICK_CHIPS = [
  "Add dark mode toggle",
  "Add search/filter functionality",
  "Improve the design and colors",
  "Add more sample data",
  "Make it mobile responsive",
  "Add animations and transitions",
  "Add a sidebar navigation",
  "Add loading states",
];

function cleanCode(raw: string): string {
  let code = raw;
  code = code.replace(/^import\s+.*?[\r\n]+/gm, "");
  code = code.replace(/export\s+default\s+function\s+/g, "function ");
  code = code.replace(/export\s+default\s+\w+\s*;?\s*$/gm, "");
  code = code.replace(/export\s+function\s+/g, "function ");
  code = code.replace(/export\s+const\s+/g, "const ");
  code = code.replace(/^export\s+/gm, "");
  return code.trim();
}

function buildIframeHtml(code: string): string {
  const cleaned = cleanCode(code);
  // We use a script tag with type text/babel so Babel transpiles it in-browser.
  // The code is embedded directly — no template literal escaping needed since
  // we inject it as a text node via a separate script block.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #error-display { color: #dc2626; padding: 20px; font-family: monospace; white-space: pre-wrap; display: none; background: #fef2f2; border: 1px solid #fecaca; margin: 20px; border-radius: 8px; font-size: 12px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error-display"></div>
  <script type="text/babel" data-type="module">
    try {
      ${cleaned}

      const rootEl = document.getElementById('root');
      const root = ReactDOM.createRoot(rootEl);
      const Component = typeof App !== 'undefined' ? App : null;

      if (Component) {
        root.render(React.createElement(Component));
      } else {
        document.getElementById('error-display').style.display = 'block';
        document.getElementById('error-display').textContent = 'No App component found in generated code.';
      }
    } catch (err) {
      document.getElementById('error-display').style.display = 'block';
      document.getElementById('error-display').textContent = 'Render error: ' + err.message + '\\n\\n' + err.stack;
      window.parent.postMessage({ type: 'app-preview-error', error: err.message }, '*');
    }
  </script>
</body>
</html>`;
}

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
  const [editInput, setEditInput] = useState("");
  const [undoStack, setUndoStack] = useState<string[]>(appEditHistory || []);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [genError, setGenError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for iframe error messages
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "app-preview-error") {
        setRenderError(event.data.error);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Build blob URL whenever appCode changes — this is the key fix.
  // blob URLs are isolated from the parent origin, so the iframe can never
  // accidentally load the platform.
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
      setGenError(null);
      setRenderError(null);
      try {
        const res = await fetch("/api/v0/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt || buildPrompt() }),
        });
        // Read as text first to avoid JSON parse crash on error responses
        const text = await res.text();
        let data: { code?: string; error?: string };
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
        }
        if (data.error) throw new Error(data.error);
        if (!data.code) throw new Error("No code returned from v0");
        onUpdate({ appCode: data.code, appEditHistory: undoStack });
      } catch (err) {
        console.error("App generation failed:", err);
        setGenError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setGenerating(false);
      }
    },
    [appCode, buildPrompt, onUpdate, undoStack]
  );

  const editApp = useCallback(
    async (instruction: string) => {
      if (!appCode || !instruction.trim()) return;
      setEditing(true);
      setGenError(null);
      setRenderError(null);
      const newUndoStack = [...undoStack.slice(-19), appCode];
      setUndoStack(newUndoStack);
      try {
        const res = await fetch("/api/v0/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: instruction, existingCode: appCode }),
        });
        const text = await res.text();
        let data: { code?: string; error?: string };
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
        }
        if (data.error) throw new Error(data.error);
        if (!data.code) throw new Error("No code returned from v0");
        onUpdate({ appCode: data.code, appEditHistory: newUndoStack });
        setEditInput("");
      } catch (err) {
        console.error("App edit failed:", err);
        setGenError(err instanceof Error ? err.message : "Edit failed");
        setUndoStack((prev) => prev.slice(0, -1));
      } finally {
        setEditing(false);
      }
    },
    [appCode, onUpdate, undoStack]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const newStack = [...undoStack];
    const previousCode = newStack.pop()!;
    setUndoStack(newStack);
    onUpdate({ appCode: previousCode, appEditHistory: newStack });
  }, [undoStack, onUpdate]);

  const handleOpenNewTab = useCallback(() => {
    if (iframeUrl) {
      window.open(iframeUrl, "_blank");
    }
  }, [iframeUrl]);

  const handleAutoFix = useCallback(() => {
    if (!renderError) return;
    editApp(`Fix this error: ${renderError}`);
    setRenderError(null);
  }, [renderError, editApp]);

  // Empty state — no appCode yet
  if (!appCode && !generating) {
    return (
      <Card className="p-0 mb-6 overflow-hidden">
        <div className="text-center py-16 px-6">
          <div className="text-5xl mb-4">{"\u{1F680}"}</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Build Your App
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Generate a fully functional, interactive app with v0. Includes
            working UI, navigation, sample data, and real interactions.
          </p>
          {genError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm mb-4 max-w-md mx-auto">
              {genError}
            </div>
          )}
          <button
            onClick={() => generateApp()}
            className="px-6 py-3 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm"
          >
            Build Your App
          </button>
        </div>
      </Card>
    );
  }

  // Generating state
  if (generating) {
    return (
      <Card className="p-0 mb-6 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full mb-4" />
          <p className="text-gray-700 font-medium">
            Building your app with v0...
          </p>
          <p className="text-gray-400 text-sm mt-1">
            This takes 15-30 seconds
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 mb-6 overflow-hidden">
      {/* Header / toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">{appName}</span>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "preview"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "code"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Code
            </button>
          </div>
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
            className="px-3 py-1.5 text-xs font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>

      {/* Render error banner */}
      {renderError && (
        <div className="flex items-center justify-between px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs">
          <span className="flex-1 truncate mr-3">
            {"\u26A0\uFE0F"} Render error: {renderError.slice(0, 200)}
          </span>
          <button
            onClick={handleAutoFix}
            disabled={editing}
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

      {/* Preview or Code view */}
      {viewMode === "preview" ? (
        iframeUrl ? (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="w-full border-0 bg-white"
            style={{ height: "600px" }}
            sandbox="allow-scripts"
            title="App Preview"
          />
        ) : (
          <div
            className="w-full flex items-center justify-center text-gray-400 text-sm"
            style={{ height: "600px" }}
          >
            No preview available
          </div>
        )
      ) : (
        <div
          className="bg-gray-950 p-4 overflow-auto"
          style={{ height: "600px" }}
        >
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
            <code>{appCode}</code>
          </pre>
        </div>
      )}

      {/* Editing indicator */}
      {editing && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-t border-blue-200 text-xs text-blue-700">
          <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Applying changes with v0... (15-30 seconds)
        </div>
      )}

      {/* Edit input + quick chips */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !editing && editInput.trim()) {
                editApp(editInput.trim());
              }
            }}
            placeholder="Edit your app... e.g., 'Add a favorites feature' or 'Change colors to dark theme'"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
            disabled={editing}
          />
          <button
            onClick={() => {
              if (editInput.trim()) editApp(editInput.trim());
            }}
            disabled={editing || !editInput.trim()}
            className="bg-brand-primary text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
          >
            {editing ? "Editing..." : "Edit"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => editApp(chip)}
              disabled={editing}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
