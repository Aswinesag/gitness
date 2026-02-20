'use client';

import { useUser } from '@insforge/nextjs';
import { motion } from 'framer-motion';

export default function AdminSettingsPage() {
    const { user } = useUser();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold glow-text mb-2" style={{ fontFamily: 'var(--font-orbitron)' }}>
                    Admin Settings
                </h1>
                <p className="text-gray-400 text-sm">Configure dashboard preferences and account security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6"
                >
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">Account Profile</h3>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl border border-cyan-400/20 shadow-lg shadow-cyan-500/10">
                            👤
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">Administrator</div>
                            <div className="text-sm text-gray-400">{user?.email || 'aswineye10@gmail.com'}</div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                            <span className="text-sm text-gray-300">Role</span>
                            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30">SUPER ADMIN</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                            <span className="text-sm text-gray-300">Access Level</span>
                            <span className="text-sm text-white font-bold">Unrestricted</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6"
                >
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-[0.2em] mb-4">Security & Logs</h3>

                    <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center gap-4 opacity-50 cursor-not-allowed">
                            <div className="text-xl">🛡️</div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white">Two-Factor Authentication</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Managed by InsForge Auth</div>
                            </div>
                            <div className="w-10 h-6 rounded-full bg-gray-800 relative">
                                <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-gray-600" />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
                            <div className="text-xl">📋</div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white">Action Logs</div>
                                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Active session</div>
                            </div>
                            <button className="text-[10px] font-bold text-amber-400 underline underline-offset-4 hover:text-amber-300 transition-colors">VIEW ALL</button>
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-600 italic">Security settings are governed by the InsForge project identity providers.</p>
                </motion.div>
            </div>
        </div>
    );
}
