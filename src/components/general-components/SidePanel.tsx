"use client";

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
      {/* Backdrop */}
      <button
        aria-label="Close panel"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Right drawer */}
      <aside
        className={`absolute right-0 top-0 h-full w-[90%] ${width} bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* <div className="flex items-center justify-between p-3 shadow-sm">
          <span className="text-base font-bold">{title}</span>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Close panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div> */}
        <div className="p-4 h-[calc(100%-57px)] overflow-y-auto">
          {children}
        </div>
      </aside>
    </div>
  );
}
