import ModalContext from "./ModalContext";
import { ModalProps } from "./types";

function Modal({
    open,
    onOpenChange,
    children
}: ModalProps) {

    return (
        <ModalContext.Provider
            value={{
                open,
                onOpenChange
            }}
        >
            {children}
        </ModalContext.Provider>
    );
}

export default Modal;