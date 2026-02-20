'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  ctaButtons?: Array<{ label: string; href: string }>;
  splineEmbed?: boolean;
}

export default function HeroSection({
  title,
  subtitle,
  ctaButtons = [],
  splineEmbed = false,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {splineEmbed && (
        <div className="absolute inset-0 z-0">
          <iframe
            src="https://my.spline.design/cybermannequin-o258TI6b1d1s0tJRxanno8VR/"
            frameBorder="0"
            width="100%"
            height="100%"
            className="opacity-30"
          />
        </div>
      )}
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-6 glow-text"
          style={{ fontFamily: 'var(--font-orbitron)' }}
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}

        {ctaButtons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {ctaButtons.map((button, index) => (
              <Link key={index} href={button.href}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                    index === 0
                      ? 'glow-border text-cyan-400 hover:text-cyan-300'
                      : 'border border-cyan-500/50 text-gray-300 hover:text-white hover:border-cyan-400'
                  }`}
                >
                  {button.label}
                </motion.button>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
