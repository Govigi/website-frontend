"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { 
    PencilSquareIcon, 
    ArrowPathIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { config } from "../../libs/utils/config";

const BACKEND_URL = config.backend_url;

export default function VendorRequestsList() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (token) fetchRequests();
    }, [token]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BACKEND_URL}/vendors/product-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Failed to load requests.");
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || req.status.toLowerCase() === filter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'Approved':
                return <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 uppercase tracking-widest"><CheckCircleIcon className="w-3 h-3" /> Approved</span>;
            case 'Rejected':
                return <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-100 uppercase tracking-widest"><XCircleIcon className="w-3 h-3" /> Rejected</span>;
            default:
                return <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-100 uppercase tracking-widest"><ClockIcon className="w-3 h-3" /> Pending</span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono">
                <ArrowPathIcon className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Loading your submissions...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 font-mono text-gray-900">
            <Toaster position="top-center" />
            
            {/* Header */}
            <div className="mb-10 pb-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-[#10b981]">
                        Your Submissions
                    </h1>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-[0.2em]">Request Tracking System</p>
                </div>
                <button 
                    onClick={() => window.history.back()}
                    className="p-2 hover:bg-gray-50 rounded-full transition-all"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-400" />
                </button>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="SEARCH YOUR REQUESTS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 border border-gray-100 bg-gray-50/50 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 transition-all"
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full h-10 border border-gray-100 bg-gray-50/50 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-emerald-600 transition-all appearance-none"
                    >
                        <option value="all">ALL STATUS</option>
                        <option value="pending">PENDING</option>
                        <option value="approved">APPROVED</option>
                        <option value="rejected">REJECTED</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No submissions found.</span>
                    </div>
                ) : (
                    filteredRequests.map(req => (
                        <div key={req._id} className="border border-gray-100 p-4 hover:border-emerald-600 transition-all group">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-gray-50 shrink-0 border border-gray-50">
                                    {req.image?.url ? (
                                        <img src={req.image.url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                                            <ArrowPathIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="text-xs font-bold uppercase tracking-widest truncate pr-4">{req.name}</h3>
                                        <StatusBadge status={req.status} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">{req.category} • ₹{req.pricePerKg}/{req.unit}</p>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                        {req.status === 'Pending' && (
                                            <button 
                                                className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={() => {
                                                    // Redirect to edit (or open modal)
                                                    // For simplicity, we'll use the same URL but with an edit ID
                                                    window.location.href = `/vendor-product-request?token=${token}&editId=${req._id}`;
                                                }}
                                            >
                                                <PencilSquareIcon className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                    {req.adminNotes && (
                                        <div className="mt-3 p-2 bg-red-50 border-l-2 border-red-500 text-[9px] text-red-600 font-bold uppercase leading-relaxed">
                                            Admin: {req.adminNotes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
