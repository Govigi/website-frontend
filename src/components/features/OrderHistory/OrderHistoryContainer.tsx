"use client";

import { useState } from "react";
import OrderHeader from "./OrderHeader";
import OrderCard from "./OrderCard";
import EmptyOrders from "./EmptyOrders";
import { useOrderHistory } from "./useOrderHistory";
import { getStatusConfig, statusFilters } from "./orderUtils";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3"></div>
      <p className="text-gray-600 text-sm">Loading orders...</p>
    </div>
  </div>
);

export default function OrderHistoryContainer() {
  const { orders, loading, searchTerm, setSearchTerm, selectedStatuses, setSelectedStatuses } =
    useOrderHistory();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white w-full">
      {/* Fixed Header - Sticky at top */}
      <div className="sticky top-0 z-40 bg-white">
        <OrderHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatuses={selectedStatuses}
          onStatusSelect={(status) => setSelectedStatuses([...selectedStatuses, status])}
          onStatusRemove={(status) =>
            setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
          }
          statusFilters={statusFilters}
        />
      </div>

      {/* Content - Let main handle scrolling */}
      <div className="w-full px-2 sm:px-4 py-4 pb-24">
        {orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-2.5">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const totalQuantity = order.items.reduce(
                (total: number, item: any) => total + item.quantityKg,
                0
              );
              const isExpanded = expandedOrder === order._id;

              return (
                <OrderCard
                  key={index}
                  order={order}
                  isExpanded={isExpanded}
                  onToggleExpand={() =>
                    setExpandedOrder(isExpanded ? null : order._id)
                  }
                  statusConfig={statusConfig}
                  StatusIcon={StatusIcon}
                  totalQuantity={totalQuantity}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
