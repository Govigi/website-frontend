import { createContext, useContext } from "react";

interface ModalContextType {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error(
            "Modal components must be used inside <Modal>"
        );
    }

    return context;
};

export default ModalContext;