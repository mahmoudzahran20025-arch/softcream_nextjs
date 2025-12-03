import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the API module
vi.mock('@/lib/api', () => ({
  getProductConfiguration: vi.fn()
}));

import { getProductConfiguration } from '@/lib/api';
import { useProductConfiguration } from './useProductConfiguration';

const mockedGetProductConfiguration = vi.mocked(getProductConfiguration);

/**
 * Task 8.1: Verify configuration loading
 * Tests that configuration is fetched from /products/:id/configuration
 * and containers, sizes, customizationRules are populated
 * _Requirements: 12.1_
 */
describe('useProductConfiguration - Configuration Loading', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  // Mock configuration data matching ProductConfiguration interface
  const mockConfiguration = {
    product: {
      id: 'test-product-1',
      name: 'آيس كريم',
      nameAr: 'آيس كريم',
      nameEn: 'Ice Cream',
      basePrice: 15,
      productType: 'byo_ice_cream' as const,
      isCustomizable: true,
      baseNutrition: {
        calories: 200,
        protein: 5,
        carbs: 30,
        sugar: 20,
        fat: 8,
        fiber: 0
      }
    },
    hasContainers: true,
    containers: [
      {
        id: 'cone',
        name: 'كون',
        nameAr: 'كون',
        nameEn: 'Cone',
        priceModifier: 0,
        image: '/images/cone.png',
        maxSizes: 3,
        isDefault: true,
        nutrition: { calories: 50, protein: 1, carbs: 10, sugar: 5, fat: 1, fiber: 0 }
      },
      {
        id: 'cup',
        name: 'كوب',
        nameAr: 'كوب',
        nameEn: 'Cup',
        priceModifier: 2,
        image: '/images/cup.png',
        maxSizes: 3,
        isDefault: false,
        nutrition: { calories: 20, protein: 0, carbs: 5, sugar: 2, fat: 0, fiber: 0 }
      }
    ],
    hasSizes: true,
    sizes: [
      {
        id: 'small',
        name: 'صغير',
        nameAr: 'صغير',
        nameEn: 'Small',
        priceModifier: 0,
        nutritionMultiplier: 1.0,
        isDefault: true
      },
      {
        id: 'medium',
        name: 'وسط',
        nameAr: 'وسط',
        nameEn: 'Medium',
        priceModifier: 5,
        nutritionMultiplier: 1.5,
        isDefault: false
      },
      {
        id: 'large',
        name: 'كبير',
        nameAr: 'كبير',
        nameEn: 'Large',
        priceModifier: 10,
        nutritionMultiplier: 2.0,
        isDefault: false
      }
    ],
    hasCustomization: true,
    customizationRules: [
      {
        groupId: 'flavors',
        groupName: 'النكهات',
        groupIcon: '🍦',
        isRequired: true,
        minSelections: 1,
        maxSelections: 3,
        options: [
          { id: 'vanilla', name_ar: 'فانيلا', name: 'فانيلا', price: 0, nutrition: { calories: 50, protein: 1, carbs: 8, sugar: 6, fat: 2, fiber: 0 } },
          { id: 'chocolate', name_ar: 'شوكولاتة', name: 'شوكولاتة', price: 0, nutrition: { calories: 60, protein: 1, carbs: 10, sugar: 8, fat: 3, fiber: 1 } }
        ]
      },
      {
        groupId: 'toppings',
        groupName: 'الإضافات',
        groupIcon: '🍫',
        isRequired: false,
        minSelections: 0,
        maxSelections: 5,
        options: [
          { id: 'sprinkles', name_ar: 'رشات', name: 'رشات', price: 2, nutrition: { calories: 20, protein: 0, carbs: 5, sugar: 4, fat: 0, fiber: 0 } },
          { id: 'nuts', name_ar: 'مكسرات', name: 'مكسرات', price: 3, nutrition: { calories: 40, protein: 2, carbs: 3, sugar: 1, fat: 3, fiber: 1 } }
        ]
      }
    ]
  };

  describe('Configuration Fetching', () => {
    it('should fetch configuration from /products/:id/configuration when modal is open', async () => {
      mockedGetProductConfiguration.mockResolvedValueOnce(mockConfiguration);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: true }),
        { wrapper: createWrapper() }
      );

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify API was called with correct parameters
      expect(mockedGetProductConfiguration).toHaveBeenCalledWith('test-product-1', 'ar');
      expect(mockedGetProductConfiguration).toHaveBeenCalledTimes(1);
    });

    it('should not fetch configuration when modal is closed', () => {
      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: false }),
        { wrapper: createWrapper() }
      );

      expect(mockedGetProductConfiguration).not.toHaveBeenCalled();
      expect(result.current.config).toBeUndefined();
    });

    it('should not fetch configuration when productId is null', () => {
      const { result } = renderHook(
        () => useProductConfiguration({ productId: null, isOpen: true }),
        { wrapper: createWrapper() }
      );

      expect(mockedGetProductConfiguration).not.toHaveBeenCalled();
      expect(result.current.config).toBeUndefined();
    });
  });

  describe('Containers Population', () => {
    it('should populate containers from configuration response', async () => {
      mockedGetProductConfiguration.mockResolvedValueOnce(mockConfiguration);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify containers are populated
      expect(result.current.hasContainers).toBe(true);
      expect(result.current.containers).toHaveLength(2);
      expect(result.current.containers[0].id).toBe('cone');
      expect(result.current.containers[1].id).toBe('cup');
    });

    it('should set default container automatically', async () => {
      mockedGetProductConfiguration.mockResolvedValueOnce(mockConfiguration);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Wait for default selection to be set
      await waitFor(() => {
        expect(result.current.selectedContainer).toBe('cone');
      });
    });

    it('should handle products without containers', async () => {
      const configWithoutContainers = {
        ...mockConfiguration,
        hasContainers: false,
        containers: []
      };
      mockedGetProductConfiguration.mockResolvedValueOnce(configWithoutContainers);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasContainers).toBe(false);
      expect(result.current.containers).toHaveLength(0);
      expect(result.current.selectedContainer).toBeNull();
    });
  });

  describe('Sizes Population', () => {
    it('should populate sizes from configuration response', async () => {
      mockedGetProductConfiguration.mockResolvedValueOnce(mockConfiguration);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify sizes are populated
      expect(result.current.hasSizes).toBe(true);
      expect(result.current.sizes).toHaveLength(3);
      expect(result.current.sizes[0].id).toBe('small');
      expect(result.current.sizes[1].id).toBe('medium');
      expect(result.current.sizes[2].id).toBe('large');
    });

    it('should set default size automatically', async () => {
      mockedGetProductConfiguration.mockResolvedValueOnce(mockConfiguration);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Wait for default selection to be set
      await waitFor(() => {
        expect(result.current.selectedSize).toBe('small');
      });
    });

    it('should handle products without sizes', async () => {
      const configWithoutSizes = {
        ...mockConfiguration,
        hasSizes: false,
        sizes: []
      };
      mockedGetProductConfiguration.mockResolvedValueOnce(configWithoutSizes);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasSizes).toBe(false);
      expect(result.current.sizes).toHaveLength(0);
      expect(result.current.selectedSize).toBeNull();
    });
  });

  describe('CustomizationRules Population', () => {
    it('should populate customizationRules from configuration response', async () => {
      mockedGetProductConfiguration.mockResolvedValueOnce(mockConfiguration);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify customization rules are populated
      expect(result.current.hasCustomization).toBe(true);
      expect(result.current.customizationRules).toHaveLength(2);
      expect(result.current.customizationRules[0].groupId).toBe('flavors');
      expect(result.current.customizationRules[1].groupId).toBe('toppings');
    });

    it('should include options within customization rules', async () => {
      mockedGetProductConfiguration.mockResolvedValueOnce(mockConfiguration);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify options are included in rules
      const flavorsGroup = result.current.customizationRules.find(r => r.groupId === 'flavors');
      expect(flavorsGroup?.options).toHaveLength(2);
      expect(flavorsGroup?.options[0].id).toBe('vanilla');
      expect(flavorsGroup?.options[1].id).toBe('chocolate');
    });

    it('should handle products without customization', async () => {
      const configWithoutCustomization = {
        ...mockConfiguration,
        hasCustomization: false,
        customizationRules: []
      };
      mockedGetProductConfiguration.mockResolvedValueOnce(configWithoutCustomization);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'test-product-1', isOpen: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasCustomization).toBe(false);
      expect(result.current.customizationRules).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockedGetProductConfiguration.mockResolvedValueOnce(null);

      const { result } = renderHook(
        () => useProductConfiguration({ productId: 'non-existent', isOpen: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.config).toBeNull();
      expect(result.current.hasContainers).toBe(false);
      expect(result.current.hasSizes).toBe(false);
      expect(result.current.hasCustomization).toBe(false);
    });
  });

  describe('State Reset', () => {
    it('should reset state when modal closes', async () => {
      mockedGetProductConfiguration.mockResolvedValue(mockConfiguration);

      const { result, rerender } = renderHook(
        ({ isOpen }) => useProductConfiguration({ productId: 'test-product-1', isOpen }),
        { 
          wrapper: createWrapper(),
          initialProps: { isOpen: true }
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.selectedContainer).toBe('cone');
      });

      // Close modal
      rerender({ isOpen: false });

      // State should be reset
      await waitFor(() => {
        expect(result.current.selectedContainer).toBeNull();
        expect(result.current.selectedSize).toBeNull();
      });
    });
  });
});
