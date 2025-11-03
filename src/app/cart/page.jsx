"use client";

import { useRouter } from "next/navigation";
import CartComponent from "@/components/general-components/CartComponent";

export default function CartPage() {
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="max-w-xl mx-auto pb-20 md:pb-0 px-4">
      <CartComponent variant="full" />
    </div>
  );
}
