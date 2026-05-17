import React from "react";
import VendorProductRequest from "../../components/vendor/VendorProductRequest";

export const metadata = {
    title: "Product Request | Govigi Vendor",
    description: "Submit new products for admin approval.",
};

export default function VendorProductRequestPage() {
    return (
        <VendorProductRequest />
    );
}
