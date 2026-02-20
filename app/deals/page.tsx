'use client';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/lib/CartContext';
import { insforge } from '@/lib/insforge';
import { useAuth, useUser } from '@insforge/nextjs';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  is_on_deal?: boolean;
  discount_percent?: number;
}

export default function DealsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
      alert('Please sign in to view deals');
      return;
    }

    if (isSignedIn) {
      fetchDeals();
      startCountdown();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await insforge.database
        .from('products')
        .select('*')
        .eq('is_on_deal', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <main className="min-h-screen pt-20">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text" style={{ fontFamily: 'var(--font-orbitron)' }}>
            🔥 Limited-Time Deals 🔥
          </h1>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="glow-border rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-cyan-400">{timeLeft.days}</div>
              <div className="text-sm text-gray-400">Days</div>
            </div>
            <div className="glow-border rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-cyan-400">{timeLeft.hours}</div>
              <div className="text-sm text-gray-400">Hours</div>
            </div>
            <div className="glow-border rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-cyan-400">{timeLeft.minutes}</div>
              <div className="text-sm text-gray-400">Minutes</div>
            </div>
            <div className="glow-border rounded-lg px-6 py-4">
              <div className="text-3xl font-bold text-cyan-400">{timeLeft.seconds}</div>
              <div className="text-sm text-gray-400">Seconds</div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading deals...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No deals available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
