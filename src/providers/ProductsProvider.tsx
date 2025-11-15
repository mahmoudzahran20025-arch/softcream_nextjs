'use client'

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react'
import { useGlobal } from '@/providers/ThemeProvider'
import type { Product } from '@/lib/api'

interface ProductsFilters {
  category: string | null
  energyType: string | null
  minCalories: number | null
  maxCalories: number | null
  searchQuery: string
}

interface ProductsContextType {
  products: Product[]
  productsMap: Record<string, Product>
  filteredProducts: Product[]
  selectedProduct: Product | null
  loading: boolean
  error: string | null
  filters: ProductsFilters
  currentLang: 'ar' | 'en'
  t: (key: string, params?: Record<string, any>) => string
  applyFilters: (filters: ProductsFilters) => void
  openProduct: (product: Product) => void
  closeProduct: () => void
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export const useProductsData = (): ProductsContextType => {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProductsData must be used within ProductsProvider')
  }
  return context
}

interface ProductsProviderProps {
  children: ReactNode
  initialProducts?: Product[]
}

export default function ProductsProvider({ children, initialProducts = [] }: ProductsProviderProps) {
  const { language: currentLang, t } = useGlobal()

  const [products] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [filters, setFilters] = useState<ProductsFilters>({
    category: null,
    energyType: null,
    minCalories: null,
    maxCalories: null,
    searchQuery: '',
  })

  const loading = false
  const error: string | null = null

  const productsMap = useMemo(() => {
    const map: Record<string, Product> = {}
    products.forEach((product) => {
      if (product && product.id) {
        map[product.id] = product
      }
    })
    return map
  }, [products])

  const applyFilters = useCallback(
    (newFilters: ProductsFilters) => {
      setFilters(newFilters)

      let filtered = [...products]

      if (newFilters.searchQuery && newFilters.searchQuery.trim()) {
        const query = newFilters.searchQuery.trim().toLowerCase()
        filtered = filtered.filter((product) => {
          const name = (product.name || '').toLowerCase()
          const nameEn = (product.nameEn || '').toLowerCase()
          const tags = (product.tags || '').toLowerCase()
          const description = (product.description || '').toLowerCase()

          return (
            name.includes(query) ||
            nameEn.includes(query) ||
            tags.includes(query) ||
            description.includes(query)
          )
        })
      }

      if (newFilters.category) {
        filtered = filtered.filter(
          (product) =>
            product.category === newFilters.category ||
            (product as any).categoryEn === newFilters.category,
        )
      }

      if (newFilters.energyType) {
        filtered = filtered.filter((product) => product.energy_type === newFilters.energyType)
      }

      if (newFilters.minCalories !== null && newFilters.minCalories !== undefined) {
        filtered = filtered.filter((product) => (product.calories || 0) >= newFilters.minCalories!)
      }

      if (newFilters.maxCalories !== null && newFilters.maxCalories !== undefined) {
        filtered = filtered.filter((product) => (product.calories || 0) <= newFilters.maxCalories!)
      }

      setFilteredProducts(filtered)
    },
    [products],
  )

  const openProduct = useCallback((product: Product) => {
    setSelectedProduct(product)
  }, [])

  const closeProduct = useCallback(() => {
    setSelectedProduct(null)
  }, [])

  const value: ProductsContextType = {
    products,
    productsMap,
    filteredProducts,
    selectedProduct,
    loading,
    error,
    filters,
    currentLang,
    t,
    applyFilters,
    openProduct,
    closeProduct,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
