// src/components/admin/products/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckSquare } from 'lucide-react';
import { 
  getProducts, 
  updateProduct, 
  deleteProduct, 
  getBYOOptions,
  bulkAssignOptionGroup,
  createProductUnified,
  updateProductUnified,
  translateApiError,
  type Product,
  type BYOOptionGroup
} from '@/lib/admin';
import type { ProductsPageProps } from './types';
import type { 
  OptionGroupInfo, 
  OptionGroupAssignment, 
  UnifiedProductData 
} from './UnifiedProductForm/types';
import type { BulkAssignResult } from './BulkAssignModal';
import ProductCard from './ProductCard';
import UnifiedProductForm from './UnifiedProductForm';
import BulkActionsToolbar from './BulkActionsToolbar';
import BulkAssignModal from './BulkAssignModal';

// Toast notification type for API feedback (Requirement 5.5)
interface ToastNotification {
  type: 'success' | 'error';
  message: string;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ onRefresh, onUpdate, onDelete }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  


  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  
  // Toast notification state (Requirement 5.5)
  const [toast, setToast] = useState<ToastNotification | null>(null);
  
  /**
   * Option groups for UnifiedProductForm
   * Requirements: 5.3 - Containers and sizes are now part of option groups
   * with group_id 'containers' and 'sizes' respectively
   */
  const [optionGroups, setOptionGroups] = useState<OptionGroupInfo[]>([]);

  useEffect(() => {
    loadProducts();
    loadOptionGroups();
  }, []);

  // Auto-hide toast after 5 seconds (Requirement 5.5)
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Show toast notification helper (Requirement 5.5)
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const loadOptionGroups = async () => {
    try {
      const response = await getBYOOptions();
      if (response.success && response.data) {
        // Transform BYOOptionGroup to OptionGroupInfo
        const groups: OptionGroupInfo[] = response.data.map((group: BYOOptionGroup) => ({
          id: group.id,
          name: group.name_ar,
          nameEn: group.name_en,
          icon: group.icon,
          optionsCount: group.options?.length || 0,
          options: group.options?.map(opt => ({
            id: opt.id,
            name: opt.name_ar,
            price: opt.base_price
          }))
        }));
        setOptionGroups(groups);
      }
    } catch (error) {
      console.error('Failed to load option groups:', error);
    }
  };



  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Requirement 5.5: Display meaningful error message
      showToast('error', translateApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle unified form submission
   * Requirements: 1.5 - Save product and all assignments in a single transaction
   * Requirements: 2.4 - Update product data and product_options atomically
   */
  const handleUnifiedSubmit = async (data: UnifiedProductData) => {
    try {
      const productData = {
        id: data.product.id,
        name: data.product.name,
        nameEn: data.product.nameEn || undefined,
        category: data.product.category,
        categoryEn: data.product.categoryEn || undefined,
        price: parseFloat(data.product.price) || 0,
        description: data.product.description || undefined,
        descriptionEn: data.product.descriptionEn || undefined,
        image: data.product.image || undefined,
        badge: data.product.badge || undefined,
        available: data.product.available,
        product_type: data.product.product_type || 'standard',
        // Template fields
        template_id: data.product.template_id || undefined,
        card_style: data.product.card_style || undefined,
        // Discount fields
        old_price: data.product.old_price ? parseFloat(data.product.old_price) : undefined,
        discount_percentage: data.product.discount_percentage ? parseInt(data.product.discount_percentage) : undefined,
        // Nutrition fields
        calories: parseInt(data.product.calories) || 0,
        protein: parseFloat(data.product.protein) || 0,
        carbs: parseFloat(data.product.carbs) || 0,
        fat: parseFloat(data.product.fat) || 0,
        sugar: parseFloat(data.product.sugar) || 0,
        fiber: parseFloat(data.product.fiber) || 0,
        energy_score: parseInt(data.product.energy_score) || 0,
        energy_type: data.product.energy_type as 'mental' | 'physical' | 'balanced' | 'none' | undefined,
        health_keywords: data.product.health_keywords?.length > 0 
          ? JSON.stringify(data.product.health_keywords) 
          : undefined,
        health_benefit_ar: data.product.health_benefit_ar || undefined
      };

      /**
       * Prepare option groups for API
       * Requirements: 5.3 - Containers and sizes are now part of option groups
       * with group_id 'containers' and 'sizes' respectively
       */
      const optionGroupsPayload = data.optionGroupAssignments.map(og => ({
        groupId: og.groupId,
        isRequired: og.isRequired,
        minSelections: og.minSelections,
        maxSelections: og.maxSelections,
        displayOrder: og.displayOrder
      }));

      if (editingProduct) {
        // Update existing product with unified endpoint
        // Requirements: 5.3 - No separate containers/sizes, all handled via option groups
        await updateProductUnified(editingProduct.id, {
          product: productData,
          optionGroups: optionGroupsPayload,
          containers: [], // Deprecated: containers are now option groups
          sizes: []       // Deprecated: sizes are now option groups
        });
        
        const updatedProduct = { ...editingProduct, ...productData };
        setProducts(products.map(p => 
          p.id === editingProduct.id ? updatedProduct : p
        ));
        onUpdate?.(updatedProduct);
        showToast('success', 'تم تحديث المنتج بنجاح');
      } else {
        // Create new product with unified endpoint
        // Requirements: 5.3 - No separate containers/sizes, all handled via option groups
        await createProductUnified({
          product: productData,
          optionGroups: optionGroupsPayload,
          containers: [], // Deprecated: containers are now option groups
          sizes: []       // Deprecated: sizes are now option groups
        });
        showToast('success', 'تم إنشاء المنتج بنجاح');
        await loadProducts();
      }
      
      setShowCreateModal(false);
      setEditingProduct(null);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to save product:', error);
      // Requirement 5.5: Display meaningful error message
      // Note: The error is also handled in UnifiedProductForm, but we catch here for safety
      throw error; // Re-throw to let UnifiedProductForm handle the display
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
      showToast('success', 'تم حذف المنتج بنجاح');
      onRefresh?.();
    } catch (error) {
      console.error('Failed to delete product:', error);
      // Requirement 5.5: Display meaningful error message
      showToast('error', translateApiError(error));
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const newAvailability = product.available === 1 ? 0 : 1;
      await updateProduct(product.id, { ...product, available: newAvailability });
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, available: newAvailability } : p
      ));
      showToast('success', `تم ${newAvailability === 1 ? 'تفعيل' : 'تعطيل'} المنتج`);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      // Requirement 5.5: Display meaningful error message
      showToast('error', translateApiError(error));
    }
  };

  /**
   * @deprecated ConfigModal has been removed - use UnifiedProductForm instead
   * This function is kept for backward compatibility with ProductCard
   */
  const openConfigModal = (product: Product) => {
    // Redirect to UnifiedProductForm instead of the deprecated ConfigModal
    setEditingProduct(product);
    setShowCreateModal(true);
  };

  // Selection handlers
  const handleSelectionChange = (productId: string, selected: boolean) => {
    setSelectedProductIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredProducts.map(p => p.id));
    setSelectedProductIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedProductIds(new Set());
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedProductIds(new Set());
  };

  const handleOpenBulkAssign = () => {
    setShowBulkAssignModal(true);
  };

  const handleCloseBulkAssign = () => {
    setShowBulkAssignModal(false);
  };

  /**
   * Handle bulk assignment of option group to selected products
   * Requirements: 6.2, 6.3
   */
  const handleBulkAssignConfirm = async (assignment: OptionGroupAssignment): Promise<BulkAssignResult> => {
    const productIds = Array.from(selectedProductIds);
    
    try {
      const response = await bulkAssignOptionGroup({
        productIds,
        assignment: {
          groupId: assignment.groupId,
          isRequired: assignment.isRequired,
          minSelections: assignment.minSelections,
          maxSelections: assignment.maxSelections,
          displayOrder: assignment.displayOrder
        }
      });

      // Transform API response to BulkAssignResult format
      const result: BulkAssignResult = {
        success: response.results
          .filter((r: { success: boolean }) => r.success)
          .map((r: { productId: string }) => r.productId),
        failed: response.results
          .filter((r: { success: boolean }) => !r.success)
          .map((r: { productId: string; error?: string }) => {
            const product = products.find(p => p.id === r.productId);
            return {
              productId: r.productId,
              productName: product?.name || r.productId,
              error: r.error || 'خطأ غير معروف'
            };
          })
      };

      // If all succeeded, clear selection and exit selection mode
      if (result.failed.length === 0) {
        setSelectedProductIds(new Set());
        setSelectionMode(false);
      }

      // Refresh products to show updated data
      await loadProducts();

      return result;
    } catch (error) {
      console.error('Bulk assignment failed:', error);
      // Return all as failed
      return {
        success: [],
        failed: productIds.map(id => {
          const product = products.find(p => p.id === id);
          return {
            productId: id,
            productName: product?.name || id,
            error: 'فشل الاتصال بالخادم'
          };
        })
      };
    }
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      handleCancelSelection();
    } else {
      setSelectionMode(true);
    }
  };

  // Get selected products for bulk operations
  const selectedProducts = products.filter(p => selectedProductIds.has(p.id));

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">المنتجات</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">إدارة المنتجات والأسعار</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Selection Mode Toggle */}
          <button
            onClick={toggleSelectionMode}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
              selectionMode
                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <CheckSquare size={18} />
            <span className="hidden sm:inline">{selectionMode ? 'إلغاء التحديد' : 'تحديد متعدد'}</span>
          </button>
          
          {/* Add Product Button */}
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm sm:text-base flex-1 sm:flex-none justify-center"
          >
            <Plus size={18} />
            <span>إضافة منتج</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="البحث عن منتج..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base"
        />
      </div>

      {/* Bulk Actions Toolbar - shown when in selection mode */}
      {selectionMode && (
        <BulkActionsToolbar
          selectedCount={selectedProductIds.size}
          totalCount={filteredProducts.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onOpenBulkAssign={handleOpenBulkAssign}
          onCancel={handleCancelSelection}
        />
      )}

      {/* Products Grid - Responsive */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleAvailability={toggleAvailability}
            onOpenConfig={openConfigModal}
            isSelected={selectedProductIds.has(product.id)}
            onSelectionChange={handleSelectionChange}
            selectionMode={selectionMode}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">لا توجد منتجات</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'أضف منتجات جديدة للبدء'}
          </p>
        </div>
      )}

      {/* Modals */}
      {/* UnifiedProductForm - Requirements: 1.1, 2.1, 5.1, 5.3 */}
      {/* Containers and sizes are now part of optionGroups with group_id 'containers' and 'sizes' */}
      <UnifiedProductForm
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        onSubmit={handleUnifiedSubmit}
        optionGroups={optionGroups}
      />

      {/* ConfigModal removed - use UnifiedProductForm for all product configuration */}

      {/* Bulk Assign Modal - Requirements: 6.2 */}
      <BulkAssignModal
        isOpen={showBulkAssignModal}
        onClose={handleCloseBulkAssign}
        selectedProducts={selectedProducts}
        optionGroups={optionGroups}
        onConfirm={handleBulkAssignConfirm}
      />

      {/* Toast Notification - Requirement 5.5: Display meaningful error messages */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border-2 ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className="text-lg">
                {toast.type === 'success' ? '✅' : '❌'}
              </span>
            </div>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
                toast.type === 'success'
                  ? 'hover:bg-green-100 text-green-600'
                  : 'hover:bg-red-100 text-red-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
