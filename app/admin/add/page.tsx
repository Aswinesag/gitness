'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { motion } from 'framer-motion';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    is_on_deal: false,
    discount_percent: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await insforge.database
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          image: formData.image || null,
          category: formData.category,
          is_on_deal: formData.is_on_deal,
          discount_percent: formData.discount_percent,
        });

      if (error) throw error;

      alert('Product added successfully!');
      router.push('/admin');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold glow-text mb-8" style={{ fontFamily: 'var(--font-orbitron)' }}>
        Add New Product
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
            disabled={loading}
            className="flex-1 px-6 py-3 glow-border rounded-lg text-cyan-400 hover:text-cyan-300 font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? 'Adding...' : 'Add Product'}
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
