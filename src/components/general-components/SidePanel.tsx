"use client";

import { CaretLeftIcon } from "@phosphor-icons/react";

export default function SidePanel({
  open,
  onClose,
  title,
  children,
  width = "max-w-sm",
}) {
  return (
    <div
      className={`fixed inset-0 z-[60] ${
        open ? "pointer-events-auto" : "pointer-events-none"
      } md:z-[70]`}
      aria-hidden={!open}
    >
      <button
        aria-label="Close panel"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-[90%] ${width} bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-start gap-3 p-3 shadow-sm">
          <CaretLeftIcon size={20} weight="regular" color="gray" onClick={onClose} className="cursor-pointer" />
          <span className="text-md font-semibold">{title}</span>
        </div>
        <div className="p-4 h-[calc(100%-57px)] overflow-y-auto">
          {children}
        </div>
      </aside>
    </div>
  );
}
