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
      const result = await getProduct(product.id, { expand: ['options', 'ingredients', 'allergens'] })
      console.log(`✅ Product ${product.id} fetched successfully`)
      return result
    },
    placeholderData: product || undefined,
    enabled: !!product && isOpen,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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

  // ✅ NEW: Use optionGroups instead of legacy addons
  // Options are now fetched via expand=options and stored in optionGroups
  const optionGroups = displayProduct?.optionGroups || []
  
  // Calculate total from selected options (legacy addons support removed)
  const addonsTotal = 0 // Legacy - now handled by BYO system
  const totalPrice = displayProduct ? displayProduct.price * quantity : 0

  // Parse JSON fields safely
  const parseJsonField = (field: string | string[] | undefined): string[] => {
    if (!field) return []
    if (Array.isArray(field)) return field
    try {
      return JSON.parse(field)
    } catch {
      return []
    }
  }

  const tags = parseJsonField(displayProduct?.tags)
  const ingredients = displayProduct?.ingredientsList || parseJsonField(displayProduct?.ingredients)
  const allergens = displayProduct?.allergensList || parseJsonField(displayProduct?.allergens)

  return {
    displayProduct,
    isFetchingAddons: isFetching,
    quantity,
    setQuantity,
    selectedAddons,
    toggleAddon,
    optionGroups, // ✅ NEW: Use this instead of addons
    addons: [], // Legacy - kept for backward compatibility
    addonsTotal,
    totalPrice,
    tags,
    ingredients,
    allergens,
  }
}
