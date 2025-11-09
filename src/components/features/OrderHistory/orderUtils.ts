import {
  CheckBadgeIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

export const getStatusConfig = (status: string) => {
  const configs: any = {
    delivered: {
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: CheckBadgeIcon,
    },
    cancelled: {
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: XCircleIcon,
    },
    pending: {
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      icon: ClockIcon,
    },
    shipped: {
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: TruckIcon,
    },
  };
  return configs[status.toLowerCase()] || configs.pending;
};

export const statusFilters = [
  { value: "all", label: "All Orders" },
  {
    value: "pending",
    label: "Pending",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    value: "shipped",
    label: "Shipped",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    value: "delivered",
    label: "Delivered",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];
