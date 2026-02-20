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

type Step = 'review' | 'details' | 'payment' | 'confirmation';

export default function CheckoutPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const { refreshCart } = useCart();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<Step>('review');
    const [processing, setProcessing] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        cardName: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/');
            return;
        }
        if (isSignedIn && user) {
            fetchCart();
            setFormData((prev) => ({
                ...prev,
                email: (user as any)?.primaryEmailAddress?.emailAddress || (user as any)?.email || '',
                fullName: (user as any)?.fullName || (user as any)?.name || '',
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

    const steps: { key: Step; label: string; icon: string }[] = [
        { key: 'review', label: 'Review', icon: '🛒' },
        { key: 'details', label: 'Details', icon: '📋' },
        { key: 'payment', label: 'Payment', icon: '💳' },
        { key: 'confirmation', label: 'Confirmed', icon: '✅' },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

    const validateDetails = () => {
        const e: Record<string, string> = {};
        if (!formData.fullName.trim()) e.fullName = 'Name is required';
        if (!formData.email.trim()) e.email = 'Email is required';
        if (!formData.address.trim()) e.address = 'Address is required';
        if (!formData.city.trim()) e.city = 'City is required';
        if (!formData.zipCode.trim()) e.zipCode = 'ZIP code is required';
        if (!formData.country.trim()) e.country = 'Country is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validatePayment = () => {
        const e: Record<string, string> = {};
        if (!formData.cardName.trim()) e.cardName = 'Cardholder name is required';
        if (formData.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter a valid card number';
        if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) e.cardExpiry = 'Use MM/YY format';
        if (formData.cardCvc.length < 3) e.cardCvc = 'Enter a valid CVC';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (currentStep === 'review') {
            if (cartItems.length === 0) return;
            setCurrentStep('details');
        } else if (currentStep === 'details') {
            if (validateDetails()) setCurrentStep('payment');
        } else if (currentStep === 'payment') {
            if (validatePayment()) processOrder();
        }
    };

    const handleBack = () => {
        if (currentStep === 'details') setCurrentStep('review');
        else if (currentStep === 'payment') setCurrentStep('details');
    };

    const processOrder = async () => {
        if (!user) return;
        setProcessing(true);

        try {
            // Simulate payment processing
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const { data: order, error: orderError } = await insforge.database
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: total,
                    status: 'confirmed',
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Clear cart
            await insforge.database
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);

            setOrderId(order.id);
            await refreshCart();
            setCurrentStep('confirmation');
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong during checkout. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\D/g, '').slice(0, 16);
        return v.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2);
        return v;
    };

    const handleInput = (field: string, value: string) => {
        if (field === 'cardNumber') value = formatCardNumber(value);
        if (field === 'cardExpiry') value = formatExpiry(value);
        if (field === 'cardCvc') value = value.replace(/\D/g, '').slice(0, 4);
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
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

                {/* Step indicator */}
                <div className="flex items-center justify-center mb-12 gap-0">
                    {steps.map((step, i) => (
                        <div key={step.key} className="flex items-center">
                            <motion.div
                                animate={{
                                    scale: currentStepIndex === i ? 1.1 : 1,
                                }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${i < currentStepIndex
                                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                                    : i === currentStepIndex
                                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(0,200,255,0.2)]'
                                        : 'bg-white/5 border border-gray-700/30 text-gray-500'
                                    }`}
                            >
                                <span>{step.icon}</span>
                                <span className="hidden sm:inline">{step.label}</span>
                            </motion.div>
                            {i < steps.length - 1 && (
                                <div
                                    className={`w-8 md:w-12 h-px mx-1 transition-colors duration-300 ${i < currentStepIndex ? 'bg-emerald-500/50' : 'bg-gray-700/30'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {/* STEP 1: Review */}
                        {currentStep === 'review' && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="grid lg:grid-cols-[1fr,380px] gap-8"
                            >
                                {/* Items */}
                                <div>
                                    <h2
                                        className="text-xl font-bold text-white mb-6"
                                        style={{ fontFamily: 'var(--font-rajdhani)' }}
                                    >
                                        ORDER ITEMS ({cartItems.reduce((s, i) => s + i.quantity, 0)})
                                    </h2>
                                    {cartItems.length === 0 ? (
                                        <div className="text-center py-16 rounded-2xl border border-gray-800/40 bg-white/[0.02]">
                                            <p className="text-5xl mb-4 opacity-30">🛒</p>
                                            <p className="text-gray-400">Your cart is empty</p>
                                            <button
                                                onClick={() => router.push('/store')}
                                                className="mt-4 px-6 py-2 text-sm text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-colors"
                                            >
                                                Browse Store
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {cartItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-gray-800/40 hover:border-cyan-500/20 transition-colors"
                                                >
                                                    {item.products.image && (
                                                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={item.products.image}
                                                                alt={item.products.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-white text-sm truncate">
                                                            {item.products.name}
                                                        </h3>
                                                        <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                                                        {item.products.is_on_deal && item.products.discount_percent && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
                                                                -{item.products.discount_percent}% OFF
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        {item.products.is_on_deal && item.products.discount_percent && (
                                                            <p className="text-gray-500 line-through text-xs">
                                                                ${(item.products.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        )}
                                                        <p className="font-bold text-white">
                                                            ${(getItemPrice(item) * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Order Summary */}
                                <div className="lg:sticky lg:top-24 h-fit">
                                    <div className="rounded-2xl border border-gray-800/40 bg-white/[0.02] p-6">
                                        <h3
                                            className="text-lg font-bold text-white mb-5"
                                            style={{ fontFamily: 'var(--font-rajdhani)' }}
                                        >
                                            ORDER SUMMARY
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between text-gray-400">
                                                <span>Subtotal</span>
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
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleNext}
                                            disabled={cartItems.length === 0}
                                            className="w-full mt-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,200,255,0.3)] hover:shadow-[0_0_30px_rgba(0,200,255,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Continue to Details →
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Details */}
                        {currentStep === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="max-w-2xl mx-auto"
                            >
                                <h2
                                    className="text-xl font-bold text-white mb-6"
                                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                                >
                                    BILLING & SHIPPING DETAILS
                                </h2>
                                <div className="rounded-2xl border border-gray-800/40 bg-white/[0.02] p-6 md:p-8">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        {[
                                            { key: 'fullName', label: 'Full Name', placeholder: 'John Doe', colSpan: true },
                                            { key: 'email', label: 'Email', placeholder: 'john@example.com', colSpan: true },
                                            { key: 'address', label: 'Address', placeholder: '123 Gaming Street', colSpan: true },
                                            { key: 'city', label: 'City', placeholder: 'Los Angeles' },
                                            { key: 'zipCode', label: 'ZIP Code', placeholder: '90001' },
                                            { key: 'country', label: 'Country', placeholder: 'United States', colSpan: true },
                                        ].map((field) => (
                                            <div
                                                key={field.key}
                                                className={field.colSpan ? 'sm:col-span-2' : ''}
                                            >
                                                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                                    {field.label}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={(formData as any)[field.key]}
                                                    onChange={(e) => handleInput(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors[field.key]
                                                        ? 'border-red-500/50 focus:ring-red-500/50'
                                                        : 'border-gray-700/40 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                                                        }`}
                                                />
                                                {errors[field.key] && (
                                                    <p className="text-red-400 text-xs mt-1">{errors[field.key]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        onClick={handleBack}
                                        className="px-6 py-3 rounded-xl text-sm font-medium text-gray-400 border border-gray-700/40 hover:text-white hover:border-gray-600 transition-all"
                                    >
                                        ← Back
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleNext}
                                        className="flex-1 py-3 rounded-xl font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,200,255,0.3)] hover:shadow-[0_0_30px_rgba(0,200,255,0.5)] transition-all"
                                    >
                                        Continue to Payment →
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Payment */}
                        {currentStep === 'payment' && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="max-w-2xl mx-auto"
                            >
                                <h2
                                    className="text-xl font-bold text-white mb-6"
                                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                                >
                                    PAYMENT INFORMATION
                                </h2>

                                {/* Card preview */}
                                <div className="relative mb-8 rounded-2xl overflow-hidden">
                                    <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6 md:p-8 border border-cyan-500/10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-12 h-8 rounded bg-gradient-to-br from-amber-300 to-amber-500 opacity-80" />
                                            <span className="text-gray-400 text-sm font-medium">VISA</span>
                                        </div>
                                        <div
                                            className="text-xl md:text-2xl text-white tracking-[0.2em] mb-6 font-mono"
                                        >
                                            {formData.cardNumber || '•••• •••• •••• ••••'}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <div>
                                                <p className="text-gray-500 text-[10px] uppercase mb-0.5">Card Holder</p>
                                                <p className="text-white">{formData.cardName || 'YOUR NAME'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-500 text-[10px] uppercase mb-0.5">Expires</p>
                                                <p className="text-white">{formData.cardExpiry || 'MM/YY'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-800/40 bg-white/[0.02] p-6 md:p-8">
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                                Cardholder Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.cardName}
                                                onChange={(e) => handleInput('cardName', e.target.value)}
                                                placeholder="John Doe"
                                                className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors.cardName
                                                    ? 'border-red-500/50 focus:ring-red-500/50'
                                                    : 'border-gray-700/40 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                                                    }`}
                                            />
                                            {errors.cardName && <p className="text-red-400 text-xs mt-1">{errors.cardName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                                Card Number
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.cardNumber}
                                                onChange={(e) => handleInput('cardNumber', e.target.value)}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                                className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all font-mono tracking-wider ${errors.cardNumber
                                                    ? 'border-red-500/50 focus:ring-red-500/50'
                                                    : 'border-gray-700/40 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                                                    }`}
                                            />
                                            {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                                    Expiry
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.cardExpiry}
                                                    onChange={(e) => handleInput('cardExpiry', e.target.value)}
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                    className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all font-mono ${errors.cardExpiry
                                                        ? 'border-red-500/50 focus:ring-red-500/50'
                                                        : 'border-gray-700/40 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                                                        }`}
                                                />
                                                {errors.cardExpiry && <p className="text-red-400 text-xs mt-1">{errors.cardExpiry}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">
                                                    CVC
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.cardCvc}
                                                    onChange={(e) => handleInput('cardCvc', e.target.value)}
                                                    placeholder="123"
                                                    maxLength={4}
                                                    className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all font-mono ${errors.cardCvc
                                                        ? 'border-red-500/50 focus:ring-red-500/50'
                                                        : 'border-gray-700/40 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                                                        }`}
                                                />
                                                {errors.cardCvc && <p className="text-red-400 text-xs mt-1">{errors.cardCvc}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order total reminder */}
                                <div className="mt-6 rounded-xl border border-gray-800/40 bg-white/[0.02] px-6 py-4 flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">You&apos;ll be charged</span>
                                    <span
                                        className="text-xl font-bold glow-text"
                                        style={{ fontFamily: 'var(--font-orbitron)' }}
                                    >
                                        ${total.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        onClick={handleBack}
                                        disabled={processing}
                                        className="px-6 py-3 rounded-xl text-sm font-medium text-gray-400 border border-gray-700/40 hover:text-white hover:border-gray-600 transition-all disabled:opacity-30"
                                    >
                                        ← Back
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: processing ? 1 : 1.02 }}
                                        whileTap={{ scale: processing ? 1 : 0.98 }}
                                        onClick={handleNext}
                                        disabled={processing}
                                        className="flex-1 py-3.5 rounded-xl font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing Payment...
                                            </span>
                                        ) : (
                                            `Pay $${total.toFixed(2)}`
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Confirmation */}
                        {currentStep === 'confirmation' && (
                            <motion.div
                                key="confirmation"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-lg mx-auto text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
                                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-[0_0_60px_rgba(52,211,153,0.4)]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-12 h-12">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-2xl md:text-3xl font-bold mb-3 glow-text"
                                    style={{ fontFamily: 'var(--font-orbitron)' }}
                                >
                                    Order Confirmed!
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-gray-400 mb-2"
                                >
                                    Thank you for your purchase, {formData.fullName.split(' ')[0] || 'gamer'}!
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="mt-6 mb-8 rounded-xl border border-gray-800/40 bg-white/[0.02] p-6 text-left"
                                >
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Order ID</span>
                                            <span className="text-white font-mono text-xs">{orderId?.slice(0, 8)}...</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Items</span>
                                            <span className="text-white">{cartItems.reduce((s, i) => s + i.quantity, 0)} games</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Total Paid</span>
                                            <span className="text-white font-bold">${total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status</span>
                                            <span className="text-emerald-400 font-medium">Confirmed ✓</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Delivery</span>
                                            <span className="text-cyan-400">Instant Digital</span>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="flex flex-col sm:flex-row gap-3 justify-center"
                                >
                                    <button
                                        onClick={() => router.push('/store')}
                                        className="px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,200,255,0.3)] hover:shadow-[0_0_30px_rgba(0,200,255,0.5)] transition-all"
                                    >
                                        Continue Shopping
                                    </button>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="px-8 py-3 rounded-xl font-medium text-sm text-gray-400 border border-gray-700/40 hover:text-white hover:border-gray-600 transition-all"
                                    >
                                        Back to Home
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
            <Footer />
        </main>
    );
}
