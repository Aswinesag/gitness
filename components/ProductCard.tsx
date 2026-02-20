'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@insforge/nextjs';
import { useState } from 'react';

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

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { isSignedIn } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!isSignedIn) {
      alert('Please sign in to add items to cart');
      return;
    }

    if (onAddToCart) {
      setIsAdding(true);
      try {
        await onAddToCart(product.id);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const finalPrice = product.is_on_deal && product.discount_percent
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group relative glow-border rounded-lg overflow-hidden bg-black/40 backdrop-blur-sm"
    >
      {product.is_on_deal && product.discount_percent && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full text-white text-sm font-bold">
          -{product.discount_percent}%
        </div>
      )}

      <div className="relative h-64 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {product.is_on_deal && product.discount_percent && (
              <span className="text-gray-500 line-through text-sm">
                ${product.price.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-bold glow-text">
              ${finalPrice.toFixed(2)}
            </span>
          </div>
          <span className="text-xs text-gray-500 uppercase">{product.category}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full py-3 glow-border rounded-lg text-cyan-400 hover:text-cyan-300 font-semibold transition-colors disabled:opacity-50"
        >
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
}
