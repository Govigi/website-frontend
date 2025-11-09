import { useEffect, useState, useMemo, useRef } from "react";
import { config } from "@/libs/utils/config";

export const useOrderHistory = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const backendApi = config.backend_url;

  const fetchUserOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Token not found in localStorage");
      setLoading(false);
      return;
    }

    try {
      const parsedToken = JSON.parse(token);
      const res = await fetch(`${backendApi}/userOrders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: parsedToken }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      } else {
        console.error("Fetch failed:", data.message);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item: any) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.some((status) =>
          order.status.toLowerCase() === status.toLowerCase()
        );

      return matchesSearch && matchesStatus;
    });

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, searchTerm, selectedStatuses]);

  return {
    orders: filteredOrders,
    loading,
    searchTerm,
    setSearchTerm,
    selectedStatuses,
    setSelectedStatuses,
  };
};
