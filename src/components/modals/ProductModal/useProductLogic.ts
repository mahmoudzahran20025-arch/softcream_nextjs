import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProduct, Addon } from '@/lib/api'

interface Product {
  id: string
  name: string
  nameEn?: string
  price: number
  image?: string
  category?: string
  description?: string
  tags?: string
  ingredients?: string
  allergens?: string
  calories?: number
  protein?: number
  carbs?: number
  sugar?: number
  fat?: number
  fiber?: number
  energy_type?: string
  energy_score?: number
  badge?: string
  addonsList?: Addon[]
  allowed_addons?: string
  ingredientsList?: string[]
  allergensList?: string[]
}

interface UseProductLogicProps {
  product: Product | null
  isOpen: boolean
}

export function useProductLogic({ product, isOpen }: UseProductLogicProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  // Fetch expanded product data with optimistic UI
  const { data: displayProduct, isFetching } = useQuery({
    queryKey: ['product', product?.id, 'detailed'],
    queryFn: () => {
      if (!product) throw new Error('No product')
      return getProduct(product.id, { expand: ['addons', 'ingredients', 'allergens'] })
    },
    initialData: product || undefined,
    enabled: !!product && isOpen,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  })

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
