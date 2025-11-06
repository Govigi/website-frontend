"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✓ Service Worker registered successfully:", registration);
          console.log("✓ Scope:", registration.scope);
          console.log("✓ PWA is ready for installation on mobile browsers");
          
          // Check if service worker is active
          if (registration.active) {
            console.log("✓ Service Worker is active");
          }

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log("✓ Service Worker update found");
          });
        })
        .catch((error) => {
          console.error("✗ Service Worker registration failed:", error);
          console.error("Make sure sw.js is accessible at /sw.js");
        });

      // Check if manifest is loaded
      const manifest = document.querySelector('link[rel="manifest"]');
      if (manifest) {
        console.log("✓ Manifest file found:", manifest.getAttribute('href'));
      } else {
        console.warn("⚠ Manifest file not found in head");
      }
    }
  }, []);

  return null;
}
