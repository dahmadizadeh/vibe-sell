"use client";

import { useMemo, useState } from "react";

interface LandingPagePreviewProps {
  code: string;
  height?: string;
}

function cleanCode(raw: string): string {
  let code = raw;

  // Remove import statements
  code = code.replace(/^import\s+.*?[\r\n]+/gm, "");

  // Remove all export statements but keep the content
  code = code.replace(/export\s+default\s+function\s+/g, "function ");
  code = code.replace(/export\s+default\s+\w+\s*;?\s*$/gm, "");
  code = code.replace(/export\s+function\s+/g, "function ");
  code = code.replace(/export\s+const\s+/g, "const ");
  code = code.replace(/^export\s+/gm, "");

  return code.trim();
}

export function LandingPagePreview({ code, height = "600px" }: LandingPagePreviewProps) {
  const [error, setError] = useState<string | null>(null);

  const html = useMemo(() => {
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
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; }
    #root { min-height: 100vh; }
    #error-display {
      padding: 20px;
      margin: 20px;
      color: #dc2626;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    #loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="root"><div id="loading">Loading landing page preview...</div></div>

  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone@7.26.10/babel.min.js" crossorigin></script>

  <script>
    // Stub components for common shadcn/ui patterns that v0 might reference
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
      window.parent.postMessage({ type: 'landing-preview-error', error: msg }, '*');
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
        var wrappedCode = '(function(React, useState, useEffect, useRef, useCallback, useMemo, exports, Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge) {' +
          'var {useState, useEffect, useRef, useCallback, useMemo, Fragment, createElement} = React;\\n' +
          transpiled + '\\n' +
          'if (typeof App !== "undefined") exports.default = App;\\n' +
          '})';

        var factory = eval(wrappedCode);
        factory(
          React,
          React.useState,
          React.useEffect,
          React.useRef,
          React.useCallback,
          React.useMemo,
          moduleExports,
          Button,
          Input,
          CardComponent,
          CardHeader,
          CardTitle,
          CardDescription,
          CardContent,
          Badge
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
          showError('Could not find a React component in the generated code.\\n\\nTranspiled code:\\n' + transpiled.slice(0, 500));
        }
      } catch(e) {
        showError('Failed to render landing page: ' + e.message + '\\n\\nStack: ' + (e.stack || '') + '\\n\\nCode preview:\\n' + rawCode.slice(0, 500));
      }
    }

    main();
  </script>
</body>
</html>`;
  }, [code]);

  return (
    <div>
      <iframe
        srcDoc={html}
        style={{
          width: "100%",
          height,
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          background: "#fff",
        }}
        sandbox="allow-scripts allow-same-origin"
        title="Landing Page Preview"
        onError={() => setError("iframe failed to load")}
      />
      {error && (
        <div style={{ color: "red", fontSize: 12, marginTop: 8 }}>
          Preview error: {error}
        </div>
      )}
    </div>
  );
}
