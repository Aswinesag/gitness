'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddProductPage() {
    const [loading, setLoading] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to add product');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as any).checked : value
        }));
    };

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
                        Add New Product
                    </h1>
                    <p className="text-gray-400 text-sm">Expand the GITNESS library with a new title.</p>
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
                                    placeholder="e.g. Cyberpunk 2077"
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all outline-none text-white placeholder:text-gray-700 font-medium"
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
                                    placeholder="Enter game plot, features, and requirements..."
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all outline-none text-white placeholder:text-gray-700 font-medium resize-none"
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
                                        placeholder="59.99"
                                        className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 transition-all outline-none text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold px-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 transition-all outline-none text-white appearance-none cursor-pointer"
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
                                    placeholder="https://example.com/game-art.jpg"
                                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 transition-all outline-none text-white font-mono text-[11px]"
                                />
                                {formData.image && (
                                    <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x450?text=Invalid+Image+URL')} />
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
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            name="discount_percent"
                                            value={formData.discount_percent}
                                            onChange={handleChange}
                                            min="0"
                                            max="100"
                                            className="flex-1 bg-black border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 transition-all outline-none text-white"
                                        />
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl font-bold text-amber-500 text-sm">%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(6,182,212,0.3)' }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold tracking-[0.1em] uppercase shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><span>🚀</span> PUBLISH PRODUCT</>
                            )}
                        </motion.button>
                    </div>
                </div>
            </form>
        </div>
    );
}
