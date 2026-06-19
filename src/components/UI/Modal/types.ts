import { ReactNode } from "react";

export type ModalSize =
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "full";

export interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

export interface ModalContentProps {
    children: ReactNode;
    size?: ModalSize;
    closeOnOverlay?: boolean;
    className?: string;
}

export interface ModalPartProps {
    children: ReactNode;
    className?: string;
}