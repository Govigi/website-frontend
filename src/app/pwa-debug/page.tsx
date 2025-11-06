"use client";

import { useEffect, useState } from "react";

export default function PWADebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPWA = async () => {
      const info: any = {};

      // 1. Check if manifest exists
      try {
        const manifestResponse = await fetch("/manifest.json");
        info.manifestStatus = manifestResponse.ok ? "✅ FOUND" : "❌ NOT FOUND";
        if (manifestResponse.ok) {
          info.manifest = await manifestResponse.json();
        }
      } catch (err) {
        info.manifestStatus = `❌ ERROR: ${err}`;
      }

      // 2. Check if service worker exists
      try {
        const swResponse = await fetch("/sw.js");
        info.swStatus = swResponse.ok ? "✅ FOUND" : "❌ NOT FOUND";
      } catch (err) {
        info.swStatus = `❌ ERROR: ${err}`;
      }

      // 3. Check icons
      const iconSizes = ["192", "512"];
      info.icons = {};
      for (const size of iconSizes) {
        try {
          const response = await fetch(`/icon-${size}.png`);
          info.icons[`icon-${size}.png`] = response.ok ? "✅ FOUND" : "❌ NOT FOUND";
        } catch (err) {
          info.icons[`icon-${size}.png`] = `❌ ERROR`;
        }
      }

      // 4. Check Service Worker registration
      if ("serviceWorker" in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          info.swRegistrations = registrations.length > 0 ? `✅ ${registrations.length} registered` : "❌ None registered";
          if (registrations.length > 0) {
            info.swDetails = registrations.map(reg => ({
              scope: reg.scope,
              active: reg.active ? "✅ Active" : "⏳ Pending",
            }));
          }
        } catch (err) {
          info.swRegistrations = `❌ ERROR: ${err}`;
        }
      } else {
        info.swRegistrations = "❌ Not supported";
      }

      // 5. Check HTTPS
      info.https = window.location.protocol === "https:" ? "✅ HTTPS" : "⚠️ HTTP (install won't work in production)";

      // 6. Check manifest link in head
      const manifestLink = document.querySelector('link[rel="manifest"]');
      info.manifestLink = manifestLink ? `✅ Found: ${manifestLink.getAttribute("href")}` : "❌ Not found";

      // 7. Check viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      info.viewport = viewport ? "✅ Found" : "❌ Not found";

      // 8. Check theme color
      const themeColor = document.querySelector('meta[name="theme-color"]');
      info.themeColor = themeColor ? `✅ ${themeColor.getAttribute("content")}` : "❌ Not found";

      setDebugInfo(info);
      setLoading(false);
    };

    checkPWA();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Checking PWA configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-green-600 mb-8">🔍 PWA Debug Check</h1>

          {/* Manifest Status */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-xl font-bold mb-2">📄 Manifest</h2>
            <p className="text-lg">{debugInfo.manifestStatus}</p>
            {debugInfo.manifest && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-gray-600">View manifest details</summary>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-auto">
                  {JSON.stringify(debugInfo.manifest, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Service Worker Status */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-xl font-bold mb-2">🔧 Service Worker</h2>
            <p className="text-lg">{debugInfo.swStatus}</p>
            <p className="text-lg mt-2">{debugInfo.swRegistrations}</p>
            {debugInfo.swDetails && (
              <div className="mt-3 text-sm">
                {debugInfo.swDetails.map((detail: any, idx: number) => (
                  <div key={idx} className="bg-blue-50 p-2 rounded mb-2">
                    <p><strong>Scope:</strong> {detail.scope}</p>
                    <p><strong>Status:</strong> {detail.active}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Icons Status */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-xl font-bold mb-2">🎨 Icons</h2>
            {Object.entries(debugInfo.icons || {}).map(([icon, status]: [string, any]) => (
              <p key={icon} className="text-lg">
                {icon}: {status}
              </p>
            ))}
          </div>

          {/* Head Tags */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-xl font-bold mb-2">🏷️ Head Tags</h2>
            <p className="text-lg mb-2">{debugInfo.manifestLink}</p>
            <p className="text-lg mb-2">{debugInfo.viewport}</p>
            <p className="text-lg mb-2">{debugInfo.themeColor}</p>
          </div>

          {/* Connection */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-xl font-bold mb-2">🔐 Connection</h2>
            <p className="text-lg">{debugInfo.https}</p>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-700 mb-3">⚠️ Important Notes</h2>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>✅ All items should show GREEN checkmarks</li>
              <li>⚠️ HTTP won&apos;t show install prompt (localhost is OK for testing)</li>
              <li>📱 Mobile Chrome usually shows prompt after 2-3 visits</li>
              <li>🔄 Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)</li>
              <li>🗑️ Clear site data from Chrome: Settings → Cookies → {window.location.hostname}</li>
              <li>📖 Check DevTools Console for any error messages</li>
            </ul>
          </div>

          {/* Manual Install Button */}
          <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h2 className="text-xl font-bold text-blue-700 mb-3">💡 Manual Installation</h2>
            <p className="text-sm text-gray-700 mb-4">
              If automatic prompt doesn&apos;t show, you can manually install:
            </p>
            <button
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(registrations => {
                    if (registrations.length > 0) {
                      alert("✅ Service Worker is registered and ready!\n\nOn mobile:\n- Android: Open Chrome menu → Install app\n- iOS: Tap Share → Add to Home Screen");
                    } else {
                      alert("❌ Service Worker not registered yet. Please refresh the page.");
                    }
                  });
                }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
            >
              Check Installation Status
            </button>
          </div>

          {/* Open DevTools */}
          <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
            <h2 className="text-xl font-bold text-purple-700 mb-2">📋 DevTools Check</h2>
            <p className="text-sm text-gray-700 mb-3">Open Browser DevTools and check:</p>
            <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
              <li><strong>Application</strong> tab → <strong>Manifest</strong></li>
              <li><strong>Application</strong> tab → <strong>Service Workers</strong></li>
              <li><strong>Console</strong> tab for any error messages</li>
              <li><strong>Network</strong> tab - ensure manifest.json and sw.js load (200 status)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
