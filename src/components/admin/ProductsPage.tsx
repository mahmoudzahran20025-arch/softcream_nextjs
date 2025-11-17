import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import Image from 'next/image';
import type { Product } from '@/lib/adminApi';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/adminApi';

interface ProductsPageProps {
  onRefresh?: () => void;
  onUpdate?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl shadow-sm border ${
              product.available === 1 ? 'border-gray-200' : 'border-gray-100 opacity-60'
            } hover:shadow-md transition-all`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                  {product.nameEn && (
                    <p className="text-sm text-gray-500 mt-1">{product.nameEn}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailability(product)}
                    className={`p-2 rounded-lg transition-colors ${
                      product.available === 1
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={product.available === 1 ? 'تعطيل' : 'تفعيل'}
                  >
                    {product.available === 1 ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="تعديل"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">السعر</span>
                  <span className="font-bold text-lg text-green-600">{product.price} ج</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">الفئة</span>
                  <span className="text-sm font-medium text-gray-800">{product.category}</span>
                </div>
                {product.badge && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">شارة</span>
                    <span className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded-full">
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>

              {product.image && (
                <div className="mt-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={128}
                    className="w-full h-32 object-cover rounded-lg"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    معرف المنتج *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    disabled={!!editingProduct}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="مثال: ice-cream-vanilla"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم (العربية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="مثال: آيس كريم فانيليا"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم (الإنجليزية)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Vanilla Ice Cream"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفئة *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="مثال: آيس كريم"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفئة (الإنجليزية)
                  </label>
                  <input
                    type="text"
                    value={formData.categoryEn}
                    onChange={(e) => setFormData({ ...formData, categoryEn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Ice Cream"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السعر *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="10.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    شارة
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="مثال: جديد، الأكثر مبيعاً"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (العربية)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="وصف المنتج..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (الإنجليزية)
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Product description..."
                  />
                </div>
              </div>

              {/* Nutrition Information */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات التغذية</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعرات الحرارية
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البروتين (جرام)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الكربوهيدرات (جرام)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الدهون (جرام)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.fat}
                      onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السكر (جرام)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.sugar}
                      onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الألياف (جرام)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.fiber}
                      onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Energy Information */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات الطاقة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع الطاقة
                    </label>
                    <select
                      value={formData.energy_type}
                      onChange={(e) => setFormData({ ...formData, energy_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="none">بدون</option>
                      <option value="mental">ذهني</option>
                      <option value="physical">جسدي</option>
                      <option value="balanced">متوازن</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      درجة الطاقة
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.energy_score}
                      onChange={(e) => setFormData({ ...formData, energy_score: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0-100"
                    />
                  </div>
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات إضافية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الوسوم (JSON)
                    </label>
                    <textarea
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder='["حلوى", "بارد", "صيفي"]'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المكونات (JSON)
                    </label>
                    <textarea
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder='["حليب", "سكر", "فانيليا"]'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الحقائق الغذائية (JSON)
                    </label>
                    <textarea
                      value={formData.nutrition_facts}
                      onChange={(e) => setFormData({ ...formData, nutrition_facts: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder='{"vitamins": ["A", "D"], "minerals": ["Calcium"]}'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      مسببات الحساسية (JSON)
                    </label>
                    <textarea
                      value={formData.allergens}
                      onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder='["حليب", "جلوتين"]'
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available === 1}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="available" className="mr-2 text-sm font-medium text-gray-700">
                  متاح للبيع
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Save size={20} />
                  <span>{editingProduct ? 'تحديث' : 'حفظ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
