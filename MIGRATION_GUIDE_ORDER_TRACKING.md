# 🔄 Migration Guide: TrackingModal → OrderTracking

## Quick Reference

### Old Structure (Deprecated)
```
src/components/modals/TrackingModal/
└── index.tsx (600+ lines)
```

### New Structure (Use This)
```
src/components/features/OrderTracking/
├── index.tsx
├── useOrderTracking.ts
├── components/
│   ├── StatusTimeline.tsx
│   ├── OrderHeader.tsx
│   └── OrderSummary.tsx
└── views/
    ├── DeliveryView.tsx
    └── PickupView.tsx
```

---

## Step-by-Step Migration

### Step 1: Update Import

**Before:**
```typescript
import TrackingModal from '@/components/modals/TrackingModal'
```

**After:**
```typescript
import OrderTracking from '@/components/features/OrderTracking'
```

---

### Step 2: Update Component Name

**Before:**
```typescript
<TrackingModal
  isOpen={isTrackingOpen}
  onClose={() => setIsTrackingOpen(false)}
  order={selectedOrder}
  onEditOrder={handleEditOrder}
/>
```

**After:**
```typescript
<OrderTracking
  isOpen={isTrackingOpen}
  onClose={() => setIsTrackingOpen(false)}
  order={selectedOrder}
  onEditOrder={handleEditOrder}
/>
```

---

### Step 3: Verify Props (No Changes Needed)

The props interface is **100% compatible**:

```typescript
interface OrderTrackingProps {
  isOpen: boolean
  onClose: () => void
  order?: Order | null
  onEditOrder?: (order: Order) => void
}
```

---

## Files That Need Updating

Search your codebase for these patterns:

### Pattern 1: Import Statement
```bash
# Search for:
from '@/components/modals/TrackingModal'

# Replace with:
from '@/components/features/OrderTracking'
```

### Pattern 2: Component Usage
```bash
# Search for:
<TrackingModal

# Replace with:
<OrderTracking
```

---

## Common Locations

Check these files (if they exist in your project):

1. **Sidebar.tsx** - My Orders section
2. **MyOrdersModal.tsx** - Order list with tracking
3. **OrderSuccessModal.tsx** - After order submission
4. **Home page** - If tracking is embedded
5. **Any custom order management pages**

---

## Example: Full Migration

### Before (Old Code)
```typescript
'use client'

import { useState } from 'react'
import TrackingModal from '@/components/modals/TrackingModal'

export default function MyOrdersPage() {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const handleTrackOrder = (order) => {
    setSelectedOrder(order)
    setIsTrackingOpen(true)
  }

  return (
    <>
      {/* Your orders list */}
      <button onClick={() => handleTrackOrder(order)}>
        Track Order
      </button>

      {/* Old TrackingModal */}
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        order={selectedOrder}
        onEditOrder={handleEditOrder}
      />
    </>
  )
}
```

### After (New Code)
```typescript
'use client'

import { useState } from 'react'
import OrderTracking from '@/components/features/OrderTracking'

export default function MyOrdersPage() {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const handleTrackOrder = (order) => {
    setSelectedOrder(order)
    setIsTrackingOpen(true)
  }

  return (
    <>
      {/* Your orders list */}
      <button onClick={() => handleTrackOrder(order)}>
        Track Order
      </button>

      {/* New OrderTracking */}
      <OrderTracking
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        order={selectedOrder}
        onEditOrder={handleEditOrder}
      />
    </>
  )
}
```

**Changes:**
1. Import path updated
2. Component name updated
3. Everything else stays the same!

---

## Testing Checklist

After migration, test these scenarios:

### Pickup Orders
- [ ] Open tracking modal for pickup order
- [ ] Verify "🏪 استلام من الفرع" label shows
- [ ] Verify big "Navigate to Branch" button appears
- [ ] Click navigation button → Opens Google Maps
- [ ] Verify call and WhatsApp buttons work
- [ ] Verify 4-stage progress timeline shows
- [ ] Verify status messages are pickup-specific

### Delivery Orders
- [ ] Open tracking modal for delivery order
- [ ] Verify "🚚 فرع التوصيل" label shows
- [ ] Verify customer address displays
- [ ] Verify call and WhatsApp buttons work
- [ ] Verify 5-stage progress timeline shows
- [ ] Verify status messages are delivery-specific

### General Features
- [ ] Real-time polling works
- [ ] Manual refresh button works
- [ ] Progress bar animates correctly
- [ ] Stage icons update correctly
- [ ] Edit order button works (within 5 minutes)
- [ ] Close button works
- [ ] Toast notifications show on status change

---

## Rollback Plan (If Needed)

If you encounter issues, you can temporarily rollback:

1. Keep the old `TrackingModal` folder (don't delete yet)
2. Revert import changes
3. Report issues
4. We'll fix and re-migrate

**Note:** The old TrackingModal is still in your codebase at:
```
src/components/modals/TrackingModal/index.tsx
```

You can delete it once migration is confirmed working.

---

## Benefits of Migration

### Immediate Benefits
✅ **Pickup Support** - New specialized UX for pickup orders  
✅ **Better UX** - Context-aware messages and actions  
✅ **Cleaner Code** - 75% reduction in main component size

### Long-term Benefits
✅ **Easier Maintenance** - Modular architecture  
✅ **Easier Testing** - Isolated logic  
✅ **Easier Extension** - Add features without breaking existing code  
✅ **Better Performance** - Optimized re-renders

---

## Need Help?

If you encounter any issues during migration:

1. Check the console for TypeScript errors
2. Verify import paths are correct
3. Ensure Order interface matches
4. Check that props are passed correctly

---

## Summary

**Migration is simple:**
1. Change import path
2. Change component name
3. Test both pickup and delivery orders

**No breaking changes** - Props interface is 100% compatible!

**Estimated migration time:** 5-10 minutes per file

---

**Ready to migrate?** Start with one file, test it, then proceed with the rest! 🚀
