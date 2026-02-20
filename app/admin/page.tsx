'use client';
import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';
import { useRouter } from 'next/navigation';
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
  created_at: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await insforge.database
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      setDeleteConfirm(null);
      fetchProducts();
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold glow-text" style={{ fontFamily: 'var(--font-orbitron)' }}>
          All Products
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/admin/add')}
          className="px-6 py-3 glow-border rounded-lg text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          Add New Product
        </motion.button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No products found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="text-left p-4 text-cyan-400">Name</th>
                <th className="text-left p-4 text-cyan-400">Category</th>
                <th className="text-left p-4 text-cyan-400">Price</th>
                <th className="text-left p-4 text-cyan-400">Deal</th>
                <th className="text-left p-4 text-cyan-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-cyan-500/10 hover:bg-black/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-white">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-400 line-clamp-1">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{product.category}</td>
                  <td className="p-4 text-gray-300">${product.price.toFixed(2)}</td>
                  <td className="p-4">
                    {product.is_on_deal ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                        {product.discount_percent}% OFF
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => router.push(`/admin/edit/${product.id}`)}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteConfirm(product.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/90 backdrop-blur-md glow-border rounded-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4 text-white">Confirm Delete</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
              >
                Delete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 glow-border rounded text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
