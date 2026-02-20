'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const statusMessages = [
    "INITIALIZING CORE SYSTEMS...",
    "ESTABLISHING SECURE PROTOCOLS...",
    "SYNCING GAME ASSETS...",
    "CALIBRATING NEURAL INTERFACE...",
    "SYSTEMS SECURED. WELCOME."
];

export default function Preloader() {
    const [loading, setLoading] = useState(false);
    const [statusIndex, setStatusIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Only show preloader once per session
        const hasShown = sessionStorage.getItem('gitness-preloader-shown');
        if (hasShown) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Cycling status messages
        const messageInterval = setInterval(() => {
            setStatusIndex(prev => (prev < statusMessages.length - 1 ? prev + 1 : prev));
        }, 600);

        // Progress bar simulation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    sessionStorage.setItem('gitness-preloader-shown', 'true');
                    setTimeout(() => setLoading(false), 500);
                    return 100;
                }
                return prev + (Math.random() * 15);
            });
        }, 300);

        return () => {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    key="preloader"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        filter: "blur(20px)",
                        transition: { duration: 0.8, ease: "circOut" }
                    }}
                    className="fixed inset-0 z-[1000] bg-[#050509] flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    {/* Pulsing Core Glow */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"
                    />

                    {/* Logo & HUD Container */}
                    <div className="relative flex flex-col items-center">
                        {/* Rotating Rings */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-16 border border-cyan-500/10 rounded-full border-dashed"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-24 border border-amber-500/5 rounded-full"
                        />

                        {/* Logo */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <motion.h1
                                style={{ fontFamily: 'var(--font-orbitron)' }}
                                className="text-6xl font-black bg-gradient-to-r from-white via-cyan-400 to-white bg-[length:200%_auto] bg-clip-text text-transparent tracking-[0.2em] mb-4 glow-text-lg"
                                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                GITNESS
                            </motion.h1>

                            {/* Scanning Line */}
                            <motion.div
                                className="w-full h-0.5 bg-cyan-400/50 relative overflow-hidden mb-8"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.5, duration: 1 }}
                            >
                                <motion.div
                                    animate={{ left: ["-100%", "100%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_#fff]"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Status Messages */}
                        <div className="h-12 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={statusIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-cyan-400 font-bold text-[10px] tracking-[0.4em] uppercase"
                                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                                >
                                    {statusMessages[statusIndex]}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        {/* Progress Container */}
                        <div className="mt-8 w-64 h-1 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-[length:200%_100%] absolute top-0 left-0"
                            />
                        </div>
                        <div className="mt-3 flex gap-8">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-1">Load Status</span>
                                <span className="text-xs font-mono text-cyan-500/70">{Math.round(progress)}%</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-white/10 pl-8">
                                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-1">Enc Level</span>
                                <span className="text-xs font-mono text-amber-500/70">AES-256</span>
                            </div>
                        </div>
                    </div>

                    {/* Corner Borders */}
                    <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-cyan-500/20" />
                    <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-cyan-500/20" />
                    <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-cyan-500/20" />
                    <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-cyan-500/20" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
