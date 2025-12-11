import { ReactNode } from "react";

export interface BottomPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isClosing: boolean;
  title: string;
  children: ReactNode;
  maxHeight?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  onBackdropClick?: () => void;
  className?: string;
}
