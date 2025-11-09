import { useState } from "react";
import { useCartHelpers } from "./useCartHelpers";

export const usePlaceOrder = () => {
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const { buildOrderPayload, submitOrder } = useCartHelpers();

    const handlePlaceOrder = async (
        selectedAddress: number | null,
        addresses: any[],
        cartItems: any[],
        onSuccess: () => void,
        onError: (message: string) => void
    ) => {
        if (selectedAddress === null || !addresses[selectedAddress]) {
            onError("Please select a delivery address");
            return;
        }

        if (cartItems.length === 0) {
            onError("Your cart is empty");
            return;
        }

        setIsPlacingOrder(true);

        try {
            const token = localStorage.getItem("token");
            const selectedAddr = addresses[selectedAddress];

            const orderPayload = buildOrderPayload(
                selectedAddr,
                cartItems,
                token ? JSON.parse(token) : null
            );

            const res = await submitOrder(orderPayload);

            if (res.status === 200 || res.status === 201) {
                localStorage.removeItem("cart");
                onSuccess();
            }
        } catch (err: any) {
            console.error("Failed to place order", err);
            onError(err.response?.data?.message || "Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return {
        isPlacingOrder,
        handlePlaceOrder,
    };
};
