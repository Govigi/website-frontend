"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  speed: 400,
  minimum: 0.2,
  trickleSpeed: 200,
});

export default function ProgressBar() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <style jsx global>{`
        /* Global NProgress Custom Styles */
        #nprogress {
          pointer-events: none;
        }

        #nprogress .bar {
          background: linear-gradient(90deg, #16a34a, #22c55e);
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          border-radius: 0 3px 3px 0;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
          transition: width 0.3s ease-out;
        }

        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px #22c55e, 0 0 5px #16a34a;
          opacity: 1;
          transform: rotate(3deg) translate(0px, -4px);
        }

        #nprogress .spinner {
          display: none !important;
        }
      `}</style>
    </>
  );
}
