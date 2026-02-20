'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  is_on_deal: boolean;
  discount_percent: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    is_on_deal: false,
    discount_percent: 0,
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await insforge.database
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price.toString(),
          image: data.image || '',
          category: data.category,
          is_on_deal: data.is_on_deal || false,
          discount_percent: data.discount_percent || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to fetch product');
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await insforge.database
        .from('products')
        .update({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          image: formData.image || null,
          category: formData.category,
          is_on_deal: formData.is_on_deal,
          discount_percent: formData.discount_percent,
        })
        .eq('id', productId);

      if (error) throw error;

      alert('Product updated successfully!');
      router.push('/admin');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading product...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold glow-text mb-8" style={{ fontFamily: 'var(--font-orbitron)' }}>
        Edit Product
      </h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="block text-gray-300 mb-2">Product Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2">Price *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Category *</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Image URL</label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-4 py-3 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={formData.is_on_deal}
              onChange={(e) => setFormData({ ...formData, is_on_deal: e.target.checked })}
              className="w-5 h-5"
            />
            On Deal
          </label>
        </div>

        {formData.is_on_deal && (
          <div>
            <label className="block text-gray-300 mb-2">Discount Percent</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discount_percent}
              onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-black/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        )}

        <div className="flex gap-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={saving}
            className="flex-1 px-6 py-3 glow-border rounded-lg text-cyan-400 hover:text-cyan-300 font-semibold disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin')}
            className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
