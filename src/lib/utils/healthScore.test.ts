import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  calculateHealthScore,
  calculateHealthScoreFromNutrition,
  type NutritionData,
  type CartItemForScore,
} from './healthScore';

// Arbitrary for nutrition data
const nutritionArb = fc.record({
  calories: fc.integer({ min: 0, max: 1000 }),
  protein: fc.float({ min: 0, max: 50 }),
  carbs: fc.float({ min: 0, max: 100 }),
  sugar: fc.float({ min: 0, max: 100 }),
  fat: fc.float({ min: 0, max: 50 }),
  fiber: fc.float({ min: 0, max: 20 }),
  satFat: fc.float({ min: 0, max: 30 }),
});

// Arbitrary for cart items
const cartItemArb = fc.record({
  productId: fc.uuid(),
  quantity: fc.integer({ min: 1, max: 10 }),
  selectedAddons: fc.array(fc.uuid(), { minLength: 0, maxLength: 3 }),
  selections: fc.dictionary(
    fc.uuid(),
    fc.array(fc.uuid(), { minLength: 0, maxLength: 3 })
  ),
});

/**
 * **Feature: health-driven-cart, Property 6: Health Score Bounds**
 * *For any* cart (empty or non-empty), the calculated health score
 * should be a number between 0 and 100 inclusive.
 * **Validates: Requirements 4.3**
 */
describe('Property 6: Health Score Bounds', () => {
  it('score is always between 0 and 100 for any nutrition values', () => {
    fc.assert(
      fc.property(nutritionArb, (nutrition) => {
        const score = calculateHealthScoreFromNutrition(nutrition);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }),
      { numRuns: 100 }
    );
  });

  it('score is always between 0 and 100 for any cart', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 0, maxLength: 5 }),
        (items) => {
          // Create a simple products map with random nutrition
          const productsMap = new Map<string, any>();
          items.forEach(item => {
            productsMap.set(item.productId, {
              calories: Math.random() * 500,
              protein: Math.random() * 30,
              sugar: Math.random() * 50,
              satFat: Math.random() * 20,
            });
          });
          
          const result = calculateHealthScore(items, productsMap);
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty cart returns score of 100', () => {
    const result = calculateHealthScore([], new Map());
    expect(result.score).toBe(100);
    expect(result.level).toBe('Excellent');
  });

  it('extreme low nutrition returns high score', () => {
    const nutrition: NutritionData = {
      calories: 50,
      protein: 15,
      sugar: 2,
      satFat: 0,
    };
    const score = calculateHealthScoreFromNutrition(nutrition);
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('extreme high sugar/fat returns low score', () => {
    const nutrition: NutritionData = {
      calories: 600,
      protein: 0,
      sugar: 50,
      satFat: 15,
    };
    const score = calculateHealthScoreFromNutrition(nutrition);
    expect(score).toBeLessThanOrEqual(30);
  });
});

/**
 * **Feature: health-driven-cart, Property 7: Health Score Includes All Nutrition**
 * *For any* cart with products and customizations, the health score calculation
 * should include nutrition values from all items and their customizations.
 * **Validates: Requirements 4.1, 4.2**
 */
describe('Property 7: Health Score Includes All Nutrition', () => {
  it('includes base product nutrition', () => {
    const items: CartItemForScore[] = [
      { productId: 'p1', quantity: 1 }
    ];
    
    const productsMap = new Map<string, any>();
    productsMap.set('p1', {
      calories: 200,
      protein: 10,
      sugar: 15,
      satFat: 3,
    });
    
    const result = calculateHealthScore(items, productsMap);
    
    // Verify total nutrition includes product values
    expect(result.totalNutrition.calories).toBe(200);
    expect(result.totalNutrition.protein).toBe(10);
    expect(result.totalNutrition.sugar).toBe(15);
  });

  it('includes customization option nutrition', () => {
    const items: CartItemForScore[] = [
      {
        productId: 'p1',
        quantity: 1,
        selections: { 'group1': ['option1'] }
      }
    ];
    
    const productsMap = new Map<string, any>();
    productsMap.set('p1', {
      calories: 100,
      protein: 5,
      sugar: 10,
      customizationRules: [
        {
          groupId: 'group1',
          options: [
            {
              id: 'option1',
              nutrition: { calories: 50, protein: 3, sugar: 5 }
            }
          ]
        }
      ]
    });
    
    const result = calculateHealthScore(items, productsMap);
    
    // Total should include base + option
    expect(result.totalNutrition.calories).toBe(150); // 100 + 50
    expect(result.totalNutrition.protein).toBe(8); // 5 + 3
    expect(result.totalNutrition.sugar).toBe(15); // 10 + 5
  });

  it('includes addon nutrition (legacy)', () => {
    const items: CartItemForScore[] = [
      {
        productId: 'p1',
        quantity: 1,
        selectedAddons: ['addon1']
      }
    ];
    
    const productsMap = new Map<string, any>();
    productsMap.set('p1', {
      calories: 100,
      protein: 5,
      addonsList: [
        { id: 'addon1', calories: 30, protein: 2 }
      ]
    });
    
    const result = calculateHealthScore(items, productsMap);
    
    expect(result.totalNutrition.calories).toBe(130); // 100 + 30
    expect(result.totalNutrition.protein).toBe(7); // 5 + 2
  });

  it('multiplies nutrition by quantity', () => {
    const items: CartItemForScore[] = [
      { productId: 'p1', quantity: 3 }
    ];
    
    const productsMap = new Map<string, any>();
    productsMap.set('p1', {
      calories: 100,
      protein: 5,
    });
    
    const result = calculateHealthScore(items, productsMap);
    
    expect(result.totalNutrition.calories).toBe(300); // 100 * 3
    expect(result.totalNutrition.protein).toBe(15); // 5 * 3
  });

  it('aggregates nutrition from multiple items', () => {
    const items: CartItemForScore[] = [
      { productId: 'p1', quantity: 1 },
      { productId: 'p2', quantity: 2 }
    ];
    
    const productsMap = new Map<string, any>();
    productsMap.set('p1', { calories: 100, protein: 5 });
    productsMap.set('p2', { calories: 150, protein: 8 });
    
    const result = calculateHealthScore(items, productsMap);
    
    // p1: 100 * 1 = 100, p2: 150 * 2 = 300
    expect(result.totalNutrition.calories).toBe(400);
    // p1: 5 * 1 = 5, p2: 8 * 2 = 16
    expect(result.totalNutrition.protein).toBe(21);
  });
});

describe('Health Score Levels', () => {
  it('returns correct level for score ranges', () => {
    // Very Poor: 0-20
    expect(calculateHealthScoreFromNutrition({ sugar: 100, satFat: 20, calories: 600, protein: 0 }))
      .toBeLessThanOrEqual(20);
    
    // Excellent: 81-100
    expect(calculateHealthScoreFromNutrition({ sugar: 0, satFat: 0, calories: 100, protein: 15 }))
      .toBeGreaterThanOrEqual(80);
  });

  it('result includes valid level string', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 0, maxLength: 3 }),
        (items) => {
          const productsMap = new Map<string, any>();
          items.forEach(item => {
            productsMap.set(item.productId, { calories: 200, protein: 5, sugar: 15 });
          });
          
          const result = calculateHealthScore(items, productsMap);
          expect(['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']).toContain(result.level);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('result includes valid color hex', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 0, maxLength: 3 }),
        (items) => {
          const productsMap = new Map<string, any>();
          items.forEach(item => {
            productsMap.set(item.productId, { calories: 200, protein: 5, sugar: 15 });
          });
          
          const result = calculateHealthScore(items, productsMap);
          expect(result.color).toMatch(/^#[0-9a-f]{6}$/i);
        }
      ),
      { numRuns: 100 }
    );
  });
});
