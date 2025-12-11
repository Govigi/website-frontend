"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import LoginCard from "@/components/general-components/LoginCard";

export type LoginModalContextType = {
  isOpen: boolean;
  open: (opts?: { onSuccess?: () => void }) => void;
  close: () => void;
};

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const onSuccessRef = useRef<(() => void) | null>(null);

  const open = useCallback((opts?: { onSuccess?: () => void }) => {
    onSuccessRef.current = opts?.onSuccess ?? null;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // do not clear onSuccessRef immediately; allow LoginCard to call it if needed before unmount
    // but to be safe, clear it on next tick after close
    setTimeout(() => (onSuccessRef.current = null), 0);
  }, []);

  const ctx = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <LoginModalContext.Provider value={ctx}>
      {children}
      {/* Global Login Modal mount */}
      <LoginCard
        isOpen={isOpen}
        onClose={close}
        onLoginSuccess={() => {
          try {
            onSuccessRef.current?.();
          } finally {
            close();
          }
        }}
      />
    </LoginModalContext.Provider>
  );
}

export function useLoginModal(): LoginModalContextType {
  const ctx = useContext(LoginModalContext);
  if (!ctx) {
    throw new Error("useLoginModal must be used within a LoginModalProvider");
    }
  return ctx;
}
