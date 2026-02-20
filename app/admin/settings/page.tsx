'use client';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold glow-text mb-8" style={{ fontFamily: 'var(--font-orbitron)' }}>
        Settings
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glow-border rounded-lg p-6"
      >
        <p className="text-gray-300">
          Admin settings page. Additional configuration options can be added here.
        </p>
      </motion.div>
    </div>
  );
}
