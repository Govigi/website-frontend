"use client";

interface ProductCardProps {
  image: string;
  name: string;
  quantity: number;
}

export default function ProductCard({ image, name, quantity }: ProductCardProps) {
  return (
    <div className="flex flex-col p-3 bg-gradient-to-br from-gray-50 to-white rounded-md border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="w-full h-20 bg-white rounded-md flex items-center justify-center overflow-hidden border border-gray-200 mb-2">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain p-1"
          onError={(e) => {
            e.currentTarget.src = "/api/placeholder/64/64";
          }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <h5 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-2">
          {name}
        </h5>
        <div className="inline-flex items-center justify-center px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-200">
          {quantity} kg
        </div>
      </div>
    </div>
  );
}
