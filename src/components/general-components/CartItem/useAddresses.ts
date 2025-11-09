import { useAuth } from "@/libs/context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { config } from "@/libs/utils/config";

export const useAddresses = () => {
    const { logout } = useAuth();
    const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
    const [addresses, setAddresses] = useState<any[]>([]);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const parsedToken = JSON.parse(token);
                const backendApi = config.backend_url;
                const res = await axios.post(`${backendApi}/getAddress`, { token: parsedToken });
                const fetchedAddresses = res.data?.addresses || [];
                setAddresses(fetchedAddresses);
                if (fetchedAddresses.length > 0) {
                    setSelectedAddress(0);
                }
            }
        } catch (err) {
            console.error("Failed to fetch addresses", err);
            if ((err as any).response?.status === 500) logout();
        }
    };

    return {
        selectedAddress,
        setSelectedAddress,
        addresses,
        fetchAddresses,
    };
};
