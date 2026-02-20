'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarLinks = [
    { href: '/admin', label: 'All Products', icon: '📦' },
    { href: '/admin/add', label: 'Add Product', icon: '➕' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 fixed left-0 top-0 bottom-0 bg-black/40 backdrop-blur-xl border-r border-cyan-500/20 z-50 overflow-y-auto">
            <div className="p-8">
                <Link href="/" className="block mb-10">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-2xl font-bold glow-text"
                        style={{ fontFamily: 'var(--font-orbitron)' }}
                    >
                        GITNESS
                    </motion.div>
                    <div className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase mt-1">Admin Panel</div>
                </Link>

                <nav className="space-y-2">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">{link.icon}</span>
                                <span className="font-medium text-sm tracking-wide" style={{ fontFamily: 'var(--font-rajdhani)' }}>{link.label}</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#82fff3]/5 to-[#fcc474]/5 border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-xs font-semibold text-emerald-400 lowercase tracking-wide">Syncing Assets</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
