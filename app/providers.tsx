'use client';
import Toast from '@/components/Toast';
import { CartProvider } from '@/lib/CartContext';
import { insforge } from '@/lib/insforge';
import { InsforgeBrowserProvider } from '@insforge/nextjs';

export function InsforgeProvider({ children }: { children: React.ReactNode }) {
  return (
    <InsforgeBrowserProvider client={insforge} afterSignInUrl="/store">
      <CartProvider>
        {children}
        <Toast />
      </CartProvider>
    </InsforgeBrowserProvider>
  );
}
