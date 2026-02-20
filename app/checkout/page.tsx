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

type Step = 'review' | 'address' | 'confirm';

const STEPS: { key: Step; label: string; icon: string }[] = [
    { key: 'review', label: 'Review', icon: '🛒' },
    { key: 'address', label: 'Details', icon: '📍' },
    { key: 'confirm', label: 'Confirm & Pay', icon: '💳' },
];

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

function InputField({ label, field, type = 'text', placeholder, half, value, error, onChange }: {
    label: string; field: string; type?: string; placeholder: string; half?: boolean;
    value: string; error?: string; onChange: (field: string, value: string) => void;
}) {
    return (
        <div className={half ? 'flex-1' : 'w-full'}>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder={placeholder}
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-white text-sm placeholder:text-gray-600 outline-none transition-all focus:ring-2 focus:ring-cyan-500/30 ${error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-gray-800/40 hover:border-gray-700/60 focus:border-cyan-500/50'}`}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
}

export default function CheckoutPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const { refreshCart } = useCart();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>('review');
    const [direction, setDirection] = useState(1);

    // Address form
    const [address, setAddress] = useState({
        fullName: '',
        email: '',
        phone: '',
        street: '',
        apartment: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saveAddress, setSaveAddress] = useState(true);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/');
            return;
        }
        if (isSignedIn && user) {
            fetchCart();
            // Pre-fill from user profile
            setAddress((prev) => ({
                ...prev,
                fullName: (user as any)?.fullName || (user as any)?.name || '',
                email: (user as any)?.primaryEmailAddress?.emailAddress || (user as any)?.email || '',
            }));
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
        if (p.is_on_deal && p.discount_percent) return p.price * (1 - p.discount_percent / 100);
        return p.price;
    };

    const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const removeItem = async (cartItemId: string) => {
        try {
            await insforge.database.from('cart_items').delete().eq('id', cartItemId);
            setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
            refreshCart();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const updateQuantity = async (cartItemId: string, newQty: number) => {
        if (newQty < 1) { removeItem(cartItemId); return; }
        try {
            await insforge.database.from('cart_items').update({ quantity: newQty }).eq('id', cartItemId);
            setCartItems((prev) => prev.map((item) => item.id === cartItemId ? { ...item, quantity: newQty } : item));
            refreshCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const goToStep = (step: Step) => {
        const stepKeys = STEPS.map((s) => s.key);
        const currentIdx = stepKeys.indexOf(currentStep);
        const nextIdx = stepKeys.indexOf(step);
        setDirection(nextIdx > currentIdx ? 1 : -1);
        setCurrentStep(step);
    };

    const validateAddress = () => {
        const newErrors: Record<string, string> = {};
        if (!address.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!address.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) newErrors.email = 'Invalid email format';
        if (!address.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!address.street.trim()) newErrors.street = 'Street address is required';
        if (!address.city.trim()) newErrors.city = 'City is required';
        if (!address.state.trim()) newErrors.state = 'State is required';
        if (!address.zip.trim()) newErrors.zip = 'ZIP code is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinueToConfirm = () => {
        if (validateAddress()) goToStep('confirm');
    };

    const handleStripeCheckout = async () => {
        if (!user || cartItems.length === 0) return;
        setRedirecting(true);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartItems, userId: user.id }),
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

    if (!isLoaded || !isSignedIn) return null;

    const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

    const handleFieldChange = (field: string, value: string) => {
        setAddress((p) => ({ ...p, [field]: value }));
        setErrors((p) => ({ ...p, [field]: '' }));
    };

    return (
        <main className="min-h-screen pt-20 bg-[#050509]">
            <Header />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold mb-8 glow-text text-center"
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                    Checkout
                </motion.h1>

                {/* Step Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-0 mb-10 max-w-md mx-auto"
                >
                    {STEPS.map((step, i) => (
                        <div key={step.key} className="flex items-center">
                            <button
                                onClick={() => {
                                    if (i < stepIndex) goToStep(step.key);
                                }}
                                disabled={i > stepIndex}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${i === stepIndex
                                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,200,255,0.1)]'
                                    : i < stepIndex
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/15'
                                        : 'text-gray-600 border border-transparent cursor-default'
                                    }`}
                            >
                                <span className="text-base">
                                    {i < stepIndex ? '✓' : step.icon}
                                </span>
                                <span className="hidden sm:inline">{step.label}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`w-8 h-px mx-1 ${i < stepIndex ? 'bg-emerald-500/40' : 'bg-gray-800/50'}`} />
                            )}
                        </div>
                    ))}
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait" custom={direction}>
                        {/* ── STEP 1: REVIEW ── */}
                        {currentStep === 'review' && (
                            <motion.div
                                key="review"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="grid lg:grid-cols-[1fr,360px] gap-8"
                            >
                                {/* Items list */}
                                <div>
                                    <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                        🛒 ORDER ITEMS ({itemCount})
                                    </h2>

                                    {cartItems.length === 0 ? (
                                        <div className="text-center py-16 rounded-2xl border border-gray-800/40 bg-white/[0.02]">
                                            <p className="text-5xl mb-4 opacity-30">🛒</p>
                                            <p className="text-gray-400 mb-4">Your cart is empty</p>
                                            <button onClick={() => router.push('/store')} className="px-6 py-2.5 text-sm text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-colors">
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
                                                    transition={{ delay: index * 0.04 }}
                                                    className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-gray-800/40 hover:border-cyan-500/20 transition-all"
                                                >
                                                    {item.products.image && (
                                                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-800/30">
                                                            <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-white text-sm truncate">{item.products.name}</h3>
                                                        <p className="text-gray-500 text-xs mt-1">${getItemPrice(item).toFixed(2)} each</p>
                                                        {item.products.is_on_deal && item.products.discount_percent && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
                                                                -{item.products.discount_percent}% OFF
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-md bg-white/5 border border-gray-700/40 text-gray-400 hover:text-white hover:border-gray-600 transition-all text-sm flex items-center justify-center">−</button>
                                                            <span className="text-sm text-white w-6 text-center font-medium">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-md bg-white/5 border border-gray-700/40 text-gray-400 hover:text-white hover:border-gray-600 transition-all text-sm flex items-center justify-center">+</button>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 flex flex-col justify-between">
                                                        <div>
                                                            {item.products.is_on_deal && item.products.discount_percent && (
                                                                <p className="text-gray-500 line-through text-xs">${(item.products.price * item.quantity).toFixed(2)}</p>
                                                            )}
                                                            <p className="font-bold text-white">${(getItemPrice(item) * item.quantity).toFixed(2)}</p>
                                                        </div>
                                                        <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors text-xs mt-2">Remove</button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar summary */}
                                <div className="lg:sticky lg:top-24 h-fit">
                                    <div className="rounded-2xl border border-gray-800/40 bg-white/[0.02] p-6">
                                        <h3 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'var(--font-rajdhani)' }}>ORDER SUMMARY</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between text-gray-400">
                                                <span>Subtotal ({itemCount} items)</span>
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
                                                <span className="text-xl font-bold glow-text" style={{ fontFamily: 'var(--font-orbitron)' }}>${total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => goToStep('address')}
                                            disabled={cartItems.length === 0}
                                            className="w-full mt-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,200,255,0.3)] hover:shadow-[0_0_30px_rgba(0,200,255,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Continue to Details →
                                        </motion.button>
                                    </div>
                                    <button onClick={() => router.push('/store')} className="w-full mt-3 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors">
                                        ← Continue Shopping
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: ADDRESS ── */}
                        {currentStep === 'address' && (
                            <motion.div
                                key="address"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="max-w-2xl mx-auto"
                            >
                                <div className="rounded-2xl border border-gray-800/40 bg-white/[0.02] overflow-hidden">
                                    {/* Header */}
                                    <div className="px-6 py-5 border-b border-gray-800/30">
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                            📍 BILLING & SHIPPING DETAILS
                                        </h2>
                                        <p className="text-gray-500 text-xs mt-1.5">All fields marked are required for order processing</p>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* Personal info */}
                                        <div>
                                            <p className="text-xs text-cyan-400/70 font-semibold uppercase tracking-widest mb-3">Contact Information</p>
                                            <div className="space-y-3">
                                                <InputField label="Full Name *" field="fullName" placeholder="John Doe" value={address.fullName} error={errors.fullName} onChange={handleFieldChange} />
                                                <div className="flex gap-3">
                                                    <InputField label="Email Address *" field="email" type="email" placeholder="john@example.com" half value={address.email} error={errors.email} onChange={handleFieldChange} />
                                                    <InputField label="Phone Number *" field="phone" type="tel" placeholder="+1 (555) 123-4567" half value={address.phone} error={errors.phone} onChange={handleFieldChange} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-gray-800/30" />

                                        {/* Address */}
                                        <div>
                                            <p className="text-xs text-cyan-400/70 font-semibold uppercase tracking-widest mb-3">Shipping Address</p>
                                            <div className="space-y-3">
                                                <InputField label="Street Address *" field="street" placeholder="123 Gaming Blvd" value={address.street} error={errors.street} onChange={handleFieldChange} />
                                                <InputField label="Apartment / Suite (optional)" field="apartment" placeholder="Apt 4B" value={address.apartment} error={errors.apartment} onChange={handleFieldChange} />
                                                <div className="flex gap-3">
                                                    <InputField label="City *" field="city" placeholder="San Francisco" half value={address.city} error={errors.city} onChange={handleFieldChange} />
                                                    <InputField label="State / Province *" field="state" placeholder="California" half value={address.state} error={errors.state} onChange={handleFieldChange} />
                                                </div>
                                                <div className="flex gap-3">
                                                    <InputField label="ZIP / Postal Code *" field="zip" placeholder="94105" half value={address.zip} error={errors.zip} onChange={handleFieldChange} />
                                                    <div className="flex-1">
                                                        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Country</label>
                                                        <select
                                                            value={address.country}
                                                            onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))}
                                                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-gray-800/40 text-white text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 hover:border-gray-700/60 appearance-none cursor-pointer"
                                                        >
                                                            {['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'India', 'Brazil', 'Other'].map((c) => (
                                                                <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Save address toggle */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <button
                                                onClick={() => setSaveAddress(!saveAddress)}
                                                className={`w-10 h-5 rounded-full transition-all relative ${saveAddress ? 'bg-cyan-500' : 'bg-gray-700'}`}
                                            >
                                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${saveAddress ? 'left-5' : 'left-0.5'}`} />
                                            </button>
                                            <span className="text-sm text-gray-400">Save this address for future orders</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="px-6 py-5 border-t border-gray-800/30 flex gap-3">
                                        <button
                                            onClick={() => goToStep('review')}
                                            className="px-6 py-3 rounded-xl text-sm font-medium text-gray-400 border border-gray-700/40 hover:text-white hover:border-gray-600 transition-all"
                                        >
                                            ← Back
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleContinueToConfirm}
                                            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,200,255,0.3)] hover:shadow-[0_0_30px_rgba(0,200,255,0.5)] transition-all"
                                        >
                                            Review Order →
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 3: CONFIRM & PAY ── */}
                        {currentStep === 'confirm' && (
                            <motion.div
                                key="confirm"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="max-w-2xl mx-auto space-y-5"
                            >
                                {/* Shipping info card */}
                                <div className="rounded-2xl border border-gray-800/40 bg-white/[0.02] overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-800/30 flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                            📍 Shipping To
                                        </h3>
                                        <button onClick={() => goToStep('address')} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                                            Edit
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-white font-medium text-sm">{address.fullName}</p>
                                        <p className="text-gray-400 text-sm mt-1">{address.street}{address.apartment ? `, ${address.apartment}` : ''}</p>
                                        <p className="text-gray-400 text-sm">{address.city}, {address.state} {address.zip}</p>
                                        <p className="text-gray-400 text-sm">{address.country}</p>
                                        <div className="mt-3 pt-3 border-t border-gray-800/30 flex gap-6 text-xs text-gray-500">
                                            <span>📧 {address.email}</span>
                                            <span>📱 {address.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order items card */}
                                <div className="rounded-2xl border border-gray-800/40 bg-white/[0.02] overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-800/30 flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                            🛒 Order Items ({itemCount})
                                        </h3>
                                        <button onClick={() => goToStep('review')} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                                            Edit Cart
                                        </button>
                                    </div>
                                    <div className="divide-y divide-gray-800/30">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                                                {item.products.image && (
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-800/30">
                                                        <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">{item.products.name}</p>
                                                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-white font-semibold text-sm">${(getItemPrice(item) * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Price breakdown + Pay */}
                                <div className="rounded-2xl border border-gray-800/40 bg-white/[0.02] overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                            💰 Payment Summary
                                        </h3>
                                        <div className="space-y-2.5 text-sm">
                                            <div className="flex justify-between text-gray-400">
                                                <span>Subtotal ({itemCount} items)</span>
                                                <span className="text-white">${subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Tax (8%)</span>
                                                <span className="text-white">${tax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Shipping</span>
                                                <span className="text-emerald-400 font-medium">FREE</span>
                                            </div>
                                            <div className="border-t border-gray-800/50 pt-3 mt-3 flex justify-between items-center">
                                                <span className="font-bold text-white text-base">Total Due</span>
                                                <span className="text-2xl font-bold glow-text" style={{ fontFamily: 'var(--font-orbitron)' }}>
                                                    ${total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pay button */}
                                    <div className="px-6 pb-6 space-y-4">
                                        <motion.button
                                            whileHover={{ scale: redirecting ? 1 : 1.02 }}
                                            whileTap={{ scale: redirecting ? 1 : 0.98 }}
                                            onClick={handleStripeCheckout}
                                            disabled={redirecting}
                                            className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-[#635BFF] to-[#7B73FF] shadow-[0_0_20px_rgba(99,91,255,0.3)] hover:shadow-[0_0_30px_rgba(99,91,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {redirecting ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Redirecting to Stripe...
                                                </>
                                            ) : (
                                                <>
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                                                    </svg>
                                                    Pay with Stripe — ${total.toFixed(2)}
                                                </>
                                            )}
                                        </motion.button>

                                        {/* Security badges */}
                                        <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600">
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
                                                <span key={card} className="px-2 py-0.5 text-[9px] font-bold bg-white/5 border border-gray-800/40 rounded text-gray-500">
                                                    {card}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Back button */}
                                <button
                                    onClick={() => goToStep('address')}
                                    className="w-full py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    ← Back to Details
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
            <Footer />
        </main>
    );
}
