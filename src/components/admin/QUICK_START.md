# ⚡ Quick Start Guide - Admin Dashboard

> دليل سريع للبدء مع لوحة التحكم الإدارية

---

## 🎯 الملفات الرئيسية

```
src/components/admin/
├── AdminApp.tsx          ← المكون الرئيسي (ابدأ من هنا)
├── LoginPage.tsx         ← صفحة تسجيل الدخول
├── Header.tsx            ← الرأس والتحكم
├── Sidebar.tsx           ← الملاحة الجانبية
├── DashboardPage.tsx     ← لوحة التحكم
├── OrdersPage.tsx        ← إدارة الطلبات
├── ProductsPage.tsx      ← إدارة المنتجات
├── CouponsPage.tsx       ← إدارة الكوبونات
├── AnalyticsPage.tsx     ← التحليلات
└── SettingsPage.tsx      ← الإعدادات
```

---

## 🔑 المفاهيم الأساسية

### 1. State Management

```typescript
// في AdminApp.tsx
const [activeTab, setActiveTab] = useState('orders');
const [orders, setOrders] = useState<Order[]>([]);
const [coupons, setCoupons] = useState<Coupon[]>([]);
```

### 2. Real-time Updates

```typescript
// الـ polling الذكي
useEffect(() => {
  const polling = new OrdersPolling((newOrders) => {
    setOrders(newOrders);
  });
  polling.start();
  return () => polling.stop();
}, []);
```

### 3. API Calls

```typescript
// استدعاء الـ API
const response = await updateOrderStatusWithTracking(
  orderId,
  'قيد التحضير',
  { updated_by: 'admin:123' }
);
```

---

## 📝 المهام الشائعة

### إضافة صفحة جديدة

```typescript
// 1. أنشئ الملف: src/components/admin/NewPage.tsx
const NewPage = () => {
  return <div>محتوى جديد</div>;
};
export default NewPage;

// 2. أضفه إلى AdminApp.tsx
import NewPage from './NewPage';

// 3. أضف الشرط في المحتوى الرئيسي
{activeTab === 'new' && <NewPage />}

// 4. أضفه إلى Sidebar
{ id: 'new', icon: Icon, label: 'صفحة جديدة' }
```

### استدعاء API جديد

```typescript
// 1. أضفه في src/lib/adminApi.ts
export async function getNewData() {
  return apiRequest('/admin/new-endpoint');
}

// 2. استخدمه في المكون
const data = await getNewData();
```

### تحديث البيانات

```typescript
// 1. استدعِ الـ API
const response = await updateOrderStatus(orderId, newStatus);

// 2. حدّث الـ state
if (response.success) {
  setOrders(orders.map(o => 
    o.id === orderId ? { ...o, status: newStatus } : o
  ));
}
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الطلبات لا تتحدث

**الحل**:
```typescript
// تحقق من الـ polling
console.log('Polling started:', ordersPolling);

// تحقق من الـ API
const orders = await getOrders();
console.log('Orders:', orders);
```

### المشكلة: 401 Unauthorized

**الحل**:
```typescript
// تحقق من التوكن
const token = getAdminToken();
console.log('Token:', token);

// أعد تسجيل الدخول
clearAdminToken();
window.location.href = '/admin/login';
```

### المشكلة: البيانات لا تظهر

**الحل**:
```typescript
// تحقق من الـ state
console.log('State:', { orders, coupons, stats });

// تحقق من الـ props
console.log('Props:', props);

// تحقق من الـ rendering
{orders.length === 0 && <p>لا توجد بيانات</p>}
```

---

## 📊 هيكل البيانات

### Order

```typescript
{
  id: 'ORD-001',
  customer_name: 'أحمد',
  customer_phone: '01234567890',
  status: 'جديد',
  total: 150,
  items: [{ product_id: 'p1', quantity: 2, price: 75 }],
  timestamp: 1700000000000,
  progress: 25,
  elapsedMinutes: 5,
  last_updated_by: 'admin:123'
}
```

### Coupon

```typescript
{
  code: 'SUMMER50',
  name: 'خصم الصيف',
  discount_percent: 50,
  max_uses: 100,
  current_uses: 25,
  active: 1,
  valid_days: 7,
  min_order: 50
}
```

### Product

```typescript
{
  id: 'vanilla-ice-cream',
  name: 'آيس كريم فانيليا',
  price: 15,
  category: 'آيس كريم',
  available: 1,
  calories: 200,
  protein: 3,
  image: 'https://...'
}
```

---

## 🎨 الألوان والأيقونات

### حالات الطلبات

```typescript
const statusColors = {
  'جديد': 'blue',
  'قيد التحضير': 'yellow',
  'جاهز': 'green',
  'تم التوصيل': 'purple',
  'cancelled': 'red'
};

const statusIcons = {
  'جديد': '📦',
  'قيد التحضير': '👨‍🍳',
  'جاهز': '✅',
  'تم التوصيل': '🚚',
  'cancelled': '❌'
};
```

### الأيقونات المستخدمة

```typescript
import {
  Package,      // الطلبات
  Tag,          // الكوبونات
  ShoppingBag,  // المنتجات
  TrendingUp,   // الإحصائيات
  Settings,     // الإعدادات
  Bell,         // الإشعارات
  LogOut        // تسجيل الخروج
} from 'lucide-react';
```

---

## 🔐 المصادقة

### تسجيل الدخول

```typescript
// في LoginPage.tsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (password === 'admin123') {
    const token = 'softcream_admin_2025_secure_token_change_me';
    setAdminToken(token);
    onLogin(token);
  }
};
```

### التحقق من المصادقة

```typescript
// في AdminApp.tsx
useEffect(() => {
  const token = getAdminToken();
  if (token) {
    setIsAuthenticated(true);
  }
}, []);

if (!isAuthenticated) {
  return <LoginPage onLogin={handleLogin} />;
}
```

### تسجيل الخروج

```typescript
const handleLogout = () => {
  clearAdminToken();
  setIsAuthenticated(false);
  window.location.href = '/';
};
```

---

## 📱 الـ Responsive Design

```typescript
// استخدم Tailwind breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* المحتوى */}
</div>

// الأحجام
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

---

## 🚀 نصائح الأداء

### 1. استخدم React.memo

```typescript
const OrderCard = React.memo(({ order }) => {
  return <div>{order.id}</div>;
});
```

### 2. استخدم useMemo

```typescript
const filteredOrders = useMemo(() => {
  return orders.filter(o => o.status === filter);
}, [orders, filter]);
```

### 3. استخدم useCallback

```typescript
const handleUpdate = useCallback((id, status) => {
  updateOrderStatus(id, status);
}, []);
```

### 4. استخدم Batch Requests

```typescript
const data = await getBatchData({
  dataTypes: ['orders', 'stats', 'coupons']
});
```

---

## 📚 الموارد الإضافية

- **README_AR.md**: دليل شامل بالعربية
- **README_EN.md**: دليل شامل بالإنجليزية
- **src/lib/adminApi.ts**: جميع استدعاءات الـ API
- **src/lib/adminRealtime.ts**: نظام التحديثات المباشرة
- **src/lib/orderTracking.ts**: نظام تتبع الطلبات

---

## 💬 الأسئلة الشائعة

**س: كيف أضيف حقل جديد للمنتج؟**
ج: عدّل `Product` interface في `adminApi.ts` و `ProductsPage.tsx`

**س: كيف أغيّر فترة الـ polling؟**
ج: عدّل `baseInterval` و `fastInterval` في `OrdersPolling`

**س: كيف أضيف إشعار؟**
ج: استخدم `toast.success()` أو `alert()`

**س: كيف أختبر الـ API؟**
ج: استخدم Postman أو curl

---

## 🎓 الخطوات التالية

1. اقرأ `README_AR.md` للفهم الشامل
2. استكشف الملفات الموجودة
3. جرّب إضافة صفحة جديدة
4. جرّب استدعاء API جديد
5. أضف اختبارات

---

**آخر تحديث**: نوفمبر 2025
**الإصدار**: 1.0
