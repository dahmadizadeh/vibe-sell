"use client";

import { useMemo } from "react";

interface AppPreviewProps {
  code: string;
  height?: string;
}

export function AppPreview({ code, height = "500px" }: AppPreviewProps) {
  const html = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #root { min-height: 100vh; }
    #error { display: none; padding: 24px; color: #dc2626; font-family: monospace; font-size: 13px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error"></div>
  <script type="text/babel" data-type="module">
    try {
      ${code}

      const AppComponent = typeof App !== 'undefined' ? App : (typeof module !== 'undefined' && module.exports ? module.exports : null);
      if (AppComponent) {
        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(AppComponent));
      } else {
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'No App component found';
      }
    } catch (e) {
      document.getElementById('error').style.display = 'block';
      document.getElementById('error').textContent = 'Render error: ' + e.message;
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
