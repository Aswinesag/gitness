'use client';

import AdminGuard from '@/components/AdminGuard';
import AdminSidebar from '@/components/AdminSidebar';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#0a0a0a] text-white flex">
                <AdminSidebar />

                <main className="ml-64 flex-1 relative min-h-screen">
                    {/* Background decorations */}
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full" />
                    </div>

                    <div className="relative z-10 p-8 pt-10">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
