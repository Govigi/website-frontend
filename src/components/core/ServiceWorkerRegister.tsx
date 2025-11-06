"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("✓ Service Worker registered successfully:", registration);
          console.log("✓ Scope:", registration.scope);
          console.log("✓ PWA is ready for installation on mobile browsers");
          
          // Check if service worker is active
          if (registration.active) {
            console.log("✓ Service Worker is active and controlling");
            registration.active.postMessage({ type: "CLIENTS_CLAIM" });
          }

          // If waiting, try to activate it
          if (registration.waiting) {
            console.log("⏳ Service Worker waiting, skipping...");
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log("✓ New Service Worker installed");
                }
              });
            }
          });

          // Force controller check
          if (!navigator.serviceWorker.controller) {
            console.log("⏳ SW registered but not controlling yet - will control on next page load");
          } else {
            console.log("✓ Service Worker is NOW controlling this page");
          }
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
