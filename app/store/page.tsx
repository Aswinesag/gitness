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

export default function StorePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
      alert('Please sign in to access the store');
      return;
    }

    if (isSignedIn) {
      fetchProducts();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await insforge.database
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <main className="min-h-screen pt-20">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-8 glow-text text-center"
          style={{ fontFamily: 'var(--font-orbitron)' }}
        >
          Game Store
        </motion.h1>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No products available</div>
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
