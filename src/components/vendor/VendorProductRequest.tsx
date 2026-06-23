"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { 
    PhotoIcon, 
    XMarkIcon, 
    ArrowPathIcon,
    CloudArrowUpIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { config } from "../../lib/utils/config";

const BACKEND_URL = config.backend_url;

export default function VendorProductRequest() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const editId = searchParams.get("editId");
    
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [submitted, setSubmitted] = useState(false);
    
    const [form, setForm] = useState({
        name: "",
        category: "",
        pricePerKg: "",
        stock: "",
        unit: "kg",
        description: ""
    });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            await fetchCategories();
            if (editId && token) {
                await fetchRequestData();
            }
        };
        init();
    }, [editId, token]);

    const fetchRequestData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BACKEND_URL}/vendors/product-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const request = res.data.find((r: any) => r._id === editId);
            if (request) {
                setForm({
                    name: request.name,
                    category: request.category,
                    pricePerKg: request.pricePerKg.toString(),
                    stock: request.stock.toString(),
                    unit: request.unit,
                    description: request.description || ""
                });
                if (request.image?.url) {
                    setImagePreview(request.image.url);
                }
            }
        } catch (error) {
            console.error("Error fetching request data:", error);
            toast.error("Failed to load existing request data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/getAllCategories`);
            if (Array.isArray(res.data)) {
                const activeCats = res.data.filter((cat: any) => cat.categoryStatus === "active");
                setCategories(activeCats);
                return activeCats;
            }
            return [];
        } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error("Unauthorized: Missing authentication token.");
            return;
        }

        if (!form.name || !form.category || !form.pricePerKg || !form.stock) {
            toast.error("Please fill all required fields.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });
            if (image) formData.append("image", image);

            if (editId) {
                await axios.patch(`${BACKEND_URL}/vendors/product-request/${editId}`, formData, {
                    headers: { 
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    }
                });
                toast.success("Product request updated successfully!");
            } else {
                await axios.post(`${BACKEND_URL}/vendors/add-product`, formData, {
                    headers: { 
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    }
                });
                toast.success("Product request submitted successfully!");
            }

            setSubmitted(true);
        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error(error.response?.data?.message || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 font-mono">
                <div className="max-w-md w-full text-center">
                    <CheckCircleIcon className="w-20 h-20 text-[#10b981] mx-auto mb-6" />
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900 mb-4">Submission Successful</h1>
                    <p className="text-gray-500 text-sm mb-8 uppercase tracking-wider leading-relaxed">
                        Your product request has been received and is pending admin approval. You can now close this window.
                    </p>
                    <button 
                        onClick={() => window.close()}
                        className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 font-mono text-gray-900">
            
            <div className="mb-10 pb-4 border-b border-gray-200">
                <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-[#10b981]">
                    {editId ? "Update Request" : "Product Request"}
                </h1>
                <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-[0.2em]">
                    {editId ? `Editing Entry: ${editId}` : "Catalogue Entry System"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-12 max-w-6xl">
                <div className="space-y-12">
                    {/* Core Specs */}
                    <section>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-3 mb-8">
                            Core Specifications
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Name *</label>
                                <input 
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    placeholder="ENTER PRODUCT NAME..."
                                    className="w-full h-12 border border-gray-200 bg-gray-50/30 px-4 text-xs font-bold uppercase tracking-wider outline-none focus:border-black focus:bg-white transition-all"
                                />
                            </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category *</label>
                                <select 
                                    value={form.category}
                                    onChange={e => setForm({...form, category: e.target.value})}
                                    className="w-full h-12 border border-gray-200 bg-gray-50/30 px-4 text-xs font-bold uppercase tracking-wider outline-none focus:border-black focus:bg-white transition-all appearance-none"
                                >
                                    <option value="">SELECT CATEGORY</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.categoryName}>{cat.categoryName.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</label>
                                <textarea 
                                    value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})}
                                    placeholder="TECHNICAL DETAILS AND ORIGIN..."
                                    className="w-full h-32 border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs font-bold uppercase tracking-wider outline-none focus:border-black focus:bg-white transition-all resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Commercials */}
                    <section>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-3 mb-8">
                            Commercial & Inventory
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price per Unit (₹) *</label>
                                <input 
                                    type="number"
                                    value={form.pricePerKg}
                                    onChange={e => setForm({...form, pricePerKg: e.target.value})}
                                    placeholder="0.00"
                                    className="w-full h-12 border border-gray-200 bg-gray-50/30 px-4 text-xs font-bold uppercase tracking-wider outline-none focus:border-black focus:bg-white transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Unit *</label>
                                <select 
                                    value={form.unit}
                                    onChange={e => setForm({...form, unit: e.target.value})}
                                    className="w-full h-12 border border-gray-200 bg-gray-50/30 px-4 text-xs font-bold uppercase tracking-wider outline-none focus:border-black focus:bg-white transition-all appearance-none"
                                >
                                    <option value="kg">KG</option>
                                    <option value="g">GRAM</option>
                                    <option value="pcs">PIECES</option>
                                    <option value="pack">PACK</option>
                                    <option value="ltr">LITER</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Initial Stock *</label>
                                <input 
                                    type="number"
                                    value={form.stock}
                                    onChange={e => setForm({...form, stock: e.target.value})}
                                    placeholder="0"
                                    className="w-full h-12 border border-gray-200 bg-gray-50/30 px-4 text-xs font-bold uppercase tracking-wider outline-none focus:border-black focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-12">
                    {/* Image Upload */}
                    <section>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-3 mb-8">
                            Asset Upload
                        </h2>
                        <div className="border border-dashed border-gray-200 bg-gray-50/30 p-8 text-center hover:border-black transition-all relative">
                            {imagePreview ? (
                                <div className="relative group aspect-square">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-white p-1 shadow-lg hover:bg-red-50 transition-all"
                                    >
                                        <XMarkIcon className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center">
                                    <CloudArrowUpIcon className="w-8 h-8 text-gray-300 mb-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-1">Upload Media</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">JPG, PNG (MAX 5MB)</span>
                                    <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                                </label>
                            )}
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="space-y-4 pt-8 border-t border-gray-100">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl shadow-black/10 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:bg-gray-300"
                        >
                            {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PhotoIcon className="w-4 h-4" />}
                            {loading ? "PROCESSING..." : editId ? "UPDATE REQUEST" : "SUBMIT REQUEST"}
                        </button>
                        <button 
                            type="button"
                            onClick={() => window.history.back()}
                            className="w-full border border-gray-200 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black hover:border-black transition-all"
                        >
                            DISCARD & EXIT
                        </button>
                    </div>
                </aside>
            </form>
        </div>
    );
}
