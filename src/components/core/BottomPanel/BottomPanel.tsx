"use client";

import { BottomPanelProps } from "./types";

/**
 * Global Bottom Panel Component
 *
 * A reusable, animated bottom sheet modal for displaying content on mobile devices.
 * Handles all animation logic, backdrop interactions, and consistent styling.
 *
 * @example
 * import { useBottomPanel } from "@/components/core/BottomPanel/useBottomPanel";
 * import { BottomPanel } from "@/components/core/BottomPanel/BottomPanel";
 *
 * export default function MyPage() {
 *   const { isOpen, isClosing, open, close } = useBottomPanel();
 *
 *   return (
 *     <>
 *       <button onClick={open}>Open Panel</button>
 *
 *       <BottomPanel
 *         isOpen={isOpen}
 *         isClosing={isClosing}
 *         onClose={close}
 *         title="My Panel"
 *       >
 *         <div className="p-4">Your content here</div>
 *       </BottomPanel>
 *     </>
 *   );
 * }
 */
export function BottomPanel({
  isOpen,
  onClose,
  isClosing,
  title,
  children,
  maxHeight = "90vh",
  showHandle = true,
  showCloseButton = true,
  closeOnBackdropClick = true,
  onBackdropClick,
  className,
}: BottomPanelProps) {
  // Don't render if not open
  if (!isOpen && !isClosing) {
    return null;
  }

  const handleBackdropClick = () => {
    if (onBackdropClick) {
      onBackdropClick();
    }
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/30 z-[9999] md:hidden flex items-end ${
        isClosing ? "animate-fade-out" : "animate-fade-in"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white w-full rounded-t-2xl overflow-y-auto ${
          isClosing ? "animate-slide-down" : "animate-slide-up"
        } ${className}`}
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        {showHandle && (
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}

        {/* Header */}
        <div className="px-4 pb-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close panel"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
