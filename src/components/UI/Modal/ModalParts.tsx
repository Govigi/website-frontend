import { ModalPartProps } from "./types";
import { X } from "lucide-react";

interface HeaderProps extends ModalPartProps {
    closable?: boolean;
    onClose?: () => void;
}

export function Header({
    children,
    className = "",
    closable = true,
    onClose
}: HeaderProps) {
    return (
        <div 
            className={`border-b border-zinc-100 px-6 py-4 flex justify-between items-center ${className}`}
        >
            <div className="flex-1">{children}</div>

            {closable && onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                >
                    <X className="h-5 w-5" />
                </button>   
            )}

        </div>
    );
}   

export function Title({
    children,
    className = ""
}: ModalPartProps) {
    return (
        <h2
            className={`
                text-xl
                font-semibold
                ${className}
            `}
        >
            {children}
        </h2>
    );
}

export function Description({
    children,
    className = ""
}: ModalPartProps) {
    return (
        <p
            className={`
                mt-2
                text-sm
                text-gray-500
                ${className}
            `}
        >
            {children}
        </p>
    );
}

export function Body({
    children,
    className = ""
}: ModalPartProps) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
}

export function Footer({
    children,
    className = ""
}: ModalPartProps) {
    return (
        <div
            className={`
                flex
                justify-end
                gap-3
                border-t
                p-6
                ${className}
            `}
        >
            {children}
        </div>
    );
}