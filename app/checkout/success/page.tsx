'use client';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@insforge/nextjs';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function SuccessContent() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshCart } = useCart();
    const [verified, setVerified] = useState(false);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/');
            return;
        }

        if (sessionId) {
            // Refresh cart count since webhook should have cleared cart
            refreshCart();
            setVerified(true);
        }
    }, [isLoaded, isSignedIn, sessionId, refreshCart, router]);

    if (!isLoaded || !isSignedIn) return null;

    return (
        <main className="min-h-screen pt-20 bg-[#050509]">
            <Header />
            <div className="container mx-auto px-4 py-20 max-w-lg text-center">
                {verified ? (
                    <>
                        {/* Success checkmark */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                            className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-[0_0_80px_rgba(52,211,153,0.4)]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-14 h-14">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl md:text-4xl font-bold mb-4 glow-text"
                            style={{ fontFamily: 'var(--font-orbitron)' }}
                        >
                            Payment Successful!
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-400 mb-8 text-lg"
                        >
                            Thank you for your purchase! Your games are now available.
                        </motion.p>

                        {/* Order details card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-2xl border border-gray-800/40 bg-white/[0.02] p-6 mb-8 text-left"
                        >
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Session</span>
                                    <span className="text-white font-mono text-xs">
                                        {sessionId?.slice(0, 20)}...
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <span className="text-emerald-400 font-medium">Paid ✓</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Delivery</span>
                                    <span className="text-cyan-400">Instant Digital</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Confetti particles */}
                        <div className="fixed inset-0 pointer-events-none overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{
                                        opacity: 1,
                                        y: -20,
                                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                                    }}
                                    animate={{
                                        opacity: 0,
                                        y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900,
                                        rotate: Math.random() * 720 - 360,
                                    }}
                                    transition={{
                                        duration: 2.5 + Math.random() * 2,
                                        delay: Math.random() * 0.8,
                                        ease: 'easeOut',
                                    }}
                                    className="absolute w-3 h-3 rounded-sm"
                                    style={{
                                        background: ['#00ffff', '#39ff14', '#ff6b6b', '#ffd93d', '#6c5ce7', '#a29bfe'][
                                            Math.floor(Math.random() * 6)
                                        ],
                                    }}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-3 justify-center"
                        >
                            <button
                                onClick={() => router.push('/store')}
                                className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,200,255,0.3)] hover:shadow-[0_0_30px_rgba(0,200,255,0.5)] transition-all"
                            >
                                Continue Shopping
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="px-8 py-3.5 rounded-xl font-medium text-sm text-gray-400 border border-gray-700/40 hover:text-white hover:border-gray-600 transition-all"
                            >
                                Back to Home
                            </button>
                        </motion.div>
                    </>
                ) : (
                    <div className="py-20">
                        <div className="w-10 h-10 mx-auto border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                        <p className="text-gray-500 mt-4">Verifying payment...</p>
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
