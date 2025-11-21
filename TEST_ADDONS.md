# 🧪 Add-ons System - Testing Guide

## Quick Test Steps

### 1. Start Development Server

```bash
cd soft-cream-nextjs
npm run dev
```

### 2. Test Product Modal with Addons

**Steps:**
1. Open the app in browser
2. Click on any product (preferably "فانيليا كلاسيك" or "شوكولاتة داكنة")
3. Wait for addons to load
4. Verify you see "أضف إضافات مميزة" section

**Expected:**
- Grid of addon cards (2 columns)
- Each addon shows: Arabic name, English name, price
- Clicking addon toggles selection (purple border + checkmark)
- Price updates in real-time

### 3. Test Addon Selection

**Steps:**
1. Select "مكسرات" (Nuts) - should add +20 ج.م
2. Select "لوتس" (Lotus) - should add +20 ج.م
3. Verify total price = Base price + 40 ج.م
4. Deselect "مكسرات" - should subtract 20 ج.م

**Expected:**
- Visual feedback on selection
- Price breakdown shows: "السعر الأساسي: X ج.م + إضافات: Y ج.م"
- Selected addons summary appears below grid

### 4. Test Cart with Addons

**Steps:**
1. Add product with addons (e.g., Vanilla + Nuts)
2. Close modal
3. Add same product with different addons (e.g., Vanilla + Lotus)
4. Open cart

**Expected:**
- Two separate items in cart
- Each shows different addon configuration
- Prices calculated correctly
- Can adjust quantity independently

### 5. Test Cart Item Uniqueness

**Steps:**
1. Add: Vanilla + Nuts (quantity 1)
2. Add: Vanilla + Nuts (quantity 1) again
3. Open cart

**Expected:**
- Single cart item with quantity 2
- Not two separate items

**Then:**
1. Add: Vanilla + Lotus (quantity 1)
2. Open cart

**Expected:**
- Two separate items:
  - Vanilla + Nuts (quantity 2)
  - Vanilla + Lotus (quantity 1)

### 6. Test Checkout Flow

**Steps:**
1. Add products with addons to cart
2. Proceed to checkout
3. Fill in customer details
4. Submit order

**Expected:**
- Order submits successfully
- Backend calculates prices (check console)
- Order confirmation shows addons
- Telegram notification includes addons (if configured)

---

## 🔍 What to Check

### Visual Elements
- [ ] Addon cards display correctly
- [ ] Selection state is clear (purple border + checkmark)
- [ ] Price updates smoothly
- [ ] Selected addons summary shows
- [ ] Mobile responsive (test on small screen)

### Functionality
- [ ] Can select/deselect addons
- [ ] Multiple addons can be selected
- [ ] Price calculation is correct
- [ ] Cart handles addon variations
- [ ] Quantity updates work
- [ ] Remove from cart works

### Edge Cases
- [ ] Product with no addons (should not show section)
- [ ] Product with many addons (should scroll/wrap)
- [ ] Selecting all addons
- [ ] Deselecting all addons
- [ ] Adding to cart without addons

### Performance
- [ ] Addons load quickly
- [ ] No lag when selecting addons
- [ ] Cart updates smoothly
- [ ] Modal opens/closes smoothly

---

## 🐛 Common Issues & Solutions

### Issue: Addons not showing
**Solution:** 
1. Check if backend migrations ran successfully
2. Verify API URL is correct
3. Check browser console for errors
4. Ensure product has `allowed_addons` configured

### Issue: Price not updating
**Solution:**
1. Check browser console for errors
2. Verify addon prices in backend
3. Clear browser cache
4. Restart dev server

### Issue: Cart not working correctly
**Solution:**
1. Clear sessionStorage: `localStorage.clear()`
2. Refresh page
3. Check CartProvider implementation

### Issue: Backend errors
**Solution:**
1. Verify backend is running
2. Check API URL in `.env.local`
3. Run backend migrations
4. Check backend console logs

---

## 📊 Test Data

### Products with Addons (After Migration)

**Classic Products:**
- فانيليا كلاسيك (ID: 1)
- شوكولاتة داكنة (ID: 2)
- شوكو بندق (ID: 3)

**Allowed Addons:** All 7 addons

**Special Products:**
- كوكيز آند كريم (ID: 12)
- كراميل لوتس (ID: 13)

**Allowed Addons:** Most addons (6)

### Standard Addons

| ID | Name (AR) | Name (EN) | Price |
|----|-----------|-----------|-------|
| nuts | مكسرات | Nuts | 20 EGP |
| caramel | كراميل | Caramel | 20 EGP |
| nutella | نوتيلا | Nutella | 20 EGP |
| pistachio | فستق | Pistachio | 25 EGP |
| lotus | لوتس | Lotus | 20 EGP |
| kinder | كيندر | Kinder | 20 EGP |
| extra-scoop | سكوب إضافي | Extra Ice Cream | 20 EGP |

---

## 🧪 Manual Test Scenarios

### Scenario 1: Simple Order
```
1. Select: Vanilla Classic
2. Add addons: Nuts
3. Quantity: 1
4. Add to cart
5. Checkout

Expected Total: 25 + 20 = 45 ج.م
```

### Scenario 2: Multiple Addons
```
1. Select: Chocolate
2. Add addons: Nuts + Lotus
3. Quantity: 2
4. Add to cart
5. Checkout

Expected Total: (30 + 20 + 20) × 2 = 140 ج.م
```

### Scenario 3: Mixed Cart
```
1. Add: Vanilla + Nuts (qty 1)
2. Add: Vanilla + Lotus (qty 1)
3. Add: Chocolate (no addons, qty 1)
4. Checkout

Expected Total:
- Vanilla + Nuts: 45
- Vanilla + Lotus: 45
- Chocolate: 30
Total: 120 ج.م
```

### Scenario 4: Same Product, Different Addons
```
1. Add: Vanilla + Nuts (qty 1)
2. Add: Vanilla + Nuts (qty 1) again
3. Check cart

Expected: Single item with quantity 2

4. Add: Vanilla + Lotus (qty 1)
5. Check cart

Expected: Two items:
- Vanilla + Nuts (qty 2)
- Vanilla + Lotus (qty 1)
```

---

## 📱 Mobile Testing

### Test on Mobile Devices
1. Open on phone/tablet
2. Test addon selection (touch)
3. Verify grid layout (2 columns)
4. Check price display
5. Test cart functionality
6. Complete checkout

### Responsive Breakpoints
- Mobile: < 768px (2 columns)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (2 columns)

---

## ✅ Success Criteria

### Must Pass
- [ ] Addons display correctly
- [ ] Selection works smoothly
- [ ] Price calculation is accurate
- [ ] Cart handles variations correctly
- [ ] Checkout submits successfully
- [ ] Backend validates and prices correctly

### Nice to Have
- [ ] Smooth animations
- [ ] Fast loading
- [ ] Clear visual feedback
- [ ] Mobile-friendly
- [ ] Accessible (keyboard navigation)

---

## 🚀 Next Steps After Testing

1. **If all tests pass:**
   - Deploy to production
   - Monitor for errors
   - Collect user feedback

2. **If issues found:**
   - Document the issue
   - Check console logs
   - Review implementation
   - Fix and retest

3. **Performance optimization:**
   - Check loading times
   - Optimize images
   - Minimize re-renders
   - Cache addon data

---

**Testing Time:** 15-20 minutes  
**Difficulty:** Easy  
**Prerequisites:** Backend migrations completed
