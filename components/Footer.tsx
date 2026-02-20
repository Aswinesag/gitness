'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative mt-20 border-t border-cyan-500/20 bg-[#050509]"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[2fr,1fr,1fr,1fr] items-start">
          {/* Brand */}
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl neon-gradient-1 shadow-[0_0_30px_rgba(0,255,255,0.7)] flex items-center justify-center">
                <span className="text-xl font-bold text-white">G</span>
              </div>
              <span
                className="text-xl font-semibold glow-text"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                GITNESS
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Your ultimate destination for premium video games. Discover
              blockbuster titles, indie gems, and exclusive deals — all in one
              place.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="#"
                aria-label="Discord"
                className="text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Twitch"
                className="text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h4
              className="text-sm font-semibold tracking-[0.3em] text-gray-300 mb-4"
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              QUICK LINKS
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-cyan-400 transition-colors">
                  Store
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-cyan-400 transition-colors">
                  Deals
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cyan-400 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div className="text-left">
            <h4
              className="text-sm font-semibold tracking-[0.3em] text-gray-300 mb-4"
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              GENRES
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-cyan-400 transition-colors cursor-default">Action RPG</li>
              <li className="hover:text-cyan-400 transition-colors cursor-default">Action Adventure</li>
              <li className="hover:text-cyan-400 transition-colors cursor-default">Survival Horror</li>
              <li className="hover:text-cyan-400 transition-colors cursor-default">FPS</li>
              <li className="hover:text-cyan-400 transition-colors cursor-default">Roguelike</li>
              <li className="hover:text-cyan-400 transition-colors cursor-default">Metroidvania</li>
            </ul>
          </div>

          {/* Support */}
          <div className="text-left">
            <h4
              className="text-sm font-semibold tracking-[0.3em] text-gray-300 mb-4"
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              SUPPORT
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-cyan-400 transition-colors cursor-default">Help Center</li>
              <li className="hover:text-cyan-400 transition-colors cursor-default">Refund Policy</li>
              <li className="hover:text-cyan-400 transition-colors cursor-default">Privacy Policy</li>
              <li className="hover:text-cyan-400 transition-colors cursor-default">Terms of Service</li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4
                className="text-sm font-semibold tracking-wide text-white mb-1"
                style={{ fontFamily: 'var(--font-rajdhani)' }}
              >
                STAY IN THE GAME
              </h4>
              <p className="text-xs text-gray-500">
                Get notified about new releases and exclusive deals.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2.5 rounded-lg bg-white/5 border border-gray-700/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 w-full md:w-64 transition-all"
              />
              <button className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,200,255,0.3)] hover:shadow-[0_0_30px_rgba(0,200,255,0.5)] transition-all whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>
            © {year} <span className="glow-text">GITNESS</span>. All rights
            reserved.
          </p>
          <p>
            Powered by{' '}
            <a
              href="https://insforge.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              InsForge
            </a>
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
