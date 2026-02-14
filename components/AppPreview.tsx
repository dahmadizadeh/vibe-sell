"use client";

import { useMemo, useState } from "react";

interface AppPreviewProps {
  code: string;
  height?: string;
}

function cleanCode(raw: string): string {
  let code = raw;

  // Remove import statements
  code = code.replace(/^import\s+.*?[\r\n]+/gm, "");

  // Remove all export statements but keep the content
  // "export default function App" → "function App"
  code = code.replace(/export\s+default\s+function\s+/g, "function ");
  // "export default App" at the end
  code = code.replace(/export\s+default\s+\w+\s*;?\s*$/gm, "");
  // "export function" → "function"
  code = code.replace(/export\s+function\s+/g, "function ");
  // "export const" → "const"
  code = code.replace(/export\s+const\s+/g, "const ");
  // Any remaining "export" keywords
  code = code.replace(/^export\s+/gm, "");

  return code.trim();
}

export function AppPreview({ code, height = "500px" }: AppPreviewProps) {
  const [error, setError] = useState<string | null>(null);

  const html = useMemo(() => {
    const cleaned = cleanCode(code);
    // Escape for embedding in a JS template literal inside the HTML
    const escapedCode = cleaned
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\$/g, "\\$");

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  <div id="root"><div id="loading">Loading app preview...</div></div>

  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone@7.26.10/babel.min.js" crossorigin></script>

  <script>
    function waitForDeps() {
      return new Promise(function(resolve) {
        function check() {
          if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined' && typeof Babel !== 'undefined') {
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
        // Step 1: Transpile JSX with Babel
        var transpiled = Babel.transform(rawCode, {
          presets: ['react'],
          filename: 'App.jsx'
        }).code;

        // Step 2: Execute in a scope with React globals available
        var moduleExports = {};
        var wrappedCode = '(function(React, useState, useEffect, useRef, useCallback, useMemo, exports) {' +
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
          moduleExports
        );

        var AppComponent = moduleExports.default;

        // Fallback: find any function that looks like a component
        if (!AppComponent) {
          var funcNames = transpiled.match(/function\\s+(\\w+)\\s*\\(/g);
          if (funcNames) {
            for (var i = 0; i < funcNames.length; i++) {
              var name = funcNames[i].match(/function\\s+(\\w+)/)[1];
              try {
                var testExports = {};
                var testCode = '(function(React, exports) {' +
                  'var {useState, useEffect, useRef, useCallback, useMemo} = React;\\n' +
                  transpiled + '\\n' +
                  'exports.default = ' + name + ';\\n' +
                  '})';
                eval(testCode)(React, testExports);
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
        showError('Failed to render app: ' + e.message + '\\n\\nStack: ' + (e.stack || '') + '\\n\\nCode preview:\\n' + rawCode.slice(0, 500));
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
        title="App Preview"
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
