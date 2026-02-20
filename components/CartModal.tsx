'use client';
import { useCart } from '@/lib/CartContext';
import { insforge } from '@/lib/insforge';
import { useUser } from '@insforge/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface CartModalProps {
  onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
  const { user } = useUser();
  const router = useRouter();
  const { refreshCart } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await insforge.database
        .from('cart_items')
        .select('*, products(id, name, price, image)')
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }

    try {
      const { error } = await insforge.database
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId);

      if (error) throw error;
      fetchCart();
      refreshCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await insforge.database
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      fetchCart();
      refreshCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;

    setCheckingOut(true);
    try {
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.products.price * item.quantity,
        0
      );

      const { data: order, error: orderError } = await insforge.database
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: deleteError } = await insforge.database
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      refreshCart();
      alert('Order placed successfully!');
      onClose();
      router.push('/store');
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to complete checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="h-full w-full max-w-md bg-[#0a0a0f]/95 backdrop-blur-xl border-l border-cyan-500/20 flex flex-col shadow-[-20px_0_60px_rgba(0,200,255,0.05)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-cyan-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.867l1.972-8.633A.75.75 0 0 0 20.548 3H5.106m2.394 11.25l-1.394-8.978"
                />
                <circle cx="8.25" cy="20.25" r="1.5" fill="currentColor" />
                <circle cx="18.75" cy="20.25" r="1.5" fill="currentColor" />
              </svg>
              <h2
                className="text-xl font-bold glow-text"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                Your Cart
              </h2>
              {cartItems.length > 0 && (
                <span className="text-xs text-gray-500">
                  ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4 opacity-30">🛒</div>
                <p className="text-gray-400 text-lg mb-2">Your cart is empty</p>
                <p className="text-gray-600 text-sm">
                  Add some games to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="flex gap-4 p-3 rounded-xl bg-white/[0.03] border border-gray-800/50 hover:border-cyan-500/20 transition-colors"
                  >
                    {/* Image */}
                    {item.products.image && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.products.image}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {item.products.name}
                      </h3>
                      <p className="text-cyan-400 font-bold text-sm mt-0.5">
                        ${item.products.price.toFixed(2)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white/5 border border-gray-700/50 text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all text-xs"
                        >
                          −
                        </button>
                        <span className="text-sm text-white w-6 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white/5 border border-gray-700/50 text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price + Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <p className="font-bold text-white text-sm">
                        ${(item.products.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with total + checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-800/50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm">Subtotal</span>
                <span
                  className="text-2xl font-bold glow-text"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  ${total.toFixed(2)}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onClose(); router.push('/checkout'); }}
                className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(0,200,255,0.3)] hover:shadow-[0_0_30px_rgba(0,200,255,0.5)] transition-all"
              >
                Proceed to Checkout
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
