# 🔌 API Connection Guide - Fixing 404 Errors

## ✅ Current Status

Your frontend is **already correctly configured** to fetch products from the real API! The structure is perfect:

1. ✅ `page.tsx` - Server-side fetches products from API
2. ✅ `PageContent.tsx` - Receives products as props
3. ✅ `ProductsProvider` - Manages products state
4. ✅ `ProductsGrid` - Displays products from provider
5. ✅ No static/mock product data found

## 🚨 The Real Issue

The 404 errors are likely caused by:
1. **Backend not seeded** - Database doesn't have products yet
2. **API URL misconfigured** - Frontend pointing to wrong endpoint
3. **Backend not running** - API server is down

---

## 🔍 Diagnosis Steps

### Step 1: Check API URL

**File:** `.env.local`

```bash
# Should be:
NEXT_PUBLIC_API_URL=https://softcream-api.mahmoud-zahran20025.workers.dev

# Or for local development:
# NEXT_PUBLIC_API_URL=http://localhost:8787
```

**Verify:**
```bash
# Check current API URL
cat .env.local | grep NEXT_PUBLIC_API_URL
```

### Step 2: Test Backend API Directly

```powershell
# Test products endpoint
Invoke-RestMethod -Uri "https://softcream-api.mahmoud-zahran20025.workers.dev/products"

# Should return array of products with IDs: '1', '2', '3', etc.
```

**Expected Response:**
```json
[
  {
    "id": "1",
    "name": "فانيليا كلاسيك",
    "price": 25,
    "category": "كلاسيك",
    ...
  },
  {
    "id": "2",
    "name": "شوكولاتة داكنة",
    "price": 30,
    ...
  }
]
```

### Step 3: Check Backend Database

The backend needs to have products seeded. Run these commands:

```powershell
# Navigate to backend
cd ../softcream-api

# Check if products exist
wrangler d1 execute DB --command="SELECT COUNT(*) as count FROM products"

# Should show: count = 23 (or more)
```

**If count is 0:**
```powershell
# Database is empty - need to seed
# Option 1: Start dev server (auto-seeds)
npm run dev

# Option 2: Run migrations manually
# See: softcream-api/ابدأ_هنا.md
```

---

## 🔧 Solutions

### Solution 1: Seed Backend Database

**If backend database is empty:**

1. **Navigate to backend:**
   ```bash
   cd ../softcream-api
   ```

2. **Run Cloudflare Dashboard commands:**
   - Open: https://dash.cloudflare.com
   - Go to: Workers & Pages > D1 > soft_cream-orders-dev > Console
   - Run the SQL from: `ALL_COMMANDS.sql`

3. **Or start dev server (auto-seeds):**
   ```bash
   npm run dev
   ```

4. **Verify products exist:**
   ```powershell
   Invoke-RestMethod -Uri "https://softcream-api.mahmoud-zahran20025.workers.dev/products"
   ```

### Solution 2: Fix API URL

**If API URL is wrong:**

1. **Create/Update `.env.local`:**
   ```bash
   # In soft-cream-nextjs directory
   echo "NEXT_PUBLIC_API_URL=https://softcream-api.mahmoud-zahran20025.workers.dev" > .env.local
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Verify in browser console:**
   - Open DevTools (F12)
   - Check Console for: "🌐 API URL configured: ..."
   - Should show your production URL

### Solution 3: Handle API Errors Gracefully

The code already handles errors, but let's verify:

**File:** `src/app/page.tsx`

```typescript
async function ProductsData() {
  try {
    const products = await Promise.race([
      getProducts(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ]) as any[]

    return <PageContent initialProducts={products || []} />
  } catch (error) {
    console.error('Failed to fetch products:', error)
    // ✅ Returns empty array instead of crashing
    return <PageContent initialProducts={[]} />
  }
}
```

---

## 🧪 Testing the Fix

### Test 1: Check API Response

```powershell
# Test products endpoint
$response = Invoke-RestMethod -Uri "https://softcream-api.mahmoud-zahran20025.workers.dev/products"

# Check product IDs
$response | Select-Object id, name | Format-Table

# Should show:
# id  name
# --  ----
# 1   فانيليا كلاسيك
# 2   شوكولاتة داكنة
# 3   شوكو بندق
# ...
```

### Test 2: Check Frontend

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   - Go to: http://localhost:3000
   - Open DevTools Console (F12)

3. **Check logs:**
   ```
   ✅ Should see: "🌐 API URL configured: ..."
   ✅ Should see: "📡 API Request [GET]: /products"
   ✅ Should see: "✅ Response: [array of products]"
   ```

4. **Check products display:**
   - Products should appear on homepage
   - Click any product
   - Modal should open (no 404 error)

### Test 3: Verify Product IDs

**In browser console:**
```javascript
// Check products in provider
window.__NEXT_DATA__.props.pageProps

// Or check network tab
// Filter by: /products
// Check response IDs
```

---

## 📋 Checklist

### Backend
- [ ] Backend database has products (count > 0)
- [ ] Backend API returns products array
- [ ] Product IDs are strings: '1', '2', '3', etc.
- [ ] API endpoint is accessible

### Frontend
- [ ] `.env.local` has correct API URL
- [ ] Dev server restarted after env change
- [ ] Browser console shows API URL
- [ ] Products fetch successfully
- [ ] No 404 errors when clicking products

---

## 🐛 Common Issues

### Issue 1: "Failed to fetch products"

**Cause:** API URL is wrong or backend is down

**Solution:**
1. Check `.env.local` file
2. Test API directly: `Invoke-RestMethod -Uri "YOUR_API_URL/products"`
3. Verify backend is deployed

### Issue 2: "لا توجد منتجات متاحة حالياً"

**Cause:** API returns empty array

**Solution:**
1. Check backend database: `SELECT COUNT(*) FROM products`
2. Seed database if empty
3. Check API response in Network tab

### Issue 3: "404 Not Found" when clicking product

**Cause:** Product ID mismatch (frontend has ID '21', backend has '1')

**Solution:**
1. This should NOT happen with current code
2. Verify products are fetched from API (not static data)
3. Check browser console for product IDs
4. Verify backend has correct IDs

### Issue 4: Products show but modal fails

**Cause:** Product expansion fails (addons not loaded)

**Solution:**
1. Check if backend migrations ran
2. Verify addons table exists
3. Check browser console for errors
4. Modal should handle missing addons gracefully

---

## 🎯 Expected Behavior

### Correct Flow

```
1. User visits homepage
   ↓
2. Server fetches products from API
   GET /products
   ↓
3. API returns products with IDs: '1', '2', '3', ...
   ↓
4. Products displayed on homepage
   ↓
5. User clicks product (e.g., ID '1')
   ↓
6. Modal fetches product details
   GET /products/1?expand=addons
   ↓
7. Product details displayed with addons
   ✅ Success!
```

### Incorrect Flow (404 Error)

```
1. User visits homepage
   ↓
2. Server fetches products from API
   GET /products
   ↓
3. API returns empty array (database not seeded)
   ↓
4. No products displayed
   OR
   Static products with IDs '21', '22' displayed
   ↓
5. User clicks product (e.g., ID '21')
   ↓
6. Modal tries to fetch
   GET /products/21
   ↓
7. ❌ 404 Not Found (backend only has IDs '1'-'23')
```

---

## 🚀 Quick Fix Commands

```powershell
# 1. Check backend products
cd ../softcream-api
Invoke-RestMethod -Uri "https://softcream-api.mahmoud-zahran20025.workers.dev/products" | Select-Object id, name

# 2. If empty, seed database
# See: ابدأ_هنا.md

# 3. Verify frontend API URL
cd ../soft-cream-nextjs
cat .env.local

# 4. Restart frontend
npm run dev

# 5. Test in browser
# Open: http://localhost:3000
# Check: Products appear
# Click: Any product
# Verify: Modal opens (no 404)
```

---

## 📞 Need Help?

1. **Check backend status:**
   - `softcream-api/FINAL_STATUS.md`
   - `softcream-api/ابدأ_هنا.md`

2. **Check frontend integration:**
   - `ADDONS_FRONTEND_INTEGRATION.md`
   - `TEST_ADDONS.md`

3. **Test API:**
   - `softcream-api/test-production.ps1`

---

**Status:** Frontend is correctly configured ✅  
**Action Required:** Verify backend has products  
**Expected Time:** 5-10 minutes
