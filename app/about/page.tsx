'use client';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection
        title="About GITNESS"
        subtitle="Your ultimate destination for premium gaming experiences"
      />
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold mb-6 glow-text" style={{ fontFamily: 'var(--font-orbitron)' }}>
            Our Mission
          </h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            GITNESS is a futuristic gaming store dedicated to bringing you the latest and greatest
            games, exclusive deals, and premium gaming experiences. We believe in leveling up your
            gaming journey with cutting-edge technology and exceptional service.
          </p>
          <Link href="/store">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 glow-border rounded-lg text-cyan-400 hover:text-cyan-300 font-semibold text-lg transition-colors"
            >
              Visit the Store
            </motion.button>
          </Link>
        </motion.div>
      </section>
      <Footer />
    </main>
  );
}
