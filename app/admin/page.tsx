'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    is_on_deal: boolean;
    discount_percent: number;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/products');
            if (!res.ok) {
                if (res.status === 401) throw new Error('Unauthorized Access. Please sign in as admin.');
                throw new Error('Failed to fetch inventory.');
            }
            const data = await res.json();
            setProducts(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong while fetching products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/products/${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== deleteId));
                setDeleteId(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold glow-text mb-2" style={{ fontFamily: 'var(--font-orbitron)' }}>
                        All Products
                    </h1>
                    <p className="text-gray-400 text-sm">Manage your store inventory and deals.</p>
                </div>
                <Link href="/admin/add">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                    >
                        <span>➕</span> Add New Product
                    </motion.button>
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Fetching inventory...</p>
                </div>
            ) : (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                    {error ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h3 className="text-white font-bold mb-2">Fetch Error</h3>
                            <p className="text-gray-400 text-sm max-w-xs">{error}</p>
                            <button
                                onClick={fetchProducts}
                                className="mt-6 text-cyan-400 text-sm font-bold uppercase tracking-widest hover:text-cyan-300 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-32 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">📦</span>
                            </div>
                            <h3 className="text-white font-bold mb-2">No Products Found</h3>
                            <p className="text-gray-400 text-sm">Start by adding your first game to the inventory.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                                        <th className="px-6 py-5">Product</th>
                                        <th className="px-6 py-5">Category</th>
                                        <th className="px-6 py-5">Price</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {products.map((product) => (
                                        <motion.tr
                                            key={product.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* ... row data ... */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900 border border-white/5">
                                                        <img
                                                            src={product.image || 'https://via.placeholder.com/150'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-orbitron)' }}>{product.name}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono mt-1">{product.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-md bg-white/5 text-[10px] font-bold text-gray-400 border border-white/10 uppercase tracking-wider">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-white">${product.price}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.is_on_deal ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">On Deal ({product.discount_percent}%)</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Regular</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/edit/${product.id}`}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 transition-colors"
                                                            title="Edit Product"
                                                        >
                                                            ✏️
                                                        </motion.button>
                                                    </Link>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.1)' }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setDeleteId(product.id)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        🗑️
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-[#0f0f0f] border border-red-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.15)]"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <h2 className="text-xl font-bold text-center text-white mb-2" style={{ fontFamily: 'var(--font-orbitron)' }}>Delete Product?</h2>
                            <p className="text-gray-400 text-center text-sm mb-8">This action is permanent and cannot be undone. All data for this product will be lost.</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-sm tracking-wide text-gray-400 hover:bg-white/10 transition-all uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 font-bold text-sm tracking-wide text-white hover:brightness-110 shadow-lg shadow-red-500/20 transition-all uppercase disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
