'use client';
import { useCart } from '@/lib/CartContext';
import { SignInButton, SignUpButton, useAuth, UserButton, useUser } from '@insforge/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import CartModal from './CartModal';

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const isAdmin = (user as any)?.email === 'aswineye10@gmail.com';
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount, refreshCart } = useCart();

  useEffect(() => {
    if (isSignedIn && user) {
      refreshCart();
    }
  }, [isSignedIn, user, refreshCart]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/store', label: 'Store' },
    { href: '/deals', label: 'Deals' },
    { href: '/about', label: 'About' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-cyan-500/20"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-2xl font-bold glow-text font-heading"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              GITNESS
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 transition-colors ${pathname === link.href
                  ? 'text-cyan-400'
                  : 'text-gray-300 hover:text-cyan-400'
                  }`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCartOpen(true)}
                      className="relative p-2.5 glow-border rounded-lg text-cyan-400 hover:text-cyan-300 transition-colors"
                      aria-label="Shopping cart"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.867l1.972-8.633A.75.75 0 0 0 20.548 3H5.106m2.394 11.25l-1.394-8.978"
                        />
                        <circle cx="8.25" cy="20.25" r="1.5" fill="currentColor" />
                        <circle cx="18.75" cy="20.25" r="1.5" fill="currentColor" />
                      </svg>
                      {cartCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(0,200,255,0.6)]"
                        >
                          {cartCount > 99 ? '99+' : cartCount}
                        </motion.span>
                      )}
                    </motion.button>
                    <UserButton />
                  </>
                ) : (
                  <>
                    <SignInButton>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                      >
                        Sign In
                      </motion.button>
                    </SignInButton>
                    <SignUpButton>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 glow-border rounded-lg text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Sign Up
                      </motion.button>
                    </SignUpButton>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </motion.header>

      {cartOpen && <CartModal onClose={() => { setCartOpen(false); refreshCart(); }} />}
    </>
  );
}
