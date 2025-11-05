"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { BottomPanel } from "./BottomPanel";

interface BottomPanelContextType {
  isOpen: boolean;
  isClosing: boolean;
  title: string;
  content: ReactNode;
  openPanel: (title: string, content: ReactNode, options?: Partial<BottomPanelOptions>) => void;
  closePanel: () => void;
  resetPanel: () => void;
  maxHeight: string;
  showHandle: boolean;
  showCloseButton: boolean;
  closeOnBackdropClick: boolean;
  className?: string;
}

export interface BottomPanelOptions {
  maxHeight?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

const BottomPanelContext = createContext<BottomPanelContextType | undefined>(undefined);

export function BottomPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<BottomPanelOptions>({
    maxHeight: "90vh",
    showHandle: true,
    showCloseButton: true,
    closeOnBackdropClick: true,
    className: "",
  });

  const openPanel = useCallback(
    (panelTitle: string, panelContent: ReactNode, panelOptions?: Partial<BottomPanelOptions>) => {
      setTitle(panelTitle);
      setContent(panelContent);
      setOptions((prev) => ({ ...prev, ...panelOptions }));
      setIsOpen(true);
      setIsClosing(false);
    },
    []
  );

  const closePanel = useCallback(() => {
    setIsClosing(true);
    // Wait for animation to complete (300ms)
    const timer = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      // Reset content after panel closes
      setTitle("");
      setContent(null);
      setOptions({
        maxHeight: "90vh",
        showHandle: true,
        showCloseButton: true,
        closeOnBackdropClick: true,
        className: "",
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const resetPanel = useCallback(() => {
    setIsOpen(false);
    setIsClosing(false);
    setTitle("");
    setContent(null);
    setOptions({
      maxHeight: "90vh",
      showHandle: true,
      showCloseButton: true,
      closeOnBackdropClick: true,
      className: "",
    });
  }, []);

  const handleBackdropClick = () => {
    if (options.closeOnBackdropClick) {
      closePanel();
    }
  };

  const value: BottomPanelContextType = {
    isOpen,
    isClosing,
    title,
    content,
    openPanel,
    closePanel,
    resetPanel,
    maxHeight: options.maxHeight || "90vh",
    showHandle: options.showHandle !== false,
    showCloseButton: options.showCloseButton !== false,
    closeOnBackdropClick: options.closeOnBackdropClick !== false,
    className: options.className,
  };

  return (
    <BottomPanelContext.Provider value={value}>
      {children}
      {/* Global BottomPanel Component */}
      <BottomPanel
        isOpen={isOpen}
        isClosing={isClosing}
        onClose={closePanel}
        title={title}
        maxHeight={options.maxHeight || "90vh"}
        showHandle={options.showHandle !== false}
        showCloseButton={options.showCloseButton !== false}
        closeOnBackdropClick={options.closeOnBackdropClick !== false}
        onBackdropClick={handleBackdropClick}
        className={options.className}
      >
        {content}
      </BottomPanel>
    </BottomPanelContext.Provider>
  );
}

/**
 * Hook to access global BottomPanel
 * Use this in any component to open/close the global bottom panel
 *
 * @example
 * const { openPanel, closePanel } = useGlobalBottomPanel();
 *
 * const handleClick = () => {
 *   openPanel(
 *     "My Title",
 *     <div>Panel content here</div>,
 *     { maxHeight: "80vh" }
 *   );
 * };
 */
export function useGlobalBottomPanel() {
  const context = useContext(BottomPanelContext);
  if (!context) {
    throw new Error("useGlobalBottomPanel must be used within BottomPanelProvider");
  }
  return context;
}
