import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Save, X, Settings, Sparkles, Package, Ruler } from 'lucide-react';
import Image from 'next/image';
import type { Product } from '@/lib/adminApi';
import { getProducts, createProduct, updateProduct, deleteProduct, getProductConfiguration, updateProductCustomization } from '@/lib/adminApi';

interface ProductsPageProps {
  onRefresh?: () => void;
  onUpdate?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

// Product types for BYO system
const PRODUCT_TYPES = [
  { value: 'standard', label: 'منتج عادي', icon: '🍽️', description: 'منتج بسيط بدون تخصيص' },
  { value: 'byo_ice_cream', label: 'BYO آيس كريم', icon: '✨', description: 'آيس كريم قابل للتخصيص بالكامل' },
  { value: 'milkshake', label: 'ميلك شيك', icon: '🥤', description: 'ميلك شيك مع خيارات النكهات' },
  { value: 'preset_ice_cream', label: 'آيس كريم جاهز', icon: '🍨', description: 'آيس كريم بوصفة محددة' },
  { value: 'dessert', label: 'حلويات', icon: '🍰', description: 'حلويات متنوعة' },
];

const ProductsPage: React.FC<ProductsPageProps> = ({ onRefresh, onUpdate, onDelete }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    nameEn: '',
    category: '',
    categoryEn: '',
    price: '',
    description: '',
    descriptionEn: '',
    image: '',
    badge: '',
    available: 1,
    
    // Product type & customization
    product_type: 'standard',
    is_customizable: 0,
    
    // Nutrition fields
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    sugar: '',
    fiber: '',
    
    // Energy fields
    energy_type: 'none',
    energy_score: '',
    
    // Metadata fields
    tags: '',
    ingredients: '',
    nutrition_facts: '',
    allergens: ''
  });
  
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [productConfig, setProductConfig] = useState<any>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update existing product
        const updateData = {
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
        await updateProduct(editingProduct.id, updateData);
        const updatedProduct = { ...editingProduct, ...updateData };
        setProducts(products.map(p => 
          p.id === editingProduct.id ? updatedProduct : p
        ));
        onUpdate?.(updatedProduct);
        alert('✅ تم تحديث المنتج بنجاح');
      } else {
        // Create new product
        const createData = {
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
        await createProduct(createData);
        alert('✅ تم إنشاء المنتج بنجاح');
        await loadProducts();
      }
      
      setShowCreateModal(false);
      setEditingProduct(null);
      resetForm();
      onRefresh?.();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('❌ فشل حفظ المنتج');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    setFormData({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn || '',
      category: product.category,
      categoryEn: product.categoryEn || '',
      price: product.price.toString(),
      description: product.description || '',
      descriptionEn: product.descriptionEn || '',
      image: product.image || '',
      badge: product.badge || '',
      available: product.available,
      
      // Product type & customization
      product_type: (product as any).product_type || 'standard',
      is_customizable: (product as any).is_customizable || 0,
      
      // Nutrition fields
      calories: product.calories?.toString() || '',
      protein: product.protein?.toString() || '',
      carbs: product.carbs?.toString() || '',
      fat: product.fat?.toString() || '',
      sugar: product.sugar?.toString() || '',
      fiber: product.fiber?.toString() || '',
      
      // Energy fields
      energy_type: product.energy_type || 'none',
      energy_score: product.energy_score?.toString() || '',
      
      // Metadata fields
      tags: product.tags || '',
      ingredients: product.ingredients || '',
      nutrition_facts: product.nutrition_facts || '',
      allergens: product.allergens || ''
    });
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

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      nameEn: '',
      category: '',
      categoryEn: '',
      price: '',
      description: '',
      descriptionEn: '',
      image: '',
      badge: '',
      available: 1,
      
      // Product type & customization
      product_type: 'standard',
      is_customizable: 0,
      
      // Nutrition fields
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      sugar: '',
      fiber: '',
      
      // Energy fields
      energy_type: 'none',
      energy_score: '',
      
      // Metadata fields
      tags: '',
      ingredients: '',
      nutrition_facts: '',
      allergens: ''
    });
  };

  // Open product configuration modal
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

  // Update product type
  const handleUpdateProductType = async (productType: string) => {
    if (!configProduct) return;
    
    try {
      const isCustomizable = productType !== 'standard';
      await updateProductCustomization(configProduct.id, {
        product_type: productType,
        is_customizable: isCustomizable
      });
      
      // Update local state
      setProducts(products.map(p => 
        p.id === configProduct.id 
          ? { ...p, product_type: productType, is_customizable: isCustomizable ? 1 : 0 } as Product
          : p
      ));
      
      // Refresh config
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
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
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
            resetForm();
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

      {/* Products Grid - Fixed Height Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl shadow-sm border flex flex-col h-full ${
              product.available === 1 
                ? 'border-gray-200 hover:border-pink-300' 
                : 'border-gray-100 opacity-60'
            } hover:shadow-lg transition-all duration-200`}
          >
            {/* Product Image */}
            {product.image && (
              <div className="relative w-full h-40 bg-gradient-to-br from-pink-50 to-purple-50 rounded-t-xl overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {product.badge && (
                  <div className="absolute top-2 right-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
                      {product.badge}
                    </span>
                  </div>
                )}
                {product.available === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">غير متاح</span>
                  </div>
                )}
              </div>
            )}

            {/* Product Info */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-base text-gray-800 line-clamp-1">{product.name}</h3>
                {product.nameEn && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.nameEn}</p>
                )}
                
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">الفئة</span>
                    <span className="text-sm font-bold text-gray-800 bg-gradient-to-r from-gray-100 to-slate-100 px-3 py-1.5 rounded-lg border border-gray-200">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">السعر</span>
                    <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                      {product.price} ج
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Type Badge */}
              {(product as any).product_type && (product as any).product_type !== 'standard' && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium flex items-center gap-1">
                    <Sparkles size={10} />
                    {PRODUCT_TYPES.find(t => t.value === (product as any).product_type)?.label || 'قابل للتخصيص'}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => toggleAvailability(product)}
                  className={`flex-1 p-2 rounded-lg transition-all text-xs font-medium ${
                    product.available === 1
                      ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                  title={product.available === 1 ? 'تعطيل' : 'تفعيل'}
                >
                  {product.available === 1 ? <Eye size={14} className="mx-auto" /> : <EyeOff size={14} className="mx-auto" />}
                </button>
                <button
                  onClick={() => openConfigModal(product)}
                  className="flex-1 p-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all border border-purple-200"
                  title="إعدادات التخصيص"
                >
                  <Settings size={14} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 p-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-200"
                  title="تعديل"
                >
                  <Edit size={14} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 p-2 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all border border-red-200"
                  title="حذف"
                >
                  <Trash2 size={14} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingProduct ? '✏️ تعديل منتج' : '✨ إضافة منتج جديد'}
                  </h2>
                  <p className="text-pink-100 text-sm mt-1">
                    {editingProduct ? 'قم بتحديث معلومات المنتج' : 'أضف منتج جديد إلى القائمة'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-5 border-2 border-pink-200">
                <h3 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <span>📝</span> المعلومات الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      معرف المنتج *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      disabled={!!editingProduct}
                      className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white disabled:bg-gray-100"
                      placeholder="مثال: ice-cream-vanilla"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الاسم (العربية) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                      placeholder="مثال: آيس كريم فانيليا"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الاسم (الإنجليزية)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                      placeholder="Vanilla Ice Cream"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الفئة *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                      placeholder="مثال: آيس كريم"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الفئة (الإنجليزية)
                    </label>
                    <input
                      type="text"
                      value={formData.categoryEn}
                      onChange={(e) => setFormData({ ...formData, categoryEn: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                      placeholder="Ice Cream"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      السعر * (جنيه)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                        placeholder="25.00"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">ج</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      شارة مميزة
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                      placeholder="مثال: جديد، الأكثر مبيعاً"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      رابط الصورة
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <span>📄</span> الوصف
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الوصف (العربية)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
                      placeholder="وصف المنتج بالتفصيل..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الوصف (الإنجليزية)
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
                      placeholder="Product description in detail..."
                    />
                  </div>
                </div>
              </div>

              {/* Nutrition Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <span>🥗</span> معلومات التغذية
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      🔥 السعرات
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-sm"
                      placeholder="207"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      💪 البروتين (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-sm"
                      placeholder="3.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      🍞 الكربوهيدرات (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-sm"
                      placeholder="24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      🧈 الدهون (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.fat}
                      onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-sm"
                      placeholder="11"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      🍬 السكر (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.sugar}
                      onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-sm"
                      placeholder="21"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      🌾 الألياف (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.fiber}
                      onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-sm"
                      placeholder="0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Energy Information */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-200">
                <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <span>⚡</span> معلومات الطاقة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      نوع الطاقة
                    </label>
                    <select
                      value={formData.energy_type}
                      onChange={(e) => setFormData({ ...formData, energy_type: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white"
                    >
                      <option value="none">🚫 بدون</option>
                      <option value="mental">🧠 ذهني</option>
                      <option value="physical">💪 جسدي</option>
                      <option value="balanced">⚖️ متوازن</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      درجة الطاقة (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.energy_score}
                      onChange={(e) => setFormData({ ...formData, energy_score: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white"
                      placeholder="45"
                    />
                  </div>
                </div>
              </div>

              {/* Customization Note */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                  <span>✨</span> إعدادات التخصيص
                </h3>
                <div className="bg-white bg-opacity-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    💡 لإدارة خيارات التخصيص (النكهات، الصوصات، الإضافات) لهذا المنتج:
                  </p>
                  <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                    <li>احفظ المنتج أولاً</li>
                    <li>اضغط على زر ⚙️ (إعدادات التخصيص) في كارت المنتج</li>
                    <li>اختر نوع المنتج وقواعد التخصيص</li>
                  </ol>
                  <p className="text-xs text-purple-600 mt-3">
                    📌 لإدارة خيارات BYO بشكل عام، استخدم صفحة "خيارات BYO" من القائمة الجانبية
                  </p>
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border-2 border-gray-200">
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <span>🏷️</span> معلومات إضافية (JSON)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏷️ الوسوم
                    </label>
                    <textarea
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all bg-white font-mono text-sm resize-none"
                      placeholder='["classic","creamy","family-favorite"]'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🥛 المكونات
                    </label>
                    <textarea
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all bg-white font-mono text-sm resize-none"
                      placeholder='["fresh milk","vanilla extract","sugar"]'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📊 الحقائق الغذائية
                    </label>
                    <textarea
                      value={formData.nutrition_facts}
                      onChange={(e) => setFormData({ ...formData, nutrition_facts: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all bg-white font-mono text-sm resize-none"
                      placeholder='{"vitamins":{"A":500,"D":2.5}}'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⚠️ مسببات الحساسية
                    </label>
                    <textarea
                      value={formData.allergens}
                      onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all bg-white font-mono text-sm resize-none"
                      placeholder='["milk"]'
                    />
                  </div>
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <label htmlFor="available" className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available === 1}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <span className="text-base font-bold text-gray-800">متاح للبيع</span>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {formData.available === 1 ? '✅ المنتج متاح للعملاء' : '❌ المنتج غير متاح حالياً'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-semibold"
                >
                  ❌ إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold"
                >
                  <Save size={20} />
                  <span>{editingProduct ? '💾 تحديث المنتج' : '✨ حفظ المنتج'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Configuration Modal */}
      {showConfigModal && configProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Settings size={24} />
                    إعدادات التخصيص
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">
                    {configProduct.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowConfigModal(false);
                    setConfigProduct(null);
                    setProductConfig(null);
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingConfig ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Product Type Selection */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                      <Sparkles size={20} />
                      نوع المنتج
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PRODUCT_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleUpdateProductType(type.value)}
                          className={`p-4 rounded-xl border-2 transition-all text-right ${
                            productConfig?.product?.productType === type.value
                              ? 'border-purple-500 bg-purple-100 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow'
                          }`}
                        >
                          <div className="text-2xl mb-2">{type.icon}</div>
                          <div className="font-bold text-gray-800">{type.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Configuration Summary */}
                  {productConfig && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                      <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <Package size={20} />
                        ملخص الإعدادات
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Containers */}
                        <div className={`p-4 rounded-xl border-2 ${
                          productConfig.hasContainers 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Package size={18} className={productConfig.hasContainers ? 'text-green-600' : 'text-gray-400'} />
                            <span className="font-bold text-gray-800">الحاويات</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {productConfig.hasContainers 
                              ? `${productConfig.containers?.length || 0} حاوية متاحة`
                              : 'غير مفعل'}
                          </p>
                        </div>

                        {/* Sizes */}
                        <div className={`p-4 rounded-xl border-2 ${
                          productConfig.hasSizes 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Ruler size={18} className={productConfig.hasSizes ? 'text-blue-600' : 'text-gray-400'} />
                            <span className="font-bold text-gray-800">المقاسات</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {productConfig.hasSizes 
                              ? `${productConfig.sizes?.length || 0} مقاس متاح`
                              : 'غير مفعل'}
                          </p>
                        </div>

                        {/* Customization */}
                        <div className={`p-4 rounded-xl border-2 ${
                          productConfig.hasCustomization 
                            ? 'border-purple-300 bg-purple-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={18} className={productConfig.hasCustomization ? 'text-purple-600' : 'text-gray-400'} />
                            <span className="font-bold text-gray-800">التخصيص</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {productConfig.hasCustomization 
                              ? `${productConfig.customizationRules?.length || 0} مجموعة خيارات`
                              : 'غير مفعل'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customization Rules */}
                  {productConfig?.hasCustomization && productConfig.customizationRules?.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
                      <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
                        <Settings size={20} />
                        قواعد التخصيص
                      </h3>
                      <div className="space-y-3">
                        {productConfig.customizationRules.map((rule: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{rule.groupIcon || '📦'}</span>
                              <div>
                                <div className="font-bold text-gray-800">{rule.groupName}</div>
                                <div className="text-xs text-gray-500">
                                  {rule.isRequired ? 'إجباري' : 'اختياري'} • 
                                  {rule.minSelections}-{rule.maxSelections} خيارات
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>ملاحظة:</strong> لإدارة خيارات BYO (النكهات، الصوصات، الإضافات) بشكل تفصيلي، 
                      استخدم صفحة "خيارات BYO" من القائمة الجانبية.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setConfigProduct(null);
                  setProductConfig(null);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                ✅ تم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
