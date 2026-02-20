'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

interface Props {
    params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'FPS',
        image: '',
        is_on_deal: false,
        discount_percent: '0',
    });
    const router = useRouter();

    const categories = ['FPS', 'RPG', 'Adventure', 'Sports', 'Racing', 'Strategy', 'Indie'];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // We'll fetch from the products list API filtering by ID for convenience
                // or use a dedicated GET /api/products/[id] if we had one.
                // Since our /api/products returns all, we'll find the specific one.
                const res = await fetch('/api/products');
                const products = await res.json();
                const product = products.find((p: any) => p.id === id);

                if (product) {
                    setFormData({
                        name: product.name,
                        description: product.description || '',
                        price: product.price.toString(),
                        category: product.category,
                        image: product.image || '',
                        is_on_deal: product.is_on_deal || false,
                        discount_percent: (product.discount_percent || 0).toString(),
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update product');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as any).checked : value
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-medium">Loading product data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all shadow-sm"
                    >
                        ⬅️
                    </motion.button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold glow-text mb-1" style={{ fontFamily: 'var(--font-orbitron)' }}>
                        Edit Product
                    </h1>
                    <p className="text-gray-400 text-sm">Update {formData.name} details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
                            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">General Info</h3>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold px-1">Product Name</label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 shadow-sm transition-all outline-none text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold px-1">Description</label>
                                <textarea
                                    required
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 transition-all outline-none text-white resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold px-1">Price ($)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 transition-all outline-none text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold px-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 transition-all outline-none text-white cursor-pointer"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Media & Promotion */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
                            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-[0.2em] mb-4">Media & Promotion</h3>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold px-1">Image URL</label>
                                <input
                                    required
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 transition-all outline-none text-white font-mono text-[11px]"
                                />
                                {formData.image && (
                                    <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="is_on_deal"
                                            checked={formData.is_on_deal}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded-md border-white/10 bg-black text-amber-500 focus:ring-amber-500/50 cursor-pointer"
                                        />
                                        <span className="text-sm font-bold text-gray-300 tracking-wide uppercase" style={{ fontFamily: 'var(--font-rajdhani)' }}>Enable Deal/Promotion</span>
                                    </div>
                                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">OFFER</span>
                                </div>

                                <div className={formData.is_on_deal ? 'opacity-100 h-auto overflow-hidden transition-all duration-300' : 'opacity-30 pointer-events-none h-20 overflow-hidden'}>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold px-1">Discount Percent (%)</label>
                                    <input
                                        type="number"
                                        name="discount_percent"
                                        value={formData.discount_percent}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        className="w-full bg-black border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 transition-all outline-none text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={saving}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(6,182,212,0.3)' }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold tracking-[0.1em] uppercase shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><span>💾</span> SAVE CHANGES</>
                            )}
                        </motion.button>

                        <button
                            type="button"
                            onClick={() => router.push('/admin')}
                            className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-bold tracking-[0.1em] uppercase border border-white/10 hover:bg-white/10 hover:text-white transition-all text-xs"
                        >
                            Discard Changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
