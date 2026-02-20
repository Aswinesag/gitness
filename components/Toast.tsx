'use client';
import { useCart } from '@/lib/CartContext';
import { AnimatePresence, motion } from 'framer-motion';

export default function Toast() {
    const { toast, clearToast } = useCart();

    const colors = {
        success: {
            bg: 'from-emerald-500/20 to-emerald-600/10',
            border: 'border-emerald-500/40',
            text: 'text-emerald-400',
            icon: '✓',
        },
        error: {
            bg: 'from-red-500/20 to-red-600/10',
            border: 'border-red-500/40',
            text: 'text-red-400',
            icon: '✕',
        },
        info: {
            bg: 'from-cyan-500/20 to-cyan-600/10',
            border: 'border-cyan-500/40',
            text: 'text-cyan-400',
            icon: 'ℹ',
        },
    };

    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -40, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -40, x: '-50%' }}
                    className={`fixed top-24 left-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md bg-gradient-to-r ${colors[toast.type].bg} ${colors[toast.type].border}`}
                >
                    <span className={`text-lg font-bold ${colors[toast.type].text}`}>
                        {colors[toast.type].icon}
                    </span>
                    <span className="text-sm font-medium text-white">{toast.message}</span>
                    <button
                        onClick={clearToast}
                        className="ml-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        ×
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
