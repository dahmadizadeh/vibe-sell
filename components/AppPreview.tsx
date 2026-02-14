"use client";

import { useMemo } from "react";

interface AppPreviewProps {
  code: string;
  height?: string;
}

/**
 * Clean generated code so it can execute in a non-module script context.
 * Strips export/import statements that cause SyntaxError outside ES modules.
 */
function cleanCode(raw: string): string {
  return raw
    // "export default function App" → "function App"
    .replace(/export\s+default\s+function\s+/g, "function ")
    // "export default App;" or "export default App"
    .replace(/export\s+default\s+App\s*;?/g, "")
    // Remove any other export statements
    .replace(/export\s+/g, "")
    // Remove import statements
    .replace(/^import\s+.*$/gm, "")
    .trim();
}

export function AppPreview({ code, height = "500px" }: AppPreviewProps) {
  const html = useMemo(() => {
    const cleaned = cleanCode(code);
    // Pass cleaned code as a JSON string to avoid HTML escaping issues
    const codeString = JSON.stringify(cleaned);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #root { min-height: 100vh; }
    #error {
      display: none;
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
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
  <script>
    window.onerror = function(msg, src, line, col, err) {
      var el = document.getElementById('error');
      el.style.display = 'block';
      el.textContent = 'Runtime error: ' + msg;
    };

    function tryRender() {
      var code = ${codeString};
      try {
        // Compile JSX to plain JS using Babel
        var compiled = Babel.transform(code, {
          presets: ['react'],
          filename: 'App.jsx'
        }).code;

        // Execute in a function scope so declarations are accessible
        var execCode = compiled + '\\n;(typeof App !== "undefined") ? App : null;';
        var AppComponent = new Function('React', 'ReactDOM', 'return (' + execCode + ')')(React, ReactDOM);

        if (!AppComponent) {
          // Try to find any function that looks like a component
          var match = compiled.match(/function\\s+(\\w+)\\s*\\(/);
          if (match) {
            execCode = compiled + '\\n;' + match[1];
            AppComponent = new Function('React', 'ReactDOM', 'return (' + execCode + ')')(React, ReactDOM);
          }
        }

        if (AppComponent) {
          ReactDOM.createRoot(document.getElementById('root')).render(
            React.createElement(AppComponent)
          );
        } else {
          document.getElementById('error').style.display = 'block';
          document.getElementById('error').textContent = 'Could not find App component in generated code';
        }
      } catch(e) {
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'Build error: ' + e.message;
      }
    }

    // Ensure Babel is loaded before trying to compile
    if (typeof Babel !== 'undefined') {
      tryRender();
    } else {
      var checkInterval = setInterval(function() {
        if (typeof Babel !== 'undefined') {
          clearInterval(checkInterval);
          tryRender();
        }
      }, 100);
      // Timeout after 10s
      setTimeout(function() { clearInterval(checkInterval); }, 10000);
    }
  </script>
</body>
</html>`;
  }, [code]);

  return (
    <iframe
      srcDoc={html}
      style={{
        width: "100%",
        height,
        border: "none",
        borderRadius: "12px",
        background: "#fff",
      }}
      sandbox="allow-scripts"
      title="App Preview"
    />
  );
}
