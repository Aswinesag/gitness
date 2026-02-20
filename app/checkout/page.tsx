'use client';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useCart } from '@/lib/CartContext';
import { insforge } from '@/lib/insforge';
import { useAuth, useUser } from '@insforge/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    products: {
        id: string;
        name: string;
        price: number;
        image?: string;
        is_on_deal?: boolean;
        discount_percent?: number;
    };
}

export default function CheckoutPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const { refreshCart } = useCart();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/');
            return;
        }
        if (isSignedIn && user) {
            fetchCart();
        }
    }, [isLoaded, isSignedIn, user, router]);

    const fetchCart = async () => {
        if (!user) return;
        try {
            const { data, error } = await insforge.database
                .from('cart_items')
                .select('*, products(id, name, price, image, is_on_deal, discount_percent)')
                .eq('user_id', user.id);

            if (error) throw error;
            setCartItems(data || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const getItemPrice = (item: CartItem) => {
        const p = item.products;
        if (p.is_on_deal && p.discount_percent) {
            return p.price * (1 - p.discount_percent / 100);
        }
        return p.price;
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + getItemPrice(item) * item.quantity,
        0
    );
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const handleStripeCheckout = async () => {
        if (!user || cartItems.length === 0) return;
        setRedirecting(true);

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems,
                    userId: user.id,
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create checkout session');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setRedirecting(false);
            alert('Something went wrong. Please try again.');
        }
    };

    const removeItem = async (cartItemId: string) => {
        try {
            await insforge.database
                .from('cart_items')
                .delete()
                .eq('id', cartItemId);
            setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
            refreshCart();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const updateQuantity = async (cartItemId: string, newQty: number) => {
        if (newQty < 1) {
            removeItem(cartItemId);
            return;
        }
        try {
            await insforge.database
                .from('cart_items')
                .update({ quantity: newQty })
                .eq('id', cartItemId);
            setCartItems((prev) =>
                prev.map((item) =>
                    item.id === cartItemId ? { ...item, quantity: newQty } : item
                )
            );
            refreshCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    if (!isLoaded || !isSignedIn) return null;

    return (
        <main className="min-h-screen pt-20 bg-[#050509]">
            <Header />
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold mb-10 glow-text text-center"
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                    Checkout
                </motion.h1>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="checkout"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid lg:grid-cols-[1fr,400px] gap-8"
                        >
                            {/* Cart Items */}
                            <div>
                                <h2
                                    className="text-xl font-bold text-white mb-6 flex items-center gap-3"
                                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                                >
                                    <span className="text-2xl">🛒</span>
                                    ORDER ITEMS ({cartItems.reduce((s, i) => s + i.quantity, 0)})
                                </h2>

                                {cartItems.length === 0 ? (
                                    <div className="text-center py-16 rounded-2xl border border-gray-800/40 bg-white/[0.02]">
                                        <p className="text-5xl mb-4 opacity-30">🛒</p>
                                        <p className="text-gray-400 mb-4">Your cart is empty</p>
                                        <button
                                            onClick={() => router.push('/store')}
                                            className="px-6 py-2.5 text-sm text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-colors"
                                        >
                                            Browse Store
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {cartItems.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-gray-800/40 hover:border-cyan-500/20 transition-all"
                                            >
                                                {/* Image */}
                                                {item.products.image && (
                                                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-800/30">
                                                        <img
                                                            src={item.products.image}
                                                            alt={item.products.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white text-sm truncate">
                                                        {item.products.name}
                                                    </h3>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        ${getItemPrice(item).toFixed(2)} each
                                                    </p>
                                                    {item.products.is_on_deal && item.products.discount_percent && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
                                                            -{item.products.discount_percent}% OFF
                                                        </span>
                                                    )}

                                                    {/* Quantity controls */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-7 h-7 rounded-md bg-white/5 border border-gray-700/40 text-gray-400 hover:text-white hover:border-gray-600 transition-all text-sm flex items-center justify-center"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="text-sm text-white w-6 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-7 h-7 rounded-md bg-white/5 border border-gray-700/40 text-gray-400 hover:text-white hover:border-gray-600 transition-all text-sm flex items-center justify-center"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Price + Remove */}
                                                <div className="text-right flex-shrink-0 flex flex-col justify-between">
                                                    <div>
                                                        {item.products.is_on_deal && item.products.discount_percent && (
                                                            <p className="text-gray-500 line-through text-xs">
                                                                ${(item.products.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        )}
                                                        <p className="font-bold text-white">
                                                            ${(getItemPrice(item) * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-gray-600 hover:text-red-400 transition-colors text-xs mt-2"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Order Summary & Pay */}
                            <div className="lg:sticky lg:top-24 h-fit">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="rounded-2xl border border-gray-800/40 bg-white/[0.02] overflow-hidden"
                                >
                                    <div className="p-6">
                                        <h3
                                            className="text-lg font-bold text-white mb-5"
                                            style={{ fontFamily: 'var(--font-rajdhani)' }}
                                        >
                                            ORDER SUMMARY
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between text-gray-400">
                                                <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                                <span className="text-white">${subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Tax (8%)</span>
                                                <span className="text-white">${tax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Delivery</span>
                                                <span className="text-emerald-400">Free</span>
                                            </div>
                                            <div className="border-t border-gray-800/50 pt-3 mt-3 flex justify-between">
                                                <span className="font-bold text-white">Total</span>
                                                <span
                                                    className="text-xl font-bold glow-text"
                                                    style={{ fontFamily: 'var(--font-orbitron)' }}
                                                >
                                                    ${total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stripe checkout button */}
                                    <div className="p-6 pt-0">
                                        <motion.button
                                            whileHover={{ scale: redirecting ? 1 : 1.02 }}
                                            whileTap={{ scale: redirecting ? 1 : 0.98 }}
                                            onClick={handleStripeCheckout}
                                            disabled={cartItems.length === 0 || redirecting}
                                            className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-[#635BFF] to-[#7B73FF] shadow-[0_0_20px_rgba(99,91,255,0.3)] hover:shadow-[0_0_30px_rgba(99,91,255,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {redirecting ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Redirecting to Stripe...
                                                </>
                                            ) : (
                                                <>
                                                    {/* Stripe icon */}
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                                                    </svg>
                                                    Pay with Stripe — ${total.toFixed(2)}
                                                </>
                                            )}
                                        </motion.button>

                                        {/* Security badges */}
                                        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                </svg>
                                                SSL Encrypted
                                            </span>
                                            <span>•</span>
                                            <span>PCI Compliant</span>
                                            <span>•</span>
                                            <span>Secure Checkout</span>
                                        </div>
                                    </div>

                                    {/* Accepted cards */}
                                    <div className="border-t border-gray-800/30 px-6 py-3 flex items-center justify-center gap-3">
                                        <span className="text-[10px] text-gray-600 uppercase tracking-wider">Accepted</span>
                                        <div className="flex gap-2">
                                            {['VISA', 'MC', 'AMEX'].map((card) => (
                                                <span
                                                    key={card}
                                                    className="px-2 py-0.5 text-[9px] font-bold bg-white/5 border border-gray-800/40 rounded text-gray-500"
                                                >
                                                    {card}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Back to store */}
                                <button
                                    onClick={() => router.push('/store')}
                                    className="w-full mt-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    ← Continue Shopping
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
            <Footer />
        </main>
    );
}
