"use client";

import ProductCard from "./ProductCard";
import ViewMoreButton from "./ViewMoreButton";

interface ExpandedProductsProps {
  order: any;
  isExpanded: boolean;
}

export default function ExpandedProducts({ order, isExpanded }: ExpandedProductsProps) {
  if (!isExpanded) return null;

  return (
    <div 
      className="border-t border-gray-200 bg-white overflow-hidden"
      style={{
        animation: "slideDownOpen 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      }}
    >
      <div 
        className="p-4"
        style={{
          animation: "fadeIn 0.3s ease-out 0.1s backwards",
        }}
      >
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Products in Order</h4>

        <div className="grid grid-cols-3 gap-3">
          {order.items.slice(0, 2).map((item: any, itemIndex: number) => (
            <ProductCard
              key={itemIndex}
              image={item.image}
              name={item.name}
              quantity={item.quantityKg}
            />
          ))}

          <ViewMoreButton orderId={order._id} itemsCount={order.items.length} />
        </div>
      </div>
      
      <style>{`
        @keyframes slideDownOpen {
          from {
            max-height: 0;
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            max-height: 500px;
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
