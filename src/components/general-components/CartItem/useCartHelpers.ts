import axios from "axios";
import { config } from "@/libs/utils/config";

export const useCartHelpers = () => {
    const getItemPrice = (item: any) => item?.price ?? item?.product?.price ?? 0;
    const getItemName = (item: any) => item?.name || item?.product?.name || "Product";
    const getItemQuantity = (item: any) => item?.quantity ?? 1;
    const getItemImage = (item: any) =>
        item?.image?.url || item?.product?.image?.url || "/placeholder-product.png";

    const calculateCartTotals = (cartItems: any[]) => {
        const subtotal = cartItems.reduce(
            (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
            0
        );
        const delivery = subtotal > 500 ? 0 : 50;
        const total = subtotal + delivery;
        const totalQuantity = cartItems.reduce((sum, item) => sum + getItemQuantity(item), 0);

        return { subtotal, delivery, total, totalQuantity };
    };

    const buildOrderPayload = (
        selectedAddr: any,
        cartItems: any[],
        token: any
    ) => {
        return {
            token,
            phone: selectedAddr?.contact ?? "",
            name: selectedAddr?.name ?? "",
            email: selectedAddr?.email ?? "",
            address: {
                city: selectedAddr?.city,
                landmark: selectedAddr?.landmark,
                state: selectedAddr?.state,
                pincode: selectedAddr?.pincode,
                fullAddress: `${selectedAddr?.landmark || ""}, ${selectedAddr?.city}, ${selectedAddr?.state} - ${selectedAddr?.pincode}`,
            },
            items: cartItems.map((item) => ({
                productId: item._id,
                name: getItemName(item),
                quantityKg: getItemQuantity(item),
                image: getItemImage(item),
                price: getItemPrice(item),
            })),
            totalAmount: cartItems.reduce(
                (total, item) => total + getItemQuantity(item) * getItemPrice(item),
                0
            ),
            scheduledDate: new Date().toISOString().split("T")[0],
        };
    };

    const submitOrder = async (orderPayload: any) => {
        const backendApi = config.backend_url;
        const res = await axios.post(`${backendApi}/createOrder`, orderPayload);
        return res;
    };

    return {
        getItemPrice,
        getItemName,
        getItemQuantity,
        getItemImage,
        calculateCartTotals,
        buildOrderPayload,
        submitOrder,
    };
};
