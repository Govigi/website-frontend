"use client";

import { useState, useEffect } from "react";
import products from "../data/products";
import { useCart } from "../cartpro/CartContext";
import ProductCard from "../components/ProductCard";

export default function ViewAll() {
  const { cartItems, addToCart } = useCart();
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const openModal = (item) => {
    const inCart = cartItems.find((i) => i.id === item.id);
    setSelectedItem(item);
    setQuantity(inCart ? inCart.quantity : 1);
    setShowModal(true);
  };

  const handleAddToCart = () => {
    if (selectedItem) {
      addToCart({ ...selectedItem, quantity });
      setShowModal(false);
      setQuantity(1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };


  const modalTotal = selectedItem
    ? (parseFloat(selectedItem.price) * quantity).toFixed(2)
    : 0;

  return (
    <section className="px-6 md:px-20 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
        All Vegetables
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all">
  {products.map((item) => (
    <ProductCard key={item.id} item={item} onAddToCart={addToCart} />
  ))}
</div>


      
    </section>
  );
}
