'use client';
import { insforge } from '@/lib/insforge';
import { useUser } from '@insforge/nextjs';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface CartContextType {
    cartCount: number;
    refreshCart: () => Promise<void>;
    addToCart: (productId: string) => Promise<boolean>;
    toast: { message: string; type: 'success' | 'error' | 'info' } | null;
    clearToast: () => void;
}

const CartContext = createContext<CartContextType>({
    cartCount: 0,
    refreshCart: async () => { },
    addToCart: async () => false,
    toast: null,
    clearToast: () => { },
});

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const [cartCount, setCartCount] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const clearToast = useCallback(() => setToast(null), []);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const refreshCart = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await insforge.database
                .from('cart_items')
                .select('quantity')
                .eq('user_id', user.id);

            if (!error && data) {
                setCartCount(data.reduce((sum: number, item: any) => sum + item.quantity, 0));
            }
        } catch (err) {
            console.error('Error refreshing cart count:', err);
        }
    }, [user]);

    const addToCart = useCallback(async (productId: string): Promise<boolean> => {
        if (!user) {
            showToast('Please sign in to add items to cart', 'info');
            return false;
        }

        try {
            // Check if item already exists in cart
            const { data: existing } = await insforge.database
                .from('cart_items')
                .select('id, quantity')
                .eq('user_id', user.id)
                .eq('product_id', productId)
                .maybeSingle();

            if (existing) {
                // Increment quantity
                const { error } = await insforge.database
                    .from('cart_items')
                    .update({ quantity: existing.quantity + 1 })
                    .eq('id', existing.id);

                if (error) throw error;
                showToast('Item quantity updated in cart!', 'success');
            } else {
                // Insert new item
                const { error } = await insforge.database
                    .from('cart_items')
                    .insert({
                        user_id: user.id,
                        product_id: productId,
                        quantity: 1,
                    });

                if (error) throw error;
                showToast('Added to cart!', 'success');
            }

            await refreshCart();
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast('Failed to add to cart', 'error');
            return false;
        }
    }, [user, refreshCart, showToast]);

    return (
        <CartContext.Provider value={{ cartCount, refreshCart, addToCart, toast, clearToast }}>
            {children}
        </CartContext.Provider>
    );
}
