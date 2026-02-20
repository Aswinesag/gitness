'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@insforge/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const ADMIN_EMAIL = 'aswineye10@gmail.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/');
        alert('Access denied. Admin only.');
      }
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'All Products' },
    { href: '/admin/add', label: 'Add Product' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        <motion.aside
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          className="w-64 bg-black/50 backdrop-blur-sm border-r border-cyan-500/20 min-h-screen p-6"
        >
          <h1 className="text-2xl font-bold glow-text mb-8" style={{ fontFamily: 'var(--font-orbitron)' }}>
            Admin Dashboard
          </h1>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'glow-border text-cyan-400'
                    : 'text-gray-400 hover:text-cyan-400 hover:bg-black/30'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </motion.aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
