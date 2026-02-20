'use client';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useCart } from '@/lib/CartContext';
import { insforge } from '@/lib/insforge';
import { useAuth, useUser } from '@insforge/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CONFETTI_COLORS = ['#00ffff', '#39ff14', '#ff6b6b', '#ffd93d', '#6c5ce7', '#a29bfe', '#fd79a8', '#00cec9'];

function ConfettiParticle({ index }: { index: number }) {
    const style = useMemo(() => ({
        left: `${Math.random() * 100}%`,
        background: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        width: `${6 + Math.random() * 8}px`,
        height: `${6 + Math.random() * 8}px`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    }), [index]);

    return (
        <motion.div
            initial={{ opacity: 1, y: -30, rotate: 0, scale: 1 }}
            animate={{
                opacity: [1, 1, 0],
                y: [0, 400, 800],
                rotate: Math.random() * 1080 - 540,
                x: (Math.random() - 0.5) * 200,
                scale: [1, 1.2, 0.3],
            }}
            transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 1.5,
                ease: 'easeOut',
            }}
            className="absolute"
            style={style}
        />
    );
}

function SuccessContent() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshCart } = useCart();

    const [error, setError] = useState<string | null>(null);
    const [verified, setVerified] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [orderData, setOrderData] = useState<any>(null);
    const [showConfetti, setShowConfetti] = useState(true);
    const [copied, setCopied] = useState(false);
    const [xp] = useState(() => Math.floor(Math.random() * 300) + 200);
    const [xpAnimated, setXpAnimated] = useState(0);
    const [showXpBar, setShowXpBar] = useState(false);

    const sessionId = searchParams.get('session_id');
    const displayName = (user as any)?.fullName || (user as any)?.name || orderData?.customer_details?.name || 'Gamer';
    const firstName = displayName.split(' ')[0];

    const hasProcessed = useRef(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/');
            return;
        }

        if (!sessionId || !user || hasProcessed.current) {
            if (!sessionId && isLoaded) {
                setVerifying(false);
                setError('No session ID found. Please check your order details.');
            }
            return;
        }
        hasProcessed.current = true;

        const processOrder = async () => {
            setVerifying(true);
            setError(null);
            try {
                // Fetch session details from our new API
                const resp = await fetch(`/api/retrieve-session/${sessionId}`);
                if (!resp.ok) {
                    const errorData = await resp.json();
                    throw new Error(errorData.error || 'Failed to verify session');
                }
                const data = await resp.json();

                if (data.error) throw new Error(data.error);

                setOrderData(data);

                // Clear cart items from database
                await insforge.database
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id);

                // Refresh cart count in header
                refreshCart();
                setVerified(true);
            } catch (err: any) {
                console.error('Error processing post-payment:', err);
                setError(err.message || 'Something went wrong while verifying your payment.');
                setVerified(false);
            } finally {
                setVerifying(false);
            }
        };

        processOrder();
    }, [isLoaded, isSignedIn, sessionId, user, router]); // eslint-disable-line react-hooks/exhaustive-deps

    // Animate XP counter
    useEffect(() => {
        if (!verified) return;
        const timer = setTimeout(() => setShowXpBar(true), 1200);
        return () => clearTimeout(timer);
    }, [verified]);

    useEffect(() => {
        if (!showXpBar) return;
        let frame: number;
        const start = Date.now();
        const duration = 1500;
        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setXpAnimated(Math.floor(eased * xp));
            if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [showXpBar, xp]);

    // Stop confetti after 5 seconds
    useEffect(() => {
        if (verified) {
            const t = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(t);
        }
    }, [verified]);

    const copyOrderId = useCallback(() => {
        if (sessionId) {
            navigator.clipboard.writeText(sessionId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [sessionId]);

    if (!isLoaded || !isSignedIn) return null;

    return (
        <main className="min-h-screen pt-20 bg-[#050509] relative overflow-hidden">
            <Header />

            {/* Background pulse */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.15, 0] }}
                    transition={{ duration: 3, delay: 0.5 }}
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500 blur-[150px]"
                />
            </div>

            {/* Confetti layer */}
            <AnimatePresence>
                {showConfetti && verified && (
                    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                        {[...Array(40)].map((_, i) => (
                            <ConfettiParticle key={i} index={i} />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4 py-16 max-w-2xl relative z-10">
                {verifying ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                        <p className="text-gray-400 font-medium animate-pulse">Verifying your payment...</p>
                    </div>
                ) : verified ? (
                    <>
                        {/* ... Success badge with ring animation code ... */}
                        <div className="relative mx-auto w-32 h-32 mb-8">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: [1, 1.5, 1.3], opacity: [0.6, 0, 0] }}
                                transition={{ duration: 2, delay: 0.3, repeat: 2 }}
                                className="absolute inset-0 rounded-full border-2 border-emerald-400"
                            />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 8, stiffness: 80 }}
                                className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_100px_rgba(52,211,153,0.5)]"
                            >
                                <motion.svg
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="white"
                                    className="w-16 h-16"
                                >
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.6, delay: 0.5 }}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 12.75l6 6 9-13.5"
                                    />
                                </motion.svg>
                            </motion.div>
                        </div>

                        {/* Heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-center mb-10"
                        >
                            <h1
                                className="text-3xl md:text-5xl font-bold mb-3 glow-text"
                                style={{ fontFamily: 'var(--font-orbitron)' }}
                            >
                                Thank You, {firstName}!
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Your order is confirmed and your games are ready!
                            </p>
                        </motion.div>

                        {/* XP Reward Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.03] p-5 mb-6"
                        >
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.5, delay: 1.5 }}
                                    className="text-4xl"
                                >
                                    🏆
                                </motion.div>
                                <div className="flex-1">
                                    <p className="text-amber-400 font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                        Reward Earned
                                    </p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span
                                            className="text-3xl font-bold text-white"
                                            style={{ fontFamily: 'var(--font-orbitron)' }}
                                        >
                                            +{xpAnimated}
                                        </span>
                                        <span className="text-amber-400/70 text-sm font-medium">XP</span>
                                    </div>
                                    {showXpBar && (
                                        <div className="mt-2 w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                animate={{ width: `${Math.min((xpAnimated / 500) * 100, 100)}%` }}
                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Order details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            className="rounded-2xl border border-gray-800/40 bg-white/[0.02] overflow-hidden mb-6"
                        >
                            <div className="px-6 py-4 border-b border-gray-800/30 flex items-center justify-between">
                                <h3
                                    className="text-sm font-bold text-white uppercase tracking-wider"
                                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                                >
                                    Order Details
                                </h3>
                                <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20">
                                    CONFIRMED
                                </span>
                            </div>
                            <div className="p-6 space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Order Reference</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-mono text-xs bg-white/5 px-2.5 py-1 rounded-md">
                                            {sessionId?.slice(0, 16)}...
                                        </span>
                                        <button
                                            onClick={copyOrderId}
                                            className="text-gray-600 hover:text-cyan-400 transition-colors"
                                            title="Copy order ID"
                                        >
                                            {copied ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-400">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Paid</span>
                                    <span className="text-white font-bold">
                                        ${orderData?.amount_total ? (orderData.amount_total / 100).toFixed(2) : '--.--'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment Status</span>
                                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        {orderData?.status === 'paid' ? 'Success' : 'Pending'} via Stripe
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Delivery</span>
                                    <span className="text-cyan-400">Instant Digital</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date</span>
                                    <span className="text-white">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* What's next tips */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            className="rounded-2xl border border-gray-800/40 bg-white/[0.02] p-6 mb-8"
                        >
                            <h3
                                className="text-sm font-bold text-white mb-4 uppercase tracking-wider"
                                style={{ fontFamily: 'var(--font-rajdhani)' }}
                            >
                                What&apos;s Next?
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { icon: '📧', text: 'A confirmation email has been sent to your inbox' },
                                    { icon: '🎮', text: 'Your game keys are ready — check your library' },
                                    { icon: '⬇️', text: 'Download and install from your platform' },
                                    { icon: '🚀', text: 'Launch the game and start playing!' },
                                ].map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.4 + i * 0.1 }}
                                        className="flex items-center gap-3 text-sm"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-white/5 border border-gray-800/40 flex items-center justify-center text-base flex-shrink-0">
                                            {step.icon}
                                        </span>
                                        <span className="text-gray-400">{step.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Action buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6 }}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <motion.button
                                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(0,200,255,0.4)' }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => router.push('/store')}
                                className="flex-1 py-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,200,255,0.3)] transition-all flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                                </svg>
                                Continue Shopping
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => router.push('/deals')}
                                className="flex-1 py-4 rounded-xl font-semibold text-sm text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                <span>🏷️</span>
                                Browse Deals
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => router.push('/')}
                                className="flex-1 py-4 rounded-xl font-medium text-sm text-gray-400 border border-gray-700/40 hover:text-white hover:border-gray-600 transition-all"
                            >
                                Back to Home
                            </motion.button>
                        </motion.div>
                    </>
                ) : (
                    <div className="py-20 text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-12 h-12 mx-auto border-2 border-cyan-500/30 border-t-cyan-400 rounded-full"
                        />
                        <p className="text-gray-500 mt-6">Verifying your payment...</p>
                        <p className="text-gray-600 text-sm mt-2">This won&apos;t take long</p>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen pt-20 bg-[#050509] flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                </main>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
