"use client";

import { useEffect, useState } from "react";

export default function PWADebugAdvanced() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [swStatus, setSwStatus] = useState<any>({});

  useEffect(() => {
    const checkPWA = async () => {
      const info: any = {};

      // 1. Check if manifest exists
      try {
        const manifestResponse = await fetch("/manifest.json");
        info.manifestStatus = manifestResponse.ok ? "✅ FOUND" : "❌ NOT FOUND";
        info.manifestHeaders = {
          contentType: manifestResponse.headers.get("content-type"),
          cacheControl: manifestResponse.headers.get("cache-control"),
          status: manifestResponse.status,
        };
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
        info.swHeaders = {
          contentType: swResponse.headers.get("content-type"),
          swAllowed: swResponse.headers.get("service-worker-allowed"),
          cacheControl: swResponse.headers.get("cache-control"),
          status: swResponse.status,
        };
      } catch (err) {
        info.swStatus = `❌ ERROR: ${err}`;
      }

      // 3. Check icons
      const iconSizes = ["192", "512"];
      info.icons = {};
      for (const size of iconSizes) {
        try {
          const response = await fetch(`/icon-${size}.png`);
          info.icons[`icon-${size}.png`] = {
            status: response.ok ? "✅ FOUND" : "❌ NOT FOUND",
            contentType: response.headers.get("content-type"),
            size: response.headers.get("content-length"),
            code: response.status,
          };
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
            info.swDetails = registrations.map((reg, idx) => ({
              scope: reg.scope,
              active: reg.active ? `✅ Active & Running` : `⏳ Pending`,
              installing: reg.installing ? "⏳ Installing..." : "None",
              waiting: reg.waiting ? "⏳ Waiting" : "None",
              controller: navigator.serviceWorker.controller ? "✅ Controlling page" : "❌ Not controlling",
              updateViaCache: reg.updateViaCache,
            }));
          }
          setSwStatus({
            registered: registrations.length > 0,
            count: registrations.length,
          });
        } catch (err) {
          info.swRegistrations = `❌ ERROR: ${err}`;
        }
      } else {
        info.swRegistrations = "❌ Not supported";
      }

      // 5. Check HTTPS
      info.https = window.location.protocol === "https:" ? "✅ HTTPS" : "⚠️ HTTP (localhost OK, production needs HTTPS)";
      info.hostname = window.location.hostname;
      info.protocol = window.location.protocol;

      // 6. Check manifest link in head
      const manifestLink = document.querySelector('link[rel="manifest"]');
      info.manifestLink = manifestLink ? `✅ Found: ${manifestLink.getAttribute("href")}` : "❌ Not found";

      // 7. Check viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      info.viewport = viewport ? `✅ Found: ${viewport.getAttribute("content")}` : "❌ Not found";

      // 8. Check theme color
      const themeColor = document.querySelector('meta[name="theme-color"]');
      info.themeColor = themeColor ? `✅ ${themeColor.getAttribute("content")}` : "❌ Not found";

      // 9. Check mobile-web-app-capable
      const mobileCapable = document.querySelector('meta[name="mobile-web-app-capable"]');
      info.mobileCapable = mobileCapable ? `✅ ${mobileCapable.getAttribute("content")}` : "❌ Not found";

      // 10. Check if app is installable
      const criteria = {
        https: window.location.protocol === "https:" || window.location.hostname === "localhost",
        manifest: !!manifestLink,
        serviceWorker: "serviceWorker" in navigator,
        viewport: !!viewport,
        displayStandalone: true, // We'd need to check manifest for this
      };

      info.installableCriteria = criteria;
      info.isInstallable = Object.values(criteria).every(v => v === true);

      setDebugInfo(info);
      setLoading(false);
    };

    checkPWA();

    // Check for beforeinstallprompt event
    const handler = (e: any) => {
      console.log("beforeinstallprompt event triggered!");
      e.preventDefault(); // Prevent automatic prompt
      console.log("Event details:", e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-green-600 mb-8">🔍 PWA Advanced Debug</h1>

          {/* Site Info */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">📍 Site Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hostname</p>
                <p className="text-lg font-mono">{debugInfo.hostname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Protocol</p>
                <p className="text-lg">{debugInfo.protocol}</p>
              </div>
            </div>
          </div>

          {/* HTTPS Status */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">🔐 Connection</h2>
            <p className="text-lg">{debugInfo.https}</p>
            {debugInfo.protocol === "http:" && debugInfo.hostname !== "localhost" && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                ⚠️ <strong>CRITICAL:</strong> Install prompt only works on HTTPS (not localhost)!
              </div>
            )}
          </div>

          {/* Manifest Status */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">📄 Manifest</h2>
            <p className="text-lg mb-3">{debugInfo.manifestStatus}</p>
            <details className="text-sm">
              <summary className="cursor-pointer font-bold mb-2">View HTTP Headers</summary>
              <div className="bg-gray-100 p-3 rounded mt-2 space-y-2">
                <p>Content-Type: {debugInfo.manifestHeaders?.contentType || "❌ Not set"}</p>
                <p>Cache-Control: {debugInfo.manifestHeaders?.cacheControl || "❌ Not set"}</p>
                <p>Status: {debugInfo.manifestHeaders?.status}</p>
              </div>
            </details>
            {debugInfo.manifest && (
              <details className="mt-3">
                <summary className="cursor-pointer font-bold">View manifest.json</summary>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.manifest, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Service Worker Status */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">🔧 Service Worker</h2>
            <p className="text-lg mb-3">{debugInfo.swStatus}</p>
            <details className="text-sm mb-3">
              <summary className="cursor-pointer font-bold mb-2">View HTTP Headers</summary>
              <div className="bg-gray-100 p-3 rounded mt-2 space-y-2">
                <p>Content-Type: {debugInfo.swHeaders?.contentType || "❌ Not set"}</p>
                <p>Service-Worker-Allowed: {debugInfo.swHeaders?.swAllowed || "❌ Not set"}</p>
                <p>Cache-Control: {debugInfo.swHeaders?.cacheControl || "❌ Not set"}</p>
                <p>Status: {debugInfo.swHeaders?.status}</p>
              </div>
            </details>
            <p className="text-lg mb-2">{debugInfo.swRegistrations}</p>
            {debugInfo.swDetails && (
              <div className="space-y-2">
                {debugInfo.swDetails.map((detail: any, idx: number) => (
                  <div key={idx} className="bg-blue-50 p-3 rounded">
                    <p><strong>Scope:</strong> {detail.scope}</p>
                    <p><strong>Status:</strong> {detail.active}</p>
                    <p><strong>Controlling:</strong> {detail.controller}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Icons Status */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">🎨 Icons</h2>
            {Object.entries(debugInfo.icons || {}).map(([icon, status]: [string, any]) => (
              <details key={icon} className="mb-2">
                <summary className="cursor-pointer font-bold">{icon} - {status.status}</summary>
                <div className="bg-gray-100 p-3 rounded mt-2 text-sm space-y-1">
                  <p>Status Code: {status.code}</p>
                  <p>Content-Type: {status.contentType}</p>
                  <p>Size: {status.size} bytes</p>
                </div>
              </details>
            ))}
          </div>

          {/* Head Tags */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">🏷️ Meta Tags</h2>
            <p className="text-lg mb-2">{debugInfo.manifestLink}</p>
            <p className="text-lg mb-2">{debugInfo.viewport}</p>
            <p className="text-lg mb-2">{debugInfo.themeColor}</p>
            <p className="text-lg">{debugInfo.mobileCapable}</p>
          </div>

          {/* Installability Criteria */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">✅ PWA Installability Criteria</h2>
            <div className="space-y-2">
              <p className={`text-lg ${debugInfo.installableCriteria?.https ? "text-green-600" : "text-red-600"}`}>
                {debugInfo.installableCriteria?.https ? "✅" : "❌"} HTTPS or localhost
              </p>
              <p className={`text-lg ${debugInfo.installableCriteria?.manifest ? "text-green-600" : "text-red-600"}`}>
                {debugInfo.installableCriteria?.manifest ? "✅" : "❌"} Manifest present
              </p>
              <p className={`text-lg ${debugInfo.installableCriteria?.serviceWorker ? "text-green-600" : "text-red-600"}`}>
                {debugInfo.installableCriteria?.serviceWorker ? "✅" : "❌"} Service Worker support
              </p>
              <p className={`text-lg ${debugInfo.installableCriteria?.viewport ? "text-green-600" : "text-red-600"}`}>
                {debugInfo.installableCriteria?.viewport ? "✅" : "❌"} Viewport meta tag
              </p>
            </div>
            <div className="mt-4 p-3 rounded text-lg font-bold">
              {debugInfo.isInstallable ? (
                <div className="bg-green-100 border-2 border-green-500 text-green-700 p-3 rounded">
                  🎉 INSTALLABLE - Site meets all PWA criteria!
                </div>
              ) : (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 rounded">
                  ❌ NOT INSTALLABLE - Check failures above
                </div>
              )}
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <h2 className="text-2xl font-bold text-yellow-700 mb-3">⚠️ Troubleshooting</h2>
            <div className="text-sm space-y-3">
              <div>
                <p className="font-bold">If no install prompt appears:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Site must be HTTPS (localhost is OK for development)</li>
                  <li>Visit site 2-3 times (Chrome learns engagement pattern)</li>
                  <li>Hard refresh: Ctrl+Shift+R or Cmd+Shift+R</li>
                  <li>Clear site data: Chrome settings → Privacy → Cookies</li>
                  <li>Check DevTools console for errors</li>
                  <li>On mobile, check Chrome menu (⋮) → &quot;Install app&quot;</li>
                </ul>
              </div>
              <div>
                <p className="font-bold">If Service Worker not active:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Check if sw.js file is accessible</li>
                  <li>Verify Service-Worker-Allowed header is set</li>
                  <li>Clear Service Workers: DevTools → Application → Storage</li>
                  <li>Hard refresh page</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h2 className="text-lg font-bold text-blue-700 mb-2">💡 Next Steps</h2>
            <ol className="text-sm space-y-2">
              <li>1. If showing ✅ INSTALLABLE - everything is ready</li>
              <li>2. Deploy to production with HTTPS enabled</li>
              <li>3. Test on mobile device (wait 2-3 visits)</li>
              <li>4. Look for &quot;Install app&quot; prompt in Chrome menu (⋮)</li>
              <li>5. On iOS, use Share → "Add to Home Screen"</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
