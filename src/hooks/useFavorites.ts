'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/storage.client'
import { useWindowEvent } from '@/hooks/useWindowEvent'

export function useFavorites() {
    const [favorites, setFavorites] = useState<any[]>([])
    const [isReady, setIsReady] = useState(false)

    const updateFavorites = () => {
        if (typeof window !== 'undefined') {
            const data = storage.getFavorites()
            setFavorites(data)
            setIsReady(true)
        }
    }

    // Initial load
    useEffect(() => {
        updateFavorites()
    }, [])

    // Listen for updates
    useWindowEvent('favoritesUpdated', () => {
        updateFavorites()
    })

    const toggleFavorite = (product: any) => {
        return storage.toggleFavorite(product)
    }

    const isFavorite = (productId: string) => {
        return favorites.some((f: any) => f.id === productId)
    }

    return {
        favorites,
        favoritesCount: favorites.length,
        toggleFavorite,
        isFavorite,
        isReady
    }
}
