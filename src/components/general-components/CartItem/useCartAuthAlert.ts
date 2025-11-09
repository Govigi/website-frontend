import { useAuth } from "@/libs/context/AuthContext";
import { useAlert } from "@/libs/context/AlertContext";
import { useLoginModal } from "@/libs/context/LoginModalContext";
import { useEffect, useRef } from "react";

export const useCartAuthAlert = (isAuthenticated: boolean, variant: string) => {
    const { showAlert } = useAlert();
    const { open: openLoginModal } = useLoginModal();
    const alertShownRef = useRef(false);

    useEffect(() => {
        if (variant !== "full") {
            alertShownRef.current = false;
        }
    }, [variant]);

    useEffect(() => {
        if (!isAuthenticated && variant === "full" && !alertShownRef.current) {
            showAlert({
                type: "info",
                title: "Sign in to place your order",
                message: "",
                dismissible: true,
                dedupeKey: "cart-login-info",
                action: {
                    text: "Sign In",
                    onClick: () => {
                        openLoginModal();
                    },
                },
            });
            alertShownRef.current = true;
        }
    }, [isAuthenticated, variant, showAlert, openLoginModal]);
};
