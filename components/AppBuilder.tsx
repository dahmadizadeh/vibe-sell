"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card } from "@/components/Card";
import type { AppEditMessage } from "@/lib/v0";

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
  "Add dark mode",
  "Add sidebar navigation",
  "Add search functionality",
  "Improve mobile layout",
  "Add data charts",
  "Add settings page",
];

function extractCode(text: string): string {
  const match = text.match(/```(?:tsx|jsx|javascript|js)?\s*\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

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

function buildPreviewHtml(code: string): string {
  const cleaned = cleanCode(code);
  const escapedCode = cleaned
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; }
    #root { min-height: 100vh; }
    #error-display {
      padding: 20px; margin: 20px; color: #dc2626; background: #fef2f2;
      border: 1px solid #fecaca; border-radius: 8px; font-family: monospace;
      font-size: 12px; white-space: pre-wrap; word-break: break-word;
    }
    #loading {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; color: #6b7280; font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="root"><div id="loading">Loading app preview...</div></div>

  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin><\/script>
  <script src="https://unpkg.com/@babel/standalone@7.26.10/babel.min.js" crossorigin><\/script>

  <script>
    function Button(props) {
      var variant = props.variant || 'default';
      var size = props.size || 'default';
      var baseClass = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50';
      var variantClass = variant === 'outline'
        ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
        : variant === 'ghost'
        ? 'hover:bg-gray-100 text-gray-700'
        : 'bg-indigo-600 text-white hover:bg-indigo-700';
      var sizeClass = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-sm';
      return React.createElement('button', Object.assign({}, props, {
        className: (baseClass + ' ' + variantClass + ' ' + sizeClass + ' ' + (props.className || '')).trim()
      }), props.children);
    }

    function Input(props) {
      return React.createElement('input', Object.assign({
        className: 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 ' + (props.className || '')
      }, props));
    }

    function CardComponent(props) {
      return React.createElement('div', {
        className: 'rounded-lg border border-gray-200 bg-white shadow-sm ' + (props.className || '')
      }, props.children);
    }
    function CardHeader(props) {
      return React.createElement('div', { className: 'flex flex-col space-y-1.5 p-6 ' + (props.className || '') }, props.children);
    }
    function CardTitle(props) {
      return React.createElement('h3', { className: 'text-2xl font-semibold leading-none tracking-tight ' + (props.className || '') }, props.children);
    }
    function CardDescription(props) {
      return React.createElement('p', { className: 'text-sm text-gray-500 ' + (props.className || '') }, props.children);
    }
    function CardContent(props) {
      return React.createElement('div', { className: 'p-6 pt-0 ' + (props.className || '') }, props.children);
    }
    function Badge(props) {
      var variant = props.variant || 'default';
      var cls = variant === 'secondary' ? 'bg-gray-100 text-gray-800' : variant === 'outline' ? 'border border-gray-200 text-gray-700' : 'bg-indigo-100 text-indigo-800';
      return React.createElement('span', {
        className: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ' + cls + ' ' + (props.className || '')
      }, props.children);
    }
    function Tabs(props) { return React.createElement('div', { className: props.className || '' }, props.children); }
    function TabsList(props) { return React.createElement('div', { className: 'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ' + (props.className || '') }, props.children); }
    function TabsTrigger(props) { return React.createElement('button', Object.assign({}, props, { className: 'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm ' + (props.className || '') }), props.children); }
    function TabsContent(props) { return React.createElement('div', { className: props.className || '' }, props.children); }
    function Textarea(props) { return React.createElement('textarea', Object.assign({ className: 'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ' + (props.className || '') }, props)); }
    function Select(props) { return React.createElement('select', Object.assign({ className: 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ' + (props.className || '') }, props), props.children); }
    function Label(props) { return React.createElement('label', Object.assign({ className: 'text-sm font-medium leading-none ' + (props.className || '') }, props), props.children); }
    function Separator(props) { return React.createElement('div', { className: 'shrink-0 bg-gray-200 h-[1px] w-full ' + (props.className || '') }); }
    function Avatar(props) { return React.createElement('div', { className: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 items-center justify-center ' + (props.className || '') }, props.children); }
    function AvatarFallback(props) { return React.createElement('span', { className: 'text-sm font-medium text-gray-600 ' + (props.className || '') }, props.children); }
    function ScrollArea(props) { return React.createElement('div', { className: 'overflow-auto ' + (props.className || ''), style: props.style }, props.children); }
    function Switch(props) {
      var checked = props.checked || false;
      return React.createElement('button', {
        role: 'switch',
        'aria-checked': checked,
        onClick: props.onCheckedChange ? function() { props.onCheckedChange(!checked); } : undefined,
        className: 'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ' + (checked ? 'bg-indigo-600' : 'bg-gray-200') + ' ' + (props.className || '')
      }, React.createElement('span', { className: 'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ' + (checked ? 'translate-x-5' : 'translate-x-0') }));
    }
    function Dialog(props) { return props.open ? React.createElement('div', { className: 'fixed inset-0 z-50 flex items-center justify-center' }, React.createElement('div', { className: 'fixed inset-0 bg-black/50', onClick: props.onOpenChange ? function() { props.onOpenChange(false); } : undefined }), React.createElement('div', { className: 'relative z-50 bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[85vh] overflow-auto p-6' }, props.children)) : null; }
    function DialogContent(props) { return React.createElement('div', { className: props.className || '' }, props.children); }
    function DialogHeader(props) { return React.createElement('div', { className: 'mb-4 ' + (props.className || '') }, props.children); }
    function DialogTitle(props) { return React.createElement('h2', { className: 'text-lg font-semibold ' + (props.className || '') }, props.children); }
    function Progress(props) {
      var value = props.value || 0;
      return React.createElement('div', { className: 'relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ' + (props.className || '') },
        React.createElement('div', { className: 'h-full bg-indigo-600 transition-all', style: { width: value + '%' } }));
    }
    function Slider(props) {
      return React.createElement('input', Object.assign({ type: 'range', className: 'w-full ' + (props.className || '') }, props));
    }
    function Tooltip(props) { return React.createElement(React.Fragment, null, props.children); }
    function TooltipTrigger(props) { return React.createElement('span', null, props.children); }
    function TooltipContent(props) { return null; }
    function TooltipProvider(props) { return React.createElement(React.Fragment, null, props.children); }

    function waitForDeps() {
      return new Promise(function(resolve) {
        function check() {
          if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined' && typeof Babel !== 'undefined' && typeof tailwind !== 'undefined') {
            resolve();
          } else {
            setTimeout(check, 50);
          }
        }
        check();
      });
    }

    function showError(msg) {
      document.getElementById('root').innerHTML = '<div id="error-display">' +
        msg.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
      window.parent.postMessage({ type: 'app-preview-error', error: msg }, '*');
    }

    async function main() {
      await waitForDeps();
      var rawCode = \`${escapedCode}\`;

      try {
        var transpiled = Babel.transform(rawCode, {
          presets: ['react'],
          filename: 'App.jsx'
        }).code;

        var moduleExports = {};
        var wrappedCode = '(function(React, useState, useEffect, useRef, useCallback, useMemo, exports, Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Textarea, Select, Label, Separator, Avatar, AvatarFallback, ScrollArea, Switch, Dialog, DialogContent, DialogHeader, DialogTitle, Progress, Slider, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider) {' +
          'var {useState, useEffect, useRef, useCallback, useMemo, Fragment, createElement} = React;\\n' +
          transpiled + '\\n' +
          'if (typeof App !== "undefined") exports.default = App;\\n' +
          '})';

        var factory = eval(wrappedCode);
        factory(
          React, React.useState, React.useEffect, React.useRef, React.useCallback, React.useMemo,
          moduleExports, Button, Input, CardComponent, CardHeader, CardTitle, CardDescription, CardContent, Badge,
          Tabs, TabsList, TabsTrigger, TabsContent, Textarea, Select, Label, Separator,
          Avatar, AvatarFallback, ScrollArea, Switch, Dialog, DialogContent, DialogHeader, DialogTitle,
          Progress, Slider, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
        );

        var AppComponent = moduleExports.default;

        if (!AppComponent) {
          var funcNames = transpiled.match(/function\\s+(\\w+)\\s*\\(/g);
          if (funcNames) {
            for (var i = 0; i < funcNames.length; i++) {
              var name = funcNames[i].match(/function\\s+(\\w+)/)[1];
              try {
                var testExports = {};
                var testCode = '(function(React, exports, Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge) {' +
                  'var {useState, useEffect, useRef, useCallback, useMemo} = React;\\n' +
                  transpiled + '\\n' +
                  'exports.default = ' + name + ';\\n' +
                  '})';
                eval(testCode)(React, testExports, Button, Input, CardComponent, CardHeader, CardTitle, CardDescription, CardContent, Badge);
                if (typeof testExports.default === 'function') {
                  AppComponent = testExports.default;
                  break;
                }
              } catch(e) { /* try next */ }
            }
          }
        }

        if (AppComponent) {
          var root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(AppComponent));
        } else {
          showError('Could not find a React component in the generated code.');
        }
      } catch(e) {
        showError('Failed to render app: ' + e.message + '\\n\\nStack: ' + (e.stack || ''));
      }
    }

    main();
  <\/script>
</body>
</html>`;
}

function buildStandaloneHtml(code: string): string {
  const cleaned = cleanCode(code);
  const escapedCode = cleaned
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>App</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
  <script src="https://unpkg.com/@babel/standalone@7.26.10/babel.min.js" crossorigin><\/script>
  <script>
    function Button(props) {
      var variant = props.variant || 'default';
      var baseClass = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
      var cls = variant === 'outline' ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm' : 'bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 text-sm';
      return React.createElement('button', Object.assign({}, props, { className: (baseClass + ' ' + cls + ' ' + (props.className || '')).trim() }), props.children);
    }
    function Input(props) {
      return React.createElement('input', Object.assign({ className: 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ' + (props.className || '') }, props));
    }
    function CardComponent(props) { return React.createElement('div', { className: 'rounded-lg border border-gray-200 bg-white shadow-sm ' + (props.className || '') }, props.children); }
    function CardHeader(props) { return React.createElement('div', { className: 'flex flex-col space-y-1.5 p-6 ' + (props.className || '') }, props.children); }
    function CardTitle(props) { return React.createElement('h3', { className: 'text-2xl font-semibold leading-none tracking-tight ' + (props.className || '') }, props.children); }
    function CardDescription(props) { return React.createElement('p', { className: 'text-sm text-gray-500 ' + (props.className || '') }, props.children); }
    function CardContent(props) { return React.createElement('div', { className: 'p-6 pt-0 ' + (props.className || '') }, props.children); }
    function Badge(props) {
      var variant = props.variant || 'default';
      var cls = variant === 'secondary' ? 'bg-gray-100 text-gray-800' : variant === 'outline' ? 'border border-gray-200 text-gray-700' : 'bg-indigo-100 text-indigo-800';
      return React.createElement('span', { className: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ' + cls + ' ' + (props.className || '') }, props.children);
    }

    function waitForDeps() {
      return new Promise(function(resolve) {
        function check() {
          if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined' && typeof Babel !== 'undefined') resolve();
          else setTimeout(check, 50);
        }
        check();
      });
    }

    async function main() {
      await waitForDeps();
      var rawCode = \`${escapedCode}\`;
      try {
        var transpiled = Babel.transform(rawCode, { presets: ['react'], filename: 'App.jsx' }).code;
        var moduleExports = {};
        var wrappedCode = '(function(React, exports, Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge) {' +
          'var {useState, useEffect, useRef, useCallback, useMemo} = React;\\n' +
          transpiled + '\\n' +
          'if (typeof App !== "undefined") exports.default = App;\\n' +
          '})';
        eval(wrappedCode)(React, moduleExports, Button, Input, CardComponent, CardHeader, CardTitle, CardDescription, CardContent, Badge);
        var AppComponent = moduleExports.default;
        if (AppComponent) {
          ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(AppComponent));
        }
      } catch(e) {
        document.getElementById('root').innerHTML = '<div style="padding:20px;color:red">Error: ' + e.message + '</div>';
      }
    }
    main();
  <\/script>
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
  const [streamingCode, setStreamingCode] = useState("");
  const [editInput, setEditInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<AppEditMessage[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>(appEditHistory || []);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const editInputRef = useRef<HTMLInputElement>(null);

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

  // Clear render error when code changes
  useEffect(() => {
    setRenderError(null);
  }, [appCode]);

  const previewHtml = useMemo(() => {
    if (!appCode) return "";
    return buildPreviewHtml(appCode);
  }, [appCode]);

  const handleGenerate = useCallback(async () => {
    if (appCode) {
      // Push current to undo before regenerating
      setUndoStack((prev) => [...prev.slice(-19), appCode]);
    }
    setGenerating(true);
    setStreamingCode("");
    setRenderError(null);

    try {
      const res = await fetch("/api/stream-app-v0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          context: { description, appName, features, targetUser, industry, projectGoal },
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingCode(accumulated);
      }

      if (accumulated.includes("__STREAM_ERROR__:")) {
        const errMsg = accumulated.split("__STREAM_ERROR__:")[1];
        throw new Error(errMsg || "Stream error");
      }

      const finalCode = extractCode(accumulated);
      onUpdate({ appCode: finalCode, appEditHistory: undoStack });
      setStreamingCode("");
      setConversationHistory([]);
      setIframeKey((k) => k + 1);
    } catch (err) {
      console.error("App generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [appCode, description, appName, features, targetUser, industry, projectGoal, onUpdate, undoStack]);

  const handleEdit = useCallback(async (instruction: string) => {
    if (!appCode || !instruction.trim()) return;

    setEditing(true);
    setStreamingCode("");
    setRenderError(null);

    // Push current to undo
    const newUndoStack = [...undoStack.slice(-19), appCode];
    setUndoStack(newUndoStack);

    try {
      const res = await fetch("/api/edit-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCode: appCode,
          instruction,
          history: conversationHistory,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingCode(accumulated);
      }

      if (accumulated.includes("__STREAM_ERROR__:")) {
        const errMsg = accumulated.split("__STREAM_ERROR__:")[1];
        throw new Error(errMsg || "Stream error");
      }

      const finalCode = extractCode(accumulated);
      onUpdate({ appCode: finalCode, appEditHistory: newUndoStack });
      setStreamingCode("");
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: instruction },
        { role: "assistant", content: finalCode },
      ]);
      setEditInput("");
      setIframeKey((k) => k + 1);
    } catch (err) {
      console.error("App edit failed:", err);
    } finally {
      setEditing(false);
    }
  }, [appCode, conversationHistory, onUpdate, undoStack]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const newStack = [...undoStack];
    const previousCode = newStack.pop()!;
    setUndoStack(newStack);
    onUpdate({ appCode: previousCode, appEditHistory: newStack });
    setConversationHistory((prev) => prev.slice(0, -2));
    setIframeKey((k) => k + 1);
  }, [undoStack, onUpdate]);

  const handleOpenNewTab = useCallback(() => {
    if (!appCode) return;
    const html = buildStandaloneHtml(appCode);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }, [appCode]);

  const handleAutoFix = useCallback(() => {
    if (!renderError) return;
    handleEdit(`Fix this error: ${renderError}`);
    setRenderError(null);
  }, [renderError, handleEdit]);

  // Empty state — no app code yet
  if (!appCode && !generating) {
    return (
      <Card className="p-0 mb-6 overflow-hidden">
        <div className="text-center py-16 px-6">
          <div className="text-5xl mb-4">{"\u{1F680}"}</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Build Your App
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Generate a fully functional, interactive app with AI. Includes working UI, navigation, sample data, and real interactions.
          </p>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm"
          >
            Build Your App
          </button>
        </div>
      </Card>
    );
  }

  // Generating state — show streaming code
  if (generating) {
    return (
      <Card className="p-0 mb-6 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-700">Building your app...</span>
        </div>
        <div className="bg-gray-950 p-4 overflow-auto" style={{ height: "500px" }}>
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
            {streamingCode || "Waiting for v0 response..."}
          </pre>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 mb-6 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
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
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button
            onClick={handleGenerate}
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
            className="px-3 py-1 text-xs font-medium text-amber-700 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors whitespace-nowrap"
          >
            Fix Automatically
          </button>
        </div>
      )}

      {/* Preview or Code view */}
      {viewMode === "preview" ? (
        <iframe
          key={iframeKey}
          srcDoc={previewHtml}
          style={{ width: "100%", height: "500px", border: "none", background: "#fff" }}
          sandbox="allow-scripts allow-same-origin"
          title="App Preview"
        />
      ) : (
        <div className="bg-gray-950 p-4 overflow-auto" style={{ height: "500px" }}>
          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
            {appCode}
          </pre>
        </div>
      )}

      {/* Editing streaming indicator */}
      {editing && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Applying changes...
          </div>
          {streamingCode && (
            <div className="mt-2 bg-gray-950 rounded-md p-2 max-h-24 overflow-auto">
              <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap break-all">
                {streamingCode.slice(-500)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Quick chips + edit input */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleEdit(chip)}
              disabled={editing}
              className="px-2.5 py-1 text-xs text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            ref={editInputRef}
            type="text"
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !editing && editInput.trim()) {
                handleEdit(editInput.trim());
              }
            }}
            placeholder="Describe changes to your app..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
            disabled={editing}
          />
          <button
            onClick={() => {
              if (editInput.trim()) handleEdit(editInput.trim());
            }}
            disabled={editing || !editInput.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
          >
            {editing ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Editing...
              </span>
            ) : "Edit"}
          </button>
        </div>
      </div>
    </Card>
  );
}
