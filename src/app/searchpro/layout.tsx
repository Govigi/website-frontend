import React, { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      {children}
    </Suspense>
  );
}