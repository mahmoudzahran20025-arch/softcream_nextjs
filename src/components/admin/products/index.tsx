// src/components/admin/products/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import type { Product } from '@/lib/adminApi';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getProductConfiguration, 
  updateProductCustomization 
} from '@/lib/adminApi';
import type { ProductsPageProps, ProductFormData, ProductConfig } from './types';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import ConfigModal from './ConfigModal';

const ProductsPage: React.FC<ProductsPageProps> = ({ onRefresh, onUpdate, onDelete }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [productConfig, setProductConfig] = useState<ProductConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('❌ فشل تحميل المنتجات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        calories: parseInt(formData.calories) || 0,
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fat: parseFloat(formData.fat) || 0,
        sugar: parseFloat(formData.sugar) || 0,
        fiber: parseFloat(formData.fiber) || 0,
        energy_score: parseInt(formData.energy_score) || 0,
        energy_type: formData.energy_type as 'mental' | 'physical' | 'balanced' | 'none' | undefined
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        const updatedProduct = { ...editingProduct, ...productData };
        setProducts(products.map(p => 
          p.id === editingProduct.id ? updatedProduct : p
        ));
        onUpdate?.(updatedProduct);
        alert('✅ تم تحديث المنتج بنجاح');
      } else {
        await createProduct(productData);
        alert('✅ تم إنشاء المنتج بنجاح');
        await loadProducts();
      }
      
      setShowCreateModal(false);
      setEditingProduct(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('❌ فشل حفظ المنتج');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowCreateModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      onDelete?.(productId);
      alert('✅ تم حذف المنتج بنجاح');
      onRefresh?.();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('❌ فشل حذف المنتج');
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const newAvailability = product.available === 1 ? 0 : 1;
      await updateProduct(product.id, { ...product, available: newAvailability });
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, available: newAvailability } : p
      ));
      alert(`✅ تم ${newAvailability === 1 ? 'تفعيل' : 'تعطيل'} المنتج`);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert('❌ فشل تغيير حالة المنتج');
    }
  };

  const openConfigModal = async (product: Product) => {
    setConfigProduct(product);
    setShowConfigModal(true);
    setLoadingConfig(true);
    
    try {
      const response = await getProductConfiguration(product.id);
      if (response.success) {
        setProductConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load product configuration:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleUpdateProductType = async (productType: string) => {
    if (!configProduct) return;
    
    try {
      const isCustomizable = productType !== 'standard';
      await updateProductCustomization(configProduct.id, {
        product_type: productType,
        is_customizable: isCustomizable
      });
      
      setProducts(products.map(p => 
        p.id === configProduct.id 
          ? { ...p, product_type: productType, is_customizable: isCustomizable ? 1 : 0 } as Product
          : p
      ));
      
      const response = await getProductConfiguration(configProduct.id);
      if (response.success) {
        setProductConfig(response.data);
      }
      
      alert('✅ تم تحديث نوع المنتج بنجاح');
    } catch (error) {
      console.error('Failed to update product type:', error);
      alert('❌ فشل تحديث نوع المنتج');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">المنتجات</h1>
          <p className="text-gray-600 mt-1">إدارة المنتجات والأسعار</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>إضافة منتج</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="البحث عن منتج..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleAvailability={toggleAvailability}
            onOpenConfig={openConfigModal}
          />
        ))}
      </div>

      {/* Modals */}
      <ProductForm
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        onSubmit={handleSubmit}
      />

      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setConfigProduct(null);
          setProductConfig(null);
        }}
        product={configProduct}
        config={productConfig}
        loading={loadingConfig}
        onUpdateProductType={handleUpdateProductType}
      />
    </div>
  );
};

export default ProductsPage;
