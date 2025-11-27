import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProduct, Product } from '@/lib/api'

interface UseProductLogicProps {
  product: Product | null
  isOpen: boolean
}

export function useProductLogic({ product, isOpen }: UseProductLogicProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  // Fetch expanded product data with optimistic UI
  const { data: displayProduct, isFetching, isFetched } = useQuery({
    queryKey: ['product', product?.id, 'detailed'],
    queryFn: async () => {
      if (!product) throw new Error('No product')
      console.log(`🔄 Fetching product ${product.id} from API...`)
      const result = await getProduct(product.id, { expand: ['addons', 'ingredients', 'allergens'] })
      console.log(`✅ Product ${product.id} fetched successfully`)
      return result
    },
    // ✅ FIX: Don't use initialData - always fetch to get addons
    // initialData causes the query to think it has data and skips fetching
    placeholderData: product || undefined, // Use placeholderData instead for optimistic UI
    enabled: !!product && isOpen,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  })

  // Log cache status
  useEffect(() => {
    if (product && isOpen) {
      if (isFetched && !isFetching) {
        console.log(`💾 Product ${product.id} loaded from CACHE (no API call)`)
      }
    }
  }, [product, isOpen, isFetched, isFetching])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuantity(1)
      setSelectedAddons([])
    }
  }, [isOpen])

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }

  // Calculate prices
  const addons = displayProduct?.addonsList || []
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId)
    return sum + (addon?.price || 0)
  }, 0)
  const totalPrice = displayProduct ? (displayProduct.price + addonsTotal) * quantity : 0

  // Parse JSON fields safely
  const tags = displayProduct?.tags ? JSON.parse(displayProduct.tags) : []
  const ingredients = displayProduct?.ingredientsList ||
    (displayProduct?.ingredients ? JSON.parse(displayProduct.ingredients) : [])
  const allergens = displayProduct?.allergensList ||
    (displayProduct?.allergens ? JSON.parse(displayProduct.allergens) : [])

  return {
    displayProduct,
    isFetchingAddons: isFetching,
    quantity,
    setQuantity,
    selectedAddons,
    toggleAddon,
    addons,
    addonsTotal,
    totalPrice,
    tags,
    ingredients,
    allergens,
  }
}
