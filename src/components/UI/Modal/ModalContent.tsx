import { useEffect } from "react";
import { ModalContentProps } from "./types";
import { useModal } from "./ModalContext";

const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    full: "max-w-7xl"
};

export default function ModalContent({
    children,
    size = "lg",
    closeOnOverlay = true,
    className = ""
}: ModalContentProps) {

    const { open, onOpenChange } = useModal();

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => {
                if (closeOnOverlay) {
                    onOpenChange(false);
                }
            }}
        >
            <div
                className={`
                    w-full
                    rounded-2xl
                    bg-white
                    shadow-xl
                    ${className}
                    ${sizeClasses[size]}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}