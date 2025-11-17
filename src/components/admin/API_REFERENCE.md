# 📡 API Reference - Admin Dashboard

> مرجع شامل لجميع استدعاءات الـ API المستخدمة في لوحة التحكم

---

## 🔗 Base URL

```
https://softcream-api.mahmoud-zahran20025.workers.dev?path=/endpoint
```

---

## 🔐 Authentication

### Headers

```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}'
}
```

### Token Management

```typescript
// Get token
const token = getAdminToken();

// Set token
setAdminToken(token);

// Clear token
clearAdminToken();
```

---

## 📦 Orders API

### Get All Orders

```typescript
// Function
getOrders(params?: {
  status?: string;
  date?: string;
  branchId?: string;
  limit?: number;
  offset?: number;
})

// Example
const response = await getOrders({
  status: 'جديد',
  limit: 50,
  offset: 0
});

// Response
{
  success: true,
  data: {
    orders: Order[],
    total: number,
    stats: {
      new: number,
      preparing: number,
      ready: number,
      delivered: number,
      cancelled: number
    }
  }
}
```

### Get Order by ID

```typescript
// Function
getOrderById(orderId: string)

// Example
const response = await getOrderById('ORD-001');

// Response
{
  data: Order
}
```

### Get Orders with Tracking

```typescript
// Function
getOrdersWithTracking(params?: {
  status?: string;
  date?: string;
  branchId?: string;
  limit?: number;
  offset?: number;
  includeTracking?: boolean;
})

// Example
const response = await getOrdersWithTracking({
  includeTracking: true,
  limit: 50
});

// Response
{
  success: true,
  data: {
    orders: Order[],
    total: number,
    stats: {...}
  }
}
```

### Update Order Status

```typescript
// Function
updateOrderStatus(orderId: string, newStatus: string)

// Example
const response = await updateOrderStatus('ORD-001', 'قيد التحضير');

// Response
{
  success: boolean,
  message: string
}
```

### Update Order Status with Tracking

```typescript
// Function
updateOrderStatusWithTracking(
  orderId: string,
  status: string,
  options?: {
    progress_percentage?: number;
    updated_by?: string;
  }
)

// Example
const response = await updateOrderStatusWithTracking(
  'ORD-001',
  'قيد التحضير',
  { updated_by: 'admin:123' }
);

// Response
{
  success: boolean,
  message: string,
  data?: {
    orderId: string,
    status: string,
    progress_percentage: number | null,
    last_updated_by: string
  }
}
```

### Get Order Tracking

```typescript
// Function
getOrderTracking(orderId: string)

// Example
const response = await getOrderTracking('ORD-001');

// Response
{
  success: boolean,
  data?: {
    orderId: string,
    status: string,
    progress_percentage: number | null,
    elapsed_minutes: number | null,
    is_auto_progressed: boolean,
    next_status: string | null,
    estimated_completion_time: string | null,
    last_updated_by: string,
    processed_date: string | null,
    processed_by: string | null,
    timeline?: Array<{
      status: string,
      timestamp: string,
      updated_by: string
    }>
  }
}
```

### Override Order Status

```typescript
// Function
overrideOrderStatus(
  orderId: string,
  request: {
    newStatus: string,
    reason?: string,
    estimatedTime?: number
  }
)

// Example
const response = await overrideOrderStatus('ORD-001', {
  newStatus: 'جاهز',
  reason: 'تم التحضير مبكراً'
});

// Response
{
  success: boolean,
  data: {
    orderId: string,
    oldStatus: string,
    newStatus: string,
    tracking: {
      progress: number,
      isAutoProgressed: boolean,
      processedBy: string,
      processedAt: string
    }
  }
}
```

### Batch Update Tracking

```typescript
// Function
batchUpdateTracking()

// Example
const response = await batchUpdateTracking();

// Response
{
  success: boolean,
  data: {
    updatedOrders: number,
    updates: Array<{
      orderId: string,
      oldStatus: string,
      newStatus: string,
      progress: number
    }>
  }
}
```

---

## 🎫 Coupons API

### Get All Coupons

```typescript
// Function
getCoupons()

// Example
const response = await getCoupons();

// Response
{
  data: Coupon[]
}
```

### Create Coupon

```typescript
// Function
createCoupon(data: {
  code: string,
  name: string,
  discountPercent: number,
  discountPercentChild?: number,
  discountPercentSecond?: number,
  validDays: number,
  minOrder?: number,
  maxUses?: number,
  messageAr?: string,
  messageEn?: string
})

// Example
const response = await createCoupon({
  code: 'SUMMER50',
  name: 'خصم الصيف',
  discountPercent: 50,
  validDays: 7,
  maxUses: 100
});

// Response
{
  success: boolean,
  data: Coupon
}
```

### Toggle Coupon

```typescript
// Function
toggleCoupon(code: string)

// Example
const response = await toggleCoupon('SUMMER50');

// Response
{
  success: boolean,
  coupon: Coupon
}
```

### Get Coupon Stats

```typescript
// Function
getCouponStats(code: string)

// Example
const response = await getCouponStats('SUMMER50');

// Response
{
  code: string,
  totalUses: number,
  totalDiscount: number,
  usageHistory: any[]
}
```

### Update Coupon

```typescript
// Function
updateCoupon(code: string, data: Partial<CreateCouponData>)

// Example
const response = await updateCoupon('SUMMER50', {
  discountPercent: 60,
  maxUses: 150
});

// Response
{
  success: boolean,
  data: Coupon
}
```

### Delete Coupon

```typescript
// Function
deleteCoupon(code: string)

// Example
const response = await deleteCoupon('SUMMER50');

// Response
{
  success: boolean,
  message: string
}
```

---

## 🛍️ Products API

### Get All Products

```typescript
// Function
getProducts()

// Example
const response = await getProducts();

// Response
{
  data: Product[]
}
```

### Create Product

```typescript
// Function
createProduct(data: Partial<Product>)

// Example
const response = await createProduct({
  id: 'vanilla-ice-cream',
  name: 'آيس كريم فانيليا',
  price: 15,
  category: 'آيس كريم',
  calories: 200,
  protein: 3
});

// Response
{
  success: boolean,
  message: string
}
```

### Update Product

```typescript
// Function
updateProduct(productId: string, data: Partial<Product>)

// Example
const response = await updateProduct('vanilla-ice-cream', {
  price: 18,
  available: 1
});

// Response
{
  success: boolean,
  message: string
}
```

### Delete Product

```typescript
// Function
deleteProduct(productId: string)

// Example
const response = await deleteProduct('vanilla-ice-cream');

// Response
{
  success: boolean,
  message: string
}
```

### Update Product Availability

```typescript
// Function
updateProductAvailability(productId: string, available: boolean)

// Example
const response = await updateProductAvailability('vanilla-ice-cream', true);

// Response
{
  success: boolean
}
```

---

## 📊 Analytics API

### Get Today's Stats

```typescript
// Function
getTodayStats()

// Example
const response = await getTodayStats();

// Response
{
  totalOrders: number,
  totalRevenue: number,
  averageOrderValue: number,
  activeOrders: number
}
```

### Get Dashboard Analytics

```typescript
// Function
getDashboardAnalytics()

// Example
const response = await getDashboardAnalytics();

// Response
{
  today: {
    orders: number,
    revenue: number,
    growth: number
  },
  week: {
    orders: number,
    revenue: number,
    growth: number
  },
  month: {
    orders: number,
    revenue: number,
    growth: number
  },
  topProducts: Array<{
    id: string,
    name: string,
    sales: number,
    revenue: number
  }>,
  recentOrders: Order[]
}
```

### Get Sales by Period

```typescript
// Function
getSalesByPeriod(period: 'day' | 'week' | 'month')

// Example
const response = await getSalesByPeriod('week');

// Response
{
  labels: string[],
  data: number[]
}
```

### Get Tracking Statistics

```typescript
// Function
getTrackingStatistics()

// Example
const response = await getTrackingStatistics();

// Response
{
  success: boolean,
  data: {
    orderStats: {
      total_orders: number,
      confirmed: number,
      preparing: number,
      ready: number,
      outfordelivery: number,
      delivered: number,
      cancelled: number
    },
    trackingMetrics: {
      total_active_orders: number,
      avg_waiting_time: number,
      delayed_orders: number
    },
    timestamp: string
  }
}
```

---

## 🏢 Branches API

### Get All Branches

```typescript
// Function
getBranches()

// Example
const response = await getBranches();

// Response
{
  data: Branch[]
}
```

---

## 📦 Batch API

### Get Batch Data

```typescript
// Function
getBatchData(request: {
  dataTypes: ('orders' | 'stats' | 'coupons' | 'analytics')[],
  filters?: {
    orders?: {
      status?: string,
      date?: string,
      branchId?: string,
      limit?: number,
      offset?: number
    }
  }
})

// Example
const response = await getBatchData({
  dataTypes: ['orders', 'stats', 'coupons'],
  filters: {
    orders: {
      status: 'جديد',
      limit: 50
    }
  }
});

// Response
{
  orders?: Order[],
  stats?: {...},
  coupons?: Coupon[],
  analytics?: {...},
  timestamp: number
}
```

---

## 🔄 Real-time Updates

### Orders Polling

```typescript
// Create polling instance
const ordersPolling = new OrdersPolling((newOrders) => {
  console.log('Orders updated:', newOrders);
});

// Start polling
ordersPolling.start(3000); // Every 3 seconds

// Stop polling
ordersPolling.stop();
```

### Admin Realtime Manager

```typescript
// Get instance
const realtime = adminRealtime();

// Listen for updates
realtime.on('orders', (orders, hasChanged) => {
  console.log('Orders:', orders, 'Changed:', hasChanged);
});

realtime.on('stats', (stats, hasChanged) => {
  console.log('Stats:', stats);
});

realtime.on('coupons', (coupons, hasChanged) => {
  console.log('Coupons:', coupons);
});

// Start polling
realtime.startAll();

// Stop polling
realtime.stopAll();

// Update settings
realtime.updateSettings({
  autoRefresh: true,
  refreshInterval: 3,
  smartPolling: true,
  batchMode: true
});
```

---

## 🛡️ Error Handling

### Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Re-login |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Check resource ID |
| 500 | Server Error | Contact support |

### Error Response Format

```typescript
{
  success: false,
  error: 'Error message',
  code: 'ERROR_CODE'
}
```

### Error Handling Example

```typescript
try {
  const response = await updateOrderStatus(orderId, status);
  
  if (!response.success) {
    console.error('Error:', response.error);
    alert('❌ ' + response.error);
  } else {
    alert('✅ Success');
  }
} catch (error) {
  console.error('Network error:', error);
  alert('❌ Network error');
}
```

---

## 📝 Data Types

### Order

```typescript
interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: string;
  delivery_method: 'pickup' | 'delivery';
  coupon_code?: string;
  branch_id: string;
  branch_name: string;
  timestamp: number;
  eta_minutes: number;
  progress?: number;
  elapsedMinutes?: number;
  isAutoProgressed?: boolean;
  nextStatus?: string;
  estimatedCompletionTime?: string;
  last_updated_by?: string;
  processed_date?: string;
  processed_by?: string;
}
```

### Coupon

```typescript
interface Coupon {
  code: string;
  name: string;
  discount_percent: number;
  discount_percent_child?: number;
  discount_percent_second?: number;
  valid_from: number;
  valid_to: number;
  valid_days?: number;
  min_order: number;
  max_uses: number;
  current_uses: number;
  active: number;
  message_ar?: string;
  message_en?: string;
}
```

### Product

```typescript
interface Product {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  categoryEn?: string;
  price: number;
  description?: string;
  descriptionEn?: string;
  image?: string;
  badge?: string;
  available: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sugar?: number;
  fiber?: number;
  energy_type?: 'mental' | 'physical' | 'balanced' | 'none';
  energy_score?: number;
  tags?: string;
  ingredients?: string;
  nutrition_facts?: string;
  allergens?: string;
}
```

### Branch

```typescript
interface Branch {
  id: string;
  name: string;
  name_en: string;
  address: string;
  phone: string;
  location_lat: number;
  location_lng: number;
  active: number;
}
```

---

## 🔗 Related Files

- `src/lib/adminApi.ts` - API implementation
- `src/lib/adminRealtime.ts` - Real-time updates
- `src/lib/orderTracking.ts` - Order tracking
- `src/components/admin/AdminApp.tsx` - Main component

---

**Last Updated**: November 2025
**Version**: 1.0
