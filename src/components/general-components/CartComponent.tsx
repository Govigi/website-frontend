"use client";

import { useState } from "react";
import { useCart } from "../core/Cart/CartContext";
import { useAuth } from "@/libs/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalBottomPanel } from "@/components/core/BottomPanel";

// Sub-components
import CartItemsList from "./CartItem/CartItemsList";
import EmptyCart from "./CartItem/EmptyCart";
import CheckoutBar from "./CartItem/CheckoutBar";
import PreviewSummary from "./CartItem/PreviewSummary";
import AddressPanel from "./CartItem/AddressPanel";

// Hooks
import { useCartHelpers } from "./CartItem/useCartHelpers";
import { useAddresses } from "./CartItem/useAddresses";
import { usePlaceOrder } from "./CartItem/usePlaceOrder";
import { useCartAuthAlert } from "./CartItem/useCartAuthAlert";

interface CartComponentProps {
    variant?: "full" | "preview";
}


export default function CartComponent({ variant = "preview" }: CartComponentProps) {
    const { cartItems, incrementQuantity, decreaseQuantity, updateQuantity, removeFromCart } =
        useCart();
    const { isAuthenticated } = useAuth();
    const { openPanel: globalOpenPanel, closePanel: globalClosePanel } =
        useGlobalBottomPanel();
    const router = useRouter();

    const { getItemPrice, getItemName, getItemQuantity, getItemImage, calculateCartTotals } =
        useCartHelpers();
    const { selectedAddress, setSelectedAddress, addresses } = useAddresses();
    const { isPlacingOrder, handlePlaceOrder } = usePlaceOrder();

    const [inputValues, setInputValues] = useState<Record<number, string>>({});

    useCartAuthAlert(isAuthenticated, variant);


    // Empty cart handling
    if (!cartItems?.length) {
        return <EmptyCart variant={variant} />;
    }

    const { totalQuantity } = calculateCartTotals(cartItems);

    const handleInputChange = (index: number, value: string) => {
        setInputValues((prev) => ({
            ...prev,
            [index]: value,
        }));
    };

    const handleInputBlur = (index: number, value: string) => {
        setInputValues((prev) => {
            const newState = { ...prev };
            delete newState[index];
            return newState;
        });

        if (value === "") {
            removeFromCart(cartItems[index]);
        } else {
            const newQty = Number(value);
            if (!Number.isNaN(newQty) && newQty > 0) {
                updateQuantity(cartItems[index], newQty);
            } else if (newQty === 0 || Number.isNaN(newQty)) {
                removeFromCart(cartItems[index]);
            }
        }
    };

    const handleOpenAddressPanel = () => {
        const panel = (
            <AddressPanel
                addresses={addresses}
                selectedAddress={selectedAddress}
                onSelectAddress={(idx) => {
                    setSelectedAddress(idx);
                    setTimeout(() => globalClosePanel(), 300);
                }}
            />
        );
        globalOpenPanel("Select Delivery Address", panel);
    };

    const handlePlaceOrderClick = async () => {
        await handlePlaceOrder(
            selectedAddress,
            addresses,
            cartItems,
            () => {
                alert("Order placed successfully!");
                setTimeout(() => {
                    router.push("/ordershistory");
                }, 1000);
            },
            (error) => {
                alert(error);
            }
        );
    };

    return (
        <div className={variant === "full" ? "flex flex-col h-full bg-white" : "space-y-3"}>
            <div className={variant === "full" ? "flex-1 overflow-y-auto pb-32" : ""}>
                <CartItemsList
                    cartItems={cartItems}
                    variant={variant}
                    inputValues={inputValues}
                    onInputChange={handleInputChange}
                    onInputBlur={handleInputBlur}
                    onDecrement={decreaseQuantity}
                    onIncrement={incrementQuantity}
                    onRemove={removeFromCart}
                    getItemImage={getItemImage}
                    getItemName={getItemName}
                    getItemQuantity={getItemQuantity}
                />
            </div>

            {variant === "full" && (
                <CheckoutBar
                    isAuthenticated={isAuthenticated}
                    selectedAddress={selectedAddress}
                    addresses={addresses}
                    isPlacingOrder={isPlacingOrder}
                    onChangeAddress={handleOpenAddressPanel}
                    onAddMore={() => router.push("/webapp")}
                    onPlaceOrder={handlePlaceOrderClick}
                />
            )}

            {variant === "preview" && (
                <PreviewSummary cartItemsCount={cartItems.length} totalQuantity={totalQuantity} />
            )}
        </div>
    );
}